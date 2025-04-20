'use client';

import { useEffect } from 'react';
import { useToast } from './Toast';

interface KeyboardShortcutsProps {
  onAddTask: () => void;
  onShowHelp: () => void;
}

export function KeyboardShortcuts({ onAddTask, onShowHelp }: KeyboardShortcutsProps) {
  const { showToast } = useToast();
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only respond to keyboard shortcuts when not in an input field
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }
      
      // Ctrl/Cmd + / for help
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        onShowHelp();
        return;
      }
      
      // Simple keyboard shortcuts
      switch (e.key) {
        case 'n':
          // 'n' for new task
          if (!e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
            e.preventDefault();
            onAddTask();
            showToast({
              description: 'Keyboard shortcut: New Task (n)',
              type: 'info'
            });
          }
          break;
          
        case '?':
          // '?' for help
          if (!e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
            e.preventDefault();
            onShowHelp();
          }
          break;
          
        case 'Escape':
          // ESC to cancel any modal that might be open
          // This will be handled by the modal itself
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onAddTask, onShowHelp, showToast]);
  
  // This is a logic-only component, no UI
  return null;
} 