# Degrade instead of failing on invalid config

Status: accepted

## Context

A build that stops on one typo leaves the user with a half-installed theme.

## Decision

Invalid or unknown values fall back to their schema default. Each problem is
printed as `settings.invalid` with the key, value and reason. An unreadable file
is treated as empty.

## Consequences

The build always finishes. Users see exactly which key was ignored.
