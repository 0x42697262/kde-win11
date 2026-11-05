export const WALLPAPER_VIEWBOX = Object.freeze({ width: 1920, height: 1080 });

export const RIBBONS = Object.freeze([
    { start: [-160, 980], first: [420, 420], second: [1180, 1240], end: [2080, 420], thickness: 260, opacity: 0.35, blur: 28 },
    { start: [-160, 860], first: [520, 260], second: [1100, 1080], end: [2080, 300], thickness: 200, opacity: 0.55, blur: 14 },
    { start: [-160, 760], first: [600, 160], second: [1040, 960], end: [2080, 200], thickness: 150, opacity: 0.75, blur: 4 },
    { start: [-160, 690], first: [660, 110], second: [1000, 880], end: [2080, 130], thickness: 90, opacity: 0.9, blur: 0 },
    { start: [-160, 640], first: [700, 80], second: [980, 820], end: [2080, 80], thickness: 36, opacity: 0.6, blur: 0 },
]);

export const WALLPAPER_GLOW = Object.freeze({ cx: 1080, cy: 520, radius: 900 });
export const RIBBON_EDGE_OPACITY = 0.15;
