import test from 'node:test';
import assert from 'node:assert/strict';
import { packRectangles } from '../dist/esm/index.js';

test('packs simple rectangles deterministically into rows', () => {
  const result = packRectangles(
    [
      { id: 'a', width: 4, height: 3 },
      { id: 'b', width: 5, height: 2 },
    ],
    { pageWidth: 10, pageHeight: 5 },
  );
  assert.deepEqual(result.unplaced, []);
  assert.deepEqual(
    result.placements.map(({ x, y }) => [x, y]),
    [
      [0, 0],
      [4, 0],
    ],
  );
});
test('keeps rectangle content within page bounds including padding', () => {
  const result = packRectangles(
    [
      { id: 'a', width: 3, height: 2 },
      { id: 'b', width: 3, height: 2 },
    ],
    { pageWidth: 10, pageHeight: 5, padding: 1 },
  );
  for (const item of result.placements) {
    assert.ok(item.x >= 1 && item.y >= 1);
    assert.ok(item.x + item.width + 1 <= 10);
    assert.ok(item.y + item.height + 1 <= 5);
  }
});
test('reports items that exceed page bounds without partial placements', () => {
  const result = packRectangles([{ id: 'large', width: 8, height: 8 }], {
    pageWidth: 5,
    pageHeight: 5,
  });
  assert.deepEqual(result.placements, []);
  assert.deepEqual(result.unplaced, ['large']);
});
test('uses rotation only when enabled and useful', () => {
  assert.deepEqual(
    packRectangles([{ id: 'turn', width: 2, height: 5 }], { pageWidth: 5, pageHeight: 3 }).unplaced,
    ['turn'],
  );
  const rotated = packRectangles([{ id: 'turn', width: 2, height: 5 }], {
    pageWidth: 5,
    pageHeight: 3,
    allowRotation: true,
  });
  assert.equal(rotated.placements[0].rotated, true);
  assert.equal(rotated.placements[0].width, 5);
});
test('preserves non-overlap including configured padding', () => {
  const { placements } = packRectangles(
    Array.from({ length: 12 }, (_, i) => ({ id: String(i), width: 2, height: 2 })),
    { pageWidth: 10, pageHeight: 10, padding: 0.25 },
  );
  for (let i = 0; i < placements.length; i += 1)
    for (let j = i + 1; j < placements.length; j += 1) {
      const a = placements[i];
      const b = placements[j];
      assert.ok(
        a.x + a.width + 0.5 <= b.x ||
          b.x + b.width + 0.5 <= a.x ||
          a.y + a.height + 0.5 <= b.y ||
          b.y + b.height + 0.5 <= a.y,
      );
    }
});
test('rejects duplicate IDs, invalid sizes, and excessive input', () => {
  assert.throws(
    () =>
      packRectangles(
        [
          { id: 'x', width: 1, height: 1 },
          { id: 'x', width: 1, height: 1 },
        ],
        { pageWidth: 3, pageHeight: 3 },
      ),
    TypeError,
  );
  assert.throws(
    () => packRectangles([{ id: 'x', width: 0, height: 1 }], { pageWidth: 3, pageHeight: 3 }),
    RangeError,
  );
});
