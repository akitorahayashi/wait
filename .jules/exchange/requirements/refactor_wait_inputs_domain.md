---
label: "bugs"
implementation_ready: false
---

## Goal

Encode invariants and validation failures explicitly so invalid states are hard to express and errors are handled comprehensively without implicit panics/unwraps.

Model the duration input state using a discriminated union so that only valid, mutually exclusive inputs are representable, and exhaustively handle these states without silent fallbacks.

Move raw input schemas and parsing logic out of the `domain` layer and into the boundary layers (e.g., `action/read-inputs.ts`), so the domain only deals with valid, parsed types.

Consolidate the definition of input wait parameters so there's a single source of truth for all action inputs, avoiding repetitive types and explicit translation mapping.

## Problem

Validation failures for inputs (e.g., non-negative integers or recognized booleans) implicitly throw generic `Error` instances instead of explicitly modeling errors (e.g., via Result types or typed validation errors).

`DurationInputs` models state as a combination of optional string flags (`minutes?: string`, `seconds?: string`), permitting invalid or ambiguous combinations (e.g., both provided, neither provided).

Transport DTOs (`RawWaitInputs`, `DurationInputs`) and raw string-parsing logic (`parseBooleanInput`, `parseNonNegativeInteger`) are improperly located within the core `domain` layer instead of at the boundaries.

The definition of time parameters (`minutes` and `seconds`) is duplicated across `DurationInputs` and `RawWaitInputs`.

## Context

Using `throw new Error(...)` for expected validation issues obscures the data flow and prevents callers from handling specific error states programmatically. It violates the "Represent Valid States Only" principle and explicit error modeling guidelines.

The `typescripter` role emphasizes making invalid states unrepresentable by using discriminated unions instead of loose optional fields. Currently, `resolveEffectiveSeconds` accepts the loose `DurationInputs` object. If both `seconds` and `minutes` are provided, it silently prioritizes `seconds` and ignores `minutes`. If neither is provided, it silently returns `0`. This violates the principle of explicitly failing on invalid states and avoiding silent fallbacks.

The domain should remain independent of transport/UI/runtime concerns. Currently, `src/domain/wait-request.ts` and `src/domain/duration.ts` handle string inputs directly from the GitHub Actions runner environment, which violates the Boundary Sovereignty principle.

The Single Source of Truth principle dictates that a concept should only be modeled once. Having `minutes` and `seconds` on both `RawWaitInputs` and `DurationInputs` causes mapping logic (`normalizeWaitRequest` calling `resolveEffectiveSeconds({ minutes: raw.minutes, seconds: raw.seconds })`) that creates unnecessary coupling and potential drift.

## Evidence

- source_event: "implicit_validation_errors_data_arch.md"
  path: "src/domain/duration.ts"
  loc: "25-27"
  note: "`parseNonNegativeInteger` throws a generic `Error` if the regex fails."
- source_event: "implicit_validation_errors_data_arch.md"
  path: "src/domain/wait-request.ts"
  loc: "40-42"
  note: "`parseBooleanInput` throws a generic `Error` when the boolean value is unrecognized."
- source_event: "implicit_validation_errors_data_arch.md"
  path: "src/index.ts"
  loc: "24-27"
  note: "The top-level handler blindly catches `Error` and calls `core.setFailed`, lacking typed error differentiation."
- source_event: "duration_inputs_invalid_combinations_typescripter.md"
  path: "src/domain/duration.ts"
  loc: "1-4"
  note: "DurationInputs uses optional primitives, allowing invalid combinations like {minutes: '1', seconds: '60'} or {}."
- source_event: "duration_inputs_invalid_combinations_typescripter.md"
  path: "src/domain/duration.ts"
  loc: "8-21"
  note: "resolveEffectiveSeconds silently prioritizes seconds over minutes, and returns 0 if neither is provided, acting as a prohibited silent fallback."
- source_event: "transport_dtos_in_domain_data_arch.md"
  path: "src/domain/duration.ts"
  loc: "1-4, 20-30"
  note: "`DurationInputs` is a DTO that accepts string values, and `parseNonNegativeInteger` handles transport-level parsing."
- source_event: "transport_dtos_in_domain_data_arch.md"
  path: "src/domain/wait-request.ts"
  loc: "9-14, 25-42"
  note: "`RawWaitInputs` defines raw string inputs, and `parseBooleanInput` parses these raw values inside the domain."
- source_event: "transport_dtos_in_domain_data_arch.md"
  path: "src/action/read-inputs.ts"
  loc: "4-10"
  note: "This boundary entry point relies on `normalizeWaitRequest` inside the domain layer instead of doing the parsing itself."
- source_event: "redundant_duration_inputs_data_arch.md"
  path: "src/domain/duration.ts"
  loc: "1-4"
  note: "`DurationInputs` defines `minutes?: string` and `seconds?: string`."
- source_event: "redundant_duration_inputs_data_arch.md"
  path: "src/domain/wait-request.ts"
  loc: "9-14"
  note: "`RawWaitInputs` redundantly defines `minutes?: string` and `seconds?: string` alongside other inputs."
- source_event: "redundant_duration_inputs_data_arch.md"
  path: "src/domain/wait-request.ts"
  loc: "19-20"
  note: "`normalizeWaitRequest` unpacks these parameters explicitly to pass them into `resolveEffectiveSeconds`."

## Change Scope

- `src/domain/duration.ts`
- `src/domain/wait-request.ts`
- `src/index.ts`
- `src/action/read-inputs.ts`

## Constraints

- Ensure no regressions in existing functionality.
- Adhere to the principles defined in the root context.

## Acceptance Criteria

- The goals specified are fully achieved.
- The problems described are completely resolved.
