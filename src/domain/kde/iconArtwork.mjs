import { APP_TILES, ARTWORK_GRID, DRIVES, DRIVE_GLYPH_BOX, DRIVE_SHAPES, FILE_MANAGER_NAMES, FOLDER_GLYPH_BOX, FOLDER_SHAPES, GLYPH_FOLDERS, MIME_TYPES, PAGE_GLYPH_BOX, PAGE_SHAPES, PAGE_STROKE_WIDTH, START_HERE_BOX, START_HERE_GLYPH, START_HERE_LIGHTEN, START_HERE_NAMES, TILE_GLYPH_BOX, TILE_SHAPES, TRASH, TRASH_SHAPES, TRASH_STROKE_WIDTH } from "../catalog/artwork.mjs";
import { IconStyle } from "../catalog/enums.mjs";
import { FLUENT_SIZES } from "../catalog/icons.mjs";
import { WHITE_HEX } from "../catalog/units.mjs";
import { formatAlpha, mixHex, parseColor } from "../theme/color.mjs";
import { parseColorGroup } from "../theme/palette.mjs";
import { element, svgDocument } from "../svg/document.mjs";

/** @typedef {import("../font/glyphs.mjs").GlyphSource} GlyphSource */
/** @typedef {import("../font/glyphs.mjs").GlyphBox} GlyphBox */
/** @typedef {import("../catalog/tokens.mjs").ColorToken} ColorToken */
/** @typedef {import("../settings/document.mjs").SettingsValues} SettingsValues */
/** @typedef {{ names: readonly string[], svg: string }} Artwork */

/**
 * @param {GlyphSource} glyphs
 * @param {string} base
 * @param {string} style
 * @param {number} target
 * @returns {number}
 */
export function bestGlyphSize(glyphs, base, style, target) {
    const available = FLUENT_SIZES.filter((size) => glyphs.has(`${base}_${size}`, style));
    if (available.length === 0) {
        throw new Error(`No Fluent glyph sizes for ${base} (${style})`);
    }
    return available.find((size) => size >= target) ?? available[available.length - 1] ?? target;
}

/**
 * @param {GlyphSource} glyphs
 * @param {string} base
 * @param {string} style
 * @param {GlyphBox} box
 * @returns {string}
 */
export function glyphInBox(glyphs, base, style, box) {
    const size = bestGlyphSize(glyphs, base, style, box.size);
    return glyphs.path(`${base}_${size}`, style, box);
}

/**
 * @param {ColorToken} color
 * @returns {Record<string, string | undefined>}
 */
function fillOf(color) {
    return { fill: color.hex, "fill-opacity": color.alpha < 1 ? formatAlpha(color.alpha) : undefined };
}

/**
 * @param {string} id
 * @param {string} top
 * @param {string} bottom
 * @returns {string}
 */
function verticalGradient(id, top, bottom) {
    return element("linearGradient", { id, x1: 0, y1: 0, x2: 0, y2: 1 }, element("stop", { offset: 0, "stop-color": top }) + element("stop", { offset: 1, "stop-color": bottom }));
}

/**
 * @param {Record<string, ColorToken>} colors
 * @param {GlyphSource} glyphs
 * @param {{ glyph?: string, open?: boolean }} folder
 * @returns {string}
 */
function folderSvg(colors, glyphs, folder) {
    const front = /** @type {ColorToken} */ (colors.folderFront);
    const shade = /** @type {ColorToken} */ (colors.folderFrontShade);
    const parts = [
        element("path", Object.assign({ d: FOLDER_SHAPES.back }, fillOf(/** @type {ColorToken} */ (colors.folderBack)))),
        element("path", Object.assign({ d: FOLDER_SHAPES.paper }, fillOf(/** @type {ColorToken} */ (colors.pageBackground)))),
        element("path", { d: folder.open ? FOLDER_SHAPES.frontOpen : FOLDER_SHAPES.front, fill: "url(#front)" }),
    ];
    if (!folder.open) {
        parts.push(element("path", Object.assign({ d: FOLDER_SHAPES.highlight }, fillOf(/** @type {ColorToken} */ (colors.tileHighlight)))));
    }
    if (folder.glyph) {
        parts.push(element("path", Object.assign({ d: glyphInBox(glyphs, folder.glyph, IconStyle.Filled, FOLDER_GLYPH_BOX) }, fillOf(/** @type {ColorToken} */ (colors.folderGlyph)))));
    }
    return svgDocument(ARTWORK_GRID, ARTWORK_GRID, parts.join(""), verticalGradient("front", front.hex, shade.hex));
}

/**
 * @param {Record<string, ColorToken>} colors
 * @param {GlyphSource} glyphs
 * @param {{ glyph: string, color: string }} mime
 * @returns {string}
 */
function pageSvg(colors, glyphs, mime) {
    const parts = [
        element("path", Object.assign({ d: PAGE_SHAPES.page, stroke: colors.pageStroke?.hex, "stroke-width": PAGE_STROKE_WIDTH }, fillOf(/** @type {ColorToken} */ (colors.pageBackground)))),
        element("path", Object.assign({ d: PAGE_SHAPES.fold, stroke: colors.pageStroke?.hex, "stroke-width": PAGE_STROKE_WIDTH, "stroke-linejoin": "round" }, fillOf(/** @type {ColorToken} */ (colors.pageFold)))),
        element("path", { d: glyphInBox(glyphs, mime.glyph, IconStyle.Filled, PAGE_GLYPH_BOX), fill: mime.color }),
    ];
    return svgDocument(ARTWORK_GRID, ARTWORK_GRID, parts.join(""));
}

/**
 * @param {Record<string, ColorToken>} colors
 * @param {GlyphSource} glyphs
 * @param {{ glyph: string, colors: readonly string[] }} tile
 * @returns {string}
 */
function tileSvg(colors, glyphs, tile) {
    const highlight = /** @type {ColorToken} */ (colors.tileHighlight);
    const shine = element("linearGradient", { id: "shine", x1: 0, y1: 0, x2: 0, y2: 1 },
        element("stop", { offset: 0, "stop-color": highlight.hex, "stop-opacity": formatAlpha(highlight.alpha) }) + element("stop", { offset: 1, "stop-color": highlight.hex, "stop-opacity": 0 }));
    const parts = [
        element("path", { d: TILE_SHAPES.tile, fill: "url(#tile)" }),
        element("path", { d: TILE_SHAPES.shine, fill: "url(#shine)" }),
        element("path", Object.assign({ d: glyphInBox(glyphs, tile.glyph, IconStyle.Filled, TILE_GLYPH_BOX) }, fillOf(/** @type {ColorToken} */ (colors.tileGlyph)))),
    ];
    return svgDocument(ARTWORK_GRID, ARTWORK_GRID, parts.join(""), verticalGradient("tile", tile.colors[0] ?? WHITE_HEX, tile.colors[1] ?? WHITE_HEX) + shine);
}

/**
 * @param {Record<string, ColorToken>} colors
 * @param {GlyphSource} glyphs
 * @param {{ glyph?: string, disc?: boolean }} drive
 * @returns {string}
 */
function driveSvg(colors, glyphs, drive) {
    const body = /** @type {ColorToken} */ (colors.driveBody);
    const face = /** @type {ColorToken} */ (colors.driveFace);
    if (drive.disc) {
        return svgDocument(ARTWORK_GRID, ARTWORK_GRID, [
            element("path", { d: DRIVE_SHAPES.disc, fill: "url(#disc)", "fill-rule": "evenodd" }),
            element("path", Object.assign({ d: DRIVE_SHAPES.discRing, "fill-rule": "evenodd" }, fillOf(face))),
        ].join(""), verticalGradient("disc", body.hex, face.hex));
    }
    const parts = [
        element("path", Object.assign({ d: DRIVE_SHAPES.body }, fillOf(body))),
        element("path", Object.assign({ d: DRIVE_SHAPES.face }, fillOf(face))),
        element("path", Object.assign({ d: DRIVE_SHAPES.light }, fillOf(/** @type {ColorToken} */ (colors.driveLight)))),
    ];
    if (drive.glyph) {
        parts.push(element("path", Object.assign({ d: glyphInBox(glyphs, drive.glyph, IconStyle.Filled, DRIVE_GLYPH_BOX) }, fillOf(face))));
    }
    return svgDocument(ARTWORK_GRID, ARTWORK_GRID, parts.join(""));
}

/**
 * @param {Record<string, ColorToken>} colors
 * @param {boolean} full
 * @returns {string}
 */
function trashSvg(colors, full) {
    const body = /** @type {ColorToken} */ (colors.trashBody);
    const stroke = /** @type {ColorToken} */ (colors.trashStroke);
    const outline = { stroke: stroke.hex, "stroke-width": TRASH_STROKE_WIDTH, "stroke-linejoin": "round" };
    const parts = [
        full ? element("path", Object.assign({ d: TRASH_SHAPES.paper }, outline, fillOf(/** @type {ColorToken} */ (colors.pageBackground)))) : "",
        element("path", Object.assign({ d: TRASH_SHAPES.body }, outline, fillOf(body))),
        element("path", Object.assign({ d: TRASH_SHAPES.ribs }, fillOf(stroke))),
        element("path", Object.assign({ d: TRASH_SHAPES.lid }, outline, fillOf(body))),
        element("path", Object.assign({ d: TRASH_SHAPES.handle }, fillOf(stroke))),
    ];
    return svgDocument(ARTWORK_GRID, ARTWORK_GRID, parts.join(""));
}

/**
 * @param {SettingsValues} values
 * @param {GlyphSource} glyphs
 * @returns {string}
 */
function startHereSvg(values, glyphs) {
    const accent = parseColor(values.accent.color).hex;
    const light = mixHex(accent, WHITE_HEX, START_HERE_LIGHTEN);
    return svgDocument(ARTWORK_GRID, ARTWORK_GRID, element("path", { d: glyphInBox(glyphs, START_HERE_GLYPH, IconStyle.Filled, START_HERE_BOX), fill: "url(#accent)" }), verticalGradient("accent", light, accent));
}

/**
 * @param {SettingsValues} values
 * @param {GlyphSource} glyphs
 * @returns {{ places: Artwork[], devices: Artwork[], mimetypes: Artwork[], apps: Artwork[] }}
 */
export function renderArtwork(values, glyphs) {
    const colors = parseColorGroup(values.colors.icons);
    const closedFolder = folderSvg(colors, glyphs, {});
    return {
        places: [
            ...GLYPH_FOLDERS.map((folder) => ({ names: folder.names, svg: folderSvg(colors, glyphs, folder) })),
            ...TRASH.map((trash) => ({ names: trash.names, svg: trashSvg(colors, trash.full) })),
        ],
        devices: DRIVES.map((drive) => ({ names: drive.names, svg: driveSvg(colors, glyphs, drive) })),
        mimetypes: MIME_TYPES.map((mime) => ({ names: mime.names, svg: pageSvg(colors, glyphs, mime) })),
        apps: [
            { names: FILE_MANAGER_NAMES, svg: closedFolder },
            { names: START_HERE_NAMES, svg: startHereSvg(values, glyphs) },
            ...APP_TILES.map((tile) => ({ names: tile.names, svg: tileSvg(colors, glyphs, tile) })),
        ],
    };
}
