# Optional Kvantum style for Windows 11 menus and controls

Status: accepted; refines [ADR 0008](0008-keep-breeze-lock-screen-and-widgets.md)

## Context

Application menus and controls come from the Qt widget style. Breeze recolored
by the color scheme keeps square-ish menus with Breeze spacing, which reads as
KDE rather than Windows 11. A C++ style is out of scope, but Kvantum renders a
style entirely from one SVG and one `.kvconfig`, which the generator can write
from the same tokens as everything else.

## Decision

Generate `KdeWin11Light` and `KdeWin11Dark` Kvantum themes: 8 px rounded menus
with a shadow and inset, rounded hover highlights, Fluent check marks and
submenu chevrons, Windows 11 buttons with a darker bottom stroke, line edits
with an accent focus line, accent check boxes and radios, thin sliders with a
dotted thumb, pill scrollbars and progress bars, and tabs with an accent
underline. Menus keep every KDE entry; only their look changes. The style is
opt-in (`tools/install.sh --kvantum`), because it needs Kvantum installed;
Breeze stays the default.

## Consequences

Apps get Windows 11 menus and controls when the user opts in. Widgets the theme
does not draw (dials, rare frames) fall back to Kvantum's built-in default.
Windows 11's two-level context menu ("Show more options") is not reproduced;
that is application code, not a style.
