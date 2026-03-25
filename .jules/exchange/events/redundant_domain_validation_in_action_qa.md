---
label: "tests"
created_at: "2025-03-25"
author_role: "qa"
confidence: "high"
---

## Problem

The tests for the `readInputs` action adapter redundantly test domain-layer logic (boolean parsing and duration normalization) instead of just verifying that it correctly delegates raw inputs to the domain layer.

## Goal

Remove redundant tests in `tests/action/read-inputs.test.ts` that duplicate the domain layer tests (`tests/domain/duration.test.ts` and `tests/domain/wait-request.test.ts`), focusing only on the adapter logic (reading inputs from `@actions/core`).

## Context

`src/action/read-inputs.ts` retrieves strings from `@actions/core` and passes them to `normalizeWaitRequest`. The domain layer is responsible for parsing booleans, dropping empty labels, and resolving effective seconds. However, `tests/action/read-inputs.test.ts` asserts detailed behavior like rejecting non-integer seconds, dropping empty labels, parsing booleans (e.g. `enabled=off`), and prioritizing seconds over minutes. This violates the testing principle: "Tests assert externally observable behavior at the owning boundary, never duplicated knowledge of internal implementation". These tests are coupled to the domain layer's rules and will need to be updated unnecessarily if the domain logic changes.

## Evidence

- path: "tests/action/read-inputs.test.ts"
  loc: "54-63"
  note: "Test `parses false enabled values` tests the string parsing of `off`, which is already handled in `normalizeWaitRequest`."

- path: "tests/action/read-inputs.test.ts"
  loc: "65-74"
  note: "Test `trims labels and keeps non-empty values` duplicates testing of empty label handling."

- path: "tests/action/read-inputs.test.ts"
  loc: "76-87"
  note: "Test `fails for unrecognized boolean values` re-tests error throwing for unrecognized tokens."

- path: "tests/action/read-inputs.test.ts"
  loc: "26-52"
  note: "Tests for authoritative duration sources and minute conversions are re-testing `resolveEffectiveSeconds`."

## Change Scope

- `tests/action/read-inputs.test.ts`
