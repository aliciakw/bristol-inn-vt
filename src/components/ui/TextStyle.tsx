import type { CSSProperties, ReactNode } from 'react';
import type { StyleableTextElement, TextStyleVariant } from './types';

interface Props {
  id?: string;
  variant?: TextStyleVariant;
  element?: StyleableTextElement;
  bold?: boolean;
  truncate?: boolean;
  uppercase?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

const variantMap: Record<TextStyleVariant, { el: StyleableTextElement; classes: string }> = {
  h1: { el: 'h1', classes: 'font-serif text-h1 tablet:text-h1-tablet desktop:text-h1-desktop' },
  h2: { el: 'h2', classes: 'font-serif text-h2 tablet:text-h2-tablet desktop:text-h2-desktop' },
  h3: { el: 'h3', classes: 'font-serif text-h3 tablet:text-h3-tablet desktop:text-h3-desktop' },
  h4: { el: 'h4', classes: 'font-serif text-h4 tablet:text-h4-tablet desktop:text-h4-desktop' },
  h5: { el: 'h5', classes: 'font-serif text-h5 tablet:text-h5-tablet desktop:text-h5-desktop' },
  paragraph: { el: 'p', classes: 'font-serif text-paragraph tablet:text-paragraph-tablet desktop:text-paragraph-desktop' },
  label: { el: 'span', classes: 'font-serif text-label tablet:text-label-tablet desktop:text-label-desktop' },
  caption: { el: 'span', classes: 'font-serif text-caption tablet:text-caption-tablet desktop:text-caption-desktop' },
};

export function TextStyle({ id, variant = 'paragraph', element, bold, truncate, uppercase, className, style, children }: Props) {
  // eslint-disable-next-line security/detect-object-injection
  const { el: defaultEl, classes: defaultClasses } = variantMap[variant];
  const Tag = (element ?? defaultEl) as React.ElementType;
  const classes = [defaultClasses, bold && 'font-bold', truncate && 'truncate', uppercase && 'uppercase', className].filter(Boolean).join(' ');

  return (
    <Tag id={id} className={classes} style={style}>
      {children}
    </Tag>
  );
}
