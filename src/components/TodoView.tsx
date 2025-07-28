import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import AddTodoForm from './AddTodoForm';
import { Todo, Routine as Project, DateRange, RepeatSettings } from '../types';

interface TodoViewProps {
  todos: Todo[];
  projects: Project[];
  selectedProjectId: string | null;
  onAddTodo: (
    text: string,
    dateInfo: {
      dueDate?: string;
      dateRange?: DateRange;
      repeatSettings?: RepeatSettings;
    },
    projectId?: string,
  ) => void;
  onToggleTodo: (todoId: string) => void;
  onDeleteTodo: (todoId: string) => void;
}

const TodoItem = ({ todo, onToggle, onDelete }) => (
  <View style={styles.todoItemContainer}>
    <TouchableOpacity onPress={() => onToggle(todo.id)} style={styles.todoContent}>
      <Icon
        name={todo.completed ? 'check-square' : 'square'}
        size={20}
        color={todo.completed ? '#6B7280' : '#3B82F6'}
      />
      <Text style={[styles.todoText, todo.completed && styles.completedTodoText]}>
        {todo.text}
      </Text>
    </TouchableOpacity>
    <TouchableOpacity onPress={() => onDelete(todo.id)}>
      <Icon name="trash-2" size={20} color="#EF4444" />
    </TouchableOpacity>
  </View>
);

export function TodoView({
  todos,
  projects,
  selectedProjectId,
  onAddTodo,
  onToggleTodo,
  onDeleteTodo,
}: TodoViewProps) {
  const [modalVisible, setModalVisible] = useState(false);

  // This function will now handle both adding the todo and closing the modal.
  const handleAddTodoAndClose = (
    text: string,
    dateInfo: {
      dueDate?: string;
      dateRange?: DateRange;
      repeatSettings?: RepeatSettings;
    },
    projectId?: string,
  ) => {
    onAddTodo(text, dateInfo, projectId); // Call the function from App.tsx
    setModalVisible(false); // Close the modal
  };

  const completedTodos = todos.filter(todo => todo.completed);
  const incompleteTodos = todos.filter(todo => !todo.completed);

  return (
    <View style={styles.container}>
      <FlatList
        data={incompleteTodos}
        renderItem={({ item }) => (
          <TodoItem todo={item} onToggle={onToggleTodo} onDelete={onDeleteTodo} />
        )}
        keyExtractor={item => item.id}
        ListHeaderComponent={
          <Text style={styles.listHeader}>할 일 ({incompleteTodos.length})</Text>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>할 일이 없습니다.</Text>
          </View>
        }
      />

      {completedTodos.length > 0 && (
        <FlatList
          data={completedTodos}
          renderItem={({ item }) => (
            <TodoItem todo={item} onToggle={onToggleTodo} onDelete={onDeleteTodo} />
          )}
          keyExtractor={item => item.id}
          ListHeaderComponent={
            <Text style={styles.listHeader}>완료된 항목 ({completedTodos.length})</Text>
          }
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Icon name="plus" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <AddTodoForm
            onTodoAdded={handleAddTodoAndClose} // Pass the new handler function
            onCancel={() => setModalVisible(false)}
            projects={projects}
            currentProjectId={selectedProjectId}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    listHeader: {
      fontSize: 18,
      fontWeight: 'bold',
      marginTop: 20,
      marginBottom: 10,
      color: '#111827',
    },
    todoItemContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#FFFFFF',
      padding: 15,
      borderRadius: 8,
      marginBottom: 10,
      elevation: 1,
    },
    todoContent: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    todoText: {
      fontSize: 16,
      marginLeft: 12,
      color: '#1F2937',
    },
    completedTodoText: {
      textDecorationLine: 'line-through',
      color: '#9CA3AF',
    },
    emptyContainer: {
      alignItems: 'center',
      marginTop: 50,
    },
    emptyText: {
      fontSize: 16,
      color: '#6B7280',
    },
    fab: {
      position: 'absolute',
      width: 56,
      height: 56,
      alignItems: 'center',
      justifyContent: 'center',
      right: 20,
      bottom: 20,
      backgroundColor: '#3B82F6',
      borderRadius: 28,
      elevation: 8,
    },
    centeredView: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.4)',
      paddingHorizontal: 20,
    },
  });
