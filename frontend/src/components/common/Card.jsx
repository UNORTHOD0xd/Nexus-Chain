import { cn } from '@/utils/cn';

/**
 * Reusable Card component
 * @param {Object} props
 * @param {string} props.title - Card title
 * @param {string} props.subtitle - Card subtitle
 * @param {React.ReactNode} props.children - Card content
 * @param {React.ReactNode} props.footer - Card footer content
 * @param {boolean} props.hoverable - Add hover effect
 * @param {boolean} props.clickable - Add cursor pointer
 * @param {string} props.className - Additional CSS classes
 */
export default function Card({
  title,
  subtitle,
  children,
  footer,
  hoverable = false,
  clickable = false,
  className,
  onClick,
  ...props
}) {
  return (
    <div
      className={cn(
        'bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden',
        hoverable && 'transition-shadow duration-200 hover:shadow-md',
        clickable && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      {...props}
    >
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-gray-200">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          )}
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
          )}
        </div>
      )}

      <div className="px-6 py-4">{children}</div>

      {footer && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          {footer}
        </div>
      )}
    </div>
  );
}
