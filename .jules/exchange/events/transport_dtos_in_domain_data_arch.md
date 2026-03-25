---
label: "refacts"
created_at: "2026-03-25"
author_role: "data_arch"
confidence: "high"
---

## Problem

Transport DTOs (`RawWaitInputs`, `DurationInputs`) and raw string-parsing logic (`parseBooleanInput`, `parseNonNegativeInteger`) are improperly located within the core `domain` layer instead of at the boundaries.

## Goal

Move raw input schemas and parsing logic out of the `domain` layer and into the boundary layers (e.g., `action/read-inputs.ts`), so the domain only deals with valid, parsed types.

## Context

The domain should remain independent of transport/UI/runtime concerns. Currently, `src/domain/wait-request.ts` and `src/domain/duration.ts` handle string inputs directly from the GitHub Actions runner environment, which violates the Boundary Sovereignty principle.

## Evidence

- path: "src/domain/duration.ts"
  loc: "1-4, 20-30"
  note: "`DurationInputs` is a DTO that accepts string values, and `parseNonNegativeInteger` handles transport-level parsing."
- path: "src/domain/wait-request.ts"
  loc: "9-14, 25-42"
  note: "`RawWaitInputs` defines raw string inputs, and `parseBooleanInput` parses these raw values inside the domain."
- path: "src/action/read-inputs.ts"
  loc: "4-10"
  note: "This boundary entry point relies on `normalizeWaitRequest` inside the domain layer instead of doing the parsing itself."

## Change Scope

- `src/domain/duration.ts`
- `src/domain/wait-request.ts`
- `src/action/read-inputs.ts`
