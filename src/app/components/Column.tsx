'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '../types';
import { TaskCard } from './TaskCard';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { FiPlus, FiTrash } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { ColumnHeader } from './ui/ColumnHeader';
import { useState, useEffect } from 'react';

interface ColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  onTaskEdit: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
  onAddTask: () => void;
  onColumnDelete?: (columnId: string, targetColumnId?: string) => void;
  availableColumns?: Record<string, { id: string; title: string; taskIds: string[] }>;
}

export function Column({ 
  id, 
  title, 
  tasks, 
  onTaskEdit, 
  onTaskDelete, 
  onAddTask, 
  onColumnDelete,
  availableColumns = {}
}: ColumnProps) {
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Get the appropriate styles for different column types
  const getColumnBackground = () => {
    switch (id) {
      case 'todo':
        return 'bg-blue-50';
      case 'in-progress':
        return 'bg-yellow-50';
      case 'done':
        return 'bg-green-50';
      default:
        return 'bg-gray-50';
    }
  };

  const getHeaderStyles = () => {
    switch (id) {
      case 'todo':
        return 'from-blue-400 to-blue-600 shadow-blue-200';
      case 'in-progress':
        return 'from-yellow-400 to-yellow-600 shadow-yellow-200';
      case 'done':
        return 'from-green-400 to-green-600 shadow-green-200';
      default:
        return 'from-gray-400 to-gray-600 shadow-gray-200';
    }
  };

  const getColumnIcon = () => {
    switch (id) {
      case 'todo':
        return '📋';
      case 'in-progress':
        return '⚙️';
      case 'done':
        return '✅';
      default:
        return '📝';
    }
  };
  
  // Animation variants
  const columnVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: 'spring',
        stiffness: 300,
        damping: 30,
        when: 'beforeChildren',
        staggerChildren: 0.05
      }
    }
  };

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [targetColumnId, setTargetColumnId] = useState<string>('');

  // Add a function to handle column deletion with confirmation
  const handleDeleteColumn = () => {
    setIsDeleteConfirmOpen(true);
  };

  const confirmDeleteColumn = () => {
    if (onColumnDelete) {
      onColumnDelete(id, targetColumnId);
    }
    setIsDeleteConfirmOpen(false);
  };

  useEffect(() => {
    // Set the first available column that's not this one as the default target
    if (isDeleteConfirmOpen && Object.keys(availableColumns).length > 0) {
      const otherColumns = Object.values(availableColumns)
        .filter(col => col.id !== id);
      
      if (otherColumns.length > 0) {
        setTargetColumnId(otherColumns[0].id);
      }
    }
  }, [isDeleteConfirmOpen, availableColumns, id]);

  return (
    <motion.div
      ref={setNodeRef}
      style={{
        ...style,
        filter: isDragging ? 'none' : 'drop-shadow(4px 4px 0 rgba(0, 0, 0, 0.15))'
      }}
      {...attributes}
      className={`min-w-[280px] max-w-[350px] flex flex-col px-1 pt-2 pb-2 transform column-container ${
        id === 'todo' ? 'rotate-1' : id === 'in-progress' ? '-rotate-1' : 'rotate-1'
      } ${
        isDragging ? 'opacity-50' : ''
      }`}
      variants={columnVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div 
        className={`flex flex-col rounded-lg border-3 border-black ${getColumnBackground()} overflow-hidden shadow-comic`}
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='0.03' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='1.5'/%3E%3Ccircle cx='13' cy='13' r='1.5'/%3E%3C/g%3E%3C/svg%3E\")"
        }}
      >
        <div 
          {...listeners} 
          className="cursor-grab border-b-3 border-black relative"
        >
          <motion.div 
            className={`bg-gradient-to-r ${getHeaderStyles()} comic-font uppercase font-semibold text-lg text-white py-3 px-4 flex items-center justify-between`}
          >
            <div className="flex items-center">
              <motion.span 
                className="mr-2 text-2xl drop-shadow-md"
                animate={{ 
                  rotate: [0, 5, 0, -5, 0],
                  scale: [1, 1.2, 1, 0.9, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
              >
                {getColumnIcon()}
              </motion.span>
              {title}
            </div>
            
            <div className="flex items-center space-x-1">
              <motion.div 
                className="flex items-center justify-center bg-white rounded-full w-7 h-7 font-bold text-base"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                style={{ 
                  color: id === 'todo' ? '#3b82f6' : 
                        id === 'in-progress' ? '#f59e0b' : 
                        id === 'done' ? '#10b981' : '#6b7280'
                }}
              >
                {tasks.length}
              </motion.div>
              
              {/* Only show delete button for non-default columns */}
              {onColumnDelete && id !== 'todo' && id !== 'in-progress' && id !== 'done' && (
                <motion.button
                  onClick={handleDeleteColumn}
                  className="ml-2 text-white hover:text-red-300 transition-colors"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  title="Delete column"
                >
                  <FiTrash size={14} />
                </motion.button>
              )}
            </div>
          </motion.div>
        </div>

        <div className="flex-1 p-3">
          <SortableContext items={tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
            <AnimatePresence>
              {tasks.map((task, index) => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onEdit={onTaskEdit} 
                  onDelete={onTaskDelete} 
                  index={index}
                />
              ))}
            </AnimatePresence>
            
            {tasks.length === 0 && (
              <motion.div 
                className="text-center py-8 px-4 text-gray-600 comic-text border-2 border-dashed border-black rounded-lg bg-white/80"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <motion.div
                  initial={{ scale: 1 }}
                  animate={{ 
                    scale: [1, 1.05, 1],
                    rotate: [0, -2, 0, 2, 0],
                    opacity: [0.7, 0.9, 0.7]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  <div className="text-3xl mb-2">🤔</div>
                  <div>No tasks yet</div>
                  <div className="text-xs mt-1">Drop tasks here or add a new one</div>
                </motion.div>
              </motion.div>
            )}
          </SortableContext>

          <motion.button
            onClick={onAddTask}
            className={`comic-button mt-3 w-full flex items-center justify-center py-2 px-3 ${
              id === 'todo' ? 'bg-blue-400' : 
              id === 'in-progress' ? 'bg-yellow-400' : 
              id === 'done' ? 'bg-green-400' : 'bg-gray-400'
            } text-white`}
            whileTap={{ scale: 0.95, y: 2 }}
          >
            <motion.div
              initial={{ rotate: 0 }}
              whileHover={{ rotate: 90 }}
              transition={{ duration: 0.2 }}
            >
              <FiPlus className="mr-1" size={16} />
            </motion.div>
            Add task
          </motion.button>
        </div>
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {isDeleteConfirmOpen && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsDeleteConfirmOpen(false)}
          >
            <motion.div 
              className="bg-white rounded-lg border-3 border-black hand-drawn-border w-full max-w-md shadow-comic relative"
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-5 border-b-3 border-black bg-gradient-to-r from-red-500 to-pink-500 text-white comic-font">
                <h2 className="text-xl uppercase tracking-wide">
                  Delete Column
                </h2>
              </div>
              
              <div className="p-5">
                <div className="mb-5 text-center">
                  <div className="text-4xl mb-3">🗑️</div>
                  <h3 className="text-lg font-bold mb-2">Are you sure?</h3>
                  <p className="text-gray-600 mb-4">
                    This action cannot be undone.
                  </p>
                  
                  {tasks.length > 0 && (
                    <div className="mt-4">
                      <label htmlFor="targetColumn" className="block text-left text-sm font-medium text-gray-700 mb-1">
                        Move {tasks.length} task{tasks.length !== 1 ? 's' : ''} to:
                      </label>
                      <select
                        id="targetColumn"
                        value={targetColumnId}
                        onChange={(e) => setTargetColumnId(e.target.value)}
                        className="w-full px-3 py-2 border-2 border-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-comic-sm comic-text bg-white"
                      >
                        {Object.values(availableColumns)
                          .filter(column => column.id !== id)
                          .map(column => (
                            <option key={column.id} value={column.id}>
                              {column.title}
                            </option>
                          ))
                        }
                      </select>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-center gap-3">
                  <motion.button
                    type="button"
                    onClick={() => setIsDeleteConfirmOpen(false)}
                    className="px-4 py-2 border-3 border-black bg-white hover:bg-gray-100 rounded-md shadow-comic-sm comic-font"
                    whileHover={{ scale: 1.03, rotate: -1 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    CANCEL
                  </motion.button>
                  
                  <motion.button
                    type="button"
                    onClick={confirmDeleteColumn}
                    className="px-4 py-2 border-3 border-black bg-red-500 text-white hover:bg-red-600 rounded-md shadow-comic comic-font flex items-center"
                    whileHover={{ scale: 1.03, rotate: 1 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <FiTrash className="mr-2" />
                    DELETE
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
} 