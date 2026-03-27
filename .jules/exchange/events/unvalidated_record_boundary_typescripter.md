---
label: "bugs"
created_at: "2026-03-27"
author_role: "typescripter"
confidence: "medium"
---

## Problem

`RawWaitInputs` assumes specific string types are present without true boundary validation on external environment data (GitHub inputs), resulting in `normalizeWaitRequest` accepting loosely parsed primitives and possibly masking type errors at the API edge.

## Goal

Strengthen boundary type integrity by fully parsing GitHub input strings from `unknown` into `WaitRequest` at the read step, removing the intermediate loosely-typed `RawWaitInputs` interface that merely delegates parsing deeper into the core.

## Context

In `src/action/read-inputs.ts` and `src/domain/wait-request.ts`, `readInputs()` generates `RawWaitInputs` with string or undefined values which are then transformed by `normalizeWaitRequest`. The external system (GitHub) only provides strings; these should be parsed immediately to domain types (`number`, `boolean`) at the boundary rather than passing around `string | undefined` within an interface that implies the inputs have entered the application domain.

## Evidence

- path: "src/domain/wait-request.ts"
  loc: "line 9"
  note: "`RawWaitInputs` uses primitive strings, pushing external data validation deeper into the app instead of validating at the entry edge."
- path: "src/action/read-inputs.ts"
  loc: "line 5"
  note: "`readInputs` returns domain type `WaitRequest` but passes strings to `normalizeWaitRequest`, mixing boundary parsing with domain instantiation."

## Change Scope

- `src/domain/wait-request.ts`
- `src/action/read-inputs.ts`
