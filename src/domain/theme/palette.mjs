import { Variant } from "../catalog/enums.mjs";
import { flatten, mixHex, parseColor } from "./color.mjs";
import { BLACK_HEX, WHITE_HEX } from "../catalog/units.mjs";




/** @typedef {import("../catalog/tokens.mjs").ColorToken} ColorToken */
/** @typedef {Readonly<Record<string, ColorToken>>} Palette */
/** @typedef {import("../settings/document.mjs").SettingsValues} SettingsValues */

/**
 * @param {Readonly<Record<string, string>>} group
 * @returns {Record<string, ColorToken>}
 */
export function parseColorGroup(group) {
    /** @type {Record<string, ColorToken>} */
    const tokens = {};
    Object.keys(group).forEach((key) => {
        tokens[key] = parseColor(group[key] ?? BLACK_HEX);
    });
    return tokens;
}

/**
 * @param {Palette} palette
 * @param {string} key
 * @returns {ColorToken}
 */
export function colorOf(palette, key) {
    const token = palette[key];
    if (!token) {
        throw new Error(`Unknown palette color ${key}`);
    }
    return token;
}

/**
 * @param {string} variant
 * @param {SettingsValues} values
 * @returns {Palette}
 */
export function buildPalette(variant, values) {
    const isDark = variant === Variant.Dark;
    const base = parseColorGroup(isDark ? values.colors.dark : values.colors.light);
    const accent = parseColor(values.accent.color);
    const accentForMode = isDark
        ? mixHex(accent.hex, WHITE_HEX, values.accentShades.darkModeMixWithWhite)
        : mixHex(accent.hex, BLACK_HEX, values.accentShades.lightModeMixWithBlack);
    const background = colorOf(base, "window");
    /** @type {Record<string, ColorToken>} */
    const palette = Object.assign({}, base);
    palette.accent = { hex: accent.hex, alpha: 1 };
    palette.accentForMode = { hex: accentForMode, alpha: 1 };
    palette.textOnAccent = { hex: isDark ? BLACK_HEX : WHITE_HEX, alpha: 1 };
    palette.selectionHover = flatten({ hex: accentForMode, alpha: values.accentShades.selectionHoverAlpha }, background);
    return Object.freeze(palette);
}
