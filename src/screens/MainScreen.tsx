import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Button, FlatList, StyleSheet, TouchableOpacity, SectionList } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { loadTodos, saveTodos, loadCategories } from '../storage/dataManager';
import { Todo, Category } from '../types';
import Icon from 'react-native-vector-icons/MaterialIcons';

const MainScreen = () => {
  const navigation = useNavigation();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filter, setFilter] = useState<string | null>(null); // null means all

  const fetchData = async () => {
    const loadedTodos = await loadTodos();
    const loadedCategories = await loadCategories();
    setTodos(loadedTodos);
    setCategories(loadedCategories);
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const handleToggleComplete = async (id: string) => {
    const updatedTodos = todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    setTodos(updatedTodos);
    await saveTodos(updatedTodos);
  };

  const handleDeleteTodo = async (id: string) => {
    const updatedTodos = todos.filter(todo => todo.id !== id);
    setTodos(updatedTodos);
    await saveTodos(updatedTodos);
  };

  const todosByCategory = categories
    .map(category => ({
      title: category.name,
      data: todos.filter(todo => todo.categoryId === category.id),
    }))
    .filter(category => category.data.length > 0);

  const uncategorizedTodos = todos.filter(
    todo => !todo.categoryId || !categories.find(c => c.id === todo.categoryId)
  );

  const sections = [...todosByCategory];
  if (uncategorizedTodos.length > 0) {
    sections.push({ title: 'Uncategorized', data: uncategorizedTodos });
  }


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button title="Manage Categories" onPress={() => navigation.navigate('Categories')} />
      </View>
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
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('Add')}
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
});

export default MainScreen;
