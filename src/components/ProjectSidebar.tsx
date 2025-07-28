import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Button,
  ScrollView
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

// 데이터 타입 (App.tsx와 동일하게 유지)
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
  toggleSidebar: () => void;
}

export function ProjectSidebar({
  projects,
  selectedProjectId,
  onSelectProject,
  onAddProject,
  onDeleteProject,
  toggleSidebar,
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
      <View>
        <TouchableOpacity
          style={[
            styles.projectItemContainer,
            isSelected && styles.selectedProject,
            { paddingLeft: 12 + level * 16 }
          ]}
          onPress={() => onSelectProject(project.id)}
        >
          <View style={styles.projectRow}>
            {hasChildren ? (
              <TouchableOpacity onPress={(e) => { e.stopPropagation(); toggleExpand(project.id); }}>
                <Icon name={isExpanded ? 'chevron-down' : 'chevron-right'} size={16} color="#6B7280" />
              </TouchableOpacity>
            ) : (
              <View style={{ width: 16 }} />
            )}
            
            <Icon name={hasChildren && isExpanded ? 'folder-minus' : 'folder'} size={16} color="#6B7280" style={{ marginLeft: 8 }} />
            
            <Text style={[styles.projectName, isSelected && styles.selectedProjectName]} numberOfLines={1}>
              {project.name}
            </Text>
            
            {totalTodos > 0 && (
              <Text style={styles.todoCount}>
                {completedTodos}/{totalTodos}
              </Text>
            )}
          </View>
          <View style={styles.projectActions}>
             <TouchableOpacity onPress={(e) => { e.stopPropagation(); setIsAddingProject(project.id); }}>
                <Icon name="plus" size={16} color="#6B7280" />
            </TouchableOpacity>
            <TouchableOpacity style={{marginLeft: 15}} onPress={(e) => { e.stopPropagation(); onDeleteProject(project.id); }}>
                <Icon name="trash-2" size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        {isAddingProject === project.id && (
          <View style={[styles.addProjectInputContainer, { paddingLeft: 28 + level * 16 }]}>
            <TextInput
              value={newProjectName}
              onChangeText={setNewProjectName}
              placeholder="프로젝트 이름"
              style={styles.input}
              onSubmitEditing={() => handleAddProject(project.id)}
              autoFocus
            />
            <Button title="추가" onPress={() => handleAddProject(project.id)} />
          </View>
        )}

        {hasChildren && isExpanded && (
          <View>
            {project.children.map((child) => (
              <ProjectItem key={child.id} project={child} level={level + 1} />
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>프로젝트</Text>
        <View style={{flexDirection: 'row'}}>
          <TouchableOpacity onPress={() => setIsAddingProject('root')}>
            <Icon name="plus" size={20} color="#111827" />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleSidebar} style={{marginLeft: 15}}>
            <Icon name="x" size={20} color="#111827" />
          </TouchableOpacity>
        </View>
      </View>

      {isAddingProject === 'root' && (
        <View style={styles.addProjectInputContainer}>
          <TextInput
            value={newProjectName}
            onChangeText={setNewProjectName}
            placeholder="새 프로젝트 이름"
            style={styles.input}
            onSubmitEditing={() => handleAddProject()}
            autoFocus
          />
          <Button title="추가" onPress={() => handleAddProject()} />
        </View>
      )}
      
      <ScrollView>
        {projects.map((project) => (
          <ProjectItem key={project.id} project={project} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  projectItemContainer: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRightWidth: 2,
    borderRightColor: 'transparent',
  },
  selectedProject: {
    backgroundColor: '#EFF6FF',
    borderRightColor: '#3B82F6',
  },
  projectRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  projectName: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#374151',
  },
  selectedProjectName: {
      color: '#1D4ED8',
  },
  todoCount: {
    fontSize: 12,
    color: '#6B7280',
    marginHorizontal: 8,
  },
  projectActions: {
    position: 'absolute',
    right: 12,
    top: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addProjectInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginRight: 8,
    fontSize: 14,
  },
});
