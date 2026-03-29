---
label: "refacts"
---

## Goal

Refactor the domain models (`WaitRequest` and `Duration`) to decouple string parsing from core validation, explicitly model valid/invalid states via `Result<T, E>` types instead of throwing exceptions, and represent mutually exclusive duration inputs using discriminated unions.

## Current State

The domain currently suffers from transport leakage, implicit validation exceptions, and invalid state representations, violating boundary sovereignty and explicit error modeling principles.
- `src/domain/duration.ts`: Models `DurationInputs` loosely with optional `minutes` and `seconds` properties, permitting logically impossible states (both defined) which are silently resolved. `parseNonNegativeNumber` enforces validation by globally throwing generic errors instead of explicit valid/invalid states.
- `src/domain/wait-request.ts`: `RawWaitInputs` defines string inputs representing a transport leak into the domain module. `parseBooleanInput` handles string parsing logic and implicitly enforces validation rules by throwing a generic Error, both of which belong in a transport adapter.
- `src/action/read-inputs.ts`: Reads string inputs but passes them directly into `normalizeWaitRequest` without converting strings to domain primitives or handling validation.
- `src/index.ts`: Relies on top-level unhandled exception catches to fail the action, instead of acting upon deterministic explicit failure states returned from validation.
- `tests/domain/duration.test.ts`: Asserts string-based inputs and validates that `resolveEffectiveSeconds` throws exceptions upon error conditions.
- `tests/domain/wait-request.test.ts`: Asserts that `normalizeWaitRequest` can parse 'false' and throws on unparseable string inputs.

## Plan

1. Introduce Result Type
   - Create `src/domain/result.ts` exporting a `Result` type (such as `{ ok: true; value: T } | { ok: false; error: E }`) to replace error throwing.
2. Refactor Duration Model
   - Modify `src/domain/duration.ts` to replace `DurationInputs` with a discriminated union representing mutually exclusive valid inputs (for example, `{ minutes: number } | { seconds: number } | {}`).
   - Remove silent fallback in `resolveEffectiveSeconds` by utilizing the discriminated union.
   - Refactor validation logic to return `Result<number, Error>` instead of throwing.
   - Update `resolveEffectiveSeconds` to return `Result<number, Error>`.
3. Refactor WaitRequest Model
   - Modify `src/domain/wait-request.ts` to remove `RawWaitInputs` and move string parsing (`parseBooleanInput`) out of the domain boundary.
   - Rename `normalizeWaitRequest` to `createWaitRequest` to accept strictly typed parameters, mapping to the new domain primitive values and duration discriminated union.
   - Update `createWaitRequest` to return `Result<WaitRequest, Error>`.
4. Update Input Adapter
   - Modify `src/action/read-inputs.ts` to move `parseBooleanInput` into this file or an associated action module to parse strings into booleans.
   - Implement mutual exclusivity checks for duration inputs. If both strings are defined, fail explicitly.
   - Parse numeric strings to primitive numbers.
   - Pass strongly-typed values into `createWaitRequest` and return the `Result<WaitRequest, Error>`.
5. Update Action Entrypoint
   - Modify `src/index.ts` to handle the returned `Result` from `readInputs()` (or modified input handling). If it is a failure state, log and exit appropriately via `core.setFailed()` instead of relying on a top-level `catch`.
6. Update Tests
   - Modify `tests/domain/duration.test.ts` to assert `Result` ok/error types instead of `toThrow` assertions and use correctly typed inputs instead of transport-level string models.
   - Modify `tests/domain/wait-request.test.ts` to use correctly typed inputs instead of transport-level string models.
   - Modify `tests/action/read-inputs.test.ts` to assert that string translation and validation yield explicit failures or proper parsed results.

## Acceptance Criteria

- `DurationInputs` is replaced or refactored to a discriminated union, making invalid simultaneous input combinations unrepresentable at compile time.
- String parsing logic for input values is moved out of the core domain boundaries to an adapter or action layer.
- Domain validation functions return explicit `Result<T, E>` types instead of using `throw new Error(...)` to signal invalid states.
- Silent fallbacks when resolving mutually exclusive properties are removed, replaced by deterministic failure or explicit validation feedback.

## Risks

- Pushing string-to-boolean and string-to-number parsing to the action boundary might swallow configuration errors if not handled correctly (e.g. `parseInt` anomalies).
- Changes to `tests/domain` models must guarantee existing test coverage is ported to the explicit `Result` assertions without losing any functional testing.
- Returning `Result<T, E>` up to `src/index.ts` implies refactoring how the run phase manages lifecycle. Failing to interpret `Result` errors correctly may suppress action failures.
