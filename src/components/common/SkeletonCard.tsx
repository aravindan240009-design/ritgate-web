import { cn } from '../../utils/cn';

export default function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 space-y-3 lg:rounded-[24px] lg:border-white/60 lg:bg-white/78 lg:p-7 lg:shadow-[0_18px_45px_rgba(15,23,42,0.08)] lg:backdrop-blur-xl lg:space-y-6">
      {/* Top row: avatar + name + time */}
      <div className="flex items-center gap-3 lg:gap-5">
        <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 skeleton lg:h-16 lg:w-16" />
        <div className="flex-1 space-y-2 lg:space-y-3">
          <div className="h-3.5 bg-slate-200 dark:bg-slate-700 rounded-lg w-3/5 skeleton lg:h-4 lg:w-[46%]" />
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-lg w-2/5 skeleton lg:h-3.5 lg:w-[32%]" />
        </div>
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-lg w-12 skeleton lg:w-14" />
      </div>

      {/* Info box */}
      <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3.5 space-y-2.5 lg:rounded-[22px] lg:px-6 lg:py-5 lg:space-y-3">
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-lg w-11/12 skeleton lg:h-3.5 lg:w-[82%]" />
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-lg w-3/5 skeleton lg:h-3.5 lg:w-[58%]" />
      </div>

      {/* Status pill */}
      <div className="h-7 bg-slate-200 dark:bg-slate-700 rounded-full w-20 skeleton lg:h-8 lg:w-28" />
    </div>
  );
}

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3 lg:space-y-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="p-5 space-y-8">
      {/* Avatar */}
      <div className="flex flex-col items-center space-y-3">
        <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-700 skeleton" />
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-lg w-40 skeleton" />
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-lg w-32 skeleton" />
      </div>

      {/* Stats card */}
      <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-5">
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-lg w-10 skeleton" />
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-lg w-16 skeleton" />
            </div>
          ))}
        </div>
      </div>

      {/* Section header */}
      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-lg w-32 skeleton" />

      {/* Theme selector */}
      <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded-2xl skeleton" />

      {/* Section header */}
      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-lg w-40 skeleton" />

      {/* Info card */}
      <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 space-y-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-11 h-11 bg-slate-200 dark:bg-slate-700 rounded-xl skeleton" />
            <div className="flex-1 space-y-2">
              <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg w-16 skeleton" />
              <div className="h-3.5 bg-slate-200 dark:bg-slate-700 rounded-lg w-36 skeleton" />
            </div>
          </div>
        ))}
      </div>

      {/* Logout button */}
      <div className="h-13 bg-slate-200 dark:bg-slate-700 rounded-2xl skeleton" />
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 mx-4 mb-3">
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2">
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-lg w-10 skeleton" />
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-lg w-16 skeleton" />
          </div>
        ))}
      </div>
    </div>
  );
}
