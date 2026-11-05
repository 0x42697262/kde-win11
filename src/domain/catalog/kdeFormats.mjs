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

export const SDDM_ICONS = Object.freeze({
    powerIcon: { file: "icons/power.svg", glyph: "power" },
    restartIcon: { file: "icons/restart.svg", glyph: "arrow_clockwise" },
    sleepIcon: { file: "icons/sleep.svg", glyph: "weather_moon" },
    arrowIcon: { file: "icons/arrow.svg", glyph: "arrow_right" },
    personIcon: { file: "icons/person.svg", glyph: "person" },
});
export const SDDM_ICON_SIZE = 24;
export const SDDM_API_VERSION = "2.0";
export const SDDM_QT_VERSION = 6;
export const CLOCK_TICK_MILLISECONDS = 1000;

export const DESKTOP_MENU_FILE = "plasma-org.kde.plasma.desktop-appletsrc";
export const DESKTOP_MENU_GROUPS = Object.freeze(["ActionPlugins", "0"]);
export const DESKTOP_MENU_TRIGGER = "RightButton;NoModifier";
export const DESKTOP_MENU_PLUGIN = "org.kde.contextmenu";

export const DESKTOP_MENU_ACTIONS = Object.freeze([
    { action: "_display_settings", setting: "displaySettings", enabled: true, description: "Display settings (Windows: Display settings)" },
    { action: "configure", setting: "configureDesktop", enabled: true, description: "Desktop and wallpaper settings (Windows: Personalize)" },
    { action: "_open_terminal", setting: "openTerminal", enabled: true, description: "Open a terminal here (Windows: Open in Terminal)" },
    { action: "_wallpaper", setting: "nextWallpaper", enabled: true, description: "Next wallpaper image" },
    { action: "add widgets", setting: "addWidgets", enabled: true, description: "KDE: add widgets" },
    { action: "edit mode", setting: "editMode", enabled: true, description: "KDE: enter edit mode" },
    { action: "_add panel", setting: "addPanel", enabled: true, description: "KDE: add a panel" },
    { action: "_context", setting: "widgetActions", enabled: true, description: "KDE: actions of the widget under the pointer" },
    { action: "manage activities", setting: "manageActivities", enabled: false, description: "KDE: manage activities" },
    { action: "configure shortcuts", setting: "configureShortcuts", enabled: false, description: "KDE: configure shortcuts" },
    { action: "remove", setting: "remove", enabled: false, description: "KDE: remove this desktop" },
    { action: "run associated application", setting: "runAssociatedApplication", enabled: false, description: "KDE: run the associated application" },
    { action: "_run_command", setting: "runCommand", enabled: false, description: "KDE: run command" },
    { action: "_lock_screen", setting: "lockScreen", enabled: false, description: "KDE: lock the screen" },
    { action: "_logout", setting: "logout", enabled: false, description: "KDE: log out" },
    { action: "_sep1", setting: "separatorOne", enabled: true, description: "Separator after the editing entries" },
    { action: "_sep2", setting: "separatorTwo", enabled: true, description: "Separator after the session entries" },
    { action: "_sep3", setting: "separatorThree", enabled: true, description: "Separator before the settings entries" },
]);
