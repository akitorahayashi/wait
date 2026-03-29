---
label: "refacts"
created_at: "2024-03-29"
author_role: "typescripter"
confidence: "high"
---

## Problem

The `DurationInputs` interface models state as an object containing optional `minutes` and `seconds` string properties. This loosely typed design permits an invalid state where both properties are defined simultaneously, which is logically inconsistent for an either/or input configuration. `resolveEffectiveSeconds` handles this ambiguously by silently prioritizing `seconds` over `minutes` without informing the user that `minutes` was ignored.

## Goal

Model the duration input state explicitly using a discriminated union so that only valid combinations (either `minutes` or `seconds`, or neither) can be represented by the type system. In `resolveEffectiveSeconds`, remove the silent fallback to enforce deterministic and explicit failure semantics or validation if invalid combinations are somehow encountered.

## Context

Using loosely defined optional properties to represent mutually exclusive states leads to type confusion and "impossible" states being technically representable. Silent fallbacks at runtime mask misconfigurations, leading to confusing behavior. Refactoring to a discriminated union enforces correct usage at compile time, aligning with "make invalid states unrepresentable" and ensuring failure semantics are explicit.

## Evidence

- path: "src/domain/duration.ts"
  loc: "1-4"
  note: "`DurationInputs` allows an object where both `minutes` and `seconds` are defined."
- path: "src/domain/duration.ts"
  loc: "9-15"
  note: "`resolveEffectiveSeconds` silently handles the invalid state by falling back to `seconds` when both are defined."

## Change Scope

- `src/domain/duration.ts`
- `src/domain/wait-request.ts`