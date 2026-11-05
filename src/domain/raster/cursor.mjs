import { CURSOR_CENTER, CURSOR_GRID, INFINITE_DISTANCE, OutlineRole, SPIN_SWEEP_MINIMUM, SUPERSAMPLE } from "../catalog/cursors.mjs";
import { CursorRole } from "../catalog/enums.mjs";
import { DEGREES_PER_TURN } from "../catalog/units.mjs";
import { parseHex } from "../theme/color.mjs";
import { boxBlur, squaredDistanceToInside } from "./distance.mjs";
import { shapeBounds, shapeContains } from "./shapes.mjs";

/** @typedef {import("../catalog/cursors.mjs").CursorDesign} CursorDesign */
/** @typedef {import("../catalog/tokens.mjs").ColorToken} ColorToken */
/** @typedef {{ fill: ColorToken, ink: ColorToken, accent: ColorToken, outline: ColorToken, shadow: ColorToken }} CursorColors */
/** @typedef {{ outlineWidth: number, shadowOffset: number, shadowBlur: number }} CursorMetrics */
/** @typedef {{ size: number, width: number, height: number, hotX: number, hotY: number, delay: number, pixels: Uint32Array }} CursorImage */

const CHANNEL_MAX = 255;
const ALPHA_SHIFT = 24;
const RED_SHIFT = 16;
const GREEN_SHIFT = 8;
const NO_ROLE = -1;
const OUTLINE_ROLE = 3;
const BLUR_PASSES = 2;
const HALF_TURN = DEGREES_PER_TURN / 2;
const ROLE_ORDER = Object.freeze([CursorRole.Fill, CursorRole.Ink, CursorRole.Accent]);

/**
 * @param {number} frame
 * @param {number} frameCount
 * @returns {{ spin: number, sweepScale: number }}
 */
export function spinState(frame, frameCount) {
    const progress = frameCount > 0 ? frame / frameCount : 0;
    return {
        spin: progress * DEGREES_PER_TURN,
        sweepScale: SPIN_SWEEP_MINIMUM + (1 - SPIN_SWEEP_MINIMUM) * (0.5 - Math.cos(progress * Math.PI * 2) / 2),
    };
}

/**
 * @param {number} pointX
 * @param {number} pointY
 * @param {number} degrees
 * @returns {number[]}
 */
function rotateAroundCenter(pointX, pointY, degrees) {
    if (degrees === 0) {
        return [pointX, pointY];
    }
    const radians = (-degrees * Math.PI) / HALF_TURN;
    const offsetX = pointX - CURSOR_CENTER;
    const offsetY = pointY - CURSOR_CENTER;
    return [
        CURSOR_CENTER + offsetX * Math.cos(radians) - offsetY * Math.sin(radians),
        CURSOR_CENTER + offsetX * Math.sin(radians) + offsetY * Math.cos(radians),
    ];
}

/**
 * @param {CursorDesign} design
 * @param {number} size
 * @param {CursorColors} colors
 * @param {CursorMetrics} metrics
 * @param {{ frame: number, frameCount: number, delay: number }} timing
 * @returns {CursorImage}
 */
export function rasterizeCursor(design, size, colors, metrics, timing) {
    const scale = size / CURSOR_GRID;
    const samples = size * SUPERSAMPLE;
    const step = 1 / (scale * SUPERSAMPLE);
    const { spin, sweepScale } = spinState(timing.frame, timing.frameCount);
    const roles = new Int8Array(samples * samples).fill(NO_ROLE);
    const silhouette = new Uint8Array(samples * samples);
    /** @type {Map<string, number>} */
    const roleIndex = new Map(ROLE_ORDER.map((role, index) => [String(role), index]));
    const layers = design.layers.slice().reverse().map((layer) => ({
        role: layer.role,
        shapes: layer.shapes.map((shape) => ({ shape, bounds: shapeBounds(shape) })),
    }));
    for (let row = 0; row < samples; row += 1) {
        for (let column = 0; column < samples; column += 1) {
            const [pointX = 0, pointY = 0] = rotateAroundCenter((column + 0.5) * step, (row + 0.5) * step, design.rotate ?? 0);
            const layer = layers.find((candidate) => candidate.shapes.some((entry) => pointX >= entry.bounds.left && pointX <= entry.bounds.right
                && pointY >= entry.bounds.top && pointY <= entry.bounds.bottom
                && shapeContains(entry.shape, pointX, pointY, spin, sweepScale)));
            if (layer) {
                roles[row * samples + column] = roleIndex.get(layer.role) ?? 0;
                silhouette[row * samples + column] = 1;
            }
        }
    }
    const outlineRadius = metrics.outlineWidth * scale * SUPERSAMPLE;
    const distances = squaredDistanceToInside(silhouette, samples, samples, INFINITE_DISTANCE);
    for (let index = 0; index < roles.length; index += 1) {
        if (roles[index] === NO_ROLE && (distances[index] ?? INFINITE_DISTANCE) <= outlineRadius * outlineRadius) {
            roles[index] = OUTLINE_ROLE;
        }
    }
    const outlineColor = design.outline === OutlineRole.Fill ? colors.fill : colors.outline;
    const palette = [colors.fill, colors.ink, colors.accent, outlineColor].map((token) => Object.assign({ alpha: token.alpha }, parseHex(token.hex)));
    const area = SUPERSAMPLE * SUPERSAMPLE;
    const red = new Float64Array(size * size);
    const green = new Float64Array(size * size);
    const blue = new Float64Array(size * size);
    const alpha = new Float64Array(size * size);
    for (let row = 0; row < samples; row += 1) {
        for (let column = 0; column < samples; column += 1) {
            const role = roles[row * samples + column] ?? NO_ROLE;
            if (role === NO_ROLE) {
                continue;
            }
            const color = palette[role];
            if (!color) {
                continue;
            }
            const pixel = Math.floor(row / SUPERSAMPLE) * size + Math.floor(column / SUPERSAMPLE);
            red[pixel] = (red[pixel] ?? 0) + (color.red * color.alpha) / area;
            green[pixel] = (green[pixel] ?? 0) + (color.green * color.alpha) / area;
            blue[pixel] = (blue[pixel] ?? 0) + (color.blue * color.alpha) / area;
            alpha[pixel] = (alpha[pixel] ?? 0) + color.alpha / area;
        }
    }
    const shadowShift = Math.round(metrics.shadowOffset * scale);
    const shifted = new Float64Array(size * size);
    for (let row = 0; row < size; row += 1) {
        for (let column = 0; column < size; column += 1) {
            const sourceRow = row - shadowShift;
            const sourceColumn = column - shadowShift;
            shifted[row * size + column] = sourceRow >= 0 && sourceColumn >= 0 ? alpha[sourceRow * size + sourceColumn] ?? 0 : 0;
        }
    }
    let shadow = shifted;
    const blurRadius = Math.round(metrics.shadowBlur * scale);
    for (let pass = 0; pass < BLUR_PASSES; pass += 1) {
        shadow = boxBlur(shadow, size, size, blurRadius);
    }
    const shadowColor = parseHex(colors.shadow.hex);
    const pixels = new Uint32Array(size * size);
    for (let index = 0; index < pixels.length; index += 1) {
        const coverage = alpha[index] ?? 0;
        const shade = (shadow[index] ?? 0) * colors.shadow.alpha * (1 - coverage);
        const channel = (/** @type {number} */ value) => Math.round(Math.min(Math.max(value, 0), CHANNEL_MAX));
        const outAlpha = channel((coverage + shade) * CHANNEL_MAX);
        const outRed = channel((red[index] ?? 0) + shadowColor.red * shade);
        const outGreen = channel((green[index] ?? 0) + shadowColor.green * shade);
        const outBlue = channel((blue[index] ?? 0) + shadowColor.blue * shade);
        pixels[index] = ((outAlpha << ALPHA_SHIFT) | (outRed << RED_SHIFT) | (outGreen << GREEN_SHIFT) | outBlue) >>> 0;
    }
    return {
        size,
        width: size,
        height: size,
        hotX: Math.min(Math.round((design.hotspot[0] ?? 0) * scale), size - 1),
        hotY: Math.min(Math.round((design.hotspot[1] ?? 0) * scale), size - 1),
        delay: timing.delay,
        pixels,
    };
}
