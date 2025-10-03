import express from 'express';
import { protect } from '../middleware/auth.js';
import { admin } from '../middleware/admin.js';
import {
  getTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  assignTask,
  getUsersForAssignment
} from '../controllers/taskController.js';

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

// Routes for task management
router.route('/')
  .get(getTasks)
  .post(createTask);

// Routes for task assignment (admin only)
router.get('/users', admin, getUsersForAssignment);
router.post('/:id/assign', admin, assignTask);

// Routes for a specific task
router.route('/:id')
  .get(getTaskById)
  .put(updateTask)
  .delete(deleteTask);

export default router;
