---
label: "refacts"
created_at: "2026-03-27"
author_role: "data_arch"
confidence: "high"
---

## Problem

Data validation and normalization for input parameters are scattered across `WaitRequest` creation instead of being encapsulated at the boundary, and implicit error modeling is used instead of explicit result types. Types like `WaitRequest` allow invalid states if bypassed, and `RawWaitInputs` vs `WaitRequest` shows transport DTOs leaking into core domain logic. Also, `parseBooleanInput` and `resolveEffectiveSeconds` use panics/throws for validation.

## Goal

Ensure strong boundary sovereignty and representation of valid states only. Create a robust conversion boundary from raw string inputs to a valid domain model (`WaitRequest`). Validation should use explicit error modeling rather than throwing errors.

## Context

The system currently reads string inputs from GitHub Actions (`@actions/core`) in `src/action/read-inputs.ts` and maps them directly using `normalizeWaitRequest` in `src/domain/wait-request.ts`. The normalization functions (`parseBooleanInput`, `resolveEffectiveSeconds`) throw runtime errors for invalid inputs. This violates the principle of explicit error modeling (using result/either types instead of panics) and boundary sovereignty (transport concerns like `RawWaitInputs` are inside the `domain` folder).

## Evidence

- path: "src/domain/wait-request.ts"
  loc: "12-17"
  note: "`RawWaitInputs` is a transport DTO (stringly typed inputs from Action) leaking into the `domain` module."
- path: "src/domain/wait-request.ts"
  loc: "44-46"
  note: "`parseBooleanInput` throws a runtime error instead of explicit error modeling."
- path: "src/domain/duration.ts"
  loc: "19-21"
  note: "`parseNonNegativeInteger` throws a runtime error instead of explicit error modeling."
- path: "src/action/read-inputs.ts"
  loc: "4-11"
  note: "Reads raw strings from action core and directly passes them to domain logic which may throw."

## Change Scope

- `src/domain/wait-request.ts`
- `src/domain/duration.ts`
- `src/action/read-inputs.ts`
