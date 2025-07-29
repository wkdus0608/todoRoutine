import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {
  loadTodos,
  saveTodos,
  loadRoutines,
  saveRoutines,
} from '../storage/dataManager';
import { Todo, Routine } from '../types';
import Icon from 'react-native-vector-icons/Ionicons';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { formatDateInfo } from '../utils/dateUtils';
import AddTodoForm from '../components/AddTodoForm';

type MainScreenNavigationProp = DrawerNavigationProp<{
  Home: undefined;
}>;

const MainScreen = () => {
  const navigation = useNavigation<MainScreenNavigationProp>();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRoutineId, setSelectedRoutineId] = useState<string | null>(
    null,
  );

  const fetchData = async () => {
    const loadedTodos = await loadTodos();
    const loadedRoutines = await loadRoutines();
    setTodos(loadedTodos);
    setRoutines(loadedRoutines);
    if (loadedRoutines.length > 0 && !selectedRoutineId) {
      setSelectedRoutineId(loadedRoutines[0].id);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, []),
  );

  const handleTodoAdded = () => {
    fetchData();
    setModalVisible(false);
  };

  const handleToggleComplete = async (idToToggle: string) => {
    const toggleRecursive = (todosArray: Todo[]): Todo[] => {
      return todosArray.map(todo => {
        if (todo.id === idToToggle) {
          return { ...todo, completed: !todo.completed };
        }
        if (todo.subTodos) {
          return { ...todo, subTodos: toggleRecursive(todo.subTodos) };
        }
        return todo;
      });
    };
    const updatedTodos = toggleRecursive(todos);
    setTodos(updatedTodos);
    await saveTodos(updatedTodos);
  };

  const renderTodoItem = (item: Todo, index: number, isLast: boolean) => {
    const dateString = formatDateInfo(
      item.dueDate,
      item.dateRange,
      item.repeatSettings,
    );

    return (
      <TouchableOpacity
        key={item.id}
        onPress={() => handleToggleComplete(item.id)}
        style={[styles.todoItem, isLast && styles.lastTodoItem]}
        activeOpacity={0.7}
      >
        <Icon
          name={
            item.completed ? 'checkmark-circle' : 'radio-button-off-outline'
          }
          size={24}
          color={item.completed ? '#9CA3AF' : '#007AFF'}
          style={styles.checkboxIcon}
        />
        <View style={styles.todoTextContainer}>
          <Text
            style={[styles.todoText, item.completed && styles.completedText]}
          >
            {item.text}
          </Text>
        </View>
        {dateString && <Text style={styles.dueDateText}>{dateString}</Text>}
      </TouchableOpacity>
    );
  };

  const activeTodos = todos.filter(t => !t.completed);
  const completedTodos = todos.filter(t => t.completed);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Icon name="menu" size={30} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>웹사이트 개발</Text>
        <View style={{ width: 30 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Incomplete Todos Section */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Icon name="radio-button-off-outline" size={24} color="#007AFF" />
            <Text style={styles.sectionTitle}>
              할 일 ({activeTodos.length})
            </Text>
          </View>
          {activeTodos.map((todo, index) =>
            renderTodoItem(todo, index, index === activeTodos.length - 1),
          )}
        </View>

        {/* Completed Todos Section */}
        {completedTodos.length > 0 && (
          <View style={[styles.card, { marginTop: 20 }]}>
            <View style={styles.sectionHeader}>
              <Icon name="checkmark-circle-outline" size={24} color="#34C759" />
              <Text style={styles.sectionTitle}>
                완료된 항목 ({completedTodos.length})
              </Text>
            </View>
            {completedTodos.map((todo, index) =>
              renderTodoItem(
                todo,
                index,
                index === completedTodos.length - 1,
              ),
            )}
          </View>
        )}
      </ScrollView>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <AddTodoForm
            onTodoAdded={handleTodoAdded}
            onCancel={() => setModalVisible(false)}
            projects={routines}
            currentProjectId={selectedRoutineId}
          />
        </View>
      </Modal>
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Icon name="add" size={30} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#F9F9F9',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginLeft: 8,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingTop: 15,
    paddingBottom: 8,
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 20,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  lastTodoItem: {
    borderBottomWidth: 0,
  },
  checkboxIcon: {
    marginRight: 15,
  },
  todoTextContainer: {
    flex: 1,
  },
  todoText: {
    fontSize: 16,
    color: '#1F2937',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  dueDateText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    right: 25,
    bottom: 35,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1C1C1E',
    justifyContent: 'center',
    alignItems: 'center',
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

export default MainScreen;