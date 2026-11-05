import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseFont } from "../domain/font/truetype.mjs";
import { createGlyphSource } from "../domain/font/glyphs.mjs";

export const FONT_FILES = Object.freeze({
    regular: "assets/fonts/FluentSystemIcons-Regular.ttf",
    regularMap: "assets/fonts/FluentSystemIcons-Regular.json",
    filled: "assets/fonts/FluentSystemIcons-Filled.ttf",
    filledMap: "assets/fonts/FluentSystemIcons-Filled.json",
});

/**
 * @param {string} root
 * @returns {import("../domain/font/glyphs.mjs").GlyphSource}
 */
export function loadGlyphSource(root) {
    /**
     * @param {string} fontPath
     * @param {string} mapPath
     */
    const face = (fontPath, mapPath) => ({
        font: parseFont(new Uint8Array(readFileSync(join(root, fontPath)))),
        map: /** @type {Record<string, number>} */ (JSON.parse(readFileSync(join(root, mapPath), "utf8"))),
    });
    return createGlyphSource(face(FONT_FILES.regular, FONT_FILES.regularMap), face(FONT_FILES.filled, FONT_FILES.filledMap));
}
