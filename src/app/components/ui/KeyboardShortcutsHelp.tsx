'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Shortcut {
  key: string;
  description: string;
}

export function KeyboardShortcutsHelp({ isOpen, onClose }: KeyboardShortcutsHelpProps) {
  const shortcuts: Shortcut[] = [
    { key: 'n', description: 'Create a new task' },
    { key: '?', description: 'Show this help dialog' },
    { key: 'Ctrl + /', description: 'Show this help dialog' },
    { key: 'Esc', description: 'Close dialogs' },
  ];
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="comic-panel bg-yellow-50 rounded-lg p-6 max-w-md w-full m-4"
            initial={{ scale: 0.9, y: 20, rotate: -1 }}
            animate={{ scale: 1, y: 0, rotate: 1 }}
            exit={{ scale: 0.9, y: 20, rotate: -2 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="comic-font text-xl uppercase text-black">Keyboard Shortcuts</h2>
              <button 
                className="comic-button text-gray-800 p-1 w-8 h-8 flex items-center justify-center"
                onClick={onClose}
              >
                <FiX size={20} />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="comic-text text-sm text-gray-700 mb-4">
                Use these keyboard shortcuts for faster navigation and task management:
              </p>
              
              <div className="space-y-2">
                {shortcuts.map((shortcut, index) => (
                  <motion.div 
                    key={index}
                    className="flex items-center justify-between py-2 border-b-2 border-black border-dashed"
                    initial={{ opacity: 0, y: 10, rotate: -1 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      rotate: index % 2 === 0 ? 1 : -1,
                      transition: { delay: index * 0.1 } 
                    }}
                  >
                    <span className="comic-text text-gray-800">{shortcut.description}</span>
                    <kbd className="px-3 py-1 hand-drawn-border bg-white text-sm text-black font-mono">
                      {shortcut.key}
                    </kbd>
                  </motion.div>
                ))}
              </div>
            </div>
            
            <div className="comic-speech-bubble text-xs text-center mt-6">
              Press <kbd className="px-2 py-0.5 hand-drawn-border bg-white rounded text-xs">Esc</kbd> to close
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 