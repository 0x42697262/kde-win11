import { existsSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { homedir } from "node:os";
import { PACKAGES_DIRECTORY, RenderedImage } from "../src/domain/catalog/packages.mjs";
import { assemblePackages } from "../src/domain/kde/assemble.mjs";
import { listTree, writeTree } from "../src/adapters/fileTree.mjs";
import { defaultSettingsPath, loadSettings } from "../src/adapters/settingsFile.mjs";
import { loadGlyphSource } from "../src/adapters/glyphFiles.mjs";

const ROOT = new URL("..", import.meta.url).pathname;
const SETTINGS_FLAG = "--settings";
const OUT_FLAG = "--out";

/**
 * @param {string} flag
 * @returns {string | undefined}
 */
function argumentAfter(flag) {
    const index = process.argv.indexOf(flag);
    return index >= 0 ? process.argv[index + 1] : undefined;
}

const settingsPath = argumentAfter(SETTINGS_FLAG) ?? defaultSettingsPath(process.env);
const outDirectory = argumentAfter(OUT_FLAG) ?? join(process.env.XDG_DATA_HOME || join(homedir(), ".local", "share"));
const settings = loadSettings(settingsPath);
settings.problems.forEach((problem) => console.warn(`settings.invalid ${JSON.stringify({ key: problem.key, value: problem.value, problem: problem.problem })}`));
const files = assemblePackages(settings.values, loadGlyphSource(ROOT));
const renderedImages = Object.values(RenderedImage);
const packagesRoot = join(ROOT, PACKAGES_DIRECTORY);
const copiedImages = listTree(packagesRoot)
    .map((path) => relative(packagesRoot, path).split(sep).join("/"))
    .filter((path) => renderedImages.some((image) => path.endsWith(image)))
    .map((path) => ({ path, content: new Uint8Array(readFileSync(join(packagesRoot, path))) }));
writeTree(outDirectory, [...files, ...copiedImages]);
console.info(`build: ${files.length + copiedImages.length} files written to ${outDirectory} using ${existsSync(settingsPath) ? settingsPath : "defaults"}`);
