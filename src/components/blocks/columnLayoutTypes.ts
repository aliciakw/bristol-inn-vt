import type { SanityBlock, SanityImage, SanityResolvedLink } from '../../lib/sanity';

export interface ColumnLayoutItem {
  _key?: string;
  body?: SanityBlock[];
  image?: SanityImage;
  cta?: SanityResolvedLink;
  imagePosition?: 'first' | 'last';
}

export interface ColumnLayoutStyleProps {
  textColor?: string;
  backgroundColor?: string;
}

export function getColumnLayoutStyle({ textColor, backgroundColor }: ColumnLayoutStyleProps): string | undefined {
  const style = [textColor ? `color: ${textColor}` : '', backgroundColor ? `background-color: ${backgroundColor}` : ''].filter(Boolean).join('; ');

  return style || undefined;
}
