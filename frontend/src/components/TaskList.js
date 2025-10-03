import React, { useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function TaskList({ tasks, refresh }) {
  const [taskToDelete, setTaskToDelete] = useState(null);
  const { user } = useAuth();

  // Ensure tasks is an array before mapping
  const safeTasks = Array.isArray(tasks) ? tasks : [];

  return (
    <div className="space-y-3">
      {safeTasks.length === 0 && <div className="bg-gray-800 p-4 rounded">No tasks yet</div>}
      {safeTasks.map(t => (
        <div key={t._id} className="bg-gray-800 p-4 rounded">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-lg font-semibold">{t.title}</h4>
              <p className="text-sm mt-1">{t.description}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {t.tags?.map(tag => (
                  <span 
                    key={tag}
                    className="
                      inline-flex items-center px-3 py-1 rounded-md 
                      bg-gradient-to-br from-green-400 to-green-600 
                      text-black text-xs font-medium
                      shadow-lg shadow-green-900/50
                      transform transition-all duration-200
                      hover:shadow-green-400/70 hover:scale-105
                      border border-green-300/30
                      relative
                      before:absolute before:inset-0 before:bg-green-400/20 before:rounded-md
                      before:opacity-0 hover:before:opacity-100
                      before:transition-opacity before:duration-300
                      overflow-hidden
                      group
                    "
                  >
                    <span className="relative z-10 flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-100 mr-1.5 group-hover:animate-pulse"></span>
                      {tag}
                    </span>
                    <span className="absolute inset-0 bg-gradient-to-b from-green-400/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  </span>
                ))}
              </div>
            </div>
            <div>
              <button 
                onClick={() => setTaskToDelete(t._id)}
                className="text-red-400 hover:text-red-300"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
      
      {/* Confirmation Dialog */}
      {taskToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
            <p className="mb-6">Are you sure you want to delete this task?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setTaskToDelete(null)}
                className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await api.delete(`/tasks/${taskToDelete}`);
                    setTaskToDelete(null);
                    refresh();
                  } catch (err) {
                    console.error('Error deleting task:', err);
                    alert('Failed to delete task');
                  }
                }}
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
