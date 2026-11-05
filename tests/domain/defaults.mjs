import { resolveDocument } from "../../src/domain/settings/document.mjs";
import { SETTINGS_DOCUMENT_SCHEMA } from "../../src/domain/catalog/schemas.mjs";
import { loadGlyphSource } from "../../src/adapters/glyphFiles.mjs";

/** @type {any} */
export const DEFAULTS = resolveDocument("", SETTINGS_DOCUMENT_SCHEMA).values;

export const ROOT = new URL("../..", import.meta.url).pathname;

export const GLYPHS = loadGlyphSource(ROOT);
