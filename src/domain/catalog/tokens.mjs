/** @typedef {{ hex: string, alpha: number }} ColorToken */
/** @typedef {{ value: number, minimum: number, maximum: number }} MetricToken */

/**
 * @param {string} hex
 * @param {number} alpha
 * @returns {ColorToken}
 */
function tone(hex, alpha = 1) {
    return Object.freeze({ hex, alpha });
}

/**
 * @param {number} value
 * @param {number} minimum
 * @param {number} maximum
 * @returns {MetricToken}
 */
function metric(value, minimum, maximum) {
    return Object.freeze({ value, minimum, maximum });
}

export const WHITE = "#ffffff";
export const BLACK = "#000000";

const CRITICAL_RED = "#c42b1c";

export const LIGHT_BASE = Object.freeze({
    window: tone("#f3f3f3"),
    view: tone(WHITE),
    viewAlternate: tone("#f9f9f9"),
    button: tone("#fbfbfb"),
    header: tone("#f3f3f3"),
    headerInactive: tone("#f3f3f3"),
    tooltip: tone("#f9f9f9"),
    complementary: tone("#202020"),
    complementaryText: tone(WHITE),
    textPrimary: tone("#1a1a1a"),
    textSecondary: tone("#5f5f5f"),
    textDisabled: tone("#a0a0a0"),
    link: tone("#005fb8"),
    visited: tone("#6b2fb3"),
    negative: tone(CRITICAL_RED),
    neutral: tone("#9d5d00"),
    positive: tone("#0f7b0f"),
    taskbar: tone("#eeeeee", 0.9),
    taskbarTranslucent: tone("#eeeeee", 0.72),
    flyout: tone("#fcfcfc", 0.96),
    flyoutTranslucent: tone("#f3f3f3", 0.8),
    widget: tone("#fbfbfb", 0.9),
    widgetTranslucent: tone("#fbfbfb", 0.72),
    surfaceStroke: tone(BLACK, 0.1),
    divider: tone(BLACK, 0.0803),
    subtleFillHover: tone(BLACK, 0.0373),
    subtleFillPressed: tone(BLACK, 0.0241),
    taskIndicator: tone("#868686"),
    taskAttention: tone("#ff8c00", 0.28),
    titlebar: tone("#f3f3f3"),
    titlebarInactive: tone("#f3f3f3"),
    titleText: tone("#1a1a1a"),
    titleTextInactive: tone("#8d8d8d"),
    captionHover: tone(BLACK, 0.0373),
    captionPressed: tone(BLACK, 0.0241),
    closeHover: tone(CRITICAL_RED),
    closePressed: tone(CRITICAL_RED, 0.9),
    closeGlyphHover: tone(WHITE),
    windowStroke: tone(BLACK, 0.12),
    shadow: tone(BLACK, 0.16),
});

export const DARK_BASE = Object.freeze({
    window: tone("#202020"),
    view: tone("#1c1c1c"),
    viewAlternate: tone("#262626"),
    button: tone("#2d2d2d"),
    header: tone("#202020"),
    headerInactive: tone("#202020"),
    tooltip: tone("#2c2c2c"),
    complementary: tone("#202020"),
    complementaryText: tone(WHITE),
    textPrimary: tone(WHITE),
    textSecondary: tone("#c8c8c8"),
    textDisabled: tone("#717171"),
    link: tone("#99ebff"),
    visited: tone("#c7a6ff"),
    negative: tone("#ff99a4"),
    neutral: tone("#fce100"),
    positive: tone("#6ccb5f"),
    taskbar: tone("#1c1c1c", 0.9),
    taskbarTranslucent: tone("#1c1c1c", 0.72),
    flyout: tone("#2c2c2c", 0.96),
    flyoutTranslucent: tone("#2c2c2c", 0.8),
    widget: tone("#2b2b2b", 0.9),
    widgetTranslucent: tone("#2b2b2b", 0.72),
    surfaceStroke: tone("#757575", 0.4),
    divider: tone(WHITE, 0.0837),
    subtleFillHover: tone(WHITE, 0.0605),
    subtleFillPressed: tone(WHITE, 0.0419),
    taskIndicator: tone("#9d9d9d"),
    taskAttention: tone("#ff8c00", 0.34),
    titlebar: tone("#202020"),
    titlebarInactive: tone("#202020"),
    titleText: tone(WHITE),
    titleTextInactive: tone("#9a9a9a"),
    captionHover: tone(WHITE, 0.0605),
    captionPressed: tone(WHITE, 0.0419),
    closeHover: tone(CRITICAL_RED),
    closePressed: tone(CRITICAL_RED, 0.9),
    closeGlyphHover: tone(WHITE),
    windowStroke: tone(WHITE, 0.1),
    shadow: tone(BLACK, 0.42),
});

export const ICON_COLORS = Object.freeze({
    folderBack: tone("#e8a317"),
    folderFront: tone("#ffd75e"),
    folderFrontShade: tone("#fcbf2a"),
    folderGlyph: tone("#2a7ad1"),
    pageBackground: tone(WHITE),
    pageStroke: tone("#bdbdbd"),
    pageFold: tone("#e3e3e3"),
    driveBody: tone("#d6d6d6"),
    driveFace: tone("#9a9a9a"),
    driveLight: tone("#3fbf5f"),
    trashBody: tone("#cfd8e3"),
    trashStroke: tone("#7d8ba0"),
    tileGlyph: tone(WHITE),
    tileHighlight: tone(WHITE, 0.22),
});

export const CURSOR_COLORS = Object.freeze({
    light: Object.freeze({ fill: tone(WHITE), ink: tone(BLACK), outline: tone(BLACK), shadow: tone(BLACK, 0.3) }),
    dark: Object.freeze({ fill: tone(BLACK), ink: tone(WHITE), outline: tone(WHITE), shadow: tone(BLACK, 0.3) }),
});

export const TERMINAL_COLORS = Object.freeze({
    dark: Object.freeze({
        background: tone("#0c0c0c"), foreground: tone("#cccccc"),
        black: tone("#0c0c0c"), red: tone("#c50f1f"), green: tone("#13a10e"), yellow: tone("#c19c00"),
        blue: tone("#0037da"), purple: tone("#881798"), cyan: tone("#3a96dd"), white: tone("#cccccc"),
        brightBlack: tone("#767676"), brightRed: tone("#e74856"), brightGreen: tone("#16c60c"), brightYellow: tone("#f9f1a5"),
        brightBlue: tone("#3b78ff"), brightPurple: tone("#b4009e"), brightCyan: tone("#61d6d6"), brightWhite: tone("#f2f2f2"),
    }),
    light: Object.freeze({
        background: tone("#fafafa"), foreground: tone("#383a42"),
        black: tone("#383a42"), red: tone("#e45649"), green: tone("#50a14f"), yellow: tone("#c18301"),
        blue: tone("#0184bc"), purple: tone("#a626a4"), cyan: tone("#0997b3"), white: tone("#fafafa"),
        brightBlack: tone("#4f525d"), brightRed: tone("#df6c75"), brightGreen: tone("#98c379"), brightYellow: tone("#e4c07a"),
        brightBlue: tone("#61afef"), brightPurple: tone("#c577dd"), brightCyan: tone("#56b5c1"), brightWhite: tone(WHITE),
    }),
});

export const WALLPAPER_COLORS = Object.freeze({
    light: Object.freeze({ backgroundTop: tone("#dce9f7"), backgroundBottom: tone("#b9d3f0"), ribbonStart: tone("#3d8bfd"), ribbonEnd: tone("#0a4fc4"), glow: tone(WHITE, 0.7) }),
    dark: Object.freeze({ backgroundTop: tone("#0a1426"), backgroundBottom: tone("#040810"), ribbonStart: tone("#2f7bff"), ribbonEnd: tone("#0b2f8a"), glow: tone("#7fb4ff", 0.35) }),
});

export const ACCENT_SHADES = Object.freeze({
    darkModeMixWithWhite: metric(0.45, 0, 1),
    lightModeMixWithBlack: metric(0.15, 0, 1),
    selectionHoverAlpha: metric(0.3, 0, 1),
});

export const PANEL = Object.freeze({
    height: metric(48, 24, 128),
    radius: metric(0, 0, 32),
    stroke: metric(1, 0, 4),
    taskIndicatorThickness: metric(3, 1, 8),
    taskIndicatorInset: metric(19, 0, 48),
    taskFocusIndicatorInset: metric(14, 0, 48),
    taskMargin: metric(3, 0, 12),
    taskRadius: metric(4, 0, 16),
    taskPadding: metric(6, 0, 24),
});

export const BLUR = Object.freeze({
    contrast: metric(0.2, 0, 2),
    intensity: metric(1.4, 0, 4),
    saturation: metric(1.8, 0, 4),
});

export const FLYOUT = Object.freeze({
    radius: metric(8, 0, 32),
    stroke: metric(1, 0, 4),
    padding: metric(12, 0, 48),
    shadowSize: metric(24, 0, 96),
    shadowOffset: metric(8, 0, 48),
});

export const WIDGET = Object.freeze({
    radius: metric(8, 0, 32),
    stroke: metric(1, 0, 4),
    padding: metric(12, 0, 48),
    shadowSize: metric(16, 0, 96),
    shadowOffset: metric(4, 0, 48),
});

export const TOOLTIP = Object.freeze({
    radius: metric(6, 0, 32),
    stroke: metric(1, 0, 4),
    padding: metric(8, 0, 48),
    shadowSize: metric(12, 0, 96),
    shadowOffset: metric(4, 0, 48),
});

export const LIST_ITEM = Object.freeze({
    radius: metric(4, 0, 16),
    padding: metric(6, 0, 24),
    selectionPillWidth: metric(3, 0, 8),
    selectionPillInset: metric(10, 0, 48),
});

export const TITLEBAR = Object.freeze({
    height: metric(32, 16, 96),
    buttonWidth: metric(46, 16, 96),
    glyphSize: metric(10, 6, 32),
    glyphStroke: metric(1, 0.5, 4),
    titleEdgeLeft: metric(10, 0, 48),
    border: metric(1, 0, 8),
    radius: metric(8, 0, 24),
    shadowLeft: metric(20, 0, 96),
    shadowRight: metric(20, 0, 96),
    shadowTop: metric(14, 0, 96),
    shadowBottom: metric(26, 0, 96),
});

export const SPLASH = Object.freeze({
    logoSize: metric(96, 16, 512),
    ringSize: metric(40, 8, 256),
    ringStroke: metric(4, 1, 32),
    ringGap: metric(96, 0, 512),
    spinMilliseconds: metric(1200, 100, 10000),
    fadeMilliseconds: metric(300, 0, 5000),
});

export const LOGIN = Object.freeze({
    clockFontSize: metric(96, 12, 400),
    dateFontSize: metric(24, 8, 128),
    nameFontSize: metric(28, 8, 128),
    bodyFontSize: metric(14, 8, 64),
    avatarSize: metric(192, 32, 512),
    smallAvatarSize: metric(40, 16, 128),
    fieldWidth: metric(296, 96, 1024),
    fieldHeight: metric(36, 16, 96),
    controlRadius: metric(4, 0, 32),
    iconSize: metric(20, 8, 64),
    buttonSize: metric(40, 16, 128),
    spacing: metric(16, 0, 96),
    edgeMargin: metric(32, 0, 256),
    clockTopRatio: metric(0.18, 0, 1),
    blurAmount: metric(1, 0, 1),
    blurMax: metric(64, 0, 256),
    dimOpacity: metric(0.25, 0, 1),
    transitionMilliseconds: metric(250, 0, 5000),
});

export const CURSOR = Object.freeze({
    outlineWidth: metric(1.4, 0, 6),
    shadowOffset: metric(1, 0, 8),
    shadowBlur: metric(1.5, 0, 8),
    waitFrames: metric(24, 1, 120),
    waitFrameMilliseconds: metric(40, 10, 1000),
});
