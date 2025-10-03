import Task from '../models/Task.js';
import User from '../models/User.js';
import { checkAdmin } from '../middleware/admin.js';

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    let query = {};
    
    // If user is not admin, only show their assigned tasks or tasks they created
    if (req.user.role !== 'admin') {
      query.$or = [
        { createdBy: req.user.id },
        { assignedTo: req.user.id }
      ];
    }

    // Filter by status if provided
    if (req.query.status) {
      query.status = { $in: req.query.status.split(',') };
    }

    // Filter by priority if provided
    if (req.query.priority) {
      query.priority = { $in: req.query.priority.split(',') };
    }

    // Filter by assignee if admin
    if (req.user.role === 'admin' && req.query.assignedTo) {
      query.assignedTo = req.query.assignedTo;
    }

    // Search in title and description
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { 'tags': { $regex: req.query.search, $options: 'i' } }
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

    const tasks = await Task.find(query)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Task.countDocuments(query);

    // Add permissions for each task
    const tasksWithPermissions = tasks.map(task => ({
      ...task,
      canEdit: task.createdBy._id.toString() === req.user.id || req.user.role === 'admin',
      canDelete: task.createdBy._id.toString() === req.user.id || req.user.role === 'admin',
      canAssign: req.user.role === 'admin'
    }));

    res.json({
      success: true,
      count: tasks.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: tasksWithPermissions
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
  try {
    const { title, description, tags, status, priority, dueDate, assignedTo } = req.body;
    
    // Only allow admins to assign tasks to other users
    const assignedUserId = req.user.role === 'admin' && assignedTo ? assignedTo : req.user.id;
    
    const task = new Task({
      title,
      description,
      tags: tags || [],
      status: status || 'pending',
      priority: priority || 'medium',
      dueDate: dueDate || null,
      createdBy: req.user.id,
      assignedTo: assignedUserId
    });

    await task.save();

    // Populate the created and assigned user details
    await task.populate('createdBy', 'name email');
    if (task.assignedTo) {
      await task.populate('assignedTo', 'name email');
    }

    res.status(201).json({
      success: true,
      data: task,
      message: 'Task created successfully'
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to create task' 
    });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if user has permission to view this task
    const isCreator = task.createdBy._id.toString() === req.user.id;
    const isAssigned = task.assignedTo && task.assignedTo._id.toString() === req.user.id;
    
    if (!isCreator && !isAssigned && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this task'
      });
    }

    // Add permissions
    const taskWithPermissions = {
      ...task.toObject(),
      canEdit: isCreator || req.user.role === 'admin',
      canDelete: isCreator || req.user.role === 'admin',
      canAssign: req.user.role === 'admin',
      canComment: true
    };

    res.json({
      success: true,
      data: taskWithPermissions
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to fetch task' 
    });
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      tags, 
      status, 
      priority, 
      dueDate, 
      assignedTo,
      ...otherFields 
    } = req.body;

    let task = await Task.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if user has permission to update this task
    const isCreator = task.createdBy._id.toString() === req.user.id;
    if (!isCreator && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this task'
      });
    }

    // Only allow admins to change certain fields
    if (req.user.role === 'admin') {
      if (assignedTo) {
        const userExists = await User.exists({ _id: assignedTo });
        if (!userExists) {
          return res.status(400).json({
            success: false,
            message: 'Assigned user not found'
          });
        }
        task.assignedTo = assignedTo;
      }
    }

    // Update task fields
    task.title = title ?? task.title;
    task.description = description ?? task.description;
    task.tags = tags ?? task.tags;
    task.priority = priority ?? task.priority;
    
    // Handle status changes
    if (status && status !== task.status) {
      task.status = status;
      
      // Update completedAt if status is changed to completed
      if (status === 'completed') {
        task.completedAt = Date.now();
      } else if (task.status === 'completed' && status !== 'completed') {
        task.completedAt = null;
      }
    }
    
    if (dueDate) {
      task.dueDate = dueDate === 'null' ? null : new Date(dueDate);
    }

    await task.save();

    // Add permissions
    const taskWithPermissions = {
      ...task.toObject(),
      canEdit: isCreator || req.user.role === 'admin',
      canDelete: isCreator || req.user.role === 'admin',
      canAssign: req.user.role === 'admin'
    };

    res.json({
      success: true,
      data: taskWithPermissions,
      message: 'Task updated successfully'
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to update task' 
    });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if user has permission to delete this task
    const isCreator = task.createdBy.toString() === req.user.id;
    if (!isCreator && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this task'
      });
    }

    await task.deleteOne();

    res.json({ 
      success: true, 
      message: 'Task deleted successfully' 
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to delete task' 
    });
  }
};

// @desc    Assign task to user
// @route   POST /api/tasks/:id/assign
// @access  Private/Admin
const assignTask = async (req, res) => {
  try {
    const { userId } = req.body;
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const task = await Task.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Update assigned user
    task.assignedTo = userId;
    await task.save();

    // Add permissions
    const taskWithPermissions = {
      ...task.toObject(),
      canEdit: task.createdBy._id.toString() === req.user.id || req.user.role === 'admin',
      canDelete: task.createdBy._id.toString() === req.user.id || req.user.role === 'admin',
      canAssign: req.user.role === 'admin'
    };

    res.json({
      success: true,
      data: taskWithPermissions,
      message: 'Task assigned successfully'
    });
  } catch (error) {
    console.error('Assign task error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to assign task' 
    });
  }
};

// @desc    Get all users (for task assignment)
// @route   GET /api/tasks/users
// @access  Private/Admin
const getUsersForAssignment = async (req, res) => {
  try {
    const users = await User.find({ 
      _id: { $ne: req.user.id },
      role: 'user' 
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
  getTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  assignTask,
  getUsersForAssignment
};
