import { ValidationProblem, validateValue } from "./validation.mjs";

/** @typedef {import("./definitions.mjs").SettingDefinition} SettingDefinition */
/** @typedef {import("./definitions.mjs").SettingValue} SettingValue */
/** @typedef {import("./validation.mjs").ValidationProblemName} ValidationProblemName */
/** @typedef {{ key: string, value: unknown, problem: ValidationProblemName }} SettingsProblem */
/** @typedef {{ [key: string]: any }} SettingsValues */
/** @typedef {{ values: SettingsValues, overrides: Readonly<Record<string, SettingValue>>, problems: SettingsProblem[] }} ResolvedSettings */
/** @typedef {{ version: number, definitions: readonly SettingDefinition[] }} SettingsSchema */
/** @typedef {(values: Record<string, unknown>) => Record<string, unknown>} Migration */

const KEY_SEPARATOR = ".";

/**
 * @param {unknown} value
 * @returns {value is Record<string, unknown>}
 */
function isPlainObject(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * @param {Record<string, unknown>} tree
 * @param {string} prefix
 * @param {Record<string, unknown>} into
 * @param {ReadonlySet<string>} leafKeys
 * @returns {Record<string, unknown>}
 */
function flattenTree(tree, prefix, into, leafKeys) {
    Object.keys(tree).forEach((name) => {
        const key = prefix === "" ? name : `${prefix}${KEY_SEPARATOR}${name}`;
        const value = tree[name];
        if (isPlainObject(value) && !leafKeys.has(key)) {
            flattenTree(value, key, into, leafKeys);
            return;
        }
        into[key] = value;
    });
    return into;
}

/**
 * @param {SettingsValues} tree
 * @param {string} key
 * @param {unknown} value
 */
export function setPath(tree, key, value) {
    const parts = key.split(KEY_SEPARATOR);
    let node = tree;
    parts.slice(0, -1).forEach((part) => {
        if (!isPlainObject(node[part])) {
            node[part] = {};
        }
        node = node[part];
    });
    node[parts[parts.length - 1] ?? ""] = value;
}

/**
 * @param {string} text
 * @returns {{ parsed: unknown, readable: boolean }}
 */
function parseText(text) {
    if (text.trim() === "") {
        return { parsed: {}, readable: true };
    }
    try {
        return { parsed: JSON.parse(text), readable: true };
    } catch (error) {
        return { parsed: String(error), readable: false };
    }
}

/**
 * @param {string} text
 * @param {SettingsSchema} schema
 * @param {readonly Migration[]} migrations
 * @returns {ResolvedSettings}
 */
export function resolveDocument(text, schema, migrations = []) {
    /** @type {SettingsProblem[]} */
    const problems = [];
    const { parsed, readable } = parseText(text);
    if (!readable || !isPlainObject(parsed)) {
        problems.push({ key: "", value: text, problem: ValidationProblem.UnreadableDocument });
    }
    const document = readable && isPlainObject(parsed) ? parsed : {};
    const version = typeof document.schemaVersion === "number" ? document.schemaVersion : schema.version;
    let rawValues = isPlainObject(document.values) ? document.values : {};
    if (version > schema.version) {
        problems.push({ key: "schemaVersion", value: version, problem: ValidationProblem.NewerSchemaVersion });
        rawValues = {};
    }
    migrations.slice(Math.max(version - 1, 0), schema.version - 1).forEach((migration) => {
        rawValues = migration(rawValues);
    });
    const byKey = new Map(schema.definitions.map((definition) => [definition.key, definition]));
    const flat = flattenTree(rawValues, "", {}, new Set(byKey.keys()));
    /** @type {Record<string, SettingValue>} */
    const overrides = {};
    Object.keys(flat).forEach((key) => {
        const definition = byKey.get(key);
        if (!definition) {
            problems.push({ key, value: flat[key], problem: ValidationProblem.UnknownKey });
            return;
        }
        const result = validateValue(definition, flat[key]);
        if (result.valid) {
            overrides[key] = result.value;
        } else {
            problems.push({ key, value: flat[key], problem: result.problem });
        }
    });
    /** @type {SettingsValues} */
    const values = {};
    schema.definitions.forEach((definition) => {
        const value = Object.prototype.hasOwnProperty.call(overrides, definition.key) ? overrides[definition.key] : definition.defaultValue;
        setPath(values, definition.key, Array.isArray(value) ? value.slice() : value);
    });
    return { values, overrides: Object.freeze(overrides), problems };
}
