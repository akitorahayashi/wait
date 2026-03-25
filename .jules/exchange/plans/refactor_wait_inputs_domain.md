---
label: "bugs"
---

## Goal

Encode invariants and validation failures explicitly so invalid states are hard to express and errors are handled comprehensively without implicit panics/unwraps. Model the duration input state using a discriminated union, move raw string parsing out of the domain into the boundary layers (`src/action/read-inputs.ts`), and consolidate input wait parameters to act as a single source of truth.

## Current State

The codebase currently allows invalid data to propagate, handles missing data with silent defaults, uses generic errors instead of explicit failure states, and leaks transport parsing logic into the domain layer.
- `src/domain/duration.ts`: `DurationInputs` permits invalid string combinations for time inputs. `resolveEffectiveSeconds` falls back to `0` instead of rejecting missing/invalid input combinations explicitly. `parseNonNegativeInteger` parses raw strings and throws generic `Error`s.
- `src/domain/wait-request.ts`: `RawWaitInputs` duplicates parameters (`minutes` and `seconds`) found in `DurationInputs`. `parseBooleanInput` and `normalizeWaitRequest` perform transport string parsing within the domain and throw generic `Error`s.
- `src/action/read-inputs.ts`: Operates only as a pass-through for raw strings to the domain layer instead of owning string parsing, boundary validation, and constructing valid domain entities.
- `src/index.ts`: The entry point catches generic `Error`s and sets generic failures, making it impossible to differentiate specific validation failures.

## Plan

1. Implement explicit Result types or typed validation error classes to represent validation failures. Update `src/index.ts` to match these typed error boundaries rather than blindly catching generic `Error` types.
2. In `src/domain/duration.ts`, replace `DurationInputs` with a discriminated union (e.g., `{ type: 'minutes', value: number } | { type: 'seconds', value: number } | { type: 'none' }`). Remove `parseNonNegativeInteger`. Refactor `resolveEffectiveSeconds` to exhaustively match the discriminated union.
3. In `src/domain/wait-request.ts`, remove `RawWaitInputs`, `parseBooleanInput`, and `normalizeWaitRequest`. Define the domain structures explicitly around the parsed discriminated union and validated primitives.
4. Update `src/action/read-inputs.ts` to perform all raw transport string parsing (numbers, booleans). Ensure it returns explicit errors or a guaranteed valid `WaitRequest` using the new discriminated union and validated domain objects.
5. Update unit and integration tests to verify the boundary level validation rules explicitly reject invalid combinations, test exact state evaluations for the discriminated union in the domain, and remove assertions for prior silent fallback behavior.

## Acceptance Criteria

- The duration input state is modeled as a discriminated union so that only mutually exclusive inputs are representable.
- Domain modules (`src/domain/duration.ts`, `src/domain/wait-request.ts`) are free of raw input schemas and transport-level string parsing.
- Validation failures are explicitly modeled using typed errors or Result types; no generic `Error` instances are thrown for expected validation issues.
- Missing or invalid input combinations fail explicitly rather than silently falling back to a default value like `0`.

## Risks

- Call sites and tests depending on the previous silent fallback behavior or generic error catching will break and must be updated.
- Existing action runner tests might fail if they expect an input parsing failure to manifest as a generic `Error` rather than a typed validation failure.