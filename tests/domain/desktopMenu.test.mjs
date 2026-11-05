import { test } from "node:test";
import assert from "node:assert/strict";
import { desktopMenuConfig, desktopMenuManifestEntries } from "../../src/domain/kde/desktopMenu.mjs";
import { renderLayoutScript } from "../../src/domain/kde/lookAndFeel.mjs";
import { DEFAULTS } from "./defaults.mjs";

test("desktop menu shows the Windows entries and keeps KDE editing entries", () => {
    const config = desktopMenuConfig(DEFAULTS);
    assert.equal(config.file, "plasma-org.kde.plasma.desktop-appletsrc");
    assert.deepEqual(config.groups, ["ActionPlugins", "0"]);
    assert.equal(config.plugin, "org.kde.contextmenu");
    ["_display_settings", "configure", "_open_terminal", "add widgets", "edit mode"].forEach((action) => assert.equal(config.actions[action], true, action));
    ["_logout", "_lock_screen", "_run_command", "manage activities"].forEach((action) => assert.equal(config.actions[action], false, action));
});

test("every entry follows its setting", () => {
    const custom = Object.assign({}, DEFAULTS, { desktopMenu: Object.assign({}, DEFAULTS.desktopMenu, { openTerminal: false, logout: true }) });
    const config = desktopMenuConfig(custom);
    assert.equal(config.actions._open_terminal, false);
    assert.equal(config.actions._logout, true);
    assert.match(desktopMenuManifestEntries(custom), /(^|,)_open_terminal=false(,|$)/);
    assert.ok(!desktopMenuManifestEntries(DEFAULTS).includes("'"));
});

test("layout script writes the desktop menu through ConfigFile and still parses", () => {
    const script = renderLayoutScript(DEFAULTS);
    assert.doesNotThrow(() => new Function("Panel", "print", "desktops", "userDataPath", "ConfigFile", script));
    assert.match(script, /new ConfigFile\(settings\.desktopMenu\.file/);
    assert.match(script, /"_display_settings": true/);
    /** @type {string[]} */
    const written = [];
    class FakeConfigFile {
        /** @param {...unknown} parts */
        constructor(...parts) {
            /** @type {string} */
            this.path = parts.map((part) => (part instanceof FakeConfigFile ? String(part.path) : String(part))).join("/");
        }

        /**
         * @param {string} key
         * @param {unknown} value
         */
        writeEntry(key, value) {
            written.push(`${this.path}:${key}=${String(value)}`);
        }
    }
    const panel = function () {
        return { addWidget: () => ({ writeConfig: () => undefined }) };
    };
    new Function("Panel", "print", "desktops", "userDataPath", "ConfigFile", script)(panel, () => undefined, () => [], () => "/home/user", FakeConfigFile);
    assert.ok(written.includes("plasma-org.kde.plasma.desktop-appletsrc/ActionPlugins/0:RightButton;NoModifier=org.kde.contextmenu"));
    assert.ok(written.includes("plasma-org.kde.plasma.desktop-appletsrc/ActionPlugins/0/RightButton;NoModifier:_open_terminal=true"));
});
