# Working on kde-win11

Rules for humans and coding agents. **(hard rule)** items fail review or CI.
Architecture is in [`docs/architecture.md`](docs/architecture.md); decisions are
in [`docs/adr/`](docs/adr/).

## Layers

```
tools/ entry points  ->  src/adapters (files, fonts)  ->  src/domain (pure .mjs)  ->  packages/ (generated)
```

| Layer | Job | Must not |
|---|---|---|
| `tools/` | Parse arguments, call adapters and one domain function, print results | Hold rules or render files |
| `src/adapters` | Read settings, fonts and files, write trees | Make product decisions |
| `src/domain` | Pure functions, enums, schemas, catalogs, renderers that return file lists (`.mjs`) | Import Node modules, read env, clock or files |
| `src/qml` | Hand-written QML for the splash and login screen | Hold values; they come from the generated `Tokens.qml` |
| `packages/` | Generated KDE packages, installed as plain files | Be edited by hand |

## Hard rules

1. **No explanatory comments.** Names explain *what*; `docs/` explains *why*.
   JSDoc type annotations are allowed. (hard rule)
2. **Every value is a setting.** Colors, metrics, accent shades and user text
   have their defaults and bounds in `src/domain/catalog/` (`tokens.mjs`,
   `strings.mjs`, `accent.mjs`). `valueDefinitions.mjs` turns them into
   settings and renderers read the resolved value from `values`, never from
   those catalogs (`check-banned` enforces this). Artwork geometry, KDE
   identifiers, file formats and unit conversions stay constants. Elsewhere only
   `0`, `1`, `2`, `-1` and `0.5` appear as literals. (hard rule)
3. **No single-character names**, including loop counters and lambda
   parameters. (hard rule)
4. **One source of truth.** Every generated file comes from one renderer and
   the resolved settings; see [`docs/state.md`](docs/state.md). (hard rule)
5. **Strict types.** `.mjs` is checked by `tsc --strict` through JSDoc. QML
   uses typed properties, `required property` and
   `pragma ComponentBehavior: Bound`. (hard rule)
6. **Persisted data is versioned** with `schemaVersion` and migrated on read.
   (hard rule)
7. **Degrade, never fail the build.** An invalid setting falls back to its
   default and is printed as `settings.invalid`; the build continues.
8. **Open assets only.** No Microsoft artwork, fonts, logos or wallpapers; see
   [ADR 0002](docs/adr/0002-open-assets.md). (hard rule)
9. American English everywhere.

## Commands

| Command | Does |
|---|---|
| `npm run verify` | Type check, banned patterns, domain tests, generated files |
| `npm run gen` | Regenerate `packages/` and `docs/configuration.md` from the defaults |
| `npm run build -- --settings <file> --out <dir>` | Build every package with your settings into a data directory |

Generated files are never edited by hand: everything under `packages/` and
`docs/configuration.md`.

## Confirmed facts

| Fact | Verified in |
|---|---|
| The Fluent UI System Icons fonts are TrueType (`glyf`) with 500 units per em, ascender 500 and descender 0, and a format 12 `cmap` | `tests/domain/truetype.test.mjs` |
| Plasma's `FrameSvg` takes each of the nine elements' bounding box as its size, finds them as `<prefix>-<name>`, reads content margins from `hint-<side>-margin` and blur masks from `mask-<prefix>-*` | KDE Plasma style documentation, Breeze `widgets/panel-background` |
| Dialog shadows come from `shadow-*` elements; `shadow-hint-<side>-margin` sets how far the shadow reaches outside the window, and the tile overlaps the window by the rest | libplasma `dialogshadows.cpp` |
| The panel looks up `south-`, `north-`, `east-`, `west-` prefixes before the unprefixed frame; tasks use `normal`, `focus`, `hover`, `attention`, `minimized`; list highlights use `hover`, `selected`, `selected+hover` | plasma-workspace task manager and `PlasmaExtras.Highlight` |
| Plasma uses `translucent/` SVGs when blur is available and `opaque/` ones without compositing | KDE Plasma style documentation |
| QtSvg renders linear and radial gradients with `gradientTransform` but not filters, so shadows are gradients | Qt SVG Tiny 1.2 support |
| Aurorae themes live in `$XDG_DATA_HOME/aurorae/themes/<name>/` with `metadata.desktop`, `<name>rc`, `decoration.svg` (`decoration-*`, `decoration-inactive-*`, `decoration-maximized-*`, `decoration-maximized-inactive-*`) and one SVG per button with `<state>-center` elements; KWin selects it as `__aurorae__svg__<name>` | KWin `plugins/kdecorations/aurorae`, existing Aurorae themes |
| Aurorae draws the decoration nine-slice across the padding, so shadows are painted inside `Padding*` and the client sits inside `Border*` | KWin Aurorae theme format |
| **Unverified in a live session:** the nine-slice output was checked by composing the elements in Chromium (`getBBox` plus canvas), not inside plasmashell | Local render |

Add a row whenever you rely on a third-party behavior.

## Verification checklist

Every PR adds one line per behavior change: what to do, what to see.

| Feature | Check | Expected |
|---|---|---|
| Foundation | `npm run verify` | All green |
| Settings | `npm run build -- --settings s.json --out /tmp/k` with `{"schemaVersion":1,"values":{"taskbar":{"alignment":"diagonal"}}}` | One `settings.invalid` line for `taskbar.alignment`; build finishes |
| Plasma style | Copy `packages/plasma/desktoptheme/*` to `~/.local/share/plasma/desktoptheme/`, pick "Windows 11 Light" in System Settings → Colors & Themes → Plasma Style | Flat taskbar with a hairline top border; popups rounded 8 px with a soft shadow; with blur, flyouts are translucent |
| Task pills | Open two apps, focus one | Running apps show a short grey pill; the focused one a wider accent pill on a subtle background |
| Color scheme | Copy `packages/color-schemes/*` to `~/.local/share/color-schemes/`, apply "Windows 11 Dark" | Window #202020, views #1c1c1c, selection in the accent; changing the accent in System Settings recolors selection |
| Window decoration | Copy `packages/aurorae/themes/*` to `~/.local/share/aurorae/themes/`, pick "Windows 11 Light" under Window Decorations | 32 px title bar in the window color, 8 px rounded top corners, hairline border, soft shadow; 46 px wide caption buttons with a red close hover that follows the corner |
| Window decoration | `{"values":{"titlebar":{"alignment":"center"}}}`, rebuild | Titles centered |
| Konsole | Copy `packages/konsole/*` to `~/.local/share/konsole/`, pick "Windows 11 Dark" in the profile | Windows Terminal Campbell colors |
