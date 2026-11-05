# Keep Breeze for the lock screen and the widget style

Status: accepted

## Context

A global theme may ship its own lock screen QML and a Qt widget style.
`kscreenlocker` loads the theme's lock screen and authenticates through it; a
lock screen with a broken or changed authentication API can leave a user
unable to unlock. A full Qt widget style is a C++ plugin or a large Kvantum
SVG that has to track every Qt control.

## Decision

The global themes do not override the lock screen; Breeze's greeter shows the
Windows 11 colors and wallpaper. Applications keep the Breeze widget style
with the Windows 11 color scheme. The splash screen and the SDDM login screen,
which cannot lock anyone out of a running session, are custom.

## Consequences

No risk of a locked-out session from a theme update. App controls look like
Breeze in Windows 11 colors rather than exact WinUI controls.
