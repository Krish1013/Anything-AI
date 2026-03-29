/**
 * Reusable Joi validation middleware factory
 * @param {Object} schema - Joi schema to validate against
 * @param {string} source - 'body' | 'params' | 'query'
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,   // Return all errors, not just first
      stripUnknown: true,  // Remove unknown fields (security)
      convert: true,       // Auto-convert values
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    // Replace request data with sanitized, validated value
    req[source] = value;
    next();
  };
};

module.exports = validate;
