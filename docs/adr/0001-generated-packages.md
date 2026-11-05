# Generate KDE packages from a pure domain

Status: accepted

## Context

A Windows 11 look on Plasma spans a color scheme, a Plasma style, a window
decoration, an icon theme, cursors, a splash, a login screen and a global theme.
Hand-written themes drift: a corner radius changes in one SVG and not the next,
and Plasma style SVGs need exact element ids and pixel sizes.

## Decision

Every package is rendered by a pure function in `src/domain/kde` from one set of
resolved settings, the same layering as qs-win-11: catalogs, domain, adapters,
tools. Node and `tsc` run only at build time. The output is committed under
`packages/` so users install plain files without Node.

## Consequences

One change to a token updates every package. Generated output is reviewed in
diffs and checked by `gen:check`. Contributors need Node 22 to change the theme,
not to use it.
