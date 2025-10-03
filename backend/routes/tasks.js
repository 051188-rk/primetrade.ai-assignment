import express from 'express';
import { auth } from '../middleware/auth.js';
import {
  getTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask
} from '../controllers/taskController.js';

const router = express.Router();

// GET /api/tasks
router.get('/', auth, getTasks);

// POST /api/tasks
router.post('/', auth, createTask);

// GET /api/tasks/:id
router.get('/:id', auth, getTaskById);

// PUT /api/tasks/:id
router.put('/:id', auth, updateTask);

// DELETE /api/tasks/:id
router.delete('/:id', auth, deleteTask);

export default router;
