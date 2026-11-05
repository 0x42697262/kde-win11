import { test } from "node:test";
import assert from "node:assert/strict";
import { fillTemplate, renderPreviewHtml } from "../../src/domain/kde/preview.mjs";
import { DEFAULTS } from "./defaults.mjs";

test("preview templates fail loudly on missing values", () => {
    assert.equal(fillTemplate("a{{one}}b", { one: 1 }), "a1b");
    assert.throws(() => fillTemplate("{{missing}}", {}));
    const html = renderPreviewHtml("light", DEFAULTS, "file:///packages");
    assert.ok(!html.includes("{{"));
    assert.match(html, /file:\/\/\/packages\/icons\/kde-win11\/apps\/scalable\/start-here.svg/);
});
