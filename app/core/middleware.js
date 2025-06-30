// Error handling middleware
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Supabase errors
  if (err.code) {
    return res.status(400).json({
      error: 'Database error',
      message: err.message,
      code: err.code
    });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      message: err.message
    });
  }

  // Default error
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
};

// Request validation middleware
export const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      // Simple validation - in production, use a proper validation library
      const { error } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.details
        });
      }
      next();
    } catch (err) {
      next(err);
    }
  };
};

// Async route handler wrapper
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Request logging middleware
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  
  next();
};