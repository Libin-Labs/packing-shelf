# @lp-labs/packing-shelf

Deterministic rectangle shelf packing. Deterministic bounded shelf packing for padded rectangles with optional quarter-turn rotation.

## Install

```sh
npm install @lp-labs/packing-shelf
```

## Quick start

```js
import { packRectangles } from '@lp-labs/packing-shelf';
console.log(
  packRectangles([{ id: 'card', width: 4, height: 3 }], { pageWidth: 10, pageHeight: 8 }),
);
```

## Runtime exports

- `packRectangles`

The package supplies independent ESM and CommonJS builds, bundled declarations, and no runtime or peer dependencies.

## Complete public TypeScript declarations

```ts
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
export declare function packRectangles(
  items: readonly Rectangle[],
  options: ShelfOptions,
): {
  placements: Placement[];
  unplaced: string[];
};
```

## Scope and limits

Places rectangles in input order using first-fit shelf rows, with optional right-angle rotation and padding. Returns placed rectangles and IDs that did not fit.

## Errors and bounds

Invalid IDs/options/types raise TypeError. Duplicate IDs, invalid/overflowing numeric dimensions and excessive input counts raise the documented TypeError or RangeError; non-fitting but valid rectangles are returned in unplaced.

## Customization

Set allowRotation explicitly and set padding to reserve a uniform border. Placement coordinates describe unpadded content; the page bounds include the padding on each side.

## Support

If this library is useful to you, consider supporting its maintenance with a [donation via PayPal](https://www.paypal.me/LibinPrasanth).

## Author

Created by [Libin Prasanth](https://www.linkedin.com/in/libinprasanth/). Connect on LinkedIn for updates and discussion.
