import { PANEL_LOCATIONS, PanelLocation, SURFACE_DENSITIES, SurfaceDensity } from "../catalog/enums.mjs";
import { DESKTOP_THEME_IDS } from "../catalog/packages.mjs";
import { PACKAGE_TEXT } from "../catalog/packageText.mjs";
import { COLOR_SCHEME_CLASS, FRAME_CENTER_SIZE, PLASMA_API_MINIMUM_VERSION } from "../catalog/units.mjs";
import { buildPalette, colorOf } from "../theme/palette.mjs";
import { colorSchemeStyle, svgDocument } from "../svg/document.mjs";
import { composeSheet, frameItem, maskOf, shadowItem } from "../svg/frame.mjs";
import { uniformRadii } from "../svg/shapes.mjs";
import { kPlugin, renderJson } from "./metadata.mjs";
import { textFile } from "./files.mjs";

/** @typedef {import("./files.mjs").OutputFile} OutputFile */
/** @typedef {import("../settings/document.mjs").SettingsValues} SettingsValues */
/** @typedef {import("../theme/palette.mjs").Palette} Palette */
/** @typedef {import("../catalog/tokens.mjs").ColorToken} ColorToken */
/** @typedef {import("../svg/frame.mjs").FrameSpec} FrameSpec */
/** @typedef {import("../svg/frame.mjs").SheetItem} SheetItem */
/** @typedef {import("../svg/frame.mjs").Sides} Sides */
/** @typedef {{ radius: number, stroke: number, padding: number, shadowSize: number, shadowOffset: number }} SurfaceMetrics */

const TASK_STATES = Object.freeze(["normal", "minimized", "hover", "focus", "attention"]);
const VIEW_ITEM_STATES = Object.freeze(["normal", "hover", "selected", "selected+hover"]);

/**
 * @param {number} value
 * @returns {Sides}
 */
function allSides(value) {
    return { left: value, top: value, right: value, bottom: value };
}

/**
 * @param {ColorToken} color
 * @param {string} density
 * @param {ColorToken} translucent
 * @returns {ColorToken}
 */
function densityColor(color, density, translucent) {
    if (density === SurfaceDensity.Opaque) {
        return { hex: color.hex, alpha: 1 };
    }
    return density === SurfaceDensity.Translucent ? translucent : color;
}

/**
 * @param {readonly SheetItem[]} items
 * @param {Palette} palette
 * @returns {string}
 */
function sheetDocument(items, palette) {
    const sheet = composeSheet(items);
    const style = colorSchemeStyle({
        [COLOR_SCHEME_CLASS.Highlight]: colorOf(palette, "accentForMode"),
        [COLOR_SCHEME_CLASS.Text]: colorOf(palette, "textPrimary"),
        [COLOR_SCHEME_CLASS.Background]: colorOf(palette, "window"),
    });
    return svgDocument(sheet.width, sheet.height, sheet.body, style + sheet.defs);
}

/**
 * @param {SurfaceMetrics} metrics
 * @param {ColorToken} fill
 * @param {Palette} palette
 * @returns {SheetItem[]}
 */
function surfaceItems(metrics, fill, palette) {
    const cell = Math.max(metrics.radius, metrics.stroke, 1);
    /** @type {FrameSpec} */
    const spec = {
        prefix: "",
        cells: allSides(cell),
        inset: allSides(0),
        radii: uniformRadii(metrics.radius),
        fill: { color: fill },
        stroke: { width: metrics.stroke, paint: { color: colorOf(palette, "surfaceStroke") }, sides: { left: true, top: true, right: true, bottom: true } },
        hints: allSides(metrics.padding),
    };
    const extents = {
        left: metrics.shadowSize,
        right: metrics.shadowSize,
        top: Math.max(metrics.shadowSize - metrics.shadowOffset, 1),
        bottom: metrics.shadowSize + metrics.shadowOffset,
    };
    return [frameItem(spec), frameItem(maskOf(spec)), shadowItem({ prefix: "", extents, radius: metrics.radius, color: colorOf(palette, "shadow") })];
}

/**
 * @param {string} location
 * @returns {{ left: boolean, top: boolean, right: boolean, bottom: boolean }}
 */
function panelStrokeSides(location) {
    return {
        left: location === PanelLocation.East,
        top: location === PanelLocation.South,
        right: location === PanelLocation.West,
        bottom: location === PanelLocation.North,
    };
}

/**
 * @param {SettingsValues} values
 * @param {ColorToken} fill
 * @param {Palette} palette
 * @returns {SheetItem[]}
 */
function panelItems(values, fill, palette) {
    const panel = values.metrics.panel;
    const cell = Math.max(panel.radius, panel.stroke, 1);
    const rounded = panel.radius > 0;
    const prefixes = ["", ...PANEL_LOCATIONS];
    return prefixes.flatMap((prefix) => {
        /** @type {FrameSpec} */
        const spec = {
            prefix,
            cells: allSides(cell),
            inset: allSides(0),
            radii: uniformRadii(panel.radius),
            fill: { color: fill },
            stroke: {
                width: panel.stroke,
                paint: { color: colorOf(palette, "surfaceStroke") },
                sides: prefix === "" || rounded ? { left: true, top: true, right: true, bottom: true } : panelStrokeSides(prefix),
            },
        };
        return [frameItem(spec), frameItem(maskOf(spec))];
    });
}

/**
 * @param {SettingsValues} values
 * @param {Palette} palette
 * @returns {SheetItem[]}
 */
function taskItems(values, palette) {
    const panel = values.metrics.panel;
    const edge = Math.max(panel.taskMargin + panel.taskRadius, panel.taskMargin + panel.taskIndicatorThickness + 1);
    const indicator = { color: colorOf(palette, "taskIndicator") };
    const accent = { color: colorOf(palette, "accentForMode"), colorClass: COLOR_SCHEME_CLASS.Highlight };
    /** @type {Record<string, { fill?: ColorToken, indicator: import("../svg/document.mjs").Paint, inset: number }>} */
    const states = {
        normal: { indicator, inset: panel.taskIndicatorInset },
        minimized: { indicator, inset: panel.taskIndicatorInset },
        hover: { fill: colorOf(palette, "subtleFillHover"), indicator, inset: panel.taskIndicatorInset },
        focus: { fill: colorOf(palette, "subtleFillHover"), indicator: accent, inset: panel.taskFocusIndicatorInset },
        attention: { fill: colorOf(palette, "taskAttention"), indicator: { color: colorOf(palette, "neutral") }, inset: panel.taskIndicatorInset },
    };
    return TASK_STATES.map((prefix) => {
        const state = states[prefix] ?? { indicator, inset: panel.taskIndicatorInset };
        const cellWidth = Math.max(state.inset, panel.taskMargin + panel.taskRadius);
        const cells = { left: cellWidth, top: edge, right: cellWidth, bottom: edge };
        return frameItem({
            prefix,
            cells,
            inset: allSides(panel.taskMargin),
            radii: uniformRadii(panel.taskRadius),
            fill: state.fill ? { color: state.fill } : undefined,
            overlays: [{
                rect: { x: cellWidth, y: edge * 2 + FRAME_CENTER_SIZE - panel.taskMargin - panel.taskIndicatorThickness - 1, width: FRAME_CENTER_SIZE, height: panel.taskIndicatorThickness },
                paint: state.indicator,
            }],
            hints: allSides(panel.taskPadding),
        });
    });
}

/**
 * @param {SettingsValues} values
 * @param {Palette} palette
 * @returns {SheetItem[]}
 */
function viewItemItems(values, palette) {
    const item = values.metrics.listItem;
    const vertical = Math.max(item.selectionPillInset, item.radius);
    const horizontal = Math.max(item.radius, item.selectionPillWidth);
    const accent = { color: colorOf(palette, "accentForMode"), colorClass: COLOR_SCHEME_CLASS.Highlight };
    const pill = [{ rect: { x: 0, y: vertical, width: item.selectionPillWidth, height: FRAME_CENTER_SIZE }, paint: accent }];
    /** @type {Record<string, { fill?: ColorToken, overlays: typeof pill }>} */
    const states = {
        normal: { overlays: [] },
        hover: { fill: colorOf(palette, "subtleFillHover"), overlays: [] },
        selected: { fill: colorOf(palette, "subtleFillHover"), overlays: pill },
        "selected+hover": { fill: colorOf(palette, "subtleFillPressed"), overlays: pill },
    };
    return VIEW_ITEM_STATES.map((prefix) => {
        const state = states[prefix] ?? { overlays: [] };
        return frameItem({
            prefix,
            cells: { left: horizontal, top: vertical, right: horizontal, bottom: vertical },
            inset: allSides(0),
            radii: uniformRadii(item.radius),
            fill: state.fill ? { color: state.fill } : undefined,
            overlays: state.overlays,
            hints: allSides(item.padding),
        });
    });
}

/**
 * @param {string} variant
 * @param {SettingsValues} values
 * @returns {OutputFile[]}
 */
export function renderDesktopTheme(variant, values) {
    const palette = buildPalette(variant, values);
    const blur = values.metrics.blur;
    const metadata = {
        AdaptiveTransparency: { enabled: true },
        BlurBehindEffect: { enabled: true },
        ContrastEffect: { contrast: blur.contrast, enabled: true, intensity: blur.intensity, saturation: blur.saturation },
        KPlugin: kPlugin({
            id: DESKTOP_THEME_IDS[/** @type {"light" | "dark"} */ (variant)],
            name: PACKAGE_TEXT.desktopThemeName[/** @type {"light" | "dark"} */ (variant)],
            description: PACKAGE_TEXT.desktopThemeDescription,
        }),
        "X-Plasma-API-Minimum-Version": PLASMA_API_MINIMUM_VERSION,
    };
    /** @type {OutputFile[]} */
    const files = [textFile("metadata.json", renderJson(metadata))];
    SURFACE_DENSITIES.forEach((density) => {
        const directory = density === SurfaceDensity.Regular ? "" : `${density}/`;
        /**
         * @param {string} key
         * @returns {ColorToken}
         */
        const surface = (key) => densityColor(colorOf(palette, key), density, colorOf(palette, `${key}Translucent`));
        const tooltipColor = densityColor({ hex: colorOf(palette, "tooltip").hex, alpha: colorOf(palette, "flyout").alpha }, density, { hex: colorOf(palette, "tooltip").hex, alpha: colorOf(palette, "flyoutTranslucent").alpha });
        files.push(
            textFile(`${directory}dialogs/background.svg`, sheetDocument(surfaceItems(values.metrics.flyout, surface("flyout"), palette), palette)),
            textFile(`${directory}widgets/background.svg`, sheetDocument(surfaceItems(values.metrics.widget, surface("widget"), palette), palette)),
            textFile(`${directory}widgets/tooltip.svg`, sheetDocument(surfaceItems(values.metrics.tooltip, tooltipColor, palette), palette)),
            textFile(`${directory}widgets/panel-background.svg`, sheetDocument(panelItems(values, surface("taskbar"), palette), palette)),
        );
    });
    files.push(
        textFile("widgets/tasks.svg", sheetDocument(taskItems(values, palette), palette)),
        textFile("widgets/viewitem.svg", sheetDocument(viewItemItems(values, palette), palette)),
    );
    return files;
}
