import { IconStyle, Variant } from "../catalog/enums.mjs";
import { FLUENT_SIZES, IconContext, MAXIMUM_CENTERING_GAP, SYMBOLIC_ICONS, SYMBOLIC_SCALABLE_MAXIMUM, SYMBOLIC_SIZES, SymbolTone } from "../catalog/icons.mjs";
import { FALLBACK_ICON_THEMES, ICON_THEME_IDS } from "../catalog/packages.mjs";
import { PACKAGE_TEXT } from "../catalog/packageText.mjs";
import { buildPalette, colorOf } from "../theme/palette.mjs";
import { colorSchemeStyle, element, svgDocument } from "../svg/document.mjs";
import { renderIni } from "./ini.mjs";
import { linkFile, textFile } from "./files.mjs";

/** @typedef {import("./files.mjs").OutputFile} OutputFile */
/** @typedef {import("../settings/document.mjs").SettingsValues} SettingsValues */
/** @typedef {import("../font/glyphs.mjs").GlyphSource} GlyphSource */
/** @typedef {import("../catalog/icons.mjs").SymbolicIcon} SymbolicIcon */
/** @typedef {"light" | "dark"} VariantName */
/** @typedef {{ path: string, size: number, context: string, scalable: boolean, minimum?: number, maximum?: number }} IconDirectory */

const CONTEXT_LABELS = Object.freeze({
    [IconContext.Actions]: "Actions",
    [IconContext.Status]: "Status",
    [IconContext.Devices]: "Devices",
    [IconContext.Places]: "Places",
    [IconContext.Categories]: "Categories",
    [IconContext.Emblems]: "Emblems",
    [IconContext.Apps]: "Applications",
    [IconContext.MimeTypes]: "MimeTypes",
});

const DEFAULT_SIZES = Object.freeze({ desktop: 48, toolbar: 22, mainToolbar: 22, small: 16, panel: 48, dialog: 32 });

/**
 * @param {GlyphSource} glyphs
 * @param {SymbolicIcon} icon
 * @param {number} target
 * @returns {string}
 */
export function symbolicPath(glyphs, icon, target) {
    const style = icon.style ?? IconStyle.Regular;
    const available = FLUENT_SIZES.filter((size) => glyphs.has(`${icon.glyph}_${size}`, style));
    const exact = available.find((size) => size === target);
    const smaller = available.filter((size) => size < target && target - size <= MAXIMUM_CENTERING_GAP).pop();
    const chosen = exact ?? smaller;
    if (chosen !== undefined) {
        const offset = (target - chosen) / 2;
        return glyphs.path(`${icon.glyph}_${chosen}`, style, { x: offset, y: offset, size: chosen });
    }
    const nearest = available.reduce((best, size) => Math.abs(size - target) < Math.abs(best - target) ? size : best, available[0] ?? target);
    return glyphs.path(`${icon.glyph}_${nearest}`, style, { x: 0, y: 0, size: target });
}

/**
 * @param {string} variant
 * @param {SettingsValues} values
 * @returns {string}
 */
function symbolicStyle(variant, values) {
    const palette = buildPalette(variant, values);
    return colorSchemeStyle({
        [SymbolTone.Text]: colorOf(palette, "textPrimary"),
        [SymbolTone.Highlight]: colorOf(palette, "accentForMode"),
        [SymbolTone.Negative]: colorOf(palette, "negative"),
        [SymbolTone.Neutral]: colorOf(palette, "neutral"),
        [SymbolTone.Positive]: colorOf(palette, "positive"),
    });
}

/**
 * @param {string} directory
 * @param {readonly string[]} names
 * @param {string} svg
 * @returns {OutputFile[]}
 */
function namedFiles(directory, names, svg) {
    const [first, ...aliases] = names;
    if (first === undefined) {
        return [];
    }
    return [textFile(`${directory}/${first}.svg`, svg), ...aliases.map((alias) => linkFile(`${directory}/${alias}.svg`, `${first}.svg`))];
}

/**
 * @param {readonly IconDirectory[]} directories
 * @param {VariantName} variant
 * @returns {string}
 */
function renderIndex(directories, variant) {
    const inherits = variant === Variant.Dark ? [ICON_THEME_IDS.light, ...FALLBACK_ICON_THEMES.dark] : FALLBACK_ICON_THEMES.light;
    return renderIni([
        {
            path: ["Icon Theme"],
            entries: [
                ["Name", PACKAGE_TEXT.iconThemeName[variant]],
                ["Comment", PACKAGE_TEXT.iconThemeComment],
                ["Inherits", inherits],
                ["Example", "folder"],
                ["FollowsColorScheme", true],
                ["DesktopDefault", DEFAULT_SIZES.desktop],
                ["ToolbarDefault", DEFAULT_SIZES.toolbar],
                ["MainToolbarDefault", DEFAULT_SIZES.mainToolbar],
                ["SmallDefault", DEFAULT_SIZES.small],
                ["PanelDefault", DEFAULT_SIZES.panel],
                ["DialogDefault", DEFAULT_SIZES.dialog],
                ["Directories", directories.map((directory) => directory.path)],
            ],
        },
        ...directories.map((directory) => ({
            path: [directory.path],
            entries: directory.scalable
                ? [["Size", directory.size], ["MinSize", directory.minimum ?? directory.size], ["MaxSize", directory.maximum ?? directory.size], ["Context", CONTEXT_LABELS[/** @type {keyof typeof CONTEXT_LABELS} */ (directory.context)] ?? ""], ["Type", "Scalable"]]
                : [["Size", directory.size], ["Context", CONTEXT_LABELS[/** @type {keyof typeof CONTEXT_LABELS} */ (directory.context)] ?? ""], ["Type", "Fixed"]],
        })),
    ]);
}

/**
 * @returns {IconDirectory[]}
 */
function iconDirectories() {
    const symbolicContexts = [...new Set(SYMBOLIC_ICONS.map((icon) => icon.context))];
    return [
        ...symbolicContexts.flatMap((context) => SYMBOLIC_SIZES.map((size, index) => {
            const largest = index === SYMBOLIC_SIZES.length - 1;
            return largest
                ? { path: `${context}/${size}`, size, context, scalable: true, minimum: size, maximum: SYMBOLIC_SCALABLE_MAXIMUM }
                : { path: `${context}/${size}`, size, context, scalable: false };
        })),
    ];
}

/**
 * @param {string} variant
 * @param {SettingsValues} values
 * @param {GlyphSource} glyphs
 * @returns {OutputFile[]}
 */
export function renderIconTheme(variant, values, glyphs) {
    const name = /** @type {VariantName} */ (variant);
    const style = symbolicStyle(variant, values);
    const directories = iconDirectories();
    /** @type {OutputFile[]} */
    const files = [textFile("index.theme", renderIndex(directories, name))];
    SYMBOLIC_ICONS.forEach((icon) => {
        SYMBOLIC_SIZES.forEach((size) => {
            const body = element("path", { d: symbolicPath(glyphs, icon, size), class: icon.tone ?? SymbolTone.Text, fill: "currentColor" });
            files.push(...namedFiles(`${icon.context}/${size}`, icon.names, svgDocument(size, size, body, style)));
        });
    });
    return files;
}
