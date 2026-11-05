import { test } from "node:test";
import assert from "node:assert/strict";
import { CURSOR_DESIGNS } from "../../src/domain/catalog/cursors.mjs";
import { cursorImages, renderCursorTheme } from "../../src/domain/kde/cursorTheme.mjs";
import { readXcursorDirectory } from "../../src/domain/raster/xcursor.mjs";
import { rasterizeCursor, spinState } from "../../src/domain/raster/cursor.mjs";
import { DEFAULTS } from "./defaults.mjs";

const SMALL = Object.assign({}, DEFAULTS, { cursors: Object.assign({}, DEFAULTS.cursors, { sizes: [24] }) });
const METRICS = { outlineWidth: 1.4, shadowOffset: 1, shadowBlur: 1.5 };
const COLORS = { fill: { hex: "#ffffff", alpha: 1 }, ink: { hex: "#000000", alpha: 1 }, outline: { hex: "#000000", alpha: 1 }, shadow: { hex: "#000000", alpha: 0.3 }, accent: { hex: "#0078d4", alpha: 1 } };

/**
 * @param {number} pixel
 * @returns {number}
 */
function alphaOf(pixel) {
    return pixel >>> 24;
}

test("the arrow has a dark outline, a white body, a shadow and its hotspot at the tip", () => {
    const arrow = CURSOR_DESIGNS.find((design) => design.name === "default");
    assert.ok(arrow);
    const image = rasterizeCursor(arrow, 32, COLORS, METRICS, { frame: 0, frameCount: 1, delay: 0 });
    assert.deepEqual([image.hotX, image.hotY], [2, 2]);
    const body = image.pixels[8 * 32 + 4] ?? 0;
    assert.equal(body, 0xffffffff);
    const edge = image.pixels[8 * 32 + 1] ?? 0;
    assert.ok(alphaOf(edge) > 128 && (edge & 0xff) < 64);
    assert.equal(image.pixels[31 * 32 + 31], 0);
});

test("every cursor renders inside its frame with a sane hotspot", () => {
    CURSOR_DESIGNS.forEach((design) => {
        const images = cursorImages(design, "light", SMALL);
        assert.ok(images.length >= 1, design.name);
        images.forEach((image) => {
            assert.ok(image.hotX >= 0 && image.hotX < 24 && image.hotY >= 0 && image.hotY < 24, design.name);
            assert.ok(image.pixels.some((pixel) => alphaOf(pixel) === 255), design.name);
        });
    });
});

test("busy cursors animate and every name is defined once", () => {
    const wait = CURSOR_DESIGNS.find((design) => design.name === "wait");
    assert.ok(wait);
    const frames = cursorImages(wait, "dark", SMALL);
    assert.equal(frames.length, DEFAULTS.metrics.cursor.waitFrames);
    assert.ok(frames.every((frame) => frame.delay === DEFAULTS.metrics.cursor.waitFrameMilliseconds));
    assert.notDeepEqual(frames[0]?.pixels, frames[1]?.pixels);
    assert.equal(spinState(0, 4).spin, 0);
    assert.equal(spinState(2, 4).sweepScale, 1);
    const names = CURSOR_DESIGNS.flatMap((design) => [design.name, ...design.aliases]);
    assert.equal(new Set(names).size, names.length);
});

test("cursor theme ships index files, one file per design and alias links", () => {
    const files = renderCursorTheme("light", SMALL);
    assert.match(String(files.find((file) => file.path === "index.theme")?.content), /Inherits=breeze_cursors/);
    assert.equal(files.find((file) => file.path === "cursors/left_ptr")?.linkTarget, "default");
    const pointer = files.find((file) => file.path === "cursors/pointer");
    assert.ok(pointer?.content instanceof Uint8Array);
    assert.equal(readXcursorDirectory(pointer.content).length, 1);
});
