'use client';

import { motion } from 'framer-motion';
import { Board, Task } from '../types';
import { FiCheckCircle, FiClock, FiBarChart2, FiUsers, FiCalendar, FiAlertCircle } from 'react-icons/fi';

interface TaskAnalyticsProps {
  board: Board;
}

export function TaskAnalytics({ board }: TaskAnalyticsProps) {
  // Count total tasks and completion status
  const totalTasks = Object.keys(board.tasks).length;
  const todoCount = board.columns['todo']?.taskIds.length || 0;
  const inProgressCount = board.columns['in-progress']?.taskIds.length || 0;
  const doneCount = board.columns['done']?.taskIds.length || 0;
  
  // Count by priority
  const highPriorityCount = Object.values(board.tasks).filter(task => task.priority === 'high').length;
  const mediumPriorityCount = Object.values(board.tasks).filter(task => task.priority === 'medium').length;
  const lowPriorityCount = Object.values(board.tasks).filter(task => task.priority === 'low').length;
  
  // Calculate percentages for progress bars
  const todoPercentage = totalTasks > 0 ? (todoCount / totalTasks) * 100 : 0;
  const inProgressPercentage = totalTasks > 0 ? (inProgressCount / totalTasks) * 100 : 0;
  const donePercentage = totalTasks > 0 ? (doneCount / totalTasks) * 100 : 0;
  
  // Calculate overall completion percentage
  const completionPercentage = totalTasks > 0 ? (doneCount / totalTasks) * 100 : 0;
  
  // Assignee workload analytics
  interface AssigneeData {
    name: string;
    todoCount: number;
    inProgressCount: number;
    doneCount: number;
    totalCount: number;
  }
  
  const assignees = Object.values(board.tasks).reduce<Record<string, AssigneeData>>((acc, task) => {
    const assignee = task.assignee || 'Unassigned';
    if (!acc[assignee]) {
      acc[assignee] = {
        name: assignee,
        todoCount: 0,
        inProgressCount: 0,
        doneCount: 0,
        totalCount: 0
      };
    }
    
    // Increment the appropriate counter based on task status
    if (task.status === 'todo') {
      acc[assignee].todoCount++;
    } else if (task.status === 'in-progress') {
      acc[assignee].inProgressCount++;
    } else if (task.status === 'done') {
      acc[assignee].doneCount++;
    }
    
    acc[assignee].totalCount++;
    return acc;
  }, {});
  
  // Sort assignees by total tasks (descending)
  const sortedAssignees = Object.values(assignees).sort((a, b) => b.totalCount - a.totalCount);
  
  // Due date analytics
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  const todayISOString = today.toISOString().split('T')[0];
  const tomorrowISOString = tomorrow.toISOString().split('T')[0];
  const nextWeekISOString = nextWeek.toISOString().split('T')[0];
  
  // Count tasks by due date
  const dueDateCounts = Object.values(board.tasks).reduce(
    (acc, task) => {
      if (!task.dueDate) {
        acc.noDueDate++;
        return acc;
      }
      
      const dueDate = task.dueDate.split('T')[0]; // Get just the date part
      
      if (dueDate < todayISOString && task.status !== 'done') {
        acc.overdue++;
      } else if (dueDate === todayISOString) {
        acc.dueToday++;
      } else if (dueDate === tomorrowISOString) {
        acc.dueTomorrow++;
      } else if (dueDate <= nextWeekISOString) {
        acc.dueThisWeek++;
      } else {
        acc.dueLater++;
      }
      
      return acc;
    },
    { 
      overdue: 0,
      dueToday: 0,
      dueTomorrow: 0,
      dueThisWeek: 0,
      dueLater: 0,
      noDueDate: 0
    }
  );
  
  return (
    <motion.div 
      className="comic-panel border-3 border-black bg-white p-4 lg:p-5 shadow-comic rounded-lg transform rotate-1"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <FiBarChart2 size={22} className="text-purple-600" />
          <h2 className="comic-font text-xl font-bold">Task Analytics</h2>
        </div>
        <div className="comic-text text-sm">
          <span className="font-bold">{totalTasks}</span> total tasks
        </div>
      </div>
      
      {/* Responsive Layout */}
      <div className="lg:block flex flex-col gap-4">
        {/* Overall Completion Ring */}
        <div className="lg:flex lg:justify-center items-center mb-6 hidden">
          <div className="relative w-28 h-28">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="12"
              />
              {/* Progress circle */}
              <motion.circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#10b981"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${completionPercentage * 2.51} 251`}
                strokeDashoffset="0"
                transform="rotate(-90 50 50)"
                initial={{ strokeDasharray: "0 251" }}
                animate={{ strokeDasharray: `${completionPercentage * 2.51} 251` }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="comic-font text-2xl font-bold">{Math.round(completionPercentage)}%</span>
              <span className="comic-text text-xs">Complete</span>
            </div>
          </div>
        </div>
        
        {/* Mobile Completion Bar */}
        <div className="lg:hidden mb-4">
          <div className="flex justify-between comic-text text-xs mb-1">
            <span className="font-bold">Overall Completion</span>
            <span>{Math.round(completionPercentage)}%</span>
          </div>
          <div className="w-full h-6 bg-gray-200 rounded-full border-2 border-black overflow-hidden">
            <motion.div 
              className="h-full bg-green-500 flex items-center justify-center"
              initial={{ width: 0 }}
              animate={{ width: `${completionPercentage}%` }}
              transition={{ duration: 1 }}
            >
              {completionPercentage > 15 && (
                <span className="text-white text-xs font-bold">{Math.round(completionPercentage)}%</span>
              )}
            </motion.div>
          </div>
        </div>
        
        {/* Status Progress Bars */}
        <div className="lg:space-y-4 space-y-2 mb-6">
          <h3 className="comic-text text-sm font-bold uppercase mb-2">Task Status</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-1 md:grid-cols-3 gap-2">
            <div className="space-y-1">
              <div className="flex justify-between comic-text text-xs">
                <span className="flex items-center">
                  <span className="w-3 h-3 bg-blue-500 rounded-full mr-1 border border-black"></span>
                  To Do
                </span>
                <span>{todoCount} tasks</span>
              </div>
              <div className="w-full h-4 bg-gray-200 rounded-full border-2 border-black overflow-hidden">
                <motion.div 
                  className="h-full bg-blue-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${todoPercentage}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between comic-text text-xs">
                <span className="flex items-center">
                  <span className="w-3 h-3 bg-yellow-500 rounded-full mr-1 border border-black"></span>
                  In Progress
                </span>
                <span>{inProgressCount} tasks</span>
              </div>
              <div className="w-full h-4 bg-gray-200 rounded-full border-2 border-black overflow-hidden">
                <motion.div 
                  className="h-full bg-yellow-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${inProgressPercentage}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between comic-text text-xs">
                <span className="flex items-center">
                  <span className="w-3 h-3 bg-green-500 rounded-full mr-1 border border-black"></span>
                  Done
                </span>
                <span>{doneCount} tasks</span>
              </div>
              <div className="w-full h-4 bg-gray-200 rounded-full border-2 border-black overflow-hidden">
                <motion.div 
                  className="h-full bg-green-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${donePercentage}%` }}
                  transition={{ duration: 1, delay: 0.4 }}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Due Date Analytics */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <FiCalendar size={16} className="text-orange-500" />
            <h3 className="comic-text text-sm font-bold uppercase">Due Date Analytics</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mb-2">
            {dueDateCounts.overdue > 0 && (
              <motion.div 
                className="flex items-center p-2 border-2 border-black rounded-md bg-red-100"
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                transition={{ repeat: 2, repeatType: "reverse", duration: 0.5 }}
              >
                <FiAlertCircle size={16} className="text-red-500 mr-2" />
                <div className="comic-text text-xs">
                  <span className="font-bold text-red-600">{dueDateCounts.overdue}</span> overdue
                </div>
              </motion.div>
            )}
            
            {dueDateCounts.dueToday > 0 && (
              <div className="flex items-center p-2 border-2 border-black rounded-md bg-orange-100">
                <FiClock size={16} className="text-orange-500 mr-2" />
                <div className="comic-text text-xs">
                  <span className="font-bold text-orange-600">{dueDateCounts.dueToday}</span> due today
                </div>
              </div>
            )}
            
            {dueDateCounts.dueTomorrow > 0 && (
              <div className="flex items-center p-2 border-2 border-black rounded-md bg-yellow-100">
                <FiClock size={16} className="text-yellow-600 mr-2" />
                <div className="comic-text text-xs">
                  <span className="font-bold text-yellow-600">{dueDateCounts.dueTomorrow}</span> due tomorrow
                </div>
              </div>
            )}
            
            {dueDateCounts.dueThisWeek > 0 && (
              <div className="flex items-center p-2 border-2 border-black rounded-md bg-blue-100">
                <FiCalendar size={16} className="text-blue-500 mr-2" />
                <div className="comic-text text-xs">
                  <span className="font-bold text-blue-600">{dueDateCounts.dueThisWeek}</span> due this week
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-between comic-text text-xs">
            <div>No due date: <span className="font-bold">{dueDateCounts.noDueDate}</span></div>
            <div>Due later: <span className="font-bold">{dueDateCounts.dueLater}</span></div>
          </div>
        </div>
        
        {/* Assignee Workload */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-2">
            <FiUsers size={16} className="text-purple-500" />
            <h3 className="comic-text text-sm font-bold uppercase">Assignee Workload</h3>
          </div>
          
          <div className="space-y-3">
            {sortedAssignees.length === 0 ? (
              <div className="text-center p-3 border-2 border-dashed border-gray-300 rounded-md comic-text text-sm text-gray-500">
                No assignees yet
              </div>
            ) : (
              sortedAssignees.slice(0, 4).map(assignee => (
                <div key={assignee.name} className="space-y-1">
                  <div className="flex justify-between comic-text text-xs">
                    <div className="font-medium truncate max-w-[170px]" title={assignee.name}>
                      {assignee.name}
                    </div>
                    <div>
                      <span className="font-bold">{assignee.totalCount}</span> tasks
                    </div>
                  </div>
                  <div className="w-full h-5 bg-gray-200 rounded-md border-2 border-black overflow-hidden flex">
                    <motion.div 
                      className="h-full bg-blue-500 flex-shrink-0"
                      initial={{ width: 0 }}
                      animate={{ width: `${(assignee.todoCount / assignee.totalCount) * 100}%` }}
                      transition={{ duration: 0.8 }}
                    />
                    <motion.div 
                      className="h-full bg-yellow-500 flex-shrink-0"
                      initial={{ width: 0 }}
                      animate={{ width: `${(assignee.inProgressCount / assignee.totalCount) * 100}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    />
                    <motion.div 
                      className="h-full bg-green-500 flex-shrink-0"
                      initial={{ width: 0 }}
                      animate={{ width: `${(assignee.doneCount / assignee.totalCount) * 100}%` }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                    />
                  </div>
                </div>
              ))
            )}
            
            {sortedAssignees.length > 4 && (
              <div className="text-center comic-text text-xs text-gray-500">
                +{sortedAssignees.length - 4} more assignees
              </div>
            )}
          </div>
          
          {sortedAssignees.length > 0 && (
            <div className="mt-2 flex justify-between comic-text text-xs text-gray-500">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 mr-1"></div>
                <span>To Do</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-yellow-500 mr-1"></div>
                <span>In Progress</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 mr-1"></div>
                <span>Done</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Priority Distribution */}
        <div>
          <h3 className="comic-text text-sm font-bold uppercase mb-2">Priority Distribution</h3>
          <div className="flex justify-between gap-2 comic-text">
            <div className="flex-1 bg-red-100 p-2 rounded-md border-2 border-black text-center">
              <div className="font-bold">{highPriorityCount}</div>
              <div className="text-xs">High</div>
            </div>
            <div className="flex-1 bg-yellow-100 p-2 rounded-md border-2 border-black text-center">
              <div className="font-bold">{mediumPriorityCount}</div>
              <div className="text-xs">Medium</div>
            </div>
            <div className="flex-1 bg-green-100 p-2 rounded-md border-2 border-black text-center">
              <div className="font-bold">{lowPriorityCount}</div>
              <div className="text-xs">Low</div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 