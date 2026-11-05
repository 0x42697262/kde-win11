import { AURORAE_ANIMATION_MILLISECONDS, AURORAE_EXPLICIT_SPACER, ButtonState, CAPTION_FLUENT_GLYPHS, CaptionButton, DecorationState, OPAQUE_ALPHA_CHANNEL, RESTORE_BACK_OFFSET } from "../catalog/decoration.mjs";
import { IconStyle, TitleAlignment } from "../catalog/enums.mjs";
import { PROJECT } from "../catalog/packages.mjs";
import { FRAME_CENTER_SIZE, SHEET_GAP } from "../catalog/units.mjs";
import { flatten, toRgbTriplet } from "../theme/color.mjs";
import { buildPalette, colorOf } from "../theme/palette.mjs";
import { element, invisibleRect, paintAttributes, svgDocument } from "../svg/document.mjs";
import { shadowAround } from "../svg/frame.mjs";
import { insetRect, rectPath, roundedRectCellPath, roundedRectPath } from "../svg/shapes.mjs";
import { formatNumber } from "../numbers.mjs";
import { renderIni } from "./ini.mjs";
import { textFile } from "./files.mjs";

/** @typedef {import("./files.mjs").OutputFile} OutputFile */
/** @typedef {import("../settings/document.mjs").SettingsValues} SettingsValues */
/** @typedef {import("../theme/palette.mjs").Palette} Palette */
/** @typedef {import("../catalog/tokens.mjs").ColorToken} ColorToken */
/** @typedef {import("../svg/document.mjs").Rect} Rect */
/** @typedef {import("../svg/shapes.mjs").Radii} Radii */
/** @typedef {import("../svg/shapes.mjs").CornerName} CornerName */
/** @typedef {import("../font/glyphs.mjs").GlyphSource} GlyphSource */
/** @typedef {{ left: number, top: number, right: number, bottom: number }} Sides */
/** @typedef {{ titlebar: ColorToken, stroke: ColorToken, shadow: ColorToken | null, padding: Sides, border: number, radius: number }} DecorationLook */

const CELL_NAMES = Object.freeze([
    { name: "topleft", column: 0, row: 0, corner: /** @type {CornerName} */ ("topleft") },
    { name: "top", column: 1, row: 0, corner: null },
    { name: "topright", column: 2, row: 0, corner: /** @type {CornerName} */ ("topright") },
    { name: "left", column: 0, row: 1, corner: null },
    { name: "center", column: 1, row: 1, corner: null },
    { name: "right", column: 2, row: 1, corner: null },
    { name: "bottomleft", column: 0, row: 2, corner: /** @type {CornerName} */ ("bottomleft") },
    { name: "bottom", column: 1, row: 2, corner: null },
    { name: "bottomright", column: 2, row: 2, corner: /** @type {CornerName} */ ("bottomright") },
]);

/**
 * @param {ColorToken} token
 * @returns {string}
 */
function rgba(token) {
    return `${toRgbTriplet(token)},${Math.round(token.alpha * OPAQUE_ALPHA_CHANNEL)}`;
}

/**
 * @param {string} prefix
 * @param {DecorationLook} look
 * @param {number} originY
 * @returns {{ body: string, defs: string, height: number, width: number }}
 */
function renderDecorationFrame(prefix, look, originY) {
    const { padding, radius, border } = look;
    const cornerSize = Math.max(radius, border, 1);
    const widths = [padding.left + cornerSize, FRAME_CENTER_SIZE, padding.right + cornerSize];
    const heights = [padding.top + cornerSize, FRAME_CENTER_SIZE, padding.bottom + cornerSize];
    const columns = [SHEET_GAP, SHEET_GAP + (widths[0] ?? 0), SHEET_GAP + (widths[0] ?? 0) + FRAME_CENTER_SIZE];
    const rows = [originY, originY + (heights[0] ?? 0), originY + (heights[0] ?? 0) + FRAME_CENTER_SIZE];
    const width = widths.reduce((sum, value) => sum + value, 0);
    const height = heights.reduce((sum, value) => sum + value, 0);
    const outer = insetRect({ x: SHEET_GAP, y: originY, width, height }, padding);
    /** @type {Radii} */
    const radii = { topLeft: radius, topRight: radius, bottomRight: 0, bottomLeft: 0 };
    const inner = insetRect(outer, { left: border, top: border, right: border, bottom: border });
    /** @type {Radii} */
    const innerRadii = { topLeft: Math.max(radius - border, 0), topRight: Math.max(radius - border, 0), bottomRight: 0, bottomLeft: 0 };
    /** @type {string[]} */
    const defs = [];
    const body = CELL_NAMES.map((cell) => {
        const cellRect = { x: columns[cell.column] ?? 0, y: rows[cell.row] ?? 0, width: widths[cell.column] ?? 0, height: heights[cell.row] ?? 0 };
        const parts = [invisibleRect(cellRect)];
        if (look.shadow) {
            const shadow = shadowAround(`${prefix}-${cell.name}-shadow`, cellRect, outer, radii, padding, look.shadow);
            parts.push(shadow.body);
            defs.push(shadow.defs);
        }
        const fillPath = roundedRectCellPath(border > 0 ? inner : outer, border > 0 ? innerRadii : radii, cellRect, cell.corner);
        if (fillPath !== "") {
            parts.push(element("path", Object.assign({ d: fillPath }, paintAttributes({ color: look.titlebar }))));
        }
        if (border > 0) {
            const outerPath = roundedRectCellPath(outer, radii, cellRect, cell.corner);
            const innerPath = roundedRectCellPath(inner, innerRadii, cellRect, cell.corner);
            if (outerPath !== "" && outerPath !== innerPath) {
                parts.push(element("path", Object.assign({ d: `${outerPath}${innerPath}`, "fill-rule": "evenodd" }, paintAttributes({ color: look.stroke }))));
            }
        }
        return element("g", { id: `${prefix}-${cell.name}` }, parts.join(""));
    }).join("\n");
    return { body, defs: defs.join(""), height, width };
}

/**
 * @param {Palette} palette
 * @param {SettingsValues} values
 * @returns {string}
 */
function renderDecorationSvg(palette, values) {
    const titlebar = values.metrics.titlebar;
    const padding = { left: titlebar.shadowLeft, top: titlebar.shadowTop, right: titlebar.shadowRight, bottom: titlebar.shadowBottom };
    const none = { left: 0, top: 0, right: 0, bottom: 0 };
    const shadow = colorOf(palette, "shadow");
    const looks = [
        { prefix: DecorationState.Active, look: { titlebar: colorOf(palette, "titlebar"), stroke: colorOf(palette, "windowStroke"), shadow, padding, border: titlebar.border, radius: titlebar.radius } },
        { prefix: DecorationState.Inactive, look: { titlebar: colorOf(palette, "titlebarInactive"), stroke: colorOf(palette, "windowStroke"), shadow: { hex: shadow.hex, alpha: shadow.alpha * 0.5 }, padding, border: titlebar.border, radius: titlebar.radius } },
        { prefix: DecorationState.Maximized, look: { titlebar: colorOf(palette, "titlebar"), stroke: colorOf(palette, "windowStroke"), shadow: null, padding: none, border: 0, radius: 0 } },
        { prefix: DecorationState.MaximizedInactive, look: { titlebar: colorOf(palette, "titlebarInactive"), stroke: colorOf(palette, "windowStroke"), shadow: null, padding: none, border: 0, radius: 0 } },
    ];
    let top = SHEET_GAP;
    let width = 0;
    /** @type {string[]} */
    const bodies = [];
    /** @type {string[]} */
    const defs = [];
    looks.forEach((entry) => {
        const frame = renderDecorationFrame(entry.prefix, entry.look, top);
        bodies.push(frame.body);
        defs.push(frame.defs);
        top += frame.height + SHEET_GAP;
        width = Math.max(width, frame.width);
    });
    return svgDocument(width + SHEET_GAP * 2, top, bodies.join("\n"), defs.join(""));
}

/**
 * @param {number} centerX
 * @param {number} centerY
 * @param {number} size
 * @param {number} stroke
 * @returns {Record<string, string>}
 */
function captionGlyphPaths(centerX, centerY, size, stroke) {
    const half = size / 2;
    const left = centerX - half;
    const top = centerY - half;
    const square = { x: left, y: top, width: size, height: size };
    const squareInner = insetRect(square, { left: stroke, top: stroke, right: stroke, bottom: stroke });
    const front = { x: left, y: top + RESTORE_BACK_OFFSET, width: size - RESTORE_BACK_OFFSET, height: size - RESTORE_BACK_OFFSET };
    const frontInner = insetRect(front, { left: stroke, top: stroke, right: stroke, bottom: stroke });
    const backTop = `M${formatNumber(left + RESTORE_BACK_OFFSET)} ${formatNumber(top)}H${formatNumber(left + size)}V${formatNumber(top + size - RESTORE_BACK_OFFSET)}H${formatNumber(left + size - stroke)}V${formatNumber(top + stroke)}H${formatNumber(left + RESTORE_BACK_OFFSET)}Z`;
    /**
     * @param {number} fromX
     * @param {number} fromY
     * @param {number} toX
     * @param {number} toY
     * @returns {string}
     */
    const line = (fromX, fromY, toX, toY) => {
        const length = Math.hypot(toX - fromX, toY - fromY);
        const offsetX = ((toY - fromY) / length) * (stroke / 2);
        const offsetY = ((fromX - toX) / length) * (stroke / 2);
        return `M${formatNumber(fromX + offsetX)} ${formatNumber(fromY + offsetY)}L${formatNumber(toX + offsetX)} ${formatNumber(toY + offsetY)}L${formatNumber(toX - offsetX)} ${formatNumber(toY - offsetY)}L${formatNumber(fromX - offsetX)} ${formatNumber(fromY - offsetY)}Z`;
    };
    return {
        [CaptionButton.Minimize]: rectPath({ x: left, y: centerY - stroke / 2, width: size, height: stroke }),
        [CaptionButton.Maximize]: `${roundedRectPath(square, { topLeft: stroke, topRight: stroke, bottomRight: stroke, bottomLeft: stroke })}${rectPath(squareInner)}`,
        [CaptionButton.Restore]: `${rectPath(front)}${rectPath(frontInner)}${backTop}`,
        [CaptionButton.Close]: `${line(left, top, left + size, top + size)}${line(left + size, top, left, top + size)}`,
    };
}

/**
 * @param {string} button
 * @param {Palette} palette
 * @param {SettingsValues} values
 * @param {GlyphSource} glyphs
 * @returns {string}
 */
function renderButtonSvg(button, palette, values, glyphs) {
    const titlebar = values.metrics.titlebar;
    const width = titlebar.buttonWidth;
    const height = titlebar.height;
    const isClose = button === CaptionButton.Close;
    const text = colorOf(palette, "titleText");
    const textInactive = colorOf(palette, "titleTextInactive");
    const disabled = colorOf(palette, "textDisabled");
    /** @type {Record<string, { background: ColorToken | null, glyph: ColorToken }>} */
    const states = {
        [ButtonState.Active]: { background: null, glyph: text },
        [ButtonState.Inactive]: { background: null, glyph: textInactive },
        [ButtonState.Hover]: { background: isClose ? colorOf(palette, "closeHover") : colorOf(palette, "captionHover"), glyph: isClose ? colorOf(palette, "closeGlyphHover") : text },
        [ButtonState.HoverInactive]: { background: isClose ? colorOf(palette, "closeHover") : colorOf(palette, "captionHover"), glyph: isClose ? colorOf(palette, "closeGlyphHover") : text },
        [ButtonState.Pressed]: { background: isClose ? colorOf(palette, "closePressed") : colorOf(palette, "captionPressed"), glyph: isClose ? colorOf(palette, "closeGlyphHover") : text },
        [ButtonState.PressedInactive]: { background: isClose ? colorOf(palette, "closePressed") : colorOf(palette, "captionPressed"), glyph: isClose ? colorOf(palette, "closeGlyphHover") : textInactive },
        [ButtonState.Deactivated]: { background: null, glyph: disabled },
        [ButtonState.DeactivatedInactive]: { background: null, glyph: disabled },
    };
    const backgroundRadii = { topLeft: 0, topRight: isClose ? titlebar.radius : 0, bottomRight: 0, bottomLeft: 0 };
    const body = Object.values(ButtonState).map((state, index) => {
        const originY = SHEET_GAP + index * (height + SHEET_GAP);
        const rect = { x: SHEET_GAP, y: originY, width, height };
        const look = states[state] ?? { background: null, glyph: text };
        const centerX = SHEET_GAP + width / 2;
        const centerY = originY + height / 2;
        const builtIn = captionGlyphPaths(centerX, centerY, titlebar.glyphSize, titlebar.glyphStroke)[button];
        const fluentName = CAPTION_FLUENT_GLYPHS[/** @type {keyof typeof CAPTION_FLUENT_GLYPHS} */ (button)];
        const glyphPath = builtIn ?? glyphs.path(fluentName ?? "", IconStyle.Regular, { x: centerX - titlebar.glyphSize / 2, y: centerY - titlebar.glyphSize / 2, size: titlebar.glyphSize });
        const parts = [invisibleRect(rect)];
        if (look.background) {
            parts.push(element("path", Object.assign({ d: roundedRectPath(rect, backgroundRadii) }, paintAttributes({ color: look.background }))));
        }
        parts.push(element("path", Object.assign({ d: glyphPath, "fill-rule": button === CaptionButton.Restore ? "evenodd" : undefined }, paintAttributes({ color: look.glyph }))));
        return element("g", { id: `${state}-center` }, parts.join(""));
    }).join("\n");
    const count = Object.values(ButtonState).length;
    return svgDocument(width + SHEET_GAP * 2, SHEET_GAP + count * (height + SHEET_GAP), body);
}

/**
 * @param {string} variant
 * @param {SettingsValues} values
 * @param {GlyphSource} glyphs
 * @param {{ id: string, name: string }} identity
 * @returns {OutputFile[]}
 */
export function renderAurorae(variant, values, glyphs, identity) {
    const palette = buildPalette(variant, values);
    const titlebar = values.metrics.titlebar;
    const window = colorOf(palette, "window");
    const rc = renderIni([
        {
            path: ["General"],
            entries: [
                ["ActiveTextColor", rgba(flatten(colorOf(palette, "titleText"), window))],
                ["InactiveTextColor", rgba(flatten(colorOf(palette, "titleTextInactive"), window))],
                ["TitleAlignment", values.titlebar.alignment === TitleAlignment.Center ? "Center" : "Left"],
                ["TitleVerticalAlignment", "Center"],
                ["Animation", AURORAE_ANIMATION_MILLISECONDS],
                ["UseTextShadow", false],
                ["HaloActive", false],
                ["HaloInactive", false],
            ],
        },
        {
            path: ["Layout"],
            entries: [
                ["BorderLeft", titlebar.border],
                ["BorderRight", titlebar.border],
                ["BorderBottom", titlebar.border],
                ["TitleEdgeTop", 0],
                ["TitleEdgeBottom", 0],
                ["TitleEdgeLeft", titlebar.titleEdgeLeft],
                ["TitleEdgeRight", 0],
                ["TitleEdgeTopMaximized", 0],
                ["TitleEdgeBottomMaximized", 0],
                ["TitleEdgeLeftMaximized", titlebar.titleEdgeLeft],
                ["TitleEdgeRightMaximized", 0],
                ["TitleBorderLeft", titlebar.titleEdgeLeft],
                ["TitleBorderRight", titlebar.titleEdgeLeft],
                ["TitleHeight", titlebar.height],
                ["ButtonWidth", titlebar.buttonWidth],
                ["ButtonHeight", titlebar.height],
                ["ButtonSpacing", 0],
                ["ButtonMarginTop", 0],
                ["ButtonMarginTopMaximized", 0],
                ["ExplicitButtonSpacer", AURORAE_EXPLICIT_SPACER],
                ["PaddingLeft", titlebar.shadowLeft],
                ["PaddingRight", titlebar.shadowRight],
                ["PaddingTop", titlebar.shadowTop],
                ["PaddingBottom", titlebar.shadowBottom],
            ],
        },
    ]);
    const metadata = renderIni([{
        path: ["Desktop Entry"],
        entries: [
            ["Name", identity.name],
            ["X-KDE-PluginInfo-Author", PROJECT.author],
            ["X-KDE-PluginInfo-Name", identity.id],
            ["X-KDE-PluginInfo-Version", PROJECT.version],
            ["X-KDE-PluginInfo-Website", PROJECT.website],
            ["X-KDE-PluginInfo-License", PROJECT.licenseShort],
            ["X-KDE-PluginInfo-EnabledByDefault", true],
        ],
    }]);
    return [
        textFile("metadata.desktop", metadata),
        textFile(`${identity.id}rc`, rc),
        textFile("decoration.svg", renderDecorationSvg(palette, values)),
        ...Object.values(CaptionButton).map((button) => textFile(`${button}.svg`, renderButtonSvg(button, palette, values, glyphs))),
    ];
}
