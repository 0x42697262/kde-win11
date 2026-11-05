# Icon theme from Fluent glyphs plus original artwork

Status: accepted

## Context

Windows 11 pairs monochrome Fluent glyphs in toolbars and the system tray
with colorful folders, file types and app icons. Microsoft's colorful icons
cannot be redistributed, and the icon theme must cover hundreds of
freedesktop names to avoid falling back to Breeze in common places.

## Decision

Monochrome icons come from the Fluent UI System Icons fonts through the
TrueType reader, mapped name by name in `catalog/icons.mjs`. Colorful icons are
original shapes in `catalog/artwork.mjs` combined with filled Fluent glyphs.
Every alias is a relative symlink to one rendered file. The dark theme renders
its own symbolic icons with light default colors and symlinks the colorful
directories from the light theme. Anything not covered inherits Breeze.

## Consequences

About 1,200 SVG files and 2,400 links per build, all regenerated from code.
Branded app icons (Firefox, Chrome, VS Code and so on) keep their own icons.
