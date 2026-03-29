const Joi = require('joi');

// Create task validation schema
const createTaskSchema = Joi.object({
  title: Joi.string().min(3).max(200).trim().required().messages({
    'string.min': 'Title must be at least 3 characters',
    'string.max': 'Title cannot exceed 200 characters',
    'any.required': 'Task title is required',
  }),
  description: Joi.string().max(2000).trim().allow('').optional().messages({
    'string.max': 'Description cannot exceed 2000 characters',
  }),
  status: Joi.string()
    .valid('pending', 'in-progress', 'completed')
    .default('pending')
    .messages({
      'any.only': 'Status must be pending, in-progress, or completed',
    }),
});

// Update task validation schema (all fields optional)
const updateTaskSchema = Joi.object({
  title: Joi.string().min(3).max(200).trim().optional().messages({
    'string.min': 'Title must be at least 3 characters',
    'string.max': 'Title cannot exceed 200 characters',
  }),
  description: Joi.string().max(2000).trim().allow('').optional().messages({
    'string.max': 'Description cannot exceed 2000 characters',
  }),
  status: Joi.string()
    .valid('pending', 'in-progress', 'completed')
    .optional()
    .messages({
      'any.only': 'Status must be pending, in-progress, or completed',
    }),
}).min(1); // At least one field required for update

// Validate MongoDB ObjectId param
const idParamSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[a-fA-F0-9]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid task ID format',
      'any.required': 'Task ID is required',
    }),
});

module.exports = { createTaskSchema, updateTaskSchema, idParamSchema };
