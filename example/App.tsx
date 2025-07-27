import React, { useState } from 'react';
import { Button } from './components/ui/button';
import { Menu } from 'lucide-react';
import { ProjectSidebar } from './components/ProjectSidebar';
import { TodoView } from './components/TodoView';
import { Sheet, SheetContent, SheetTrigger } from './components/ui/sheet';

interface Project {
  id: string;
  name: string;
  children: Project[];
  todos: Todo[];
}

interface DateRange {
  from?: Date;
  to?: Date;
}

interface RepeatSettings {
  type: 'weekly' | 'monthly' | 'yearly';
  startDate?: Date;
  endDate?: Date;
  weekdays?: number[];
}

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  dueDate?: Date;
  dateRange?: DateRange;
  repeatSettings?: RepeatSettings;
  projectId?: string;
}

const initialProjects: Project[] = [
  {
    id: '1',
    name: '개인 프로젝트',
    children: [
      { id: '1-1', name: '웹사이트 개발', children: [], todos: [] },
      { id: '1-2', name: '포트폴리오', children: [], todos: [] }
    ],
    todos: []
  },
  {
    id: '2',
    name: '회사 업무',
    children: [
      { id: '2-1', name: 'Q1 목표', children: [], todos: [] },
      { id: '2-2', name: '팀 미팅', children: [], todos: [] }
    ],
    todos: []
  }
];

export default function App() {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('1');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const findProject = (projects: Project[], id: string): Project | null => {
    for (const project of projects) {
      if (project.id === id) return project;
      const found = findProject(project.children, id);
      if (found) return found;
    }
    return null;
  };

  const updateProject = (projects: Project[], projectId: string, updater: (project: Project) => Project): Project[] => {
    return projects.map(project => {
      if (project.id === projectId) {
        return updater(project);
      }
      return {
        ...project,
        children: updateProject(project.children, projectId, updater)
      };
    });
  };

  const selectedProject = findProject(projects, selectedProjectId);

  const addTodo = (text: string, dueDate?: Date, dateRange?: DateRange, repeatSettings?: RepeatSettings, targetProjectId?: string) => {
    const projectIdToUse = targetProjectId || selectedProjectId;
    
    const newTodo: Todo = {
      id: Date.now().toString(),
      text,
      completed: false,
      createdAt: new Date(),
      dueDate: dueDate,
      dateRange: dateRange,
      repeatSettings: repeatSettings,
      projectId: targetProjectId ? targetProjectId : undefined
    };

    setProjects(prev => updateProject(prev, projectIdToUse, project => ({
      ...project,
      todos: [...project.todos, newTodo]
    })));
  };

  const toggleTodo = (todoId: string) => {
    setProjects(prev => updateProject(prev, selectedProjectId, project => ({
      ...project,
      todos: project.todos.map(todo =>
        todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
      )
    })));
  };

  const deleteTodo = (todoId: string) => {
    setProjects(prev => updateProject(prev, selectedProjectId, project => ({
      ...project,
      todos: project.todos.filter(todo => todo.id !== todoId)
    })));
  };

  const addProject = (name: string, parentId?: string) => {
    const newProject: Project = {
      id: Date.now().toString(),
      name,
      children: [],
      todos: []
    };

    if (parentId) {
      setProjects(prev => updateProject(prev, parentId, parent => ({
        ...parent,
        children: [...parent.children, newProject]
      })));
    } else {
      setProjects(prev => [...prev, newProject]);
    }
  };

  const deleteProject = (projectId: string) => {
    const removeFromProjects = (projects: Project[]): Project[] => {
      return projects.filter(p => p.id !== projectId).map(p => ({
        ...p,
        children: removeFromProjects(p.children)
      }));
    };
    
    setProjects(prev => removeFromProjects(prev));
    if (selectedProjectId === projectId) {
      setSelectedProjectId(projects[0]?.id || '');
    }
  };

  const SidebarContent = () => (
    <ProjectSidebar
      projects={projects}
      selectedProjectId={selectedProjectId}
      onSelectProject={setSelectedProjectId}
      onAddProject={addProject}
      onDeleteProject={deleteProject}
    />
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Layout */}
      <div className="hidden md:flex">
        <div className="w-80 border-r bg-white">
          <SidebarContent />
        </div>
        <div className="flex-1">
          <div className="p-6 pb-20">
            <div className="flex items-center gap-3 mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                {selectedProject?.name || '프로젝트를 선택하세요'}
              </h1>
            </div>
            {selectedProject && (
              <TodoView
                todos={selectedProject.todos}
                currentProjectId={selectedProjectId}
                allProjects={projects}
                onAddTodo={addTodo}
                onToggleTodo={toggleTodo}
                onDeleteTodo={deleteTodo}
              />
            )}
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
        <div className="bg-white border-b px-4 py-3 flex items-center gap-3">
          <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <SidebarContent />
            </SheetContent>
          </Sheet>
          <h1 className="font-semibold text-gray-900">
            {selectedProject?.name || '프로젝트를 선택하세요'}
          </h1>
        </div>
        <div className="p-4 pb-20">
          {selectedProject && (
            <TodoView
              todos={selectedProject.todos}
              currentProjectId={selectedProjectId}
              allProjects={projects}
              onAddTodo={addTodo}
              onToggleTodo={toggleTodo}
              onDeleteTodo={deleteTodo}
            />
          )}
        </div>
      </div>
    </div>
  );
}