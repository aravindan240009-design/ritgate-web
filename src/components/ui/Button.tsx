import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';
import { transitions } from '../../design-system/animations';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
}

const variants = {
  primary: 'bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 shadow-[0_16px_35px_rgba(15,23,42,0.22)] hover:shadow-[0_20px_42px_rgba(15,23,42,0.32)] border border-slate-900 dark:border-white font-extrabold',
  secondary: 'bg-white/78 !text-slate-900 border border-slate-200/80 shadow-[0_10px_28px_-24px_rgba(15,23,42,0.6)] backdrop-blur-xl hover:border-blue-200 hover:bg-blue-50/70 dark:bg-slate-900/72 dark:!text-slate-100 dark:border-slate-700/80 dark:hover:bg-blue-950/30',
  danger: 'bg-gradient-to-br from-rose-500 to-rose-700 text-white shadow-[0_16px_34px_-18px_rgba(244,63,94,0.95)] hover:from-rose-400 hover:to-rose-700',
  ghost: 'bg-transparent text-[var(--color-primary)] hover:bg-blue-50/80 dark:text-blue-400 dark:hover:bg-blue-950/30',
  outline: 'border border-blue-300/80 bg-white/65 !text-blue-700 shadow-sm backdrop-blur-xl hover:bg-blue-50 dark:border-blue-800 dark:!text-blue-300 dark:bg-slate-950/40',
  success: 'bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-[0_16px_34px_-18px_rgba(16,185,129,0.9)] hover:from-emerald-400 hover:to-emerald-700',
};

const sizes = {
  sm: 'h-10 px-4 text-sm rounded-[14px] gap-2',
  md: 'h-11 px-5 text-sm rounded-[15px] gap-2',
  lg: 'h-12 px-6 text-base rounded-2xl gap-2.5',
  xl: 'h-14 px-8 text-base font-bold uppercase tracking-widest rounded-[18px] gap-3',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, icon, iconRight, fullWidth, children, disabled, onClick, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileTap={transitions.feedback.tap}
        transition={{ duration: transitions.feedback.duration }}
        className={cn(
          'inline-flex items-center justify-center font-bold tracking-tight transition-all duration-[220ms] ease-out outline-none select-none whitespace-nowrap',
          'focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:ring-offset-2',
          'disabled:opacity-45 disabled:cursor-not-allowed disabled:shadow-none',
          'hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]',
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className,
        )}
        disabled={disabled || isLoading}
        onClick={onClick}
        {...(props as any)}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : icon ? (
          <span className="shrink-0">{icon}</span>
        ) : null}
        {children && <span className="whitespace-nowrap">{children}</span>}
        {iconRight && <span className="shrink-0">{iconRight}</span>}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
