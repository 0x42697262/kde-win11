import { CLOCK_TICK_MILLISECONDS, SDDM_API_VERSION, SDDM_ICONS, SDDM_ICON_SIZE, SDDM_QT_VERSION } from "../catalog/kdeFormats.mjs";
import { IconStyle, Variant } from "../catalog/enums.mjs";
import { PROJECT, RenderedImage, SDDM_THEME_ID } from "../catalog/packages.mjs";
import { PACKAGE_TEXT } from "../catalog/packageText.mjs";
import { BLACK_HEX } from "../catalog/units.mjs";
import { formatAlpha, toQtColor } from "../theme/color.mjs";
import { buildPalette, colorOf } from "../theme/palette.mjs";
import { element, svgDocument } from "../svg/document.mjs";
import { glyphInBox } from "./iconArtwork.mjs";
import { renderIni } from "./ini.mjs";
import { renderTokensQml } from "./qmlTokens.mjs";
import { textFile } from "./files.mjs";

/** @typedef {import("./files.mjs").OutputFile} OutputFile */
/** @typedef {import("../settings/document.mjs").SettingsValues} SettingsValues */
/** @typedef {import("../font/glyphs.mjs").GlyphSource} GlyphSource */
/** @typedef {import("./qmlTokens.mjs").QmlToken} QmlToken */

/**
 * @param {SettingsValues} values
 * @returns {string}
 */
export function renderLoginTokens(values) {
    const palette = buildPalette(Variant.Dark, values);
    const login = values.metrics.login;
    const text = values.text.login;
    /** @type {(name: string, key: string) => QmlToken} */
    const color = (name, key) => ({ name, type: "color", value: toQtColor(colorOf(palette, key)) });
    /** @type {QmlToken[]} */
    const tokens = [
        { name: "background", type: "color", value: BLACK_HEX },
        { name: "dim", type: "color", value: BLACK_HEX },
        { name: "transparent", type: "color", value: "transparent" },
        color("text", "textPrimary"),
        color("textSecondary", "textSecondary"),
        color("accent", "accentForMode"),
        color("error", "negative"),
        color("field", "flyoutTranslucent"),
        color("menu", "flyout"),
        color("fieldStroke", "surfaceStroke"),
        color("hover", "subtleFillHover"),
        color("pressed", "subtleFillPressed"),
        color("selection", "subtleFillHover"),
        color("avatarBackground", "button"),
        { name: "fontFamily", type: "string", value: values.theme.fontFamily },
        ...Object.keys(login).map((key) => /** @type {QmlToken} */ ({ name: key, type: "real", value: login[key] })),
        { name: "clockTickMilliseconds", type: "int", value: CLOCK_TICK_MILLISECONDS },
        { name: "timeFormat", type: "string", value: text.timeFormat },
        { name: "dateFormat", type: "string", value: text.dateFormat },
        { name: "passwordPlaceholder", type: "string", value: text.passwordPlaceholder },
        { name: "signInText", type: "string", value: text.signIn },
        { name: "failedText", type: "string", value: text.failed },
        { name: "sessionText", type: "string", value: text.otherSessions },
        { name: "sleepText", type: "string", value: text.sleep },
        { name: "restartText", type: "string", value: text.restart },
        { name: "shutDownText", type: "string", value: text.shutDown },
        { name: "pressToUnlockText", type: "string", value: text.pressToUnlock },
        ...Object.keys(SDDM_ICONS).map((name) => /** @type {QmlToken} */ ({ name, type: "url", value: SDDM_ICONS[/** @type {keyof typeof SDDM_ICONS} */ (name)].file })),
    ];
    return renderTokensQml(tokens);
}

/**
 * @param {SettingsValues} values
 * @param {GlyphSource} glyphs
 * @param {string} loginQml
 * @returns {OutputFile[]}
 */
export function renderSddmTheme(values, glyphs, loginQml) {
    const palette = buildPalette(Variant.Dark, values);
    const glyphColor = colorOf(palette, "textPrimary");
    const metadata = renderIni([{
        path: ["SddmGreeterTheme"],
        entries: [
            ["Name", PACKAGE_TEXT.sddmName],
            ["Description", PACKAGE_TEXT.sddmDescription],
            ["Author", PROJECT.author],
            ["License", PROJECT.license],
            ["Type", "sddm-theme"],
            ["Version", PROJECT.version],
            ["Website", PROJECT.website],
            ["MainScript", "Main.qml"],
            ["ConfigFile", "theme.conf"],
            ["Theme-Id", SDDM_THEME_ID],
            ["Theme-API", SDDM_API_VERSION],
            ["QtVersion", SDDM_QT_VERSION],
        ],
    }]);
    const config = renderIni([{ path: ["General"], entries: [["background", RenderedImage.SddmBackground], ["type", "image"]] }]);
    const icons = Object.values(SDDM_ICONS).map((icon) => textFile(icon.file, svgDocument(SDDM_ICON_SIZE, SDDM_ICON_SIZE, element("path", {
        d: glyphInBox(glyphs, icon.glyph, IconStyle.Regular, { x: 0, y: 0, size: SDDM_ICON_SIZE }),
        fill: glyphColor.hex,
        "fill-opacity": glyphColor.alpha < 1 ? formatAlpha(glyphColor.alpha) : undefined,
    }))));
    return [
        textFile("metadata.desktop", metadata),
        textFile("theme.conf", config),
        textFile("Main.qml", loginQml),
        textFile("Tokens.qml", renderLoginTokens(values)),
        ...icons,
    ];
}
