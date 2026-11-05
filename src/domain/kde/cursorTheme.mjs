import { CURSOR_DESIGNS, CursorAnimation } from "../catalog/cursors.mjs";
import { Variant } from "../catalog/enums.mjs";
import { FALLBACK_CURSOR_THEME } from "../catalog/packages.mjs";
import { PACKAGE_TEXT } from "../catalog/packageText.mjs";
import { parseColor } from "../theme/color.mjs";
import { parseColorGroup } from "../theme/palette.mjs";
import { rasterizeCursor } from "../raster/cursor.mjs";
import { encodeXcursor } from "../raster/xcursor.mjs";
import { renderIni } from "./ini.mjs";
import { linkFile, textFile } from "./files.mjs";

/** @typedef {import("./files.mjs").OutputFile} OutputFile */
/** @typedef {import("../settings/document.mjs").SettingsValues} SettingsValues */
/** @typedef {import("../catalog/cursors.mjs").CursorDesign} CursorDesign */
/** @typedef {import("../raster/cursor.mjs").CursorImage} CursorImage */

/**
 * @param {string} variant
 * @param {SettingsValues} values
 * @returns {import("../raster/cursor.mjs").CursorColors}
 */
export function cursorColors(variant, values) {
    const group = parseColorGroup(variant === Variant.Dark ? values.colors.cursorsDark : values.colors.cursorsLight);
    const fallback = parseColor(values.accent.color);
    return {
        fill: group.fill ?? fallback,
        ink: group.ink ?? fallback,
        outline: group.outline ?? fallback,
        shadow: group.shadow ?? fallback,
        accent: { hex: fallback.hex, alpha: 1 },
    };
}

/**
 * @param {CursorDesign} design
 * @param {string} variant
 * @param {SettingsValues} values
 * @returns {CursorImage[]}
 */
export function cursorImages(design, variant, values) {
    const colors = cursorColors(variant, values);
    const metrics = values.metrics.cursor;
    const animated = design.animation === CursorAnimation.Spin;
    const frameCount = animated ? metrics.waitFrames : 1;
    const delay = animated ? metrics.waitFrameMilliseconds : 0;
    const sizes = /** @type {number[]} */ (values.cursors.sizes.slice()).sort((first, second) => first - second);
    return sizes.flatMap((size) => Array.from({ length: frameCount }, (_unused, frame) => rasterizeCursor(design, size, colors, metrics, { frame, frameCount, delay })));
}

/**
 * @param {string} variant
 * @param {SettingsValues} values
 * @returns {OutputFile[]}
 */
export function renderCursorTheme(variant, values) {
    const name = /** @type {"light" | "dark"} */ (variant);
    const index = renderIni([{
        path: ["Icon Theme"],
        entries: [
            ["Name", PACKAGE_TEXT.cursorThemeName[name]],
            ["Comment", PACKAGE_TEXT.cursorThemeComment],
            ["Inherits", FALLBACK_CURSOR_THEME],
        ],
    }]);
    return [
        textFile("index.theme", index),
        textFile("cursor.theme", index),
        ...CURSOR_DESIGNS.flatMap((design) => [
            textFile(`cursors/${design.name}`, encodeXcursor(cursorImages(design, variant, values))),
            ...design.aliases.map((alias) => linkFile(`cursors/${alias}`, design.name)),
        ]),
    ];
}
