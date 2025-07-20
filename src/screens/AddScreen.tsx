import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { loadTodos, saveTodos, loadCategories } from '../storage/dataManager';
import { Todo, Category } from '../types';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { Picker } from '@react-native-picker/picker'; // This will require installation

const AddScreen = () => {
  const navigation = useNavigation();
  const [text, setText] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      const loadedCategories = await loadCategories();
      setCategories(loadedCategories);
      if (loadedCategories.length > 0) {
        setSelectedCategory(loadedCategories[0].id);
      }
    };
    fetchCategories();
  }, []);

  const handleAddTodo = async () => {
    if (text.trim() === '') {
      Alert.alert('Error', 'Todo text cannot be empty.');
      return;
    }
    if (!selectedCategory) {
      Alert.alert('Error', 'Please select a category.');
      return;
    }

    const newTodo: Todo = {
      id: uuidv4(),
      text: text.trim(),
      completed: false,
      categoryId: selectedCategory,
    };

    const currentTodos = await loadTodos();
    const updatedTodos = [...currentTodos, newTodo];
    await saveTodos(updatedTodos);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter new todo..."
        value={text}
        onChangeText={setText}
      />
      <Text style={styles.label}>Category:</Text>
      <Picker
        selectedValue={selectedCategory}
        onValueChange={(itemValue) => setSelectedCategory(itemValue)}
      >
        {categories.map(cat => (
          <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
        ))}
      </Picker>
      <Button title="Add Todo" onPress={handleAddTodo} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
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
});

export default AddScreen;
