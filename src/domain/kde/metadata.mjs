import { PROJECT } from "../catalog/packages.mjs";
import { JSON_INDENT } from "../catalog/units.mjs";

/** @typedef {{ id: string, name: string, description: string }} PluginIdentity */

/**
 * @param {PluginIdentity} identity
 * @returns {Record<string, unknown>}
 */
export function kPlugin(identity) {
    return {
        Authors: [{ Name: PROJECT.author }],
        Description: identity.description,
        Id: identity.id,
        License: PROJECT.license,
        Name: identity.name,
        Version: PROJECT.version,
        Website: PROJECT.website,
    };
}

/**
 * @param {unknown} value
 * @returns {string}
 */
export function renderJson(value) {
    return `${JSON.stringify(value, null, JSON_INDENT)}\n`;
}
