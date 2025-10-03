import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { 
  FaUsers, 
  FaTasks, 
  FaQuestionCircle, 
  FaChartBar, 
  FaUserCog, 
  FaPlus, 
  FaSearch, 
  FaFilter, 
  FaSort 
} from 'react-icons/fa';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    tasks: 0,
    openQueries: 0,
    completedTasks: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const [usersRes, tasksRes, queriesRes] = await Promise.all([
          api.get('/api/users/stats'),
          api.get('/api/tasks/stats'),
          api.get('/api/queries/stats')
        ]);

        setStats({
          users: usersRes.data.totalUsers,
          tasks: tasksRes.data.totalTasks,
          openQueries: queriesRes.data.openQueries,
          completedTasks: tasksRes.data.completedTasks
        });
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const StatCard = ({ icon, title, value, color, onClick }) => (
    <div 
      className={`bg-gray-800 rounded-lg p-6 shadow-lg cursor-pointer transition-all duration-300 hover:shadow-xl hover:transform hover:-translate-y-1 ${onClick ? 'hover:bg-gray-700' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="p-3 rounded-full bg-opacity-20" style={{ backgroundColor: `${color}20` }}>
          {React.cloneElement(icon, { className: 'text-2xl', style: { color } })}
        </div>
        <div className="text-right">
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-white">
            {loading ? '...' : value.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );

  const QuickAction = ({ icon, title, description, onClick, color }) => (
    <div 
      className="bg-gray-800 rounded-lg p-5 shadow-md cursor-pointer transition-all duration-300 hover:shadow-lg hover:bg-gray-750"
      onClick={onClick}
    >
      <div className="flex items-start">
        <div className="p-3 rounded-full mr-4" style={{ backgroundColor: `${color}20` }}>
          {React.cloneElement(icon, { className: 'text-xl', style: { color } })}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="text-gray-400 text-sm mt-1">{description}</p>
        </div>
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400">Welcome back, {user?.name || 'Admin'}!</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => navigate('/tasks/new')}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaPlus className="mr-2" /> New Task
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          icon={<FaUsers />} 
          title="Total Users" 
          value={stats.users} 
          color="#3B82F6"
          onClick={() => navigate('/admin/users')}
        />
        <StatCard 
          icon={<FaTasks />} 
          title="Active Tasks" 
          value={stats.tasks} 
          color="#10B981"
          onClick={() => navigate('/tasks')}
        />
        <StatCard 
          icon={<FaQuestionCircle />} 
          title="Open Queries" 
          value={stats.openQueries} 
          color="#F59E0B"
          onClick={() => navigate('/queries')}
        />
        <StatCard 
          icon={<FaChartBar />} 
          title="Completed" 
          value={stats.completedTasks} 
          color="#8B5CF6"
        />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickAction
            icon={<FaUserCog />}
            title="Manage Users"
            description="Add, edit, or remove user accounts"
            color="#3B82F6"
            onClick={() => navigate('/admin/users')}
          />
          <QuickAction
            icon={<FaTasks />}
            title="Create Task"
            description="Create a new task and assign it"
            color="#10B981"
            onClick={() => navigate('/tasks/new')}
          />
          <QuickAction
            icon={<FaQuestionCircle />}
            title="View Queries"
            description="Check and respond to user queries"
            color="#F59E0B"
            onClick={() => navigate('/queries')}
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
          <button className="text-blue-400 text-sm hover:underline">View All</button>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex items-center p-3 hover:bg-gray-750 rounded-lg transition-colors">
              <div className="p-2 rounded-full bg-blue-500 bg-opacity-20 text-blue-400 mr-3">
                <FaTasks />
              </div>
              <div className="flex-1">
                <p className="text-white">New task assigned to John Doe</p>
                <p className="text-gray-400 text-sm">2 hours ago</p>
              </div>
              <div className="px-2 py-1 bg-gray-700 text-xs rounded-full">
                View
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
