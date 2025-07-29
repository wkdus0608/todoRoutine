import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  SafeAreaView,
} from 'react-native';
import DraggableFlatList, {
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import AddTodoForm from '../components/AddTodoForm';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {
  loadTodos,
  saveTodos,
  loadRoutines,
  saveRoutines,
} from '../storage/dataManager';
import { Todo, Routine } from '../types';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { formatDateInfo } from '../utils/dateUtils';

type MainScreenNavigationProp = DrawerNavigationProp<{
  Home: undefined;
}>;

interface FlatListItem {
  type: 'routine' | 'todo' | 'completed_header';
  id: string;
  name?: string;
  item?: Todo;
  routineId?: string;
  parentId?: string;
  level: number;
  isCompleted?: boolean;
}

// Helper functions (flattenTodos, reconstructTodos) remain the same...
const flattenTodos = (
  todosArray: Todo[],
  routineId: string | undefined,
  level: number = 0,
  isCompleted: boolean = false,
): FlatListItem[] => {
  let flattened: FlatListItem[] = [];
  todosArray.forEach(todo => {
    if (todo.completed === isCompleted) {
      flattened.push({
        type: 'todo',
        id: todo.id,
        item: todo,
        routineId: routineId,
        parentId: todo.parentId,
        level: level,
        isCompleted,
      });
      if (todo.subTodos && todo.subTodos.length > 0) {
        flattened = flattened.concat(
          flattenTodos(todo.subTodos, routineId, level + 1, isCompleted),
        );
      }
    }
  });
  return flattened;
};

const reconstructTodos = (
  flatData: FlatListItem[],
  allOriginalTodos: Todo[],
): Todo[] => {
  const newTopLevelTodos: Todo[] = [];
  const tempTodoMap = new Map<string, Todo>();

  allOriginalTodos.forEach(todo => {
    const cleanTodo: Todo = { ...todo, parentId: undefined, subTodos: [] };
    tempTodoMap.set(cleanTodo.id, cleanTodo);
  });

  const parentStack: { id: string; level: number; todoRef: Todo }[] = [];
  let currentRoutineId: string | undefined = undefined;

  for (let i = 0; i < flatData.length; i++) {
    const item = flatData[i];

    if (item.type === 'routine') {
      currentRoutineId = item.id;
      parentStack.length = 0;
    } else if (item.type === 'todo' && item.item) {
      const currentTodo = tempTodoMap.get(item.id);
      if (!currentTodo) continue;

      currentTodo.routineId = currentRoutineId;
      let effectiveLevel = item.level;

      while (
        parentStack.length > 0 &&
        parentStack[parentStack.length - 1].level >= effectiveLevel
      ) {
        parentStack.pop();
      }

      if (parentStack.length > 0) {
        const parent = parentStack[parentStack.length - 1];
        currentTodo.parentId = parent.id;
        parent.todoRef.subTodos?.push(currentTodo);
      } else {
        newTopLevelTodos.push(currentTodo);
      }

      parentStack.push({
        id: currentTodo.id,
        level: effectiveLevel,
        todoRef: currentTodo,
      });
    }
  }
  return newTopLevelTodos;
};


const MainScreen = () => {
  const navigation = useNavigation<MainScreenNavigationProp>();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [collapsedRoutines, setCollapsedRoutines] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRoutineId, setSelectedRoutineId] = useState<string | null>(null);


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

  const handleDeleteTodo = async (idToDelete: string) => {
    const deleteRecursive = (todosArray: Todo[]): Todo[] => {
      return todosArray.filter(todo => {
        if (todo.id === idToDelete) return false;
        if (todo.subTodos) todo.subTodos = deleteRecursive(todo.subTodos);
        return true;
      });
    };
    const updatedTodos = deleteRecursive(todos);
    setTodos(updatedTodos);
    await saveTodos(updatedTodos);
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

  const handleToggleCollapse = (routineId: string) => {
    setSelectedRoutineId(routineId); // Set the selected routine
    setCollapsedRoutines(prev =>
      prev.includes(routineId)
        ? prev.filter(id => id !== routineId)
        : [...prev, routineId],
    );
  };

  const handleDeleteRoutine = async (routineId: string) => {
    Alert.alert(
      'Delete Routine',
      'Are you sure you want to delete this routine and all its associated todos?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            const updatedRoutines = routines.filter(r => r.id !== routineId);
            const updatedTodos = todos.filter(t => t.routineId !== routineId);
            setRoutines(updatedRoutines);
            setTodos(updatedTodos);
            await saveRoutines(updatedRoutines);
            await saveTodos(updatedTodos);
          },
          style: 'destructive',
        },
      ],
    );
  };

  const handleDragEnd = ({ data }: { data: FlatListItem[] }) => {
    const reconstructed = reconstructTodos(data, todos);
    setTodos(reconstructed);
    saveTodos(reconstructed);
  };

  const activeTodos = todos.filter(todo => !todo.completed);
  const completedTodos = todos.filter(todo => todo.completed);

  const flatData: FlatListItem[] = [];

  // Active Todos
  routines.forEach(routine => {
    const routineActiveTodos = activeTodos.filter(
      todo => todo.routineId === routine.id && !todo.parentId,
    );
    if (routineActiveTodos.length > 0) {
      flatData.push({ type: 'routine', id: routine.id, name: routine.name, level: 0 });
      if (!collapsedRoutines.includes(routine.id)) {
        flatData.push(...flattenTodos(routineActiveTodos, routine.id, 0, false));
      }
    }
  });

  const uncategorizedActiveTodos = activeTodos.filter(
    todo => !todo.routineId && !todo.parentId,
  );
  if (uncategorizedActiveTodos.length > 0) {
    flatData.push({ type: 'routine', id: 'uncategorized', name: 'Uncategorized', level: 0 });
    flatData.push(...flattenTodos(uncategorizedActiveTodos, 'uncategorized', 0, false));
  }

  // Completed Todos
  if (completedTodos.length > 0) {
    flatData.push({ type: 'completed_header', id: 'completed_header', name: '완료된 항목', level: 0 });
    completedTodos.forEach(todo => {
      if (!todo.parentId) { // Only add top-level completed todos
        flatData.push({
          type: 'todo',
          id: todo.id,
          item: todo,
          level: 0,
          isCompleted: true,
        });
      }
    });
  }


  const renderItem = ({ item, drag, isActive }: RenderItemParams<FlatListItem>) => {
    if (item.type === 'routine') {
      return (
        <View style={styles.sectionHeaderContainer}>
          <TouchableOpacity
            onPress={() => handleToggleCollapse(item.id)}
            style={styles.sectionHeaderTitleContainer}
          >
            <Icon
              name={collapsedRoutines.includes(item.id) ? 'keyboard-arrow-right' : 'keyboard-arrow-down'}
              size={24}
              color="#333"
            />
            <Text style={styles.sectionHeader}>{item.name}</Text>
          </TouchableOpacity>
          {item.id !== 'uncategorized' && (
            <TouchableOpacity onPress={() => handleDeleteRoutine(item.id)}>
              <Icon name="more-vert" size={24} color="#333" />
            </TouchableOpacity>
          )}
        </View>
      );
    }

    if (item.type === 'completed_header') {
      return <Text style={styles.completedHeader}>{item.name}</Text>;
    }
    
    const dateString = item.item ? formatDateInfo(item.item.dueDate, item.item.dateRange, item.item.repeatSettings) : null;

    return (
      <TouchableOpacity
        style={[
          styles.todoItem,
          { backgroundColor: isActive ? '#f0f0f0' : 'white' },
          { paddingLeft: 15 + item.level * 20 },
        ]}
        onPress={() => handleToggleComplete(item.item!.id)}
        onLongPress={drag}
        disabled={isActive || item.isCompleted}
        activeOpacity={0.7}
      >
        <View style={styles.todoContent}>
          <Icon
            name={item.item!.completed ? 'check-box' : 'check-box-outline-blank'}
            size={24}
            color="#4F8EF7"
          />
          <View style={styles.todoTextContainer}>
            <Text style={[styles.todoText, item.item!.completed && styles.completedText]}>
              {item.item!.text}
            </Text>
          </View>
        </View>
        {dateString && (
          <Text style={styles.dueDateText}>{dateString}</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Icon name="menu" size={30} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>목록</Text>
        <View style={{ width: 30 }} />
      </View>
      <DraggableFlatList
        data={flatData}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        onDragEnd={handleDragEnd}
        ListEmptyComponent={<Text style={styles.emptyText}>No todos yet. Add one!</Text>}
      />
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
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Icon name="add" size={30} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  todoContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  todoTextContainer: { marginLeft: 12, flex: 1 },
  todoText: { fontSize: 16, color: '#1F2937' },
  completedText: { textDecorationLine: 'line-through', color: '#9CA3AF' },
  dueDateText: { fontSize: 14, color: '#888' },
  fab: {
    position: 'absolute',
    right: 30,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4F8EF7',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 18, color: '#999' },
  sectionHeader: { fontSize: 18, fontWeight: 'bold', color: '#333', marginLeft: 8 },
  sectionHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionHeaderTitleContainer: { flexDirection: 'row', alignItems: 'center' },
  completedHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#f9f9f9',
    color: '#333',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginTop: 0,
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
