import { test } from "node:test";
import assert from "node:assert/strict";
import { renderDesktopTheme } from "../../src/domain/kde/desktopTheme.mjs";
import { renderColorScheme } from "../../src/domain/kde/colorScheme.mjs";
import { renderIni } from "../../src/domain/kde/ini.mjs";
import { DEFAULTS } from "./defaults.mjs";
import { elementIds, looksWellFormed } from "./svgHelpers.mjs";

/**
 * @param {import("../../src/domain/kde/files.mjs").OutputFile[]} files
 * @param {string} path
 * @returns {string}
 */
function contentOf(files, path) {
    const file = files.find((candidate) => candidate.path === path);
    assert.ok(file, path);
    return String(file.content);
}

test("plasma style ships regular, translucent and opaque surfaces with shadows and masks", () => {
    const files = renderDesktopTheme("light", DEFAULTS);
    ["", "translucent/", "opaque/"].forEach((directory) => {
        ["dialogs/background.svg", "widgets/background.svg", "widgets/tooltip.svg"].forEach((name) => {
            const ids = elementIds(contentOf(files, `${directory}${name}`));
            ["center", "mask-center", "shadow-topleft", "shadow-hint-bottom-margin", "hint-top-margin"].forEach((id) => assert.ok(ids.has(id), `${directory}${name} ${id}`));
        });
        const panel = elementIds(contentOf(files, `${directory}widgets/panel-background.svg`));
        ["center", "south-top", "north-bottom", "east-left", "west-right", "mask-south-center"].forEach((id) => assert.ok(panel.has(id), id));
    });
    files.filter((file) => file.path.endsWith(".svg")).forEach((file) => assert.ok(looksWellFormed(String(file.content)), file.path));
    const metadata = JSON.parse(contentOf(files, "metadata.json"));
    assert.equal(metadata.KPlugin.Id, "kde-win11-light");
    assert.equal(metadata.ContrastEffect.enabled, true);
});

test("task and list highlights cover every state and use the accent class", () => {
    const files = renderDesktopTheme("dark", DEFAULTS);
    const tasks = contentOf(files, "widgets/tasks.svg");
    ["normal", "minimized", "hover", "focus", "attention"].forEach((state) => assert.ok(elementIds(tasks).has(`${state}-bottom`), state));
    assert.match(tasks, /class="ColorScheme-Highlight"/);
    const items = elementIds(contentOf(files, "widgets/viewitem.svg"));
    ["normal-center", "hover-center", "selected-left", "selected+hover-left"].forEach((id) => assert.ok(items.has(id), id));
});

test("opaque surfaces are fully opaque and translucent ones are lighter", () => {
    const files = renderDesktopTheme("dark", DEFAULTS);
    const opacity = (/** @type {string} */ path) => Number((contentOf(files, path).match(/id="center"><rect[^>]*\/><path [^>]*fill-opacity="([\d.]+)"/) ?? ["", "1"])[1]);
    assert.equal(opacity("opaque/dialogs/background.svg"), 1);
    assert.ok(opacity("translucent/dialogs/background.svg") < opacity("dialogs/background.svg"));
});

test("color schemes carry every KDE color group and follow the accent", () => {
    const light = renderColorScheme("light", DEFAULTS, { id: "KdeWin11Light", name: "Windows 11 Light" });
    ["[Colors:Window]", "[Colors:View]", "[Colors:Button]", "[Colors:Selection]", "[Colors:Tooltip]", "[Colors:Complementary]", "[Colors:Header]", "[Colors:Header][Inactive]", "[WM]", "[General]"].forEach((group) => assert.ok(light.includes(group), group));
    assert.match(light, /\[Colors:Window\]\n(?:.*\n)*?BackgroundNormal=243,243,243/);
    const custom = renderColorScheme("light", Object.assign({}, DEFAULTS, { accent: { color: "#ff0000" } }), { id: "x1", name: "x1" });
    assert.match(custom, /DecorationFocus=217,0,0/);
});

test("ini groups join nested headers and list values", () => {
    assert.equal(renderIni([{ path: ["A", "B"], entries: [["key", ["x", "y"]]] }]), "[A][B]\nkey=x,y\n");
});
