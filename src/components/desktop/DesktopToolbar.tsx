import type { ReactNode } from 'react';
import { Search } from 'lucide-react';
import { cn } from '../../utils/cn';

interface DesktopToolbarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  children?: ReactNode;
  className?: string;
}

export default function DesktopToolbar({
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search...',
  children,
  className,
}: DesktopToolbarProps) {
  return (
    <div className={cn('desktop-toolbar animate-fade-up', className)}>
      {onSearchChange && (
        <div className="relative flex-1 min-w-[260px] max-w-[460px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            className="desktop-input pl-11"
          />
        </div>
      )}
      {children}
    </div>
  );
}
