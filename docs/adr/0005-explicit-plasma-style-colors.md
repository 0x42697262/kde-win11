# One Plasma style per variant with explicit surface colors

Status: accepted

## Context

A Plasma style can either paint surfaces with `ColorScheme-*` classes, which
follow whatever color scheme is active, or with explicit colors. Windows 11
uses different tints and translucency for the taskbar, flyouts and tooltips in
light and dark mode, and none of them equal a KDE color role exactly.

## Decision

Ship `kde-win11-light` and `kde-win11-dark` Plasma styles. Surfaces, strokes and
shadows use the exact palette colors; anything that marks focus or selection
(the active task pill, the selected list item pill) uses `ColorScheme-Highlight`
so the accent chosen in System Settings still applies. Text colors come from the
active color scheme, which the global theme sets to the matching variant.
Missing SVGs (buttons, line edits, sliders) fall back to Breeze, which already
follows the color scheme.

## Consequences

Surfaces match Windows 11 in both modes. Mixing the light style with a dark
color scheme gives light surfaces with light text; the global themes never do
that.
