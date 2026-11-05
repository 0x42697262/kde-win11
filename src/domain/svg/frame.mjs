import { BLACK_HEX, FRAME_CENTER_SIZE, HINT_THICKNESS, SHADOW_FALLOFF, SHEET_GAP } from "../catalog/units.mjs";
import { element, hintRect, invisibleRect, paintAttributes } from "./document.mjs";
import { insetRect, intersectRects, rectPath, roundedRectCellPath, shrinkRadii } from "./shapes.mjs";
import { formatAlpha } from "../theme/color.mjs";

/** @typedef {import("./document.mjs").Rect} Rect */
/** @typedef {import("./document.mjs").Paint} Paint */
/** @typedef {import("./shapes.mjs").Radii} Radii */
/** @typedef {import("./shapes.mjs").CornerName} CornerName */
/** @typedef {import("../catalog/tokens.mjs").ColorToken} ColorToken */
/** @typedef {{ left: number, top: number, right: number, bottom: number }} Sides */
/** @typedef {{ left: boolean, top: boolean, right: boolean, bottom: boolean }} SideFlags */
/** @typedef {{ rect: Rect, paint: Paint }} Overlay */
/**
 * @typedef {{
 *   prefix: string,
 *   cells: Sides,
 *   inset: Sides,
 *   radii: Radii,
 *   fill?: Paint,
 *   stroke?: { width: number, paint: Paint, sides: SideFlags },
 *   overlays?: readonly Overlay[],
 *   hints?: Sides,
 *   mask?: boolean,
 * }} FrameSpec
 */
/** @typedef {{ width: number, height: number, render: (originX: number, originY: number) => { body: string, defs: string } }} SheetItem */
/** @typedef {{ prefix: string, extents: Sides, radius: number, color: ColorToken }} ShadowSpec */

const MASK_PREFIX = "mask";
const SHADOW_PREFIX = "shadow";
const NO_SIDES = Object.freeze({ left: 0, top: 0, right: 0, bottom: 0 });

/** @type {readonly { name: string, column: number, row: number, corner: CornerName | null }[]} */
const CELLS = Object.freeze([
    { name: "topleft", column: 0, row: 0, corner: "topleft" },
    { name: "top", column: 1, row: 0, corner: null },
    { name: "topright", column: 2, row: 0, corner: "topright" },
    { name: "left", column: 0, row: 1, corner: null },
    { name: "center", column: 1, row: 1, corner: null },
    { name: "right", column: 2, row: 1, corner: null },
    { name: "bottomleft", column: 0, row: 2, corner: "bottomleft" },
    { name: "bottom", column: 1, row: 2, corner: null },
    { name: "bottomright", column: 2, row: 2, corner: "bottomright" },
]);

/**
 * @param {string} prefix
 * @param {string} name
 * @returns {string}
 */
export function elementId(prefix, name) {
    if (prefix === "" || name === "") {
        return `${prefix}${name}`;
    }
    return `${prefix}-${name}`;
}

/**
 * @param {Sides} cells
 * @returns {{ width: number, height: number, columns: number[], rows: number[], widths: number[], heights: number[] }}
 */
function frameGrid(cells) {
    const widths = [cells.left, FRAME_CENTER_SIZE, cells.right];
    const heights = [cells.top, FRAME_CENTER_SIZE, cells.bottom];
    return {
        width: cells.left + FRAME_CENTER_SIZE + cells.right,
        height: cells.top + FRAME_CENTER_SIZE + cells.bottom,
        columns: [0, cells.left, cells.left + FRAME_CENTER_SIZE],
        rows: [0, cells.top, cells.top + FRAME_CENTER_SIZE],
        widths,
        heights,
    };
}

/**
 * @param {Rect} rect
 * @param {number} originX
 * @param {number} originY
 * @returns {Rect}
 */
function moveRect(rect, originX, originY) {
    return { x: rect.x + originX, y: rect.y + originY, width: rect.width, height: rect.height };
}

/**
 * @param {FrameSpec} spec
 * @returns {SheetItem}
 */
export function frameItem(spec) {
    const grid = frameGrid(spec.cells);
    const hintRows = spec.hints ? HINT_THICKNESS * (1 + 2) : 0;
    const hintWidth = spec.hints ? Math.max(spec.hints.left, spec.hints.right, spec.hints.top, spec.hints.bottom, HINT_THICKNESS) : 0;
    return {
        width: Math.max(grid.width, hintWidth),
        height: grid.height + (spec.hints ? SHEET_GAP + hintWidth + hintRows : 0),
        render: (originX, originY) => ({ body: renderFrame(spec, grid, originX, originY), defs: "" }),
    };
}

/**
 * @param {FrameSpec} spec
 * @param {ReturnType<typeof frameGrid>} grid
 * @param {number} originX
 * @param {number} originY
 * @returns {string}
 */
function renderFrame(spec, grid, originX, originY) {
    const outer = moveRect(insetRect({ x: 0, y: 0, width: grid.width, height: grid.height }, spec.inset), originX, originY);
    const strokeWidth = spec.stroke ? spec.stroke.width : 0;
    const strokeSides = spec.stroke ? spec.stroke.sides : { left: false, top: false, right: false, bottom: false };
    const inner = insetRect(outer, {
        left: strokeSides.left ? strokeWidth : 0,
        top: strokeSides.top ? strokeWidth : 0,
        right: strokeSides.right ? strokeWidth : 0,
        bottom: strokeSides.bottom ? strokeWidth : 0,
    });
    const innerRadii = shrinkRadii(spec.radii, strokeWidth);
    const groups = CELLS.map((cell) => {
        const cellRect = {
            x: originX + (grid.columns[cell.column] ?? 0),
            y: originY + (grid.rows[cell.row] ?? 0),
            width: grid.widths[cell.column] ?? 0,
            height: grid.heights[cell.row] ?? 0,
        };
        const parts = [invisibleRect(cellRect)];
        const fillPath = roundedRectCellPath(spec.stroke ? inner : outer, spec.stroke ? innerRadii : spec.radii, cellRect, cell.corner);
        if (spec.fill && fillPath !== "") {
            parts.push(element("path", Object.assign({ d: fillPath }, paintAttributes(spec.fill))));
        }
        if (spec.stroke && strokeWidth > 0) {
            const outerPath = roundedRectCellPath(outer, spec.radii, cellRect, cell.corner);
            const innerPath = roundedRectCellPath(inner, innerRadii, cellRect, cell.corner);
            if (outerPath !== "" && outerPath !== innerPath) {
                parts.push(element("path", Object.assign({ d: `${outerPath}${innerPath}`, "fill-rule": "evenodd" }, paintAttributes(spec.stroke.paint))));
            }
        }
        (spec.overlays ?? []).forEach((overlay) => {
            const clipped = intersectRects(moveRect(overlay.rect, originX, originY), cellRect);
            if (clipped) {
                parts.push(element("path", Object.assign({ d: rectPath(clipped) }, paintAttributes(overlay.paint))));
            }
        });
        return element("g", { id: elementId(spec.prefix, cell.name) }, parts.join(""));
    });
    if (spec.hints) {
        const hints = spec.hints;
        const top = originY + grid.height + SHEET_GAP;
        groups.push(
            hintRect(elementId(spec.prefix, "hint-left-margin"), { x: originX, y: top, width: Math.max(hints.left, HINT_THICKNESS), height: HINT_THICKNESS }),
            hintRect(elementId(spec.prefix, "hint-right-margin"), { x: originX, y: top + HINT_THICKNESS * 2, width: Math.max(hints.right, HINT_THICKNESS), height: HINT_THICKNESS }),
            hintRect(elementId(spec.prefix, "hint-top-margin"), { x: originX + hintTopOffset(hints), y: top, width: HINT_THICKNESS, height: Math.max(hints.top, HINT_THICKNESS) }),
            hintRect(elementId(spec.prefix, "hint-bottom-margin"), { x: originX + hintTopOffset(hints) + HINT_THICKNESS * 2, y: top, width: HINT_THICKNESS, height: Math.max(hints.bottom, HINT_THICKNESS) }),
        );
    }
    return groups.join("\n");
}

/**
 * @param {Sides} hints
 * @returns {number}
 */
function hintTopOffset(hints) {
    return Math.max(hints.left, hints.right, HINT_THICKNESS) + HINT_THICKNESS * 2;
}

/**
 * @param {FrameSpec} spec
 * @returns {FrameSpec}
 */
export function maskOf(spec) {
    return {
        prefix: elementId(MASK_PREFIX, spec.prefix),
        cells: spec.cells,
        inset: spec.inset,
        radii: spec.radii,
        fill: { color: { hex: BLACK_HEX, alpha: 1 } },
    };
}

/**
 * @param {number} start
 * @param {ColorToken} color
 * @returns {string}
 */
function falloffStops(start, color) {
    const lead = start > 0 ? [element("stop", { offset: 0, "stop-color": color.hex, "stop-opacity": 0 }), element("stop", { offset: Math.max(start - Number.EPSILON, 0), "stop-color": color.hex, "stop-opacity": 0 })] : [];
    return lead.concat(SHADOW_FALLOFF.map((step) => element("stop", {
        offset: start + step.position * (1 - start),
        "stop-color": color.hex,
        "stop-opacity": formatAlpha(color.alpha * step.strength),
    }))).join("");
}

/**
 * @param {ShadowSpec} spec
 * @returns {SheetItem}
 */
export function shadowItem(spec) {
    const { extents, radius } = spec;
    const cornerWidth = Math.max(extents.left, extents.right) + radius;
    const cornerHeight = Math.max(extents.top, extents.bottom) + radius;
    const width = (cornerWidth + SHEET_GAP) * 2 + Math.max(cornerWidth, extents.left, extents.right);
    const height = cornerHeight * 2 + FRAME_CENTER_SIZE + SHEET_GAP * (1 + 2) + Math.max(extents.left, extents.right, extents.top, extents.bottom, HINT_THICKNESS);
    return { width, height, render: (originX, originY) => renderShadow(spec, originX, originY) };
}

/**
 * @param {ShadowSpec} spec
 * @param {number} originX
 * @param {number} originY
 * @returns {{ body: string, defs: string }}
 */
function renderShadow(spec, originX, originY) {
    const { extents, radius, color } = spec;
    const prefix = elementId(SHADOW_PREFIX, spec.prefix);
    /** @type {string[]} */
    const defs = [];
    /** @type {string[]} */
    const body = [];
    const cornerSpan = Math.max(extents.left, extents.right) + radius + SHEET_GAP;
    const rowSpan = Math.max(extents.top, extents.bottom) + radius + SHEET_GAP;
    /**
     * @param {string} name
     * @param {number} horizontal
     * @param {number} vertical
     * @param {-1 | 1} directionX
     * @param {-1 | 1} directionY
     */
    const corner = (name, horizontal, vertical, directionX, directionY) => {
        const tile = { x: originX + (directionX < 0 ? 0 : cornerSpan * 2), y: originY + (directionY < 0 ? 0 : rowSpan), width: horizontal + radius, height: vertical + radius };
        const centerX = directionX < 0 ? tile.x + tile.width : tile.x;
        const centerY = directionY < 0 ? tile.y + tile.height : tile.y;
        const reachX = radius + horizontal;
        const reachY = radius + vertical;
        const gradientId = `${prefix}-${name}-gradient`;
        const start = reachX + reachY > 0 ? (radius * 2) / (reachX + reachY) : 0;
        defs.push(element("radialGradient", { id: gradientId, cx: 0, cy: 0, r: 1, gradientUnits: "userSpaceOnUse", gradientTransform: `matrix(${reachX} 0 0 ${reachY} ${centerX} ${centerY})` }, falloffStops(start, color)));
        body.push(element("g", { id: elementId(prefix, name) }, invisibleRect(tile) + element("path", { d: rectPath(tile), fill: `url(#${gradientId})` })));
    };
    /**
     * @param {string} name
     * @param {Rect} tile
     * @param {Rect} visible
     * @param {{ x1: number, y1: number, x2: number, y2: number }} direction
     */
    const edge = (name, tile, visible, direction) => {
        const gradientId = `${prefix}-${name}-gradient`;
        defs.push(element("linearGradient", Object.assign({ id: gradientId, gradientUnits: "userSpaceOnUse" }, direction), falloffStops(0, color)));
        body.push(element("g", { id: elementId(prefix, name) }, invisibleRect(tile) + element("path", { d: rectPath(visible), fill: `url(#${gradientId})` })));
    };
    corner("topleft", extents.left, extents.top, -1, -1);
    corner("topright", extents.right, extents.top, 1, -1);
    corner("bottomleft", extents.left, extents.bottom, -1, 1);
    corner("bottomright", extents.right, extents.bottom, 1, 1);
    const edgeX = originX + cornerSpan;
    const topTile = { x: edgeX, y: originY, width: FRAME_CENTER_SIZE, height: extents.top + radius };
    edge("top", topTile, { x: edgeX, y: originY, width: FRAME_CENTER_SIZE, height: extents.top }, { x1: edgeX, y1: originY + extents.top, x2: edgeX, y2: originY });
    const bottomY = originY + rowSpan;
    const bottomTile = { x: edgeX, y: bottomY, width: FRAME_CENTER_SIZE, height: extents.bottom + radius };
    edge("bottom", bottomTile, { x: edgeX, y: bottomY + radius, width: FRAME_CENTER_SIZE, height: extents.bottom }, { x1: edgeX, y1: bottomY + radius, x2: edgeX, y2: bottomY + radius + extents.bottom });
    const sideY = originY + rowSpan * 2;
    const leftTile = { x: originX, y: sideY, width: extents.left + radius, height: FRAME_CENTER_SIZE };
    edge("left", leftTile, { x: originX, y: sideY, width: extents.left, height: FRAME_CENTER_SIZE }, { x1: originX + extents.left, y1: sideY, x2: originX, y2: sideY });
    const rightX = originX + cornerSpan;
    const rightTile = { x: rightX, y: sideY, width: extents.right + radius, height: FRAME_CENTER_SIZE };
    edge("right", rightTile, { x: rightX + radius, y: sideY, width: extents.right, height: FRAME_CENTER_SIZE }, { x1: rightX + radius, y1: sideY, x2: rightX + radius + extents.right, y2: sideY });
    const hintY = sideY + FRAME_CENTER_SIZE + SHEET_GAP;
    const hintX = originX + cornerSpan * 2;
    body.push(
        hintRect(elementId(prefix, "hint-left-margin"), { x: hintX, y: hintY, width: Math.max(extents.left, HINT_THICKNESS), height: HINT_THICKNESS }),
        hintRect(elementId(prefix, "hint-right-margin"), { x: hintX, y: hintY + HINT_THICKNESS * 2, width: Math.max(extents.right, HINT_THICKNESS), height: HINT_THICKNESS }),
        hintRect(elementId(prefix, "hint-top-margin"), { x: originX, y: hintY, width: HINT_THICKNESS, height: Math.max(extents.top, HINT_THICKNESS) }),
        hintRect(elementId(prefix, "hint-bottom-margin"), { x: originX + HINT_THICKNESS * 2, y: hintY, width: HINT_THICKNESS, height: Math.max(extents.bottom, HINT_THICKNESS) }),
    );
    return { body: body.join("\n"), defs: defs.join("") };
}

/**
 * @param {readonly SheetItem[]} items
 * @returns {{ width: number, height: number, body: string, defs: string }}
 */
export function composeSheet(items) {
    let top = SHEET_GAP;
    /** @type {string[]} */
    const bodies = [];
    /** @type {string[]} */
    const defs = [];
    items.forEach((item) => {
        const rendered = item.render(SHEET_GAP, top);
        bodies.push(rendered.body);
        defs.push(rendered.defs);
        top += item.height + SHEET_GAP;
    });
    const width = Math.max(...items.map((item) => item.width), 0) + SHEET_GAP * 2;
    return { width, height: top, body: bodies.join("\n"), defs: defs.join("") };
}

export { NO_SIDES };
