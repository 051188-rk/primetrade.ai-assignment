import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FaArrowLeft, 
  FaEdit, 
  FaTrash, 
  FaCheck, 
  FaClock, 
  FaExclamationTriangle,
  FaUser,
  FaCalendarAlt,
  FaTag,
  FaPaperclip,
  FaComment,
  FaReply,
  FaEllipsisV
} from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import api from '../../utils/api';

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [status, setStatus] = useState('');
  const { user } = useAuth();

  // Fetch task details
  useEffect(() => {
    const fetchTask = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/tasks/${id}`);
        setTask(res.data);
        setStatus(res.data.status);
      } catch (err) {
        console.error('Error fetching task:', err);
        setError('Failed to load task details');
        toast.error('Failed to load task');
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [id]);

  // Handle status change
  const handleStatusChange = async (newStatus) => {
    try {
      setStatus(newStatus);
      await api.put(`/api/tasks/${id}`, { status: newStatus });
      setTask({ ...task, status: newStatus });
      toast.success('Status updated successfully');
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error('Failed to update status');
      setStatus(task.status); // Revert on error
    }
  };

  // Handle comment submission
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      setSubmittingComment(true);
      const res = await api.post(`/api/tasks/${id}/comments`, {
        text: commentText
      });n      
      setTask({
        ...task,
        comments: [...(task.comments || []), res.data]
      });
      
      setCommentText('');
      toast.success('Comment added');
    } catch (err) {
      console.error('Error adding comment:', err);
      toast.error('Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  // Handle task deletion
  const handleDeleteTask = async () => {
    try {
      await api.delete(`/api/tasks/${id}`);
      toast.success('Task deleted successfully');
      navigate('/tasks');
    } catch (err) {
      console.error('Error deleting task:', err);
      toast.error('Failed to delete task');
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get status badge
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

  // Get priority badge
  const getPriorityBadge = (priority) => {
    const priorityMap = {
      'low': 'bg-green-100 text-green-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'high': 'bg-orange-100 text-orange-800',
      'critical': 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        priorityMap[priority] || 'bg-gray-100 text-gray-800'
      }`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Task not found</h3>
        <p className="mt-1 text-sm text-gray-500">The requested task could not be found.</p>
        <div className="mt-6">
          <Link
            to="/tasks"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FaArrowLeft className="mr-2" />
            Back to Tasks
          </Link>
        </div>
      </div>
    );
  }

  const isAssignedToCurrentUser = task.assignedTo?._id === user?.id;
  const canEdit = task.createdBy._id === user?.id || user?.role === 'admin' || isAssignedToCurrentUser;

  return (
    <div className="bg-gray-900 min-h-screen">
      {/* Task Header */}
      <div className="bg-gray-800 px-6 py-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="mr-4 p-1 rounded-full text-gray-400 hover:text-white hover:bg-gray-700"
            >
              <FaArrowLeft />
            </button>
            <h1 className="text-2xl font-bold text-white">{task.title}</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="relative">
              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="appearance-none bg-gray-700 border border-gray-600 text-white text-sm rounded-lg pl-3 pr-8 py-1.5 focus:ring-blue-500 focus:border-blue-500"
                disabled={!canEdit}
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="on-hold">On Hold</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
            
            <div className="relative">
              <button
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full"
                onClick={() => setShowDeleteModal(true)}
                disabled={!canEdit}
              >
                <FaTrash />
              </button>
              
              {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                  <div className="bg-gray-800 rounded-lg p-6 max-w-sm w-full">
                    <h3 className="text-lg font-medium text-white mb-4">Delete Task</h3>
                    <p className="text-gray-300 mb-6">Are you sure you want to delete this task? This action cannot be undone.</p>
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => setShowDeleteModal(false)}
                        className="px-4 py-2 text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleDeleteTask}
                        className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <Link
              to={`/tasks/${task._id}/edit`}
              state={{ from: location.pathname }}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full"
            >
              <FaEdit />
            </Link>
          </div>
        </div>
        
        <div className="mt-4 flex flex-wrap items-center text-sm text-gray-400 space-x-4">
          <div className="flex items-center">
            <FaUser className="mr-1 text-gray-500" />
            <span>Created by {task.createdBy?.name || 'Unknown'}</span>
          </div>
          {task.assignedTo && (
            <div className="flex items-center">
              <FaUserCheck className="mr-1 text-gray-500" />
              <span>Assigned to {task.assignedTo.name}</span>
            </div>
          )}
          <div className="flex items-center">
            <FaCalendarAlt className="mr-1 text-gray-500" />
            <span>Created {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}</span>
          </div>
          {task.dueDate && (
            <div className={`flex items-center ${
              new Date(task.dueDate) < new Date() && task.status !== 'completed' ? 'text-red-400' : ''
            }`}>
              <FaCalendarAlt className="mr-1" />
              <span>Due {formatDate(task.dueDate)}</span>
            </div>
          )}
        </div>
        
        {task.tags && task.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {task.tags.map((tag, index) => (
              <span 
                key={index} 
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                <FaTag className="mr-1 text-xs" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left Sidebar */}
          <div className="md:w-1/4 space-y-6">
            {/* Task Details Card */}
            <div className="bg-gray-800 rounded-lg shadow p-4">
              <h3 className="text-lg font-medium text-white mb-4">Task Details</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-400">Status</p>
                  <p className="mt-1">{getStatusBadge(task.status)}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-400">Priority</p>
                  <p className="mt-1">{getPriorityBadge(task.priority)}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-400">Created</p>
                  <p className="mt-1 text-sm text-gray-300">
                    {new Date(task.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                {task.dueDate && (
                  <div>
                    <p className="text-sm font-medium text-gray-400">Due Date</p>
                    <p className={`mt-1 text-sm ${
                      new Date(task.dueDate) < new Date() && task.status !== 'completed' 
                        ? 'text-red-400' 
                        : 'text-gray-300'
                    }`}>
                      {formatDate(task.dueDate)}
                      {new Date(task.dueDate) < new Date() && task.status !== 'completed' && (
                        <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                          Overdue
                        </span>
                      )}
                    </p>
                  </div>
                )}
                
                <div>
                  <p className="text-sm font-medium text-gray-400">Created By</p>
                  <div className="mt-1 flex items-center">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center">
                      <FaUser className="text-gray-400" />
                    </div>
                    <div className="ml-2">
                      <p className="text-sm font-medium text-white">
                        {task.createdBy?.name || 'Unknown'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {task.createdBy?.email || ''}
                      </p>
                    </div>
                  </div>
                </div>
                
                {task.assignedTo && (
                  <div>
                    <p className="text-sm font-medium text-gray-400">Assigned To</p>
                    <div className="mt-1 flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center">
                        <FaUser className="text-gray-400" />
                      </div>
                      <div className="ml-2">
                        <p className="text-sm font-medium text-white">
                          {task.assignedTo.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {task.assignedTo.email}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-6">
                <Link
                  to={`/tasks/${task._id}/edit`}
                  state={{ from: location.pathname }}
                  className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FaEdit className="mr-2" />
                  Edit Task
                </Link>
              </div>
            </div>
            
            {/* Attachments */}
            {task.attachments && task.attachments.length > 0 && (
              <div className="bg-gray-800 rounded-lg shadow p-4">
                <h3 className="text-lg font-medium text-white mb-4">Attachments</h3>
                <div className="space-y-2">
                  {task.attachments.map((attachment, index) => (
                    <a
                      key={index}
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-2 bg-gray-700 rounded hover:bg-gray-600 transition-colors"
                    >
                      <FaPaperclip className="text-gray-400 mr-2" />
                      <span className="text-sm text-gray-300 truncate">{attachment.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Main Content */}
          <div className="md:w-3/4">
            {/* Tabs */}
            <div className="border-b border-gray-700 mb-6">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`${
                    activeTab === 'details'
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-400'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Details
                </button>
                <button
                  onClick={() => setActiveTab('comments')}
                  className={`${
                    activeTab === 'comments'
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-400'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Comments ({task.comments?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab('activity')}
                  className={`${
                    activeTab === 'activity'
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-400'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Activity
                </button>
              </nav>
            </div>
            
            {/* Tab Content */}
            <div className="bg-gray-800 rounded-lg shadow p-6">
              {activeTab === 'details' && (
                <div>
                  <h2 className="text-xl font-bold text-white mb-4">Description</h2>
                  <div className="prose prose-invert max-w-none text-gray-300">
                    {task.description ? (
                      <p className="whitespace-pre-line">{task.description}</p>
                    ) : (
                      <p className="text-gray-400 italic">No description provided.</p>
                    )}
                  </div>
                </div>
              )}
              
              {activeTab === 'comments' && (
                <div>
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-white mb-4">Comments</h2>
                    
                    {/* Comment Form */}
                    <form onSubmit={handleCommentSubmit} className="mb-8">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center">
                            <FaUser className="text-gray-400" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="border border-gray-600 rounded-lg shadow-sm overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                            <label htmlFor="comment" className="sr-only">
                              Add your comment
                            </label>
                            <textarea
                              rows={3}
                              name="comment"
                              id="comment"
                              className="block w-full py-3 px-4 border-0 resize-none focus:ring-0 sm:text-sm bg-gray-700 text-white placeholder-gray-400"
                              placeholder="Add a comment..."
                              value={commentText}
                              onChange={(e) => setCommentText(e.target.value)}
                            />
                            
                            {/* Toolbar */}
                            <div className="flex justify-between items-center px-3 py-2 bg-gray-700">
                              <div className="flex">
                                <button
                                  type="button"
                                  className="p-2 -m-2 rounded-full text-gray-400 hover:text-gray-300"
                                  title="Attach file"
                                >
                                  <FaPaperclip className="h-5 w-5" />
                                  <span className="sr-only">Attach file</span>
                                </button>
                              </div>
                              <div>
                                <button
                                  type="submit"
                                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                  disabled={!commentText.trim() || submittingComment}
                                >
                                  {submittingComment ? 'Posting...' : 'Comment'}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </form>
                    
                    {/* Comments List */}
                    <div className="space-y-6">
                      {task.comments && task.comments.length > 0 ? (
                        task.comments.map((comment) => (
                          <div key={comment._id} className="flex space-x-4">
                            <div className="flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center">
                                <FaUser className="text-gray-400" />
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="bg-gray-700 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <p className="font-medium text-white">
                                      {comment.user?.name || 'Unknown User'}
                                    </p>
                                    <span className="mx-2 text-gray-500">·</span>
                                    <p className="text-xs text-gray-400">
                                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                    </p>
                                  </div>
                                  <button className="text-gray-400 hover:text-gray-300">
                                    <FaEllipsisV className="h-4 w-4" />
                                  </button>
                                </div>
                                <div className="mt-2 text-sm text-gray-200">
                                  {comment.text}
                                </div>
                                <div className="mt-3 flex items-center text-xs text-gray-400">
                                  <button className="flex items-center hover:text-gray-300">
                                    <FaReply className="mr-1" />
                                    <span>Reply</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <FaComment className="mx-auto h-12 w-12 text-gray-500" />
                          <h3 className="mt-2 text-sm font-medium text-gray-300">No comments yet</h3>
                          <p className="mt-1 text-sm text-gray-500">Be the first to comment on this task.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'activity' && (
                <div>
                  <h2 className="text-xl font-bold text-white mb-4">Activity</h2>
                  <div className="flow-root">
                    <ul className="-mb-8">
                      <li>
                            <div className="relative pb-8">
                              <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-700" aria-hidden="true"></span>
                              <div className="relative flex space-x-3">
                                <div>
                                  <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-gray-800">
                                    <FaUser className="h-5 w-5 text-white" />
                                  </span>
                                </div>
                                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                                  <div>
                                    <p className="text-sm text-gray-300">
                                      <span className="font-medium text-white">You</span> created this task
                                    </p>
                                  </div>
                                  <div className="whitespace-nowrap text-right text-sm text-gray-400">
                                    {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                          
                          {task.updatedAt > task.createdAt && (
                            <li>
                              <div className="relative pb-8">
                                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-700" aria-hidden="true"></span>
                                <div className="relative flex space-x-3">
                                  <div>
                                    <span className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-gray-800">
                                      <FaEdit className="h-4 w-4 text-white" />
                                    </span>
                                  </div>
                                  <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                                    <div>
                                      <p className="text-sm text-gray-300">
                                        <span className="font-medium text-white">You</span> updated the task
                                      </p>
                                      <p className="text-xs text-gray-400">
                                        Status changed to {getStatusBadge(task.status)}
                                      </p>
                                    </div>
                                    <div className="whitespace-nowrap text-right text-sm text-gray-400">
                                      {formatDistanceToNow(new Date(task.updatedAt), { addSuffix: true })}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </li>
                          )}
                          
                          {task.completedAt && (
                            <li>
                              <div className="relative pb-8">
                                <div className="relative flex space-x-3">
                                  <div>
                                    <span className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center ring-8 ring-gray-800">
                                      <FaCheck className="h-4 w-4 text-white" />
                                    </span>
                                  </div>
                                  <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                                    <div>
                                      <p className="text-sm text-gray-300">
                                        <span className="font-medium text-white">You</span> marked this task as completed
                                      </p>
                                    </div>
                                    <div className="whitespace-nowrap text-right text-sm text-gray-400">
                                      {formatDistanceToNow(new Date(task.completedAt), { addSuffix: true })}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
