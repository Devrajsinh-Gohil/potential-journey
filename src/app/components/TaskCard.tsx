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
      ref={setNodeRef}
      className={`bg-white border-2 border-black rounded-lg shadow-comic mb-3 ${getStatusStyles()} relative overflow-hidden`}
      style={{
        ...style,
        transform: isDragging 
          ? style.transform 
          : `${style.transform} rotate(${Math.floor(Math.random() * 5) - 2}deg)`,
        zIndex: isExpanded ? 10 : 'auto',
        boxShadow: isExpanded 
          ? '8px 8px 0 rgba(0,0,0,0.5)' 
          : localTask.priority === 'high'
            ? '6px 6px 0 rgba(239, 68, 68, 0.5)'
            : localTask.priority === 'medium'
              ? '5px 5px 0 rgba(234, 179, 8, 0.5)'
              : '4px 4px 0 rgba(0,0,0,0.3)'
      }}
      variants={cardVariants}
      animate="animate"
      initial="initial"
      exit="exit"
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onMouseMove={handleMouseMove}
      whileHover={{
        scale: 1.05,
        rotate: localTask.priority === 'high' 
          ? [0, 2, -2, 2, 0] 
          : localTask.priority === 'medium' 
            ? [0, 1, -1, 0] 
            : 0,
        boxShadow: localTask.priority === 'high'
          ? '8px 8px 0 rgba(239, 68, 68, 0.7)'
          : localTask.priority === 'medium'
            ? '7px 7px 0 rgba(234, 179, 8, 0.7)'
            : '6px 6px 0 rgba(0,0,0,0.4)'
      }}
      drag={isDragging}
      dragConstraints={{
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
      }}
      {...attributes}
      {...listeners}
    >
      {/* Comic book edge/border effect */}
      <div className="absolute inset-0 border-2 border-black rounded-lg pointer-events-none" 
        style={{
          boxShadow: 'inset 0 0 0 2px white',
          zIndex: 1
        }}
      />

      {/* POW effect on click */}
      <AnimatePresence>
        {showPow && (
          <motion.div 
            className="absolute z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1.4, rotate: 15 }}
            exit={{ scale: 0, rotate: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <div className="relative">
              <svg width="80" height="80" viewBox="0 0 100 100">
                <path 
                  d="M50,0 L61,35 L97,35 L68,57 L79,91 L50,70 L21,91 L32,57 L3,35 L39,35 Z" 
                  fill={
                    localTask.priority === 'high' ? '#ef4444' : 
                    localTask.priority === 'medium' ? '#f59e0b' : 
                    '#10b981'
                  } 
                  stroke="black" 
                  strokeWidth="3"
                />
              </svg>
              <div 
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-3xl comic-font font-bold text-white text-stroke-black"
                style={{textShadow: '2px 2px 0 black'}}>
                {localTask.priority === 'high' ? 'POW!' : localTask.priority === 'medium' ? 'ZAP!' : 'POP!'}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-4 relative z-10">
        <div className="flex justify-between mb-2">
          <div className="flex items-center">
            <motion.span 
              className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold rounded-full ${getPriorityStyle(localTask.priority).bg} ${getPriorityStyle(localTask.priority).text} border-2 border-black mr-2`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              animate={{ 
                y: localTask.priority === 'high' ? [0, -2, 0] : 0
              }}
              transition={{ 
                repeat: localTask.priority === 'high' ? Infinity : 0, 
                duration: 0.5
              }}
            >
              {getPriorityIcon(localTask.priority)} {localTask.priority.charAt(0).toUpperCase() + localTask.priority.slice(1)}
            </motion.span>
            
            {localTask.dueDate && (
              <motion.span 
                className={`inline-flex items-center text-xs font-bold ${
                  getDateStatusClass() === 'red' ? 'text-red-600 bg-red-50' : 
                  getDateStatusClass() === 'yellow' ? 'text-yellow-600 bg-yellow-50' : 
                  'text-blue-600 bg-blue-50'
                } px-2 py-1 rounded-full border-2 border-black`}
                whileHover={{ scale: 1.1 }}
              >
                <FiCalendar className="mr-1" size={12} />
                {format(new Date(localTask.dueDate), 'MMM d')}
              </motion.span>
            )}
          </div>
          
          <AnimatePresence>
            {isHovering && (
              <motion.div
                className="flex items-center space-x-2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(localTask);
                  }}
                  className="p-1.5 text-gray-800 hover:text-blue-500 bg-white border-2 border-black rounded-full shadow-comic-sm"
                  whileHover={{ scale: 1.2, rotate: 15, boxShadow: '2px 2px 0 rgba(0,0,0,0.6)' }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FiEdit size={14} />
                </motion.button>
                
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(localTask.id);
                  }}
                  className="p-1.5 text-gray-800 hover:text-red-500 bg-white border-2 border-black rounded-full shadow-comic-sm"
                  whileHover={{ scale: 1.2, rotate: -15, boxShadow: '2px 2px 0 rgba(0,0,0,0.6)' }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FiTrash size={14} />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <h3 className={`text-base font-bold mb-1 comic-text uppercase ${localTask.priority === 'high' ? 'text-red-800' : ''}`} style={{
          textShadow: localTask.priority === 'high' ? '1px 1px 0 rgba(239, 68, 68, 0.3)' : 'none'
        }}>
          {localTask.title}
        </h3>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div 
              className="mt-3"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="border-t-2 border-dashed border-gray-300 pt-2 mb-2">
                <div className="text-sm text-gray-600 mb-3 comic-text">{localTask.description || "No description provided."}</div>
                
                <div className="flex flex-wrap gap-2">
                  {localTask.assignee && (
                    <motion.div 
                      className="flex items-center text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded-full border-2 border-black"
                      whileHover={{ scale: 1.05 }}
                    >
                      <FiUser className="mr-1" size={12} />
                      {localTask.assignee}
                    </motion.div>
                  )}
                  
                  {localTask.dueDate && (
                    <div className="text-xs font-bold text-gray-700">
                      <span className="font-medium comic-text">{getDaysText()}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <motion.div 
                className="text-xs text-gray-400 mt-2 font-bold italic"
                animate={{ y: [0, -1, 0] }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                Click to collapse
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {!isExpanded && (
          <div className="flex items-center mt-2 justify-between">
            {localTask.assignee && (
              <motion.div 
                className="flex items-center text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded-full border-2 border-black"
                whileHover={{ scale: 1.05 }}
              >
                <FiUser className="mr-1" size={12} />
                {localTask.assignee}
              </motion.div>
            )}
            
            <motion.div
              animate={{ 
                y: [0, -2, 0],
                x: [0, 1, 0, -1, 0]
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                repeatDelay: 2
              }}
              className="text-xs text-gray-500 font-bold italic"
            >
              Click for details!
            </motion.div>
          </div>
        )}
      </div>
      
      {/* Visual embellishments - halftone pattern */}
      <div 
        className="absolute top-0 right-0 w-24 h-24 opacity-15 pointer-events-none z-0 transform rotate-45" 
        style={{
          backgroundImage: `radial-gradient(${getPriorityDotColor(localTask.priority)} 1.5px, transparent 1.5px)`,
          backgroundSize: '8px 8px'
        }}
      />

      {/* Add action lines for all tasks, more intense for high priority */}
      <motion.div 
        className={`absolute bottom-0 right-0 w-full h-8 overflow-hidden pointer-events-none opacity-${
          localTask.priority === 'high' ? '50' : 
          localTask.priority === 'medium' ? '30' : '20'
        }`}
        animate={{ 
          x: localTask.priority === 'high' 
            ? [0, 8, 0, -8, 0] 
            : localTask.priority === 'medium'
              ? [0, 5, 0, -5, 0]
              : [0, 3, 0, -3, 0]
        }}
        transition={{ 
          repeat: Infinity, 
          duration: localTask.priority === 'high' ? 1.5 : 2.5, 
          ease: "easeInOut" 
        }}
      >
        <svg width="100%" height="100%" viewBox="0 0 100 20">
          <line 
            x1="0" y1="5" x2="100" y2="5" 
            stroke={
              localTask.priority === 'high' ? '#ef4444' : 
              localTask.priority === 'medium' ? '#f59e0b' : 
              '#60a5fa'
            } 
            strokeWidth={localTask.priority === 'high' ? 2 : 1.5} 
            strokeDasharray="5,3" 
          />
          <line 
            x1="0" y1="15" x2="100" y2="15" 
            stroke={
              localTask.priority === 'high' ? '#ef4444' : 
              localTask.priority === 'medium' ? '#f59e0b' : 
              '#60a5fa'
            } 
            strokeWidth={localTask.priority === 'high' ? 2 : 1.5} 
            strokeDasharray="5,3" 
          />
        </svg>
      </motion.div>
    </motion.div>
  );
} 