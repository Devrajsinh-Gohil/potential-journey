'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ColumnHeaderProps { 
  children: ReactNode;
  className?: string;
  count?: number;
}

export function ColumnHeader({ 
  children, 
  className = '', 
  count = 0 
}: ColumnHeaderProps) {
  return (
    <motion.div
      className={`flex items-center justify-between py-3 px-3 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-center">
        {children}
        {count > 0 && (
          <motion.span 
            className="ml-2 px-2 py-0.5 bg-white rounded-full text-xs font-medium border-2 border-black"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1, rotate: 10 }}
            transition={{ type: 'spring', stiffness: 500 }}
          >
            {count}
          </motion.span>
        )}
      </div>
    </motion.div>
  );
} 