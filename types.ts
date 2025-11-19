export enum FilterType {
  ALL = 'ALL',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
}

export interface Todo {
  id: string;
  text: string;
  isCompleted: boolean;
  dueDate: string; // ISO Date string (YYYY-MM-DD)
  createdAt: number;
  subtasks?: string[]; // For AI generated breakdown
}
