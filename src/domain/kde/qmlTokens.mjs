import { formatNumber } from "../numbers.mjs";

/** @typedef {{ name: string, type: "color" | "real" | "int" | "string" | "url", value: string | number }} QmlToken */

/**
 * @param {QmlToken} token
 * @returns {string}
 */
function formatValue(token) {
    if (token.type === "real" || token.type === "int") {
        return formatNumber(Number(token.value));
    }
    return JSON.stringify(String(token.value));
}

/**
 * @param {readonly QmlToken[]} tokens
 * @returns {string}
 */
export function renderTokensQml(tokens) {
    const lines = tokens.map((token) => `    readonly property ${token.type} ${token.name}: ${formatValue(token)}`);
    return `import QtQuick\n\nQtObject {\n${lines.join("\n")}\n}\n`;
}
