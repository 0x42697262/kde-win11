import { COLOR_EFFECTS, KDE_CONTRAST } from "../catalog/kdeFormats.mjs";
import { flatten, toRgbTriplet } from "../theme/color.mjs";
import { buildPalette, colorOf } from "../theme/palette.mjs";
import { renderIni } from "./ini.mjs";

/** @typedef {import("../settings/document.mjs").SettingsValues} SettingsValues */
/** @typedef {import("../theme/palette.mjs").Palette} Palette */
/** @typedef {import("./ini.mjs").IniGroup} IniGroup */
/** @typedef {{ background: string, alternate: string, foreground?: string, inactive?: string }} ColorRole */

/**
 * @param {Palette} palette
 * @param {ColorRole} role
 * @returns {[string, string][]}
 */
function colorGroupEntries(palette, role) {
    const window = colorOf(palette, "window");
    /**
     * @param {string} key
     * @returns {string}
     */
    const rgb = (key) => toRgbTriplet(flatten(colorOf(palette, key), window));
    return [
        ["BackgroundAlternate", rgb(role.alternate)],
        ["BackgroundNormal", rgb(role.background)],
        ["DecorationFocus", rgb("accentForMode")],
        ["DecorationHover", rgb("accentForMode")],
        ["ForegroundActive", rgb("accentForMode")],
        ["ForegroundInactive", rgb(role.inactive ?? "textSecondary")],
        ["ForegroundLink", rgb("link")],
        ["ForegroundNegative", rgb("negative")],
        ["ForegroundNeutral", rgb("neutral")],
        ["ForegroundNormal", rgb(role.foreground ?? "textPrimary")],
        ["ForegroundPositive", rgb("positive")],
        ["ForegroundVisited", rgb("visited")],
    ];
}

/**
 * @param {string} variant
 * @param {SettingsValues} values
 * @param {{ id: string, name: string }} identity
 * @returns {string}
 */
export function renderColorScheme(variant, values, identity) {
    const palette = buildPalette(variant, values);
    const window = colorOf(palette, "window");
    /**
     * @param {string} key
     * @returns {string}
     */
    const rgb = (key) => toRgbTriplet(flatten(colorOf(palette, key), window));
    /** @type {IniGroup[]} */
    const groups = [
        { path: ["ColorEffects:Disabled"], entries: COLOR_EFFECTS.disabled },
        { path: ["ColorEffects:Inactive"], entries: COLOR_EFFECTS.inactive },
        { path: ["Colors:Button"], entries: colorGroupEntries(palette, { background: "button", alternate: "window" }) },
        { path: ["Colors:Complementary"], entries: colorGroupEntries(palette, { background: "complementary", alternate: "complementary", foreground: "complementaryText", inactive: "complementaryText" }) },
        { path: ["Colors:Header"], entries: colorGroupEntries(palette, { background: "header", alternate: "window" }) },
        { path: ["Colors:Header", "Inactive"], entries: colorGroupEntries(palette, { background: "headerInactive", alternate: "window", foreground: "textSecondary" }) },
        { path: ["Colors:Selection"], entries: colorGroupEntries(palette, { background: "accentForMode", alternate: "selectionHover", foreground: "textOnAccent", inactive: "textOnAccent" }) },
        { path: ["Colors:Tooltip"], entries: colorGroupEntries(palette, { background: "tooltip", alternate: "window" }) },
        { path: ["Colors:View"], entries: colorGroupEntries(palette, { background: "view", alternate: "viewAlternate" }) },
        { path: ["Colors:Window"], entries: colorGroupEntries(palette, { background: "window", alternate: "viewAlternate" }) },
        { path: ["General"], entries: [["ColorScheme", identity.id], ["Name", identity.name], ["shadeSortColumn", true]] },
        { path: ["KDE"], entries: [["contrast", KDE_CONTRAST]] },
        {
            path: ["WM"],
            entries: [
                ["activeBackground", rgb("titlebar")],
                ["activeBlend", rgb("titlebar")],
                ["activeForeground", rgb("titleText")],
                ["inactiveBackground", rgb("titlebarInactive")],
                ["inactiveBlend", rgb("titlebarInactive")],
                ["inactiveForeground", rgb("titleTextInactive")],
            ],
        },
    ];
    return renderIni(groups);
}
