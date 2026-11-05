import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const SCANNED_DIRECTORIES = ["src", "tools", "tests"];
/** @type {string[]} */
const SCANNED_ROOT_FILES = [];
const SCANNED_EXTENSIONS = [".qml", ".mjs"];
const ALLOWED_NUMBERS = new Set(["0", "1", "2", "-1", "0.0", "1.0", "0.5"]);
const CONSTANT_HOME_DIRECTORY = "src/domain/catalog/";
const NUMBER_RULE_DIRECTORIES = ["src/"];
const UPPER_CONSTANT_DECLARATION = /^\s*(export\s+)?const\s+[A-Z][A-Z0-9_]*\s*=/;
const INLINE_JSDOC = new RegExp(String.raw`/\*\*\s*@\w+[^*]*(?:\*(?!/)[^*]*)*\*/`, "g");
const OBJECT_SPREAD = /\{\s*\.\.\.|,\s*\.\.\.[\w$.()]+\s*\}/;
const DIRECT_VALUE_CATALOG = /catalog\/tokens\.mjs|catalog\/strings\.mjs|catalog\/accent\.mjs/;
const VALUE_CATALOG_READERS = ["src/domain/settings/valueDefinitions.mjs", "src/domain/catalog/settingsSchema.mjs"];
const OPTIONAL_CATCH_BINDING = /\bcatch\s*\{/;
const TOOL_DIRECTIVE = /^\s*\/\/@\s*pragma\b/;
const JSDOC_TAG_LINE = /^\s*\*\s*@\w+/;
const JSDOC_CONTINUATION_LINE = /^\s*\*\s+[|{}\w"'[\]<>,.:?()=\s-]*$/;

const RULES = Object.freeze({
    comment: "explanatory comment (move the why to docs/)",
    shortName: "single-character identifier",
    rawColor: "raw color literal outside the theme tokens",
    magicNumber: "number literal outside a named constant home",
    optionalCatch: "optional catch binding is not supported by the QML JavaScript engine",
    directValueCatalog: "read values from Settings or Theme, not straight from a value catalog",
    objectSpread: "object spread is not supported by the QML JavaScript engine; use Object.assign",
});

/** @param {string} directory @returns {string[]} */
function listFiles(directory) {
    return readdirSync(directory).flatMap((entry) => {
        const path = join(directory, entry);
        if (statSync(path).isDirectory()) {
            return listFiles(path);
        }
        return SCANNED_EXTENSIONS.some((extension) => path.endsWith(extension)) ? [path] : [];
    });
}

/** @param {string} line @returns {string} */
function withoutStrings(line) {
    return line.replace(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`/g, "\"\"");
}

/** @param {string[]} lines @returns {Set<number>} */
function findAllowedJsdocLines(lines) {
    /** @type {Set<number>} */
    const allowed = new Set();
    let blockStart = -1;
    lines.forEach((line, index) => {
        if (blockStart < 0 && /^\s*\/\*\*/.test(line)) {
            blockStart = index;
        }
        if (blockStart >= 0 && /\*\/\s*$/.test(line)) {
            const block = lines.slice(blockStart, index + 1);
            const inner = block.map((text) => text.replace(/^\s*\/\*\*/, " *").replace(/\*\/\s*$/, ""));
            const onlyTags = inner.every((text) => text.trim() === "*" || text.trim() === "" || JSDOC_TAG_LINE.test(text) || JSDOC_CONTINUATION_LINE.test(text));
            const hasTag = inner.some((text) => /@\w+/.test(text));
            if (onlyTags && hasTag) {
                for (let lineIndex = blockStart; lineIndex <= index; lineIndex += 1) {
                    allowed.add(lineIndex);
                }
            }
            blockStart = -1;
        }
    });
    return allowed;
}

/** @param {string} code @returns {boolean} */
function hasShortIdentifier(code) {
    const declaration = /\b(?:let|const|var|function)\s+([A-Za-z_$])\b(?!\s*\.)/;
    const property = /\bproperty\s+[\w<>.]+\s+([A-Za-z_$])\s*[:\n]/;
    const arrowSingle = /(?:^|[^\w$.])([A-Za-z_$])\s*=>/;
    const parameterList = /(?:function\s*[\w$]*|=>|^|[^\w$])\s*\(([^()]*)\)\s*(?:=>|\{|:)/g;
    if (declaration.test(code) || property.test(code + "\n") || arrowSingle.test(code)) {
        return true;
    }
    for (const match of code.matchAll(parameterList)) {
        const parameters = (match[1] ?? "").split(",").map((part) => part.trim().split(/[\s:=]/)[0] ?? "");
        if (parameters.some((name) => /^[A-Za-z_$]$/.test(name))) {
            return true;
        }
    }
    return false;
}

/** @param {string} code @returns {boolean} */
function hasMagicNumber(code) {
    const literals = code.match(/(?<![\w$.#])-?\d+(?:\.\d+)?(?![\w$])/g) ?? [];
    return literals.some((literal) => !ALLOWED_NUMBERS.has(literal));
}

/** @param {string} path @returns {string[]} */
function checkFile(path) {
    const relativePath = relative(ROOT, path).split(sep).join("/");
    const lines = readFileSync(path, "utf8").split("\n");
    const jsdocLines = findAllowedJsdocLines(lines);
    const isTest = relativePath.startsWith("tests/");
    const numberRuleApplies = !isTest && NUMBER_RULE_DIRECTORIES.some((prefix) => relativePath.startsWith(prefix)) && !relativePath.startsWith(CONSTANT_HOME_DIRECTORY);
    const colorRuleApplies = !isTest && !relativePath.startsWith(CONSTANT_HOME_DIRECTORY);
    /** @type {string[]} */
    const problems = [];
    lines.forEach((line, index) => {
        const where = `${relativePath}:${index + 1}`;
        const code = withoutStrings(line).replace(INLINE_JSDOC, "");
        if (jsdocLines.has(index)) {
            return;
        }
        if (/(^|[^:])\/\/|\/\*/.test(code) && !TOOL_DIRECTIVE.test(line)) {
            problems.push(`${where} ${RULES.comment}`);
        }
        if (relativePath.startsWith("src/") && !VALUE_CATALOG_READERS.includes(relativePath) && DIRECT_VALUE_CATALOG.test(line)) {
            problems.push(`${where} ${RULES.directValueCatalog}`);
        }
        if (relativePath.startsWith("src/") && OPTIONAL_CATCH_BINDING.test(code)) {
            problems.push(`${where} ${RULES.optionalCatch}`);
        }
        if (relativePath.startsWith("src/") && OBJECT_SPREAD.test(code)) {
            problems.push(`${where} ${RULES.objectSpread}`);
        }
        if (hasShortIdentifier(code)) {
            problems.push(`${where} ${RULES.shortName}`);
        }
        if (colorRuleApplies && /["'`]#[0-9a-fA-F]{3,8}["'`]|Qt\.rgba\(/.test(line)) {
            problems.push(`${where} ${RULES.rawColor}`);
        }
        if (numberRuleApplies && !UPPER_CONSTANT_DECLARATION.test(line) && hasMagicNumber(code)) {
            problems.push(`${where} ${RULES.magicNumber}`);
        }
    });
    return problems;
}

const files = [
    ...SCANNED_DIRECTORIES.flatMap((directory) => listFiles(join(ROOT, directory))),
    ...SCANNED_ROOT_FILES.map((file) => join(ROOT, file)),
];
const problems = files.flatMap(checkFile);
problems.forEach((problem) => console.error(problem));
if (problems.length > 0) {
    console.error(`check-banned: ${problems.length} problem(s)`);
    process.exit(1);
}
console.info(`check-banned: ${files.length} files clean`);
