import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { loadTodos, saveTodos, loadRoutines, saveRoutines } from '../storage/dataManager';
import { Todo, Routine } from '../types';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { Picker } from '@react-native-picker/picker';

interface AddTodoFormProps {
  onTodoAdded: () => void;
}

type Mode = 'todo' | 'routine';

const AddTodoForm: React.FC<AddTodoFormProps> = ({ onTodoAdded }) => {
  const [mode, setMode] = useState<Mode>('todo');
  const [text, setText] = useState('');
  const [newRoutineName, setNewRoutineName] = useState('');
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [selectedRoutine, setSelectedRoutine] = useState<string | null>(null);

  const handleCreateRoutine = async () => {
    if (newRoutineName.trim() === '') {
      Alert.alert('Error', 'Routine name cannot be empty.');
      return;
    }

    const currentRoutines = await loadRoutines();
    const routineExists = currentRoutines.some(routine => routine.name.toLowerCase() === newRoutineName.trim().toLowerCase());

    if (routineExists) {
      Alert.alert('Error', `Routine with name '${newRoutineName.trim()}' already exists.`);
      return;
    }

    const newRoutine: Routine = {
      id: uuidv4(),
      name: newRoutineName.trim(),
    };
    
    const updatedRoutines = [...currentRoutines, newRoutine];
    await saveRoutines(updatedRoutines);
    setNewRoutineName('');
    Alert.alert('Success', 'Routine created successfully!');
    fetchRoutines(); // Re-fetch routines to update the picker
  };

  const fetchRoutines = async () => {
    const loadedRoutines = await loadRoutines();
    setRoutines(loadedRoutines);
    if (loadedRoutines.length > 0 && !selectedRoutine) {
      setSelectedRoutine(loadedRoutines[0].id);
    }
  };

  useEffect(() => {
    fetchRoutines();
  }, []);

  const handleAddTodo = async () => {
    if (text.trim() === '') {
      Alert.alert('Error', 'Todo text cannot be empty.');
      return;
    }
    if (!selectedRoutine) {
      Alert.alert('Error', 'Please select a routine.');
      return;
    }

    const newTodo: Todo = {
      id: uuidv4(),
      text: text.trim(),
      completed: false,
      routineId: selectedRoutine || undefined, // Make routineId optional
    };

    const currentTodos = await loadTodos();
    const updatedTodos = [...currentTodos, newTodo];
    await saveTodos(updatedTodos);
    onTodoAdded();
  };

  return (
    <View style={styles.container}>
      <View style={styles.modeSelector}>
        <TouchableOpacity
          style={[styles.modeButton, mode === 'todo' && styles.selectedModeButton]}
          onPress={() => setMode('todo')}
        >
          <Text style={[styles.modeButtonText, mode === 'todo' && styles.selectedModeButtonText]}>Create Todo</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeButton, mode === 'routine' && styles.selectedModeButton]}
          onPress={() => setMode('routine')}
        >
          <Text style={[styles.modeButtonText, mode === 'routine' && styles.selectedModeButtonText]}>Create Routine</Text>
        </TouchableOpacity>
      </View>

      {mode === 'todo' ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="Enter new todo..."
            value={text}
            onChangeText={setText}
          />
          <Text style={styles.label}>Routine:</Text>
          <Picker
            selectedValue={selectedRoutine}
            onValueChange={(itemValue) => setSelectedRoutine(itemValue)}
          >
            {routines.map(cat => (
              <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
            ))}
          </Picker>
          <Button title="Add Todo" onPress={handleAddTodo} />
        </>
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="Enter new routine name..."
            value={newRoutineName}
            onChangeText={setNewRoutineName}
          />
          <Button title="Create Routine" onPress={handleCreateRoutine} />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: 'white',
  },
  input: {
    borderColor: 'gray',
    borderWidth: 1,
    padding: 10,
    marginBottom: 20,
    fontSize: 18,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
  },
  modeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#4F8EF7',
    borderRadius: 20,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 18,
  },
  selectedModeButton: {
    backgroundColor: '#4F8EF7',
  },
  modeButtonText: {
    color: '#4F8EF7',
    fontWeight: 'bold',
  },
  selectedModeButtonText: {
    color: 'white',
  },
});

export default AddTodoForm;
