import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { Board, Task } from '../types';
import { safeLocalStorage } from './client-utils';

export const generateId = (): string => uuidv4();

export const getFormattedDate = (date?: Date): string => {
  return date ? format(date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
};

export const createTask = (
  title: string, 
  description: string, 
  status: Task['status'], 
  priority: Task['priority'], 
  dueDate?: string,
  assignee?: string
): Task => {
  const now = getFormattedDate();
  
  return {
    id: generateId(),
    title,
    description,
    status,
    priority,
    dueDate: dueDate || null,
    assignee: assignee || null,
    createdAt: now,
    updatedAt: now,
  };
};

export const getInitialData = (): Board => {
  const task1 = createTask(
    'Design login page',
    'Create a modern minimalist login page with social logins',
    'todo',
    'high',
    getFormattedDate(new Date(Date.now() + 86400000 * 3)), // 3 days from now
    'Sarah Jones'
  );

  const task2 = createTask(
    'Implement authentication',
    'Set up JWT authentication flow',
    'in-progress',
    'medium',
    getFormattedDate(new Date(Date.now() + 86400000 * 5)), // 5 days from now
    'Mike Smith'
  );

  const task3 = createTask(
    'Create dashboard layout',
    'Design responsive dashboard with sidebar navigation',
    'done',
    'low',
    getFormattedDate(new Date(Date.now() - 86400000 * 2)), // 2 days ago
    'Alex Johnson'
  );

  return {
    tasks: {
      [task1.id]: task1,
      [task2.id]: task2,
      [task3.id]: task3,
    },
    columns: {
      'todo': {
        id: 'todo',
        title: 'To Do',
        taskIds: [task1.id],
      },
      'in-progress': {
        id: 'in-progress',
        title: 'In Progress',
        taskIds: [task2.id],
      },
      'done': {
        id: 'done',
        title: 'Done',
        taskIds: [task3.id],
      },
    },
    columnOrder: ['todo', 'in-progress', 'done'],
  };
};

// Function to save board data to localStorage
export const saveBoardToLocalStorage = (board: Board): void => {
  safeLocalStorage.setItem('kanban-board', JSON.stringify(board));
};

// Function to load board data from localStorage
export const loadBoardFromLocalStorage = (): Board | null => {
  const savedBoard = safeLocalStorage.getItem('kanban-board');
  return savedBoard ? JSON.parse(savedBoard) : null;
}; 