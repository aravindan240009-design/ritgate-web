import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';
import { transitions } from '../../design-system/animations';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'success' | 'dark';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
}

const variants = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white font-black shadow-md shadow-blue-600/25 border border-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 dark:text-white dark:border-blue-500 dark:shadow-blue-950/50',
  secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-900 font-extrabold border border-slate-200 shadow-sm dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white dark:border-slate-700',
  danger: 'bg-rose-600 hover:bg-rose-700 text-white font-extrabold shadow-md shadow-rose-600/25 border border-rose-600 dark:bg-rose-600 dark:hover:bg-rose-500 dark:text-white dark:border-rose-500',
  ghost: 'bg-transparent text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/40 font-extrabold',
  outline: 'border border-blue-600 bg-transparent text-blue-600 hover:bg-blue-50 dark:border-blue-500 dark:text-blue-400 dark:hover:bg-blue-950/40 font-extrabold',
  success: 'bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold shadow-md shadow-emerald-600/25 border border-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:text-white dark:border-emerald-500',
  dark: 'bg-slate-900 hover:bg-slate-950 text-white font-extrabold shadow-md shadow-slate-900/25 border border-slate-900 dark:bg-black dark:hover:bg-slate-900 dark:text-white dark:border-black dark:shadow-black/50',
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
