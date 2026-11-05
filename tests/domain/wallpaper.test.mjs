import { test } from "node:test";
import assert from "node:assert/strict";
import { renderWallpaperPackage, renderWallpaperSvg } from "../../src/domain/kde/wallpaper.mjs";
import { DEFAULTS } from "./defaults.mjs";
import { looksWellFormed } from "./svgHelpers.mjs";

test("wallpapers are well-formed and follow their colors", () => {
    const light = renderWallpaperSvg("light", DEFAULTS);
    assert.ok(looksWellFormed(light));
    assert.match(light, /width="3840" height="2160" viewBox="0 0 1920 1080"/);
    const custom = renderWallpaperSvg("dark", Object.assign({}, DEFAULTS, { colors: Object.assign({}, DEFAULTS.colors, { wallpaperDark: Object.assign({}, DEFAULTS.colors.wallpaperDark, { ribbonStart: "#ff00ff" }) }) }));
    assert.match(custom, /stop-color="#ff00ff"/);
    const metadata = JSON.parse(String(renderWallpaperPackage(DEFAULTS)[0]?.content));
    assert.equal(metadata.KPackageStructure, "Wallpaper/Images");
});
