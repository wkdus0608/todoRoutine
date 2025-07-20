import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, Alert } from 'react-native';
import { loadCategories, saveCategories } from '../storage/dataManager';
import { Category } from '../types';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

const CategoryScreen = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      const loadedCategories = await loadCategories();
      setCategories(loadedCategories);
    };
    fetchCategories();
  }, []);

  const handleAddCategory = async () => {
    if (newCategoryName.trim() === '') {
      Alert.alert('Error', 'Category name cannot be empty.');
      return;
    }
    const newCategory: Category = {
      id: uuidv4(),
      name: newCategoryName.trim(),
    };
    const updatedCategories = [...categories, newCategory];
    setCategories(updatedCategories);
    await saveCategories(updatedCategories);
    setNewCategoryName('');
  };

  const handleDeleteCategory = async (id: string) => {
    // TODO: Also handle deleting todos associated with this category
    const updatedCategories = categories.filter(cat => cat.id !== id);
    setCategories(updatedCategories);
    await saveCategories(updatedCategories);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter new category name"
          value={newCategoryName}
          onChangeText={setNewCategoryName}
        />
        <Button title="Add" onPress={handleAddCategory} />
      </View>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <Text style={styles.itemText}>{item.name}</Text>
            <Button title="Delete" color="red" onPress={() => handleDeleteCategory(item.id)} />
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

export default CategoryScreen;
