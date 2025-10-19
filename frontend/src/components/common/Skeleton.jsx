import { cn } from '@/utils/cn';

/**
 * Skeleton loader component for loading states
 * @param {Object} props
 * @param {'text' | 'circle' | 'rect'} props.variant - Skeleton shape
 * @param {string} props.width - Width (CSS value)
 * @param {string} props.height - Height (CSS value)
 * @param {string} props.className - Additional CSS classes
 */
export function Skeleton({
  variant = 'rect',
  width,
  height,
  className
}) {
  const variants = {
    text: 'h-4 rounded',
    circle: 'rounded-full',
    rect: 'rounded-lg'
  };

  return (
    <div
      className={cn(
        'animate-pulse bg-gray-200',
        variants[variant],
        className
      )}
      style={{ width, height }}
    />
  );
}

/**
 * Pre-built skeleton for product card
 */
export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <Skeleton variant="text" width="60%" height="24px" />
        <Skeleton variant="circle" width="40px" height="40px" />
      </div>
      <Skeleton variant="text" width="40%" height="16px" className="mb-2" />
      <Skeleton variant="text" width="80%" height="16px" className="mb-4" />
      <div className="flex items-center justify-between">
        <Skeleton variant="text" width="30%" height="24px" />
        <Skeleton variant="text" width="25%" height="20px" />
      </div>
    </div>
  );
}

/**
 * Pre-built skeleton for table row
 */
export function TableRowSkeleton() {
  return (
    <div className="flex items-center space-x-4 py-4 border-b border-gray-200">
      <Skeleton variant="circle" width="40px" height="40px" />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" width="40%" height="16px" />
        <Skeleton variant="text" width="60%" height="14px" />
      </div>
      <Skeleton variant="text" width="80px" height="24px" />
    </div>
  );
}
