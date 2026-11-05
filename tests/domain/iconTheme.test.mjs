import { test } from "node:test";
import assert from "node:assert/strict";
import { renderIconTheme, symbolicPath } from "../../src/domain/kde/iconTheme.mjs";
import { SYMBOLIC_ICONS } from "../../src/domain/catalog/icons.mjs";
import { DEFAULTS, GLYPHS } from "./defaults.mjs";
import { looksWellFormed } from "./svgHelpers.mjs";

const light = renderIconTheme("light", DEFAULTS, GLYPHS);
const dark = renderIconTheme("dark", DEFAULTS, GLYPHS);

/**
 * @param {import("../../src/domain/kde/files.mjs").OutputFile[]} files
 * @returns {Map<string, import("../../src/domain/kde/files.mjs").OutputFile>}
 */
function byPath(files) {
    return new Map(files.map((file) => [file.path, file]));
}

test("every symbolic glyph exists in the Fluent fonts", () => {
    SYMBOLIC_ICONS.forEach((icon) => {
        assert.doesNotThrow(() => symbolicPath(GLYPHS, icon, 16), icon.glyph);
    });
});

test("icon names are unique across the whole theme", () => {
    /** @type {Map<string, string>} */
    const seen = new Map();
    light.filter((file) => file.path.endsWith(".svg")).forEach((file) => {
        const name = file.path.split("/").pop() ?? "";
        const directory = file.path.split("/").slice(0, -1).join("/");
        const size = directory.split("/")[1] ?? "";
        const key = `${size}:${name}`;
        assert.ok(!seen.has(key) || seen.get(key) === directory, `${name} in ${seen.get(key)} and ${directory}`);
        seen.set(key, directory);
    });
    const contexts = new Map();
    light.filter((file) => file.path.endsWith(".svg")).forEach((file) => {
        const [context, , name] = file.path.split("/");
        const previous = contexts.get(name);
        assert.ok(previous === undefined || previous === context, `${name} in ${previous} and ${context}`);
        contexts.set(name, context);
    });
});

test("aliases are relative links to a file in the same directory", () => {
    const files = byPath(light);
    light.filter((file) => file.linkTarget !== undefined && file.path.endsWith(".svg")).forEach((file) => {
        const directory = file.path.split("/").slice(0, -1).join("/");
        const target = files.get(`${directory}/${file.linkTarget}`);
        assert.ok(target && target.content !== undefined, file.path);
    });
});

test("index lists exactly the directories that hold icons", () => {
    const index = String(byPath(light).get("index.theme")?.content);
    const listed = (index.match(/^Directories=(.*)$/m)?.[1] ?? "").split(",");
    const used = new Set(light.filter((file) => file.path.endsWith(".svg")).map((file) => file.path.split("/").slice(0, -1).join("/")));
    assert.deepEqual([...used].sort(), [...listed].sort());
    assert.match(index, /Inherits=breeze,hicolor/);
    assert.match(index, /\[places\/scalable\]\nSize=64\nMinSize=16\nMaxSize=512\nContext=Places\nType=Scalable/);
    assert.match(String(byPath(dark).get("index.theme")?.content), /Inherits=kde-win11,breeze-dark,hicolor/);
});

test("symbolic icons recolor through the color scheme and match their grid", () => {
    const files = byPath(light);
    const search = String(files.get("actions/22/system-search.svg")?.content);
    assert.match(search, /viewBox="0 0 22 22"/);
    assert.match(search, /class="ColorScheme-Text" fill="currentColor"/);
    assert.match(String(files.get("status/16/dialog-error.svg")?.content), /class="ColorScheme-NegativeText"/);
    const darkSearch = String(byPath(dark).get("actions/22/system-search.svg")?.content);
    assert.match(darkSearch, /\.ColorScheme-Text\{color:#ffffff\}/);
    light.filter((file) => file.content !== undefined && file.path.endsWith(".svg")).forEach((file) => assert.ok(looksWellFormed(String(file.content)), file.path));
});

test("wifi strength follows Fluent numbering where 1 is full", () => {
    const files = byPath(light);
    const excellent = files.get("status/24/network-wireless-signal-excellent.svg");
    const full = GLYPHS.path("wifi_1_24", "regular", { x: 0, y: 0, size: 24 });
    assert.ok(String(excellent?.content).includes(full));
});

test("colorful artwork ships in the light theme and is linked from the dark one", () => {
    const files = byPath(light);
    ["places/scalable/folder.svg", "places/scalable/user-trash.svg", "devices/scalable/drive-harddisk.svg", "mimetypes/scalable/application-pdf.svg", "apps/scalable/utilities-terminal.svg", "apps/scalable/start-here.svg"].forEach((path) => {
        assert.ok(files.get(path)?.content, path);
    });
    assert.equal(files.get("apps/scalable/org.kde.dolphin.svg")?.linkTarget, "system-file-manager.svg");
    assert.equal(byPath(dark).get("places/scalable")?.linkTarget, "../../kde-win11/places/scalable");
    const custom = renderIconTheme("light", Object.assign({}, DEFAULTS, { accent: { color: "#ff0000" } }), GLYPHS);
    assert.match(String(byPath(custom).get("apps/scalable/start-here.svg")?.content), /stop-color="#ff0000"/);
});
