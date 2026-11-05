export const COLOR_EFFECTS = Object.freeze({
    disabled: Object.freeze([
        ["Color", "56,56,56"],
        ["ColorAmount", 0],
        ["ColorEffect", 0],
        ["ContrastAmount", 0.65],
        ["ContrastEffect", 1],
        ["IntensityAmount", 0.1],
        ["IntensityEffect", 2],
    ]),
    inactive: Object.freeze([
        ["ChangeSelectionColor", false],
        ["Color", "112,111,110"],
        ["ColorAmount", 0.025],
        ["ColorEffect", 2],
        ["ContrastAmount", 0.1],
        ["ContrastEffect", 2],
        ["Enable", false],
        ["IntensityAmount", 0],
        ["IntensityEffect", 0],
    ]),
});

export const KDE_CONTRAST = 4;

export const KONSOLE_COLOR_ORDER = Object.freeze(["black", "red", "green", "yellow", "blue", "purple", "cyan", "white"]);
export const KONSOLE_FAINT_MIX = 0.33;

export const SPLASH_INTRO_STAGE = 2;
export const SPLASH_RING_SWEEP = 270;
export const SPLASH_LOGO_FILE = "images/logo.svg";
export const KICKOFF_DISPLAY = Object.freeze({ grid: 0, list: 1 });
export const CLOCK_DATE_BELOW_TIME = 2;
export const KSPLASH_ENGINE = "KSplashQML";
export const LOOK_AND_FEEL_API_VERSION = "2";
export const PLASMA_WIDGETS = Object.freeze({
    kickoff: "org.kde.plasma.kickoff",
    tasks: "org.kde.plasma.icontasks",
    spacer: "org.kde.plasma.panelspacer",
    tray: "org.kde.plasma.systemtray",
    clock: "org.kde.plasma.digitalclock",
    showDesktop: "org.kde.plasma.showdesktop",
    wallpaper: "org.kde.image",
});
export const START_ICON_NAME = "start-here-kde-win11";
export const KICKOFF_SHORTCUT = "Alt+F1";
