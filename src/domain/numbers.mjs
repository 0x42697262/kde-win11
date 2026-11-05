const DECIMALS = 3;

/**
 * @param {number} value
 * @returns {string}
 */
export function formatNumber(value) {
    const rounded = Number(value.toFixed(DECIMALS));
    return String(rounded === 0 ? 0 : rounded);
}

/**
 * @param {number} value
 * @param {number} minimum
 * @param {number} maximum
 * @returns {number}
 */
export function clamp(value, minimum, maximum) {
    return Math.min(Math.max(value, minimum), maximum);
}
