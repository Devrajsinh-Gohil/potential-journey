import { useState, useEffect } from 'react';
import { Board, Task } from '../types';
import { getInitialData, saveBoardToLocalStorage, loadBoardFromLocalStorage, createTask } from '../utils';

export const useBoard = () => {
  // Use null as initial state to avoid hydration mismatch
  const [board, setBoard] = useState<Board | null>(null);
  
  // Separate useEffect to initialize board data after hydration
  useEffect(() => {
    // Only run on client side
    const savedBoard = loadBoardFromLocalStorage();
    setBoard(savedBoard || getInitialData());
  }, []);
  
  useEffect(() => {
    // Only save to localStorage when board changes and is not null
    if (board) {
      saveBoardToLocalStorage(board);
    }
  }, [board]);

  // If board is null (during SSR or initial render), return a loading state
  if (!board) {
    return {
      board: getInitialData(),
      addTask: () => '',
      updateTask: () => {},
      deleteTask: () => {},
      moveTask: () => {},
      addColumn: () => {},
      deleteColumn: () => {},
      isLoading: true
    };
  }

  const addTask = (
    title: string,
    description: string,
    status: Task['status'],
    priority: Task['priority'],
    dueDate?: string,
    assignee?: string
  ) => {
    const newTask = createTask(title, description, status, priority, dueDate, assignee);
    
    setBoard(prevBoard => {
      if (!prevBoard) return null;
      
      const newBoard = {
        ...prevBoard,
        tasks: {
          ...prevBoard.tasks,
          [newTask.id]: newTask,
        },
        columns: {
          ...prevBoard.columns,
          [status]: {
            ...prevBoard.columns[status],
            taskIds: [...prevBoard.columns[status].taskIds, newTask.id],
          },
        },
      };
      
      return newBoard;
    });
    
    return newTask.id;
  };

  const updateTask = (
    taskId: string,
    updates: Partial<Omit<Task, 'id' | 'createdAt'>>
  ) => {
    setBoard(prevBoard => {
      if (!prevBoard || !prevBoard.tasks[taskId]) return prevBoard;
      
      const updatedTask = {
        ...prevBoard.tasks[taskId],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      
      // If status has changed, we need to move the task between columns
      if (updates.status && updates.status !== prevBoard.tasks[taskId].status) {
        const oldStatus = prevBoard.tasks[taskId].status;
        const newStatus = updates.status;
        
        const sourceColumn = prevBoard.columns[oldStatus];
        const destinationColumn = prevBoard.columns[newStatus];
        
        const newSourceTaskIds = sourceColumn.taskIds.filter(id => id !== taskId);
        const newDestinationTaskIds = [...destinationColumn.taskIds, taskId];
        
        return {
          ...prevBoard,
          tasks: {
            ...prevBoard.tasks,
            [taskId]: updatedTask,
          },
          columns: {
            ...prevBoard.columns,
            [oldStatus]: {
              ...sourceColumn,
              taskIds: newSourceTaskIds,
            },
            [newStatus]: {
              ...destinationColumn,
              taskIds: newDestinationTaskIds,
            },
          },
        };
      }
      
      return {
        ...prevBoard,
        tasks: {
          ...prevBoard.tasks,
          [taskId]: updatedTask,
        },
      };
    });
  };

  const deleteTask = (taskId: string) => {
    setBoard(prevBoard => {
      if (!prevBoard || !prevBoard.tasks[taskId]) return prevBoard;
      
      const status = prevBoard.tasks[taskId].status;
      const column = prevBoard.columns[status];
      const newTaskIds = column.taskIds.filter(id => id !== taskId);
      
      const newTasks = { ...prevBoard.tasks };
      delete newTasks[taskId];
      
      return {
        ...prevBoard,
        tasks: newTasks,
        columns: {
          ...prevBoard.columns,
          [status]: {
            ...column,
            taskIds: newTaskIds,
          },
        },
      };
    });
  };

  const moveTask = (
    taskId: string,
    sourceColumnId: string,
    destinationColumnId: string,
    sourceIndex: number,
    destinationIndex: number
  ) => {
    setBoard(prevBoard => {
      if (!prevBoard) return prevBoard;
      
      const sourceColumn = prevBoard.columns[sourceColumnId];
      const destinationColumn = prevBoard.columns[destinationColumnId];
      
      // Same column reordering
      if (sourceColumnId === destinationColumnId) {
        const newTaskIds = [...sourceColumn.taskIds];
        const [removed] = newTaskIds.splice(sourceIndex, 1);
        newTaskIds.splice(destinationIndex, 0, removed);
        
        return {
          ...prevBoard,
          columns: {
            ...prevBoard.columns,
            [sourceColumnId]: {
              ...sourceColumn,
              taskIds: newTaskIds,
            },
          },
        };
      }
      
      // Moving between columns
      const sourceTaskIds = [...sourceColumn.taskIds];
      const destinationTaskIds = [...destinationColumn.taskIds];
      const [removed] = sourceTaskIds.splice(sourceIndex, 1);
      destinationTaskIds.splice(destinationIndex, 0, removed);
      
      // Update task status to match new column
      const updatedTask = {
        ...prevBoard.tasks[taskId],
        status: destinationColumnId as Task['status'],
        updatedAt: new Date().toISOString(),
      };
      
      return {
        ...prevBoard,
        tasks: {
          ...prevBoard.tasks,
          [taskId]: updatedTask,
        },
        columns: {
          ...prevBoard.columns,
          [sourceColumnId]: {
            ...sourceColumn,
            taskIds: sourceTaskIds,
          },
          [destinationColumnId]: {
            ...destinationColumn,
            taskIds: destinationTaskIds,
          },
        },
      };
    });
  };

  const addColumn = (title: string) => {
    const columnId = title.toLowerCase().replace(/\s+/g, '-');
    
    // Check if column already exists
    if (board.columns[columnId]) {
      // Return false to indicate column already exists
      return false;
    }
    
    setBoard(prevBoard => {
      if (!prevBoard) return null;
      
      return {
        ...prevBoard,
        columns: {
          ...prevBoard.columns,
          [columnId]: {
            id: columnId,
            title: title,
            taskIds: [],
          },
        },
        columnOrder: [...prevBoard.columnOrder, columnId],
      };
    });
    
    // Return true to indicate success
    return true;
  };

  const deleteColumn = (columnId: string, targetColumnId?: string) => {
    setBoard(prevBoard => {
      if (!prevBoard || !prevBoard.columns[columnId]) return prevBoard;
      
      // Get the tasks in the column that will be deleted
      const tasksInColumn = prevBoard.columns[columnId].taskIds;
      
      // Create a copy of the columns without the deleted column
      const newColumns = { ...prevBoard.columns };
      delete newColumns[columnId];
      
      // Create a copy of the columnOrder without the deleted column
      const newColumnOrder = prevBoard.columnOrder.filter(id => id !== columnId);
      
      // If there are no remaining columns, return the board without the deleted column
      if (newColumnOrder.length === 0) {
        return {
          ...prevBoard,
          columns: newColumns,
          columnOrder: newColumnOrder
        };
      }

      // Create a new tasks object
      const newTasks = { ...prevBoard.tasks };
      
      // If a target column is specified, move tasks to that column
      if (targetColumnId && prevBoard.columns[targetColumnId]) {
        // Update the target column to include tasks from the deleted column
        newColumns[targetColumnId] = {
          ...newColumns[targetColumnId],
          taskIds: [...newColumns[targetColumnId].taskIds, ...tasksInColumn]
        };
        
        // Update the status of moved tasks
        tasksInColumn.forEach(taskId => {
          newTasks[taskId] = {
            ...newTasks[taskId],
            status: targetColumnId,
            updatedAt: new Date().toISOString()
          };
        });
      } else if (tasksInColumn.length > 0) {
        // If no target column specified but there are tasks, 
        // move tasks to the first remaining column
        const firstColumnId = newColumnOrder[0];
        
        newColumns[firstColumnId] = {
          ...newColumns[firstColumnId],
          taskIds: [...newColumns[firstColumnId].taskIds, ...tasksInColumn]
        };
        
        // Update the status of moved tasks
        tasksInColumn.forEach(taskId => {
          newTasks[taskId] = {
            ...newTasks[taskId],
            status: firstColumnId,
            updatedAt: new Date().toISOString()
          };
        });
      }
      
      return {
        ...prevBoard,
        tasks: newTasks,
        columns: newColumns,
        columnOrder: newColumnOrder
      };
    });
    
    return true;
  };

  return {
    board,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    addColumn,
    deleteColumn,
    isLoading: false
  };
}; 