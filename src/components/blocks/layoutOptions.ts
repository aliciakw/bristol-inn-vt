export type SpacerSize = 'none' | 'sm' | 'md' | 'lg';

const TOP_SPACER_CLASSES: Record<SpacerSize, string> = {
  none: 'pt-0',
  sm: 'pt-4',
  md: 'pt-8',
  lg: 'pt-16',
};

const BOTTOM_SPACER_CLASSES: Record<SpacerSize, string> = {
  none: 'pb-0',
  sm: 'pb-4',
  md: 'pb-8',
  lg: 'pb-16',
};

export function getSpacerClasses(topSpacer: SpacerSize = 'sm', bottomSpacer: SpacerSize = 'sm'): string {
  return `${TOP_SPACER_CLASSES[topSpacer]} ${BOTTOM_SPACER_CLASSES[bottomSpacer]}`;
}
