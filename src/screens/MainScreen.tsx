import React, { useState, useCallback } from 'react';
import { View, Text, Button, FlatList, StyleSheet, TouchableOpacity, SectionList, Alert, Modal } from 'react-native';
import AddTodoForm from '../components/AddTodoForm';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { loadTodos, saveTodos, loadRoutines } from '../storage/dataManager';
import { Todo, Routine } from '../types';
import Icon from 'react-native-vector-icons/MaterialIcons';

const MainScreen = () => {
  const navigation = useNavigation();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [filter, setFilter] = useState<string | null>(null); // null means all

  const fetchData = async () => {
    const loadedTodos = await loadTodos();
    const loadedRoutines = await loadRoutines();
    setTodos(loadedTodos);
    setRoutines(loadedRoutines);
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const [modalVisible, setModalVisible] = useState(false);

  const handleTodoAdded = () => {
    fetchData(); // Reload data
    setModalVisible(false); // Close modal
  };

  const handleDeleteTodo = async (id: string) => {
    const updatedTodos = todos.filter(todo => todo.id !== id);
    setTodos(updatedTodos);
    await saveTodos(updatedTodos);
  };

  const handleToggleComplete = async (id: string) => {
    const updatedTodos = todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    setTodos(updatedTodos);
    await saveTodos(updatedTodos);
  };

  const todosByRoutine = routines
    .map(routine => ({
      title: routine.name,
      data: todos.filter(todo => todo.routineId === routine.id),
    }))
    .filter(routine => routine.data.length > 0);

  const uncategorizedTodos = todos.filter(
    todo => !todo.routineId || !routines.find(c => c.id === todo.routineId)
  );

  const sections = [...todosByRoutine];
  if (uncategorizedTodos.length > 0) {
    sections.push({ title: 'Uncategorized', data: uncategorizedTodos });
  }


  return (
    <View style={styles.container}>
      
      <SectionList
        sections={sections}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.todoItem}>
            <TouchableOpacity onPress={() => handleToggleComplete(item.id)} style={styles.todoContent}>
              <Icon name={item.completed ? 'check-box' : 'check-box-outline-blank'} size={24} color="#4F8EF7" />
              <Text style={[styles.todoText, item.completed && styles.completedText]}>{item.text}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDeleteTodo(item.id)}>
              <Icon name="delete" size={24} color="red" />
            </TouchableOpacity>
          </View>
        )}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No todos yet. Add one!</Text>}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <AddTodoForm onTodoAdded={handleTodoAdded} />
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
  header: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#ddd' },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  todoContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  todoText: { marginLeft: 10, fontSize: 18 },
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
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    color: '#333',
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

export default MainScreen;
