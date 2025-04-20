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
  onColumnDelete?: (columnId: string) => void;
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
      case 'analytics':
        return 'bg-purple-50';
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
      case 'analytics':
        return 'from-purple-400 to-purple-600 shadow-purple-200';
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
      case 'analytics':
        return '📊';
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

  return (
    <motion.div
      ref={setNodeRef}
      style={{
        ...style,
        filter: isDragging ? 'none' : 'drop-shadow(4px 4px 0 rgba(0, 0, 0, 0.15))'
      }}
      {...attributes}
      className={`w-full min-w-[270px] max-w-full h-fit flex flex-col px-1 pt-2 pb-2 transform column-container ${
        id === 'todo' ? 'rotate-1' : id === 'in-progress' ? '-rotate-1' : 'rotate-1'
      } ${
        isDragging ? 'opacity-50' : ''
      }`}
      variants={columnVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div 
        className={`flex flex-col rounded-lg border-3 border-black ${getColumnBackground()} overflow-hidden shadow-comic content-start h-fit`}
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='0.1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='1.5'/%3E%3Ccircle cx='13' cy='13' r='1.5'/%3E%3C/g%3E%3C/svg%3E\")"
        }}
      >
        <div 
          {...listeners} 
          className="cursor-grab border-b-3 border-black relative"
        >
          <motion.div 
            className={`bg-gradient-to-r ${getHeaderStyles()} comic-font uppercase font-semibold text-lg text-white py-3 px-4 flex items-center justify-between`}
            style={{ textShadow: '2px 2px 0 rgba(0,0,0,0.3)' }}
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
              <span className="tracking-wider">{title}</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <motion.div 
                className="flex items-center justify-center bg-white rounded-full w-7 h-7 font-bold text-base border-2 border-black"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                style={{ 
                  color: id === 'todo' ? '#3b82f6' : 
                        id === 'in-progress' ? '#f59e0b' : 
                        id === 'done' ? '#10b981' : '#6b7280',
                  boxShadow: '2px 2px 0 rgba(0,0,0,0.2)'
                }}
              >
                {tasks.length}
              </motion.div>
              
              {/* Only show delete button for non-default columns */}
              {onColumnDelete && id !== 'todo' && id !== 'in-progress' && id !== 'done' && id !== 'analytics' && (
                <motion.button
                  onClick={() => onColumnDelete(id)}
                  className="ml-2 text-white hover:text-red-300 transition-colors"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FiTrash size={16} />
                </motion.button>
              )}
            </div>
          </motion.div>
        </div>
        
        <div className="p-2 flex flex-col space-y-3">
          <SortableContext 
            items={tasks.map(task => task.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="min-h-[150px]">
              <AnimatePresence>
                {tasks.length > 0 ? (
                  <motion.div className="space-y-3">
                    {tasks.map(task => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onEdit={() => onTaskEdit(task)}
                        onDelete={() => onTaskDelete(task.id)}
                      />
                    ))}
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-[150px] flex flex-col items-center justify-center text-center p-4 border-2 border-dashed border-gray-300 rounded-md mt-2"
                  >
                    <motion.div 
                      className="text-3xl mb-2"
                      animate={{ 
                        rotate: [0, 10, 0, -10, 0],
                        y: [0, -5, 0],
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity,
                        repeatDelay: 1
                      }}
                    >
                      🤔
                    </motion.div>
                    <p className="comic-text text-sm text-gray-500">No tasks yet</p>
                    <p className="comic-text text-xs text-gray-400 mt-1">Drop tasks here or add a new one</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </SortableContext>
          
          <motion.button
            onClick={onAddTask}
            className="w-full py-3 px-4 bg-yellow-400 hover:bg-yellow-500 text-black comic-font border-2 border-black rounded font-bold uppercase flex items-center justify-center transform -rotate-1"
            whileHover={{ scale: 1.03, rotate: 1, boxShadow: '3px 3px 0 rgba(0,0,0,0.2)' }}
            whileTap={{ scale: 0.98, rotate: 0 }}
            transition={{ type: 'spring' }}
          >
            <FiPlus className="mr-1" />
            Add Task
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
} 