import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
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

const TodoItem = ({ todo, onToggle, onDelete, isLast }) => {
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

  const dateString = formatDateInfo(
    todo.dueDate,
    todo.dateRange,
    todo.repeatSettings,
  );

  return (
    <Swipeable ref={swipeableRef} renderRightActions={renderRightActions}>
      <TouchableOpacity
        style={[styles.todoItemContainer, isLast && styles.lastTodoItem]}
        onPress={() => onToggle(todo.id)}
        activeOpacity={0.7}
      >
        <Icon
          name={todo.completed ? 'check-square' : 'square'}
          size={24}
          color={todo.completed ? '#9CA3AF' : '#4F8EF7'}
          style={styles.todoCheckbox}
        />
        <View style={styles.todoTextContainer}>
          <Text
            style={[
              styles.todoText,
              todo.completed && styles.completedTodoText,
            ]}
          >
            {todo.text}
          </Text>
        </View>
        {dateString && <Text style={styles.dateInfoText}>{dateString}</Text>}
        
      </TouchableOpacity>
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
  const totalTodos = todos.length;

  const renderEmptyState = (message: string) => (
    <View style={styles.emptyStateContainer}>
      <Text style={styles.emptyStateText}>{message}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* 진행 상황 요약 */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryText}>
            전체: {totalTodos}개     완료: {completedTodos.length}개     남은 할 일:{' '}
            {incompleteTodos.length}개
          </Text>
        </View>

        {/* 할 일 섹션 */}
        <View style={styles.sectionHeader}>
          <Icon name="circle" size={15} color="1" style={styles.sectionIcon} />
          <Text style={styles.sectionTitle}>
            할 일 ({incompleteTodos.length})
          </Text>
        </View>
        <View style={styles.sectionCard}>
          {incompleteTodos.length > 0
            ? incompleteTodos.map((todo, index) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={onToggleTodo}
                  onDelete={onDeleteTodo}
                  isLast={index === incompleteTodos.length - 1}
                />
              ))
            : renderEmptyState('할 일이 없습니다.')}
        </View>

        {/* 완료된 항목 섹션 */}
        {completedTodos.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Icon
                name="check-circle"
                size={15}
                color="#888888"
                style={styles.sectionIcon}
              />
              <Text style={[styles.sectionTitle, { color: '#888888' }]}>
                완료된 항목 ({completedTodos.length})
              </Text>
            </View>
            <View style={styles.sectionCard}>
              {completedTodos.map((todo, index) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={onToggleTodo}
                  onDelete={onDeleteTodo}
                  isLast={index === completedTodos.length - 1}
                />
              ))}
            </View>
          </>
        )}
      </ScrollView>

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
  container: {
    flex: 1,
    backgroundColor: '0',
  },
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: 8,
    paddingTop: 16,
    paddingBottom: 100,
  },
  summaryCard: {
    backgroundColor: '0',
    padding: 0,
    marginBottom: 10,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.08,
    // shadowRadius: 8,
    elevation: 3,
    marginHorizontal: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '0',
    textAlign: 'left',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginBottom: 20,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.08,
    // shadowRadius: 8,
    // elevation: 3,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 1,
    paddingVertical: 10,
    // borderBottomWidth: 0,
    // borderBottomColor: '#E5E7EB',
    // backgroundColor: '#FAFAFA',
    marginHorizontal: 8,
  },
  sectionIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111827',
  },
  todoItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  lastTodoItem: {
    borderBottomWidth: 0,
  },
  todoCheckbox: {
    marginRight: 12,
  },
  todoTextContainer: {
    flex: 1,
  },
  todoText: {
    fontSize: 16,
    color: '#1F2937',
  },
  completedTodoText: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  dateInfoText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 8,
  },
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    right: 20,
    bottom: 20,
    backgroundColor: '#1C1C1E',
    borderRadius: 28,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 20,
  },
  deleteAction: {
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
  },
  
});
