import { VARIANTS } from "../catalog/enums.mjs";
import { AURORAE_IDS, COLOR_SCHEME_IDS, ICON_THEME_IDS, DESKTOP_THEME_IDS, KONSOLE_SCHEME_IDS, PackageRoot } from "../catalog/packages.mjs";
import { PACKAGE_TEXT } from "../catalog/packageText.mjs";
import { renderDesktopTheme } from "./desktopTheme.mjs";
import { renderAurorae } from "./aurorae.mjs";
import { renderIconTheme } from "./iconTheme.mjs";
import { renderColorScheme } from "./colorScheme.mjs";
import { renderKonsoleScheme } from "./konsole.mjs";
import { textFile, underDirectory } from "./files.mjs";

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
            ...underDirectory(`${PackageRoot.Aurorae}/${AURORAE_IDS[name]}`, renderAurorae(variant, values, glyphs, { id: AURORAE_IDS[name], name: PACKAGE_TEXT.auroraeName[name] })),
            ...underDirectory(`${PackageRoot.Icons}/${ICON_THEME_IDS[name]}`, renderIconTheme(variant, values, glyphs)),
            textFile(`${PackageRoot.ColorSchemes}/${COLOR_SCHEME_IDS[name]}.colors`, renderColorScheme(variant, values, { id: COLOR_SCHEME_IDS[name], name: PACKAGE_TEXT.colorSchemeName[name] })),
            textFile(`${PackageRoot.Konsole}/${KONSOLE_SCHEME_IDS[name]}.colorscheme`, renderKonsoleScheme(name === "dark" ? values.colors.terminalDark : values.colors.terminalLight, PACKAGE_TEXT.konsoleName[name])),
        ];
    });
}
