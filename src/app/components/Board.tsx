'use client';

import { useState } from 'react';
import { 
  DndContext, 
  DragEndEvent, 
  DragOverEvent, 
  DragStartEvent, 
  PointerSensor, 
  useSensor, 
  useSensors,
  closestCenter,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import { 
  arrayMove,
  SortableContext,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Task } from '../types';
import { useBoard } from '../hooks/useBoard';
import { Column } from './Column';
import { TaskForm } from './TaskForm';
import { FiPlus, FiFilter, FiChevronDown, FiHelpCircle, FiChevronRight, FiChevronLeft, FiColumns, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { TaskCard } from './TaskCard';
import { useToast } from './ui/Toast';
import { KeyboardShortcuts } from './ui/KeyboardShortcuts';
import { KeyboardShortcutsHelp } from './ui/KeyboardShortcutsHelp';

const dropAnimationConfig = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.5',
      },
    },
  }),
};

export function Board() {
  const { board, addTask, updateTask, deleteTask, moveTask, addColumn, deleteColumn, isLoading } = useBoard();
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [initialStatus, setInitialStatus] = useState<Task['status']>('todo');
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [activeDraggedTask, setActiveDraggedTask] = useState<Task | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isColumnFormOpen, setIsColumnFormOpen] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [isDeleteColumnConfirmOpen, setIsDeleteColumnConfirmOpen] = useState(false);
  const [deletingColumnId, setDeletingColumnId] = useState<string | null>(null);
  const [targetColumnId, setTargetColumnId] = useState<string>('');
  const { showToast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleAddTask = (status: Task['status'] = 'todo') => {
    setInitialStatus(status);
    setEditingTask(undefined);
    setIsTaskFormOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskFormOpen(true);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const taskId = event.active.id as string;
    setActiveTaskId(taskId);

    // Find the task that's being dragged and store it 
    // to use in the DragOverlay
    if (board.tasks[taskId]) {
      setActiveDraggedTask(board.tasks[taskId]);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over || !active) return;
    
    const activeTaskId = active.id as string;
    const overTaskId = over.id as string;
    
    // Don't do anything if hovering over the same item
    if (activeTaskId === overTaskId) return;
    
    // Find the columns for the active and over items
    const activeColumn = Object.values(board.columns).find(column => 
      column.taskIds.includes(activeTaskId)
    );
    
    const overColumn = Object.values(board.columns).find(column => 
      column.taskIds.includes(overTaskId) || column.id === overTaskId
    );
    
    if (!activeColumn || !overColumn) return;
    
    // If dropping over a column directly (not a task)
    if (overTaskId === overColumn.id) {
      // Move to the end of the column
      if (activeColumn.id !== overColumn.id) {
        const activeIndex = activeColumn.taskIds.indexOf(activeTaskId);
        
        moveTask(
          activeTaskId,
          activeColumn.id,
          overColumn.id,
          activeIndex,
          overColumn.taskIds.length
        );
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveTaskId(null);
    setActiveDraggedTask(null);
    
    if (!over) return;
    
    const activeTaskId = active.id as string;
    const overTaskId = over.id as string;
    
    // Find the columns for the active and over items
    const activeColumn = Object.values(board.columns).find(column => 
      column.taskIds.includes(activeTaskId)
    );
    
    const overColumn = Object.values(board.columns).find(column => 
      column.taskIds.includes(overTaskId) || column.id === overTaskId
    );
    
    if (!activeColumn || !overColumn) return;
    
    // If task is dropped over another task
    if (overTaskId !== overColumn.id) {
      // Find the indexes in the columns
      const activeIndex = activeColumn.taskIds.indexOf(activeTaskId);
      const overIndex = overColumn.taskIds.indexOf(overTaskId);
      
      if (activeColumn.id === overColumn.id) {
        // Reordering within the same column
        moveTask(
          activeTaskId,
          activeColumn.id,
          overColumn.id,
          activeIndex,
          overIndex
        );
      } else {
        // Moving to a different column
        moveTask(
          activeTaskId,
          activeColumn.id,
          overColumn.id,
          activeIndex,
          overIndex
        );
      }
    } else {
      // Task is dropped directly over a column
      // Add it to the end of that column
      const activeIndex = activeColumn.taskIds.indexOf(activeTaskId);
      
      moveTask(
        activeTaskId,
        activeColumn.id,
        overColumn.id,
        activeIndex,
        overColumn.taskIds.length
      );
    }
  };

  const handleAddColumn = () => {
    if (!newColumnTitle.trim()) {
      showToast({
        title: "Error",
        description: "Column title cannot be empty",
        type: "error"
      });
      return;
    }

    const success = addColumn(newColumnTitle);
    
    if (success) {
      showToast({
        title: "Column added",
        description: `${newColumnTitle} column was successfully added`,
        type: "success"
      });
      setNewColumnTitle('');
      setIsColumnFormOpen(false);
    } else {
      showToast({
        title: "Error",
        description: "A column with this name already exists",
        type: "error"
      });
    }
  };

  const handleDeleteColumn = (columnId: string, targetColumnId?: string) => {
    const success = deleteColumn(columnId, targetColumnId);
    
    if (success) {
      showToast({
        title: "Column deleted",
        description: "Column was successfully deleted",
        type: "success"
      });
    }
  };

  // Calculate progress statistics
  const totalTasks = Object.values(board.tasks).length;
  const completedTasks = Object.values(board.tasks).filter(task => task.status === 'done').length;
  const inProgressTasks = Object.values(board.tasks).filter(task => task.status === 'in-progress').length;
  const todoTasks = Object.values(board.tasks).filter(task => task.status === 'todo').length;

  // Show loading state during SSR and initial client-side hydration
  if (isLoading) {
    return (
      <div className="relative p-4 h-full flex flex-col overflow-hidden">
        <div className="relative z-10 flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Project Board</h1>
            <p className="text-sm text-gray-500">Loading your tasks...</p>
          </div>
          <div className="bg-blue-500/30 h-10 w-28 rounded-md animate-pulse"></div>
        </div>

        <div className="flex justify-center items-center flex-1">
          <div className="flex flex-col items-center">
            <div className="flex space-x-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-72 h-96 bg-gray-100/50 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative p-4 flex flex-col bg-yellow-50 board-container">
        <motion.div 
          className="relative z-10 flex justify-between items-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div>
            <motion.h1 
              className="comic-font text-4xl text-black tracking-wider"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, type: 'spring' }}
            >
              PROJECT BOARD
            </motion.h1>
            <motion.p 
              className="comic-text text-sm text-gray-700"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Organize your tasks with drag and drop
            </motion.p>
          </div>
          
          <div className="flex space-x-2">
            <motion.button
              onClick={() => setIsHelpOpen(true)}
              className="p-2 text-gray-700 hover:text-gray-900 focus:outline-none comic-text"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              title="Keyboard shortcuts"
            >
              <FiHelpCircle />
            </motion.button>
            
            <motion.button
              onClick={() => setIsColumnFormOpen(true)}
              className="comic-button px-4 py-2 flex items-center space-x-1 text-sm bg-purple-400"
              whileHover={{ scale: 1.05, rotate: -2 }}
              whileTap={{ scale: 0.95 }}
              style={{ filter: 'drop-shadow(3px 3px 0 rgba(0,0,0,0.2))' }}
              title="Add new column"
            >
              <FiColumns size={14} />
              <span>Add Column</span>
            </motion.button>
            
            <motion.button
              className="comic-button px-4 py-2 flex items-center space-x-1 text-sm"
              whileHover={{ scale: 1.05, rotate: -2 }}
              whileTap={{ scale: 0.95 }}
              style={{ filter: 'drop-shadow(3px 3px 0 rgba(0,0,0,0.2))' }}
            >
              <FiFilter size={14} />
              <span>Filter</span>
              <FiChevronDown size={14} />
            </motion.button>
            
            <motion.button
              onClick={() => handleAddTask()}
              className="comic-button px-4 py-2 flex items-center space-x-1 text-sm bg-red-400"
              whileHover={{ scale: 1.05, rotate: 2 }}
              whileTap={{ scale: 0.95 }}
              style={{ filter: 'drop-shadow(3px 3px 0 rgba(0,0,0,0.2))' }}
            >
              <FiPlus size={14} />
              <span>Add Task</span>
            </motion.button>
          </div>
        </motion.div>
        
        <div className="flex-1 py-2">
          <div className="flex h-full gap-4">
            {/* Task columns */}
            <div className="flex-1">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
              >
                <div className="h-full flex justify-center pb-4">
                  <SortableContext items={Object.values(board.columns).map(col => col.id)} strategy={horizontalListSortingStrategy}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 w-full max-w-[1400px] mx-auto p-2">
                      {board.columnOrder.map(columnId => {
                        const column = board.columns[columnId];
                        return (
                          <Column
                            key={columnId}
                            id={columnId}
                            title={column.title}
                            tasks={column.taskIds.map(taskId => board.tasks[taskId])}
                            onTaskEdit={handleEditTask}
                            onTaskDelete={deleteTask}
                            onAddTask={() => handleAddTask(columnId as Task['status'])}
                            onColumnDelete={handleDeleteColumn}
                            availableColumns={board.columns}
                          />
                        );
                      })}
                    </div>
                  </SortableContext>
                </div>

                <DragOverlay dropAnimation={dropAnimationConfig}>
                  {activeTaskId && activeDraggedTask ? (
                    <div 
                      className="w-72 transform rotate-3 z-50"
                      style={{ 
                        filter: 'drop-shadow(1px 1px 0 rgba(0,0,0,0.1))'
                      }}
                    >
                      <TaskCard 
                        task={activeDraggedTask} 
                        onEdit={() => {}} 
                        onDelete={() => {}} 
                      />
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
            </div>
          </div>
        </div>
      </div>
      
      {/* Column Add Form */}
      <AnimatePresence>
        {isColumnFormOpen && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsColumnFormOpen(false)}
          >
            <motion.div 
              className="bg-white rounded-lg border-3 border-black hand-drawn-border w-full max-w-md shadow-comic relative"
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-5 border-b-3 border-black bg-gradient-to-r from-purple-500 to-indigo-500 text-white comic-font">
                <h2 className="text-xl uppercase tracking-wide">
                  Add New Column
                </h2>
                <motion.button
                  onClick={() => setIsColumnFormOpen(false)}
                  className="bg-white text-gray-800 hover:bg-red-100 hover:text-red-500 transition-colors p-1 rounded-full border-2 border-black"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FiX size={20} />
                </motion.button>
              </div>
              
              <div className="p-5">
                <div className="mb-5">
                  <label htmlFor="columnTitle" className="block comic-text font-bold text-gray-700 mb-2">
                    Column Title
                  </label>
                  <input
                    type="text"
                    id="columnTitle"
                    value={newColumnTitle}
                    onChange={(e) => setNewColumnTitle(e.target.value)}
                    placeholder="Enter column title"
                    className="w-full px-3 py-2 border-3 border-black rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-comic-sm comic-text"
                  />
                </div>
                
                <div className="flex justify-end gap-3">
                  <motion.button
                    type="button"
                    onClick={() => setIsColumnFormOpen(false)}
                    className="px-4 py-2 border-3 border-black bg-white hover:bg-gray-100 rounded-md shadow-comic-sm comic-font"
                    whileHover={{ scale: 1.03, rotate: -1 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    CANCEL
                  </motion.button>
                  
                  <motion.button
                    type="button"
                    onClick={handleAddColumn}
                    className="px-4 py-2 border-3 border-black bg-purple-500 text-white hover:bg-purple-600 rounded-md shadow-comic comic-font flex items-center"
                    whileHover={{ scale: 1.03, rotate: 1 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <FiPlus className="mr-2" />
                    ADD COLUMN
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Task Form */}
      <AnimatePresence>
        {isTaskFormOpen && (
          <TaskForm
            task={editingTask}
            initialStatus={initialStatus}
            onClose={() => setIsTaskFormOpen(false)}
            columns={board.columns}
            onSave={(taskData) => {
              if (editingTask) {
                updateTask(editingTask.id, {
                  title: taskData.title,
                  description: taskData.description,
                  status: taskData.status,
                  priority: taskData.priority,
                  dueDate: taskData.dueDate || null,
                  assignee: taskData.assignee || null
                });
                showToast({
                  title: "Task updated",
                  description: "Your task was successfully updated",
                  type: "success"
                });
              } else {
                addTask(
                  taskData.title,
                  taskData.description,
                  taskData.status,
                  taskData.priority,
                  taskData.dueDate,
                  taskData.assignee
                );
                showToast({
                  title: "Task created",
                  description: "Your new task was successfully added",
                  type: "success"
                });
              }
              setIsTaskFormOpen(false);
            }}
          />
        )}
      </AnimatePresence>
      
      <KeyboardShortcuts 
        onAddTask={() => handleAddTask()} 
        onShowHelp={() => setIsHelpOpen(true)}
      />
      
      <AnimatePresence>
        {isHelpOpen && (
          <KeyboardShortcutsHelp 
            isOpen={isHelpOpen} 
            onClose={() => setIsHelpOpen(false)} 
          />
        )}
      </AnimatePresence>
    </>
  );
} 