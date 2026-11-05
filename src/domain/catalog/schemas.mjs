import { SETTING_DEFINITIONS, SETTINGS_SCHEMA_VERSION } from "./settingsSchema.mjs";

export const SETTINGS_DOCUMENT_SCHEMA = Object.freeze({ version: SETTINGS_SCHEMA_VERSION, definitions: SETTING_DEFINITIONS });

/** @type {readonly import("../settings/document.mjs").Migration[]} */
export const SETTINGS_MIGRATIONS = Object.freeze([]);
