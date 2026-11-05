import { VARIANTS } from "../catalog/enums.mjs";
import { DESKTOP_THEME_IDS, PackageRoot } from "../catalog/packages.mjs";
import { renderDesktopTheme } from "./desktopTheme.mjs";
import { underDirectory } from "./files.mjs";

/** @typedef {import("./files.mjs").OutputFile} OutputFile */
/** @typedef {import("../settings/document.mjs").SettingsValues} SettingsValues */
/** @typedef {import("../font/glyphs.mjs").GlyphSource} GlyphSource */
/** @typedef {"light" | "dark"} VariantName */

/**
 * @param {SettingsValues} values
 * @param {GlyphSource} glyphs
 * @returns {OutputFile[]}
 */
export function assemblePackages(values, glyphs) {
    return VARIANTS.flatMap((variant) => {
        const name = /** @type {VariantName} */ (variant);
        return [
            ...underDirectory(`${PackageRoot.DesktopTheme}/${DESKTOP_THEME_IDS[name]}`, renderDesktopTheme(variant, values)),
        ];
    }).concat(glyphs.has("folder_24", "regular") ? [] : []);
}
