# Render cursors in process

Status: accepted

## Context

Cursor themes are binary Xcursor files with one ARGB image per size and
frame. The usual pipeline exports PNGs from an SVG editor and runs
`xcursorgen`, which adds two tools and makes the output depend on their
versions.

## Decision

Cursor designs are analytic shapes (polygons, circles, rings, capsules,
rounded rects) on a 32-unit grid in `catalog/cursors.mjs`. A pure rasterizer
samples them 4×4 per pixel, outlines the silhouette with an exact Euclidean
distance transform, adds a blurred drop shadow and packs premultiplied ARGB.
`encodeXcursor()` writes the file. Busy cursors spin an accent ring.

## Consequences

Cursors rebuild with `npm run gen` alone, sizes and colors are settings, and
the bytes are deterministic so `gen:check` can compare them. Generation takes a
few seconds because every frame is supersampled.
