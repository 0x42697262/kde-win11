import { mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { FULLSCREEN_PREVIEW_SIZE, LOOK_AND_FEEL_IDS, PACKAGES_DIRECTORY, PREVIEW_SIZE, PackageRoot, RenderedImage, WALLPAPER_ID, WALLPAPER_SCREENSHOT_SIZE, WALLPAPER_SIZE } from "../src/domain/catalog/packages.mjs";
import { VARIANTS } from "../src/domain/catalog/enums.mjs";
import { renderPreviewHtml } from "../src/domain/kde/preview.mjs";
import { WALLPAPER_RENDERS } from "../src/domain/kde/wallpaper.mjs";
import { defaultSettingsPath, loadSettings } from "../src/adapters/settingsFile.mjs";

const ROOT = new URL("..", import.meta.url).pathname;
const SCREENSHOTS_DIRECTORY = "docs/screenshots";
const JPEG_QUALITY = 90;
const PLAYWRIGHT_MODULE = "playwright";
const SETTINGS_FLAG = "--settings";

const require = createRequire(import.meta.url);
/** @type {any} */
const playwright = require(PLAYWRIGHT_MODULE);
const settingsIndex = process.argv.indexOf(SETTINGS_FLAG);
const values = loadSettings(settingsIndex >= 0 ? process.argv[settingsIndex + 1] ?? "" : defaultSettingsPath(process.env)).values;
const packagesRoot = join(ROOT, PACKAGES_DIRECTORY);
const wallpaperRoot = join(packagesRoot, PackageRoot.Wallpapers, WALLPAPER_ID);
const browser = await playwright.chromium.launch();

/**
 * @param {string} url
 * @param {{ width: number, height: number }} viewport
 * @param {{ width: number, height: number }} output
 * @param {string} target
 */
async function capture(url, viewport, output, target) {
    const page = await browser.newPage({ viewport, deviceScaleFactor: output.width / viewport.width });
    await page.goto(url);
    await page.waitForLoadState("networkidle");
    mkdirSync(dirname(target), { recursive: true });
    const jpeg = target.endsWith(".jpg");
    writeFileSync(target, await page.screenshot({ type: jpeg ? "jpeg" : "png", quality: jpeg ? JPEG_QUALITY : undefined }));
    await page.close();
    console.info(`render: ${target}`);
}

for (const wallpaper of WALLPAPER_RENDERS) {
    await capture(pathToFileURL(join(wallpaperRoot, wallpaper.source)).href, WALLPAPER_SIZE, WALLPAPER_SIZE, join(wallpaperRoot, wallpaper.target));
}
await capture(pathToFileURL(join(wallpaperRoot, WALLPAPER_RENDERS[0]?.source ?? "")).href, WALLPAPER_SIZE, WALLPAPER_SCREENSHOT_SIZE, join(wallpaperRoot, RenderedImage.WallpaperScreenshot));

for (const variant of VARIANTS) {
    const html = renderPreviewHtml(variant, values, pathToFileURL(packagesRoot).href);
    const htmlPath = join(ROOT, "build", `preview-${variant}.html`);
    mkdirSync(dirname(htmlPath), { recursive: true });
    writeFileSync(htmlPath, html);
    const url = pathToFileURL(htmlPath).href;
    const lookAndFeel = join(packagesRoot, PackageRoot.LookAndFeel, LOOK_AND_FEEL_IDS[variant]);
    await capture(url, FULLSCREEN_PREVIEW_SIZE, FULLSCREEN_PREVIEW_SIZE, join(lookAndFeel, RenderedImage.FullscreenPreview));
    await capture(url, FULLSCREEN_PREVIEW_SIZE, PREVIEW_SIZE, join(lookAndFeel, RenderedImage.Preview));
    await capture(url, FULLSCREEN_PREVIEW_SIZE, FULLSCREEN_PREVIEW_SIZE, join(ROOT, SCREENSHOTS_DIRECTORY, `desktop-${variant}.jpg`));
}
await browser.close();
