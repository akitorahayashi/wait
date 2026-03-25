---
label: "docs"
created_at: "2025-03-25"
author_role: "consistency"
confidence: "high"
---

## Problem

The authoritative `action.yml` contract lacks the `default: 'true'` declaration for the `enabled` input, even though documentation claims it defaults to `true` and the runtime implements `true` as the default.

## Goal

Add `default: 'true'` to the `enabled` input in `action.yml` so that GitHub Actions correctly exposes and documents the default parameter in UI and context, matching the runtime's explicit behavior and existing documentation.

## Context

GitHub Actions UI and runner context rely entirely on `action.yml` for input metadata. Because `default: 'true'` is missing, the input appears to have no default, breaking the contract exposed to users despite the internal fallback handling. This causes a silent drift between what GitHub Actions parses and what the documentation specifies.

## Evidence

- path: "action.yml"
  loc: "4-6"
  note: "The `enabled` input defines `required: false` but lacks a `default: 'true'` field."

- path: "docs/configuration.md"
  loc: "8"
  note: "The documentation explicitly states `Default: true` for the `enabled` input."

- path: "src/domain/wait-request.ts"
  loc: "17"
  note: "The code parses the `enabled` input with a default of `true`: `parseBooleanInput(raw.enabled, true, 'enabled')`."

## Change Scope

- `action.yml`