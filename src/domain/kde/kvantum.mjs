import { KVANTUM_ARROW_FAMILIES, KVANTUM_ARROW_GLYPHS, KVANTUM_BAR_HEIGHT, KVANTUM_CHECK_BOX, KVANTUM_CHECK_GLYPH_INSET, KVANTUM_FOCUS_THICKNESS, KVANTUM_FRAMES, KVANTUM_GENERAL, KVANTUM_GLYPHS, KVANTUM_HACKS, KVANTUM_INDICATOR_BOX, KVANTUM_PILL_WIDTH, KVANTUM_RADIO_DOT_RATIO, KVANTUM_STATE_TEXT, KVANTUM_STROKE, KVANTUM_TEXT_MARGIN, KvantumRadius } from "../catalog/kvantum.mjs";
import { IconStyle } from "../catalog/enums.mjs";
import { KVANTUM_IDS, PROJECT } from "../catalog/packages.mjs";
import { PACKAGE_TEXT } from "../catalog/packageText.mjs";
import { FRAME_CENTER_SIZE } from "../catalog/units.mjs";
import { flatten } from "../theme/color.mjs";
import { buildPalette, colorOf } from "../theme/palette.mjs";
import { element, invisibleRect, paintAttributes, svgDocument } from "../svg/document.mjs";
import { composeSheet, frameItem, shadowItem } from "../svg/frame.mjs";
import { roundedRectPath, uniformRadii } from "../svg/shapes.mjs";
import { glyphInBox } from "./iconArtwork.mjs";
import { renderIni } from "./ini.mjs";
import { textFile } from "./files.mjs";

/** @typedef {import("./files.mjs").OutputFile} OutputFile */
/** @typedef {import("../settings/document.mjs").SettingsValues} SettingsValues */
/** @typedef {import("../font/glyphs.mjs").GlyphSource} GlyphSource */
/** @typedef {import("../theme/palette.mjs").Palette} Palette */
/** @typedef {import("../catalog/tokens.mjs").ColorToken} ColorToken */
/** @typedef {import("../svg/frame.mjs").SheetItem} SheetItem */
/** @typedef {import("../catalog/kvantum.mjs").KvantumLook} KvantumLook */
/** @typedef {import("./ini.mjs").IniGroup} IniGroup */

const PILL_CELL = 3;

/**
 * @param {string} radius
 * @param {SettingsValues} values
 * @returns {number}
 */
function radiusOf(radius, values) {
    const controls = values.metrics.controls;
    if (radius === KvantumRadius.Menu) {
        return controls.menuRadius;
    }
    return radius === KvantumRadius.Pill ? PILL_CELL : controls.radius;
}

/**
 * @param {string} prefix
 * @param {number} cell
 * @param {KvantumLook} look
 * @param {Palette} palette
 * @returns {SheetItem}
 */
function kvantumFrame(prefix, cell, look, palette) {
    const width = cell * 2 + FRAME_CENTER_SIZE;
    /** @type {import("../svg/frame.mjs").Overlay[]} */
    const overlays = [];
    if (look.bottom) {
        overlays.push({ rect: { x: cell, y: width - KVANTUM_STROKE, width: FRAME_CENTER_SIZE, height: KVANTUM_STROKE }, paint: { color: colorOf(palette, look.bottom) } });
    }
    if (look.bar) {
        overlays.push({ rect: { x: cell, y: width - KVANTUM_BAR_HEIGHT, width: FRAME_CENTER_SIZE, height: KVANTUM_BAR_HEIGHT }, paint: { color: colorOf(palette, look.bar) } });
    }
    if (look.pill) {
        overlays.push({ rect: { x: 0, y: cell, width: Math.min(KVANTUM_PILL_WIDTH, cell), height: FRAME_CENTER_SIZE }, paint: { color: colorOf(palette, look.pill) } });
    }
    const item = frameItem({
        prefix,
        cells: { left: cell, top: cell, right: cell, bottom: cell },
        inset: { left: 0, top: 0, right: 0, bottom: 0 },
        radii: uniformRadii(cell),
        fill: look.fill ? { color: colorOf(palette, look.fill) } : undefined,
        stroke: look.stroke ? { width: KVANTUM_STROKE, paint: { color: colorOf(palette, look.stroke) }, sides: { left: true, top: true, right: true, bottom: true } } : undefined,
        overlays,
    });
    return {
        width: item.width,
        height: item.height,
        render: (originX, originY) => {
            const rendered = item.render(originX, originY);
            return { body: rendered.body.replace(`id="${prefix}-center"`, `id="${prefix}"`), defs: rendered.defs };
        },
    };
}

/**
 * @param {string} id
 * @param {number} size
 * @param {(originX: number, originY: number) => string} draw
 * @returns {SheetItem}
 */
function glyphItem(id, size, draw) {
    return {
        width: size,
        height: size,
        render: (originX, originY) => ({ body: element("g", { id }, invisibleRect({ x: originX, y: originY, width: size, height: size }) + draw(originX, originY)), defs: "" }),
    };
}

/**
 * @param {GlyphSource} glyphs
 * @param {string} glyph
 * @param {ColorToken} color
 * @param {number} originX
 * @param {number} originY
 * @param {number} size
 * @returns {string}
 */
function glyphPath(glyphs, glyph, color, originX, originY, size) {
    const [base, nominal] = [glyph.slice(0, glyph.lastIndexOf("_")), Number(glyph.slice(glyph.lastIndexOf("_") + 1))];
    const drawn = glyphs.has(glyph, IconStyle.Regular) ? glyphs.path(glyph, IconStyle.Regular, { x: originX + (size - nominal) / 2, y: originY + (size - nominal) / 2, size: nominal }) : glyphInBox(glyphs, base, IconStyle.Regular, { x: originX, y: originY, size });
    return element("path", Object.assign({ d: drawn }, paintAttributes({ color })));
}

/**
 * @param {Palette} palette
 * @param {GlyphSource} glyphs
 * @returns {SheetItem[]}
 */
function indicatorItems(palette, glyphs) {
    /** @type {SheetItem[]} */
    const items = [];
    Object.keys(KVANTUM_STATE_TEXT).forEach((state) => {
        const color = colorOf(palette, KVANTUM_STATE_TEXT[/** @type {keyof typeof KVANTUM_STATE_TEXT} */ (state)]);
        KVANTUM_ARROW_FAMILIES.forEach((family) => {
            Object.keys(KVANTUM_ARROW_GLYPHS).forEach((direction) => {
                const glyph = KVANTUM_ARROW_GLYPHS[/** @type {keyof typeof KVANTUM_ARROW_GLYPHS} */ (direction)];
                items.push(glyphItem(`${family}-${direction}-${state}`, KVANTUM_INDICATOR_BOX, (originX, originY) => glyphPath(glyphs, glyph, color, originX, originY, KVANTUM_INDICATOR_BOX)));
            });
        });
        items.push(glyphItem(`tab-close-${state}`, KVANTUM_INDICATOR_BOX, (originX, originY) => glyphPath(glyphs, KVANTUM_GLYPHS.close, color, originX, originY, KVANTUM_INDICATOR_BOX)));
    });
    [["normal", "textSecondary"], ["focused", "textPrimary"]].forEach(([state, key]) => {
        const color = colorOf(palette, key ?? "");
        items.push(glyphItem(`menuitem-right-${state}`, KVANTUM_INDICATOR_BOX, (originX, originY) => glyphPath(glyphs, KVANTUM_GLYPHS.submenu, color, originX, originY, KVANTUM_INDICATOR_BOX)));
        items.push(glyphItem(`menuitem-left-${state}`, KVANTUM_INDICATOR_BOX, (originX, originY) => glyphPath(glyphs, KVANTUM_GLYPHS.submenuLeft, color, originX, originY, KVANTUM_INDICATOR_BOX)));
    });
    return items;
}

/**
 * @param {Palette} palette
 * @param {GlyphSource} glyphs
 * @param {SettingsValues} values
 * @returns {SheetItem[]}
 */
function toggleItems(palette, glyphs, values) {
    const box = KVANTUM_CHECK_BOX;
    const radius = values.metrics.controls.radius;
    const accent = colorOf(palette, "accentForMode");
    const onAccent = colorOf(palette, "textOnAccent");
    const text = colorOf(palette, "textPrimary");
    /** @type {SheetItem[]} */
    const items = [];
    /** @type {Record<string, { fill: ColorToken, stroke: ColorToken }>} */
    const unchecked = {
        normal: { fill: colorOf(palette, "controlFill"), stroke: colorOf(palette, "controlStrongStroke") },
        focused: { fill: colorOf(palette, "controlFillHover"), stroke: colorOf(palette, "controlStrongStroke") },
        pressed: { fill: colorOf(palette, "controlFillPressed"), stroke: colorOf(palette, "controlStrongStroke") },
        disabled: { fill: colorOf(palette, "controlFillPressed"), stroke: colorOf(palette, "textDisabled") },
    };
    const inner = box - KVANTUM_STROKE * 2;
    const half = box / 2;
    /**
     * @param {number} originX
     * @param {number} originY
     * @param {number} cornerRadius
     * @param {ColorToken} fill
     * @param {ColorToken | null} stroke
     * @returns {string}
     */
    const shape = (originX, originY, cornerRadius, fill, stroke) => {
        const outer = { x: originX, y: originY, width: box, height: box };
        const innerRect = { x: originX + KVANTUM_STROKE, y: originY + KVANTUM_STROKE, width: inner, height: inner };
        const strokePart = stroke ? element("path", Object.assign({ d: roundedRectPath(outer, uniformRadii(cornerRadius)) + roundedRectPath(innerRect, uniformRadii(Math.max(cornerRadius - KVANTUM_STROKE, 0))), "fill-rule": "evenodd" }, paintAttributes({ color: stroke }))) : "";
        return element("path", Object.assign({ d: roundedRectPath(stroke ? innerRect : outer, uniformRadii(stroke ? Math.max(cornerRadius - KVANTUM_STROKE, 0) : cornerRadius)) }, paintAttributes({ color: fill }))) + strokePart;
    };
    const glyphSize = box - KVANTUM_CHECK_GLYPH_INSET * 2;
    Object.keys(unchecked).forEach((state) => {
        const look = /** @type {{ fill: ColorToken, stroke: ColorToken }} */ (unchecked[state]);
        const checkedFill = state === "disabled" ? colorOf(palette, "textDisabled") : accent;
        const suffix = state;
        [["checkbox", radius], ["radio", half]].forEach(([kind, cornerRadius]) => {
            const name = String(kind);
            const corner = Number(cornerRadius);
            items.push(glyphItem(`${name}-${suffix}`, box, (originX, originY) => shape(originX, originY, corner, look.fill, look.stroke)));
            items.push(glyphItem(`${name}-checked-${suffix}`, box, (originX, originY) => shape(originX, originY, corner, checkedFill, null) + (name === "checkbox"
                ? glyphPath(glyphs, KVANTUM_GLYPHS.check, onAccent, originX + KVANTUM_CHECK_GLYPH_INSET, originY + KVANTUM_CHECK_GLYPH_INSET, glyphSize)
                : element("circle", Object.assign({ cx: originX + half, cy: originY + half, r: box * KVANTUM_RADIO_DOT_RATIO }, paintAttributes({ color: onAccent }))))));
            if (name === "checkbox") {
                items.push(glyphItem(`checkbox-tristate-${suffix}`, box, (originX, originY) => shape(originX, originY, corner, checkedFill, null) + glyphPath(glyphs, KVANTUM_GLYPHS.tristate, onAccent, originX + KVANTUM_CHECK_GLYPH_INSET, originY + KVANTUM_CHECK_GLYPH_INSET, glyphSize)));
            }
        });
    });
    items.push(glyphItem("button-default-indicator", KVANTUM_INDICATOR_BOX, () => ""));
    ["normal", "focused", "disabled"].forEach((state) => {
        const color = state === "disabled" ? colorOf(palette, "textDisabled") : text;
        items.push(glyphItem(`menu-checkbox-${state}`, KVANTUM_INDICATOR_BOX, () => ""));
        items.push(glyphItem(`menu-radio-${state}`, KVANTUM_INDICATOR_BOX, () => ""));
        items.push(glyphItem(`menu-checkbox-checked-${state}`, KVANTUM_INDICATOR_BOX, (originX, originY) => glyphPath(glyphs, KVANTUM_GLYPHS.check, color, originX, originY, KVANTUM_INDICATOR_BOX)));
        items.push(glyphItem(`menu-checkbox-tristate-${state}`, KVANTUM_INDICATOR_BOX, (originX, originY) => glyphPath(glyphs, KVANTUM_GLYPHS.tristate, color, originX, originY, KVANTUM_INDICATOR_BOX)));
        items.push(glyphItem(`menu-radio-checked-${state}`, KVANTUM_INDICATOR_BOX, (originX, originY) => element("circle", Object.assign({ cx: originX + KVANTUM_INDICATOR_BOX / 2, cy: originY + KVANTUM_INDICATOR_BOX / 2, r: KVANTUM_INDICATOR_BOX * KVANTUM_RADIO_DOT_RATIO }, paintAttributes({ color })))));
    });
    const thumb = values.metrics.controls.sliderHandle;
    const thumbHalf = thumb / 2;
    ["normal", "focused", "pressed", "disabled"].forEach((state) => {
        const dot = state === "disabled" ? colorOf(palette, "textDisabled") : accent;
        const dotRatio = state === "focused" ? KVANTUM_RADIO_DOT_RATIO + KVANTUM_RADIO_DOT_RATIO / (1 + 2) : state === "pressed" ? KVANTUM_RADIO_DOT_RATIO - KVANTUM_RADIO_DOT_RATIO / (1 + 2) : KVANTUM_RADIO_DOT_RATIO;
        const draw = (/** @type {number} */ originX, /** @type {number} */ originY) => [
            element("circle", Object.assign({ cx: originX + thumbHalf, cy: originY + thumbHalf, r: thumbHalf }, paintAttributes({ color: colorOf(palette, "controlStroke") }))),
            element("circle", Object.assign({ cx: originX + thumbHalf, cy: originY + thumbHalf, r: thumbHalf - KVANTUM_STROKE }, paintAttributes({ color: flatten(colorOf(palette, "controlFill"), colorOf(palette, "menuSurface")) }))),
            element("circle", Object.assign({ cx: originX + thumbHalf, cy: originY + thumbHalf, r: thumb * dotRatio }, paintAttributes({ color: dot }))),
        ].join("");
        items.push(glyphItem(`slidercursor-${state}`, thumb, draw));
        items.push(glyphItem(`slidercursor-tickless-${state}`, thumb, draw));
    });
    ["focus", "tfocus"].forEach((name) => {
        ["top", "bottom", "left", "right"].forEach((side) => {
            const horizontal = side === "top" || side === "bottom";
            const size = KVANTUM_FOCUS_THICKNESS;
            items.push({
                width: horizontal ? FRAME_CENTER_SIZE : size,
                height: horizontal ? size : FRAME_CENTER_SIZE,
                render: (originX, originY) => ({ body: element("rect", Object.assign({ id: `${name}-${side}`, x: originX, y: originY, width: horizontal ? FRAME_CENTER_SIZE : size, height: horizontal ? size : FRAME_CENTER_SIZE }, paintAttributes({ color: text }))), defs: "" }),
            });
        });
    });
    return items;
}

/**
 * @param {Palette} palette
 * @returns {IniGroup}
 */
function generalColors(palette) {
    const window = colorOf(palette, "window");
    /**
     * @param {string} key
     * @returns {string}
     */
    const hex = (key) => flatten(colorOf(palette, key), window).hex;
    return {
        path: ["GeneralColors"],
        entries: [
            ["window.color", hex("window")],
            ["base.color", hex("view")],
            ["alt.base.color", hex("viewAlternate")],
            ["button.color", hex("button")],
            ["light.color", hex("controlFill")],
            ["mid.light.color", hex("controlFillHover")],
            ["dark.color", hex("controlStrongStroke")],
            ["mid.color", hex("divider")],
            ["highlight.color", hex("accentForMode")],
            ["inactive.highlight.color", hex("accentForMode")],
            ["text.color", hex("textPrimary")],
            ["window.text.color", hex("textPrimary")],
            ["button.text.color", hex("textPrimary")],
            ["disabled.text.color", hex("textDisabled")],
            ["tooltip.text.color", hex("textPrimary")],
            ["highlight.text.color", hex("textOnAccent")],
            ["link.color", hex("link")],
            ["link.visited.color", hex("visited")],
            ["progress.indicator.text.color", hex("textPrimary")],
        ],
    };
}

/**
 * @param {Palette} palette
 * @param {SettingsValues} values
 * @returns {IniGroup[]}
 */
function widgetSections(palette, values) {
    const controls = values.metrics.controls;
    const window = colorOf(palette, "window");
    /**
     * @param {string} key
     * @returns {string}
     */
    const hex = (key) => flatten(colorOf(palette, key), window).hex;
    const text = hex("textPrimary");
    const margin = KVANTUM_TEXT_MARGIN;
    /**
     * @param {number} size
     * @returns {[string, number][]}
     */
    const frameSize = (size) => [["frame.top", size], ["frame.bottom", size], ["frame.left", size], ["frame.right", size]];
    /**
     * @param {string} name
     * @param {(string | number | boolean)[][]} entries
     * @returns {IniGroup}
     */
    const section = (name, entries) => ({ path: [name], entries });
    return [
        section("PanelButtonCommand", [
            ["frame", true], ["frame.element", "button"], ...frameSize(controls.radius), ["interior", true], ["interior.element", "button"],
            ["indicator.size", controls.indicatorSize], ["indicator.element", "b-arrow"],
            ["text.normal.color", text], ["text.focus.color", text], ["text.press.color", hex("textSecondary")], ["text.toggle.color", hex("textOnAccent")],
            ["text.shadow", 0], ["text.margin", 0], ["text.iconspacing", margin.iconSpacing],
            ["text.margin.top", margin.vertical], ["text.margin.bottom", margin.vertical], ["text.margin.left", margin.horizontal], ["text.margin.right", margin.horizontal],
            ["frame.expansion", 0], ["min_width", "+0.3font"],
        ]),
        section("PanelButtonTool", [["inherits", "PanelButtonCommand"]]),
        section("ToolbarButton", [["inherits", "PanelButtonCommand"], ["frame.element", "menuitem"], ["interior.element", "menuitem"], ["text.toggle.color", text], ["focusRectElement", "tfocus"]]),
        section("ToolbarComboBox", [["inherits", "PanelButtonCommand"], ["indicator.element", "b-arrow"]]),
        section("ToolbarLineEdit", [["frame.element", "tlineedit"], ["interior.element", "tlineedit"]]),
        section("Dock", [["inherits", "PanelButtonCommand"], ["frame.element", "dock"], ["interior.element", "dock"], ...frameSize(controls.radius)]),
        section("DockTitle", [["inherits", "PanelButtonCommand"], ["frame", false], ["interior", false], ["text.bold", true]]),
        section("IndicatorSpinBox", [["inherits", "PanelButtonCommand"], ["frame", false], ["interior", false], ["indicator.element", "s-arrow"]]),
        section("RadioButton", [["inherits", "PanelButtonCommand"], ["frame", false], ["interior.element", "radio"], ["text.toggle.color", text]]),
        section("CheckBox", [["inherits", "PanelButtonCommand"], ["frame", false], ["interior.element", "checkbox"], ["text.toggle.color", text]]),
        section("GenericFrame", [["inherits", "PanelButtonCommand"], ["frame", true], ["interior", false], ["frame.element", "common"], ["interior.element", "common"], ...frameSize(controls.radius)]),
        section("LineEdit", [["inherits", "PanelButtonCommand"], ["frame.element", "lineedit"], ["interior.element", "lineedit"], ["indicator.element", "flat-s-arrow"]]),
        section("DropDownButton", [["inherits", "PanelButtonCommand"], ["indicator.element", "b-arrow"]]),
        section("IndicatorArrow", [["indicator.element", "arrow"], ["indicator.size", controls.indicatorSize]]),
        section("ToolboxTab", [["inherits", "PanelButtonCommand"]]),
        section("Tab", [["inherits", "PanelButtonCommand"], ["frame.element", "tab"], ["interior.element", "tab"], ["indicator.element", "tab"], ["text.toggle.color", text], ...frameSize(controls.radius), ["text.margin.left", margin.horizontal * 2], ["text.margin.right", margin.horizontal * 2], ["min_width", "+0.5font"]]),
        section("TabFrame", [["inherits", "PanelButtonCommand"], ["frame.element", "tabframe"], ["interior", false], ...frameSize(controls.menuRadius)]),
        section("TabBarFrame", [["inherits", "GenericFrame"], ["frame", false], ["interior", false]]),
        section("TreeExpander", [["inherits", "PanelButtonCommand"], ["frame", false], ["interior", false], ["indicator.element", "arrow"]]),
        section("HeaderSection", [["inherits", "PanelButtonCommand"], ["frame.element", "header"], ["interior.element", "header"], ["text.toggle.color", text]]),
        section("SizeGrip", [["inherits", "PanelButtonCommand"], ["frame", false], ["interior", false], ["indicator.element", "none"]]),
        section("Toolbar", [["inherits", "PanelButtonCommand"], ["frame", false], ["interior.element", "toolbar"], ["indicator.element", "none"]]),
        section("Slider", [["inherits", "PanelButtonCommand"], ["frame.element", "slider"], ["interior.element", "slider"], ...frameSize(PILL_CELL - 1)]),
        section("SliderCursor", [["inherits", "PanelButtonCommand"], ["frame", false], ["interior.element", "slidercursor"]]),
        section("Progressbar", [["inherits", "PanelButtonCommand"], ["frame.element", "progress"], ["interior.element", "progress"], ...frameSize(PILL_CELL - 1), ["frame.expansion", 0]]),
        section("ProgressbarContents", [["inherits", "PanelButtonCommand"], ["frame.element", "progress-pattern"], ["interior.element", "progress-pattern"], ...frameSize(PILL_CELL - 1), ["frame.expansion", 0]]),
        section("ItemView", [["inherits", "PanelButtonCommand"], ["frame.element", "itemview"], ["interior.element", "itemview"], ...frameSize(controls.radius), ["text.press.color", text], ["text.toggle.color", text], ["min_height", 0]]),
        section("Splitter", [["inherits", "PanelButtonCommand"], ["frame", false], ["interior.element", "splitter"], ["indicator.element", "none"]]),
        section("Scrollbar", [["inherits", "PanelButtonCommand"], ["indicator.element", "arrow"]]),
        section("ScrollbarSlider", [["inherits", "PanelButtonCommand"], ["frame.element", "scrollbarslider"], ["interior.element", "scrollbarslider"], ...frameSize(PILL_CELL), ["indicator.element", "none"]]),
        section("ScrollbarGroove", [["inherits", "PanelButtonCommand"], ["frame", false], ["interior", false]]),
        section("MenuItem", [
            ["inherits", "PanelButtonCommand"], ["frame", true], ["frame.element", "menuitem"], ["interior.element", "menuitem"], ["indicator.element", "menuitem"],
            ["text.normal.color", text], ["text.focus.color", text], ["text.press.color", text], ["text.toggle.color", text],
            ...frameSize(controls.radius), ["text.margin.top", margin.vertical], ["text.margin.bottom", margin.vertical], ["text.margin.left", margin.menuLeft], ["text.margin.right", margin.menuRight],
            ["min_height", controls.menuItemHeight],
        ]),
        section("MenuBar", [["inherits", "PanelButtonCommand"], ["frame", false], ["interior", false]]),
        section("MenuBarItem", [["inherits", "PanelButtonCommand"], ["interior", true], ["interior.element", "menubar"], ["frame.element", "menubar"], ["text.toggle.color", text], ["min_height", 0]]),
        section("TitleBar", [["inherits", "PanelButtonCommand"], ["frame", false], ["interior", false], ["text.bold", true]]),
        section("ComboBox", [["inherits", "PanelButtonCommand"], ["indicator.element", "b-arrow"]]),
        section("Menu", [["inherits", "PanelButtonCommand"], ["frame.element", "menu"], ["interior.element", "menu"], ...frameSize(controls.menuRadius), ["text.normal.color", text]]),
        section("GroupBox", [["inherits", "GenericFrame"], ["frame", true], ["frame.element", "group"], ["interior", true], ["interior.element", "group"], ...frameSize(controls.menuRadius), ["text.bold", true]]),
        section("ToolTip", [["inherits", "GenericFrame"], ["frame.element", "tooltip"], ["interior", true], ["interior.element", "tooltip"], ...frameSize(controls.radius), ["text.margin", margin.vertical]]),
        section("StatusBar", [["inherits", "GenericFrame"], ["frame", false], ["interior", false]]),
        section("Window", [["interior", false]]),
    ];
}

/**
 * @param {string} variant
 * @param {SettingsValues} values
 * @param {GlyphSource} glyphs
 * @returns {OutputFile[]}
 */
export function renderKvantumTheme(variant, values, glyphs) {
    const palette = buildPalette(variant, values);
    const controls = values.metrics.controls;
    const shadow = colorOf(palette, "shadow");
    /** @type {SheetItem[]} */
    const items = [];
    KVANTUM_FRAMES.forEach((frame) => {
        const cell = radiusOf(frame.radius, values);
        Object.keys(frame.states).forEach((state) => {
            items.push(kvantumFrame(`${frame.element}-${state}`, cell, frame.states[state] ?? {}, palette));
        });
    });
    items.push(
        shadowItem({ prefix: "", name: "menu-shadow", extents: { left: controls.menuShadow, top: controls.menuShadow, right: controls.menuShadow, bottom: controls.menuShadow }, radius: 0, color: shadow, hints: false }),
        shadowItem({ prefix: "", name: "tooltip-shadow", extents: { left: controls.tooltipShadow, top: controls.tooltipShadow, right: controls.tooltipShadow, bottom: controls.tooltipShadow }, radius: 0, color: shadow, hints: false }),
        ...indicatorItems(palette, glyphs),
        ...toggleItems(palette, glyphs, values),
    );
    const sheet = composeSheet(items);
    const general = {
        path: ["%General"],
        entries: [
            ["author", PROJECT.author],
            ["comment", PACKAGE_TEXT.kvantumComment],
            ...KVANTUM_GENERAL,
            ["menu_shadow_depth", controls.menuShadow],
            ["tooltip_shadow_depth", controls.tooltipShadow],
            ["scroll_width", controls.scrollWidth],
            ["slider_width", controls.progressThickness],
            ["slider_handle_width", controls.sliderHandle],
            ["slider_handle_length", controls.sliderHandle],
            ["tickless_slider_handle_size", controls.sliderHandle],
            ["progressbar_thickness", controls.progressThickness],
            ["check_size", controls.checkSize],
        ],
    };
    const config = renderIni([general, generalColors(palette), { path: ["Hacks"], entries: KVANTUM_HACKS }, ...widgetSections(palette, values)]);
    const id = KVANTUM_IDS[/** @type {"light" | "dark"} */ (variant)];
    return [
        textFile(`${id}.kvconfig`, config),
        textFile(`${id}.svg`, svgDocument(sheet.width, sheet.height, sheet.body, sheet.defs)),
    ];
}
