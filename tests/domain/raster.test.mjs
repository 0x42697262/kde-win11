import { test } from "node:test";
import assert from "node:assert/strict";
import { encodeXcursor, readXcursorDirectory } from "../../src/domain/raster/xcursor.mjs";
import { squaredDistanceToInside, boxBlur } from "../../src/domain/raster/distance.mjs";
import { shapeContains } from "../../src/domain/raster/shapes.mjs";

test("xcursor files round-trip their table of contents", () => {
    const image = { size: 2, width: 2, height: 2, hotX: 1, hotY: 0, delay: 40, pixels: new Uint32Array([0xff000000, 0, 0, 0x80ffffff]) };
    const bytes = encodeXcursor([image, Object.assign({}, image, { size: 3, hotX: 0 })]);
    assert.equal(String.fromCharCode(...bytes.slice(0, 4)), "Xcur");
    const directory = readXcursorDirectory(bytes);
    assert.deepEqual(directory.map((entry) => [entry.size, entry.width, entry.hotX, entry.hotY, entry.delay]), [[2, 2, 1, 0, 40], [3, 2, 0, 0, 40]]);
    const view = new DataView(bytes.buffer);
    assert.equal(view.getUint32((directory[0]?.offset ?? 0) + 12, true), 0x80ffffff);
});

test("distance transform and blur behave on a single point", () => {
    const inside = new Uint8Array(25);
    inside[12] = 1;
    const distances = squaredDistanceToInside(inside, 5, 5, 1e9);
    assert.equal(distances[12], 0);
    assert.equal(distances[13], 1);
    assert.equal(distances[0], 8);
    const blurred = boxBlur(new Float64Array([0, 0, 9, 0, 0]), 5, 1, 1);
    assert.deepEqual([...blurred], [0, 1, 1, 1, 0]);
});

test("shapes answer point queries", () => {
    assert.ok(shapeContains({ kind: "circle", cx: 0, cy: 0, radius: 1 }, 0.5, 0.5, 0, 1));
    assert.ok(!shapeContains({ kind: "ring", cx: 0, cy: 0, inner: 1, outer: 2 }, 0.5, 0, 0, 1));
    assert.ok(shapeContains({ kind: "ring", cx: 0, cy: 0, inner: 1, outer: 2, start: -90, sweep: 90 }, 1, -1, 0, 1));
    assert.ok(!shapeContains({ kind: "ring", cx: 0, cy: 0, inner: 1, outer: 2, start: -90, sweep: 90 }, -1, 1, 0, 1));
    assert.ok(shapeContains({ kind: "capsule", fromX: 0, fromY: 0, toX: 10, toY: 0, radius: 1 }, 5, 0.9, 0, 1));
    assert.ok(shapeContains({ kind: "rect", x: 0, y: 0, width: 10, height: 10, radius: 3 }, 5, 5, 0, 1));
    assert.ok(!shapeContains({ kind: "rect", x: 0, y: 0, width: 10, height: 10, radius: 3 }, 0.2, 0.2, 0, 1));
    assert.ok(shapeContains({ kind: "polygon", points: [[0, 0], [10, 0], [0, 10]] }, 2, 2, 0, 1));
});
