---
label: "refacts"
created_at: "2026-03-25"
author_role: "data_arch"
confidence: "high"
---

## Problem

The definition of time parameters (`minutes` and `seconds`) is duplicated across `DurationInputs` and `RawWaitInputs`.

## Goal

Consolidate the definition of input wait parameters so there's a single source of truth for all action inputs, avoiding repetitive types and explicit translation mapping.

## Context

The Single Source of Truth principle dictates that a concept should only be modeled once. Having `minutes` and `seconds` on both `RawWaitInputs` and `DurationInputs` causes mapping logic (`normalizeWaitRequest` calling `resolveEffectiveSeconds({ minutes: raw.minutes, seconds: raw.seconds })`) that creates unnecessary coupling and potential drift.

## Evidence

- path: "src/domain/duration.ts"
  loc: "1-4"
  note: "`DurationInputs` defines `minutes?: string` and `seconds?: string`."
- path: "src/domain/wait-request.ts"
  loc: "9-14"
  note: "`RawWaitInputs` redundantly defines `minutes?: string` and `seconds?: string` alongside other inputs."
- path: "src/domain/wait-request.ts"
  loc: "19-20"
  note: "`normalizeWaitRequest` unpacks these parameters explicitly to pass them into `resolveEffectiveSeconds`."

## Change Scope

- `src/domain/duration.ts`
- `src/domain/wait-request.ts`
