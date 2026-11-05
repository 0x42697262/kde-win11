import { DEGREES_PER_TURN } from "../catalog/units.mjs";

/** @typedef {import("../catalog/cursors.mjs").CursorShape} CursorShape */

const HALF_TURN = DEGREES_PER_TURN / 2;

/**
 * @param {number} pointX
 * @param {number} pointY
 * @param {readonly (readonly number[])[]} points
 * @returns {boolean}
 */
function insidePolygon(pointX, pointY, points) {
    let inside = false;
    for (let index = 0, previous = points.length - 1; index < points.length; previous = index, index += 1) {
        const [currentX = 0, currentY = 0] = points[index] ?? [];
        const [previousX = 0, previousY = 0] = points[previous] ?? [];
        const crosses = (currentY > pointY) !== (previousY > pointY)
            && pointX < ((previousX - currentX) * (pointY - currentY)) / (previousY - currentY) + currentX;
        if (crosses) {
            inside = !inside;
        }
    }
    return inside;
}

/**
 * @param {number} pointX
 * @param {number} pointY
 * @param {number} fromX
 * @param {number} fromY
 * @param {number} toX
 * @param {number} toY
 * @returns {number}
 */
function distanceToSegment(pointX, pointY, fromX, fromY, toX, toY) {
    const deltaX = toX - fromX;
    const deltaY = toY - fromY;
    const lengthSquared = deltaX * deltaX + deltaY * deltaY;
    const along = lengthSquared === 0 ? 0 : Math.min(Math.max(((pointX - fromX) * deltaX + (pointY - fromY) * deltaY) / lengthSquared, 0), 1);
    return Math.hypot(pointX - (fromX + along * deltaX), pointY - (fromY + along * deltaY));
}

/**
 * @param {number} angle
 * @returns {number}
 */
function normalizeDegrees(angle) {
    return ((angle % DEGREES_PER_TURN) + DEGREES_PER_TURN) % DEGREES_PER_TURN;
}

/**
 * @param {CursorShape} shape
 * @param {number} pointX
 * @param {number} pointY
 * @param {number} spinDegrees
 * @param {number} sweepScale
 * @returns {boolean}
 */
export function shapeContains(shape, pointX, pointY, spinDegrees, sweepScale) {
    switch (shape.kind) {
    case "polygon":
        return insidePolygon(pointX, pointY, shape.points);
    case "circle":
        return Math.hypot(pointX - shape.cx, pointY - shape.cy) <= shape.radius;
    case "capsule":
        return distanceToSegment(pointX, pointY, shape.fromX, shape.fromY, shape.toX, shape.toY) <= shape.radius;
    case "rect": {
        const halfWidth = shape.width / 2;
        const halfHeight = shape.height / 2;
        const overX = Math.max(Math.abs(pointX - (shape.x + halfWidth)) - (halfWidth - shape.radius), 0);
        const overY = Math.max(Math.abs(pointY - (shape.y + halfHeight)) - (halfHeight - shape.radius), 0);
        return Math.hypot(overX, overY) <= shape.radius;
    }
    case "ring": {
        const distance = Math.hypot(pointX - shape.cx, pointY - shape.cy);
        if (distance < shape.inner || distance > shape.outer) {
            return false;
        }
        if (shape.sweep === undefined) {
            return true;
        }
        const sweep = shape.spin ? shape.sweep * sweepScale : shape.sweep;
        const start = (shape.start ?? 0) + (shape.spin ? spinDegrees : 0);
        const angle = (Math.atan2(pointY - shape.cy, pointX - shape.cx) * HALF_TURN) / Math.PI;
        return normalizeDegrees(angle - start) <= sweep;
    }
    default:
        return false;
    }
}

/** @typedef {{ left: number, top: number, right: number, bottom: number }} Bounds */

/**
 * @param {CursorShape} shape
 * @returns {Bounds}
 */
export function shapeBounds(shape) {
    switch (shape.kind) {
    case "polygon": {
        const xs = shape.points.map((point) => point[0] ?? 0);
        const ys = shape.points.map((point) => point[1] ?? 0);
        return { left: Math.min(...xs), top: Math.min(...ys), right: Math.max(...xs), bottom: Math.max(...ys) };
    }
    case "circle":
        return { left: shape.cx - shape.radius, top: shape.cy - shape.radius, right: shape.cx + shape.radius, bottom: shape.cy + shape.radius };
    case "ring":
        return { left: shape.cx - shape.outer, top: shape.cy - shape.outer, right: shape.cx + shape.outer, bottom: shape.cy + shape.outer };
    case "capsule":
        return {
            left: Math.min(shape.fromX, shape.toX) - shape.radius,
            top: Math.min(shape.fromY, shape.toY) - shape.radius,
            right: Math.max(shape.fromX, shape.toX) + shape.radius,
            bottom: Math.max(shape.fromY, shape.toY) + shape.radius,
        };
    case "rect":
        return { left: shape.x, top: shape.y, right: shape.x + shape.width, bottom: shape.y + shape.height };
    default:
        return { left: 0, top: 0, right: 0, bottom: 0 };
    }
}
