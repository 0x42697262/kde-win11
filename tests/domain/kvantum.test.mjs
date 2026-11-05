import { test } from "node:test";
import assert from "node:assert/strict";
import { renderKvantumTheme } from "../../src/domain/kde/kvantum.mjs";
import { DEFAULTS, GLYPHS } from "./defaults.mjs";
import { elementIds, looksWellFormed } from "./svgHelpers.mjs";

const SIDES = ["top", "bottom", "left", "right", "topleft", "topright", "bottomleft", "bottomright"];

/**
 * @param {string} variant
 * @returns {{ config: string, svg: string, ids: Set<string> }}
 */
function render(variant) {
    const files = renderKvantumTheme(variant, DEFAULTS, GLYPHS);
    const config = String(files.find((file) => file.path.endsWith(".kvconfig"))?.content);
    const svg = String(files.find((file) => file.path.endsWith(".svg"))?.content);
    return { config, svg, ids: elementIds(svg) };
}

test("kvantum theme ships a kvconfig and a well-formed svg named after the theme", () => {
    const files = renderKvantumTheme("dark", DEFAULTS, GLYPHS);
    assert.deepEqual(files.map((file) => file.path), ["KdeWin11Dark.kvconfig", "KdeWin11Dark.svg"]);
    assert.ok(looksWellFormed(String(files[1]?.content)));
});

test("every frame and interior element the config names exists in normal state", () => {
    const { config, ids } = render("light");
    const frames = new Set([...config.matchAll(/^frame\.element=(.+)$/gm)].map((match) => match[1] ?? ""));
    const interiors = new Set([...config.matchAll(/^interior\.element=(.+)$/gm)].map((match) => match[1] ?? ""));
    frames.forEach((name) => SIDES.forEach((side) => assert.ok(ids.has(`${name}-normal-${side}`), `${name}-normal-${side}`)));
    interiors.forEach((name) => assert.ok(ids.has(`${name}-normal`) || ids.has(`${name}-normal-topleft`), `${name}-normal`));
});

test("menus get rounded frames, shadows, hover, checks and submenu arrows", () => {
    const { config, ids } = render("light");
    ["menu-normal", "menu-normal-topleft", "menu-shadow-topleft", "menu-shadow-bottom", "menuitem-focused", "menuitem-right-normal", "menu-checkbox-checked-normal", "menu-radio-checked-normal", "tooltip-shadow-top"].forEach((id) => assert.ok(ids.has(id), id));
    assert.match(config, /^menu_shadow_depth=10$/m);
    assert.match(config, /^spread_menuitems=false$/m);
    assert.match(config, /\[Menu\]\n(?:.*\n)*?frame\.top=8/);
});

test("check boxes, radios, sliders and arrows cover every state", () => {
    const { ids } = render("dark");
    ["normal", "focused", "pressed", "disabled"].forEach((state) => {
        ["checkbox", "checkbox-checked", "checkbox-tristate", "radio", "radio-checked", "slidercursor"].forEach((name) => assert.ok(ids.has(`${name}-${state}`), `${name}-${state}`));
        ["arrow", "b-arrow", "s-arrow", "flat-s-arrow"].forEach((family) => ["up", "down", "left", "right", "plus", "minus"].forEach((direction) => assert.ok(ids.has(`${family}-${direction}-${state}`))));
    });
});

test("colors follow the variant and the accent", () => {
    assert.match(render("light").config, /^highlight\.color=#0066b4$/m);
    assert.match(render("dark").config, /^window\.color=#202020$/m);
    const custom = renderKvantumTheme("light", Object.assign({}, DEFAULTS, { accent: { color: "#e3008c" } }), GLYPHS);
    assert.doesNotMatch(String(custom[0]?.content), /^highlight\.color=#0066b4$/m);
});
