'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiInfo, FiCalendar, FiCheckCircle } from 'react-icons/fi';

interface PrioritizationHelperProps {
  dueDate: string;
  title: string;
  onSuggestPriority: (priority: 'low' | 'medium' | 'high') => void;
}

export function PrioritizationHelper({ dueDate, title, onSuggestPriority }: PrioritizationHelperProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [suggestedPriority, setSuggestedPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [showTip, setShowTip] = useState(false);
  
  useEffect(() => {
    if (!dueDate) return;
    
    const dueDateObj = new Date(dueDate);
    const today = new Date();
    
    // Calculate days until due
    const diffTime = dueDateObj.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Set priority based on due date urgency
    if (diffDays <= 2) {
      setSuggestedPriority('high');
    } else if (diffDays <= 7) {
      setSuggestedPriority('medium');
    } else {
      setSuggestedPriority('low');
    }
    
    // Add some intelligence based on title keywords
    const urgentKeywords = ['urgent', 'asap', 'immediately', 'critical', 'emergency'];
    const importantKeywords = ['important', 'significant', 'essential', 'key', 'major'];
    
    const titleLower = title.toLowerCase();
    
    if (urgentKeywords.some(word => titleLower.includes(word))) {
      setSuggestedPriority('high');
    } else if (importantKeywords.some(word => titleLower.includes(word))) {
      setSuggestedPriority(prev => prev === 'high' ? 'high' : 'medium');
    }
    
    // Show helper after task has both title and due date
    if (title && dueDate) {
      const timer = setTimeout(() => setIsVisible(true), 300);
      return () => clearTimeout(timer);
    }
  }, [dueDate, title]);
  
  const getPriorityColor = () => {
    switch (suggestedPriority) {
      case 'high': return 'bg-red-50 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-50 text-green-700 border-green-200';
    }
  };
  
  const getPriorityEmoji = () => {
    switch (suggestedPriority) {
      case 'high': return '🔥';
      case 'medium': return '⚡';
      case 'low': return '🍃';
    }
  };
  
  if (!isVisible) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        className={`mt-4 p-3 rounded-md border ${getPriorityColor()} relative`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
      >
        <div className="absolute top-2 right-2 flex items-center">
          <button
            onClick={() => setShowTip(!showTip)}
            className="p-1 text-gray-500 hover:text-gray-700 mr-1"
          >
            <FiInfo size={14} />
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 text-gray-500 hover:text-gray-700"
          >
            <FiX size={14} />
          </button>
        </div>
        
        <div className="flex items-start mb-2">
          <span className="mr-2 text-lg">{getPriorityEmoji()}</span>
          <div>
            <h4 className="text-sm font-medium">Suggested Priority: {suggestedPriority.charAt(0).toUpperCase() + suggestedPriority.slice(1)}</h4>
            <p className="text-xs mt-1 opacity-80">
              Based on due date 
              <span className="inline-flex items-center ml-1">
                <FiCalendar className="mr-1" size={10} />
                {new Date(dueDate).toLocaleDateString()}
              </span>
            </p>
          </div>
        </div>
        
        <AnimatePresence>
          {showTip && (
            <motion.div
              className="text-xs p-2 bg-white/70 backdrop-blur-sm rounded-md mt-2"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <p>
                <span className="font-medium">How we calculated this:</span> Tasks due within 2 days are considered high priority, 
                within a week medium priority, and beyond that low priority. We also analyze your task title 
                for keywords that might indicate urgency.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
        
        <motion.button
          className="mt-2 w-full flex items-center justify-center py-1.5 px-3 rounded-md bg-white text-sm hover:bg-opacity-80 transition-colors"
          onClick={() => {
            onSuggestPriority(suggestedPriority);
            setIsVisible(false);
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <FiCheckCircle className="mr-1" size={14} />
          Use this priority
        </motion.button>
      </motion.div>
    </AnimatePresence>
  );
} 