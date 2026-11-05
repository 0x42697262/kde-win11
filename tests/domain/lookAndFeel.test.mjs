import { test } from "node:test";
import assert from "node:assert/strict";
import { renderDefaults, renderLayoutScript, renderLookAndFeel, renderSplashTokens } from "../../src/domain/kde/lookAndFeel.mjs";
import { renderTokensQml } from "../../src/domain/kde/qmlTokens.mjs";
import { DEFAULTS, GLYPHS } from "./defaults.mjs";
import { looksWellFormed } from "./svgHelpers.mjs";

test("defaults wire every package of the variant together", () => {
    const defaults = renderDefaults("dark", DEFAULTS);
    [
        "[kdeglobals][General]\nColorScheme=KdeWin11Dark",
        "[kdeglobals][Icons]\nTheme=kde-win11-dark",
        "[plasmarc][Theme]\nname=kde-win11-dark",
        "theme=__aurorae__svg__kde-win11-dark",
        "library=org.kde.kwin.aurorae",
        "cursorTheme=kde-win11-cursors-dark",
        "Theme=com.github.0x42697262.kdewin11.dark",
        "LayoutName=thumbnail_grid",
    ].forEach((line) => assert.ok(defaults.includes(line), line));
});

test("layout script parses and centers the taskbar between two spacers", () => {
    const centered = renderLayoutScript(DEFAULTS);
    assert.doesNotThrow(() => new Function("Panel", "print", "desktops", "userDataPath", centered));
    assert.equal(centered.match(/addSpacer\(\);/g)?.length, 2);
    assert.match(centered, /"launchers": \[\n\s+"preferred:\/\/filemanager"/);
    const left = renderLayoutScript(Object.assign({}, DEFAULTS, { taskbar: Object.assign({}, DEFAULTS.taskbar, { alignment: "left" }) }));
    assert.equal(left.match(/addSpacer\(\);/g)?.length, 1);
    assert.ok(left.indexOf("addSpacer();") > left.indexOf("settings.widgets.tasks"));
});

test("look and feel ships metadata, defaults, layout and splash", () => {
    const files = renderLookAndFeel("light", DEFAULTS, GLYPHS, "Rectangle {}");
    assert.deepEqual(files.map((file) => file.path), [
        "metadata.json",
        "contents/defaults",
        "contents/layouts/org.kde.plasma.desktop-layout.js",
        "contents/splash/Splash.qml",
        "contents/splash/Tokens.qml",
        "contents/splash/images/logo.svg",
    ]);
    const metadata = JSON.parse(String(files[0]?.content));
    assert.equal(metadata.KPackageStructure, "Plasma/LookAndFeel");
    assert.equal(metadata.KPlugin.Id, "com.github.0x42697262.kdewin11.light");
    assert.ok(looksWellFormed(String(files[5]?.content)));
});

test("splash tokens are typed QML properties", () => {
    const tokens = renderSplashTokens("dark", DEFAULTS);
    assert.match(tokens, /readonly property color background: "#202020"/);
    assert.match(tokens, /readonly property int introStage: 2/);
    assert.match(tokens, /readonly property url logoSource: "images\/logo.svg"/);
    assert.equal(renderTokensQml([{ name: "size", type: "real", value: 1.23456 }]), "import QtQuick\n\nQtObject {\n    readonly property real size: 1.235\n}\n");
});
