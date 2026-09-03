import { describe, expect, it } from 'vitest';
import { getAutoCollageSpans } from '../../src/lib/auto-collage';

describe('getAutoCollageSpans', () => {
  it('makes landscape images span both columns', () => {
    expect(getAutoCollageSpans([{ orientation: 'landscape' }])).toEqual([2]);
  });

  it('pairs consecutive portrait images', () => {
    expect(getAutoCollageSpans([{ orientation: 'portrait' }, { orientation: 'portrait' }])).toEqual([1, 1]);
  });

  it('expands a portrait before a landscape to avoid a blank column', () => {
    expect(getAutoCollageSpans([{ orientation: 'portrait' }, { orientation: 'landscape' }])).toEqual([2, 2]);
  });

  it('keeps a completed portrait row before a landscape', () => {
    expect(getAutoCollageSpans([{ orientation: 'portrait' }, { orientation: 'portrait' }, { orientation: 'landscape' }])).toEqual([1, 1, 2]);
  });

  it('expands an unpaired final portrait to avoid a blank column', () => {
    expect(getAutoCollageSpans([{ orientation: 'portrait' }])).toEqual([2]);
  });

  it('uses supplied dimensions when orientation is not explicit', () => {
    expect(
      getAutoCollageSpans([
        { width: 600, height: 900 },
        { width: 1200, height: 800 },
      ]),
    ).toEqual([2, 2]);
  });
});
