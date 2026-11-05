import { test } from "node:test";
import assert from "node:assert/strict";
import { shadowAround } from "../../src/domain/svg/frame.mjs";
import { uniformRadii } from "../../src/domain/svg/shapes.mjs";

test("shadow regions meet exactly at integer cell boundaries", () => {
    const shadow = shadowAround("test", { x: 8, y: 8, width: 28, height: 22 }, { x: 28, y: 22, width: 400, height: 300 }, uniformRadii(8), { left: 20, top: 14, right: 20, bottom: 26 }, { hex: "#000000", alpha: 0.3 });
    const coordinates = (shadow.body.match(/d="([^"]+)"/g) ?? []).join(" ").match(/-?\d+(\.\d+)?/g) ?? [];
    assert.ok(coordinates.length > 0);
    coordinates.forEach((value) => assert.ok(Number.isInteger(Number(value)), value));
});
