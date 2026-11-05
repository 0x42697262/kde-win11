import { SettingType, defineSetting } from "./definitions.mjs";
import { toQtColor } from "../theme/color.mjs";
import { ACCENT_SHADES, BLUR, CURSOR, CURSOR_COLORS, DARK_BASE, FLYOUT, ICON_COLORS, LIGHT_BASE, LIST_ITEM, LOGIN, PANEL, SPLASH, TERMINAL_COLORS, TITLEBAR, TOOLTIP, WALLPAPER_COLORS, WIDGET } from "../catalog/tokens.mjs";
import { TEXT } from "../catalog/strings.mjs";

/** @typedef {import("./definitions.mjs").SettingDefinition} SettingDefinition */
/** @typedef {import("../catalog/tokens.mjs").ColorToken} ColorToken */
/** @typedef {import("../catalog/tokens.mjs").MetricToken} MetricToken */

/**
 * @param {string} prefix
 * @param {string} section
 * @param {Readonly<Record<string, ColorToken>>} tokens
 * @returns {SettingDefinition[]}
 */
function colorDefinitions(prefix, section, tokens) {
    return Object.keys(tokens).map((name) => defineSetting({
        key: `${prefix}.${name}`,
        section,
        type: SettingType.Color,
        defaultValue: toQtColor(/** @type {ColorToken} */ (tokens[name])),
        description: `Color \`${name}\` as #RRGGBB or #AARRGGBB`,
    }));
}

/**
 * @param {string} prefix
 * @param {string} section
 * @param {Readonly<Record<string, MetricToken>>} tokens
 * @returns {SettingDefinition[]}
 */
function metricDefinitions(prefix, section, tokens) {
    return Object.keys(tokens).map((name) => {
        const token = /** @type {MetricToken} */ (tokens[name]);
        return defineSetting({
            key: `${prefix}.${name}`,
            section,
            type: SettingType.Number,
            defaultValue: token.value,
            minimum: token.minimum,
            maximum: token.maximum,
            description: `Metric \`${name}\``,
        });
    });
}

/**
 * @param {string} prefix
 * @param {string} section
 * @param {Readonly<Record<string, string>>} texts
 * @returns {SettingDefinition[]}
 */
function textDefinitions(prefix, section, texts) {
    return Object.keys(texts).map((name) => defineSetting({
        key: `${prefix}.${name}`,
        section,
        type: SettingType.String,
        defaultValue: texts[name] ?? "",
        description: `Text \`${name}\``,
    }));
}

export const VALUE_DEFINITIONS = Object.freeze([
    ...colorDefinitions("colors.light", "Colors (light)", LIGHT_BASE),
    ...colorDefinitions("colors.dark", "Colors (dark)", DARK_BASE),
    ...colorDefinitions("colors.icons", "Colors (icons)", ICON_COLORS),
    ...colorDefinitions("colors.cursorsLight", "Colors (cursors)", CURSOR_COLORS.light),
    ...colorDefinitions("colors.cursorsDark", "Colors (cursors)", CURSOR_COLORS.dark),
    ...colorDefinitions("colors.terminalLight", "Colors (terminal)", TERMINAL_COLORS.light),
    ...colorDefinitions("colors.terminalDark", "Colors (terminal)", TERMINAL_COLORS.dark),
    ...colorDefinitions("colors.wallpaperLight", "Colors (wallpaper)", WALLPAPER_COLORS.light),
    ...colorDefinitions("colors.wallpaperDark", "Colors (wallpaper)", WALLPAPER_COLORS.dark),
    ...metricDefinitions("accentShades", "Accent", ACCENT_SHADES),
    ...metricDefinitions("metrics.panel", "Metrics", PANEL),
    ...metricDefinitions("metrics.blur", "Metrics", BLUR),
    ...metricDefinitions("metrics.flyout", "Metrics", FLYOUT),
    ...metricDefinitions("metrics.widget", "Metrics", WIDGET),
    ...metricDefinitions("metrics.tooltip", "Metrics", TOOLTIP),
    ...metricDefinitions("metrics.listItem", "Metrics", LIST_ITEM),
    ...metricDefinitions("metrics.titlebar", "Metrics", TITLEBAR),
    ...metricDefinitions("metrics.splash", "Metrics", SPLASH),
    ...metricDefinitions("metrics.login", "Metrics", LOGIN),
    ...metricDefinitions("metrics.cursor", "Metrics", CURSOR),
    ...textDefinitions("text.login", "Text", TEXT.login),
]);
