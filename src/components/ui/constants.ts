import type { HTMLAttributes, AnchorHTMLAttributes } from 'react';

type PressableBaseProps = {
  size?: 'default' | 'small' | 'x-small';
  textColor?: 'ink-900' | 'white';
  bg?: 'prussian-700' | 'prussian-200' | 'lilac-200' | 'sand-200' | 'khaki-200';
  class?: string;
  tabIndex?: number;
};

export type ButtonProps = Omit<HTMLAttributes<'button'>, 'class' | 'role'> &
  PressableBaseProps & {
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
  };
export type ButtonLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'class' | 'role'> & {
  href: string;
} & PressableBaseProps;

export const buttonDefaultClasses = 'inline-flex items-center justify-center rounded-full border font-serif font-medium whitespace-nowrap hover:opacity-90 transition-opacity pointer';

export const buttonSizeClasses = {
  default: 'h-10 px-5 text-[21px] leading-none tracking-[-0.02em]',
  small: 'h-9 px-3 text-[18px] leading-none tracking-[-0.02em]',
  'x-small': 'h-8 px-3 text-[15px] leading-none tracking-[-0.02em]',
} satisfies Record<NonNullable<ButtonProps['size']>, string>;

export const buttonTextColorClasses = {
  'ink-900': 'text-ink-900 border-ink-900',
  white: 'text-white border-white',
} satisfies Record<NonNullable<ButtonProps['textColor']>, string>;

export const buttonBgClasses = {
  'prussian-700': 'bg-prussian-700',
  'prussian-200': 'bg-prussian-200',
  'lilac-200': 'bg-lilac-200',
  'sand-200': 'bg-sand-200',
  'khaki-200': 'bg-khaki-200',
} satisfies Record<NonNullable<ButtonProps['bg']>, string>;

export function makeButtonClasses(size: NonNullable<ButtonProps['size']>, textColor: NonNullable<ButtonProps['textColor']>, bg: NonNullable<ButtonProps['bg']>, otherClasses?: string) {
  // eslint-disable-next-line security/detect-object-injection
  return [buttonDefaultClasses, buttonSizeClasses[size], buttonTextColorClasses[textColor], buttonBgClasses[bg], otherClasses].filter(Boolean).join(' ');
}
