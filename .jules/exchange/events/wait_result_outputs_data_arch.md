---
label: "refacts"
created_at: "2026-03-27"
author_role: "data_arch"
confidence: "medium"
---

## Problem

`WaitResult` acts as both the internal domain representation of a finished wait action and the transport/output layer interface, meaning its fields directly couple to GitHub Actions outputs without a formal transformation boundary.

## Goal

Separate the pure domain model of `WaitResult` from the `emitOutputs` layer. Create an explicit transformation step between the internal representation of what happened (e.g. `startedAt`, `endedAt`, `duration`, `status`) and what gets emitted to `@actions/core`.

## Context

`WaitResult` holds `waited` (boolean) and `effectiveSeconds` (number) which happens to be exactly what gets emitted as outputs. It does not carry meaningful domain information about the action state, simply transport DTO fields.

## Evidence

- path: "src/domain/wait-result.ts"
  loc: "1-4"
  note: "Defines output fields directly, strongly resembling an Actions output format rather than capturing meaningful domain state."
- path: "src/action/emit-outputs.ts"
  loc: "4-7"
  note: "`emitOutputs` relies on `WaitResult` directly matching output parameter names in meaning."

## Change Scope

- `src/domain/wait-result.ts`
- `src/action/emit-outputs.ts`
