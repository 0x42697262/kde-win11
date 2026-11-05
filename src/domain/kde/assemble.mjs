/** @typedef {import("./files.mjs").OutputFile} OutputFile */
/** @typedef {import("../settings/document.mjs").SettingsValues} SettingsValues */
/** @typedef {import("../font/glyphs.mjs").GlyphSource} GlyphSource */

/**
 * @param {SettingsValues} values
 * @param {GlyphSource} glyphs
 * @returns {OutputFile[]}
 */
export function assemblePackages(values, glyphs) {
    return [values, glyphs].length === 0 ? [] : [];
}
