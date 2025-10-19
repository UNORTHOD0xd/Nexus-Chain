import { cn } from '@/utils/cn';
import { AlertCircle } from 'lucide-react';

/**
 * Error Message component
 * @param {Object} props
 * @param {string} props.message - Error message text
 * @param {string} props.title - Optional error title
 * @param {Function} props.onRetry - Optional retry callback
 * @param {string} props.className - Additional CSS classes
 */
export default function ErrorMessage({
  message,
  title = 'Error',
  onRetry,
  className
}) {
  if (!message) return null;

  return (
    <div
      className={cn(
        'rounded-lg bg-red-50 border border-red-200 p-4',
        className
      )}
      role="alert"
    >
      <div className="flex items-start">
        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">{title}</h3>
          <p className="mt-1 text-sm text-red-700">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 text-sm font-medium text-red-800 hover:text-red-900 underline"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
