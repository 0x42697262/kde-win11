import { RIBBONS, RIBBON_EDGE_OPACITY, WALLPAPER_GLOW, WALLPAPER_VIEWBOX } from "../catalog/wallpaper.mjs";
import { PROJECT, RenderedImage, WALLPAPER_ID, WALLPAPER_SIZE } from "../catalog/packages.mjs";
import { PACKAGE_TEXT } from "../catalog/packageText.mjs";
import { Variant } from "../catalog/enums.mjs";
import { formatAlpha } from "../theme/color.mjs";
import { parseColorGroup } from "../theme/palette.mjs";
import { element, svgDocument } from "../svg/document.mjs";
import { formatNumber } from "../numbers.mjs";
import { renderJson } from "./metadata.mjs";
import { textFile } from "./files.mjs";

/** @typedef {import("./files.mjs").OutputFile} OutputFile */
/** @typedef {import("../settings/document.mjs").SettingsValues} SettingsValues */
/** @typedef {import("../catalog/tokens.mjs").ColorToken} ColorToken */

/**
 * @param {readonly number[]} point
 * @param {number} shift
 * @returns {string}
 */
function shifted(point, shift) {
    return `${formatNumber(point[0] ?? 0)} ${formatNumber((point[1] ?? 0) + shift)}`;
}

/**
 * @param {(typeof RIBBONS)[number]} ribbon
 * @returns {string}
 */
function ribbonPath(ribbon) {
    const half = ribbon.thickness / 2;
    const quarter = ribbon.thickness / (2 + 2);
    return [
        `M${shifted(ribbon.start, -half)}`,
        `C${shifted(ribbon.first, -quarter)} ${shifted(ribbon.second, -half)} ${shifted(ribbon.end, -quarter)}`,
        `L${shifted(ribbon.end, quarter)}`,
        `C${shifted(ribbon.second, half)} ${shifted(ribbon.first, quarter)} ${shifted(ribbon.start, half)}`,
        "Z",
    ].join("");
}

/**
 * @param {string} variant
 * @param {SettingsValues} values
 * @returns {string}
 */
export function renderWallpaperSvg(variant, values) {
    const colors = parseColorGroup(variant === Variant.Dark ? values.colors.wallpaperDark : values.colors.wallpaperLight);
    const color = (/** @type {string} */ key) => /** @type {ColorToken} */ (colors[key]);
    const defs = [
        element("linearGradient", { id: "background", x1: 0, y1: 0, x2: 0, y2: 1 },
            element("stop", { offset: 0, "stop-color": color("backgroundTop").hex }) + element("stop", { offset: 1, "stop-color": color("backgroundBottom").hex })),
        element("radialGradient", { id: "glow", cx: WALLPAPER_GLOW.cx, cy: WALLPAPER_GLOW.cy, r: WALLPAPER_GLOW.radius, gradientUnits: "userSpaceOnUse" },
            element("stop", { offset: 0, "stop-color": color("glow").hex, "stop-opacity": formatAlpha(color("glow").alpha) }) + element("stop", { offset: 1, "stop-color": color("glow").hex, "stop-opacity": 0 })),
        ...RIBBONS.map((ribbon, index) => element("linearGradient", { id: `ribbon${index}`, x1: 0, y1: 0, x2: WALLPAPER_VIEWBOX.width, y2: 0, gradientUnits: "userSpaceOnUse" },
            element("stop", { offset: 0, "stop-color": color("ribbonStart").hex, "stop-opacity": formatAlpha(ribbon.opacity * RIBBON_EDGE_OPACITY) })
            + element("stop", { offset: 0.5, "stop-color": color("ribbonStart").hex, "stop-opacity": formatAlpha(ribbon.opacity) })
            + element("stop", { offset: 1, "stop-color": color("ribbonEnd").hex, "stop-opacity": formatAlpha(ribbon.opacity) }))),
        ...RIBBONS.filter((ribbon) => ribbon.blur > 0).map((ribbon) => element("filter", { id: `blur${ribbon.blur}`, x: "-10%", y: "-30%", width: "120%", height: "160%" }, element("feGaussianBlur", { stdDeviation: ribbon.blur }))),
    ].join("");
    const body = [
        element("rect", { width: WALLPAPER_VIEWBOX.width, height: WALLPAPER_VIEWBOX.height, fill: "url(#background)" }),
        element("rect", { width: WALLPAPER_VIEWBOX.width, height: WALLPAPER_VIEWBOX.height, fill: "url(#glow)" }),
        ...RIBBONS.map((ribbon, index) => element("path", { d: ribbonPath(ribbon), fill: `url(#ribbon${index})`, filter: ribbon.blur > 0 ? `url(#blur${ribbon.blur})` : undefined })),
    ].join("\n");
    const document = svgDocument(WALLPAPER_VIEWBOX.width, WALLPAPER_VIEWBOX.height, body, defs);
    return document.replace(`width="${WALLPAPER_VIEWBOX.width}" height="${WALLPAPER_VIEWBOX.height}"`, `width="${WALLPAPER_SIZE.width}" height="${WALLPAPER_SIZE.height}"`);
}

/**
 * @param {SettingsValues} values
 * @returns {OutputFile[]}
 */
export function renderWallpaperPackage(values) {
    const metadata = {
        KPackageStructure: "Wallpaper/Images",
        KPlugin: {
            Authors: [{ Name: PROJECT.author }],
            Id: WALLPAPER_ID,
            License: PROJECT.license,
            Name: PACKAGE_TEXT.wallpaperName,
        },
    };
    return [
        textFile("metadata.json", renderJson(metadata)),
        textFile("source/light.svg", renderWallpaperSvg(Variant.Light, values)),
        textFile("source/dark.svg", renderWallpaperSvg(Variant.Dark, values)),
    ];
}

export const WALLPAPER_RENDERS = Object.freeze([
    { source: "source/light.svg", target: RenderedImage.WallpaperLight },
    { source: "source/dark.svg", target: RenderedImage.WallpaperDark },
]);
