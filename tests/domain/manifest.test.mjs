import { test } from "node:test";
import assert from "node:assert/strict";
import { installedPaths, renderManifest } from "../../src/domain/kde/manifest.mjs";
import { assemblePackages } from "../../src/domain/kde/assemble.mjs";
import { DEFAULTS, GLYPHS } from "./defaults.mjs";

test("manifest is shell-sourceable and names every installed package", () => {
    const manifest = renderManifest(DEFAULTS);
    manifest.trim().split("\n").forEach((line) => assert.match(line, /^KDE_WIN11_[A-Z_]+='[^']*'$/));
    assert.match(manifest, /KDE_WIN11_LOOK_AND_FEEL_DARK='com.github.0x42697262.kdewin11.dark'/);
    assert.match(manifest, /KDE_WIN11_DECORATION_THEME_LIGHT='__aurorae__svg__kde-win11-light'/);
});

test("every installed path exists in the assembled packages", () => {
    const files = assemblePackages(DEFAULTS, GLYPHS, { splashQml: "", loginQml: "" });
    const paths = files.map((file) => file.path);
    [...installedPaths("light"), ...installedPaths("dark"), "wallpapers/kde-win11", "sddm/themes/kde-win11"].forEach((installed) => {
        assert.ok(paths.some((path) => path === installed || path.startsWith(`${installed}/`)), installed);
    });
});
