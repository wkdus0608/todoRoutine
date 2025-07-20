import AsyncStorage from '@react-native-async-storage/async-storage';
import { Todo, Routine } from '../types';

const ROUTINES_KEY = '@TodoListApp:routines';
const TODOS_KEY = '@TodoListApp:todos';

// Routines
export const loadRoutines = async (): Promise<Routine[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(ROUTINES_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Failed to load routines.', e);
    return [];
  }
};

export const saveRoutines = async (routines: Routine[]): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(routines);
    await AsyncStorage.setItem(ROUTINES_KEY, jsonValue);
  } catch (e) {
    console.error('Failed to save routines.', e);
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
