import logger from '../config/logger.js';

/**
 * Request logging middleware
 * Logs all incoming HTTP requests with method, path, status, and duration
 */
export const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Log request
  logger.info(`→ ${req.method} ${req.path}`, {
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Capture response
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logLevel = res.statusCode >= 400 ? 'warn' : 'info';

    logger[logLevel](`← ${req.method} ${req.path} ${res.statusCode} ${duration}ms`, {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    });
  });

  next();
};

/**
 * Error logging middleware
 * Logs all errors with stack traces
 */
export const errorLogger = (err, req, res, next) => {
  logger.error(`Error handling ${req.method} ${req.path}`, {
    error: err.message,
    stack: err.stack,
    method: req.method,
    path: req.path,
    statusCode: err.status || 500,
  });

  next(err);
};

export default { requestLogger, errorLogger };
