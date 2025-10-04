import React, { useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function TaskList({ tasks, refresh }) {
  const [taskToDelete, setTaskToDelete] = useState(null);
  const { user } = useAuth();

  const handleDelete = async () => {
    if (!taskToDelete) return;
    
    try {
      await api.delete(`/tasks/${taskToDelete}`);
      setTaskToDelete(null);
      if (refresh) refresh(); // Refresh the task list
    } catch (error) {
      console.error('Error deleting task:', error);
      // You might want to show an error toast here
    }
  };

  // Ensure tasks is an array before mapping
  const safeTasks = Array.isArray(tasks) ? tasks : [];

  return (
    <div className="space-y-3">
      {safeTasks.length === 0 && (
        <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 shadow-lg">
          <p className="text-center text-gray-400">No tasks yet. Create your first task to get started!</p>
        </div>
      )}
      {safeTasks.map(t => (
        <div key={t._id} className="bg-gray-800/70 backdrop-blur-sm p-5 rounded-xl border border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-lg font-semibold">{t.title}</h4>
              <p className="text-sm mt-1">{t.description}</p>
              <div className="mt-2 space-y-2">
                <div className="flex flex-wrap gap-2">
                  {t.tags?.map(tag => (
                    <span 
                      key={tag} 
                      className="relative inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-green-400 to-neon text-black shadow-lg hover:shadow-neon/50 transition-all duration-200 transform hover:-translate-y-0.5 hover:scale-105 active:translate-y-0 active:scale-95"
                      style={{
                        textShadow: '0 0 5px rgba(0, 255, 136, 0.5)',
                        boxShadow: '0 4px 0 0 rgba(0, 255, 136, 0.3), 0 2px 10px 0 rgba(0, 255, 136, 0.2)'
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                {t.createdBy && (
                  <div className="flex items-center text-xs text-gray-400">
                    <span>Created by: </span>
                    <span className="ml-1 font-medium text-gray-300">
                      {typeof t.createdBy === 'object' 
                        ? t.createdBy.name || t.createdBy.email || 'Unknown User'
                        : 'User'}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div>
              <button 
                onClick={() => setTaskToDelete(t._id)}
                className="relative px-4 py-1.5 bg-gradient-to-br from-red-500 to-pink-600 text-white rounded-lg font-medium shadow-lg hover:shadow-red-500/30 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 active:shadow-inner"
                style={{
                  textShadow: '0 1px 1px rgba(0, 0, 0, 0.2)',
                  boxShadow: '0 4px 0 0 rgba(220, 38, 38, 0.8), 0 2px 10px 0 rgba(220, 38, 38, 0.4)'
                }}
              >
                <span className="relative z-10">Delete</span>
                <span className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent rounded-lg opacity-0 hover:opacity-100 transition-opacity"></span>
              </button>
            </div>
          </div>
        </div>
      ))}
      
      {/* Confirmation Dialog */}
      {taskToDelete && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800/90 border border-gray-700 p-6 rounded-xl max-w-md w-full shadow-2xl transform transition-all duration-300 scale-95 hover:scale-100">
            <h3 className="text-xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-pink-500">Confirm Deletion</h3>
            <p className="mb-6 text-gray-300">Are you sure you want to delete this task? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setTaskToDelete(null)}
                className="relative px-5 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg font-medium shadow-lg hover:shadow-gray-500/20 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
                style={{
                  boxShadow: '0 3px 0 0 rgba(75, 85, 99, 0.8)'
                }}
              >
                <span className="relative z-10">Cancel</span>
                <span className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-lg opacity-0 hover:opacity-100 transition-opacity"></span>
              </button>
              <button
                onClick={handleDelete}
                className="relative px-5 py-2 bg-gradient-to-br from-red-500 to-pink-600 text-white rounded-lg font-medium shadow-lg hover:shadow-red-500/30 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
                style={{
                  textShadow: '0 1px 1px rgba(0, 0, 0, 0.2)',
                  boxShadow: '0 4px 0 0 rgba(220, 38, 38, 0.8), 0 2px 15px 0 rgba(220, 38, 38, 0.3)'
                }}
              >
                <span className="relative z-10">Delete</span>
                <span className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent rounded-lg opacity-0 hover:opacity-100 transition-opacity"></span>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

