---
label: "refacts"
implementation_ready: false
---

## Goal

Separate pure domain model for action results from transport output schema.

## Problem

`WaitResult` acts as both the internal domain representation and the transport output layer interface, directly coupling its fields to GitHub Actions outputs.

## Context

`WaitResult` holds `waited` (boolean) and `effectiveSeconds` (number) which happens to be exactly what gets emitted as outputs. It does not carry meaningful domain information about the action state, simply transport DTO fields.

## Evidence

- source_event: "wait_result_outputs_data_arch.md"
  path: "src/domain/wait-result.ts"
  loc: "1-4"
  note: "Defines output fields directly, strongly resembling an Actions output format rather than capturing meaningful domain state."

- source_event: "wait_result_outputs_data_arch.md"
  path: "src/action/emit-outputs.ts"
  loc: "4-7"
  note: "`emitOutputs` relies on `WaitResult` directly matching output parameter names in meaning."

## Change Scope

- `src/domain/wait-result.ts`
- `src/action/emit-outputs.ts`

## Constraints

- Output DTOs should not be the same type as domain results.

## Acceptance Criteria

- `WaitResult` represents a pure domain model of action completion.
- `emitOutputs` transforms the pure domain model into the required GitHub Actions outputs.
