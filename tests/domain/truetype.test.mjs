import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseFont, contoursToPath } from "../../src/domain/font/truetype.mjs";
import { formatNumber } from "../../src/domain/numbers.mjs";
import { GLYPHS, ROOT } from "./defaults.mjs";

const font = parseFont(new Uint8Array(readFileSync(join(ROOT, "assets/fonts/FluentSystemIcons-Regular.ttf"))));
const map = JSON.parse(readFileSync(join(ROOT, "assets/fonts/FluentSystemIcons-Regular.json"), "utf8"));

test("font metrics and character map resolve", () => {
    assert.equal(font.unitsPerEm, 500);
    assert.equal(font.ascender, 500);
    assert.ok(font.glyphIndex(map.ic_fluent_folder_24_regular) > 0);
    assert.equal(font.glyphIndex(0x41), 0);
});

test("glyph contours become closed SVG paths inside the box", () => {
    const contours = font.contours(font.glyphIndex(map.ic_fluent_search_24_regular));
    assert.ok(contours.length > 0);
    const path = contoursToPath(contours, font, { scale: 24 / 500, offsetX: 0, offsetY: 0 });
    assert.match(path, /^M[\d.]+ [\d.]+/);
    assert.ok(path.endsWith("Z"));
    const numbers = (path.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);
    assert.ok(numbers.every((value) => value >= -1 && value <= 25));
});

test("glyph source offsets and reports missing names", () => {
    assert.ok(GLYPHS.has("folder_24", "regular"));
    assert.ok(GLYPHS.has("folder_24", "filled"));
    assert.ok(!GLYPHS.has("not_a_glyph_24", "regular"));
    assert.throws(() => GLYPHS.path("not_a_glyph_24", "regular", { x: 0, y: 0, size: 24 }));
    const shifted = GLYPHS.path("folder_24", "regular", { x: 100, y: 0, size: 24 });
    assert.ok(Number(shifted.slice(1).split(" ")[0]) >= 100);
});

test("numbers format without trailing noise or negative zero", () => {
    assert.equal(formatNumber(1.23456), "1.235");
    assert.equal(formatNumber(-0.0001), "0");
});
