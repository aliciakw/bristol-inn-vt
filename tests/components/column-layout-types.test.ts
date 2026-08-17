import { describe, expect, it } from 'vitest';
import { getSpacerClasses } from '../../src/components/blocks/layoutOptions';

describe('getSpacerClasses()', () => {
  it('defaults empty spacer values to small spacing', () => {
    expect(getSpacerClasses()).toBe('pt-4 pb-4');
  });

  it.each([
    ['none', 'none', 'pt-0 pb-0'],
    ['sm', 'sm', 'pt-4 pb-4'],
    ['md', 'md', 'pt-8 pb-8'],
    ['lg', 'lg', 'pt-16 pb-16'],
  ] as const)('maps %s spacing to static Tailwind classes', (topSpacer, bottomSpacer, expected) => {
    expect(getSpacerClasses(topSpacer, bottomSpacer)).toBe(expected);
  });
});
