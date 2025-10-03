import axios from 'axios';
import { toast } from 'react-toastify';

// Create axios instance with default config
const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const api = axios.create({
  baseURL: baseURL.endsWith('/api') ? baseURL : `${baseURL}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // Clear local storage and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      toast.error('Session expired. Please log in again.');
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, data) => api.post(`/auth/reset-password/${token}`, data),
};

// Users API
export const userAPI = {
  getUsers: (params = {}) => api.get('/users', { params }),
  getUserById: (id) => api.get(`/users/${id}`),
  createUser: (userData) => api.post('/users', userData),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
  updateProfile: (userData) => api.put('/users/profile', userData),
  changePassword: (data) => api.put('/users/change-password', data),
  getUsersForAssignment: () => api.get('/users/assignable'),
};

// Tasks API
export const taskAPI = {
  getTasks: (params = {}) => api.get('/tasks', { params }),
  getTaskById: (id) => api.get(`/tasks/${id}`),
  createTask: (taskData) => api.post('/tasks', taskData),
  updateTask: (id, taskData) => api.put(`/tasks/${id}`, taskData),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
  assignTask: (taskId, userId) => api.post(`/tasks/${taskId}/assign`, { userId }),
  updateTaskStatus: (taskId, status) => api.patch(`/tasks/${taskId}/status`, { status }),
  getMyTasks: (params = {}) => api.get('/tasks/me', { params }),
  getTasksByUser: (userId, params = {}) => api.get(`/tasks/user/${userId}`, { params }),
};

// Queries API
export const queryAPI = {
  getQueries: (params = {}) => api.get('/queries', { params }),
  getQueryById: (id) => api.get(`/queries/${id}`),
  createQuery: (queryData) => api.post('/queries', queryData),
  updateQuery: (id, queryData) => api.put(`/queries/${id}`, queryData),
  deleteQuery: (id) => api.delete(`/queries/${id}`),
  addComment: (queryId, comment) => api.post(`/queries/${queryId}/comments`, { comment }),
  updateComment: (queryId, commentId, comment) => api.put(`/queries/${queryId}/comments/${commentId}`, { comment }),
  deleteComment: (queryId, commentId) => api.delete(`/queries/${queryId}/comments/${commentId}`),
  assignQuery: (queryId, userId) => api.post(`/queries/${queryId}/assign`, { userId }),
  updateQueryStatus: (queryId, status) => api.patch(`/queries/${queryId}/status`, { status }),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getRecentActivities: () => api.get('/dashboard/activities'),
  getTaskStatusSummary: () => api.get('/dashboard/task-status'),
  getUpcomingDeadlines: () => api.get('/dashboard/upcoming-deadlines'),
};

// File Upload API
export const fileAPI = {
  uploadFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  deleteFile: (fileId) => api.delete(`/files/${fileId}`),
};

// Export the default axios instance as well
export default api;
