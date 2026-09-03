export type CollageOrientation = 'landscape' | 'portrait';

export type CollageImage = {
  width?: number;
  height?: number;
  orientation?: CollageOrientation;
};

export function getCollageOrientation(image: CollageImage): CollageOrientation | undefined {
  if (image.orientation) return image.orientation;
  if (!image.width || !image.height) return undefined;
  return image.width >= image.height ? 'landscape' : 'portrait';
}

export function getAutoCollageSpans(images: CollageImage[]): Array<1 | 2> {
  const orientations = images.map(getCollageOrientation);
  let openColumn = false;

  return orientations.map((orientation, index) => {
    if (orientation === 'landscape') {
      openColumn = false;
      return 2;
    }

    const nextOrientation = orientations[index + 1];
    if (!openColumn && (nextOrientation === 'landscape' || index === orientations.length - 1)) return 2;

    openColumn = !openColumn;
    return 1;
  });
}
