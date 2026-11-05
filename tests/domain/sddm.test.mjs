import { test } from "node:test";
import assert from "node:assert/strict";
import { renderLoginTokens, renderSddmTheme } from "../../src/domain/kde/sddm.mjs";
import { DEFAULTS, GLYPHS } from "./defaults.mjs";
import { looksWellFormed } from "./svgHelpers.mjs";

test("sddm theme ships metadata, config, QML, tokens and icons", () => {
    const files = renderSddmTheme(DEFAULTS, GLYPHS, "Rectangle {}");
    assert.deepEqual(files.map((file) => file.path), [
        "metadata.desktop", "theme.conf", "Main.qml", "Tokens.qml",
        "icons/power.svg", "icons/restart.svg", "icons/sleep.svg", "icons/arrow.svg", "icons/person.svg",
    ]);
    const metadata = String(files[0]?.content);
    ["[SddmGreeterTheme]", "MainScript=Main.qml", "Theme-Id=kde-win11", "QtVersion=6", "ConfigFile=theme.conf"].forEach((line) => assert.ok(metadata.includes(line), line));
    assert.match(String(files[1]?.content), /background=background.jpg/);
    files.slice(4).forEach((file) => assert.ok(looksWellFormed(String(file.content)), file.path));
});

test("login tokens expose every value the QML reads", () => {
    const tokens = renderLoginTokens(DEFAULTS);
    ["text", "accent", "field", "menu", "fontFamily", "avatarSize", "fieldWidth", "timeFormat", "failedText", "powerIcon", "clockTickMilliseconds"].forEach((name) => {
        assert.match(tokens, new RegExp(`readonly property \\w+ ${name}:`), name);
    });
    const custom = renderLoginTokens(Object.assign({}, DEFAULTS, { text: { login: Object.assign({}, DEFAULTS.text.login, { signIn: "Enter" }) } }));
    assert.match(custom, /signInText: "Enter"/);
});
