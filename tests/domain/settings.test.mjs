import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveDocument } from "../../src/domain/settings/document.mjs";
import { SETTINGS_DOCUMENT_SCHEMA } from "../../src/domain/catalog/schemas.mjs";
import { SETTING_DEFINITIONS } from "../../src/domain/catalog/settingsSchema.mjs";
import { validateValue } from "../../src/domain/settings/validation.mjs";

test("empty document resolves to defaults with no problems", () => {
    const resolved = resolveDocument("", SETTINGS_DOCUMENT_SCHEMA);
    assert.deepEqual(resolved.problems, []);
    assert.equal(resolved.values.accent.color, "#0078d4");
    assert.equal(resolved.values.metrics.panel.height, 48);
    assert.equal(resolved.values.taskbar.alignment, "center");
});

test("only valid overrides apply and every problem is reported", () => {
    const text = JSON.stringify({
        schemaVersion: 1,
        values: {
            accent: { color: "#FF8800" },
            taskbar: { alignment: "diagonal", pinned: ["applications:foot.desktop"] },
            metrics: { panel: { height: 4 } },
            nonsense: true,
        },
    });
    const resolved = resolveDocument(text, SETTINGS_DOCUMENT_SCHEMA);
    assert.equal(resolved.values.accent.color, "#ff8800");
    assert.equal(resolved.values.taskbar.alignment, "center");
    assert.deepEqual(resolved.values.taskbar.pinned, ["applications:foot.desktop"]);
    assert.equal(resolved.values.metrics.panel.height, 48);
    assert.deepEqual(resolved.problems.map((problem) => `${problem.key}:${problem.problem}`).sort(), [
        "metrics.panel.height:outOfRange",
        "nonsense:unknownKey",
        "taskbar.alignment:notAnOption",
    ]);
});

test("unreadable and newer documents fall back to defaults", () => {
    assert.equal(resolveDocument("{", SETTINGS_DOCUMENT_SCHEMA).problems[0]?.problem, "unreadableDocument");
    const newer = resolveDocument(JSON.stringify({ schemaVersion: 99, values: { accent: { color: "#ff0000" } } }), SETTINGS_DOCUMENT_SCHEMA);
    assert.equal(newer.values.accent.color, "#0078d4");
    assert.equal(newer.problems[0]?.problem, "newerSchemaVersion");
});

test("every default passes its own validation and keys are unique", () => {
    const keys = new Set();
    SETTING_DEFINITIONS.forEach((definition) => {
        assert.ok(!keys.has(definition.key), definition.key);
        keys.add(definition.key);
        assert.equal(validateValue(definition, definition.defaultValue).valid, true, definition.key);
    });
});

test("number lists are bounded per item", () => {
    const sizes = SETTING_DEFINITIONS.find((definition) => definition.key === "cursors.sizes");
    assert.ok(sizes);
    assert.equal(validateValue(sizes, [24, 32]).valid, true);
    assert.equal(validateValue(sizes, [8]).valid, false);
    assert.equal(validateValue(sizes, []).valid, false);
});
