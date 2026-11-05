import { BLACK_HEX, SVG_NAMESPACE } from "../catalog/units.mjs";
import { formatAlpha } from "../theme/color.mjs";
import { formatNumber } from "../numbers.mjs";

const INVISIBLE_OPACITY = 0.001;

/** @typedef {import("../catalog/tokens.mjs").ColorToken} ColorToken */
/** @typedef {Readonly<Record<string, string | number | undefined>>} Attributes */
/** @typedef {{ x: number, y: number, width: number, height: number }} Rect */
/** @typedef {{ color: ColorToken, colorClass?: string }} Paint */

/**
 * @param {string} text
 * @returns {string}
 */
export function escapeXml(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/**
 * @param {Attributes} attributes
 * @returns {string}
 */
function renderAttributes(attributes) {
    return Object.keys(attributes)
        .filter((name) => attributes[name] !== undefined && attributes[name] !== "")
        .map((name) => {
            const value = attributes[name];
            return ` ${name}="${typeof value === "number" ? formatNumber(value) : escapeXml(String(value))}"`;
        })
        .join("");
}

/**
 * @param {string} name
 * @param {Attributes} attributes
 * @param {string} children
 * @returns {string}
 */
export function element(name, attributes, children = "") {
    return children === "" ? `<${name}${renderAttributes(attributes)}/>` : `<${name}${renderAttributes(attributes)}>${children}</${name}>`;
}

/**
 * @param {number} width
 * @param {number} height
 * @param {string} body
 * @param {string} defs
 * @returns {string}
 */
export function svgDocument(width, height, body, defs = "") {
    const head = defs === "" ? "" : element("defs", {}, defs);
    return `<?xml version="1.0" encoding="UTF-8"?>\n${element("svg", { xmlns: SVG_NAMESPACE, width, height, viewBox: `0 0 ${formatNumber(width)} ${formatNumber(height)}` }, `\n${head}${body}\n`)}\n`;
}

/**
 * @param {Readonly<Record<string, ColorToken>>} classes
 * @returns {string}
 */
export function colorSchemeStyle(classes) {
    const rules = Object.keys(classes).map((name) => `.${name}{color:${classes[name]?.hex}}`).join("");
    return element("style", { type: "text/css", id: "current-color-scheme" }, rules);
}

/**
 * @param {Paint} paint
 * @returns {Attributes}
 */
export function paintAttributes(paint) {
    return paint.colorClass
        ? { fill: "currentColor", class: paint.colorClass, "fill-opacity": paint.color.alpha < 1 ? formatAlpha(paint.color.alpha) : undefined }
        : { fill: paint.color.hex, "fill-opacity": paint.color.alpha < 1 ? formatAlpha(paint.color.alpha) : undefined };
}

/**
 * @param {Rect} rect
 * @returns {string}
 */
export function invisibleRect(rect) {
    return element("rect", { x: rect.x, y: rect.y, width: rect.width, height: rect.height, fill: BLACK_HEX, opacity: INVISIBLE_OPACITY });
}

/**
 * @param {string} id
 * @param {Rect} rect
 * @returns {string}
 */
export function hintRect(id, rect) {
    return element("rect", { id, x: rect.x, y: rect.y, width: rect.width, height: rect.height, fill: "none" });
}
