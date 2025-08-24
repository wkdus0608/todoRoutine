import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ProjectScreen from './src/screens/ProjectScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import { Routine as Project, Todo, DateRange, RepeatSettings } from './src/types';
import { loadRoutines, saveRoutines } from './src/storage/dataManager';

const Tab = createBottomTabNavigator();

const initialProjects: Project[] = [
  {
    id: '1',
    name: '개인 프로젝트',
    children: [
        { id: '1-1', name: '웹사이트 개발', children: [], todos: [] },
        { id: '1-2', name: '포트폴리오', children: [], todos: [] }
    ],
    todos: [
      { id: 't-1', text: '기획서 작성', completed: true, createdAt: new Date(), dueDate: '2025-08-20' },
      { id: 't-2', text: '디자인 시안', completed: false, createdAt: new Date(), dueDate: '2025-08-25' },
    ],
  },
  {
    id: '2',
    name: '회사 업무',
    children: [],
    todos: [],
  },
];

const hydrateProject = (project: any): Project => {
  return {
    ...project,
    children: project.children ? project.children.map(hydrateProject) : [],
    todos: project.todos ? project.todos.map(todo => ({
        ...todo,
        createdAt: new Date(todo.createdAt)
    })) : [],
  };
};


export default function App() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const bootstrapAsync = async () => {
      const savedProjects = await loadRoutines();
      if (savedProjects && savedProjects.length > 0) {
        setProjects(savedProjects.map(hydrateProject));
      } else {
        setProjects(initialProjects);
      }
    };

    bootstrapAsync();
  }, []);

  useEffect(() => {
    if (projects && projects.length > 0) {
        saveRoutines(projects);
    }
  }, [projects]);

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

  const addTodo = (
    text: string,
    dateInfo: {
      dueDate?: string;
      dateRange?: DateRange;
      repeatSettings?: RepeatSettings;
    },
    projectId: string,
  ) => {
    const newTodo: Todo = {
      id: Date.now().toString(),
      text,
      completed: false,
      createdAt: new Date(),
      routineId: projectId,
      ...dateInfo,
    };

    setProjects(prev =>
      updateProject(prev, projectId, project => ({
        ...project,
        todos: [...(project.todos || []), newTodo],
      })),
    );
  };

  const toggleTodo = (todoId: string, projectId: string) => {
    setProjects(prev =>
      updateProject(prev, projectId, project => ({
        ...project,
        todos: project.todos.map(todo =>
          todo.id === todoId ? { ...todo, completed: !todo.completed } : todo,
        ),
      })),
    );
  };

  const deleteTodo = (todoId: string, projectId: string) => {
    setProjects(prev =>
      updateProject(prev, projectId, project => ({
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
          children: [...(parent.children || []), newProject],
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
  };

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === '프로젝트') {
              iconName = focused ? 'folder' : 'folder-open';
            } else if (route.name === '캘린더') {
              iconName = focused ? 'calendar-today' : 'calendar-today';
            }

            return <Icon name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#4F8EF7',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        <Tab.Screen name="프로젝트">
          {props => (
            <ProjectScreen
              {...props}
              projects={projects}
              addTodo={addTodo}
              toggleTodo={toggleTodo}
              deleteTodo={deleteTodo}
              addProject={addProject}
              deleteProject={deleteProject}
            />
          )}
        </Tab.Screen>
        <Tab.Screen name="캘린더">
          {props => <CalendarScreen {...props} projects={projects} />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}

