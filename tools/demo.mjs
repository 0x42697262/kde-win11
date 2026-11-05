import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { CURSOR_THEME_IDS, FULLSCREEN_PREVIEW_SIZE, PACKAGES_DIRECTORY, PackageRoot } from "../src/domain/catalog/packages.mjs";
import { renderPreviewHtml } from "../src/domain/kde/preview.mjs";
import { readXcursorDirectory } from "../src/domain/raster/xcursor.mjs";
import { buildPalette, colorOf } from "../src/domain/theme/palette.mjs";
import { loadSettings } from "../src/adapters/settingsFile.mjs";

const ROOT = new URL("..", import.meta.url).pathname;
const OUTPUT_WIDTH = 1280;
const FRAME_MS = 50;
const CURSOR_SIZE = 32;
const PLAYWRIGHT_MODULE = "playwright";
const require = createRequire(import.meta.url);
/** @type {any} */
const playwright = require(PLAYWRIGHT_MODULE);
const outDirectory = process.argv[2] ?? join(ROOT, "build", "demo");
const values = loadSettings("").values;
const packagesRoot = join(ROOT, PACKAGES_DIRECTORY);

/**
 * @param {string} name
 * @returns {{ width: number, height: number, hotX: number, hotY: number, pixels: number[] }}
 */
function cursorImage(name) {
    const bytes = new Uint8Array(readFileSync(join(packagesRoot, PackageRoot.Icons, CURSOR_THEME_IDS.light, "cursors", name)));
    const entry = readXcursorDirectory(bytes).find((candidate) => candidate.size === CURSOR_SIZE);
    if (!entry) {
        throw new Error(`No ${CURSOR_SIZE}px image in cursor ${name}`);
    }
    const view = new DataView(bytes.buffer);
    const pixels = Array.from({ length: entry.width * entry.height }, (_unused, index) => view.getUint32(entry.offset + index * 4, true));
    return { width: entry.width, height: entry.height, hotX: entry.hotX, hotY: entry.hotY, pixels };
}

const SCENE = [
    { at: 0, target: { x: 1350, y: 760 } },
    { at: 600, target: { x: 1350, y: 760 } },
    { at: 1500, target: ".task:nth-child(1)", click: "openStart" },
    { at: 2300, target: ".tiles div:nth-child(3)" },
    { at: 2900, target: ".tiles div:nth-child(5)" },
    { at: 3500, target: ".tiles div:nth-child(9)" },
    { at: 4300, target: { x: 1600, y: 420 }, click: "closeStart" },
    { at: 5300, target: ".grid div:nth-child(5)", click: "select" },
    { at: 6100, target: ".task:nth-child(3)" },
    { at: 6800, target: ".task:nth-child(5)" },
    { at: 7600, target: ".task:nth-child(5)" },
];

const DEMO_SCRIPT = `
const scene = ${JSON.stringify(SCENE)};
const cursors = __CURSORS__;
const startDuration = 300;
const start = document.querySelector(".start");
const cursor = document.createElement("canvas");
cursor.style.cssText = "position:absolute;left:0;top:0;z-index:99;pointer-events:none;width:48px;height:48px";
document.body.appendChild(cursor);
const images = {};
for (const [name, image] of Object.entries(cursors)) {
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const context = canvas.getContext("2d");
    const data = context.createImageData(image.width, image.height);
    image.pixels.forEach((pixel, index) => {
        const alpha = pixel >>> 24;
        const scale = alpha === 0 ? 0 : 255 / alpha;
        data.data[index * 4] = Math.min(255, ((pixel >>> 16) & 255) * scale);
        data.data[index * 4 + 1] = Math.min(255, ((pixel >>> 8) & 255) * scale);
        data.data[index * 4 + 2] = Math.min(255, (pixel & 255) * scale);
        data.data[index * 4 + 3] = alpha;
    });
    context.putImageData(data, 0, 0);
    images[name] = { canvas, image };
}
function point(target) {
    if (typeof target !== "string") {
        return target;
    }
    const box = document.querySelector(target).getBoundingClientRect();
    return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
}
function ease(progress) {
    return progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
}
window.setScene = (time) => {
    let openAt = -1;
    let closeAt = -1;
    let selectAt = -1;
    for (const step of scene) {
        if (step.click === "openStart" && time >= step.at) openAt = step.at;
        if (step.click === "closeStart" && time >= step.at) closeAt = step.at;
        if (step.click === "select" && time >= step.at) selectAt = step.at;
    }
    const startPoints = scene.map((step) => point(step.target));
    let position = startPoints[0];
    for (let index = 1; index < scene.length; index += 1) {
        const previous = scene[index - 1];
        const current = scene[index];
        if (time <= current.at) {
            const progress = ease(Math.max(0, Math.min(1, (time - previous.at) / (current.at - previous.at))));
            const from = startPoints[index - 1];
            const to = startPoints[index];
            position = { x: from.x + (to.x - from.x) * progress, y: from.y + (to.y - from.y) * progress };
            break;
        }
        position = startPoints[index];
    }
    let open = 0;
    if (openAt >= 0) open = ease(Math.min(1, (time - openAt) / startDuration));
    if (closeAt >= 0) open = 1 - ease(Math.min(1, (time - closeAt) / startDuration));
    start.style.opacity = String(open);
    start.style.transform = "translateY(" + (1 - open) * 60 + "px)";
    start.style.visibility = open > 0.01 ? "visible" : "hidden";
    document.querySelectorAll(".demo-hover").forEach((element) => element.classList.remove("demo-hover"));
    cursor.style.visibility = "hidden";
    const under = document.elementFromPoint(position.x, position.y);
    const hovered = under && under.closest(".tiles div, .task, .grid div, .recent div");
    if (hovered && (open > 0.5 || !hovered.closest(".start"))) hovered.classList.add("demo-hover");
    if (selectAt >= 0) {
        document.querySelectorAll(".grid div").forEach((element, index) => element.className = index === 4 ? "selected" : "");
    }
    const name = hovered ? "pointer" : "default";
    const sprite = images[name];
    cursor.width = sprite.image.width;
    cursor.height = sprite.image.height;
    cursor.getContext("2d").drawImage(sprite.canvas, 0, 0);
    const scale = 48 / sprite.image.width;
    cursor.style.left = position.x - sprite.image.hotX * scale + "px";
    cursor.style.top = position.y - sprite.image.hotY * scale + "px";
    cursor.style.visibility = "visible";
};
`;

/**
 * @param {"light" | "dark"} variant
 * @param {string} directory
 * @param {number} duration
 */
async function record(variant, directory, duration) {
    const palette = buildPalette(variant, values);
    const hover = colorOf(palette, "subtleFillHover");
    const html = renderPreviewHtml(variant, values, pathToFileURL(packagesRoot).href)
        .replace("</style>", `.demo-hover { background: ${hover.hex}${Math.round(hover.alpha * 255).toString(16).padStart(2, "0")} !important; }</style>`)
        .replace("</body>", `<script>${DEMO_SCRIPT.replace("__CURSORS__", JSON.stringify({ default: cursorImage("default"), pointer: cursorImage("pointer") }))}</script></body>`);
    const htmlPath = join(ROOT, "build", `demo-${variant}.html`);
    mkdirSync(join(ROOT, "build"), { recursive: true });
    writeFileSync(htmlPath, html);
    mkdirSync(directory, { recursive: true });
    const page = await browser.newPage({ viewport: FULLSCREEN_PREVIEW_SIZE, deviceScaleFactor: OUTPUT_WIDTH / FULLSCREEN_PREVIEW_SIZE.width });
    await page.goto(pathToFileURL(htmlPath).href);
    await page.waitForLoadState("networkidle");
    let frame = 0;
    for (let time = 0; time <= duration; time += FRAME_MS) {
        await page.evaluate((/** @type {number} */ at) => /** @type {any} */ (globalThis).setScene(at), time);
        await page.screenshot({ path: join(directory, `${String(frame).padStart(4, "0")}.png`) });
        frame += 1;
    }
    await page.close();
    console.info(`demo: ${frame} ${variant} frames in ${directory}`);
}

const browser = await playwright.chromium.launch();
await record("light", join(outDirectory, "light"), (SCENE[SCENE.length - 1]?.at ?? 0));
await record("dark", join(outDirectory, "dark"), 2 * 1000);
await browser.close();
