import { VARIANTS } from "../catalog/enums.mjs";
import { AURORAE_IDS, COLOR_SCHEME_IDS, CURSOR_THEME_IDS, ICON_THEME_IDS, LOOK_AND_FEEL_IDS, WALLPAPER_ID, DESKTOP_THEME_IDS, KONSOLE_SCHEME_IDS, PackageRoot } from "../catalog/packages.mjs";
import { PACKAGE_TEXT } from "../catalog/packageText.mjs";
import { renderDesktopTheme } from "./desktopTheme.mjs";
import { renderAurorae } from "./aurorae.mjs";
import { renderIconTheme } from "./iconTheme.mjs";
import { renderCursorTheme } from "./cursorTheme.mjs";
import { renderWallpaperPackage } from "./wallpaper.mjs";
import { renderLookAndFeel } from "./lookAndFeel.mjs";
import { renderColorScheme } from "./colorScheme.mjs";
import { renderKonsoleScheme } from "./konsole.mjs";
import { textFile, underDirectory } from "./files.mjs";

/** @typedef {import("./files.mjs").OutputFile} OutputFile */
/** @typedef {import("../settings/document.mjs").SettingsValues} SettingsValues */
/** @typedef {import("../font/glyphs.mjs").GlyphSource} GlyphSource */
/** @typedef {"light" | "dark"} VariantName */
/** @typedef {{ splashQml: string, loginQml: string }} StaticSources */

/**
 * @param {SettingsValues} values
 * @param {GlyphSource} glyphs
 * @param {StaticSources} sources
 * @returns {OutputFile[]}
 */
export function assemblePackages(values, glyphs, sources) {
    return VARIANTS.flatMap((variant) => {
        const name = /** @type {VariantName} */ (variant);
        return [
            ...underDirectory(`${PackageRoot.LookAndFeel}/${LOOK_AND_FEEL_IDS[name]}`, renderLookAndFeel(variant, values, glyphs, sources.splashQml)),
            ...underDirectory(`${PackageRoot.DesktopTheme}/${DESKTOP_THEME_IDS[name]}`, renderDesktopTheme(variant, values)),
            ...underDirectory(`${PackageRoot.Aurorae}/${AURORAE_IDS[name]}`, renderAurorae(variant, values, glyphs, { id: AURORAE_IDS[name], name: PACKAGE_TEXT.auroraeName[name] })),
            ...underDirectory(`${PackageRoot.Icons}/${ICON_THEME_IDS[name]}`, renderIconTheme(variant, values, glyphs)),
            ...underDirectory(`${PackageRoot.Icons}/${CURSOR_THEME_IDS[name]}`, renderCursorTheme(variant, values)),
            textFile(`${PackageRoot.ColorSchemes}/${COLOR_SCHEME_IDS[name]}.colors`, renderColorScheme(variant, values, { id: COLOR_SCHEME_IDS[name], name: PACKAGE_TEXT.colorSchemeName[name] })),
            textFile(`${PackageRoot.Konsole}/${KONSOLE_SCHEME_IDS[name]}.colorscheme`, renderKonsoleScheme(name === "dark" ? values.colors.terminalDark : values.colors.terminalLight, PACKAGE_TEXT.konsoleName[name])),
        ];
    }).concat(underDirectory(`${PackageRoot.Wallpapers}/${WALLPAPER_ID}`, renderWallpaperPackage(values)));
}
