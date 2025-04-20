'use client';

import { Board } from './components/Board';
import { motion, AnimatePresence } from 'framer-motion';
import { FiLayout, FiGitBranch, FiBell, FiUser, FiSearch, FiSettings, FiInfo, FiCoffee } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { SearchProvider, useSearch } from './hooks/useSearch';

// Create a functional search input component that uses the search context
function SearchInput() {
  const { searchTerm, setSearchTerm } = useSearch();
  
  return (
    <motion.div 
      className="hidden md:flex items-center relative px-3 py-2 bg-white border-2 border-black rounded-full w-64 transition-all duration-200 group shadow-sm"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      whileHover={{ boxShadow: '3px 3px 0 rgba(0,0,0,0.8)' }}
    >
      <FiSearch className="text-gray-700 group-hover:text-blue-500 mr-2 transition-colors duration-200" size={16} />
      <input 
        type="text" 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search tasks..." 
        className="bg-transparent border-none outline-none text-sm w-full placeholder-gray-400 comic-text"
      />
      {searchTerm && (
        <button 
          onClick={() => setSearchTerm('')}
          className="text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      )}
    </motion.div>
  );
}

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const [showInfoTooltip, setShowInfoTooltip] = useState(false);

  // Simulate loading and display splash screen
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <SearchProvider>
      <>
        {/* Comic-style splash screen */}
        <AnimatePresence>
          {showSplash && (
            <motion.div 
              className="fixed inset-0 bg-yellow-400 flex flex-col items-center justify-center z-50"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                initial={{ scale: 0.8, rotate: -5 }}
                animate={{ scale: 1, rotate: 5 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 20 
                }}
                className="comic-3d-title text-6xl mb-3"
              >
                TaskMatrix
              </motion.div>
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="comic-text text-xl font-bold"
              >
                Loading your tasks...
              </motion.div>

              <motion.div 
                className="mt-8 relative w-64 h-6 bg-white border-3 border-black rounded-full overflow-hidden"
                initial={{ width: 0 }}
                animate={{ width: "16rem" }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <motion.div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-500"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 0.4, duration: 1 }}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="min-h-screen flex flex-col">
          
          <header className="bg-white border-b-4 border-black py-3 px-4 md:px-6 flex justify-between items-center sticky top-0 z-50 shadow-comic">
            <motion.div 
              className="flex items-center"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, type: 'spring' }}
            >
              <motion.div 
                className="flex items-center bg-gradient-to-r from-red-500 to-yellow-500 text-white p-2 rounded-lg mr-3 shadow-md border-2 border-black relative overflow-hidden"
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                initial={{ rotate: -5 }}
                animate={{ rotate: 0 }}
                transition={{ duration: 0.3 }}
              >
                <FiLayout size={18} />
                <motion.div 
                  className="absolute inset-0 bg-white"
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 1.5, 
                    ease: "linear",
                    repeatDelay: 3
                  }}
                  style={{ opacity: 0.2 }}
                />
              </motion.div>
              <div>
                <div className="font-['Bangers'] text-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-transparent bg-clip-text">
                  TaskMatrix
                </div>
                <div className="comic-text text-xs text-gray-500">Super-Powered Task Management</div>
              </div>
            </motion.div>
            
            <SearchInput />
            
            <motion.div 
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, type: 'spring' }}
            >
              <motion.button
                className="flex items-center justify-center w-9 h-9 rounded-full text-gray-600 hover:text-blue-500 hover:bg-blue-50 relative transition-colors duration-200 border-2 border-black bg-white"
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                onHoverStart={() => setShowInfoTooltip(true)}
                onHoverEnd={() => setShowInfoTooltip(false)}
              >
                <FiInfo size={18} />
                <AnimatePresence>
                  {showInfoTooltip && (
                    <motion.div 
                      className="comic-speech-bubble absolute right-0 top-full mt-2 w-48 text-xs z-50"
                      initial={{ opacity: 0, scale: 0.8, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <p className="font-bold">Welcome to TaskMatrix!</p>
                      <p className="mt-1">Drag tasks between columns to update their status. Click a task to see details.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
              
              <motion.button
                className="flex items-center justify-center w-9 h-9 rounded-full text-gray-600 hover:text-blue-500 hover:bg-blue-50 relative transition-colors duration-200 border-2 border-black bg-white"
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiBell size={18} />
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    type: 'spring',
                    stiffness: 500, 
                    delay: 1
                  }}
                  className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"
                ></motion.span>
              </motion.button>
              
              <motion.button
                className="flex items-center justify-center w-9 h-9 rounded-full text-gray-600 hover:text-blue-500 hover:bg-blue-50 relative transition-colors duration-200 border-2 border-black bg-white"
                whileHover={{ scale: 1.05, rotate: 15 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiSettings size={18} />
              </motion.button>
              
              <motion.a 
                href="https://github.com" 
                target="_blank" 
                className="hidden md:flex items-center comic-text text-sm text-gray-600 hover:text-gray-900 px-3 py-1 rounded-md hover:bg-white border-2 border-black transition-all duration-200 bg-yellow-100 shadow-sm"
                whileHover={{ scale: 1.03, y: -1, boxShadow: '3px 3px 0 rgba(0,0,0,0.8)' }}
              >
                <FiGitBranch className="mr-1" />
                <span>v1.0</span>
              </motion.a>
              
              <motion.div
                className="h-9 w-9 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-md cursor-pointer overflow-hidden border-2 border-black relative"
                whileHover={{ scale: 1.05, rotate: 5, boxShadow: '3px 3px 0 rgba(0,0,0,0.8)' }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="comic-font text-sm font-bold">N</span>
                <motion.div 
                  className="absolute inset-0 bg-white" 
                  initial={{ y: "-100%" }}
                  animate={{ y: "100%" }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 2, 
                    ease: "easeInOut",
                    repeatDelay: 5
                  }}
                  style={{ opacity: 0.1 }}
                />
              </motion.div>
            </motion.div>
          </header>
          
          <div className="w-full">
            <Board />
          </div>
        </main>
      </>
    </SearchProvider>
  );
}
