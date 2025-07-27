import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { 
  Plus, 
  Folder, 
  FolderOpen, 
  Trash2, 
  ChevronRight, 
  ChevronDown 
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  children: Project[];
  todos: Todo[];
}

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

interface ProjectSidebarProps {
  projects: Project[];
  selectedProjectId: string;
  onSelectProject: (id: string) => void;
  onAddProject: (name: string, parentId?: string) => void;
  onDeleteProject: (id: string) => void;
}

export function ProjectSidebar({
  projects,
  selectedProjectId,
  onSelectProject,
  onAddProject,
  onDeleteProject
}: ProjectSidebarProps) {
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set(['1', '2']));
  const [isAddingProject, setIsAddingProject] = useState<string | null>(null);
  const [newProjectName, setNewProjectName] = useState('');

  const toggleExpand = (projectId: string) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
    }
    setExpandedProjects(newExpanded);
  };

  const handleAddProject = (parentId?: string) => {
    if (newProjectName.trim()) {
      onAddProject(newProjectName.trim(), parentId);
      setNewProjectName('');
      setIsAddingProject(null);
    }
  };

  const ProjectItem = ({ project, level = 0 }: { project: Project; level?: number }) => {
    const hasChildren = project.children.length > 0;
    const isExpanded = expandedProjects.has(project.id);
    const isSelected = selectedProjectId === project.id;
    const completedTodos = project.todos.filter(t => t.completed).length;
    const totalTodos = project.todos.length;

    return (
      <div>
        <div 
          className={`
            flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 group
            ${isSelected ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' : 'text-gray-700'}
          `}
          style={{ paddingLeft: `${12 + level * 16}px` }}
          onClick={() => onSelectProject(project.id)}
        >
          {hasChildren ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 p-0 hover:bg-gray-200"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(project.id);
              }}
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </Button>
          ) : (
            <div className="w-4" />
          )}
          
          {hasChildren ? (
            isExpanded ? <FolderOpen className="h-4 w-4" /> : <Folder className="h-4 w-4" />
          ) : (
            <Folder className="h-4 w-4" />
          )}
          
          <span className="flex-1 truncate">{project.name}</span>
          
          {totalTodos > 0 && (
            <span className="text-xs text-gray-500">
              {completedTodos}/{totalTodos}
            </span>
          )}
          
          <div className="opacity-0 group-hover:opacity-100 flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 p-0 hover:bg-gray-200"
              onClick={(e) => {
                e.stopPropagation();
                setIsAddingProject(project.id);
              }}
            >
              <Plus className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteProject(project.id);
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {isAddingProject === project.id && (
          <div className="px-3 py-2" style={{ paddingLeft: `${28 + level * 16}px` }}>
            <div className="flex gap-2">
              <Input
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="프로젝트 이름"
                className="h-7 text-xs"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddProject(project.id);
                  } else if (e.key === 'Escape') {
                    setIsAddingProject(null);
                    setNewProjectName('');
                  }
                }}
                autoFocus
              />
              <Button
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => handleAddProject(project.id)}
              >
                추가
              </Button>
            </div>
          </div>
        )}

        {hasChildren && isExpanded && (
          <div>
            {project.children.map((child) => (
              <ProjectItem key={child.id} project={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b bg-white">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">프로젝트</h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsAddingProject('root')}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {isAddingProject === 'root' && (
          <div className="flex gap-2">
            <Input
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="새 프로젝트 이름"
              className="h-8 text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddProject();
                } else if (e.key === 'Escape') {
                  setIsAddingProject(null);
                  setNewProjectName('');
                }
              }}
              autoFocus
            />
            <Button
              size="sm"
              className="h-8 px-3 text-sm"
              onClick={() => handleAddProject()}
            >
              추가
            </Button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {projects.map((project) => (
          <ProjectItem key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}