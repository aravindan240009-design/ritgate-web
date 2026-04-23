import type { ReactNode, HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

interface ThemedTextProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  variant?: string; // legacy — ignored for web
  as?: 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

/**
 * ThemedText — web-compatible text component
 * Replaces React Native Text with semantic HTML elements
 */
export default function ThemedText({
  children,
  variant,
  as: Component = 'span',
  className,
  ...rest
}: ThemedTextProps) {
  return (
    <Component className={cn(className)} {...rest}>
      {children}
    </Component>
  );
}
