import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import TaskForm from './TaskForm';
import TaskList from './TaskList';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching tasks from:', `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/tasks`);
      const res = await api.get('/tasks');
      console.log('Tasks response:', res.data);
      
      // Handle paginated response with tasks in data.data
      const tasks = Array.isArray(res.data.data) ? res.data.data : [];
      
      if (!Array.isArray(tasks)) {
        console.error('Unexpected response format:', res.data);
        throw new Error('Invalid response format: expected an array of tasks');
      }
      setTasks(tasks);
    } catch (err) {
      console.error('Error fetching tasks:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setError(err.response?.data?.message || 'Failed to fetch tasks');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-neon">Dashboard</h1>
      <div className="mt-4">
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-neon"></div>
            <p className="mt-2">Loading tasks...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TaskForm onTaskAdded={fetchTasks} />
            <TaskList tasks={tasks} refresh={fetchTasks} />
          </div>
        )}
      </div>
    </div>
  );
}
