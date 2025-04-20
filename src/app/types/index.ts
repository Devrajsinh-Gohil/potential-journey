export interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: string | null;
  assignee: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  id: string;
  title: string;
  taskIds: string[];
}

export interface Board {
  tasks: Record<string, Task>;
  columns: Record<string, Column>;
  columnOrder: string[];
} 