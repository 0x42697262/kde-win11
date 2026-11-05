import { test } from "node:test";
import assert from "node:assert/strict";
import { roundedRectCellPath, roundedRectPath, intersectRects, uniformRadii } from "../../src/domain/svg/shapes.mjs";
import { composeSheet, elementId, frameItem, maskOf, shadowItem } from "../../src/domain/svg/frame.mjs";
import { svgDocument, escapeXml } from "../../src/domain/svg/document.mjs";
import { elementIds, looksWellFormed } from "./svgHelpers.mjs";

const CORNERS = ["topleft", "top", "topright", "left", "center", "right", "bottomleft", "bottom", "bottomright"];

test("rounded rect paths arc only where radii are set", () => {
    assert.equal(roundedRectPath({ x: 0, y: 0, width: 10, height: 10 }, uniformRadii(0)), "M0 0H10V10H0V0Z");
    assert.match(roundedRectPath({ x: 0, y: 0, width: 10, height: 10 }, uniformRadii(2)), /A2 2 0 0 1/);
    assert.equal(intersectRects({ x: 0, y: 0, width: 2, height: 2 }, { x: 3, y: 3, width: 1, height: 1 }), null);
    const cell = roundedRectCellPath({ x: 0, y: 0, width: 20, height: 20 }, uniformRadii(4), { x: 0, y: 0, width: 4, height: 4 }, "topleft");
    assert.match(cell, /A4 4/);
    assert.equal(roundedRectCellPath({ x: 0, y: 0, width: 20, height: 20 }, uniformRadii(4), { x: 4, y: 0, width: 4, height: 4 }, null), "M4 0H8V4H4Z");
});

test("element ids join prefixes without stray separators", () => {
    assert.equal(elementId("", "top"), "top");
    assert.equal(elementId("south", "top"), "south-top");
    assert.equal(elementId("mask", ""), "mask");
    assert.equal(elementId(elementId("shadow", ""), "topleft"), "shadow-topleft");
});

test("frames, masks and shadows expose every Plasma element", () => {
    const spec = { prefix: "south", cells: { left: 8, top: 8, right: 8, bottom: 8 }, inset: { left: 0, top: 0, right: 0, bottom: 0 }, radii: uniformRadii(8), fill: { color: { hex: "#ffffff", alpha: 0.9 } }, hints: { left: 4, top: 4, right: 4, bottom: 4 } };
    const sheet = composeSheet([frameItem(spec), frameItem(maskOf(spec)), shadowItem({ prefix: "", extents: { left: 10, top: 6, right: 10, bottom: 14 }, radius: 8, color: { hex: "#000000", alpha: 0.3 } })]);
    const svg = svgDocument(sheet.width, sheet.height, sheet.body, sheet.defs);
    const ids = elementIds(svg);
    CORNERS.forEach((name) => {
        assert.ok(ids.has(`south-${name}`), name);
        assert.ok(ids.has(`mask-south-${name}`), name);
        if (name !== "center") {
            assert.ok(ids.has(`shadow-${name}`), name);
        }
    });
    ["left", "top", "right", "bottom"].forEach((side) => {
        assert.ok(ids.has(`south-hint-${side}-margin`));
        assert.ok(ids.has(`shadow-hint-${side}-margin`));
    });
    assert.ok(looksWellFormed(svg));
    assert.equal(escapeXml("a<b&\"c\""), "a&lt;b&amp;&quot;c&quot;");
});
