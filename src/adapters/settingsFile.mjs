import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { resolveDocument } from "../domain/settings/document.mjs";
import { SETTINGS_DOCUMENT_SCHEMA, SETTINGS_MIGRATIONS } from "../domain/catalog/schemas.mjs";
import { PROJECT } from "../domain/catalog/packages.mjs";

/**
 * @param {NodeJS.ProcessEnv} environment
 * @returns {string}
 */
export function defaultSettingsPath(environment) {
    const configHome = environment.XDG_CONFIG_HOME || join(homedir(), ".config");
    return join(configHome, PROJECT.configDirectoryName, PROJECT.settingsFileName);
}

/**
 * @param {string} path
 * @returns {import("../domain/settings/document.mjs").ResolvedSettings}
 */
export function loadSettings(path) {
    const text = existsSync(path) ? readFileSync(path, "utf8") : "";
    return resolveDocument(text, SETTINGS_DOCUMENT_SCHEMA, SETTINGS_MIGRATIONS);
}
