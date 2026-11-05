import { IconStyle } from "../catalog/enums.mjs";
import { contoursToPath } from "./truetype.mjs";

const FLUENT_PREFIX = "ic_fluent_";

/** @typedef {import("./truetype.mjs").Font} Font */
/** @typedef {Readonly<Record<string, number>>} GlyphMap */
/** @typedef {{ font: Font, map: GlyphMap }} GlyphFace */
/** @typedef {{ x: number, y: number, size: number }} GlyphBox */
/** @typedef {{ has: (name: string, style: string) => boolean, path: (name: string, style: string, box: GlyphBox) => string }} GlyphSource */

/**
 * @param {string} name
 * @param {string} style
 * @returns {string}
 */
export function fluentKey(name, style) {
    return `${FLUENT_PREFIX}${name}_${style}`;
}

/**
 * @param {GlyphFace} regular
 * @param {GlyphFace} filled
 * @returns {GlyphSource}
 */
export function createGlyphSource(regular, filled) {
    /**
     * @param {string} style
     * @returns {GlyphFace}
     */
    const face = (style) => style === IconStyle.Filled ? filled : regular;
    return {
        has: (name, style) => face(style).map[fluentKey(name, style)] !== undefined,
        path: (name, style, box) => {
            const selected = face(style);
            const codePoint = selected.map[fluentKey(name, style)];
            if (codePoint === undefined) {
                throw new Error(`Unknown Fluent glyph ${name} (${style})`);
            }
            const contours = selected.font.contours(selected.font.glyphIndex(codePoint));
            return contoursToPath(contours, selected.font, { scale: box.size / selected.font.unitsPerEm, offsetX: box.x, offsetY: box.y });
        },
    };
}
