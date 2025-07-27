import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Button,
  FlatList,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

// 데이터 타입 (App.tsx와 동일하게 유지)
interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  // ... 다른 속성들
}

interface TodoViewProps {
  todos: Todo[];
  onAddTodo: (text: string) => void;
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

export function TodoView({ todos, onAddTodo, onToggleTodo, onDeleteTodo }: TodoViewProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [newTodoText, setNewTodoText] = useState('');

  const handleAddTodo = () => {
    if (newTodoText.trim()) {
      onAddTodo(newTodoText.trim());
      setNewTodoText('');
      setModalVisible(false);
    }
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
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>새로운 할 일 추가</Text>
            <TextInput
              style={styles.input}
              placeholder="할 일을 입력하세요..."
              value={newTodoText}
              onChangeText={setNewTodoText}
              onSubmitEditing={handleAddTodo}
              autoFocus
            />
            <View style={styles.modalButtons}>
                <Button title="취소" onPress={() => setModalVisible(false)} color="gray" />
                <View style={{width: 10}}/>
                <Button title="추가" onPress={handleAddTodo} />
            </View>
          </View>
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
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    padding: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between'
  }
});
