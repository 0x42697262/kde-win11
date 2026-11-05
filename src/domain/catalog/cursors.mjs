import { CursorRole } from "./enums.mjs";

export const CURSOR_GRID = 32;
export const CURSOR_CENTER = 16;
export const SUPERSAMPLE = 4;

export const CursorAnimation = Object.freeze({ None: "none", Spin: "spin" });
export const OutlineRole = Object.freeze({ Outline: "outline", Fill: "fill" });

/** @typedef {{ kind: "polygon", points: readonly (readonly number[])[] } | { kind: "circle", cx: number, cy: number, radius: number } | { kind: "ring", cx: number, cy: number, inner: number, outer: number, start?: number, sweep?: number, spin?: boolean } | { kind: "capsule", fromX: number, fromY: number, toX: number, toY: number, radius: number } | { kind: "rect", x: number, y: number, width: number, height: number, radius: number }} CursorShape */
/** @typedef {{ role: string, shapes: readonly CursorShape[] }} CursorLayer */
/** @typedef {{ name: string, hotspot: readonly number[], layers: readonly CursorLayer[], aliases: readonly string[], outline?: string, rotate?: number, animation?: string }} CursorDesign */

/** @type {CursorShape} */
const ARROW = Object.freeze({ kind: "polygon", points: [[2, 2], [2, 24], [7.2, 19.2], [10.6, 27], [14.2, 25.5], [10.9, 17.8], [18, 17.8]] });

/** @type {readonly CursorShape[]} */
const RESIZE = Object.freeze([
    { kind: "capsule", fromX: 16, fromY: 8.5, toX: 16, toY: 23.5, radius: 1.25 },
    { kind: "polygon", points: [[16, 3], [21.5, 9.5], [10.5, 9.5]] },
    { kind: "polygon", points: [[16, 29], [10.5, 22.5], [21.5, 22.5]] },
]);

/** @type {readonly CursorShape[]} */
const MOVE = Object.freeze([
    { kind: "capsule", fromX: 16, fromY: 7, toX: 16, toY: 25, radius: 1.2 },
    { kind: "capsule", fromX: 7, fromY: 16, toX: 25, toY: 16, radius: 1.2 },
    { kind: "polygon", points: [[16, 2.5], [20.5, 7.5], [11.5, 7.5]] },
    { kind: "polygon", points: [[16, 29.5], [11.5, 24.5], [20.5, 24.5]] },
    { kind: "polygon", points: [[2.5, 16], [7.5, 11.5], [7.5, 20.5]] },
    { kind: "polygon", points: [[29.5, 16], [24.5, 20.5], [24.5, 11.5]] },
]);

/** @type {readonly CursorShape[]} */
const HAND = Object.freeze([
    { kind: "capsule", fromX: 12.5, fromY: 4.8, toX: 12.5, toY: 17, radius: 2.4 },
    { kind: "capsule", fromX: 17.2, fromY: 13, toX: 17.2, toY: 18, radius: 2.2 },
    { kind: "capsule", fromX: 21.6, fromY: 14, toX: 21.6, toY: 19, radius: 2.1 },
    { kind: "capsule", fromX: 25.6, fromY: 15.6, toX: 25.6, toY: 20, radius: 2 },
    { kind: "capsule", fromX: 10.8, fromY: 21.2, toX: 6.2, toY: 16.6, radius: 2.1 },
    { kind: "rect", x: 10.1, y: 15.2, width: 17.5, height: 12.2, radius: 4.2 },
    { kind: "rect", x: 12.6, y: 24, width: 12.6, height: 5.4, radius: 1.6 },
]);

/** @type {readonly CursorShape[]} */
const HAND_CREASES = Object.freeze([
    { kind: "capsule", fromX: 14.85, fromY: 15.4, toX: 14.85, toY: 19, radius: 0.45 },
    { kind: "capsule", fromX: 19.4, fromY: 16.4, toX: 19.4, toY: 19.6, radius: 0.45 },
    { kind: "capsule", fromX: 23.6, fromY: 17.6, toX: 23.6, toY: 20.4, radius: 0.45 },
]);

/** @type {readonly CursorShape[]} */
const IBEAM = Object.freeze([
    { kind: "rect", x: 15.2, y: 6, width: 1.6, height: 20, radius: 0.4 },
    { kind: "rect", x: 11.8, y: 4.8, width: 8.4, height: 1.7, radius: 0.85 },
    { kind: "rect", x: 11.8, y: 25.5, width: 8.4, height: 1.7, radius: 0.85 },
]);

/** @type {CursorShape} */
const BUSY_RING = Object.freeze({ kind: "ring", cx: 16, cy: 16, inner: 8.6, outer: 12.4, start: -90, sweep: 270, spin: true });
/** @type {CursorShape} */
const SMALL_BUSY_RING = Object.freeze({ kind: "ring", cx: 23.5, cy: 23.5, inner: 3.6, outer: 6.2, start: -90, sweep: 270, spin: true });

/** @type {readonly CursorShape[]} */
const QUESTION_MARK = Object.freeze([
    { kind: "ring", cx: 23.5, cy: 17.5, inner: 2.3, outer: 4.2, start: -200, sweep: 250 },
    { kind: "capsule", fromX: 23.5, fromY: 20.8, toX: 23.5, toY: 23, radius: 0.95 },
    { kind: "circle", cx: 23.5, cy: 26.6, radius: 1.2 },
]);

/** @type {readonly CursorShape[]} */
const COPY_BADGE = Object.freeze([{ kind: "rect", x: 19, y: 19, width: 11, height: 11, radius: 2 }]);
/** @type {readonly CursorShape[]} */
const COPY_PLUS = Object.freeze([
    { kind: "capsule", fromX: 24.5, fromY: 21.6, toX: 24.5, toY: 27.4, radius: 0.75 },
    { kind: "capsule", fromX: 21.6, fromY: 24.5, toX: 27.4, toY: 24.5, radius: 0.75 },
]);

const FILL = CursorRole.Fill;
const INK = CursorRole.Ink;
const ACCENT = CursorRole.Accent;

/** @type {readonly CursorDesign[]} */
export const CURSOR_DESIGNS = Object.freeze([
    {
        name: "default",
        hotspot: [2, 2],
        layers: [{ role: FILL, shapes: [ARROW] }],
        aliases: ["left_ptr", "arrow", "top_left_arrow", "context-menu", "alias", "link", "center_ptr", "up_arrow", "right_ptr", "draft_large", "draft_small", "x-cursor", "dnd-none", "dnd-link", "3085a0e285430894940527032f8b26df", "640fb0e74195791501fd1ed57b41487f", "a2a266d0498c3104214a47bd64ab0fc8"],
    },
    {
        name: "pointer",
        hotspot: [12.5, 2.6],
        layers: [{ role: FILL, shapes: HAND }, { role: INK, shapes: HAND_CREASES }],
        aliases: ["hand2", "hand1", "hand", "pointing_hand", "openhand", "grab", "e29285e634086352946a0e7090d73106", "9d800788f1b08800ae810202380a0822", "5aca4d189052212118709018842178c0", "9141b49c8149039304290b508d208c40"],
    },
    {
        name: "text",
        hotspot: [16, 16],
        layers: [{ role: INK, shapes: IBEAM }],
        outline: OutlineRole.Fill,
        aliases: ["xterm", "ibeam"],
    },
    {
        name: "vertical-text",
        hotspot: [16, 16],
        layers: [{ role: INK, shapes: IBEAM }],
        outline: OutlineRole.Fill,
        rotate: 90,
        aliases: ["048008013003cff3c00c801001200000"],
    },
    {
        name: "crosshair",
        hotspot: [16, 16],
        layers: [{ role: INK, shapes: [{ kind: "capsule", fromX: 4, fromY: 16, toX: 28, toY: 16, radius: 0.8 }, { kind: "capsule", fromX: 16, fromY: 4, toX: 16, toY: 28, radius: 0.8 }] }],
        outline: OutlineRole.Fill,
        aliases: ["cross", "tcross", "cross_reverse", "diamond_cross", "cell", "plus", "color-picker", "target", "zoom-in", "zoom-out"],
    },
    {
        name: "wait",
        hotspot: [16, 16],
        layers: [{ role: ACCENT, shapes: [BUSY_RING] }],
        animation: CursorAnimation.Spin,
        aliases: ["watch", "clock"],
    },
    {
        name: "progress",
        hotspot: [2, 2],
        layers: [{ role: FILL, shapes: [ARROW] }, { role: ACCENT, shapes: [SMALL_BUSY_RING] }],
        animation: CursorAnimation.Spin,
        aliases: ["left_ptr_watch", "half-busy", "3ecb610c1bf2410f44200f48c40d3599", "08e8e1c95fe2fc01f976f1e063a24ccd", "00000000000000020006000e7e9ffc3f"],
    },
    {
        name: "help",
        hotspot: [2, 2],
        layers: [{ role: FILL, shapes: [ARROW, ...QUESTION_MARK] }],
        aliases: ["question_arrow", "whats_this", "left_ptr_help", "5c6cd98b3f3ebcb1f9c7f1c204630408", "d9ce0ab605698f320427677b458ad60b"],
    },
    {
        name: "not-allowed",
        hotspot: [16, 16],
        layers: [{ role: FILL, shapes: [{ kind: "ring", cx: 16, cy: 16, inner: 8.4, outer: 11.6 }, { kind: "capsule", fromX: 8.6, fromY: 23.4, toX: 23.4, toY: 8.6, radius: 1.6 }] }],
        aliases: ["crossed_circle", "forbidden", "no-drop", "dnd-no-drop", "circle", "X_cursor", "pirate", "03b6e0fcb3499374a867c041f52298f0"],
    },
    {
        name: "move",
        hotspot: [16, 16],
        layers: [{ role: FILL, shapes: MOVE }],
        aliases: ["fleur", "all-scroll", "size_all", "grabbing", "closedhand", "dnd-move", "4498f0e0c1937ffe01fd06f973665830", "9081237383d90e509aa00f00170e968f", "fcf21c00b30f7e3f83fe0dfd12e71cff"],
    },
    {
        name: "ns-resize",
        hotspot: [16, 16],
        layers: [{ role: FILL, shapes: RESIZE }],
        aliases: ["sb_v_double_arrow", "v_double_arrow", "size_ver", "row-resize", "n-resize", "s-resize", "top_side", "bottom_side", "split_v", "double_arrow", "00008160000006810000408080010102", "2870a09082c103050810ffdffffe0204"],
    },
    {
        name: "ew-resize",
        hotspot: [16, 16],
        layers: [{ role: FILL, shapes: RESIZE }],
        rotate: 90,
        aliases: ["sb_h_double_arrow", "h_double_arrow", "size_hor", "col-resize", "e-resize", "w-resize", "left_side", "right_side", "split_h", "028006030e0e7ebffc7f7070c0600140", "14fef782d02440884392942c11205230"],
    },
    {
        name: "nwse-resize",
        hotspot: [16, 16],
        layers: [{ role: FILL, shapes: RESIZE }],
        rotate: -45,
        aliases: ["size_fdiag", "nw-resize", "se-resize", "top_left_corner", "bottom_right_corner", "bd_double_arrow", "c7088f0f3e6c8088236ef8e1e3e70000"],
    },
    {
        name: "nesw-resize",
        hotspot: [16, 16],
        layers: [{ role: FILL, shapes: RESIZE }],
        rotate: 45,
        aliases: ["size_bdiag", "ne-resize", "sw-resize", "top_right_corner", "bottom_left_corner", "fd_double_arrow", "fcf1c3c7cd4491d801f1e1c78f100000"],
    },
    {
        name: "copy",
        hotspot: [2, 2],
        layers: [{ role: FILL, shapes: [ARROW, ...COPY_BADGE] }, { role: INK, shapes: COPY_PLUS }],
        aliases: ["dnd-copy", "1081e37283d90000800003c07f3ef6bf", "6407b0e94181790501fd1e167b474872", "b66166c04f8c3109214a4fbd64a50fc8"],
    },
]);

export const SPIN_SWEEP_MINIMUM = 0.35;
export const INFINITE_DISTANCE = 1e20;
