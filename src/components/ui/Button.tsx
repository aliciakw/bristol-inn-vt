import type { ButtonHTMLAttributes } from 'react';
import { type ButtonProps, makeButtonClasses } from './constants';

export function Button({ size = 'default', textColor = 'ink-900', bg = 'khaki-200', className, children, ...rest }: ButtonProps) {
  const classes = makeButtonClasses(size, textColor, bg, className);
  return (
    <button {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)} className={classes}>
      {children}
    </button>
  );
}
