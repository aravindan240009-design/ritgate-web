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
  primary: 'bg-gradient-to-br from-indigo-700 to-indigo-600 text-white shadow-lg active:opacity-90',
  secondary: 'bg-white text-slate-900 border border-slate-200 shadow-sm dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700',
  danger: 'bg-gradient-to-br from-rose-600 to-rose-700 text-white shadow-lg shadow-rose-500/20',
  ghost: 'bg-transparent text-indigo-600 dark:text-indigo-400',
  outline: 'border-2 border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400',
  success: 'bg-gradient-to-br from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-500/20',
};

const sizes = {
  sm: 'h-10 px-4 text-sm rounded-xl gap-2',
  md: 'h-11 px-5 text-sm rounded-xl gap-2',
  lg: 'h-12 px-6 text-base rounded-2xl gap-2.5',
  xl: 'h-14 px-8 text-base font-bold uppercase tracking-widest rounded-2xl gap-3', // 56px match
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, icon, iconRight, fullWidth, children, disabled, onClick, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileTap={transitions.feedback.tap}
        transition={{ duration: transitions.feedback.duration }}
        className={cn(
          'inline-flex items-center justify-center font-bold tracking-tight transition-all duration-200 outline-none select-none',
          'focus-visible:ring-2 focus-visible:ring-indigo-500/30 focus-visible:ring-offset-2',
          'disabled:opacity-40 disabled:cursor-not-allowed',
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
        {children && <span>{children}</span>}
        {iconRight && <span className="shrink-0">{iconRight}</span>}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
