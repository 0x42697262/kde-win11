import { KONSOLE_COLOR_ORDER, KONSOLE_FAINT_MIX } from "../catalog/kdeFormats.mjs";
import { mixHex, parseColor, toRgbTriplet } from "../theme/color.mjs";
import { renderIni } from "./ini.mjs";

/** @typedef {import("./ini.mjs").IniGroup} IniGroup */

/**
 * @param {Readonly<Record<string, string>>} colors
 * @param {string} description
 * @returns {string}
 */
export function renderKonsoleScheme(colors, description) {
    const background = parseColor(colors.background ?? "");
    /**
     * @param {string} key
     * @returns {string}
     */
    const rgb = (key) => toRgbTriplet(parseColor(colors[key] ?? ""));
    /**
     * @param {string} key
     * @returns {string}
     */
    const faint = (key) => toRgbTriplet({ hex: mixHex(parseColor(colors[key] ?? "").hex, background.hex, KONSOLE_FAINT_MIX), alpha: 1 });
    /**
     * @param {string} key
     * @returns {string}
     */
    const bright = (key) => `bright${key.charAt(0).toUpperCase()}${key.slice(1)}`;
    /** @type {IniGroup[]} */
    const groups = [
        { path: ["Background"], entries: [["Color", rgb("background")]] },
        { path: ["BackgroundFaint"], entries: [["Color", rgb("background")]] },
        { path: ["BackgroundIntense"], entries: [["Color", rgb("background")]] },
        ...KONSOLE_COLOR_ORDER.flatMap((name, index) => [
            { path: [`Color${index}`], entries: [["Color", rgb(name)]] },
            { path: [`Color${index}Faint`], entries: [["Color", faint(name)]] },
            { path: [`Color${index}Intense`], entries: [["Color", rgb(bright(name))]] },
        ]),
        { path: ["Foreground"], entries: [["Color", rgb("foreground")]] },
        { path: ["ForegroundFaint"], entries: [["Color", faint("foreground")]] },
        { path: ["ForegroundIntense"], entries: [["Color", rgb("brightWhite")]] },
        { path: ["General"], entries: [["Anchor", "0.5,0.5"], ["Blur", false], ["ColorRandomization", false], ["Description", description], ["FillStyle", "Tile"], ["Opacity", 1], ["Wallpaper", ""], ["WallpaperFlipType", "NoFlip"], ["WallpaperOpacity", 1]] },
    ];
    return renderIni(groups);
}
