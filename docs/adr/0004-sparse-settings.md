# Store only user overrides in settings.json

Status: accepted

## Context

Persisting every default means changing a default needs a migration for
everyone.

## Decision

`settings.json` holds `schemaVersion` and only keys the user changed. Defaults
come from the catalogs through `settingsSchema.mjs`. Renames are migrations.

## Consequences

Smaller files, and improved defaults reach every user who never touched the key.
