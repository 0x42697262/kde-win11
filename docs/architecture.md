# Architecture

## Data flow

```
settings.json ─> src/adapters/settingsFile ─> resolveDocument() ─> values
Fluent fonts  ─> src/adapters/glyphFiles   ─> parseFont()       ─> glyph source
                                                                     │
                                         assemblePackages(values, glyphs)
                                                                     │
                                                                     v
                                     OutputFile[] ─> src/adapters/fileTree ─> packages/ or ~/.local/share
```

Plasma never runs any of this. It reads the generated SVG, INI, QML and
Xcursor files from `packages/` after they are copied into the XDG data
directory. Node only builds and checks them.

## Folders

| Path | Holds |
|---|---|
| `src/domain/catalog` | Tokens, strings, enums, package ids, the settings schema |
| `src/domain/settings` | Setting definitions, validation, the versioned sparse document |
| `src/domain/theme` | Color math and palettes per variant |
| `src/domain/font` | TrueType reader and the Fluent glyph source |
| `src/domain/svg` | SVG document helpers, shapes, Plasma nine-slice frames, masks and shadows |
| `src/domain/kde` | One renderer per KDE package type (`desktopTheme`, `colorScheme`, `konsole`, …), plus `assemble.mjs` |
| `src/domain/docs` | Generated documentation |
| `src/adapters` | Node file system access |
| `tools` | `generate`, `build`, `check-banned` entry points |
| `tests/domain` | `node --test` for every domain module |
| `packages` | Generated output, laid out like `$XDG_DATA_HOME` |

## Generated packages

| Path under `packages/` | Installed to | Renderer |
|---|---|---|
| `plasma/desktoptheme/kde-win11-{light,dark}` | `$XDG_DATA_HOME/plasma/desktoptheme/` | `desktopTheme.mjs` |
| `color-schemes/KdeWin11{Light,Dark}.colors` | `$XDG_DATA_HOME/color-schemes/` | `colorScheme.mjs` |
| `aurorae/themes/kde-win11-{light,dark}` | `$XDG_DATA_HOME/aurorae/themes/` | `aurorae.mjs` |
| `konsole/KdeWin11{Light,Dark}.colorscheme` | `$XDG_DATA_HOME/konsole/` | `konsole.mjs` |
