import { cn } from '@/utils/cn';
import { STATUS_COLORS, STATUS_LABELS } from '@/utils/constants';

/**
 * Status Badge component for displaying product status
 * @param {Object} props
 * @param {number} props.status - Status enum value (0-5)
 * @param {string} props.className - Additional CSS classes
 */
export default function StatusBadge({ status, className }) {
  const label = STATUS_LABELS[status] || 'Unknown';
  const colorClass = STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';

  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
        colorClass,
        className
      )}
    >
      {label}
    </span>
  );
}
