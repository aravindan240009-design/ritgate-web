import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface DesktopPageHeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  action?: ReactNode;
  className?: string;
}

export default function DesktopPageHeader({ title, subtitle, eyebrow, action, className }: DesktopPageHeaderProps) {
  void title;
  void subtitle;
  void eyebrow;

  if (!action) return null;

  return (
    <section className={cn('hidden lg:flex justify-end gap-3 mb-5', className)}>
      <div className="shrink-0">{action}</div>
    </section>
  );
}
