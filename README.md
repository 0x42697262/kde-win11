# kde-win11

A Windows 11 style desktop theme for KDE Plasma 6 on Wayland. Plasma only reads
the generated files under `packages/`; Node is used only to build and check them.

Work in progress: this first part adds the tooling, the build settings and the
Fluent glyph reader that the theme packages are generated from.

## Develop

```bash
npm ci
```

```bash
npm run verify
```

Read [`AGENTS.md`](AGENTS.md) before changing code.

## License

GPL-3.0. Icons: Fluent UI System Icons (MIT).
