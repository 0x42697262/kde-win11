import { DESKTOP_MENU_ACTIONS, DESKTOP_MENU_FILE, DESKTOP_MENU_GROUPS, DESKTOP_MENU_PLUGIN, DESKTOP_MENU_TRIGGER } from "../catalog/kdeFormats.mjs";

/** @typedef {import("../settings/document.mjs").SettingsValues} SettingsValues */
/** @typedef {{ file: string, groups: readonly string[], trigger: string, plugin: string, actions: Record<string, boolean> }} DesktopMenuConfig */

const ENTRY_SEPARATOR = ",";

/**
 * @param {SettingsValues} values
 * @returns {DesktopMenuConfig}
 */
export function desktopMenuConfig(values) {
    /** @type {Record<string, boolean>} */
    const actions = {};
    DESKTOP_MENU_ACTIONS.forEach((entry) => {
        actions[entry.action] = Boolean(values.desktopMenu[entry.setting]);
    });
    return { file: DESKTOP_MENU_FILE, groups: DESKTOP_MENU_GROUPS, trigger: DESKTOP_MENU_TRIGGER, plugin: DESKTOP_MENU_PLUGIN, actions };
}

/**
 * @param {SettingsValues} values
 * @returns {string}
 */
export function desktopMenuManifestEntries(values) {
    const config = desktopMenuConfig(values);
    return Object.keys(config.actions).map((action) => `${action}=${config.actions[action]}`).join(ENTRY_SEPARATOR);
}
