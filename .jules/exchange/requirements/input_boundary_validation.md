---
label: "refacts"
implementation_ready: false
---

## Goal

Strengthen input boundary parsing and validation without throwing errors, and decouple domain structures from transport terminology.

## Problem

Input validation is scattered and uses transport-specific naming ('Inputs') in the domain. Instead of using explicit result types, validation throws panics. Additionally, boolean and label parsing paths lack test coverage, masking boundary errors.

## Context

The system currently reads string inputs from GitHub Actions (`@actions/core`) in `src/action/read-inputs.ts` and maps them directly using `normalizeWaitRequest` in `src/domain/wait-request.ts`. The normalization functions (`parseBooleanInput`, `resolveEffectiveSeconds`) throw runtime errors for invalid inputs. This violates the principle of explicit error modeling (using result/either types instead of panics) and boundary sovereignty (transport concerns like `RawWaitInputs` are inside the `domain` folder). In `src/action/read-inputs.ts` and `src/domain/wait-request.ts`, `readInputs()` generates `RawWaitInputs` with string or undefined values which are then transformed by `normalizeWaitRequest`. The external system (GitHub) only provides strings; these should be parsed immediately to domain types (`number`, `boolean`) at the boundary rather than passing around `string | undefined` within an interface that implies the inputs have entered the application domain. The domain files `wait-request.ts` and `duration.ts` define types `RawWaitInputs` and `DurationInputs`. This implies the domain is aware of how it is invoked (via GitHub Action inputs). The Domain should model the problem space independently. A more domain-appropriate name for unparsed, transport-agnostic data would be something like `RawWaitRequest` and `RawDuration` or `UnvalidatedDuration`. Test coverage analysis shows that specific branches in `src/domain/wait-request.ts` are uncovered. For example, `parseBooleanInput`'s branch checking for truthy values (`'1'`, `'true'`, `'yes'`, `'on'`) and `normalizeLabel`'s branch checking for empty string and returning `undefined` or a non-empty string.

## Evidence

- source_event: "domain_inputs_leak_taxonomy.md"
  path: "src/domain/wait-request.ts"
  loc: "9-14"
  note: "`RawWaitInputs` uses the word 'Inputs', leaking the action input concept into the Domain layer."

- source_event: "unvalidated_record_boundary_typescripter.md"
  path: "src/action/read-inputs.ts"
  loc: "line 5"
  note: "`readInputs` returns domain type `WaitRequest` but passes strings to `normalizeWaitRequest`, mixing boundary parsing with domain instantiation."

- source_event: "wait_request_validation_data_arch.md"
  path: "src/domain/wait-request.ts"
  loc: "47"
  note: "`parseBooleanInput` throws a runtime error instead of explicit error modeling."

- source_event: "wait_request_validation_data_arch.md"
  path: "src/domain/duration.ts"
  loc: "19-21"
  note: "`parseNonNegativeInteger` throws a runtime error instead of explicit error modeling."

- source_event: "wait_request_validation_data_arch.md"
  path: "src/action/read-inputs.ts"
  loc: "4-11"
  note: "Reads raw strings from action core and directly passes them to domain logic which may throw."

- source_event: "domain_inputs_leak_taxonomy.md"
  path: "src/domain/duration.ts"
  loc: "line 1"
  note: "`DurationInputs` uses the word 'Inputs', unnecessarily associating raw temporal duration values with the action transport mechanism."

- source_event: "unvalidated_record_boundary_typescripter.md"
  path: "src/domain/wait-request.ts"
  loc: "9-14"
  note: "`RawWaitInputs` uses primitive strings, pushing external data validation deeper into the app instead of validating at the entry edge."

- source_event: "wait_request_validation_data_arch.md"
  path: "src/domain/wait-request.ts"
  loc: "12-17"
  note: "`RawWaitInputs` is a transport DTO (stringly typed inputs from Action) leaking into the `domain` module."

- source_event: "untested_boolean_and_label_paths_cov.md"
  path: "src/domain/wait-request.ts"
  loc: "37-39"
  note: "Branch parsing truthy boolean tokens (like 'true', '1') is untested."

- source_event: "untested_boolean_and_label_paths_cov.md"
  path: "src/domain/wait-request.ts"
  loc: "55"
  note: "The ternary operator `value.length === 0 ? undefined : value` in normalizeLabel is untested, leaving empty string checking unverified."

## Change Scope

- `src/domain/wait-request.ts`
- `src/domain/duration.ts`
- `src/action/read-inputs.ts`
- `tests/domain/wait-request.test.ts`

## Constraints

- Validation should use explicit error modeling rather than throwing errors.
- External raw values must be parsed at the edge into domain models without intermediate transport-coupled domain types.

## Acceptance Criteria

- Domain inputs are renamed to decouple from transport terminology (e.g., `RawWaitRequest` instead of `RawWaitInputs`).
- `parseBooleanInput` and `resolveEffectiveSeconds` return error objects/Results rather than throwing.
- Tests cover `parseBooleanInput` and `normalizeLabel` fully.
- Boundary inputs are converted from `unknown`/`string` directly to domain types at the edge.
