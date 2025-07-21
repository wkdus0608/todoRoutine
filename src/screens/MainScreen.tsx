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
}

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

  const handleDeleteTodo = async (id: string) => {
    const updatedTodos = todos.filter(todo => todo.id !== id);
    setTodos(updatedTodos);
    await saveTodos(updatedTodos);
  };

  const handleToggleComplete = async (id: string) => {
    const updatedTodos = todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
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
    console.log('Drag ended. New data order:', data.map(d => ({id: d.id, type: d.type, name: d.name, routineId: d.routineId})));
    const newTodos = [...todos];
    let currentRoutineId: string | undefined = undefined;
    let changed = false;

    data.forEach(item => {
      if (item.type === 'routine') {
        currentRoutineId = item.id;
      } else if (item.type === 'todo' && item.item) {
        const todo = newTodos.find(t => t.id === item.item!.id);
        if (todo && todo.routineId !== currentRoutineId) {
          console.log(`Todo '${todo.text}' moved from ${todo.routineId} to ${currentRoutineId}`);
          todo.routineId = currentRoutineId;
          changed = true;
        }
      }
    });

    if (changed) {
      console.log('Updating todos state and saving to storage.');
      setTodos(newTodos);
      saveTodos(newTodos);
    } else {
      console.log('No changes in routine assignments detected.');
    }
  };

  const flatData: FlatListItem[] = [];
  routines.forEach(routine => {
    flatData.push({ type: 'routine', id: routine.id, name: routine.name });
    if (!collapsedRoutines.includes(routine.id)) {
      const routineTodos = todos.filter(todo => todo.routineId === routine.id);
      routineTodos.forEach(todo => {
        flatData.push({ type: 'todo', id: todo.id, item: todo, routineId: routine.id });
      });
    }
  });

  const uncategorizedTodos = todos.filter(
    todo => !todo.routineId || !routines.find(c => c.id === todo.routineId)
  );
  if (uncategorizedTodos.length > 0) {
    flatData.push({ type: 'routine', id: 'uncategorized', name: 'Uncategorized' });
    uncategorizedTodos.forEach(todo => {
      flatData.push({ type: 'todo', id: todo.id, item: todo, routineId: 'uncategorized' });
    });
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
        style={[styles.todoItem, { backgroundColor: isActive ? '#f0f0f0' : 'white' }]}
        onPress={() => handleToggleComplete(item.item!.id)}
        onLongPress={drag}
        disabled={isActive}
        activeOpacity={0.7} // 터치 시 피드백을 위한 표준 투명도 설정
      >
        <View style={styles.todoContent}>
          <Icon name={item.item!.completed ? 'check-box' : 'check-box-outline-blank'} size={24} color="#4F8EF7" />
          <Text style={[styles.todoText, item.item!.completed && styles.completedText]}>{item.item!.text}</Text>
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
            <AddTodoForm onTodoAdded={handleTodoAdded} />
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
  todoText: { marginLeft: 10, fontSize: 18 },
  completedText: { textDecorationLine: 'line-through', color: '#aaa' },
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
