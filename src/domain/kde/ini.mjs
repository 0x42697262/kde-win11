/** @typedef {string | number | boolean | readonly string[]} IniValue */
/** @typedef {{ path: readonly string[], entries: readonly (readonly IniValue[])[] }} IniGroup */

/**
 * @param {IniValue} value
 * @returns {string}
 */
function formatValue(value) {
    if (Array.isArray(value)) {
        return value.join(",");
    }
    return String(value);
}

/**
 * @param {readonly IniGroup[]} groups
 * @returns {string}
 */
export function renderIni(groups) {
    return groups.map((group) => {
        const header = group.path.map((part) => `[${part}]`).join("");
        const lines = group.entries.map(([key, value]) => `${String(key)}=${formatValue(value ?? "")}`);
        return [header, ...lines].join("\n");
    }).join("\n\n").concat("\n");
}
