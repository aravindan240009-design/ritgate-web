import React from 'react';
import { cn } from '../../utils/cn';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rect' | 'circle';
}

export function Skeleton({ className, variant = 'rect' }: SkeletonProps) {
  return (
    <div 
      className={cn(
        'animate-pulse bg-slate-200 dark:bg-slate-800', 
        variant === 'circle' ? 'rounded-full' : 'rounded-lg',
        className
      )} 
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-[16px] border border-slate-100 dark:border-slate-800 p-4 mb-3 space-y-4 shadow-sm lg:mb-0 lg:rounded-[24px] lg:border-white/60 lg:bg-white/78 lg:p-7 lg:shadow-[0_18px_45px_rgba(15,23,42,0.08)] lg:backdrop-blur-xl lg:space-y-6">
      {/* Top row: avatar + name block + time */}
      <div className="flex items-center gap-3 lg:gap-5">
        <Skeleton variant="circle" className="w-[48px] h-[48px] shrink-0 lg:h-[64px] lg:w-[64px]" />
        <div className="flex-1 space-y-2 lg:space-y-3">
          <Skeleton className="h-3.5 w-[60%] rounded-full lg:h-4 lg:w-[46%]" />
          <Skeleton className="h-2.5 w-[40%] rounded-full opacity-60 lg:h-3.5 lg:w-[32%]" />
        </div>
        <Skeleton className="h-2.5 w-[40px] rounded-full self-start mt-1 lg:h-3 lg:w-[56px]" />
      </div>

      {/* Info box */}
      <div className="bg-slate-50/50 dark:bg-slate-800/30 rounded-xl p-3.5 space-y-2.5 lg:rounded-[22px] lg:px-6 lg:py-5 lg:space-y-3">
        <Skeleton className="h-3 w-[90%] rounded-full lg:h-3.5 lg:w-[82%]" />
        <Skeleton className="h-3 w-[60%] rounded-full opacity-60 lg:h-3.5 lg:w-[58%]" />
      </div>

      {/* Status pill */}
      <Skeleton className="h-[26px] w-[80px] rounded-[13px] lg:h-8 lg:w-[112px] lg:rounded-full" />
    </div>
  );
}

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="px-5 pt-4 lg:px-0 lg:pt-0 lg:space-y-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="flex mx-4 mb-3 bg-white dark:bg-slate-900 rounded-[16px] border border-slate-100 dark:border-slate-800 p-4 gap-2 shadow-sm">
      {[0, 1, 2].map(i => (
        <div key={i} className="flex-1 flex flex-col items-center gap-2">
          <Skeleton className="h-[22px] w-[40px] rounded-md" />
          <Skeleton className="h-[11px] w-[60px] rounded-full opacity-60" />
        </div>
      ))}
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="p-5 flex flex-col items-center">
      {/* Avatar Section */}
      <div className="flex flex-col items-center mb-8 mt-2">
        <Skeleton variant="circle" className="w-[100px] h-[100px] mb-3" />
        <Skeleton className="h-4.5 w-[160px] rounded-full mb-2" />
        <Skeleton className="h-3.5 w-[120px] rounded-full opacity-60" />
      </div>

      {/* Stats row */}
      <div className="w-full grid grid-cols-3 bg-white dark:bg-slate-900 rounded-[16px] border border-slate-100 dark:border-slate-800 p-5 mb-8 gap-2">
        {[0, 1, 2].map(i => (
          <div key={i} className="flex flex-col items-center gap-2">
            <Skeleton className="h-[22px] w-[40px] rounded-md" />
            <Skeleton className="h-[11px] w-[60px] rounded-full opacity-60" />
          </div>
        ))}
      </div>

      {/* Content lines */}
      <div className="w-full space-y-8">
        <div className="space-y-3">
          <Skeleton className="h-3 w-[120px] rounded-full" />
          <Skeleton className="h-[80px] w-full rounded-[16px]" />
        </div>
        
        <div className="space-y-4">
          <Skeleton className="h-3 w-[160px] rounded-full" />
          <div className="bg-white dark:bg-slate-900 rounded-[16px] border border-slate-100 dark:border-slate-800 p-4 space-y-4">
            {[0, 1, 2].map(i => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="w-11 h-11 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                   <Skeleton className="h-2.5 w-[60px] rounded-full" />
                   <Skeleton className="h-3.5 w-[140px] rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action button */}
        <Skeleton className="h-[52px] w-full rounded-[16px]" />
      </div>
    </div>
  );
}
