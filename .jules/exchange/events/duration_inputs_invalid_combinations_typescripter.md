---
label: "bugs"
created_at: "2026-03-25"
author_role: "typescripter"
confidence: "high"
---

## Problem

`DurationInputs` models state as a combination of optional string flags (`minutes?: string`, `seconds?: string`), permitting invalid or ambiguous combinations (e.g., both provided, neither provided).

## Goal

Model the duration input state using a discriminated union so that only valid, mutually exclusive inputs are representable, and exhaustively handle these states without silent fallbacks.

## Context

The `typescripter` role emphasizes making invalid states unrepresentable by using discriminated unions instead of loose optional fields. Currently, `resolveEffectiveSeconds` accepts the loose `DurationInputs` object. If both `seconds` and `minutes` are provided, it silently prioritizes `seconds` and ignores `minutes`. If neither is provided, it silently returns `0`. This violates the principle of explicitly failing on invalid states and avoiding silent fallbacks.

## Evidence

- path: "src/domain/duration.ts"
  loc: "1-4"
  note: "DurationInputs uses optional primitives, allowing invalid combinations like {minutes: '1', seconds: '60'} or {}."
- path: "src/domain/duration.ts"
  loc: "8-21"
  note: "resolveEffectiveSeconds silently prioritizes seconds over minutes, and returns 0 if neither is provided, acting as a prohibited silent fallback."

## Change Scope

- `src/domain/duration.ts`
- `src/domain/wait-request.ts`