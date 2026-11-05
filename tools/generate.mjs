import { SETTING_DEFINITIONS } from "../src/domain/catalog/settingsSchema.mjs";
import { PACKAGES_DIRECTORY, PROJECT, RenderedImage } from "../src/domain/catalog/packages.mjs";
import { renderConfiguration } from "../src/domain/docs/configuration.mjs";
import { assemblePackages } from "../src/domain/kde/assemble.mjs";
import { textFile, underDirectory } from "../src/domain/kde/files.mjs";
import { extraneousFiles, removeFiles, staleFiles, writeTree } from "../src/adapters/fileTree.mjs";
import { loadSettings } from "../src/adapters/settingsFile.mjs";
import { loadGlyphSource } from "../src/adapters/glyphFiles.mjs";
import { loadQmlSources } from "../src/adapters/qmlSources.mjs";

const ROOT = new URL("..", import.meta.url).pathname;
const CHECK_FLAG = "--check";
const CONFIG_PATH_LABEL = `$XDG_CONFIG_HOME/${PROJECT.configDirectoryName}/${PROJECT.settingsFileName}`;

const defaults = loadSettings("").values;
const files = [
    textFile("docs/configuration.md", renderConfiguration(SETTING_DEFINITIONS, CONFIG_PATH_LABEL)),
    ...underDirectory(PACKAGES_DIRECTORY, assemblePackages(defaults, loadGlyphSource(ROOT), loadQmlSources(ROOT))),
];
const rendered = Object.values(RenderedImage);
const stale = staleFiles(ROOT, files);
const extraneous = extraneousFiles(ROOT, PACKAGES_DIRECTORY, files, rendered);

if (process.argv.includes(CHECK_FLAG)) {
    [...stale, ...extraneous].forEach((path) => console.error(`gen:check: ${path} is out of date; run npm run gen`));
    if (stale.length + extraneous.length > 0) {
        process.exit(1);
    }
    console.info(`gen:check: ${files.length} generated files current`);
} else {
    writeTree(ROOT, files);
    removeFiles(ROOT, extraneous);
    console.info(`gen: ${stale.length} written, ${extraneous.length} removed, ${files.length} total`);
}
