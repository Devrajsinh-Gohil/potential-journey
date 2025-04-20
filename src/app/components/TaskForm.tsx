'use client';

import { useState, useEffect } from 'react';
import { Task } from '../types';
import { FiX, FiCalendar, FiFlag, FiAlignLeft, FiTag, FiCheck, FiZap, FiSave, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface TaskFormData {
  title: string;
  description: string;
  status: Task['status'];
  priority: Task['priority'];
  dueDate?: string;
  assignee?: string;
}

interface TaskFormProps {
  task?: Task;
  initialStatus?: Task['status'];
  onClose: () => void;
  onSave: (taskData: TaskFormData) => void;
  columns?: Record<string, { id: string; title: string; taskIds: string[] }>;
}

export function TaskForm({
  task,
  initialStatus = 'todo',
  onClose,
  onSave,
  columns = {},
}: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Task['status']>('todo');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [dueDate, setDueDate] = useState('');
  const [assignee, setAssignee] = useState('');
  const [showHelper, setShowHelper] = useState(false);
  const [saveAnimation, setSaveAnimation] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setStatus(task.status);
      setPriority(task.priority);
      setDueDate(task.dueDate || '');
      setAssignee(task.assignee || '');
    } else {
      setStatus(initialStatus);
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
      setAssignee('');
    }
  }, [task, initialStatus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;
    
    // Show save animation
    setSaveAnimation(true);
    
    // Delay actual save to show animation
    setTimeout(() => {
      onSave({
        title,
        description,
        status,
        priority,
        dueDate: dueDate || undefined,
        assignee: assignee || undefined
      });
      
      onClose();
    }, 800);
  };

  const handleSuggestedPriority = (suggestedPriority: 'low' | 'medium' | 'high') => {
    setPriority(suggestedPriority);
    setShowHelper(false);
  };

  const getPriorityColor = (value: Task['priority'], currentPriority: Task['priority']) => {
    const baseClasses = "px-3 py-2 rounded-md transition-all duration-200 flex items-center justify-center comic-text";
    
    if (value === currentPriority) {
      switch (value) {
        case 'high':
          return `${baseClasses} bg-red-100 text-red-700 border-3 border-red-500 shadow-comic-colored-red`;
        case 'medium':
          return `${baseClasses} bg-yellow-100 text-yellow-700 border-3 border-yellow-500 shadow-comic-colored-yellow`;
        case 'low':
          return `${baseClasses} bg-green-100 text-green-700 border-3 border-green-500 shadow-comic-colored-green`;
        default:
          return `${baseClasses} bg-gray-100 text-gray-700 border-3 border-gray-300`;
      }
    }
    
    return `${baseClasses} bg-white text-gray-500 border-2 border-gray-200 hover:bg-gray-50`;
  };

  const getPriorityIcon = (value: Task['priority']) => {
    switch (value) {
      case 'high':
        return '🔥';
      case 'medium':
        return '⚡';
      case 'low':
        return '🍃';
      default:
        return '⚪';
    }
  };

  // Get the visual style based on status
  const getStatusStyle = (currentStatus: Task['status']) => {
    switch (currentStatus) {
      case 'todo':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-500',
          text: 'text-blue-700',
          shadow: 'shadow-comic-colored'
        };
      case 'in-progress':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-500',
          text: 'text-yellow-700',
          shadow: 'shadow-comic-colored-yellow'
        };
      case 'done':
        return {
          bg: 'bg-green-50',
          border: 'border-green-500',
          text: 'text-green-700',
          shadow: 'shadow-comic-colored-green'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-300',
          text: 'text-gray-700',
          shadow: 'shadow-sm'
        };
    }
  };

  const statusStyle = getStatusStyle(status);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <AnimatePresence>
        {saveAnimation && (
          <motion.div 
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="comic-action bg-yellow-400 text-black px-8 py-6 text-3xl"
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 10 }}
              exit={{ scale: 2, opacity: 0 }}
              transition={{ type: "spring", damping: 15 }}
            >
              SAVED!
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        className="bg-white rounded-lg border-3 border-black hand-drawn-border w-full max-w-md shadow-comic relative overflow-hidden"
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Comic-style pattern overlay */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-10" 
          style={{
            backgroundImage: `radial-gradient(#000 1px, transparent 1px)`,
            backgroundSize: '12px 12px'
          }}
        />
        
        {/* Form header */}
        <div className="flex justify-between items-center p-5 border-b-3 border-black bg-gradient-to-r from-blue-500 to-purple-500 text-white comic-font shadow-md relative">
          <h2 className="text-xl uppercase tracking-wide">
            {task ? 'Edit Task' : 'Create New Task'}
          </h2>
          <motion.button
            onClick={onClose}
            className="bg-white text-gray-800 hover:bg-red-100 hover:text-red-500 transition-colors p-1 rounded-full border-2 border-black"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Close"
          >
            <FiX size={20} />
          </motion.button>
        </div>

        <form onSubmit={handleSubmit} className="p-5">
          <div className="mb-5">
            <label htmlFor="title" className="block comic-text font-bold text-gray-700 mb-2 flex items-center">
              <motion.div 
                className="mr-2 text-purple-500"
                initial={{ rotate: 0 }}
                animate={{ rotate: [0, -10, 0, 10, 0] }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <FiTag size={18} />
              </motion.div>
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border-3 border-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-comic-sm comic-text"
              placeholder="What needs to be done?"
              required
            />
          </div>

          <div className="mb-5">
            <label htmlFor="description" className="block comic-text font-bold text-gray-700 mb-2 flex items-center">
              <motion.div 
                className="mr-2 text-blue-500"
                initial={{ rotate: 0 }}
                animate={{ rotate: [0, 5, 0, -5, 0] }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <FiAlignLeft size={18} />
              </motion.div>
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border-3 border-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-comic-sm comic-text"
              placeholder="Add more details about this task..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label htmlFor="status" className="block comic-text font-bold text-gray-700 mb-2 flex items-center">
                <motion.div 
                  className="mr-2 text-green-500"
                  initial={{ rotate: 0 }}
                  animate={{ rotate: [0, 10, 0, -10, 0] }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <FiCheck size={18} />
                </motion.div>
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as Task['status'])}
                className={`w-full px-3 py-2 border-3 ${statusStyle.border} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${statusStyle.bg} ${statusStyle.text} ${statusStyle.shadow} comic-text`}
              >
                {Object.keys(columns).length > 0 ? (
                  Object.entries(columns).map(([id, column]) => (
                    <option key={id} value={id}>
                      {column.title}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label htmlFor="dueDate" className="block comic-text font-bold text-gray-700 mb-2 flex items-center">
                <motion.div 
                  className="mr-2 text-red-500"
                  initial={{ scale: 1 }}
                  animate={{ scale: [1, 1.2, 1, 0.9, 1] }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <FiCalendar size={18} />
                </motion.div>
                Due Date
              </label>
              <input
                type="date"
                id="dueDate"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={format(new Date(), 'yyyy-MM-dd')}
                className="w-full px-3 py-2 border-3 border-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-comic-sm comic-text"
              />
            </div>
          </div>

          <div className="mb-5">
            <label htmlFor="assignee" className="block comic-text font-bold text-gray-700 mb-2 flex items-center">
              <motion.div 
                className="mr-2 text-yellow-500"
                initial={{ y: 0 }}
                animate={{ y: [0, -3, 0, -3, 0] }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <FiUser size={18} />
              </motion.div>
              Assign To
            </label>
            <input
              type="text"
              id="assignee"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              placeholder="Enter name"
              className="w-full px-3 py-2 border-3 border-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-comic-sm comic-text"
            />
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="block comic-text font-bold text-gray-700 flex items-center">
                <motion.div 
                  className="mr-2 text-yellow-500"
                  initial={{ y: 0 }}
                  animate={{ y: [0, -3, 0, -3, 0] }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                >
                  <FiFlag size={18} />
                </motion.div>
                Priority
              </label>
              
              <motion.button
                type="button"
                onClick={() => setShowHelper(!showHelper)}
                className="text-xs flex items-center text-blue-500 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded-full border border-blue-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiZap className="mr-1" size={12} />
                Need help?
              </motion.button>
            </div>
            
            <div className="flex justify-between gap-2">
              <motion.button
                type="button"
                className={getPriorityColor('low', priority)}
                onClick={() => setPriority('low')}
                whileHover={{ y: -3 }}
                whileTap={{ y: 0 }}
              >
                <span className="mr-2 text-lg">{getPriorityIcon('low')}</span>
                Low
              </motion.button>
              
              <motion.button
                type="button"
                className={getPriorityColor('medium', priority)}
                onClick={() => setPriority('medium')}
                whileHover={{ y: -3 }}
                whileTap={{ y: 0 }}
              >
                <span className="mr-2 text-lg">{getPriorityIcon('medium')}</span>
                Medium
              </motion.button>
              
              <motion.button
                type="button"
                className={getPriorityColor('high', priority)}
                onClick={() => setPriority('high')}
                whileHover={{ y: -3 }}
                whileTap={{ y: 0 }}
              >
                <span className="mr-2 text-lg">{getPriorityIcon('high')}</span>
                High
              </motion.button>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <motion.button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border-3 border-black bg-white hover:bg-gray-100 rounded-md shadow-comic-sm comic-font"
              whileHover={{ 
                scale: 1.03, 
                rotate: -1, 
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.97 }}
            >
              CANCEL
            </motion.button>
            
            <motion.button
              type="submit"
              className="px-4 py-2 border-3 border-black bg-green-500 text-white hover:bg-green-600 rounded-md shadow-comic comic-font flex items-center"
              whileHover={{ 
                scale: 1.03, 
                rotate: 1, 
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.97 }}
            >
              <FiSave className="mr-2" />
              {task ? 'UPDATE' : 'SAVE'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
} 