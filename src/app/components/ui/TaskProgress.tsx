'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface TaskProgressProps {
  percentage: number;
  todoCount?: number;
  inProgressCount?: number;
  completedCount?: number;
  totalCount?: number;
  vertical?: boolean;
  compact?: boolean;
}

export function TaskProgress({ 
  percentage, 
  todoCount = 0, 
  inProgressCount = 0, 
  completedCount = 0,
  totalCount = 0,
  vertical = false,
  compact = false
}: TaskProgressProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isHoveringBar, setIsHoveringBar] = useState(false);
  
  useEffect(() => {
    // Show component after data is loaded
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);
  
  // Calculate percentages for each column
  const totalTaskCount = todoCount + inProgressCount + completedCount;
  const todoPercent = totalTaskCount ? Math.floor((todoCount / totalTaskCount) * 100) : 0;
  const inProgressPercent = totalTaskCount ? Math.floor((inProgressCount / totalTaskCount) * 100) : 0;
  const completedPercent = totalTaskCount ? Math.floor((completedCount / totalTaskCount) * 100) : 0;
  
  return (
    <motion.div 
      className={`h-full flex flex-col animation-gpu ${compact ? 'p-2' : 'p-3'}`}
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: isVisible ? 1 : 0
      }}
      transition={{ 
        duration: 0.3,
        ease: "easeOut"
      }}
      style={{
        willChange: 'opacity, transform'
      }}
    >
      <div className={`flex justify-between items-center border-b border-gray-300 ${compact ? 'pb-1 mb-2' : 'pb-2 mb-3'}`}>
        <h3 className={`comic-font font-medium text-gray-800 ${compact ? 'text-sm' : 'text-base'} uppercase`}>Progress</h3>
        <motion.div 
          className="comic-speech-bubble py-0.5 px-2 inline-block"
          whileHover={{ 
            scale: 1.05, 
            rotate: 2
          }}
        >
          <span className={`comic-font ${compact ? 'text-base' : 'text-lg'} font-bold text-black`}>
            {percentage}%
          </span>
        </motion.div>
      </div>
      
      <motion.div 
        className={`${compact ? 'h-2.5' : 'h-3.5'} bg-gray-200 rounded-full ${compact ? 'mb-2' : 'mb-3'} relative overflow-hidden border border-black cursor-pointer`}
        onHoverStart={() => setIsHoveringBar(true)}
        onHoverEnd={() => setIsHoveringBar(false)}
        whileHover={{ scale: 1.02 }}
      >
        <motion.div 
          className="absolute left-0 top-0 h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ 
            width: `${percentage}%`,
            background: "linear-gradient(90deg, #3b82f6 0%, #6366f1 100%)"
          }}
          transition={{ 
            duration: 0.8, 
            ease: "easeOut"
          }}
          style={{
            willChange: 'width'
          }}
        />
      </motion.div>
      
      {totalTaskCount > 0 && !compact && (
        <div className="flex-1 grid grid-cols-3 gap-2 mb-2">
          <div className="flex flex-col items-center">
            <div className="w-6 h-6 flex items-center justify-center bg-blue-100 rounded-full mb-1">
              <span className="text-xs font-bold text-blue-600">{todoCount}</span>
            </div>
            <span className="comic-font text-xs text-blue-800">TODO</span>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-6 h-6 flex items-center justify-center bg-yellow-100 rounded-full mb-1">
              <span className="text-xs font-bold text-yellow-600">{inProgressCount}</span>
            </div>
            <span className="comic-font text-xs text-yellow-800">IN PROGRESS</span>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-6 h-6 flex items-center justify-center bg-green-100 rounded-full mb-1">
              <span className="text-xs font-bold text-green-600">{completedCount}</span>
            </div>
            <span className="comic-font text-xs text-green-800">DONE</span>
          </div>
        </div>
      )}
      
      {compact && (
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>Todo: {todoCount}</span>
          <span>Done: {completedCount}</span>
        </div>
      )}
      
      <div className={`mt-auto ${compact ? 'pt-1' : 'pt-1.5'} border-t border-gray-200 text-center`}>
        <span className="comic-text text-xs text-gray-600">
          {totalTaskCount} total tasks
        </span>
      </div>
    </motion.div>
  );
} 