import { Variant } from "./enums.mjs";

export const PROJECT = Object.freeze({
    name: "kde-win11",
    version: "1.0.0",
    author: "0x42697262",
    website: "https://github.com/0x42697262/kde-win11",
    license: "GPL-3.0-only",
    licenseShort: "GPL",
    configDirectoryName: "kde-win11",
    settingsFileName: "settings.json",
});

export const LOOK_AND_FEEL_IDS = Object.freeze({
    [Variant.Light]: "com.github.0x42697262.kdewin11.light",
    [Variant.Dark]: "com.github.0x42697262.kdewin11.dark",
});

export const DESKTOP_THEME_IDS = Object.freeze({
    [Variant.Light]: "kde-win11-light",
    [Variant.Dark]: "kde-win11-dark",
});

export const COLOR_SCHEME_IDS = Object.freeze({
    [Variant.Light]: "KdeWin11Light",
    [Variant.Dark]: "KdeWin11Dark",
});

export const AURORAE_IDS = Object.freeze({
    [Variant.Light]: "kde-win11-light",
    [Variant.Dark]: "kde-win11-dark",
});

export const AURORAE_PLUGIN = "org.kde.kwin.aurorae";
export const AURORAE_THEME_PREFIX = "__aurorae__svg__";

export const ICON_THEME_IDS = Object.freeze({
    [Variant.Light]: "kde-win11",
    [Variant.Dark]: "kde-win11-dark",
});

export const CURSOR_THEME_IDS = Object.freeze({
    [Variant.Light]: "kde-win11-cursors",
    [Variant.Dark]: "kde-win11-cursors-dark",
});

export const WALLPAPER_ID = "kde-win11";
export const SDDM_THEME_ID = "kde-win11";

export const KONSOLE_SCHEME_IDS = Object.freeze({
    [Variant.Light]: "KdeWin11Light",
    [Variant.Dark]: "KdeWin11Dark",
});

export const FALLBACK_ICON_THEMES = Object.freeze({
    [Variant.Light]: ["breeze", "hicolor"],
    [Variant.Dark]: ["breeze-dark", "hicolor"],
});

export const FALLBACK_CURSOR_THEME = "breeze_cursors";
export const WIDGET_STYLE = "Breeze";
export const WINDOW_SWITCHER_LAYOUT = "thumbnail_grid";
export const DESKTOP_SWITCHER_LAYOUT = "org.kde.breeze.desktop";

export const PackageRoot = Object.freeze({
    LookAndFeel: "plasma/look-and-feel",
    DesktopTheme: "plasma/desktoptheme",
    ColorSchemes: "color-schemes",
    Aurorae: "aurorae/themes",
    Icons: "icons",
    Wallpapers: "wallpapers",
    Konsole: "konsole",
    Sddm: "sddm/themes",
});

export const PACKAGES_DIRECTORY = "packages";

export const RenderedImage = Object.freeze({
    Preview: "contents/previews/preview.png",
    FullscreenPreview: "contents/previews/fullscreenpreview.jpg",
    WallpaperLight: "contents/images/3840x2160.jpg",
    WallpaperDark: "contents/images_dark/3840x2160.jpg",
    WallpaperScreenshot: "contents/screenshot.png",
    SddmBackground: "background.jpg",
});

export const WALLPAPER_SIZE = Object.freeze({ width: 3840, height: 2160 });
export const PREVIEW_SIZE = Object.freeze({ width: 640, height: 360 });
export const FULLSCREEN_PREVIEW_SIZE = Object.freeze({ width: 1920, height: 1080 });
export const WALLPAPER_SCREENSHOT_SIZE = Object.freeze({ width: 400, height: 225 });
