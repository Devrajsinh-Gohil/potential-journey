'use client';

import { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '../types';
import { format, isPast, isToday } from 'date-fns';
import { FiEdit, FiTrash, FiCalendar, FiFlag, FiMoreVertical, FiChevronDown, FiChevronUp, FiClock, FiZap, FiUser } from 'react-icons/fi';
import { AnimatePresence, motion } from 'framer-motion';
import { MotionCard, MotionBadge } from './ui/MotionCard';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  index?: number;
}

export function TaskCard({ task, onEdit, onDelete, index = 0 }: TaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [localTask, setLocalTask] = useState(task);
  const [showPow, setShowPow] = useState(false);
  const [showSpeechBubble, setShowSpeechBubble] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Add useEffect to update local state when task prop changes
  useEffect(() => {
    // This will ensure the component re-renders with updated task data
    setLocalTask(task);
  }, [task]);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: localTask.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current || isDragging) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setMousePosition({ x, y });
  };

  // Handle card click to show animated POW effect
  const handleCardClick = () => {
    if (!isExpanded) {
      setShowPow(true);
      setTimeout(() => setShowPow(false), 800);
    }
    setIsExpanded(!isExpanded);
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'yellow';
      case 'low': return 'green';
      default: return 'gray';
    }
  };
  
  const getPriorityStyle = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return { bg: 'bg-red-100', text: 'text-red-800' };
      case 'medium':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800' };
      case 'low':
        return { bg: 'bg-green-100', text: 'text-green-800' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800' };
    }
  };
  
  const getPriorityGlowColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return {
        main: 'rgba(239, 68, 68, 0.9)',
        secondary: 'rgba(248, 113, 113, 0.8)'
      };
      case 'medium': return {
        main: 'rgba(234, 179, 8, 0.8)',
        secondary: 'rgba(250, 204, 21, 0.7)'
      };
      case 'low': return {
        main: 'rgba(34, 197, 94, 0.8)',
        secondary: 'rgba(74, 222, 128, 0.7)'
      };
      default: return {
        main: 'rgba(59, 130, 246, 0.8)',
        secondary: 'rgba(96, 165, 250, 0.7)'
      };
    }
  };

  const getDateStatusClass = () => {
    if (!localTask.dueDate) return 'gray';
    const dueDate = new Date(localTask.dueDate);
    if (isPast(dueDate) && !isToday(dueDate)) return 'red';
    if (isToday(dueDate)) return 'yellow';
    return 'blue';
  };

  const getPriorityIcon = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return '🔥';
      case 'medium': return '⚡';
      case 'low': return '🍃';
      default: return '⚪';
    }
  };

  // Calculate days from now
  const getDaysText = () => {
    if (!localTask.dueDate) return null;
    const dueDate = new Date(localTask.dueDate);
    const today = new Date();
    
    // Set time to midnight for accurate day calculation
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays === 0) return "Due today";
    if (diffDays === 1) return "Due tomorrow";
    return `Due in ${diffDays} days`;
  };

  // Enhanced card animations
  const cardVariants = {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        type: 'spring', 
        stiffness: 500, 
        damping: 30,
        delay: index * 0.05 
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.9, 
      y: -20,
      transition: { duration: 0.2 }
    },
    hover: { 
      y: -5, 
      scale: 1.02,
      boxShadow: '4px 4px 0px rgba(0, 0, 0, 0.3)',
      transition: { 
        type: 'spring', 
        stiffness: 400, 
        damping: 20 
      }
    }
  };

  // Visually differentiate tasks based on status
  const getStatusStyles = () => {
    switch (localTask.status) {
      case 'todo':
        return 'border-l-4 border-l-blue-500';
      case 'in-progress':
        return 'border-l-4 border-l-yellow-500';
      case 'done':
        return 'border-l-4 border-l-green-500';
      default:
        return '';
    }
  };

  // Get dot color for the comic book pattern based on priority
  const getPriorityDotColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return '#ef4444'; // Red
      case 'medium': return '#f59e0b'; // Amber
      case 'low': return '#10b981'; // Green
      default: return '#3b82f6'; // Blue
    }
  };

  // Get animation effect based on priority
  const getPriorityAnimation = (priority: Task['priority']) => {
    if (priority === 'high') {
      return { 
        className: 'animate-pulse',
        duration: 1.5 
      };
    }
    if (priority === 'medium') {
      return { 
        className: 'animate-bounce-light',
        duration: 2 
      };
    }
    return { 
      className: '',
      duration: 0 
    };
  };

  const priorityAnimation = getPriorityAnimation(localTask.priority);

  // Define speech bubble animation variants
  const speechBubbleVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0, 
      y: 10 
    },
    visible: { 
      opacity: 1, 
      scale: 1.1, 
      y: -2,
      transition: {
        type: 'spring',
        stiffness: 250,
        damping: 15
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0, 
      y: 10,
      transition: {
        duration: 0.2
      }
    }
  };

  // Define POW animation variants
  const powVariants = {
    hidden: { 
      scale: 0,
      opacity: 0
    },
    visible: { 
      scale: 1.2,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 250,
        damping: 12
      }
    },
    exit: { 
      scale: 0,
      opacity: 0,
      transition: {
        duration: 0.2
      }
    }
  };

  // Define star animation variants
  const starVariants = {
    animate: {
      scale: [1, 1.1, 1],
      transition: {
        repeat: Infinity,
        repeatType: "loop" as const,
        duration: 2,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.div
      ref={(node) => {
        // Set both refs
        setNodeRef(node);
        cardRef.current = node;
      }}
      style={{
        ...style,
        filter: isDragging ? 'drop-shadow(2px 2px 0 rgba(0,0,0,0.2))' : 'drop-shadow(1px 1px 0 rgba(0,0,0,0.1))',
        willChange: 'transform, opacity'
      }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{
        duration: 0.3,
        ease: "easeOut"
      }}
      whileHover={!isDragging ? { 
        scale: 1.05, 
        y: -8,
        boxShadow: "6px 6px 0px rgba(0,0,0,0.3)",
        filter: 'drop-shadow(4px 4px 0 rgba(0,0,0,0.2))',
        transition: { 
          type: 'spring',
          stiffness: 250,
          damping: 14,
          mass: 1,
          velocity: 1
        }
      } : undefined}
      whileTap={!isDragging ? { 
        scale: 0.95, 
        y: 2,
        boxShadow: "2px 2px 0px rgba(0,0,0,0.2)",
        transition: {
          type: 'spring',
          stiffness: 300,
          damping: 20
        }
      } : undefined}
      className={`mb-3 hand-drawn-border bg-white rounded-lg w-full p-3 comic-text transform animation-gpu ${
        getStatusStyles()
      } ${
        isDragging ? 'opacity-50 cursor-grabbing z-50' : 'cursor-pointer'
      }`}
      {...attributes}
      {...listeners}
      onMouseEnter={() => {
        setShowActions(true);
        setIsHovering(true);
        setShowSpeechBubble(true);
      }}
      onMouseLeave={() => {
        setShowActions(false);
        setIsHovering(false);
        setShowSpeechBubble(false);
      }}
      onMouseMove={handleMouseMove}
      onClick={handleCardClick}
    >
      {/* Task content */}
      <div className="relative">
        {/* POW effect when clicked */}
        <AnimatePresence>
          {showPow && (
            <motion.div 
              className="absolute -right-2 -top-10 z-50"
              variants={powVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="comic-pow px-4 py-2">
                POW!
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Comic speech bubble - appears on hover */}
        <AnimatePresence>
          {showSpeechBubble && (
            <motion.div 
              className="absolute -right-1 -top-16 z-40"
              variants={speechBubbleVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{ pointerEvents: 'none' }}
            >
              <div className="comic-speech px-3 py-1 text-xs whitespace-nowrap">
                {localTask.priority === 'high' ? 'Urgent!' : 
                 localTask.priority === 'medium' ? 'Important' : 'Take your time'}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Priority indicator */}
        <div className="flex justify-between items-start mb-2">
          <motion.div 
            className={`${priorityAnimation.className} inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-${getPriorityColor(localTask.priority)}-100 text-${getPriorityColor(localTask.priority)}-800 border border-${getPriorityColor(localTask.priority)}-300`}
            whileHover={{
              scale: 1.15,
              y: -4,
              boxShadow: `0 0 12px ${getPriorityGlowColor(localTask.priority).main}`,
              transition: {
                type: 'spring',
                stiffness: 400,
                damping: 10
              }
            }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ 
              scale: 1, 
              opacity: 1,
              transition: {
                type: 'spring', 
                stiffness: 300, 
                damping: 15
              }
            }}
          >
            <span className="mr-1">{getPriorityIcon(localTask.priority)}</span>
            <span className="capitalize">{localTask.priority}</span>
          </motion.div>
          
          {/* Task actions (edit, delete) */}
          <AnimatePresence>
            {showActions && (
              <motion.div 
                className="flex space-x-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                <motion.button
                  className="p-1 text-gray-500 hover:text-blue-500 bg-white border border-gray-200 rounded-md hover:bg-blue-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(localTask);
                  }}
                  whileHover={{ 
                    scale: 1.2, 
                    boxShadow: "2px 2px 0px rgba(0,0,0,0.2)",
                    backgroundColor: "#e6f2ff",
                    y: -2,
                    transition: {
                      type: 'spring',
                      stiffness: 500,
                      damping: 10
                    }
                  }}
                  whileTap={{ 
                    scale: 0.8,
                    y: 2,
                    transition: {
                      type: 'spring',
                      stiffness: 300,
                      damping: 15
                    }
                  }}
                  title="Edit task"
                >
                  <FiEdit size={14} />
                </motion.button>
                
                <motion.button
                  className="p-1 text-gray-500 hover:text-red-500 bg-white border border-gray-200 rounded-md hover:bg-red-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(localTask.id);
                  }}
                  whileHover={{ 
                    scale: 1.2, 
                    boxShadow: "2px 2px 0px rgba(0,0,0,0.2)",
                    backgroundColor: "#ffe6e6",
                    y: -2,
                    transition: {
                      type: 'spring',
                      stiffness: 500,
                      damping: 10
                    }
                  }}
                  whileTap={{ 
                    scale: 0.8,
                    y: 2,
                    transition: {
                      type: 'spring',
                      stiffness: 300,
                      damping: 15
                    }
                  }}
                  title="Delete task"
                >
                  <FiTrash size={14} />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Task title with decorative elements */}
        <div className="relative">
          <h3 className="font-bold text-gray-800 leading-snug mb-1 pr-6 relative">
            {localTask.title}
            {localTask.priority === 'high' && (
              <motion.div 
                className="absolute -right-2 -top-2"
                style={{ willChange: 'transform' }}
                variants={starVariants}
                animate="animate"
              >
                <span className="text-red-500 text-lg">★</span>
              </motion.div>
            )}
          </h3>
          
          {/* Squiggly underline for emphasis */}
          <svg className="absolute -bottom-1 left-0 w-full" height="5" viewBox="0 0 100 5" preserveAspectRatio="none">
            <motion.path 
              d="M0,1 Q10,0 20,1 T40,1 T60,1 T80,1 T100,1"
              strokeWidth="2"
              stroke={`${getPriorityDotColor(localTask.priority)}40`}
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </svg>
        </div>
      
        {/* Task description - abbreviated when collapsed */}
        <div className="mt-2">
          <p className="text-gray-600 text-sm">
            {isExpanded 
              ? localTask.description
              : `${localTask.description.slice(0, 80)}${localTask.description.length > 80 ? '...' : ''}`
            }
          </p>
        </div>
        
        {/* Task metadata - shown when expanded */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ 
                duration: 0.25,
                ease: "easeInOut"
              }}
              className="mt-3 pt-3 border-t border-dashed border-gray-200"
            >
              <div className="flex flex-col space-y-2">
                {/* Due date indicator */}
                {localTask.dueDate && (
                  <div className="flex items-center mt-3 text-sm">
                    <FiCalendar className="mr-2 text-gray-500" />
                    <span>{format(new Date(localTask.dueDate), 'MMM d, yyyy')}</span>
                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                      {getDaysText()}
                    </span>
                  </div>
                )}
                
                {/* Created/Updated timestamps */}
                <div className="flex justify-between text-xs text-gray-500">
                  <div className="flex items-center">
                    <FiClock className="mr-1" size={12} />
                    <span>Created {format(new Date(localTask.createdAt), 'MMM d')}</span>
                  </div>
                  {localTask.updatedAt !== localTask.createdAt && (
                    <div className="flex items-center">
                      <FiClock className="mr-1" size={12} />
                      <span>Updated {format(new Date(localTask.updatedAt), 'MMM d')}</span>
                    </div>
                  )}
                </div>

                {/* Priority label */}
                <div className="flex items-center">
                  <FiFlag className="mr-1 text-gray-500" size={14} />
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-bold ${
                    getPriorityStyle(localTask.priority).bg
                  } ${getPriorityStyle(localTask.priority).text}`}>
                    {localTask.priority.charAt(0).toUpperCase() + localTask.priority.slice(1)}
                  </span>
                </div>
                
                {/* Assignee display */}
                {localTask.assignee && (
                  <div className="flex items-center mt-3 text-sm">
                    <FiUser className="mr-2 text-gray-500" />
                    <span>Assigned to: </span>
                    <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded-full text-gray-800 font-medium">
                      {localTask.assignee}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Task expand/collapse chevron */}
        <div className="mt-2 flex justify-center">
          <motion.button 
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
            animate={{ 
              rotate: isExpanded ? 180 : 0,
              transition: {
                type: 'spring',
                stiffness: 300,
                damping: 15
              }
            }}
            whileHover={{
              scale: 1.3,
              color: "#3b82f6",
              transition: {
                type: 'spring',
                stiffness: 500,
                damping: 10
              }
            }}
            whileTap={{
              scale: 0.9,
              transition: {
                type: 'spring',
                stiffness: 400,
                damping: 15
              }
            }}
            onClick={(e) => {
              e.stopPropagation(); // Prevent triggering the card click
              setIsExpanded(!isExpanded);
            }}
          >
            <FiChevronDown size={16} />
          </motion.button>
        </div>
      </div>
      
      {/* Visual embellishments - halftone pattern */}
      <div 
        className="absolute top-0 right-0 w-16 h-16 opacity-5 pointer-events-none z-0" 
        style={{
          backgroundImage: `radial-gradient(${getPriorityDotColor(localTask.priority)} 1px, transparent 1px)`,
          backgroundSize: '5px 5px'
        }}
      />
    </motion.div>
  );
} 