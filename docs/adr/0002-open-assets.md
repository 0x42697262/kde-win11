# Open icons and fonts only

Status: accepted

## Context

Windows 11 icons, cursors, wallpapers, the Windows logo and Segoe UI are
Microsoft property and cannot be redistributed under GPL.

## Decision

Monochrome icons are extracted from the Fluent UI System Icons fonts (MIT), the
same files qs-win-11 ships. Colorful folders, documents, app tiles, cursors and
the wallpaper are original artwork drawn by the renderers. The Start icon is the
Fluent `grid` glyph, not the Windows logo. The default font is Inter (OFL).

## Consequences

Close to the Windows 11 look without license issues. Everything visual can be
regenerated from code.
