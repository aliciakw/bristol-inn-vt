import type { AnchorHTMLAttributes } from 'react';

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  size?: 'default' | 'small';
  textColor?: 'ink-900' | 'white';
  bg?: 'prussian-700' | 'prussian-200' | 'lilac-200' | 'sand-200' | 'khaki-200';
};

const sizeClasses: Record<NonNullable<Props['size']>, string> = {
  default: 'h-11 px-5 text-[21px] leading-none tracking-[-0.021em]',
  small: 'h-8 px-3 text-[15px] leading-none tracking-[-0.02em]',
};

const textColorClasses: Record<NonNullable<Props['textColor']>, string> = {
  'ink-900': 'text-ink-900 border-ink-900',
  white: 'text-white border-white',
};

const bgClasses: Record<NonNullable<Props['bg']>, string> = {
  'prussian-700': 'bg-prussian-700',
  'prussian-200': 'bg-prussian-200',
  'lilac-200': 'bg-lilac-200',
  'sand-200': 'bg-sand-200',
  'khaki-200': 'bg-khaki-200',
};

export function ButtonLink({ size = 'default', textColor = 'ink-900', bg = 'khaki-200', className, children, ...rest }: Props) {
  // eslint-disable-next-line security/detect-object-injection
  const variantClassNames = [sizeClasses[size], textColorClasses[textColor], bgClasses[bg]].join(' ');
  const classes = ['inline-flex items-center justify-center rounded-full border font-serif font-medium whitespace-nowrap hover:opacity-90 transition-opacity', variantClassNames, className].filter(Boolean).join(' ');

  return (
    <a className={classes} {...rest}>
      {children}
    </a>
  );
}
