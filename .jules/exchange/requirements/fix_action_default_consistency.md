---
label: "docs"
implementation_ready: false
---

## Goal

Add `default: 'true'` to the `enabled` input in `action.yml` so that GitHub Actions correctly exposes and documents the default parameter in UI and context, matching the runtime's explicit behavior and existing documentation.

## Problem

The authoritative `action.yml` contract lacks the `default: 'true'` declaration for the `enabled` input, even though documentation claims it defaults to `true` and the runtime implements `true` as the default.

## Context

GitHub Actions UI and runner context rely entirely on `action.yml` for input metadata. Because `default: 'true'` is missing, the input appears to have no default, breaking the contract exposed to users despite the internal fallback handling. This causes a silent drift between what GitHub Actions parses and what the documentation specifies.

## Evidence

- source_event: "missing_action_default_consistency.md"
  path: "action.yml"
  loc: "4-6"
  note: "The `enabled` input defines `required: false` but lacks a `default: 'true'` field."
- source_event: "missing_action_default_consistency.md"
  path: "docs/configuration.md"
  loc: "8"
  note: "The documentation explicitly states `Default: true` for the `enabled` input."
- source_event: "missing_action_default_consistency.md"
  path: "src/domain/wait-request.ts"
  loc: "17"
  note: "The code parses the `enabled` input with a default of `true`: `parseBooleanInput(raw.enabled, true, 'enabled')`."

## Change Scope

- `action.yml`

## Constraints

- Ensure no regressions in existing functionality.
- Adhere to the principles defined in the root context.

## Acceptance Criteria

- The goals specified are fully achieved.
- The problems described are completely resolved.
