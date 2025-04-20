'use client';

import { useState } from 'react';
import { 
  DndContext, 
  DragEndEvent, 
  DragOverEvent, 
  DragStartEvent, 
  PointerSensor, 
  useSensor, 
  useSensors,
  closestCenter,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import { 
  arrayMove,
  SortableContext,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Task } from '../types';
import { useBoard } from '../hooks/useBoard';
import { useSearch } from '../hooks/useSearch';
import { Column } from './Column';
import { TaskForm } from './TaskForm';
import { FiPlus, FiFilter, FiChevronDown, FiChevronRight, FiChevronLeft, FiColumns, FiX, FiSearch } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { TaskCard } from './TaskCard';
import { useToast } from './ui/Toast';
import { TaskAnalytics } from './TaskAnalytics';

const dropAnimationConfig = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.5',
      },
    },
  }),
};

export function Board() {
  const { board, addTask, updateTask, deleteTask, moveTask, addColumn, deleteColumn, isLoading } = useBoard();
  const { searchTerm, setSearchTerm } = useSearch();
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [initialStatus, setInitialStatus] = useState<Task['status']>('todo');
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [activeDraggedTask, setActiveDraggedTask] = useState<Task | null>(null);
  const [isColumnFormOpen, setIsColumnFormOpen] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [isDeleteColumnConfirmOpen, setIsDeleteColumnConfirmOpen] = useState(false);
  const [deletingColumnId, setDeletingColumnId] = useState<string | null>(null);
  const [targetColumnId, setTargetColumnId] = useState<string>('');
  const { showToast } = useToast();
  const [priorityFilter, setPriorityFilter] = useState<Task['priority'] | 'all'>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string | 'all'>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const uniqueAssignees = Object.values(board?.tasks || {}).reduce<string[]>((acc, task) => {
    if (task.assignee && !acc.includes(task.assignee)) {
      acc.push(task.assignee);
    }
    return acc;
  }, []);

  const getFilteredTasks = (columnId: string) => {
    const column = board?.columns[columnId];
    if (!column || !column.taskIds) return [];
    
    return column.taskIds.filter(taskId => {
      const task = board?.tasks[taskId];
      if (!task) return false;
      
      // Apply priority filter
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
        return false;
      }
      
      // Apply assignee filter
      if (assigneeFilter !== 'all') {
        if (!task.assignee || task.assignee !== assigneeFilter) {
          return false;
        }
      }
      
      // Apply search filter if search term exists
      if (searchTerm.trim() !== '') {
        const searchLower = searchTerm.toLowerCase();
        const titleMatch = task.title.toLowerCase().includes(searchLower);
        const descriptionMatch = task.description.toLowerCase().includes(searchLower);
        const assigneeMatch = task.assignee ? task.assignee.toLowerCase().includes(searchLower) : false;
        
        if (!titleMatch && !descriptionMatch && !assigneeMatch) {
          return false;
        }
      }
      
      return true;
    });
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleAddTask = (status: Task['status'] = 'todo') => {
    setInitialStatus(status);
    setEditingTask(undefined);
    setIsTaskFormOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskFormOpen(true);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const taskId = event.active.id as string;
    setActiveTaskId(taskId);

    if (board.tasks[taskId]) {
      setActiveDraggedTask(board.tasks[taskId]);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over || !active) return;
    
    const activeTaskId = active.id as string;
    const overTaskId = over.id as string;
    
    if (activeTaskId === overTaskId) return;
    
    const activeColumn = Object.values(board.columns).find(column => 
      column.taskIds.includes(activeTaskId)
    );
    
    const overColumn = Object.values(board.columns).find(column => 
      column.taskIds.includes(overTaskId) || column.id === overTaskId
    );
    
    if (!activeColumn || !overColumn) return;
    
    if (overTaskId === overColumn.id) {
      if (activeColumn.id !== overColumn.id) {
        const activeIndex = activeColumn.taskIds.indexOf(activeTaskId);
        
        moveTask(
          activeTaskId,
          activeColumn.id,
          overColumn.id,
          activeIndex,
          overColumn.taskIds.length
        );
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveTaskId(null);
    setActiveDraggedTask(null);
    
    if (!over) return;
    
    const activeTaskId = active.id as string;
    const overTaskId = over.id as string;
    
    const activeColumn = Object.values(board.columns).find(column => 
      column.taskIds.includes(activeTaskId)
    );
    
    const overColumn = Object.values(board.columns).find(column => 
      column.taskIds.includes(overTaskId) || column.id === overTaskId
    );
    
    if (!activeColumn || !overColumn) return;
    
    if (overTaskId !== overColumn.id) {
      const activeIndex = activeColumn.taskIds.indexOf(activeTaskId);
      const overIndex = overColumn.taskIds.indexOf(overTaskId);
      
      if (activeColumn.id === overColumn.id) {
        moveTask(
          activeTaskId,
          activeColumn.id,
          overColumn.id,
          activeIndex,
          overIndex
        );
      } else {
        moveTask(
          activeTaskId,
          activeColumn.id,
          overColumn.id,
          activeIndex,
          overIndex
        );
      }
    } else {
      const activeIndex = activeColumn.taskIds.indexOf(activeTaskId);
      
      moveTask(
        activeTaskId,
        activeColumn.id,
        overColumn.id,
        activeIndex,
        overColumn.taskIds.length
      );
    }
  };

  const handleAddColumn = () => {
    if (!newColumnTitle.trim()) {
      showToast({
        title: "Error",
        description: "Column title cannot be empty",
        type: "error"
      });
      return;
    }

    const success = addColumn(newColumnTitle);
    
    if (success) {
      showToast({
        title: "Column added",
        description: `${newColumnTitle} column was successfully added`,
        type: "success"
      });
      setNewColumnTitle('');
      setIsColumnFormOpen(false);
    } else {
      showToast({
        title: "Error",
        description: "A column with this name already exists",
        type: "error"
      });
    }
  };

  const handleDeleteColumn = (columnId: string, targetColumnId?: string) => {
    const success = deleteColumn(columnId, targetColumnId);
    
    if (success) {
      showToast({
        title: "Column deleted",
        description: "Column was successfully deleted",
        type: "success"
      });
    }
  };

  const totalTasks = Object.values(board.tasks).length;
  const completedTasks = Object.values(board.tasks).filter(task => task.status === 'done').length;
  const inProgressTasks = Object.values(board.tasks).filter(task => task.status === 'in-progress').length;
  const todoTasks = Object.values(board.tasks).filter(task => task.status === 'todo').length;

  const clearFilters = () => {
    setPriorityFilter('all');
    setAssigneeFilter('all');
    setSearchTerm('');
    setIsFilterOpen(false);
  };

  if (isLoading) {
    return (
      <div className="relative p-4 h-full flex flex-col overflow-hidden">
        <div className="relative z-10 flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Project Board</h1>
            <p className="text-sm text-gray-500">Loading your tasks...</p>
          </div>
          <div className="bg-blue-500/30 h-10 w-28 rounded-md animate-pulse"></div>
        </div>

        <div className="flex justify-center items-center flex-1">
          <div className="flex flex-col items-center">
            <div className="flex space-x-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-72 h-96 bg-gray-100/50 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative p-4 flex flex-col board-container">
        <motion.div 
          className="relative z-10 flex mb-6 w-full"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {/* Left side: Title */}
          <div className="flex-grow relative">
            {/* POW! effect behind title */}
            <motion.div 
              className="absolute -top-4 -left-8 text-7xl font-bold text-yellow-500 opacity-70 comic-font transform -rotate-12 z-0"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.7 }}
              transition={{ delay: 0.5, duration: 0.3, type: 'spring' }}
            >
              <span className="text-stroke-black">POW!</span>
            </motion.div>
            
            <motion.h1 
              className="comic-font text-5xl text-black tracking-wider uppercase transform -rotate-1 relative z-10"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, type: 'spring' }}
              style={{
                textShadow: '3px 3px 0 #FFF, 6px 6px 0 rgba(0,0,0,0.2)'
              }}
            >
              PROJECT BOARD
            </motion.h1>
            
            <motion.div 
              className="comic-text text-sm text-gray-700 ml-1 relative"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <p>Organize your tasks with drag and drop</p>
              
              {/* Action lines */}
              <motion.div 
                className="absolute -right-16 top-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <svg width="60" height="20" viewBox="0 0 60 20">
                  <motion.path 
                    d="M0,10 L60,10" 
                    stroke="#000" 
                    strokeWidth="1.5"
                    strokeDasharray="6 4"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                  />
                  <motion.path 
                    d="M0,5 L50,5" 
                    stroke="#000" 
                    strokeWidth="1.5"
                    strokeDasharray="6 4"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.6, delay: 0.9 }}
                  />
                  <motion.path 
                    d="M0,15 L40,15" 
                    stroke="#000" 
                    strokeWidth="1.5"
                    strokeDasharray="6 4"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.4, delay: 1 }}
                  />
                </svg>
              </motion.div>
            </motion.div>
          </div>
          
          {/* Right side: Buttons */}
          <div className="flex items-center gap-3 relative">
            <motion.button
              onClick={() => setIsColumnFormOpen(true)}
              className="comic-button px-4 py-2 flex items-center space-x-1 text-sm bg-purple-400 border-3 border-black transform rotate-1"
              whileHover={{ scale: 1.05, rotate: -2, boxShadow: '5px 5px 0 rgba(0,0,0,0.5)' }}
              whileTap={{ scale: 0.95, rotate: 0 }}
              style={{ filter: 'drop-shadow(3px 3px 0 rgba(0,0,0,0.2))' }}
              title="Add new column"
            >
              <FiColumns size={14} />
              <span className="font-bold">Add Column</span>
            </motion.button>
            
            <motion.button
              className="comic-button px-4 py-2 flex items-center space-x-1 text-sm border-3 border-black bg-blue-300 transform -rotate-1"
              whileHover={{ scale: 1.05, rotate: 2, boxShadow: '5px 5px 0 rgba(0,0,0,0.5)' }}
              whileTap={{ scale: 0.95, rotate: 0 }}
              style={{ filter: 'drop-shadow(3px 3px 0 rgba(0,0,0,0.2))' }}
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <FiFilter size={14} className={priorityFilter !== 'all' || assigneeFilter !== 'all' ? 'text-blue-600' : ''} />
              <span className="font-bold">Filter</span>
              <FiChevronDown size={14} />
            </motion.button>
            
            <AnimatePresence>
              {isFilterOpen && (
                <motion.div 
                  className="absolute right-0 top-12 mt-1 z-50 bg-white border-4 border-black shadow-comic rounded-md w-64 p-3 space-y-4 transform rotate-1"
                  initial={{ opacity: 0, y: -10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.9 }}
                  transition={{ duration: 0.15 }}
                  style={{ boxShadow: '5px 5px 0 rgba(0,0,0,0.3)' }}
                >
                  {/* Priority filter */}
                  <div>
                    <div className="font-medium mb-2 text-sm comic-text uppercase">Priority</div>
                    <div className="space-y-1">
                      {['all', 'low', 'medium', 'high'].map((priority) => (
                        <div 
                          key={priority} 
                          onClick={() => setPriorityFilter(priority as Task['priority'] | 'all')}
                          className={`cursor-pointer px-2 py-1 rounded text-sm flex items-center comic-text ${priorityFilter === priority ? 'bg-blue-100 text-blue-800 font-bold border border-blue-400' : 'hover:bg-gray-100'}`}
                        >
                          {priority === 'high' && (
                            <span className="w-3 h-3 bg-red-500 rounded-full mr-2 border border-black"></span>
                          )}
                          {priority === 'medium' && (
                            <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2 border border-black"></span>
                          )}
                          {priority === 'low' && (
                            <span className="w-3 h-3 bg-green-500 rounded-full mr-2 border border-black"></span>
                          )}
                          {priority === 'all' && (
                            <span className="w-3 h-3 bg-gray-300 rounded-full mr-2 border border-black"></span>
                          )}
                          {priority.charAt(0).toUpperCase() + priority.slice(1)}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Assignee filter */}
                  <div>
                    <div className="font-medium mb-2 text-sm comic-text uppercase">Assignee</div>
                    <div className="space-y-1 max-h-36 overflow-y-auto">
                      <div 
                        onClick={() => setAssigneeFilter('all')}
                        className={`cursor-pointer px-2 py-1 rounded text-sm comic-text ${assigneeFilter === 'all' ? 'bg-blue-100 text-blue-800 font-bold border border-blue-400' : 'hover:bg-gray-100'}`}
                      >
                        All Assignees
                      </div>
                      {uniqueAssignees.map((assignee) => (
                        <div 
                          key={assignee} 
                          onClick={() => setAssigneeFilter(assignee)}
                          className={`cursor-pointer px-2 py-1 rounded text-sm comic-text ${assigneeFilter === assignee ? 'bg-blue-100 text-blue-800 font-bold border border-blue-400' : 'hover:bg-gray-100'}`}
                        >
                          {assignee}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Filter controls */}
                  <div className="pt-2 border-t-2 border-dashed border-black flex justify-between">
                    <button 
                      onClick={clearFilters}
                      className="text-xs text-gray-600 hover:text-gray-900 comic-text font-bold"
                    >
                      Clear filters
                    </button>
                    <button
                      onClick={() => setIsFilterOpen(false)}
                      className="text-xs bg-blue-500 text-white px-2 py-1 rounded border-2 border-black hover:bg-blue-600 comic-text font-bold transform rotate-1"
                      style={{ boxShadow: '2px 2px 0 rgba(0,0,0,0.3)' }}
                    >
                      Apply
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <motion.button
              onClick={() => handleAddTask()}
              className="comic-button px-4 py-2 flex items-center space-x-1 text-sm bg-red-400 border-3 border-black transform rotate-1 relative"
              whileHover={{ scale: 1.05, rotate: 3, boxShadow: '5px 5px 0 rgba(0,0,0,0.5)' }}
              whileTap={{ scale: 0.95, rotate: 0 }}
              style={{ filter: 'drop-shadow(3px 3px 0 rgba(0,0,0,0.2))' }}
            >
              <FiPlus size={14} />
              <span className="font-bold">Add Task</span>
              
              {/* ZAP effect */}
              <motion.div 
                className="absolute -top-3 -right-7 text-xs font-bold text-yellow-400"
                initial={{ opacity: 0, rotate: 15 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <svg width="30" height="30" viewBox="0 0 30 30">
                  <path 
                    d="M15,0 L18,12 L30,15 L18,18 L15,30 L12,18 L0,15 L12,12 Z" 
                    fill="#FFFF00" 
                    stroke="#000" 
                    strokeWidth="1"
                  />
                </svg>
              </motion.div>
            </motion.button>
          </div>
        </motion.div>
        
        <div className="flex-1 py-2">
          <div className="flex h-full gap-4">
            <div className="flex-1">
              {/* Show active filters */}
              {(priorityFilter !== 'all' || assigneeFilter !== 'all' || searchTerm.trim() !== '') && (
                <motion.div 
                  className="flex flex-wrap items-center gap-2 mb-5 px-4 py-2 mx-2 bg-white border-3 border-black rounded-md comic-speech-bubble search-bubble"
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                >
                  <span className="text-sm font-bold text-gray-800 comic-text uppercase">Active filters:</span>
                  
                  {priorityFilter !== 'all' && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 border-2 border-black rounded text-xs comic-text transform -rotate-1 filter-bubble">
                      <span className="font-bold">Priority:</span> 
                      <span className="flex items-center">
                        {priorityFilter === 'high' && <span className="w-2 h-2 bg-red-500 rounded-full mr-1 border border-black"></span>}
                        {priorityFilter === 'medium' && <span className="w-2 h-2 bg-yellow-500 rounded-full mr-1 border border-black"></span>}
                        {priorityFilter === 'low' && <span className="w-2 h-2 bg-green-500 rounded-full mr-1 border border-black"></span>}
                        {priorityFilter.charAt(0).toUpperCase() + priorityFilter.slice(1)}
                      </span>
                      <button 
                        onClick={() => setPriorityFilter('all')}
                        className="ml-1 text-gray-500 hover:text-gray-700"
                      >
                        <FiX size={12} />
                      </button>
                    </div>
                  )}
                  
                  {assigneeFilter !== 'all' && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-green-100 border-2 border-black rounded text-xs comic-text transform rotate-1 filter-bubble">
                      <span className="font-bold">Assignee:</span> {assigneeFilter}
                      <button 
                        onClick={() => setAssigneeFilter('all')}
                        className="ml-1 text-gray-500 hover:text-gray-700"
                      >
                        <FiX size={12} />
                      </button>
                    </div>
                  )}
                  
                  {searchTerm.trim() !== '' && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 border-2 border-black rounded text-xs comic-text transform -rotate-1 filter-bubble">
                      <FiSearch size={10} className="mr-1" />
                      <span className="font-bold">Search:</span> {searchTerm}
                      <button 
                        onClick={() => setSearchTerm('')}
                        className="ml-1 text-gray-500 hover:text-gray-700"
                      >
                        <FiX size={12} />
                      </button>
                    </div>
                  )}
                  
                  <button 
                    onClick={clearFilters}
                    className="text-xs bg-red-100 text-red-600 hover:text-red-800 comic-text border-2 border-black px-2 py-1 rounded font-bold transform rotate-1"
                    style={{ boxShadow: '2px 2px 0 rgba(0,0,0,0.1)' }}
                  >
                    Clear all!
                  </button>
                </motion.div>
              )}
              
              {/* Mobile Analytics - Shown above columns on smaller screens */}
              <div className="lg:hidden mb-6">
                <TaskAnalytics board={board} />
              </div>
              
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
              >
                <div className="h-full flex justify-center pb-4">
                  <SortableContext items={Object.values(board.columns).map(col => col.id)} strategy={horizontalListSortingStrategy}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-8 w-full max-w-[1400px] mx-auto p-2 auto-rows-auto grid-flow-row items-start align-start">
                      {board.columnOrder.map(columnId => {
                        const column = board.columns[columnId];
                        return (
                          <Column
                            key={columnId}
                            id={columnId}
                            title={column.title}
                            tasks={getFilteredTasks(columnId).map(taskId => board.tasks[taskId])}
                            onTaskEdit={handleEditTask}
                            onTaskDelete={deleteTask}
                            onAddTask={() => handleAddTask(columnId as Task['status'])}
                            onColumnDelete={() => {
                              setDeletingColumnId(columnId);
                              setIsDeleteColumnConfirmOpen(true);
                            }}
                            availableColumns={board.columns}
                          />
                        );
                      })}
                    </div>
                  </SortableContext>
                </div>

                <DragOverlay dropAnimation={dropAnimationConfig}>
                  {activeTaskId && activeDraggedTask ? (
                    <div 
                      className="w-72 transform rotate-3 z-50"
                      style={{ 
                        filter: 'drop-shadow(3px 3px 0 rgba(0,0,0,0.3))'
                      }}
                    >
                      <TaskCard 
                        task={activeDraggedTask} 
                        onEdit={() => {}} 
                        onDelete={() => {}} 
                      />
                      
                      {/* ZOOM effect when dragging */}
                      <motion.div 
                        className="absolute -top-10 -left-5 text-3xl font-bold text-yellow-500 comic-font transform -rotate-12 z-50"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <span className="text-stroke-black">ZOOM!</span>
                      </motion.div>
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
            </div>

            {/* Analytics Sidebar */}
            <div className="hidden lg:block w-80 pr-4">
              <TaskAnalytics board={board} />
            </div>
          </div>
        </div>
      </div>
      
      <AnimatePresence>
        {isColumnFormOpen && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsColumnFormOpen(false)}
          >
            <motion.div 
              className="bg-white rounded-lg border-4 border-black hand-drawn-border w-full max-w-md shadow-comic relative transform rotate-1"
              initial={{ scale: 0.9, y: 20, opacity: 0, rotate: -3 }}
              animate={{ scale: 1, y: 0, opacity: 1, rotate: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0, rotate: 3 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              style={{ boxShadow: '8px 8px 0 rgba(0,0,0,0.3)' }}
            >
              {/* KAPOW! effect */}
              <motion.div 
                className="absolute -top-20 -left-20 text-7xl font-bold text-yellow-500 comic-font transform -rotate-12 z-10"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <span className="text-stroke-black">KAPOW!</span>
              </motion.div>
            
              <div className="flex justify-between items-center p-5 border-b-4 border-black bg-gradient-to-r from-purple-500 to-indigo-500 text-white comic-font">
                <h2 className="text-xl uppercase tracking-wide">
                  Add New Column
                </h2>
                <motion.button
                  onClick={() => setIsColumnFormOpen(false)}
                  className="bg-white text-gray-800 hover:bg-red-100 hover:text-red-500 transition-colors p-1 rounded-full border-3 border-black"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FiX size={20} />
                </motion.button>
              </div>
              
              <div className="p-5">
                <div className="mb-5">
                  <label htmlFor="columnTitle" className="block comic-text font-bold text-gray-700 mb-2 uppercase">
                    Column Title
                  </label>
                  <input
                    type="text"
                    id="columnTitle"
                    value={newColumnTitle}
                    onChange={(e) => setNewColumnTitle(e.target.value)}
                    placeholder="Enter column title"
                    className="w-full px-3 py-2 border-3 border-black rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-comic-sm comic-text"
                  />
                </div>
                
                <div className="flex justify-end gap-3">
                  <motion.button
                    type="button"
                    onClick={() => setIsColumnFormOpen(false)}
                    className="px-4 py-2 border-3 border-black bg-white hover:bg-gray-100 rounded-md shadow-comic-sm comic-font transform -rotate-1"
                    whileHover={{ scale: 1.03, rotate: 1, boxShadow: '4px 4px 0 rgba(0,0,0,0.3)' }}
                    whileTap={{ scale: 0.97 }}
                  >
                    CANCEL
                  </motion.button>
                  
                  <motion.button
                    type="button"
                    onClick={handleAddColumn}
                    className="px-4 py-2 border-3 border-black bg-purple-500 text-white hover:bg-purple-600 rounded-md shadow-comic comic-font flex items-center transform rotate-1"
                    whileHover={{ scale: 1.03, rotate: -1, boxShadow: '4px 4px 0 rgba(0,0,0,0.3)' }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <FiPlus className="mr-2" />
                    ADD COLUMN
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {isTaskFormOpen && (
          <TaskForm
            task={editingTask}
            initialStatus={initialStatus}
            onClose={() => setIsTaskFormOpen(false)}
            columns={board.columns}
            onSave={(taskData) => {
              if (editingTask) {
                updateTask(editingTask.id, {
                  title: taskData.title,
                  description: taskData.description,
                  status: taskData.status,
                  priority: taskData.priority,
                  dueDate: taskData.dueDate || null,
                  assignee: taskData.assignee || null
                });
                showToast({
                  title: "Task updated",
                  description: "Your task was successfully updated",
                  type: "success"
                });
              } else {
                addTask(
                  taskData.title,
                  taskData.description,
                  taskData.status,
                  taskData.priority,
                  taskData.dueDate,
                  taskData.assignee
                );
                showToast({
                  title: "Task created",
                  description: "Your new task was successfully added",
                  type: "success"
                });
              }
              setIsTaskFormOpen(false);
            }}
          />
        )}
      </AnimatePresence>
      
      {/* Delete Column Confirmation Modal */}
      <AnimatePresence>
        {isDeleteColumnConfirmOpen && deletingColumnId && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsDeleteColumnConfirmOpen(false)}
          >
            <motion.div 
              className="bg-white rounded-lg border-4 border-black hand-drawn-border w-full max-w-md shadow-comic relative transform rotate-1"
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              style={{ boxShadow: '8px 8px 0 rgba(0,0,0,0.3)' }}
            >
              {/* BOOM! effect */}
              <motion.div 
                className="absolute -top-20 -right-10 text-6xl font-bold text-red-500 comic-font transform rotate-12 z-10"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <span className="text-stroke-black">BOOM!</span>
              </motion.div>
            
              <div className="flex justify-between items-center p-5 border-b-4 border-black bg-gradient-to-r from-red-500 to-orange-500 text-white comic-font">
                <h2 className="text-xl uppercase tracking-wide">
                  Delete Column
                </h2>
                <motion.button
                  onClick={() => setIsDeleteColumnConfirmOpen(false)}
                  className="bg-white text-gray-800 hover:bg-red-100 hover:text-red-500 transition-colors p-1 rounded-full border-3 border-black"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FiX size={20} />
                </motion.button>
              </div>
              
              <div className="p-5">
                <div className="mb-5 comic-text">
                  <p className="text-lg font-bold mb-2">Are you sure you want to delete this column?</p>
                  <p className="text-gray-700">All tasks in this column will be lost unless you move them to another column.</p>
                  
                  {Object.values(board.columns[deletingColumnId]?.taskIds || {}).length > 0 && (
                    <div className="mt-4">
                      <p className="font-bold mb-2">Move tasks to:</p>
                      <select
                        className="w-full px-3 py-2 border-3 border-black rounded-md shadow-comic-sm comic-text"
                        value={targetColumnId}
                        onChange={(e) => setTargetColumnId(e.target.value)}
                      >
                        <option value="">None (delete tasks)</option>
                        {Object.values(board.columns)
                          .filter(col => col.id !== deletingColumnId)
                          .map(col => (
                            <option key={col.id} value={col.id}>{col.title}</option>
                          ))
                        }
                      </select>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end gap-3">
                  <motion.button
                    type="button"
                    onClick={() => setIsDeleteColumnConfirmOpen(false)}
                    className="px-4 py-2 border-3 border-black bg-white hover:bg-gray-100 rounded-md shadow-comic-sm comic-font transform -rotate-1"
                    whileHover={{ scale: 1.03, rotate: 1, boxShadow: '4px 4px 0 rgba(0,0,0,0.3)' }}
                    whileTap={{ scale: 0.97 }}
                  >
                    CANCEL
                  </motion.button>
                  
                  <motion.button
                    type="button"
                    onClick={() => {
                      handleDeleteColumn(deletingColumnId, targetColumnId || undefined);
                      setIsDeleteColumnConfirmOpen(false);
                      setDeletingColumnId(null);
                      setTargetColumnId('');
                    }}
                    className="px-4 py-2 border-3 border-black bg-red-500 text-white hover:bg-red-600 rounded-md shadow-comic comic-font transform rotate-1"
                    whileHover={{ scale: 1.03, rotate: -1, boxShadow: '4px 4px 0 rgba(0,0,0,0.3)' }}
                    whileTap={{ scale: 0.97 }}
                  >
                    DELETE COLUMN
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 