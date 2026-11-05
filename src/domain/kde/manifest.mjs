import { VARIANTS } from "../catalog/enums.mjs";
import { KVANTUM_IDS, KVANTUM_ROOT, KVANTUM_STYLE_NAME, WIDGET_STYLE, AURORAE_IDS, AURORAE_PLUGIN, AURORAE_THEME_PREFIX, COLOR_SCHEME_IDS, CURSOR_THEME_IDS, DESKTOP_THEME_IDS, ICON_THEME_IDS, KONSOLE_SCHEME_IDS, LOOK_AND_FEEL_IDS, PROJECT, PackageRoot, SDDM_THEME_ID, WALLPAPER_ID } from "../catalog/packages.mjs";

/** @typedef {import("../settings/document.mjs").SettingsValues} SettingsValues */
/** @typedef {"light" | "dark"} VariantName */

/**
 * @param {VariantName} variant
 * @returns {string[]}
 */
export function installedPaths(variant) {
    return [
        `${PackageRoot.LookAndFeel}/${LOOK_AND_FEEL_IDS[variant]}`,
        `${PackageRoot.DesktopTheme}/${DESKTOP_THEME_IDS[variant]}`,
        `${PackageRoot.Aurorae}/${AURORAE_IDS[variant]}`,
        `${PackageRoot.Icons}/${ICON_THEME_IDS[variant]}`,
        `${PackageRoot.Icons}/${CURSOR_THEME_IDS[variant]}`,
        `${PackageRoot.ColorSchemes}/${COLOR_SCHEME_IDS[variant]}.colors`,
        `${PackageRoot.Konsole}/${KONSOLE_SCHEME_IDS[variant]}.colorscheme`,
    ];
}

/**
 * @param {string} value
 * @returns {string}
 */
function quote(value) {
    return `'${value.replace(/'/g, "'\\''")}'`;
}

/**
 * @param {SettingsValues} values
 * @returns {string}
 */
export function renderManifest(values) {
    const paths = [...VARIANTS.flatMap((variant) => installedPaths(variant)), `${PackageRoot.Wallpapers}/${WALLPAPER_ID}`];
    /** @type {[string, string][]} */
    const entries = [
        ["KDE_WIN11_VERSION", PROJECT.version],
        ["KDE_WIN11_DEFAULT_VARIANT", values.theme.defaultVariant],
        ["KDE_WIN11_PATHS", paths.join(" ")],
        ["KDE_WIN11_WALLPAPER", `${PackageRoot.Wallpapers}/${WALLPAPER_ID}`],
        ["KDE_WIN11_SDDM_PATH", `${PackageRoot.Sddm}/${SDDM_THEME_ID}`],
        ["KDE_WIN11_SDDM_THEME", SDDM_THEME_ID],
        ["KDE_WIN11_CURSOR_SIZE", String(values.cursors.size)],
        ["KDE_WIN11_DECORATION_LIBRARY", AURORAE_PLUGIN],
        ["KDE_WIN11_BUTTONS_LEFT", values.titlebar.buttonsOnLeft],
        ["KDE_WIN11_BUTTONS_RIGHT", values.titlebar.buttonsOnRight],
        ["KDE_WIN11_KVANTUM_ROOT", KVANTUM_ROOT],
        ["KDE_WIN11_KVANTUM_PATHS", VARIANTS.map((variant) => `${KVANTUM_ROOT}/${KVANTUM_IDS[variant]}`).join(" ")],
        ["KDE_WIN11_KVANTUM_STYLE", KVANTUM_STYLE_NAME],
        ["KDE_WIN11_DEFAULT_WIDGET_STYLE", WIDGET_STYLE],
        ...VARIANTS.flatMap((variant) => {
            const suffix = variant.toUpperCase();
            return /** @type {[string, string][]} */ ([
                [`KDE_WIN11_LOOK_AND_FEEL_${suffix}`, LOOK_AND_FEEL_IDS[variant]],
                [`KDE_WIN11_DESKTOP_THEME_${suffix}`, DESKTOP_THEME_IDS[variant]],
                [`KDE_WIN11_COLOR_SCHEME_${suffix}`, COLOR_SCHEME_IDS[variant]],
                [`KDE_WIN11_ICON_THEME_${suffix}`, ICON_THEME_IDS[variant]],
                [`KDE_WIN11_CURSOR_THEME_${suffix}`, CURSOR_THEME_IDS[variant]],
                [`KDE_WIN11_DECORATION_THEME_${suffix}`, `${AURORAE_THEME_PREFIX}${AURORAE_IDS[variant]}`],
                [`KDE_WIN11_KVANTUM_THEME_${suffix}`, KVANTUM_IDS[variant]],
            ]);
        }),
    ];
    return `${entries.map(([key, value]) => `${key}=${quote(value)}`).join("\n")}\n`;
}
