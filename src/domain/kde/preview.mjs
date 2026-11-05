import { PREVIEW_ICONS, PREVIEW_LAYOUT, PREVIEW_STYLESHEET, PREVIEW_TASK_STATES, PREVIEW_TEXT } from "../catalog/preview.mjs";
import { AURORAE_IDS, ICON_THEME_IDS, PackageRoot, WALLPAPER_ID } from "../catalog/packages.mjs";
import { SHEET_GAP } from "../catalog/units.mjs";
import { formatAlpha, parseHex } from "../theme/color.mjs";
import { buildPalette, colorOf } from "../theme/palette.mjs";
import { escapeXml } from "../svg/document.mjs";

/** @typedef {import("../settings/document.mjs").SettingsValues} SettingsValues */
/** @typedef {import("../catalog/tokens.mjs").ColorToken} ColorToken */
/** @typedef {"light" | "dark"} VariantName */

/**
 * @param {ColorToken} token
 * @returns {string}
 */
function css(token) {
    const rgb = parseHex(token.hex);
    return `rgba(${rgb.red}, ${rgb.green}, ${rgb.blue}, ${formatAlpha(token.alpha)})`;
}

/**
 * @param {string} template
 * @param {Readonly<Record<string, string | number>>} replacements
 * @returns {string}
 */
export function fillTemplate(template, replacements) {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        const value = replacements[key];
        if (value === undefined) {
            throw new Error(`Missing template value ${match}`);
        }
        return String(value);
    });
}

/**
 * @param {VariantName} variant
 * @param {SettingsValues} values
 * @param {string} packagesUrl
 * @returns {string}
 */
export function renderPreviewHtml(variant, values, packagesUrl) {
    const palette = buildPalette(variant, values);
    const color = (/** @type {string} */ key) => css(colorOf(palette, key));
    const layout = PREVIEW_LAYOUT;
    const panel = values.metrics.panel;
    const flyout = values.metrics.flyout;
    const titlebar = values.metrics.titlebar;
    const lightIcons = `${packagesUrl}/${PackageRoot.Icons}/${ICON_THEME_IDS.light}`;
    const icons = `${packagesUrl}/${PackageRoot.Icons}/${ICON_THEME_IDS[variant]}`;
    const art = (/** @type {string} */ context, /** @type {string} */ name) => `${lightIcons}/${context}/scalable/${name}.svg`;
    const symbol = (/** @type {string} */ context, /** @type {number} */ size, /** @type {string} */ name) => `${icons}/${context}/${size}/${name}.svg`;
    const wallpaper = `${packagesUrl}/${PackageRoot.Wallpapers}/${WALLPAPER_ID}/source/${variant}.svg`;
    const caption = (/** @type {string} */ button) => `${packagesUrl}/${PackageRoot.Aurorae}/${AURORAE_IDS[variant]}/${button}.svg`;
    const startLeft = (layout.width - layout.start.width) / 2;
    const startTop = layout.height - panel.height - layout.start.bottomGap - layout.start.height;
    const fileContext = (/** @type {string} */ name) => name.includes("-x-") || name.startsWith("x-office") || name.startsWith("application") || name.startsWith("text") || name.startsWith("image") ? "mimetypes" : "places";
    const styles = fillTemplate(PREVIEW_STYLESHEET, {
        layout_width: layout.width,
        layout_height: layout.height,
        layout_font: layout.font,
        color_textPrimary: color("textPrimary"),
        wallpaper: wallpaper,
        flyout_radius: flyout.radius,
        flyout_stroke: flyout.stroke,
        color_surfaceStroke: color("surfaceStroke"),
        color_flyout: color("flyout"),
        flyout_shadowOffset: flyout.shadowOffset,
        flyout_shadowSize_2: flyout.shadowSize * 2,
        color_shadow: color("shadow"),
        layout_window_left: layout.window.left,
        layout_window_top: layout.window.top,
        layout_window_width: layout.window.width,
        layout_window_height: layout.window.height,
        color_window: color("window"),
        titlebar_radius: titlebar.radius,
        color_windowStroke: color("windowStroke"),
        titlebar_height: titlebar.height,
        color_titlebar: color("titlebar"),
        titlebar_titleEdgeLeft: titlebar.titleEdgeLeft,
        titlebar_buttonWidth: titlebar.buttonWidth,
        SHEET_GAP: SHEET_GAP,
        color_view: color("view"),
        color_divider: color("divider"),
        color_textSecondary: color("textSecondary"),
        layout_sidebarWidth: layout.sidebarWidth,
        color_subtleFillHover: color("subtleFillHover"),
        color_accentForMode: color("accentForMode"),
        color_selectionHover: color("selectionHover"),
        startLeft: startLeft,
        startTop: startTop,
        layout_start_width: layout.start.width,
        layout_start_height: layout.start.height,
        color_subtleFillPressed: color("subtleFillPressed"),
        color_textOnAccent: color("textOnAccent"),
        panel_height: panel.height,
        color_taskbar: color("taskbar"),
        panel_stroke: panel.stroke,
        layout_taskButton: layout.taskButton,
        layout_taskButton_4: layout.taskHeight,
        panel_taskRadius: panel.taskRadius,
        layout_taskButton_panel_taskIndicatorInset_2: layout.taskButton - panel.taskIndicatorInset * 2,
        panel_taskIndicatorThickness: panel.taskIndicatorThickness,
        color_taskIndicator: color("taskIndicator"),
        layout_taskButton_panel_taskFocusIndicatorInset_2: layout.taskButton - panel.taskFocusIndicatorInset * 2,
    });
    const fileTiles = PREVIEW_TEXT.files.map((label, index) => {
        const name = PREVIEW_ICONS.files[index] ?? "";
        return `<div class="${index === 1 ? "selected" : ""}"><img src="${art(fileContext(name), name)}" width="${layout.iconSize}"><span>${escapeXml(label)}</span></div>`;
    }).join("");
    const sidebar = PREVIEW_TEXT.sidebar.map((label, index) => `<div class="${index === 0 ? "selected" : ""}"><img src="${art("places", PREVIEW_ICONS.sidebar[index] ?? "")}" width="16">${escapeXml(label)}</div>`).join("");
    const toolbar = PREVIEW_ICONS.toolbar.map((name) => `<img src="${symbol("actions", 16, name)}" width="16">`).join("");
    const captions = PREVIEW_ICONS.caption.map((button) => `<div class="caption"><img src="${caption(button)}"></div>`).join("");
    const tiles = PREVIEW_ICONS.pinned.map((name, index) => `<div><img src="${art("apps", name)}" width="${layout.tileIconSize}"><span>${escapeXml(PREVIEW_ICONS.pinnedLabels[index] ?? "")}</span></div>`).join("");
    const recent = PREVIEW_TEXT.recentFiles.map((label, index) => `<div><img src="${art("mimetypes", PREVIEW_ICONS.recent[index] ?? "")}" width="32"><span>${escapeXml(label)}<small>${escapeXml(PREVIEW_TEXT.recentTimes[index] ?? "")}</small></span></div>`).join("");
    const tasks = PREVIEW_ICONS.taskbar.map((name, index) => {
        const state = PREVIEW_TASK_STATES[index] ?? "";
        return `<div class="task ${state}"><img src="${art("apps", name)}" width="${layout.taskbarIconSize}"></div>`;
    }).join("");
    const tray = PREVIEW_ICONS.tray.map((name) => `<img src="${symbol("status", 16, name)}" width="${layout.trayIconSize}">`).join("");
    return `<!doctype html><html><head><meta charset="utf-8"><style>${styles}</style></head><body>
<div class="surface window"><div class="titlebar"><img src="${art("apps", "system-file-manager")}" width="16"><span class="title">${escapeXml(PREVIEW_TEXT.windowTitle)}</span>${captions}</div>
<div class="toolbar">${toolbar}<div class="address"><img src="${art("places", "user-home")}" width="16">${escapeXml(PREVIEW_TEXT.windowTitle)}</div></div>
<div class="content"><div class="sidebar">${sidebar}</div><div class="grid">${fileTiles}</div></div></div>
<div class="surface start"><div class="search"><img src="${symbol("actions", 16, PREVIEW_ICONS.search)}" width="16">${escapeXml(PREVIEW_TEXT.search)}</div>
<div class="heading">${escapeXml(PREVIEW_TEXT.pinned)}<span class="pill">${escapeXml(PREVIEW_TEXT.allApps)} ›</span></div><div class="tiles">${tiles}</div>
<div class="heading">${escapeXml(PREVIEW_TEXT.recommended)}</div><div class="recent">${recent}</div>
<div class="footer"><span><span class="avatar">${escapeXml(PREVIEW_TEXT.userName.slice(0, 1))}</span>${escapeXml(PREVIEW_TEXT.userName)}</span><img src="${symbol("actions", 16, PREVIEW_ICONS.power)}" width="16"></div></div>
<div class="taskbar"><div class="tasks">${tasks}</div><div class="tray">${tray}<div class="clock">${escapeXml(PREVIEW_TEXT.time)}<br>${escapeXml(PREVIEW_TEXT.date)}</div></div></div>
</body></html>
`;
}
