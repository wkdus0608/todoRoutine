import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { loadTodos, saveTodos, loadRoutines, saveRoutines } from '../storage/dataManager';
import { Todo, Routine } from '../types';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { Picker } from '@react-native-picker/picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

interface AddTodoFormProps {
  onTodoAdded: () => void;
  source: 'today' | 'main'; // To distinguish where the form is being used
}

type Mode = 'todo' | 'routine';

const AddTodoForm: React.FC<AddTodoFormProps> = ({ onTodoAdded, source }) => {
  const [mode, setMode] = useState<Mode>('todo');
  const [text, setText] = useState('');
  const [newRoutineName, setNewRoutineName] = useState('');
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [selectedRoutine, setSelectedRoutine] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  useEffect(() => {
    if (source === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      setDueDate(today);
    }
  }, [source]);

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date: Date) => {
    setDueDate(date);
    hideDatePicker();
  };

  const getFormattedDate = (date: Date | undefined) => {
    if (!date) return '기간 없음';
    return date.toLocaleDateString();
  };

  const setPresetDate = (preset: 'today' | 'tomorrow' | 'weekend' | 'week_later' | 'none') => {
    const now = new Date();
    if (preset === 'none') {
      setDueDate(undefined);
      return;
    }
    let newDate = new Date();
    switch (preset) {
      case 'today':
        break;
      case 'tomorrow':
        newDate.setDate(now.getDate() + 1);
        break;
      case 'weekend':
        const day = now.getDay();
        const diff = day === 6 ? 1 : 6 - day;
        newDate.setDate(now.getDate() + diff);
        break;
      case 'week_later':
        newDate.setDate(now.getDate() + 7);
        break;
    }
    setDueDate(newDate);
  };


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
    onTodoAdded();
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
      routineId: selectedRoutine || undefined,
      dueDate: dueDate?.toISOString(),
    };

    const currentTodos = await loadTodos();
    const updatedTodos = [...currentTodos, newTodo];
    await saveTodos(updatedTodos);
    onTodoAdded();
  };

  return (
    <View style={styles.container}>
      {source === 'main' && (
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
      )}

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

          {source === 'main' && (
            <>
              <Text style={styles.label}>Due Date:</Text>
              <View style={styles.datePresets}>
                  <Button title="오늘" onPress={() => setPresetDate('today')} />
                  <Button title="내일" onPress={() => setPresetDate('tomorrow')} />
                  <Button title="주말" onPress={() => setPresetDate('weekend')} />
                  <Button title="일주일 뒤" onPress={() => setPresetDate('week_later')} />
              </View>
              <View style={styles.datePickerContainer}>
                <TouchableOpacity onPress={showDatePicker} style={styles.datePickerButton}>
                  <Text style={styles.datePickerText}>{getFormattedDate(dueDate)}</Text>
                </TouchableOpacity>
                <Button title="기간 없음" onPress={() => setPresetDate('none')} color="red" />
              </View>
              <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                onConfirm={handleConfirm}
                onCancel={hideDatePicker}
              />
            </>
          )}

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
    marginTop: 10,
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
  datePresets: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  datePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  datePickerButton: {
    padding: 10,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
  },
  datePickerText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default AddTodoForm;
