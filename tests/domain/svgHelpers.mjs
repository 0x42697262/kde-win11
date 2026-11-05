/**
 * @param {string} svg
 * @returns {Set<string>}
 */
export function elementIds(svg) {
    return new Set([...svg.matchAll(/ id="([^"]+)"/g)].map((match) => match[1] ?? ""));
}

/**
 * @param {string} svg
 * @returns {boolean}
 */
export function looksWellFormed(svg) {
    const tags = [...svg.replace(/<\?xml[^>]*\?>/, "").matchAll(/<(\/?)([a-zA-Z][\w:-]*)[^>]*?(\/?)>/g)];
    /** @type {string[]} */
    const stack = [];
    for (const tag of tags) {
        const [, closing, name, selfClosing] = tag;
        if (selfClosing) {
            continue;
        }
        if (closing) {
            if (stack.pop() !== name) {
                return false;
            }
        } else {
            stack.push(name ?? "");
        }
    }
    return stack.length === 0;
}
