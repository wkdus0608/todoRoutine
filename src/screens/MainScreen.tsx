import React, { useState, useCallback } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, Alert, Modal } from 'react-native';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import AddTodoForm from '../components/AddTodoForm';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { loadTodos, saveTodos, loadRoutines, saveRoutines } from '../storage/dataManager';
import { Todo, Routine } from '../types';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Define a type for the flattened data structure
interface FlatListItem {
  type: 'routine' | 'todo';
  id: string;
  name?: string; // For routines
  item?: Todo; // For todos
  routineId?: string;
  parentId?: string; // Added for sub-todos
  level: number; // Added for indentation
}

// Helper function to flatten todos with their sub-todos for DraggableFlatList
const flattenTodos = (todosArray: Todo[], routineId: string | undefined, level: number = 0): FlatListItem[] => {
  let flattened: FlatListItem[] = [];
  todosArray.forEach(todo => {
    flattened.push({
      type: 'todo',
      id: todo.id,
      item: todo,
      routineId: routineId,
      parentId: todo.parentId,
      level: level,
    });
    if (todo.subTodos && todo.subTodos.length > 0) {
      flattened = flattened.concat(flattenTodos(todo.subTodos, routineId, level + 1));
    }
  });
  return flattened;
};

// Helper function to reconstruct nested todos from flattened data
const reconstructTodos = (flatData: FlatListItem[], allOriginalTodos: Todo[]): Todo[] => {
  const newTopLevelTodos: Todo[] = [];
  const tempTodoMap = new Map<string, Todo>(); // To store todos as we process them, with cleared parent/subTodo relationships

  // Initialize all todos with their original properties, but clear parent/subTodo relationships
  allOriginalTodos.forEach(todo => {
    const cleanTodo: Todo = { ...todo, parentId: undefined, subTodos: [] };
    tempTodoMap.set(cleanTodo.id, cleanTodo);
  });

  const parentStack: { id: string; level: number; todoRef: Todo }[] = []; // Stack to keep track of potential parents

  let currentRoutineId: string | undefined = undefined;

  for (let i = 0; i < flatData.length; i++) {
    const item = flatData[i];

    if (item.type === 'routine') {
      currentRoutineId = item.id;
      parentStack.length = 0; // Reset parent stack for new routine
    } else if (item.type === 'todo' && item.item) {
      const currentTodo = tempTodoMap.get(item.id);
      if (!currentTodo) continue;

      currentTodo.routineId = currentRoutineId; // Assign routine based on current context

      // Determine the effective level based on the previous item's effective level
      // This is a heuristic: if an item is dropped immediately after another, and it's
      // visually indented, we assume it's a child. We'll use the original level as a hint,
      // but primarily rely on the stack for parent-child relationships.
      let effectiveLevel = item.level; // Start with the original level as a base hint

      // Adjust parentStack based on current item's effective level
      while (parentStack.length > 0 && parentStack[parentStack.length - 1].level >= effectiveLevel) {
        parentStack.pop();
      }

      if (parentStack.length > 0) {
        // This todo is a child of the top of the stack
        const parent = parentStack[parentStack.length - 1];
        currentTodo.parentId = parent.id;
        parent.todoRef.subTodos?.push(currentTodo);
      } else {
        // This is a top-level todo for the current routine or uncategorized
        newTopLevelTodos.push(currentTodo);
      }

      // Push current todo to stack if it can be a parent
      // Use the effectiveLevel for the stack to maintain correct hierarchy
      parentStack.push({ id: currentTodo.id, level: effectiveLevel, todoRef: currentTodo });
    }
  }
  return newTopLevelTodos;
};

const MainScreen = () => {
  const navigation = useNavigation();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [collapsedRoutines, setCollapsedRoutines] = useState<string[]>([]);

  const fetchData = async () => {
    const loadedTodos = await loadTodos();
    const loadedRoutines = await loadRoutines();
    setTodos(loadedTodos);
    setRoutines(loadedRoutines);
    console.log('Loaded Routines:', loadedRoutines); // Add this line
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const [modalVisible, setModalVisible] = useState(false);

  const handleTodoAdded = () => {
    fetchData(); // Reload data
    setModalVisible(false); // Close modal
  };

  const handleDeleteTodo = async (idToDelete: string) => {
    const deleteRecursive = (todosArray: Todo[]): Todo[] => {
      return todosArray.filter(todo => {
        if (todo.id === idToDelete) {
          return false; // This todo is deleted
        }
        if (todo.subTodos && todo.subTodos.length > 0) {
          todo.subTodos = deleteRecursive(todo.subTodos);
        }
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
        if (todo.subTodos && todo.subTodos.length > 0) {
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
    setCollapsedRoutines(prev =>
      prev.includes(routineId)
        ? prev.filter(id => id !== routineId)
        : [...prev, routineId]
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
      { cancelable: true }
    );
  };

  const handleDragEnd = ({ data }: { data: FlatListItem[] }) => {
    console.log('Drag ended. New data order:', data.map(d => ({id: d.id, type: d.type, name: d.name, routineId: d.routineId, level: d.level})));
    
    // Reconstruct the nested todo structure from the flattened data
    const reconstructed = reconstructTodos(data, todos);
    setTodos(reconstructed);
    saveTodos(reconstructed);
  };

  const flatData: FlatListItem[] = [];
  routines.forEach(routine => {
    flatData.push({ type: 'routine', id: routine.id, name: routine.name, level: 0 });
    if (!collapsedRoutines.includes(routine.id)) {
      const routineTodos = todos.filter(todo => todo.routineId === routine.id && !todo.parentId);
      flatData.push(...flattenTodos(routineTodos, routine.id, 0));
    }
  });

  // Always add uncategorized routine header if there are uncategorized todos
  const uncategorizedTodos = todos.filter(
    todo => !todo.routineId || !routines.find(c => c.id === todo.routineId) && !todo.parentId
  );
  if (uncategorizedTodos.length > 0) {
    flatData.push({ type: 'routine', id: 'uncategorized', name: 'Uncategorized', level: 0 });
    flatData.push(...flattenTodos(uncategorizedTodos, 'uncategorized', 0));
  }

  const renderItem = ({ item, drag, isActive }: RenderItemParams<FlatListItem>) => {
    if (item.type === 'routine') {
      return (
        <View style={styles.sectionHeaderContainer}>
          <TouchableOpacity onPress={() => handleToggleCollapse(item.id)} style={styles.sectionHeaderTitleContainer}>
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

    // Render todo item
    return (
      <TouchableOpacity
        style={[
          styles.todoItem,
          { backgroundColor: isActive ? '#f0f0f0' : 'white' },
          { paddingLeft: 15 + (item.level * 20) }, // Apply indentation
        ]}
        onPress={() => handleToggleComplete(item.item!.id)}
        onLongPress={drag}
        disabled={isActive}
        activeOpacity={0.7} // 터치 시 피드백을 위한 표준 투명도 설정
      >
        <View style={styles.todoContent}>
          <Icon name={item.item!.completed ? 'check-box' : 'check-box-outline-blank'} size={24} color="#4F8EF7" />
          <View style={styles.todoTextContainer}>
            <Text style={[styles.todoText, item.item!.completed && styles.completedText]}>{item.item!.text}</Text>
            {item.item?.dueDate && (
              <Text style={styles.dueDateText}>
                Due: {new Date(item.item.dueDate).toLocaleDateString()}
              </Text>
            )}
          </View>
        </View>
        <TouchableOpacity onPress={() => handleDeleteTodo(item.item!.id)}>
          <Icon name="delete" size={24} color="red" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <DraggableFlatList
        data={flatData}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        onDragEnd={handleDragEnd}
        ListEmptyComponent={<Text style={styles.emptyText}>No todos yet. Add one!</Text>}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <AddTodoForm onTodoAdded={handleTodoAdded} source="main" />
            <Button title="Close" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Icon name="add" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#ddd' },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  todoContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  todoTextContainer: { marginLeft: 10, flex: 1 },
  todoText: { fontSize: 18 },
  completedText: { textDecorationLine: 'line-through', color: '#aaa' },
  dueDateText: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
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
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingVertical: 10,
    color: '#333',
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  sectionHeaderTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default MainScreen;
