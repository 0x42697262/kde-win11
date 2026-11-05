const TABLE_DIRECTORY_OFFSET = 12;
const TABLE_RECORD_SIZE = 16;
const TAG_LENGTH = 4;
const TABLE_COUNT_OFFSET = 4;
const TABLE_OFFSET_FIELD = 8;
const HEAD_UNITS_PER_EM = 18;
const HEAD_INDEX_TO_LOC_FORMAT = 50;
const HHEA_ASCENDER = 4;
const MAXP_GLYPH_COUNT = 4;
const SHORT_LOCA_MULTIPLIER = 2;
const UINT16_SIZE = 2;
const UINT32_SIZE = 4;
const GLYPH_HEADER_SIZE = 10;
const CMAP_SUBTABLE_COUNT = 2;
const CMAP_RECORD_SIZE = 8;
const CMAP_RECORD_OFFSET_FIELD = 4;
const CMAP_FORMAT_SEGMENTED = 4;
const CMAP_FORMAT_GROUPED = 12;
const FORMAT4_SEGMENT_COUNT_FIELD = 6;
const FORMAT4_END_CODES = 14;
const FORMAT12_GROUP_COUNT_FIELD = 12;
const FORMAT12_GROUPS = 16;
const FORMAT12_GROUP_SIZE = 12;
const FORMAT12_START_GLYPH_FIELD = 8;
const UINT16_RANGE = 65536;
const FLAG_ON_CURVE = 0x01;
const FLAG_X_SHORT = 0x02;
const FLAG_Y_SHORT = 0x04;
const FLAG_REPEAT = 0x08;
const FLAG_X_SAME_OR_POSITIVE = 0x10;
const FLAG_Y_SAME_OR_POSITIVE = 0x20;
const COMPOSITE_ARGS_ARE_WORDS = 0x0001;
const COMPOSITE_ARGS_ARE_XY = 0x0002;
const COMPOSITE_HAS_SCALE = 0x0008;
const COMPOSITE_MORE_COMPONENTS = 0x0020;
const COMPOSITE_HAS_XY_SCALE = 0x0040;
const COMPOSITE_HAS_TWO_BY_TWO = 0x0080;
const COMPOSITE_HEADER_SIZE = 4;
const F2DOT14_DIVISOR = 16384;
const PATH_DECIMALS = 3;

/** @typedef {{ x: number, y: number, onCurve: boolean }} GlyphPoint */
/** @typedef {GlyphPoint[]} Contour */
/** @typedef {{ scale: number, offsetX: number, offsetY: number }} GlyphPlacement */
/**
 * @typedef {{
 *   unitsPerEm: number,
 *   ascender: number,
 *   glyphIndex: (codePoint: number) => number,
 *   contours: (glyph: number) => Contour[],
 * }} Font
 */

/**
 * @param {DataView} view
 * @returns {Map<string, number>}
 */
function readTables(view) {
    /** @type {Map<string, number>} */
    const tables = new Map();
    const count = view.getUint16(TABLE_COUNT_OFFSET);
    for (let index = 0; index < count; index += 1) {
        const record = TABLE_DIRECTORY_OFFSET + index * TABLE_RECORD_SIZE;
        let tag = "";
        for (let letter = 0; letter < TAG_LENGTH; letter += 1) {
            tag += String.fromCharCode(view.getUint8(record + letter));
        }
        tables.set(tag, view.getUint32(record + TABLE_OFFSET_FIELD));
    }
    return tables;
}

/**
 * @param {Map<string, number>} tables
 * @param {string} tag
 * @returns {number}
 */
function tableOffset(tables, tag) {
    const offset = tables.get(tag);
    if (offset === undefined) {
        throw new Error(`Font has no ${tag} table`);
    }
    return offset;
}

/**
 * @param {DataView} view
 * @param {number} subtable
 * @returns {(codePoint: number) => number}
 */
function segmentedLookup(view, subtable) {
    const segmentCount = view.getUint16(subtable + FORMAT4_SEGMENT_COUNT_FIELD) / UINT16_SIZE;
    const endCodes = subtable + FORMAT4_END_CODES;
    const startCodes = endCodes + segmentCount * UINT16_SIZE + UINT16_SIZE;
    const deltas = startCodes + segmentCount * UINT16_SIZE;
    const rangeOffsets = deltas + segmentCount * UINT16_SIZE;
    return (codePoint) => {
        for (let segment = 0; segment < segmentCount; segment += 1) {
            const end = view.getUint16(endCodes + segment * UINT16_SIZE);
            if (codePoint > end) {
                continue;
            }
            const start = view.getUint16(startCodes + segment * UINT16_SIZE);
            if (codePoint < start) {
                return 0;
            }
            const delta = view.getUint16(deltas + segment * UINT16_SIZE);
            const rangeField = rangeOffsets + segment * UINT16_SIZE;
            const rangeOffset = view.getUint16(rangeField);
            if (rangeOffset === 0) {
                return (codePoint + delta) % UINT16_RANGE;
            }
            const glyph = view.getUint16(rangeField + rangeOffset + (codePoint - start) * UINT16_SIZE);
            return glyph === 0 ? 0 : (glyph + delta) % UINT16_RANGE;
        }
        return 0;
    };
}

/**
 * @param {DataView} view
 * @param {number} subtable
 * @returns {(codePoint: number) => number}
 */
function groupedLookup(view, subtable) {
    const groupCount = view.getUint32(subtable + FORMAT12_GROUP_COUNT_FIELD);
    return (codePoint) => {
        let low = 0;
        let high = groupCount - 1;
        while (low <= high) {
            const middle = Math.floor((low + high) / 2);
            const group = subtable + FORMAT12_GROUPS + middle * FORMAT12_GROUP_SIZE;
            const start = view.getUint32(group);
            const end = view.getUint32(group + UINT32_SIZE);
            if (codePoint < start) {
                high = middle - 1;
            } else if (codePoint > end) {
                low = middle + 1;
            } else {
                return view.getUint32(group + FORMAT12_START_GLYPH_FIELD) + codePoint - start;
            }
        }
        return 0;
    };
}

/**
 * @param {DataView} view
 * @param {number} cmap
 * @returns {(codePoint: number) => number}
 */
function buildCharacterMap(view, cmap) {
    const count = view.getUint16(cmap + CMAP_SUBTABLE_COUNT);
    /** @type {((codePoint: number) => number) | null} */
    let segmented = null;
    for (let index = 0; index < count; index += 1) {
        const subtable = cmap + view.getUint32(cmap + UINT32_SIZE + index * CMAP_RECORD_SIZE + CMAP_RECORD_OFFSET_FIELD);
        const format = view.getUint16(subtable);
        if (format === CMAP_FORMAT_GROUPED) {
            return groupedLookup(view, subtable);
        }
        if (format === CMAP_FORMAT_SEGMENTED && segmented === null) {
            segmented = segmentedLookup(view, subtable);
        }
    }
    if (segmented === null) {
        throw new Error("Font has no supported cmap subtable");
    }
    return segmented;
}

/**
 * @param {DataView} view
 * @param {number} start
 * @param {number} contourCount
 * @returns {Contour[]}
 */
function readSimpleGlyph(view, start, contourCount) {
    /** @type {number[]} */
    const endPoints = [];
    let cursor = start + GLYPH_HEADER_SIZE;
    for (let index = 0; index < contourCount; index += 1) {
        endPoints.push(view.getUint16(cursor));
        cursor += UINT16_SIZE;
    }
    const pointCount = (endPoints[endPoints.length - 1] ?? -1) + 1;
    cursor += UINT16_SIZE + view.getUint16(cursor);
    /** @type {number[]} */
    const flags = [];
    while (flags.length < pointCount) {
        const flag = view.getUint8(cursor);
        cursor += 1;
        flags.push(flag);
        if (flag & FLAG_REPEAT) {
            const repeats = view.getUint8(cursor);
            cursor += 1;
            for (let repeat = 0; repeat < repeats; repeat += 1) {
                flags.push(flag);
            }
        }
    }
    /**
     * @param {number} shortFlag
     * @param {number} sameFlag
     * @returns {number[]}
     */
    const readCoordinates = (shortFlag, sameFlag) => {
        /** @type {number[]} */
        const coordinates = [];
        let value = 0;
        flags.forEach((flag) => {
            if (flag & shortFlag) {
                const magnitude = view.getUint8(cursor);
                cursor += 1;
                value += flag & sameFlag ? magnitude : -magnitude;
            } else if (!(flag & sameFlag)) {
                value += view.getInt16(cursor);
                cursor += UINT16_SIZE;
            }
            coordinates.push(value);
        });
        return coordinates;
    };
    const xs = readCoordinates(FLAG_X_SHORT, FLAG_X_SAME_OR_POSITIVE);
    const ys = readCoordinates(FLAG_Y_SHORT, FLAG_Y_SAME_OR_POSITIVE);
    /** @type {Contour[]} */
    const contours = [];
    let first = 0;
    endPoints.forEach((last) => {
        /** @type {Contour} */
        const contour = [];
        for (let index = first; index <= last; index += 1) {
            contour.push({ x: xs[index] ?? 0, y: ys[index] ?? 0, onCurve: Boolean((flags[index] ?? 0) & FLAG_ON_CURVE) });
        }
        contours.push(contour);
        first = last + 1;
    });
    return contours;
}

/**
 * @param {Uint8Array} bytes
 * @returns {Font}
 */
export function parseFont(bytes) {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const tables = readTables(view);
    const head = tableOffset(tables, "head");
    const loca = tableOffset(tables, "loca");
    const glyf = tableOffset(tables, "glyf");
    const glyphCount = view.getUint16(tableOffset(tables, "maxp") + MAXP_GLYPH_COUNT);
    const shortLoca = view.getInt16(head + HEAD_INDEX_TO_LOC_FORMAT) === 0;
    const glyphIndex = buildCharacterMap(view, tableOffset(tables, "cmap"));
    /**
     * @param {number} glyph
     * @returns {number}
     */
    const glyphOffset = (glyph) => shortLoca
        ? view.getUint16(loca + glyph * UINT16_SIZE) * SHORT_LOCA_MULTIPLIER
        : view.getUint32(loca + glyph * UINT32_SIZE);
    /**
     * @param {number} glyph
     * @returns {Contour[]}
     */
    const contours = (glyph) => {
        if (glyph < 0 || glyph >= glyphCount) {
            return [];
        }
        const start = glyphOffset(glyph);
        if (glyphOffset(glyph + 1) === start) {
            return [];
        }
        const contourCount = view.getInt16(glyf + start);
        if (contourCount >= 0) {
            return readSimpleGlyph(view, glyf + start, contourCount);
        }
        return readComposite(view, glyf + start + GLYPH_HEADER_SIZE, contours);
    };
    return {
        unitsPerEm: view.getUint16(head + HEAD_UNITS_PER_EM),
        ascender: view.getInt16(tableOffset(tables, "hhea") + HHEA_ASCENDER),
        glyphIndex,
        contours,
    };
}

/**
 * @param {DataView} view
 * @param {number} start
 * @param {(glyph: number) => Contour[]} loadContours
 * @returns {Contour[]}
 */
function readComposite(view, start, loadContours) {
    /** @type {Contour[]} */
    const result = [];
    let cursor = start;
    let flags = COMPOSITE_MORE_COMPONENTS;
    while (flags & COMPOSITE_MORE_COMPONENTS) {
        flags = view.getUint16(cursor);
        const component = view.getUint16(cursor + UINT16_SIZE);
        cursor += COMPOSITE_HEADER_SIZE;
        let dx = 0;
        let dy = 0;
        if (flags & COMPOSITE_ARGS_ARE_WORDS) {
            dx = view.getInt16(cursor);
            dy = view.getInt16(cursor + UINT16_SIZE);
            cursor += UINT32_SIZE;
        } else {
            dx = view.getInt8(cursor);
            dy = view.getInt8(cursor + 1);
            cursor += UINT16_SIZE;
        }
        if (!(flags & COMPOSITE_ARGS_ARE_XY)) {
            dx = 0;
            dy = 0;
        }
        let matrix = [1, 0, 0, 1];
        const readScale = () => {
            const value = view.getInt16(cursor) / F2DOT14_DIVISOR;
            cursor += UINT16_SIZE;
            return value;
        };
        if (flags & COMPOSITE_HAS_SCALE) {
            const scale = readScale();
            matrix = [scale, 0, 0, scale];
        } else if (flags & COMPOSITE_HAS_XY_SCALE) {
            const scaleX = readScale();
            const scaleY = readScale();
            matrix = [scaleX, 0, 0, scaleY];
        } else if (flags & COMPOSITE_HAS_TWO_BY_TWO) {
            matrix = [readScale(), readScale(), readScale(), readScale()];
        }
        const [xx, xy, yx, yy] = matrix.map((value) => value ?? 0);
        loadContours(component).forEach((contour) => {
            result.push(contour.map((point) => ({
                x: point.x * (xx ?? 1) + point.y * (yx ?? 0) + dx,
                y: point.x * (xy ?? 0) + point.y * (yy ?? 1) + dy,
                onCurve: point.onCurve,
            })));
        });
    }
    return result;
}

/**
 * @param {number} value
 * @returns {string}
 */
export function formatNumber(value) {
    const rounded = Number(value.toFixed(PATH_DECIMALS));
    return String(rounded === 0 ? 0 : rounded);
}

/**
 * @param {Contour[]} contours
 * @param {Font} font
 * @param {GlyphPlacement} placement
 * @returns {string}
 */
export function contoursToPath(contours, font, placement) {
    /**
     * @param {{ x: number, y: number }} point
     * @returns {string}
     */
    const place = (point) => `${formatNumber(placement.offsetX + point.x * placement.scale)} ${formatNumber(placement.offsetY + (font.ascender - point.y) * placement.scale)}`;
    /**
     * @param {GlyphPoint} from
     * @param {GlyphPoint} to
     * @returns {GlyphPoint}
     */
    const midpoint = (from, to) => ({ x: (from.x + to.x) / 2, y: (from.y + to.y) / 2, onCurve: true });
    return contours.filter((contour) => contour.length > 0).map((contour) => {
        const firstOn = contour.findIndex((point) => point.onCurve);
        const rotated = firstOn >= 0
            ? contour.slice(firstOn).concat(contour.slice(0, firstOn))
            : [midpoint(/** @type {GlyphPoint} */ (contour[contour.length - 1]), /** @type {GlyphPoint} */ (contour[0]))].concat(contour);
        const start = /** @type {GlyphPoint} */ (rotated[0]);
        const commands = [`M${place(start)}`];
        /** @type {GlyphPoint | null} */
        let control = null;
        rotated.slice(1).concat([start]).forEach((point) => {
            if (point.onCurve) {
                commands.push(control ? `Q${place(control)} ${place(point)}` : `L${place(point)}`);
                control = null;
                return;
            }
            if (control) {
                const implied = midpoint(control, point);
                commands.push(`Q${place(control)} ${place(implied)}`);
            }
            control = point;
        });
        return `${commands.join("")}Z`;
    }).join("");
}
