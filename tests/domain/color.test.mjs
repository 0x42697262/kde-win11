import { test } from "node:test";
import assert from "node:assert/strict";
import { flatten, formatAlpha, mixHex, parseColor, toQtColor, toRgbTriplet } from "../../src/domain/theme/color.mjs";
import { buildPalette } from "../../src/domain/theme/palette.mjs";
import { DEFAULTS } from "./defaults.mjs";

test("colors mix, parse and format", () => {
    assert.equal(mixHex("#000000", "#ffffff", 0.5), "#808080");
    assert.equal(toQtColor({ hex: "#123456", alpha: 1 }), "#ff123456");
    assert.deepEqual(parseColor("#80ff0000"), { hex: "#ff0000", alpha: 128 / 255 });
    assert.deepEqual(parseColor("#00FF00"), { hex: "#00ff00", alpha: 1 });
    assert.equal(toRgbTriplet({ hex: "#0078d4", alpha: 1 }), "0,120,212");
    assert.deepEqual(flatten({ hex: "#ffffff", alpha: 0.5 }, { hex: "#000000", alpha: 1 }), { hex: "#808080", alpha: 1 });
    assert.equal(formatAlpha(1.5), "1");
    assert.equal(formatAlpha(0.123456), "0.1235");
});

test("palettes differ between variants and derive accent shades", () => {
    const light = buildPalette("light", DEFAULTS);
    const dark = buildPalette("dark", DEFAULTS);
    assert.notEqual(light.textPrimary?.hex, dark.textPrimary?.hex);
    assert.equal(light.accent?.hex, "#0078d4");
    assert.notEqual(light.accentForMode?.hex, dark.accentForMode?.hex);
    assert.equal(light.textOnAccent?.hex, "#ffffff");
    assert.equal(dark.textOnAccent?.hex, "#000000");
    assert.ok((light.taskbar?.alpha ?? 1) < 1);
});
