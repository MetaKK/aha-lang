'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  children?: React.ReactNode;
}

const Skeleton = ({ className, children, ...props }: SkeletonProps) => {
  return (
    <div
      className={cn(
        'animate-pulse-fast rounded-md bg-gray-200 dark:bg-gray-700',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// 头像骨架屏
const AvatarSkeleton = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <Skeleton
      className={cn(
        'rounded-full',
        sizeClasses[size]
      )}
    />
  );
};

// 文本骨架屏
const TextSkeleton = ({ 
  lines = 1, 
  width = 'w-full',
  height = 'h-4'
}: { 
  lines?: number; 
  width?: string;
  height?: string;
}) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            height,
            i === lines - 1 ? width : 'w-full'
          )}
        />
      ))}
    </div>
  );
};

// 卡片骨架屏
const CardSkeleton = () => {
  return (
    <div className="px-4 py-3">
      <div className="flex gap-3">
        {/* 头像骨架 */}
        <div className="flex-shrink-0 pt-0.5">
          <AvatarSkeleton size="md" />
        </div>

        {/* 内容骨架 */}
        <div className="flex-1 min-w-0">
          {/* 作者信息骨架 */}
          <div className="flex items-center gap-2 mb-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>

          {/* 文本内容骨架 */}
          <div className="mb-3">
            <TextSkeleton lines={2} width="w-3/4" />
          </div>

          {/* 媒体骨架 */}
          <Skeleton className="w-full h-48 rounded-xl mb-3" />

          {/* 操作按钮骨架 */}
          <div className="flex items-center gap-6">
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-4 w-8" />
          </div>
        </div>
      </div>
    </div>
  );
};

// 媒体网格骨架屏
const MediaGridSkeleton = ({ count = 1 }: { count?: number }) => {
  const getGridClass = () => {
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-2';
    if (count === 3) return 'grid-cols-2';
    return 'grid-cols-2';
  };

  return (
    <div className={cn(
      'grid gap-0.5 rounded-[16px] overflow-hidden',
      getGridClass()
    )}>
      {Array.from({ length: Math.min(count, 4) }).map((_, index) => (
        <Skeleton
          key={index}
          className={cn(
            'aspect-square',
            count === 3 && index === 0 && 'col-span-2'
          )}
        />
      ))}
    </div>
  );
};

export { 
  Skeleton, 
  AvatarSkeleton, 
  TextSkeleton, 
  CardSkeleton, 
  MediaGridSkeleton 
};
