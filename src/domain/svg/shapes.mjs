import { formatNumber } from "../numbers.mjs";

/** @typedef {import("./document.mjs").Rect} Rect */
/** @typedef {{ topLeft: number, topRight: number, bottomRight: number, bottomLeft: number }} Radii */
/** @typedef {"topleft" | "topright" | "bottomright" | "bottomleft"} CornerName */

/**
 * @param {number} radius
 * @returns {Radii}
 */
export function uniformRadii(radius) {
    return { topLeft: radius, topRight: radius, bottomRight: radius, bottomLeft: radius };
}

/**
 * @param {Rect} first
 * @param {Rect} second
 * @returns {Rect | null}
 */
export function intersectRects(first, second) {
    const left = Math.max(first.x, second.x);
    const top = Math.max(first.y, second.y);
    const right = Math.min(first.x + first.width, second.x + second.width);
    const bottom = Math.min(first.y + first.height, second.y + second.height);
    return right > left && bottom > top ? { x: left, y: top, width: right - left, height: bottom - top } : null;
}

/**
 * @param {Rect} rect
 * @returns {string}
 */
export function rectPath(rect) {
    const right = rect.x + rect.width;
    const bottom = rect.y + rect.height;
    return `M${formatNumber(rect.x)} ${formatNumber(rect.y)}H${formatNumber(right)}V${formatNumber(bottom)}H${formatNumber(rect.x)}Z`;
}

/**
 * @param {Rect} rect
 * @param {Radii} radii
 * @returns {string}
 */
export function roundedRectPath(rect, radii) {
    const left = rect.x;
    const top = rect.y;
    const right = rect.x + rect.width;
    const bottom = rect.y + rect.height;
    const number = formatNumber;
    /**
     * @param {number} radius
     * @param {number} endX
     * @param {number} endY
     * @returns {string}
     */
    const arc = (radius, endX, endY) => radius > 0 ? `A${number(radius)} ${number(radius)} 0 0 1 ${number(endX)} ${number(endY)}` : "";
    return [
        `M${number(left + radii.topLeft)} ${number(top)}`,
        `H${number(right - radii.topRight)}`,
        arc(radii.topRight, right, top + radii.topRight),
        `V${number(bottom - radii.bottomRight)}`,
        arc(radii.bottomRight, right - radii.bottomRight, bottom),
        `H${number(left + radii.bottomLeft)}`,
        arc(radii.bottomLeft, left, bottom - radii.bottomLeft),
        `V${number(top + radii.topLeft)}`,
        arc(radii.topLeft, left + radii.topLeft, top),
        "Z",
    ].join("");
}

/**
 * @param {Rect} shape
 * @param {Radii} radii
 * @param {Rect} cell
 * @param {CornerName | null} corner
 * @returns {string}
 */
export function roundedRectCellPath(shape, radii, cell, corner) {
    const bounds = intersectRects(shape, cell);
    if (bounds === null) {
        return "";
    }
    const radius = corner === null ? 0 : {
        topleft: radii.topLeft,
        topright: radii.topRight,
        bottomright: radii.bottomRight,
        bottomleft: radii.bottomLeft,
    }[corner];
    const touchesCorner = corner !== null && radius > 0 && {
        topleft: bounds.x === shape.x && bounds.y === shape.y,
        topright: bounds.x + bounds.width === shape.x + shape.width && bounds.y === shape.y,
        bottomright: bounds.x + bounds.width === shape.x + shape.width && bounds.y + bounds.height === shape.y + shape.height,
        bottomleft: bounds.x === shape.x && bounds.y + bounds.height === shape.y + shape.height,
    }[corner];
    if (!touchesCorner) {
        return rectPath(bounds);
    }
    return roundedRectPath(bounds, {
        topLeft: corner === "topleft" ? radius : 0,
        topRight: corner === "topright" ? radius : 0,
        bottomRight: corner === "bottomright" ? radius : 0,
        bottomLeft: corner === "bottomleft" ? radius : 0,
    });
}

/**
 * @param {Rect} rect
 * @param {{ left: number, top: number, right: number, bottom: number }} inset
 * @returns {Rect}
 */
export function insetRect(rect, inset) {
    return {
        x: rect.x + inset.left,
        y: rect.y + inset.top,
        width: Math.max(rect.width - inset.left - inset.right, 0),
        height: Math.max(rect.height - inset.top - inset.bottom, 0),
    };
}

/**
 * @param {Radii} radii
 * @param {number} amount
 * @returns {Radii}
 */
export function shrinkRadii(radii, amount) {
    return {
        topLeft: Math.max(radii.topLeft - amount, 0),
        topRight: Math.max(radii.topRight - amount, 0),
        bottomRight: Math.max(radii.bottomRight - amount, 0),
        bottomLeft: Math.max(radii.bottomLeft - amount, 0),
    };
}
