export interface Category {
  id: string;
  name: string;
}

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  categoryId: string;
}
