export interface Routine {
  id: string;
  name: string;
}

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  routineId: string;
}
