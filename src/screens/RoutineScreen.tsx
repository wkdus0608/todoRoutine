import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, Alert } from 'react-native';
import { loadRoutines, saveRoutines } from '../storage/dataManager';
import { Routine } from '../types';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

const RoutineScreen = () => {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [newRoutineName, setNewRoutineName] = useState('');

  useEffect(() => {
    const fetchRoutines = async () => {
      const loadedRoutines = await loadRoutines();
      setRoutines(loadedRoutines);
    };
    fetchRoutines();
  }, []);

  const handleAddRoutine = async () => {
    if (newRoutineName.trim() === '') {
      Alert.alert('Error', 'Routine name cannot be empty.');
      return;
    }
    if (routines.some(routine => routine.name === newRoutineName.trim())) {
      Alert.alert('Error', 'A routine with this name already exists.');
      return;
    }
    const newRoutine: Routine = {
      id: uuidv4(),
      name: newRoutineName.trim(),
    };
    const updatedRoutines = [...routines, newRoutine];
    setRoutines(updatedRoutines);
    await saveRoutines(updatedRoutines);
    setNewRoutineName('');
  };

  const handleDeleteRoutine = async (id: string) => {
    // TODO: Also handle deleting todos associated with this routine
    const updatedRoutines = routines.filter(cat => cat.id !== id);
    setRoutines(updatedRoutines);
    await saveRoutines(updatedRoutines);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter new routine name"
          value={newRoutineName}
          onChangeText={setNewRoutineName}
        />
        <Button title="Add" onPress={handleAddRoutine} />
      </View>
      <FlatList
        data={routines}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <Text style={styles.itemText}>{item.name}</Text>
            <Button title="Delete" color="red" onPress={() => handleDeleteRoutine(item.id)} />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderColor: 'gray',
    borderWidth: 1,
    marginRight: 10,
    paddingHorizontal: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  itemText: {
    fontSize: 18,
  },
});

export default RoutineScreen;
