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

/**
 * @swagger
 * tags:
 *   - name: Tasks
 *     description: API for managing tasks
 */

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Retrieve a list of tasks
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter tasks by status (e.g., 'pending,in-progress')
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *         description: Filter tasks by priority (e.g., 'high,critical')
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search tasks by title, description, or tags
 *     responses:
 *       200:
 *         description: A list of tasks.
 *       401:
 *         description: Unauthorized
 */
router.get('/', auth, getTasks);

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Finalize project report"
 *               description:
 *                 type: string
 *                 example: "Complete the Q3 financial report and send to management."
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, critical]
 *                 example: "high"
 *     responses:
 *       201:
 *         description: Task created successfully.
 *       401:
 *         description: Unauthorized
 */
router.post('/', auth, createTask);

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Get a single task by ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The task ID
 *     responses:
 *       200:
 *         description: Detailed information about the task.
 *       404:
 *         description: Task not found
 */
router.get('/:id', auth, getTaskById);

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Update an existing task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [pending, in-progress, on-hold, completed]
 *     responses:
 *       200:
 *         description: Task updated successfully.
 *       404:
 *         description: Task not found
 */
router.put('/:id', auth, updateTask);

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The task ID
 *     responses:
 *       200:
 *         description: Task deleted successfully.
 *       404:
 *         description: Task not found
 */
router.delete('/:id', auth, deleteTask);

export default router;