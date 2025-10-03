import Query from '../models/Query.js';
import Task from '../models/Task.js';
import User from '../models/User.js';
import { checkAdmin } from '../middleware/admin.js';

// @desc    Create a new query
// @route   POST /api/queries
// @access  Private
const createQuery = async (req, res) => {
  try {
    const { title, description, taskId } = req.body;
    
    // If taskId is provided, verify the task exists and user has access
    if (taskId) {
      const task = await Task.findById(taskId);
      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task not found'
        });
      }
      
      // Check if user is the creator, assignee, or admin
      const isCreator = task.createdBy.toString() === req.user.id;
      const isAssigned = task.assignedTo && task.assignedTo.toString() === req.user.id;
      
      if (!isCreator && !isAssigned && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to create a query for this task'
        });
      }
    }

    const query = new Query({
      title,
      description,
      createdBy: req.user.id,
      task: taskId || null,
      status: 'open'
    });

    await query.save();
    
    // Populate createdBy and task fields
    await query.populate('createdBy', 'name email');
    if (taskId) {
      await query.populate('task', 'title');
    }

    res.status(201).json({
      success: true,
      data: query,
      message: 'Query created successfully'
    });
  } catch (error) {
    console.error('Create query error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to create query' 
    });
  }
};

// @desc    Get all queries
// @route   GET /api/queries
// @access  Private
const getQueries = async (req, res) => {
  try {
    let query = {};
    
    // Non-admin users can only see their own queries or queries related to their tasks
    if (req.user.role !== 'admin') {
      // Get all task IDs where user is the creator or assignee
      const userTasks = await Task.find({
        $or: [
          { createdBy: req.user.id },
          { assignedTo: req.user.id }
        ]
      }).select('_id');
      
      const taskIds = userTasks.map(t => t._id);
      
      query = {
        $or: [
          { createdBy: req.user.id },
          { task: { $in: taskIds } }
        ]
      };
    }

    // Filter by status if provided
    if (req.query.status) {
      query.status = { $in: req.query.status.split(',') };
    }

    // Filter by task if provided (for admins or users with access)
    if (req.query.taskId) {
      // Verify user has access to this task
      const task = await Task.findById(req.query.taskId);
      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task not found'
        });
      }
      
      const isCreator = task.createdBy.toString() === req.user.id;
      const isAssigned = task.assignedTo && task.assignedTo.toString() === req.user.id;
      
      if (!isCreator && !isAssigned && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view queries for this task'
        });
      }
      
      query.task = req.query.taskId;
    }

    // Search in title and description
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Sorting
    const sort = {};
    if (req.query.sortBy) {
      const parts = req.query.sortBy.split(':');
      sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    } else {
      sort.createdAt = -1; // Default sort by newest first
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const queries = await Query.find(query)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('task', 'title')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Query.countDocuments(query);

    // Add permissions for each query
    const queriesWithPermissions = queries.map(query => ({
      ...query,
      canEdit: query.createdBy._id.toString() === req.user.id || req.user.role === 'admin',
      canDelete: req.user.role === 'admin',
      canAssign: req.user.role === 'admin',
      canComment: true
    }));

    res.json({
      success: true,
      count: queries.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: queriesWithPermissions
    });
  } catch (error) {
    console.error('Get queries error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to fetch queries' 
    });
  }
};

// @desc    Get single query
// @route   GET /api/queries/:id
// @access  Private
const getQueryById = async (req, res) => {
  try {
    const query = await Query.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('task', 'title')
      .populate({
        path: 'comments.user',
        select: 'name email role'
      });

    if (!query) {
      return res.status(404).json({
        success: false,
        message: 'Query not found'
      });
    }

    // Check if user has permission to view this query
    const isCreator = query.createdBy._id.toString() === req.user.id;
    let hasTaskAccess = false;
    
    if (query.task) {
      const task = await Task.findById(query.task);
      if (task) {
        const isTaskCreator = task.createdBy.toString() === req.user.id;
        const isAssigned = task.assignedTo && task.assignedTo.toString() === req.user.id;
        hasTaskAccess = isTaskCreator || isAssigned;
      }
    }
    
    if (!isCreator && !hasTaskAccess && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this query'
      });
    }

    // Add permissions
    const queryWithPermissions = {
      ...query.toObject(),
      canEdit: isCreator || req.user.role === 'admin',
      canDelete: req.user.role === 'admin',
      canAssign: req.user.role === 'admin',
      canComment: true
    };

    res.json({
      success: true,
      data: queryWithPermissions
    });
  } catch (error) {
    console.error('Get query error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to fetch query' 
    });
  }
};

// @desc    Update a query
// @route   PUT /api/queries/:id
// @access  Private
const updateQuery = async (req, res) => {
  try {
    const { title, description, status, assignedTo } = req.body;

    let query = await Query.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('task', 'title');

    if (!query) {
      return res.status(404).json({
        success: false,
        message: 'Query not found'
      });
    }

    // Check if user has permission to update this query
    const isCreator = query.createdBy._id.toString() === req.user.id;
    let hasTaskAccess = false;
    
    if (query.task) {
      const task = await Task.findById(query.task);
      if (task) {
        const isTaskCreator = task.createdBy.toString() === req.user.id;
        const isAssigned = task.assignedTo && task.assignedTo.toString() === req.user.id;
        hasTaskAccess = isTaskCreator || isAssigned;
      }
    }
    
    if (!isCreator && !hasTaskAccess && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this query'
      });
    }

    // Only allow admins to change status and assignee
    if (req.user.role === 'admin') {
      if (status) {
        query.status = status;
        
        // Update resolvedAt if status is changed to resolved
        if (status === 'resolved' && query.status !== 'resolved') {
          query.resolvedAt = Date.now();
        } else if (status !== 'resolved' && query.status === 'resolved') {
          query.resolvedAt = null;
        }
      }
      
      if (assignedTo) {
        // Verify the assigned user exists
        const user = await User.findById(assignedTo);
        if (!user) {
          return res.status(404).json({
            success: false,
            message: 'User not found'
          });
        }
        query.assignedTo = assignedTo;
      }
    }

    // Only creator or admin can update title and description
    if (isCreator || req.user.role === 'admin') {
      if (title) query.title = title;
      if (description) query.description = description;
    }

    await query.save();

    // Add permissions
    const queryWithPermissions = {
      ...query.toObject(),
      canEdit: isCreator || req.user.role === 'admin',
      canDelete: req.user.role === 'admin',
      canAssign: req.user.role === 'admin',
      canComment: true
    };

    res.json({
      success: true,
      data: queryWithPermissions,
      message: 'Query updated successfully'
    });
  } catch (error) {
    console.error('Update query error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to update query' 
    });
  }
};

// @desc    Delete a query
// @route   DELETE /api/queries/:id
// @access  Private/Admin
const deleteQuery = async (req, res) => {
  try {
    const query = await Query.findById(req.params.id);

    if (!query) {
      return res.status(404).json({
        success: false,
        message: 'Query not found'
      });
    }

    // Only admins can delete queries
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this query'
      });
    }

    await query.deleteOne();

    res.json({ 
      success: true, 
      message: 'Query deleted successfully' 
    });
  } catch (error) {
    console.error('Delete query error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to delete query' 
    });
  }
};

// @desc    Add a comment to a query
// @route   POST /api/queries/:id/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const { text } = req.body;

    const query = await Query.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('task', 'title')
      .populate({
        path: 'comments.user',
        select: 'name email role'
      });

    if (!query) {
      return res.status(404).json({
        success: false,
        message: 'Query not found'
      });
    }

    // Check if user has permission to comment on this query
    const isCreator = query.createdBy._id.toString() === req.user.id;
    let hasTaskAccess = false;
    
    if (query.task) {
      const task = await Task.findById(query.task);
      if (task) {
        const isTaskCreator = task.createdBy.toString() === req.user.id;
        const isAssigned = task.assignedTo && task.assignedTo.toString() === req.user.id;
        hasTaskAccess = isTaskCreator || isAssigned;
      }
    }
    
    if (!isCreator && !hasTaskAccess && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to comment on this query'
      });
    }

    // Add the comment
    const comment = {
      user: req.user.id,
      text,
      createdAt: Date.now()
    };

    query.comments.push(comment);
    await query.save();

    // Populate the user field in the new comment
    const populatedComment = {
      ...comment,
      user: {
        _id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      }
    };

    // Get the last comment (the one we just added)
    const lastComment = query.comments[query.comments.length - 1];
    
    // If the comment was added by someone other than the creator, update the status to 'in-progress'
    if (query.status === 'open' && query.createdBy._id.toString() !== req.user.id) {
      query.status = 'in-progress';
      await query.save();
    }

    res.status(201).json({
      success: true,
      data: populatedComment,
      message: 'Comment added successfully',
      queryStatus: query.status
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to add comment' 
    });
  }
};

// @desc    Get all users (for query assignment)
// @route   GET /api/queries/users
// @access  Private/Admin
const getUsersForAssignment = async (req, res) => {
  try {
    const users = await User.find({ 
      _id: { $ne: req.user.id },
      role: { $in: ['admin', 'support'] } 
    }).select('name email role');

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch users' 
    });
  }
};

export {
  createQuery,
  getQueries,
  getQueryById,
  updateQuery,
  deleteQuery,
  addComment,
  getUsersForAssignment
};
