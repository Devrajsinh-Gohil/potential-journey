'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface MotionCardProps {
  children: ReactNode;
  className?: string;
  isDragging?: boolean;
  delay?: number;
  onClick?: () => void;
}

export function MotionCard({ 
  children, 
  className = '', 
  isDragging = false,
  delay = 0,
  onClick
}: MotionCardProps) {
  return (
    <motion.div
      className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ${className} ${
        isDragging ? 'shadow-lg border-blue-300 z-50' : ''
      } overflow-hidden relative`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: isDragging ? 0.9 : 1, 
        y: 0,
        scale: isDragging ? 1.03 : 1,
        rotate: isDragging ? 1 : 0,
        boxShadow: isDragging 
          ? '0 10px 25px rgba(0, 0, 0, 0.1)' 
          : '0 2px 10px rgba(0, 0, 0, 0.05)'
      }}
      exit={{ opacity: 0, scale: 0.9, y: -20 }}
      whileHover={{ 
        scale: isDragging ? 1.03 : 1.02, 
        y: -2,
        boxShadow: '0 8px 15px rgba(0, 0, 0, 0.1)',
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ 
        duration: 0.2,
        delay,
        type: 'spring', 
        stiffness: 500, 
        damping: 30 
      }}
      onClick={onClick}
    >
      {/* Remove gradient and glow effects */}
      {children}
    </motion.div>
  );
}

// Special variant for column headers
export function ColumnHeader({ 
  children, 
  className = '', 
  count = 0 
}: { 
  children: ReactNode;
  className?: string;
  count?: number;
}) {
  return (
    <motion.div
      className={`flex items-center justify-between py-2 px-2 mb-3 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center">
        {children}
        {count > 0 && (
          <motion.span 
            className="ml-2 px-2 py-0.5 bg-gray-200 rounded-full text-xs text-gray-600 font-medium"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1, backgroundColor: 'var(--primary-light)' }}
            transition={{ type: 'spring', stiffness: 500 }}
          >
            {count}
          </motion.span>
        )}
      </div>
    </motion.div>
  );
}

// Badge component for priorities, tags, etc.
export function MotionBadge({ 
  children, 
  className = '',
  color = 'blue'
}: { 
  children: ReactNode;
  className?: string;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';
}) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800 border-black hover:bg-blue-200',
    green: 'bg-green-100 text-green-800 border-black hover:bg-green-200',
    yellow: 'bg-yellow-100 text-yellow-800 border-black hover:bg-yellow-200',
    red: 'bg-red-100 text-red-800 border-black hover:bg-red-200',
    purple: 'bg-purple-100 text-purple-800 border-black hover:bg-purple-200',
    gray: 'bg-gray-100 text-gray-800 border-black hover:bg-gray-200',
  };

  return (
    <motion.span
      className={`hand-drawn-border inline-flex items-center px-2 py-1 rounded-md text-xs border-2 shadow-sm ${colorClasses[color]} ${className}`}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 500 }}
      whileHover={{ 
        scale: 1.1,
        y: -2,
        rotate: [-1, 1],
        boxShadow: '2px 2px 0 rgba(0,0,0,0.8)'
      }}
    >
      {children}
    </motion.span>
  );
} 