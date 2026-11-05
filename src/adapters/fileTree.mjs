import { existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, readlinkSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";

/** @typedef {import("../domain/kde/files.mjs").OutputFile} OutputFile */

/**
 * @param {string} directory
 * @returns {string[]}
 */
export function listTree(directory) {
    if (!existsSync(directory)) {
        return [];
    }
    return readdirSync(directory).flatMap((entry) => {
        const path = join(directory, entry);
        const stats = lstatSync(path);
        return stats.isDirectory() && !stats.isSymbolicLink() ? listTree(path) : [path];
    });
}

/**
 * @param {OutputFile} file
 * @param {string} target
 * @returns {boolean}
 */
function matches(file, target) {
    if (!existsSync(target) && !isLink(target)) {
        return false;
    }
    if (file.linkTarget !== undefined) {
        return isLink(target) && readlinkSync(target) === file.linkTarget;
    }
    if (isLink(target)) {
        return false;
    }
    const current = readFileSync(target);
    const expected = typeof file.content === "string" ? Buffer.from(file.content, "utf8") : Buffer.from(file.content ?? new Uint8Array());
    return current.equals(expected);
}

/**
 * @param {string} path
 * @returns {boolean}
 */
function isLink(path) {
    try {
        return lstatSync(path).isSymbolicLink();
    } catch (error) {
        return error === null;
    }
}

/**
 * @param {string} root
 * @param {readonly OutputFile[]} files
 */
export function writeTree(root, files) {
    files.forEach((file) => {
        const target = join(root, file.path);
        if (matches(file, target)) {
            return;
        }
        mkdirSync(dirname(target), { recursive: true });
        if (existsSync(target) || isLink(target)) {
            rmSync(target);
        }
        if (file.linkTarget !== undefined) {
            symlinkSync(file.linkTarget, target);
            return;
        }
        writeFileSync(target, file.content ?? "");
    });
}

/**
 * @param {string} root
 * @param {readonly OutputFile[]} files
 * @returns {string[]}
 */
export function staleFiles(root, files) {
    return files.filter((file) => !matches(file, join(root, file.path))).map((file) => file.path);
}

/**
 * @param {string} root
 * @param {string} managedDirectory
 * @param {readonly OutputFile[]} files
 * @param {readonly string[]} keep
 * @returns {string[]}
 */
export function extraneousFiles(root, managedDirectory, files, keep) {
    const expected = new Set(files.map((file) => file.path));
    return listTree(join(root, managedDirectory))
        .map((path) => relative(root, path).split(sep).join("/"))
        .filter((path) => !expected.has(path) && !keep.some((suffix) => path.endsWith(suffix)));
}

/**
 * @param {string} root
 * @param {readonly string[]} paths
 */
export function removeFiles(root, paths) {
    paths.forEach((path) => rmSync(join(root, path)));
}
