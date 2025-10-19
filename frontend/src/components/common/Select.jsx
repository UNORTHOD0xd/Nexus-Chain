import { forwardRef } from 'react';
import { cn } from '@/utils/cn';

/**
 * Reusable Select/Dropdown component
 * @param {Object} props
 * @param {string} props.label - Select label
 * @param {Array} props.options - Options array [{value, label}]
 * @param {React.ReactNode} props.children - Child option elements (alternative to options prop)
 * @param {string} props.error - Error message
 * @param {boolean} props.required - Required field indicator
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.className - Additional CSS classes
 */
const Select = forwardRef(({
  label,
  options = [],
  children,
  error,
  required = false,
  placeholder = 'Select an option',
  className,
  id,
  ...props
}, ref) => {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <select
        ref={ref}
        id={selectId}
        className={cn(
          'block w-full rounded-lg border px-4 py-2.5 text-gray-900 transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
          error
            ? 'border-red-300 focus:ring-red-500'
            : 'border-gray-300',
          'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed'
        )}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${selectId}-error` : undefined}
        {...props}
      >
        {children || (
          <>
            {!props.value && <option value="">{placeholder}</option>}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </>
        )}
      </select>

      {error && (
        <p id={`${selectId}-error`} className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
