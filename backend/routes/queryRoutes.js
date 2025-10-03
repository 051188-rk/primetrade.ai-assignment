import express from 'express';
import { protect } from '../middleware/auth.js';
import { admin } from '../middleware/admin.js';
import {
  createQuery,
  getQueries,
  getQueryById,
  updateQuery,
  deleteQuery,
  addComment,
  getUsersForAssignment
} from '../controllers/queryController.js';

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

// Routes for query management
router.route('/')
  .post(createQuery)
  .get(getQueries);

// Routes for query assignment (admin only)
router.get('/users', admin, getUsersForAssignment);

// Routes for a specific query
router.route('/:id')
  .get(getQueryById)
  .put(updateQuery)
  .delete(admin, deleteQuery);

// Route for adding comments to a query
router.post('/:id/comments', addComment);

export default router;
