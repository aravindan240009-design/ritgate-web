import MotionLoader from '../common/MotionLoader';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rect' | 'circle';
}

// ── Loading states are unified under the professional MotionLoader ──
// (paper plane + clouds) so every view/page/role is consistent.

// The low-level shimmer primitive is now a no-op: skeleton bars are replaced
// by the MotionLoader, and the bespoke loading blocks that used these bars all
// render an accompanying <SkeletonList /> (the loader) instead.
export function Skeleton(_props: SkeletonProps) {
  return null;
}

export function SkeletonCard() {
  return <MotionLoader compact />;
}

export function SkeletonList(_props: { count?: number }) {
  return <MotionLoader />;
}

export function StatsSkeleton() {
  return <MotionLoader compact />;
}

export function ProfileSkeleton() {
  return <MotionLoader />;
}
