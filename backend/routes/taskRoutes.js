const express = require('express');
const router = express.Router();

const {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');

const { authenticate, authorizeRoles } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createTaskSchema,
  updateTaskSchema,
  idParamSchema,
} = require('../validations/taskValidation');

// All task routes require authentication
router.use(authenticate);

// POST /api/v1/tasks - Create task (user or admin)
router.post('/', validate(createTaskSchema), createTask);

// GET /api/v1/tasks - Get all tasks (admin: all, user: own)
router.get('/', getAllTasks);

// GET /api/v1/tasks/:id - Get specific task (owner or admin)
router.get('/:id', validate(idParamSchema, 'params'), getTaskById);

// PUT /api/v1/tasks/:id - Update task (owner or admin)
router.put(
  '/:id',
  validate(idParamSchema, 'params'),
  validate(updateTaskSchema),
  updateTask
);

// DELETE /api/v1/tasks/:id - Delete task (admin only)
router.delete(
  '/:id',
  authorizeRoles('admin'),
  validate(idParamSchema, 'params'),
  deleteTask
);

module.exports = router;
