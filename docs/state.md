# Sources of truth

Each row has exactly one owner. Everything else reads it or derives from it.

| State | Owner | Others |
|---|---|---|
| User preferences for the build | `settings.json` via `loadSettings()` | Read only; renderers receive `values` |
| Defaults, bounds, units | `src/domain/catalog/` | Only `valueDefinitions.mjs` and `settingsSchema.mjs` read the value catalogs |
| Fluent glyph outlines | `assets/fonts/FluentSystemIcons-*.ttf` and their JSON name maps | `GlyphSource` |
| Committed packages | `npm run gen` from the defaults | `gen:check` fails when they drift |
| Installed packages | `npm run build` with the user's settings | Plasma reads them |

## Rebuilding derived state

| Derived | Rebuild |
|---|---|
| `packages/`, `docs/configuration.md` | `npm run gen` |
| Your installed theme | `npm run build`, or `tools/install.sh` |
