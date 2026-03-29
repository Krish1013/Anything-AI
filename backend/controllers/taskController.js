const Task = require('../models/Task');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * @route   POST /api/v1/tasks
 * @desc    Create a new task
 * @access  Private (user, admin)
 */
const createTask = async (req, res, next) => {
  try {
    const { title, description, status } = req.body;

    const task = await Task.create({
      title,
      description,
      status,
      user: req.user._id,
    });

    return sendSuccess(res, 201, 'Task created successfully', { task });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/v1/tasks
 * @desc    Get all tasks (admin: all tasks; user: only their tasks)
 * @access  Private
 */
const getAllTasks = async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { user: req.user._id };

    // Optional query filters
    if (req.query.status) {
      const validStatuses = ['pending', 'in-progress', 'completed'];
      if (validStatuses.includes(req.query.status)) {
        filter.status = req.query.status;
      }
    }

    // Pagination
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Task.countDocuments(filter),
    ]);

    return sendSuccess(res, 200, 'Tasks retrieved successfully', {
      tasks,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/v1/tasks/:id
 * @desc    Get a single task by ID
 * @access  Private (owner or admin)
 */
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).populate('user', 'name email');

    if (!task) {
      return sendError(res, 404, 'Task not found.');
    }

    // Only the owner or admin can view the task
    if (req.user.role !== 'admin' && task.user._id.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'You do not have permission to view this task.');
    }

    return sendSuccess(res, 200, 'Task retrieved successfully', { task });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/v1/tasks/:id
 * @desc    Update a task
 * @access  Private (owner or admin)
 */
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return sendError(res, 404, 'Task not found.');
    }

    // Only the owner or admin can update
    if (req.user.role !== 'admin' && task.user.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'You do not have permission to update this task.');
    }

    const { title, description, status } = req.body;

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, status },
      { new: true, runValidators: true }
    ).populate('user', 'name email');

    return sendSuccess(res, 200, 'Task updated successfully', { task: updatedTask });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/v1/tasks/:id
 * @desc    Delete a task (admin only)
 * @access  Private (admin)
 */
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return sendError(res, 404, 'Task not found.');
    }

    await Task.findByIdAndDelete(req.params.id);

    return sendSuccess(res, 200, 'Task deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = { createTask, getAllTasks, getTaskById, updateTask, deleteTask };
