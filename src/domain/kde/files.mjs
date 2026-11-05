/** @typedef {{ path: string, content?: string | Uint8Array, linkTarget?: string }} OutputFile */

/**
 * @param {string} path
 * @param {string | Uint8Array} content
 * @returns {OutputFile}
 */
export function textFile(path, content) {
    return { path, content };
}

/**
 * @param {string} path
 * @param {string} linkTarget
 * @returns {OutputFile}
 */
export function linkFile(path, linkTarget) {
    return { path, linkTarget };
}

/**
 * @param {string} prefix
 * @param {readonly OutputFile[]} files
 * @returns {OutputFile[]}
 */
export function underDirectory(prefix, files) {
    return files.map((file) => Object.assign({}, file, { path: `${prefix}/${file.path}` }));
}
