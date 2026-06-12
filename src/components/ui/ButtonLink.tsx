import type { AnchorHTMLAttributes } from 'react';
import { makeButtonClasses, type ButtonLinkProps } from './constants';

export function ButtonLink({ size = 'default', textColor = 'ink-900', bg = 'khaki-200', className, children, ...rest }: ButtonLinkProps & { children: React.ReactNode }) {
  const classes = makeButtonClasses(size, textColor, bg, className);

  return (
    <a {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)} role="link" className={classes}>
      {children}
    </a>
  );
}
