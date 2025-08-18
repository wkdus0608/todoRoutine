import React, { useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ProjectSidebar } from '../components/ProjectSidebar';
import { TodoView } from '../components/TodoView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Routine as Project, Todo } from '../types';

const sortTodos = (todos: Todo[]): Todo[] => {
  return todos.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
};

export default function ProjectScreen({ projects, addTodo, toggleTodo, deleteTodo, addProject, deleteProject }) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('1');
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const findProject = (
    projects: Project[],
    id: string,
  ): Project | null => {
    for (const project of projects) {
      if (project.id === id) return project;
      if (project.children) {
        const found = findProject(project.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const selectedProject = findProject(projects, selectedProjectId);
  
  const sortedTodos = selectedProject ? sortTodos(selectedProject.todos) : [];

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.main}>
          {isSidebarOpen && (
            <View style={styles.sidebarContainer}>
              <ProjectSidebar
                projects={projects}
                selectedProjectId={selectedProjectId}
                onSelectProject={setSelectedProjectId}
                onAddProject={addProject}
                onDeleteProject={deleteProject}
                toggleSidebar={toggleSidebar}
              />
            </View>
          )}
          <View style={styles.contentContainer}>
            <View style={styles.headerRow}>
              <TouchableOpacity onPress={toggleSidebar} style={styles.menuButton}>
                <Icon name="menu" size={28} color="#111827" />
              </TouchableOpacity>
              <Text style={styles.header}>
                {selectedProject?.name || '프로젝트를 선택하세요'}
              </Text>
            </View>
            <View style={styles.mainContent}>
              {selectedProject && (
                <TodoView
                  todos={sortedTodos}
                  projects={projects}
                  selectedProjectId={selectedProjectId}
                  onAddTodo={(text, dateInfo) => addTodo(text, dateInfo, selectedProjectId)}
                  onToggleTodo={(todoId) => toggleTodo(todoId, selectedProjectId)}
                  onDeleteTodo={(todoId) => deleteTodo(todoId, selectedProjectId)}
                />
              )}
            </View>
          </View>
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  main: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebarContainer: {
    width: 280,
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
  },
  menuButton: {
    marginRight: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
  },
  mainContent: {
    flex: 1,
  },
});
