export const KvantumState = Object.freeze({
    Normal: "normal",
    Focused: "focused",
    Pressed: "pressed",
    Toggled: "toggled",
    Disabled: "disabled",
});

export const KvantumRadius = Object.freeze({ Control: "control", Menu: "menu", Pill: "pill" });

/** @typedef {{ fill?: string, stroke?: string, bottom?: string, bar?: string, pill?: string }} KvantumLook */
/** @typedef {{ element: string, radius: string, states: { readonly [state: string]: KvantumLook | undefined } }} KvantumFrame */

/** @type {readonly KvantumFrame[]} */
export const KVANTUM_FRAMES = Object.freeze([
    {
        element: "button",
        radius: KvantumRadius.Control,
        states: {
            normal: { fill: "controlFill", stroke: "controlStroke", bottom: "controlStrokeBottom" },
            focused: { fill: "controlFillHover", stroke: "controlStroke", bottom: "controlStrokeBottom" },
            pressed: { fill: "controlFillPressed", stroke: "controlStroke" },
            toggled: { fill: "accentForMode", stroke: "accentForMode" },
            disabled: { fill: "controlFillPressed", stroke: "controlStroke" },
        },
    },
    {
        element: "lineedit",
        radius: KvantumRadius.Control,
        states: {
            normal: { fill: "controlFill", stroke: "controlStroke", bottom: "controlStrongStroke" },
            focused: { fill: "view", stroke: "controlStroke", bar: "accentForMode" },
            disabled: { fill: "controlFillPressed", stroke: "controlStroke" },
        },
    },
    {
        element: "tlineedit",
        radius: KvantumRadius.Control,
        states: {
            normal: { fill: "controlFill", stroke: "controlStroke", bottom: "controlStrongStroke" },
            focused: { fill: "view", stroke: "controlStroke", bar: "accentForMode" },
            disabled: { fill: "controlFillPressed", stroke: "controlStroke" },
        },
    },
    { element: "menu", radius: KvantumRadius.Menu, states: { normal: { fill: "menuSurface", stroke: "surfaceStroke" } } },
    {
        element: "menuitem",
        radius: KvantumRadius.Control,
        states: { normal: {}, focused: { fill: "subtleFillHover" }, pressed: { fill: "subtleFillPressed" }, toggled: { fill: "subtleFillHover" } },
    },
    {
        element: "menubar",
        radius: KvantumRadius.Control,
        states: { normal: {}, focused: { fill: "subtleFillHover" }, pressed: { fill: "subtleFillPressed" }, toggled: { fill: "subtleFillHover" } },
    },
    {
        element: "itemview",
        radius: KvantumRadius.Control,
        states: {
            normal: {},
            focused: { fill: "subtleFillHover" },
            pressed: { fill: "subtleFillPressed", pill: "accentForMode" },
            toggled: { fill: "subtleFillHover", pill: "accentForMode" },
        },
    },
    { element: "tooltip", radius: KvantumRadius.Control, states: { normal: { fill: "tooltip", stroke: "surfaceStroke" } } },
    { element: "common", radius: KvantumRadius.Control, states: { normal: { stroke: "surfaceStroke" }, focused: { stroke: "accentForMode" } } },
    { element: "group", radius: KvantumRadius.Menu, states: { normal: { fill: "subtleFillPressed", stroke: "surfaceStroke" } } },
    {
        element: "tab",
        radius: KvantumRadius.Control,
        states: {
            normal: {},
            focused: { fill: "subtleFillHover" },
            toggled: { fill: "controlFill", stroke: "controlStroke", bar: "accentForMode" },
        },
    },
    { element: "tabframe", radius: KvantumRadius.Menu, states: { normal: { fill: "controlFill", stroke: "surfaceStroke" } } },
    { element: "progress", radius: KvantumRadius.Pill, states: { normal: { fill: "controlStrongStroke" } } },
    { element: "progress-pattern", radius: KvantumRadius.Pill, states: { normal: { fill: "accentForMode" }, disabled: { fill: "textDisabled" } } },
    { element: "slider", radius: KvantumRadius.Pill, states: { normal: { fill: "controlStrongStroke" }, toggled: { fill: "accentForMode" } } },
    {
        element: "scrollbarslider",
        radius: KvantumRadius.Pill,
        states: { normal: { fill: "controlStrongStroke" }, focused: { fill: "textSecondary" }, pressed: { fill: "textPrimary" } },
    },
    { element: "header", radius: KvantumRadius.Control, states: { normal: { bottom: "divider" }, focused: { fill: "subtleFillHover", bottom: "divider" }, pressed: { fill: "subtleFillPressed", bottom: "divider" } } },
    { element: "toolbar", radius: KvantumRadius.Control, states: { normal: {} } },
    { element: "dock", radius: KvantumRadius.Control, states: { normal: { stroke: "surfaceStroke" } } },
    { element: "splitter", radius: KvantumRadius.Control, states: { normal: {} } },
]);

export const KVANTUM_ARROW_FAMILIES = Object.freeze(["arrow", "b-arrow", "s-arrow", "flat-s-arrow"]);
export const KVANTUM_ARROW_GLYPHS = Object.freeze({
    up: "chevron_up_12",
    down: "chevron_down_12",
    left: "chevron_left_12",
    right: "chevron_right_12",
    plus: "add_12",
    minus: "subtract_12",
});
export const KVANTUM_STATE_TEXT = Object.freeze({
    normal: "textSecondary",
    focused: "textPrimary",
    pressed: "textSecondary",
    disabled: "textDisabled",
});
export const KVANTUM_GLYPHS = Object.freeze({
    check: "checkmark_12",
    close: "dismiss_12",
    submenu: "chevron_right_12",
    submenuLeft: "chevron_left_12",
    tristate: "subtract_12",
});

export const KVANTUM_INDICATOR_BOX = 16;
export const KVANTUM_CHECK_BOX = 20;
export const KVANTUM_CHECK_GLYPH_INSET = 4;
export const KVANTUM_RADIO_DOT_RATIO = 0.25;
export const KVANTUM_PILL_WIDTH = 3;
export const KVANTUM_BAR_HEIGHT = 2;
export const KVANTUM_STROKE = 1;
export const KVANTUM_FOCUS_THICKNESS = 2;

export const KVANTUM_GENERAL = Object.freeze([
    ["x11drag", "menubar_and_primary_toolbar"],
    ["alt_mnemonic", true],
    ["left_tabs", false],
    ["attach_active_tab", false],
    ["group_toolbar_buttons", false],
    ["spread_progressbar", true],
    ["composite", true],
    ["splitter_width", 1],
    ["scroll_min_extent", 36],
    ["scroll_arrows", false],
    ["transient_scrollbar", true],
    ["transient_groove", true],
    ["center_toolbar_handle", true],
    ["toolbar_interior_spacing", 4],
    ["menubar_mouse_tracking", true],
    ["toolbutton_style", 0],
    ["click_behavior", 0],
    ["translucent_windows", false],
    ["blurring", false],
    ["popup_blurring", true],
    ["vertical_spin_indicators", false],
    ["fill_rubberband", false],
    ["merge_menubar_with_toolbar", false],
    ["small_icon_size", 16],
    ["large_icon_size", 32],
    ["button_icon_size", 16],
    ["toolbar_icon_size", 16],
    ["animate_states", true],
    ["combo_as_lineedit", true],
    ["combo_menu", true],
    ["combo_focus_rect", false],
    ["groupbox_top_label", true],
    ["inline_spin_indicators", true],
    ["joined_inactive_tabs", false],
    ["layout_spacing", 6],
    ["scrollbar_in_view", true],
    ["submenu_overlap", 0],
    ["spread_menuitems", false],
    ["menu_separator_height", 9],
    ["tooltip_delay", -1],
]);

export const KVANTUM_HACKS = Object.freeze([
    ["transparent_ktitle_label", true],
    ["transparent_dolphin_view", false],
    ["blur_translucent", true],
    ["respect_darkness", true],
    ["disabled_icon_opacity", 70],
    ["iconless_menu", false],
    ["iconless_pushbutton", true],
    ["normal_default_pushbutton", true],
    ["single_top_toolbar", true],
    ["tint_on_mouseover", 0],
    ["no_selection_tint", true],
    ["transparent_arrow_button", true],
]);

export const KVANTUM_TEXT_MARGIN = Object.freeze({ horizontal: 8, vertical: 2, menuLeft: 10, menuRight: 10, iconSpacing: 8 });
