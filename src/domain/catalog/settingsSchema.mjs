import { SettingType, defineSetting } from "../settings/definitions.mjs";
import { VALUE_DEFINITIONS } from "../settings/valueDefinitions.mjs";
import { FavoritesDisplay, TaskbarAlignment, TitleAlignment, VARIANTS, Variant } from "./enums.mjs";
import { ACCENT_DEFAULT } from "./accent.mjs";

export const SETTINGS_SCHEMA_VERSION = 1;

export const DEFAULT_PINNED_APPS = Object.freeze([
    "preferred://filemanager",
    "preferred://browser",
    "applications:org.kde.konsole.desktop",
    "applications:org.kde.discover.desktop",
    "applications:systemsettings.desktop",
]);

export const DEFAULT_CURSOR_SIZES = Object.freeze([24, 32, 48, 64]);

const CORE_DEFINITIONS = [
    defineSetting({ key: "theme.defaultVariant", section: "Theme", type: SettingType.Enum, defaultValue: Variant.Light, options: VARIANTS, description: "Global theme the installer applies" }),
    defineSetting({ key: "theme.fontFamily", section: "Theme", type: SettingType.String, defaultValue: "Inter", description: "Font family for the splash and login screen" }),
    defineSetting({ key: "accent.color", section: "Accent", type: SettingType.Color, defaultValue: ACCENT_DEFAULT, description: "Accent color for selection, focus and the taskbar indicator" }),
    defineSetting({ key: "taskbar.alignment", section: "Taskbar", type: SettingType.Enum, defaultValue: TaskbarAlignment.Center, options: Object.values(TaskbarAlignment), description: "Start and pinned apps centered or at the left edge" }),
    defineSetting({ key: "taskbar.floating", section: "Taskbar", type: SettingType.Boolean, defaultValue: false, description: "Plasma floating panel" }),
    defineSetting({ key: "taskbar.showDate", section: "Taskbar", type: SettingType.Boolean, defaultValue: true, description: "Date below the clock" }),
    defineSetting({ key: "taskbar.showDesktopButton", section: "Taskbar", type: SettingType.Boolean, defaultValue: true, description: "Thin show desktop button at the right edge" }),
    defineSetting({ key: "taskbar.pinned", section: "Taskbar", type: SettingType.List, defaultValue: [...DEFAULT_PINNED_APPS], description: "Task manager launchers in Plasma launcher URL form" }),
    defineSetting({ key: "startMenu.favoritesDisplay", section: "Start", type: SettingType.Enum, defaultValue: FavoritesDisplay.Grid, options: Object.values(FavoritesDisplay), description: "Pinned apps as a grid or a list" }),
    defineSetting({ key: "startMenu.allAppsDisplay", section: "Start", type: SettingType.Enum, defaultValue: FavoritesDisplay.List, options: Object.values(FavoritesDisplay), description: "All apps as a grid or a list" }),
    defineSetting({ key: "titlebar.alignment", section: "Title bar", type: SettingType.Enum, defaultValue: TitleAlignment.Left, options: Object.values(TitleAlignment), description: "Window title alignment" }),
    defineSetting({ key: "titlebar.buttonsOnLeft", section: "Title bar", type: SettingType.String, defaultValue: "M", description: "KWin button codes left of the title" }),
    defineSetting({ key: "titlebar.buttonsOnRight", section: "Title bar", type: SettingType.String, defaultValue: "IAX", description: "KWin button codes right of the title" }),
    defineSetting({ key: "cursors.sizes", section: "Cursors", type: SettingType.NumberList, defaultValue: [...DEFAULT_CURSOR_SIZES], minimum: 16, maximum: 256, description: "Pixel sizes rendered into each cursor file" }),
    defineSetting({ key: "cursors.size", section: "Cursors", type: SettingType.Number, defaultValue: 24, minimum: 16, maximum: 256, description: "Cursor size the installer applies" }),
];

export const SETTING_DEFINITIONS = Object.freeze([...CORE_DEFINITIONS, ...VALUE_DEFINITIONS]);

export const CONFIGURATION_EXAMPLE = Object.freeze({ schemaVersion: SETTINGS_SCHEMA_VERSION, values: { accent: { color: "#ff8c00" }, taskbar: { alignment: "left" } } });
