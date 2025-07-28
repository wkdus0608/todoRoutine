export interface Routine {
  id: string;
  name: string;
  children?: Routine[];
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface RepeatSettings {
  frequency: 'weekly' | 'monthly' | 'yearly';
  startDate: string; // Start date is essential for all repeats
  endDate?: string; // Optional end date
  weekdays?: { // For weekly repeats
    sunday: boolean;
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
  };
}

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  routineId?: string;
  parentId?: string;
  subTodos?: Todo[];
  
  // Date and Time related properties
  dueDate?: string;
  dateRange?: DateRange;
  repeatSettings?: RepeatSettings;
}
