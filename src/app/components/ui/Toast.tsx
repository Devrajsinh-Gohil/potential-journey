'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiX, FiAlertCircle, FiCheckCircle, FiInfo } from 'react-icons/fi';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastNotification {
  title?: string;
  description?: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (messageOrObject: string | ToastNotification, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (messageOrObject: string | ToastNotification, typeArg?: ToastType) => {
    const id = Math.random().toString(36).substr(2, 9);
    
    // Handle both string messages and notification objects
    if (typeof messageOrObject === 'string') {
      const type = typeArg || 'info';
      setToasts(prev => [...prev, { id, message: messageOrObject, type }]);
    } else {
      const { title, description, type } = messageOrObject;
      const message = description || title || '';
      setToasts(prev => [...prev, { 
        id, 
        message,
        type
      }]);
    }
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => {
        setToasts(prev => prev.slice(1));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toasts]);

  // Get icon based on toast type
  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <FiCheckCircle className="text-green-500" size={20} />;
      case 'error':
        return <FiAlertCircle className="text-red-500" size={20} />;
      case 'info':
      default:
        return <FiInfo className="text-blue-500" size={20} />;
    }
  };

  // Get background color based on toast type
  const getBackgroundColor = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              className={`${getBackgroundColor(toast.type)} backdrop-blur-sm border p-3 rounded-lg shadow-lg flex items-start max-w-xs`}
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              <div className="flex-shrink-0 mr-2">{getIcon(toast.type)}</div>
              <div className="flex-grow mr-2">
                <p className="text-sm text-gray-800">{toast.message}</p>
              </div>
              <button 
                onClick={() => removeToast(toast.id)} 
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
} 