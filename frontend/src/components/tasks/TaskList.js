import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FaSearch, 
  FaFilter, 
  FaSort, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaCheck, 
  FaClock,
  FaExclamationTriangle,
  FaUserCheck,
  FaUserPlus,
  FaTag
} from 'react-icons/fa';
import api from '../../utils/api';

const TaskList = ({ isAdminView = false }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    priority: 'all',
    assignedTo: 'all',
    sortBy: 'createdAt:desc'
  });
  const [users, setUsers] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });
  
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch tasks based on filters and pagination
  const fetchTasks = async () => {
    try {
      setLoading(true);
      
      // Build query params
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.search && { search: filters.search }),
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.priority !== 'all' && { priority: filters.priority }),
        ...(filters.assignedTo !== 'all' && { assignedTo: filters.assignedTo }),
        ...(filters.sortBy && { sortBy: filters.sortBy })
      });

      const res = await api.get(`/api/tasks?${params.toString()}`);
      
      setTasks(res.data.data);
      setPagination({
        ...pagination,
        total: res.data.total,
        pages: Math.ceil(res.data.total / pagination.limit)
      });
    } catch (err) {
      console.error('Error fetching tasks:', err);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  // Fetch users for assignment filter (admin only)
  const fetchUsers = async () => {
    try {
      const res = await api.get('/api/users?role=user');
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  useEffect(() => {
    fetchTasks();
    
    if (isAdminView) {
      fetchUsers();
    }
  }, [filters, pagination.page]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
      ...(name === 'status' && value === 'all' && { assignedTo: 'all' }) // Reset assignedTo if status changes to all
    });
    
    // Reset to first page when filters change
    setPagination(prev => ({
      ...prev,
      page: 1
    }));
  };

  const handleSort = (field) => {
    const [currentField, currentDirection] = filters.sortBy.split(':');
    let direction = 'asc';
    
    if (currentField === field) {
      direction = currentDirection === 'asc' ? 'desc' : 'asc';
    }
    
    setFilters({
      ...filters,
      sortBy: `${field}:${direction}`
    });
  };

  const handleDeleteTask = async () => {
    if (!showDeleteModal) return;
    
    try {
      await api.delete(`/api/tasks/${showDeleteModal}`);
      toast.success('Task deleted successfully');
      setShowDeleteModal(null);
      fetchTasks();
    } catch (err) {
      console.error('Error deleting task:', err);
      toast.error('Failed to delete task');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/api/tasks/${taskId}`, { status: newStatus });
      toast.success('Task status updated');
      fetchTasks();
    } catch (err) {
      console.error('Error updating task status:', err);
      toast.error('Failed to update task status');
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'pending': { bg: 'bg-yellow-100 text-yellow-800', icon: <FaClock className="mr-1" />, label: 'Pending' },
      'in-progress': { bg: 'bg-blue-100 text-blue-800', icon: <FaClock className="mr-1" />, label: 'In Progress' },
      'completed': { bg: 'bg-green-100 text-green-800', icon: <FaCheck className="mr-1" />, label: 'Completed' },
      'on-hold': { bg: 'bg-red-100 text-red-800', icon: <FaExclamationTriangle className="mr-1" />, label: 'On Hold' }
    };
    
    const statusInfo = statusMap[status] || { bg: 'bg-gray-100 text-gray-800', icon: null, label: status };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.bg}`}>
        {statusInfo.icon}
        {statusInfo.label}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityMap = {
      'low': 'bg-green-100 text-green-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'high': 'bg-orange-100 text-orange-800',
      'critical': 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityMap[priority] || 'bg-gray-100 text-gray-800'}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  const getSortIcon = (field) => {
    const [currentField, currentDirection] = filters.sortBy.split(':');
    
    if (currentField !== field) return null;
    
    return currentDirection === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="bg-gray-900 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {isAdminView ? 'All Tasks' : 'My Tasks'}
            </h1>
            <p className="text-gray-400">
              {isAdminView 
                ? 'Manage and track all tasks across the platform' 
                : 'View and manage your assigned tasks'}
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <FaFilter className="mr-2" />
              Filters
            </button>
            
            <Link
              to="/tasks/new"
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaPlus className="mr-2" />
              New Task
            </Link>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-gray-800 rounded-lg p-4 mb-6 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Search</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="search"
                    value={filters.search}
                    onChange={handleFilterChange}
                    placeholder="Search tasks..."
                    className="pl-10 block w-full bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 py-2 px-3"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="block w-full bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="on-hold">On Hold</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Priority</label>
                <select
                  name="priority"
                  value={filters.priority}
                  onChange={handleFilterChange}
                  className="block w-full bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
                >
                  <option value="all">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              
              {isAdminView && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Assigned To</label>
                  <select
                    name="assignedTo"
                    value={filters.assignedTo}
                    onChange={handleFilterChange}
                    className="block w-full bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
                    disabled={filters.status === 'all'}
                  >
                    <option value="all">Everyone</option>
                    {users.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  setFilters({
                    search: '',
                    status: 'all',
                    priority: 'all',
                    assignedTo: 'all',
                    sortBy: 'createdAt:desc'
                  });
                }}
                className="text-sm text-gray-400 hover:text-white"
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}

        {/* Tasks Table */}
        <div className="bg-gray-800 shadow-lg rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-750">
                <tr>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white"
                    onClick={() => handleSort('title')}
                  >
                    <div className="flex items-center">
                      Title
                      <span className="ml-1">{getSortIcon('title')}</span>
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                  >
                    Priority
                  </th>
                  {isAdminView && (
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                    >
                      Created By
                    </th>
                  )}
                  {isAdminView && (
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                    >
                      Assigned To
                    </th>
                  )}
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('dueDate')}
                  >
                    <div className="flex items-center">
                      Due Date
                      <span className="ml-1">{getSortIcon('dueDate')}</span>
                    </div>
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={isAdminView ? 6 : 5} className="px-6 py-8 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                      </div>
                    </td>
                  </tr>
                ) : tasks.length > 0 ? (
                  tasks.map((task) => (
                    <tr key={task._id} className="hover:bg-gray-750 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="ml-4">
                            <div className="text-sm font-medium text-white">
                              <Link to={`/tasks/${task._id}`} className="hover:text-blue-400">
                                {task.title}
                              </Link>
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {new Date(task.createdAt).toLocaleDateString()}
                            </div>
                            {task.tags && task.tags.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {task.tags.slice(0, 2).map((tag, index) => (
                                  <span 
                                    key={index} 
                                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-700 text-gray-300"
                                  >
                                    <FaTag className="mr-1 text-xs" />
                                    {tag}
                                  </span>
                                ))}
                                {task.tags.length > 2 && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-700 text-gray-400">
                                    +{task.tags.length - 2} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task._id, e.target.value)}
                          className={`text-xs rounded-md py-1 px-2 focus:outline-none focus:ring-1 ${
                            task.status === 'completed' 
                              ? 'bg-green-900 text-green-100 border-green-700' 
                              : task.status === 'in-progress'
                              ? 'bg-blue-900 text-blue-100 border-blue-700'
                              : task.status === 'on-hold'
                              ? 'bg-red-900 text-red-100 border-red-700'
                              : 'bg-yellow-900 text-yellow-100 border-yellow-700'
                          } border`}
                        >
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="on-hold">On Hold</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPriorityBadge(task.priority)}
                      </td>
                      {isAdminView && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center">
                              <FaUser className="text-gray-400" />
                            </div>
                            <div className="ml-2">
                              <div className="text-sm text-gray-200">
                                {task.createdBy?.name || 'System'}
                              </div>
                              <div className="text-xs text-gray-400">
                                {new Date(task.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </td>
                      )}
                      {isAdminView && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {task.assignedTo ? (
                              <>
                                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center">
                                  <FaUser className="text-gray-400" />
                                </div>
                                <div className="ml-2">
                                  <div className="text-sm text-gray-200">
                                    {task.assignedTo.name}
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    {task.assignedTo.email}
                                  </div>
                                </div>
                              </>
                            ) : (
                              <span className="text-gray-400 text-sm">Unassigned</span>
                            )}
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {task.dueDate ? (
                          <>
                            <div className={new Date(task.dueDate) < new Date() && task.status !== 'completed' ? 'text-red-400' : ''}>
                              {new Date(task.dueDate).toLocaleDateString()}
                            </div>
                            {new Date(task.dueDate) < new Date() && task.status !== 'completed' && (
                              <div className="text-xs text-red-400">Overdue</div>
                            )}
                          </>
                        ) : (
                          'No due date'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link
                            to={`/tasks/${task._id}`}
                            className="text-blue-400 hover:text-blue-300"
                            title="View/Edit"
                          >
                            <FaEdit className="inline" />
                          </Link>
                          {(task.createdBy._id === user.id || user.role === 'admin') && (
                            <button
                              onClick={() => setShowDeleteModal(task._id)}
                              className="text-red-400 hover:text-red-300 ml-2"
                              title="Delete"
                            >
                              <FaTrash className="inline" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={isAdminView ? 6 : 5} className="px-6 py-8 text-center text-gray-400">
                      No tasks found matching your criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="bg-gray-750 px-4 py-3 flex items-center justify-between border-t border-gray-700 sm:px-6">
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-400">
                    Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(pagination.page * pagination.limit, pagination.total)}
                    </span>{' '}
                    of <span className="font-medium">{pagination.total}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setPagination({ ...pagination, page: Math.max(1, pagination.page - 1) })}
                      disabled={pagination.page === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-600 bg-gray-700 text-sm font-medium ${
                        pagination.page === 1 ? 'text-gray-500 cursor-not-allowed' : 'text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      <span className="sr-only">Previous</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                      // Show pages around current page
                      let pageNum;
                      if (pagination.pages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page >= pagination.pages - 2) {
                        pageNum = pagination.pages - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPagination({ ...pagination, page: pageNum })}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            pagination.page === pageNum
                              ? 'z-10 bg-blue-600 border-blue-600 text-white'
                              : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => setPagination({ ...pagination, page: Math.min(pagination.pages, pagination.page + 1) })}
                      disabled={pagination.page === pagination.pages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-600 bg-gray-700 text-sm font-medium ${
                        pagination.page === pagination.pages ? 'text-gray-500 cursor-not-allowed' : 'text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      <span className="sr-only">Next</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <FaTrash className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="mt-3 text-lg font-medium text-white">Delete Task</h3>
              <div className="mt-2">
                <p className="text-sm text-gray-300">
                  Are you sure you want to delete this task? This action cannot be undone.
                </p>
              </div>
              <div className="mt-6 flex justify-center space-x-4">
                <button
                  type="button"
                  className="px-4 py-2 text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                  onClick={() => setShowDeleteModal(null)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                  onClick={handleDeleteTask}
                  disabled={loading}
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;
