import AsyncStorage from '@react-native-async-storage/async-storage';
import { Todo, Category } from '../types';

const CATEGORIES_KEY = '@TodoListApp:categories';
const TODOS_KEY = '@TodoListApp:todos';

// Categories
export const loadCategories = async (): Promise<Category[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(CATEGORIES_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Failed to load categories.', e);
    return [];
  }
};

export const saveCategories = async (categories: Category[]): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(categories);
    await AsyncStorage.setItem(CATEGORIES_KEY, jsonValue);
  } catch (e) {
    console.error('Failed to save categories.', e);
  }
};

// Todos
export const loadTodos = async (): Promise<Todo[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(TODOS_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Failed to load todos.', e);
    return [];
  }
};

export const saveTodos = async (todos: Todo[]): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(todos);
    await AsyncStorage.setItem(TODOS_KEY, jsonValue);
  } catch (e) {
    console.error('Failed to save todos.', e);
  }
};
