import { test } from "node:test";
import assert from "node:assert/strict";
import { renderAurorae } from "../../src/domain/kde/aurorae.mjs";
import { DEFAULTS, GLYPHS } from "./defaults.mjs";
import { elementIds, looksWellFormed } from "./svgHelpers.mjs";

const IDENTITY = { id: "kde-win11-light", name: "Windows 11 Light" };
const CELLS = ["topleft", "top", "topright", "left", "center", "right", "bottomleft", "bottom", "bottomright"];
const STATES = ["active", "inactive", "hover", "hover-inactive", "pressed", "pressed-inactive", "deactivated", "deactivated-inactive"];

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

test("aurorae theme ships metadata, rc, decoration and every caption button", () => {
    const files = renderAurorae("light", DEFAULTS, GLYPHS, IDENTITY);
    assert.deepEqual(files.map((file) => file.path).sort(), [
        "alldesktops.svg", "close.svg", "decoration.svg", "help.svg", "kde-win11-lightrc", "keepabove.svg", "keepbelow.svg",
        "maximize.svg", "metadata.desktop", "minimize.svg", "restore.svg", "shade.svg",
    ]);
    files.filter((file) => file.path.endsWith(".svg")).forEach((file) => assert.ok(looksWellFormed(String(file.content)), file.path));
    assert.match(contentOf(files, "metadata.desktop"), /X-KDE-PluginInfo-Name=kde-win11-light/);
});

test("decoration has active, inactive and maximized frames", () => {
    const ids = elementIds(contentOf(renderAurorae("dark", DEFAULTS, GLYPHS, IDENTITY), "decoration.svg"));
    ["decoration", "decoration-inactive", "decoration-maximized", "decoration-maximized-inactive"].forEach((prefix) => {
        CELLS.forEach((cell) => assert.ok(ids.has(`${prefix}-${cell}`), `${prefix}-${cell}`));
    });
});

test("rc carries Windows 11 title bar metrics and follows settings", () => {
    const rc = contentOf(renderAurorae("light", DEFAULTS, GLYPHS, IDENTITY), "kde-win11-lightrc");
    assert.match(rc, /TitleHeight=32/);
    assert.match(rc, /ButtonWidth=46/);
    assert.match(rc, /TitleAlignment=Left/);
    assert.match(rc, /ActiveTextColor=26,26,26,255/);
    const centered = Object.assign({}, DEFAULTS, { titlebar: Object.assign({}, DEFAULTS.titlebar, { alignment: "center" }) });
    assert.match(contentOf(renderAurorae("light", centered, GLYPHS, IDENTITY), "kde-win11-lightrc"), /TitleAlignment=Center/);
});

test("caption buttons have every state and close hovers red", () => {
    const files = renderAurorae("light", DEFAULTS, GLYPHS, IDENTITY);
    ["minimize", "maximize", "restore", "close", "alldesktops", "keepabove", "keepbelow", "shade", "help"].forEach((button) => {
        const ids = elementIds(contentOf(files, `${button}.svg`));
        STATES.forEach((state) => assert.ok(ids.has(`${state}-center`), `${button} ${state}`));
    });
    const close = contentOf(files, "close.svg");
    assert.match(close.slice(close.indexOf('id="hover-center"')), /fill="#c42b1c"/);
    assert.doesNotMatch(contentOf(files, "minimize.svg"), /#c42b1c/);
});
