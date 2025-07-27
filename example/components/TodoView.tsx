import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { Card } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Plus, Trash2, CheckCircle2, Circle, Calendar as CalendarIcon, Folder } from 'lucide-react';
import { DatePickerSheet } from './DatePickerSheet';

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

interface Project {
  id: string;
  name: string;
  children: Project[];
  todos: Todo[];
}

interface TodoViewProps {
  todos: Todo[];
  currentProjectId: string;
  allProjects: Project[];
  onAddTodo: (text: string, dueDate?: Date, dateRange?: DateRange, repeatSettings?: RepeatSettings, projectId?: string) => void;
  onToggleTodo: (todoId: string) => void;
  onDeleteTodo: (todoId: string) => void;
}

export function TodoView({ todos, currentProjectId, allProjects, onAddTodo, onToggleTodo, onDeleteTodo }: TodoViewProps) {
  const [newTodoText, setNewTodoText] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange | undefined>(undefined);
  const [selectedRepeatSettings, setSelectedRepeatSettings] = useState<RepeatSettings | undefined>(undefined);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(currentProjectId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const handleAddTodo = () => {
    if (newTodoText.trim()) {
      onAddTodo(
        newTodoText.trim(), 
        selectedDate, 
        selectedDateRange,
        selectedRepeatSettings,
        selectedProjectId !== currentProjectId ? selectedProjectId : undefined
      );
      resetForm();
    }
  };

  const resetForm = () => {
    setNewTodoText('');
    setSelectedDate(undefined);
    setSelectedDateRange(undefined);
    setSelectedRepeatSettings(undefined);
    setSelectedProjectId(currentProjectId);
    setIsDialogOpen(false);
  };

  const handleDateSelect = (date?: Date, range?: DateRange, repeat?: RepeatSettings) => {
    setSelectedDate(date);
    setSelectedDateRange(range);
    setSelectedRepeatSettings(repeat);
  };

  const getDateDisplayText = () => {
    if (selectedRepeatSettings) {
      const typeMap = { weekly: '매주', monthly: '매월', yearly: '매년' };
      return `${typeMap[selectedRepeatSettings.type]} 반복`;
    }
    if (selectedDateRange?.from) {
      if (selectedDateRange.to) {
        return `${selectedDateRange.from.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })} - ${selectedDateRange.to.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}`;
      }
      return `${selectedDateRange.from.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })} -`;
    }
    if (selectedDate) {
      return selectedDate.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
    }
    return 'No Date';
  };

  const getAllProjectOptions = (projects: Project[], level = 0): Array<{id: string, name: string, level: number}> => {
    let options: Array<{id: string, name: string, level: number}> = [];
    
    projects.forEach(project => {
      options.push({
        id: project.id,
        name: project.name,
        level: level
      });
      
      if (project.children.length > 0) {
        options = [...options, ...getAllProjectOptions(project.children, level + 1)];
      }
    });
    
    return options;
  };

  const projectOptions = getAllProjectOptions(allProjects);
  const currentProject = allProjects.find(p => findProjectById(p, currentProjectId));
  
  function findProjectById(project: Project, id: string): Project | null {
    if (project.id === id) return project;
    for (const child of project.children) {
      const found = findProjectById(child, id);
      if (found) return found;
    }
    return null;
  }

  const completedTodos = todos.filter(todo => todo.completed);
  const incompleteTodos = todos.filter(todo => !todo.completed);

  return (
    <div className="max-w-2xl mx-auto relative">
      {/* Floating Action Button */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            size="icon"
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow z-50"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>새로운 할 일 추가</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={newTodoText}
              onChange={(e) => setNewTodoText(e.target.value)}
              placeholder="할 일을 입력하세요..."
              className="w-full"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddTodo();
                } else if (e.key === 'Escape') {
                  resetForm();
                }
              }}
              autoFocus
            />
            
            {/* 옵션 버튼들 */}
            <div className="flex gap-2">
              {/* 날짜 선택 버튼 */}
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                onClick={() => setIsDatePickerOpen(true)}
              >
                <CalendarIcon className="h-4 w-4" />
                {getDateDisplayText()}
              </Button>

              {/* 프로젝트 선택 버튼 */}
              <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                <SelectTrigger className="w-auto min-w-[120px] h-9">
                  <div className="flex items-center gap-2">
                    <Folder className="h-4 w-4 text-gray-500" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {projectOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      <div className="flex items-center" style={{ paddingLeft: `${option.level * 12}px` }}>
                        {option.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2 justify-end pt-2">
              <Button
                variant="outline"
                onClick={resetForm}
              >
                취소
              </Button>
              <Button 
                onClick={handleAddTodo}
                disabled={!newTodoText.trim()}
              >
                추가
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 날짜 선택 바텀시트 */}
      <DatePickerSheet
        open={isDatePickerOpen}
        onOpenChange={setIsDatePickerOpen}
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
      />

      {/* Stats */}
      {todos.length > 0 && (
        <div className="mb-6 flex gap-4 text-sm text-gray-600">
          <span>전체: {todos.length}개</span>
          <span>완료: {completedTodos.length}개</span>
          <span>남은 할 일: {incompleteTodos.length}개</span>
        </div>
      )}

      {/* Todo Lists */}
      <div className="space-y-6">
        {/* Incomplete Todos */}
        {incompleteTodos.length > 0 && (
          <div>
            <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Circle className="h-4 w-4" />
              할 일 ({incompleteTodos.length})
            </h3>
            <div className="space-y-2">
              {incompleteTodos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={onToggleTodo}
                  onDelete={onDeleteTodo}
                />
              ))}
            </div>
          </div>
        )}

        {/* Completed Todos */}
        {completedTodos.length > 0 && (
          <div>
            <h3 className="font-medium text-gray-500 mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              완료된 항목 ({completedTodos.length})
            </h3>
            <div className="space-y-2">
              {completedTodos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={onToggleTodo}
                  onDelete={onDeleteTodo}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {todos.length === 0 && (
        <div className="text-center py-12">
          <Circle className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="font-medium text-gray-900 mb-2">아직 할 일이 없습니다</h3>
          <p className="text-gray-500 text-sm">오른쪽 아래 + 버튼을 눌러 새로운 할 일을 추가해보세요.</p>
        </div>
      )}
    </div>
  );
}

function TodoItem({ 
  todo, 
  onToggle, 
  onDelete 
}: { 
  todo: Todo; 
  onToggle: (id: string) => void; 
  onDelete: (id: string) => void; 
}) {
  return (
    <Card className={`p-3 hover:shadow-sm transition-shadow group ${
      todo.completed ? 'bg-gray-50' : 'bg-white'
    }`}>
      <div className="flex items-center gap-3">
        <Checkbox
          checked={todo.completed}
          onCheckedChange={() => onToggle(todo.id)}
          className="mt-0.5"
        />
        <span className={`flex-1 ${
          todo.completed 
            ? 'text-gray-500 line-through' 
            : 'text-gray-900'
        }`}>
          {todo.text}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-600"
          onClick={() => onDelete(todo.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="text-xs text-gray-400 mt-2 ml-6 flex items-center gap-2">
        <span>
          {todo.createdAt.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
        {todo.dueDate && (
          <span className="flex items-center gap-1 text-blue-600">
            <CalendarIcon className="h-3 w-3" />
            {todo.dueDate.toLocaleDateString('ko-KR', {
              month: 'short',
              day: 'numeric'
            })}
          </span>
        )}
        {todo.dateRange?.from && (
          <span className="flex items-center gap-1 text-green-600">
            <CalendarIcon className="h-3 w-3" />
            {todo.dateRange.from.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
            {todo.dateRange.to && ` - ${todo.dateRange.to.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}`}
          </span>
        )}
        {todo.repeatSettings && (
          <span className="flex items-center gap-1 text-purple-600">
            <CalendarIcon className="h-3 w-3" />
            {todo.repeatSettings.type === 'weekly' && '매주'}
            {todo.repeatSettings.type === 'monthly' && '매월'}
            {todo.repeatSettings.type === 'yearly' && '매년'}
          </span>
        )}
      </div>
    </Card>
  );
}