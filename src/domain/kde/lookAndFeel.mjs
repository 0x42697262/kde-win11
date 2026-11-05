import { CLOCK_DATE_BELOW_TIME, KICKOFF_DISPLAY, KICKOFF_SHORTCUT, KSPLASH_ENGINE, LOOK_AND_FEEL_API_VERSION, PLASMA_WIDGETS, SPLASH_INTRO_STAGE, SPLASH_LOGO_FILE, SPLASH_RING_SWEEP, START_ICON_NAME } from "../catalog/kdeFormats.mjs";
import { TaskbarAlignment } from "../catalog/enums.mjs";
import { AURORAE_IDS, AURORAE_PLUGIN, AURORAE_THEME_PREFIX, COLOR_SCHEME_IDS, CURSOR_THEME_IDS, DESKTOP_SWITCHER_LAYOUT, DESKTOP_THEME_IDS, ICON_THEME_IDS, LOOK_AND_FEEL_IDS, PackageRoot, WALLPAPER_ID, WIDGET_STYLE, WINDOW_SWITCHER_LAYOUT } from "../catalog/packages.mjs";
import { PACKAGE_TEXT } from "../catalog/packageText.mjs";
import { DEGREES_PER_TURN } from "../catalog/units.mjs";
import { buildPalette, colorOf } from "../theme/palette.mjs";
import { startHereSvg } from "./iconArtwork.mjs";
import { renderIni } from "./ini.mjs";
import { kPlugin, renderJson } from "./metadata.mjs";
import { renderTokensQml } from "./qmlTokens.mjs";
import { desktopMenuConfig } from "./desktopMenu.mjs";
import { textFile } from "./files.mjs";

/** @typedef {import("./files.mjs").OutputFile} OutputFile */
/** @typedef {import("../settings/document.mjs").SettingsValues} SettingsValues */
/** @typedef {import("../font/glyphs.mjs").GlyphSource} GlyphSource */
/** @typedef {"light" | "dark"} VariantName */

/**
 * @param {VariantName} variant
 * @param {SettingsValues} values
 * @returns {string}
 */
export function renderDefaults(variant, values) {
    return renderIni([
        { path: ["kcminputrc", "Mouse"], entries: [["cursorTheme", CURSOR_THEME_IDS[variant]], ["cursorSize", values.cursors.size]] },
        { path: ["kdeglobals", "General"], entries: [["ColorScheme", COLOR_SCHEME_IDS[variant]]] },
        { path: ["kdeglobals", "Icons"], entries: [["Theme", ICON_THEME_IDS[variant]]] },
        { path: ["kdeglobals", "KDE"], entries: [["widgetStyle", WIDGET_STYLE]] },
        { path: ["kwinrc", "WindowSwitcher"], entries: [["LayoutName", WINDOW_SWITCHER_LAYOUT]] },
        { path: ["kwinrc", "DesktopSwitcher"], entries: [["LayoutName", DESKTOP_SWITCHER_LAYOUT]] },
        {
            path: ["kwinrc", "org.kde.kdecoration2"],
            entries: [
                ["library", AURORAE_PLUGIN],
                ["theme", `${AURORAE_THEME_PREFIX}${AURORAE_IDS[variant]}`],
                ["ButtonsOnLeft", values.titlebar.buttonsOnLeft],
                ["ButtonsOnRight", values.titlebar.buttonsOnRight],
            ],
        },
        { path: ["plasmarc", "Theme"], entries: [["name", DESKTOP_THEME_IDS[variant]]] },
        { path: ["ksplashrc", "KSplash"], entries: [["Engine", KSPLASH_ENGINE], ["Theme", LOOK_AND_FEEL_IDS[variant]]] },
    ]);
}

/**
 * @param {SettingsValues} values
 * @returns {string}
 */
export function renderLayoutScript(values) {
    const centered = values.taskbar.alignment === TaskbarAlignment.Center;
    const settings = {
        height: values.metrics.panel.height,
        floating: values.taskbar.floating,
        launchers: values.taskbar.pinned,
        favoritesDisplay: KICKOFF_DISPLAY[/** @type {"grid" | "list"} */ (values.startMenu.favoritesDisplay)],
        applicationsDisplay: KICKOFF_DISPLAY[/** @type {"grid" | "list"} */ (values.startMenu.allAppsDisplay)],
        showDate: values.taskbar.showDate,
        dateDisplayFormat: CLOCK_DATE_BELOW_TIME,
        showDesktopButton: values.taskbar.showDesktopButton,
        startIcon: START_ICON_NAME,
        kickoffShortcut: KICKOFF_SHORTCUT,
        wallpaperPackage: `${PackageRoot.Wallpapers}/${WALLPAPER_ID}`,
        widgets: PLASMA_WIDGETS,
        desktopMenu: desktopMenuConfig(values),
    };
    const lines = [
        `const settings = ${JSON.stringify(settings, null, 4)};`,
        "",
        "const panel = new Panel;",
        "panel.location = \"bottom\";",
        "panel.height = settings.height;",
        "panel.alignment = \"center\";",
        "panel.hiding = \"none\";",
        "try { panel.lengthMode = \"fill\"; } catch (error) { print(error); }",
        "try { panel.floating = settings.floating; } catch (error) { print(error); }",
        "",
        "function addSpacer() {",
        "    const spacer = panel.addWidget(settings.widgets.spacer);",
        "    spacer.currentConfigGroup = [\"General\"];",
        "    spacer.writeConfig(\"expanding\", true);",
        "}",
        "",
        centered ? "addSpacer();" : "",
        "const kickoff = panel.addWidget(settings.widgets.kickoff);",
        "kickoff.currentConfigGroup = [\"General\"];",
        "kickoff.writeConfig(\"icon\", settings.startIcon);",
        "kickoff.writeConfig(\"favoritesDisplay\", settings.favoritesDisplay);",
        "kickoff.writeConfig(\"applicationsDisplay\", settings.applicationsDisplay);",
        "kickoff.writeConfig(\"showActionButtonCaptions\", false);",
        "kickoff.currentConfigGroup = [\"Shortcuts\"];",
        "kickoff.writeConfig(\"global\", settings.kickoffShortcut);",
        "",
        "const tasks = panel.addWidget(settings.widgets.tasks);",
        "tasks.currentConfigGroup = [\"General\"];",
        "tasks.writeConfig(\"launchers\", settings.launchers);",
        "tasks.writeConfig(\"showOnlyCurrentDesktop\", false);",
        "tasks.writeConfig(\"maxStripes\", 1);",
        "tasks.writeConfig(\"indicateAudioStreams\", true);",
        "",
        "addSpacer();",
        "panel.addWidget(settings.widgets.tray);",
        "const clock = panel.addWidget(settings.widgets.clock);",
        "clock.currentConfigGroup = [\"Appearance\"];",
        "clock.writeConfig(\"showDate\", settings.showDate);",
        "clock.writeConfig(\"dateDisplayFormat\", settings.dateDisplayFormat);",
        "clock.writeConfig(\"dateFormat\", \"shortDate\");",
        "if (settings.showDesktopButton) {",
        "    panel.addWidget(settings.widgets.showDesktop);",
        "}",
        "",
        "const wallpaper = \"file://\" + userDataPath() + \"/.local/share/\" + settings.wallpaperPackage + \"/\";",
        "try {",
        "    let menuGroup = new ConfigFile(settings.desktopMenu.file, settings.desktopMenu.groups[0]);",
        "    settings.desktopMenu.groups.slice(1).forEach(function (group) {",
        "        menuGroup = new ConfigFile(menuGroup, group);",
        "    });",
        "    menuGroup.writeEntry(settings.desktopMenu.trigger, settings.desktopMenu.plugin);",
        "    const menuActions = new ConfigFile(menuGroup, settings.desktopMenu.trigger);",
        "    Object.keys(settings.desktopMenu.actions).forEach(function (action) {",
        "        menuActions.writeEntry(action, settings.desktopMenu.actions[action]);",
        "    });",
        "} catch (error) { print(error); }",
        "",
        "desktops().forEach(function (desktop) {",
        "    desktop.wallpaperPlugin = settings.widgets.wallpaper;",
        "    desktop.currentConfigGroup = [\"Wallpaper\", settings.widgets.wallpaper, \"General\"];",
        "    desktop.writeConfig(\"Image\", wallpaper);",
        "});",
    ];
    return `${lines.filter((line, index, all) => !(line === "" && all[index - 1] === "")).join("\n")}\n`;
}

/**
 * @param {VariantName} variant
 * @param {SettingsValues} values
 * @returns {string}
 */
export function renderSplashTokens(variant, values) {
    const palette = buildPalette(variant, values);
    const splash = values.metrics.splash;
    return renderTokensQml([
        { name: "background", type: "color", value: colorOf(palette, "window").hex },
        { name: "accent", type: "color", value: colorOf(palette, "accentForMode").hex },
        { name: "transparent", type: "color", value: "transparent" },
        { name: "logoSource", type: "url", value: SPLASH_LOGO_FILE },
        { name: "logoSize", type: "real", value: splash.logoSize },
        { name: "ringSize", type: "real", value: splash.ringSize },
        { name: "ringStroke", type: "real", value: splash.ringStroke },
        { name: "ringGap", type: "real", value: splash.ringGap },
        { name: "ringSweep", type: "real", value: SPLASH_RING_SWEEP },
        { name: "fullTurn", type: "real", value: DEGREES_PER_TURN },
        { name: "spinMilliseconds", type: "int", value: splash.spinMilliseconds },
        { name: "fadeMilliseconds", type: "int", value: splash.fadeMilliseconds },
        { name: "introStage", type: "int", value: SPLASH_INTRO_STAGE },
    ]);
}

/**
 * @param {string} variant
 * @param {SettingsValues} values
 * @param {GlyphSource} glyphs
 * @param {string} splashQml
 * @returns {OutputFile[]}
 */
export function renderLookAndFeel(variant, values, glyphs, splashQml) {
    const name = /** @type {VariantName} */ (variant);
    const metadata = {
        KPackageStructure: "Plasma/LookAndFeel",
        KPlugin: kPlugin({ id: LOOK_AND_FEEL_IDS[name], name: PACKAGE_TEXT.lookAndFeelName[name], description: PACKAGE_TEXT.lookAndFeelDescription[name] }),
        "X-Plasma-APIVersion": LOOK_AND_FEEL_API_VERSION,
        "X-Plasma-MainScript": "defaults",
    };
    return [
        textFile("metadata.json", renderJson(metadata)),
        textFile("contents/defaults", renderDefaults(name, values)),
        textFile("contents/layouts/org.kde.plasma.desktop-layout.js", renderLayoutScript(values)),
        textFile("contents/splash/Splash.qml", splashQml),
        textFile("contents/splash/Tokens.qml", renderSplashTokens(name, values)),
        textFile(`contents/splash/${SPLASH_LOGO_FILE}`, startHereSvg(values, glyphs)),
    ];
}
