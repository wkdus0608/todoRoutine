export interface Routine {
  id: string;
  name: string;
}

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  routineId?: string; // Optional: ID of the routine this todo belongs to
  parentId?: string; // Optional: ID of the parent todo if this is a sub-todo
  subTodos?: Todo[]; // Optional: Array of sub-todos
}
