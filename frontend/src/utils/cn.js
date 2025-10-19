/**
 * Utility function for conditionally joining classNames
 * Combines clsx for conditional classes
 *
 * @param {...(string|Object|Array)} classes - Class names or conditional objects
 * @returns {string} Combined class string
 *
 * @example
 * cn('base-class', isActive && 'active', { 'error': hasError })
 * // Returns: 'base-class active' (if isActive is true)
 */
import clsx from 'clsx';

export function cn(...classes) {
  return clsx(...classes);
}
