---
label: "refacts"
implementation_ready: false
---

## Goal

Refactor the domain models (`WaitRequest` and `Duration`) to decouple string parsing from core validation, model valid/invalid states explicitly via `Result<T, E>` types rather than thrown exceptions, and represent mutually exclusive duration inputs using discriminated unions.

## Problem

The domain currently suffers from three interconnected issues in its input handling and validation.

### Transport Leakage
Transport DTOs (`RawWaitInputs`, `DurationInputs`) and string parsing logic for inputs like `'true'`, `'yes'`, `'on'` reside within the core domain model instead of the entry boundary, violating Boundary Sovereignty.

### Implicit Validation Exceptions
Validation logic (`parseBooleanInput`, `parseNonNegativeNumber`) enforces assertions by globally throwing generic errors. This relies on caller try-catch rather than explicit error modeling.

### Invalid State Representation
The `DurationInputs` interface models state loosely with optional `minutes` and `seconds` properties, permitting logically impossible states (both defined). The current resolution logic handles this via a silent fallback to `seconds`, masking potential misconfigurations.

## Context

According to data architecture principles, boundary sovereignty requires the domain model to be kept independent of transport and UI string inputs. Validation logic should represent explicit valid and invalid states within type signatures using explicit error modeling (`Result<T, E>`) instead of implicit exceptions. Furthermore, utilizing discriminated unions enforces correct usage at compile time, eliminating invalid states and removing silent fallbacks that mask misconfigurations.

## Evidence

- source_event: "transport_dto_leak_data_arch.md"
  path: "src/domain/wait-request.ts"
  loc: "line 10-15"
  note: "`RawWaitInputs` defines string inputs which are typical of a transport layer (Action inputs), leaking into the domain module."

- source_event: "transport_dto_leak_data_arch.md"
  path: "src/domain/wait-request.ts"
  loc: "line 29-45"
  note: "`parseBooleanInput` handles string values parsing logic (e.g., `'1', 'true', 'yes', 'on'`), which belongs to a transport/action adapter rather than core domain."

- source_event: "transport_dto_leak_data_arch.md"
  path: "src/domain/duration.ts"
  loc: "line 1-4"
  note: "`DurationInputs` represents string inputs instead of a strongly-typed duration model, indicating boundary leakage."

- source_event: "implicit_validation_exceptions_data_arch.md"
  path: "src/domain/wait-request.ts"
  loc: "line 43-44"
  note: "`parseBooleanInput` implicitly enforces validation rules by throwing a generic Error."

- source_event: "implicit_validation_exceptions_data_arch.md"
  path: "src/domain/duration.ts"
  loc: "line 29-30"
  note: "`parseNonNegativeNumber` implicitly fails on an empty string by throwing an Error instead of returning a typed validation result."

- source_event: "implicit_validation_exceptions_data_arch.md"
  path: "src/domain/duration.ts"
  loc: "line 34-35"
  note: "`parseNonNegativeNumber` implicitly fails on unparseable or negative values by throwing an Error instead of returning a typed validation result."

- source_event: "duration_inputs_invalid_state_typescripter.md"
  path: "src/domain/duration.ts"
  loc: "1-4"
  note: "`DurationInputs` allows an object where both `minutes` and `seconds` are defined."

- source_event: "duration_inputs_invalid_state_typescripter.md"
  path: "src/domain/duration.ts"
  loc: "9-15"
  note: "`resolveEffectiveSeconds` silently handles the invalid state by falling back to `seconds` when both are defined."

## Change Scope

- `src/domain/duration.ts`
- `src/domain/wait-request.ts`
- `src/action/read-inputs.ts`
- `src/index.ts`

## Constraints

- Ensure any extraction of validation respects the existing requirements mapping valid truthy/falsy inputs.
- Result types (`Result<T, E>`) should clearly encode valid data `T` and explicit domain errors `E`.
- Do not add external validation libraries; rely on TypeScript's built-in type capabilities (like discriminated unions and mapped types).

## Acceptance Criteria

- `DurationInputs` is replaced or refactored to a discriminated union, making invalid simultaneous input combinations unrepresentable at compile time.
- String parsing logic for input values is moved out of the core domain boundaries to an adapter or action layer.
- Domain validation functions return explicit `Result<T, E>` types instead of using `throw new Error(...)` to signal invalid states.
- Silent fallbacks when resolving mutually exclusive properties are removed, replaced by deterministic failure or explicit validation feedback.
