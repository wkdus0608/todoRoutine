import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { Swipeable } from 'react-native-gesture-handler';
import AddTodoForm from './AddTodoForm';
import { Todo, Routine as Project, DateRange, RepeatSettings } from '../types';
import { formatDateInfo } from '../utils/dateUtils';

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

const TodoItem = ({ todo, onToggle, onDelete }) => {
  const swipeableRef = useRef(null);

  const renderRightActions = (progress, dragX) => {
    const trans = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [0, 80],
      extrapolate: 'clamp',
    });
    return (
      <TouchableOpacity
        style={styles.deleteAction}
        onPress={() => {
          swipeableRef.current?.close();
          onDelete(todo.id);
        }}
      >
        <Animated.View style={{ transform: [{ translateX: trans }] }}>
          <Icon name="trash-2" size={20} color="#FFF" />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const dateString = formatDateInfo(todo.dueDate, todo.dateRange, todo.repeatSettings);

  return (
    <Swipeable ref={swipeableRef} renderRightActions={renderRightActions}>
      <View style={styles.todoItemContainer}>
        <TouchableOpacity onPress={() => onToggle(todo.id)} style={styles.todoCheckbox}>
          <Icon
            name={todo.completed ? 'check-square' : 'square'}
            size={24}
            color={todo.completed ? '#9CA3AF' : '#4F8EF7'}
          />
        </TouchableOpacity>
        <View style={styles.todoTextContainer}>
            <Text style={[styles.todoText, todo.completed && styles.completedTodoText]}>
                {todo.text}
            </Text>
        </View>
        {dateString && (
            <Text style={styles.dateInfoText}>{dateString}</Text>
        )}
      </View>
    </Swipeable>
  );
};

export function TodoView({
  todos,
  projects,
  selectedProjectId,
  onAddTodo,
  onToggleTodo,
  onDeleteTodo,
}: TodoViewProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const handleAddTodoAndClose = (
    text: string,
    dateInfo: {
      dueDate?: string;
      dateRange?: DateRange;
      repeatSettings?: RepeatSettings;
    },
    projectId?: string,
  ) => {
    onAddTodo(text, dateInfo, projectId);
    setModalVisible(false);
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
            onTodoAdded={handleAddTodoAndClose}
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
    container: { flex: 1, backgroundColor: '#fff' },
    listHeader: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10, color: '#111827', paddingHorizontal: 15 },
    todoItemContainer: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF', 
        paddingVertical: 16, 
        paddingHorizontal: 15, 
        borderBottomWidth: 1, 
        borderBottomColor: '#f0f0f0' 
    },
    todoCheckbox: { marginRight: 12 },
    todoTextContainer: { flex: 1 },
    todoText: { fontSize: 16, color: '#1F2937' },
    completedTodoText: { textDecorationLine: 'line-through', color: '#9CA3AF' },
    dateInfoText: { fontSize: 14, color: '#888' },
    emptyContainer: { alignItems: 'center', marginTop: 50 },
    emptyText: { fontSize: 16, color: '#6B7280' },
    fab: { position: 'absolute', width: 56, height: 56, alignItems: 'center', justifyContent: 'center', right: 20, bottom: 20, backgroundColor: '#3B82F6', borderRadius: 28, elevation: 8 },
    centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)', paddingHorizontal: 20 },
    deleteAction: { backgroundColor: '#EF4444', justifyContent: 'center', alignItems: 'center', width: 80 },
});
