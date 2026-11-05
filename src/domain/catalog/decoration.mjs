export const CaptionButton = Object.freeze({
    Minimize: "minimize",
    Maximize: "maximize",
    Restore: "restore",
    Close: "close",
    AllDesktops: "alldesktops",
    KeepAbove: "keepabove",
    KeepBelow: "keepbelow",
    Shade: "shade",
    Help: "help",
});

export const CAPTION_FLUENT_GLYPHS = Object.freeze({
    [CaptionButton.AllDesktops]: "pin_12",
    [CaptionButton.KeepAbove]: "arrow_up_12",
    [CaptionButton.KeepBelow]: "arrow_down_12",
    [CaptionButton.Shade]: "chevron_up_12",
    [CaptionButton.Help]: "question_16",
});

export const ButtonState = Object.freeze({
    Active: "active",
    Inactive: "inactive",
    Hover: "hover",
    HoverInactive: "hover-inactive",
    Pressed: "pressed",
    PressedInactive: "pressed-inactive",
    Deactivated: "deactivated",
    DeactivatedInactive: "deactivated-inactive",
});

export const DecorationState = Object.freeze({
    Active: "decoration",
    Inactive: "decoration-inactive",
    Maximized: "decoration-maximized",
    MaximizedInactive: "decoration-maximized-inactive",
});

export const AURORAE_ANIMATION_MILLISECONDS = 150;
export const AURORAE_EXPLICIT_SPACER = 8;
export const OPAQUE_ALPHA_CHANNEL = 255;
export const RESTORE_BACK_OFFSET = 2;
