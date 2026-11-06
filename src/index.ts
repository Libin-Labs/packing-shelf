export interface Rectangle {
  id: string;
  width: number;
  height: number;
}
export interface ShelfOptions {
  pageWidth: number;
  pageHeight: number;
  padding?: number;
  allowRotation?: boolean;
}
export interface Placement {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotated: boolean;
}
interface Shelf {
  y: number;
  height: number;
  usedWidth: number;
}
function positive(value: number, name: string, allowZero = false): void {
  if (!Number.isFinite(value) || value < (allowZero ? 0 : Number.EPSILON))
    throw new RangeError(`${name} must be finite and ${allowZero ? 'non-negative' : 'positive'}.`);
}
export function packRectangles(
  items: readonly Rectangle[],
  options: ShelfOptions,
): { placements: Placement[]; unplaced: string[] } {
  positive(options.pageWidth, 'Page width');
  positive(options.pageHeight, 'Page height');
  const padding = options.padding ?? 0;
  positive(padding, 'Padding', true);
  if (options.allowRotation !== undefined && typeof options.allowRotation !== 'boolean')
    throw new TypeError('allowRotation must be boolean.');
  if (!Array.isArray(items) || items.length > 10_000)
    throw new RangeError('Items must be an array of at most 10000 rectangles.');
  const ids = new Set<string>();
  const shelves: Shelf[] = [];
  const placements: Placement[] = [];
  const unplaced: string[] = [];
  for (const item of items) {
    if (
      !item ||
      typeof item !== 'object' ||
      typeof item.id !== 'string' ||
      !item.id ||
      item.id.length > 128
    )
      throw new TypeError('Each rectangle needs a nonempty ID up to 128 characters.');
    if (ids.has(item.id)) throw new TypeError(`Duplicate rectangle ID: ${item.id}`);
    ids.add(item.id);
    positive(item.width, 'Width');
    positive(item.height, 'Height');
    const orientations = [{ width: item.width, height: item.height, rotated: false }];
    if (options.allowRotation && item.width !== item.height)
      orientations.push({ width: item.height, height: item.width, rotated: true });
    let fit: Placement | undefined;
    for (const orientation of orientations) {
      const width = orientation.width + padding * 2;
      const height = orientation.height + padding * 2;
      if (width > options.pageWidth || height > options.pageHeight) continue;
      for (const shelf of shelves) {
        if (height <= shelf.height && shelf.usedWidth + width <= options.pageWidth) {
          fit = {
            id: item.id,
            x: shelf.usedWidth + padding,
            y: shelf.y + padding,
            width: orientation.width,
            height: orientation.height,
            rotated: orientation.rotated,
          };
          shelf.usedWidth += width;
          break;
        }
      }
      if (fit) break;
      const y = shelves.reduce((bottom, shelf) => Math.max(bottom, shelf.y + shelf.height), 0);
      if (y + height <= options.pageHeight) {
        shelves.push({ y, height, usedWidth: width });
        fit = {
          id: item.id,
          x: padding,
          y: y + padding,
          width: orientation.width,
          height: orientation.height,
          rotated: orientation.rotated,
        };
        break;
      }
    }
    if (fit) placements.push(fit);
    else unplaced.push(item.id);
  }
  return { placements, unplaced };
}
