import React, { useState, useCallback } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, Alert, Modal, FlatList } from 'react-native';
import AddTodoForm from '../components/AddTodoForm';
import { useFocusEffect } from '@react-navigation/native';
import { loadTodos, saveTodos, loadRoutines, saveRoutines } from '../storage/dataManager';
import { Todo, Routine } from '../types';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Define a type for the flattened data structure, similar to MainScreen
interface FlatListItem {
  type: 'routine' | 'todo';
  id: string;
  name?: string; // For routines
  item?: Todo; // For todos
  level: number; // For potential indentation
}

// Helper function to flatten todos for the list
const flattenTodos = (todosArray: Todo[], level: number = 0): FlatListItem[] => {
  let flattened: FlatListItem[] = [];
  todosArray.forEach(todo => {
    flattened.push({
      type: 'todo',
      id: todo.id,
      item: todo,
      level: level,
    });
    // Note: TodayScreen doesn't show nested sub-todos for simplicity, but you could add it here.
  });
  return flattened;
};

const TodayScreen = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [collapsedRoutines, setCollapsedRoutines] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchData = async () => {
    const loadedTodos = await loadTodos();
    const loadedRoutines = await loadRoutines();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const filtered = loadedTodos.filter(todo => {
      if (!todo.dueDate) return false;
      const dueDate = new Date(todo.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate.getTime() === today.getTime();
    });

    setTodos(filtered);
    setRoutines(loadedRoutines);
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const handleTodoAdded = () => {
    fetchData();
    setModalVisible(false);
  };

  const handleDeleteTodo = async (idToDelete: string) => {
    // This logic needs to update both the local state and the persisted data
    const updatedTodayTodos = todos.filter(todo => todo.id !== idToDelete);
    setTodos(updatedTodayTodos);
    
    const allTodos = await loadTodos();
    const allUpdatedTodos = allTodos.filter(todo => todo.id !== idToDelete);
    await saveTodos(allUpdatedTodos);
  };

  const handleToggleComplete = async (idToToggle: string) => {
    const updatedTodayTodos = todos.map(todo =>
      todo.id === idToToggle ? { ...todo, completed: !todo.completed } : todo
    );
    setTodos(updatedTodayTodos);

    const allTodos = await loadTodos();
    const allUpdatedTodos = allTodos.map(todo =>
        todo.id === idToToggle ? { ...todo, completed: !todo.completed } : todo
      );
    await saveTodos(allUpdatedTodos);
  };

  const handleToggleCollapse = (routineId: string) => {
    setCollapsedRoutines(prev =>
      prev.includes(routineId)
        ? prev.filter(id => id !== routineId)
        : [...prev, routineId]
    );
  };

  // Create the flat data structure for the list
  const flatData: FlatListItem[] = [];
  routines.forEach(routine => {
    const routineTodos = todos.filter(todo => todo.routineId === routine.id && !todo.parentId);
    if (routineTodos.length > 0) {
      flatData.push({ type: 'routine', id: routine.id, name: routine.name, level: 0 });
      if (!collapsedRoutines.includes(routine.id)) {
        flatData.push(...flattenTodos(routineTodos, 0));
      }
    }
  });

  const uncategorizedTodos = todos.filter(
    todo => !todo.routineId || !routines.find(r => r.id === todo.routineId)
  );
  if (uncategorizedTodos.length > 0) {
    flatData.push({ type: 'routine', id: 'uncategorized', name: 'Uncategorized', level: 0 });
    if (!collapsedRoutines.includes('uncategorized')) {
        flatData.push(...flattenTodos(uncategorizedTodos, 0));
    }
  }

  const renderItem = ({ item }: { item: FlatListItem }) => {
    if (item.type === 'routine') {
      return (
        <View style={styles.sectionHeaderContainer}>
          <TouchableOpacity onPress={() => handleToggleCollapse(item.id)} style={styles.sectionHeaderTitleContainer}>
            <Icon 
              name={collapsedRoutines.includes(item.id) ? 'keyboard-arrow-right' : 'keyboard-arrow-down'} 
              size={24} 
              color="#333" 
            />
            <Text style={styles.sectionHeader}>{item.name}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Render todo item
    return (
      <TouchableOpacity
        style={styles.todoItem}
        onPress={() => handleToggleComplete(item.item!.id)}
      >
        <View style={styles.todoContent}>
          <Icon name={item.item!.completed ? 'check-box' : 'check-box-outline-blank'} size={24} color="#4F8EF7" />
          <View style={styles.todoTextContainer}>
            <Text style={[styles.todoText, item.item!.completed && styles.completedText]}>{item.item!.text}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => handleDeleteTodo(item.item!.id)}>
          <Icon name="delete" size={24} color="red" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={flatData}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ListEmptyComponent={<Text style={styles.emptyText}>No todos due today.</Text>}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(!modalVisible)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <AddTodoForm onTodoAdded={handleTodoAdded} source="today" />
            <Button title="Close" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Icon name="add" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    todoItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 15,
      backgroundColor: 'white',
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
      paddingLeft: 30, // Indent todo items under routines
    },
    todoContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    todoTextContainer: { marginLeft: 10, flex: 1 },
    todoText: { fontSize: 18 },
    completedText: { textDecorationLine: 'line-through', color: '#aaa' },
    fab: {
      position: 'absolute',
      right: 30,
      bottom: 30,
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: '#4F8EF7',
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 8,
    },
    emptyText: { textAlign: 'center', marginTop: 50, fontSize: 18, color: '#999' },
    sectionHeader: {
      fontSize: 20,
      fontWeight: 'bold',
      paddingVertical: 10,
      color: '#333',
    },
    sectionHeaderContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#f0f0f0',
      paddingHorizontal: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#ddd',
    },
    sectionHeaderTitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    centeredView: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
      backgroundColor: 'white',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: -2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
  });

export default TodayScreen;
