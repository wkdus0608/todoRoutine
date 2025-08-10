import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { addTodo, loadCategories } from '../storage/dataManager';
import { Todo, Category } from '../types';
import { Picker } from '@react-native-picker/picker';
import EisenhowerMatrixSheet from '../components/EisenhowerMatrixSheet';

type Priority = NonNullable<Todo['priority']>;

const AddScreen = () => {
  const navigation = useNavigation();
  const [text, setText] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isMatrixVisible, setMatrixVisible] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      // Assuming loadCategories is defined elsewhere and works as before
      const loadedCategories = await loadCategories(); 
      setCategories(loadedCategories);
      if (loadedCategories.length > 0) {
        setSelectedCategory(loadedCategories[0].id);
      }
    };
    fetchCategories();
  }, []);

  const handleSaveTodo = async (priority: Priority) => {
    if (text.trim() === '' || !selectedCategory) {
      // This check is redundant if openMatrixSheet handles it, but good for safety
      return;
    }

    const newTodo: Omit<Todo, 'id' | 'completed' | 'createdAt'> = {
      text: text.trim(),
      categoryId: selectedCategory,
      priority: priority,
    };

    await addTodo(newTodo);
    navigation.goBack();
  };

  const openMatrixSheet = () => {
    if (text.trim() === '') {
      Alert.alert('오류', '할 일 내용을 입력해주세요.');
      return;
    }
    if (!selectedCategory) {
      Alert.alert('오류', '카테고리를 선택해주세요.');
      return;
    }
    setMatrixVisible(true);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="새로운 할 일을 입력하세요..."
        value={text}
        onChangeText={setText}
      />
      <Text style={styles.label}>카테고리:</Text>
      <Picker
        selectedValue={selectedCategory}
        onValueChange={(itemValue) => setSelectedCategory(itemValue)}
      >
        {categories.map((cat) => (
          <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
        ))}
      </Picker>
      <Button title="추가" onPress={openMatrixSheet} />

      <EisenhowerMatrixSheet
        visible={isMatrixVisible}
        onClose={() => setMatrixVisible(false)}
        onSelect={handleSaveTodo}
      />
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
