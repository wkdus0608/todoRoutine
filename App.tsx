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
import { ProjectSidebar } from './src/components/ProjectSidebar';
import { TodoView } from './src/components/TodoView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Routine as Project, Todo, DateRange, RepeatSettings } from './src/types';

// 초기 데이터
const initialProjects: Project[] = [
  {
    id: '1',
    name: '개인 프로젝트',
    children: [
        { id: '1-1', name: '웹사이트 개발', children: [], todos: [] },
        { id: '1-2', name: '포트폴리오', children: [], todos: [] }
    ],
    todos: [
      { id: 't-1', text: '기획서 작성', completed: true, createdAt: new Date(), priority: 'urgent_important' },
      { id: 't-2', text: '디자인 시안', completed: false, createdAt: new Date(), priority: 'not_urgent_important' },
    ],
  },
  {
    id: '2',
    name: '회사 업무',
    children: [],
    todos: [],
  },
];

const priorityOrder: { [key in NonNullable<Todo['priority']>]: number } = {
  urgent_important: 1,
  not_urgent_important: 2,
  urgent_not_important: 3,
  not_urgent_not_important: 4,
};

const sortTodos = (todos: Todo[]): Todo[] => {
  return todos.sort((a, b) => {
    const priorityA = a.priority ? priorityOrder[a.priority] : 5;
    const priorityB = b.priority ? priorityOrder[b.priority] : 5;
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    return a.createdAt.getTime() - b.createdAt.getTime();
  });
};


export default function App() {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
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

  const updateProject = (
    projects: Project[],
    projectId: string,
    updater: (project: Project) => Project,
  ): Project[] => {
    return projects.map(project => {
      if (project.id === projectId) {
        return updater(project);
      }
      if (project.children) {
        return {
          ...project,
          children: updateProject(project.children, projectId, updater),
        };
      }
      return project;
    });
  };

  const selectedProject = findProject(projects, selectedProjectId);

  const addTodo = (
    text: string,
    dateInfo: {
      dueDate?: string;
      dateRange?: DateRange;
      repeatSettings?: RepeatSettings;
    },
    priority: Todo['priority'],
    projectId?: string,
  ) => {
    const projectIdToUse = projectId || selectedProjectId;

    const newTodo: Todo = {
      id: Date.now().toString(),
      text,
      completed: false,
      createdAt: new Date(),
      routineId: projectIdToUse,
      dueDate: dateInfo.dueDate,
      dateRange: dateInfo.dateRange,
      repeatSettings: dateInfo.repeatSettings,
      priority,
    };

    console.log("Adding new todo:", newTodo); // For debugging

    setProjects(prev =>
      updateProject(prev, projectIdToUse, project => ({
        ...project,
        todos: [...project.todos, newTodo],
      })),
    );
  };

  const toggleTodo = (todoId: string) => {
    setProjects(prev =>
      updateProject(prev, selectedProjectId, project => ({
        ...project,
        todos: project.todos.map(todo =>
          todo.id === todoId ? { ...todo, completed: !todo.completed } : todo,
        ),
      })),
    );
  };

  const deleteTodo = (todoId: string) => {
    setProjects(prev =>
      updateProject(prev, selectedProjectId, project => ({
        ...project,
        todos: project.todos.filter(todo => todo.id !== todoId),
      })),
    );
  };

  const addProject = (name: string, parentId?: string) => {
    const newProject: Project = {
      id: Date.now().toString(),
      name,
      children: [],
      todos: [],
    };

    if (parentId) {
      setProjects(prev =>
        updateProject(prev, parentId, parent => ({
          ...parent,
          children: [...parent.children, newProject],
        })),
      );
    } else {
      setProjects(prev => [...prev, newProject]);
    }
  };

  const deleteProject = (projectId: string) => {
    const removeFromProjects = (projects: Project[]): Project[] => {
      return projects
        .filter(p => p.id !== projectId)
        .map(p => ({
          ...p,
          children: removeFromProjects(p.children || []),
        }));
    };

    setProjects(prev => removeFromProjects(prev));
    if (selectedProjectId === projectId) {
      setSelectedProjectId(projects[0]?.id || '');
    }
  };
  
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
                  onAddTodo={addTodo}
                  onToggleTodo={toggleTodo}
                  onDeleteTodo={deleteTodo}
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

