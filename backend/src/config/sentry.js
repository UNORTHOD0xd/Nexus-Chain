import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

/**
 * Initialize Sentry error tracking
 * Only enabled in production with SENTRY_DSN configured
 */
export const initializeSentry = (app) => {
  if (!process.env.SENTRY_DSN) {
    console.log('Sentry DSN not configured - error tracking disabled');
    return;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    integrations: [
      // HTTP integration for Express
      Sentry.httpIntegration(),
      // Profiling integration (optional)
      nodeProfilingIntegration(),
    ],
    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    // Profiling (optional)
    profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    // Release tracking
    release: process.env.npm_package_version || '1.0.0',
    // Ignore common errors
    ignoreErrors: [
      'ECONNRESET',
      'ETIMEDOUT',
      'ECONNREFUSED',
      'NetworkError',
    ],
    // Before send hook - sanitize sensitive data
    beforeSend(event, hint) {
      // Don't send events in development
      if (process.env.NODE_ENV === 'development') {
        return null;
      }

      // Remove sensitive headers
      if (event.request?.headers) {
        delete event.request.headers.authorization;
        delete event.request.headers.cookie;
      }

      // Remove sensitive query params
      if (event.request?.query_string) {
        const sanitized = event.request.query_string
          .replace(/password=[^&]*/gi, 'password=[REDACTED]')
          .replace(/token=[^&]*/gi, 'token=[REDACTED]');
        event.request.query_string = sanitized;
      }

      return event;
    },
  });

  // Sentry request handler must be first middleware
  app.use(Sentry.Handlers.requestHandler());

  // Sentry tracing middleware (optional)
  app.use(Sentry.Handlers.tracingHandler());

  console.log('✅ Sentry error tracking initialized');
};

/**
 * Error handler middleware - must be after all routes
 */
export const sentryErrorHandler = Sentry.Handlers.errorHandler({
  shouldHandleError(error) {
    // Capture all errors
    return true;
  },
});

/**
 * Manually capture exception
 */
export const captureException = (error, context = {}) => {
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(error, {
      contexts: { custom: context },
    });
  }
};

/**
 * Capture message
 */
export const captureMessage = (message, level = 'info', context = {}) => {
  if (process.env.SENTRY_DSN) {
    Sentry.captureMessage(message, {
      level,
      contexts: { custom: context },
    });
  }
};

export default { initializeSentry, sentryErrorHandler, captureException, captureMessage };
