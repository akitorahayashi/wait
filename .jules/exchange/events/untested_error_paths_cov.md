---
label: "tests"
created_at: "2024-03-29"
author_role: "observers"
confidence: "high"
---

## Problem

Several branch paths related to parameter validation are not covered by unit tests, leaving the boundary logic vulnerable to silent regressions where input validation is skipped or throws incorrectly.

## Goal

Ensure that edge-case parsing paths in input validation are explicitly tested to verify correct behavior.

## Context

Test coverage analysis shows that the `parseNonNegativeNumber` function in `src/domain/duration.ts` lacks coverage for branches throwing errors on empty inputs. Similarly, the `parseBooleanInput` function in `src/domain/wait-request.ts` lacks coverage for paths handling true boolean values, and `normalizeLabel` lacks coverage for length 0 labels. These paths represent logic that protect the application from invalid workflow inputs, making them critical for robustness.

## Evidence

- path: "src/domain/duration.ts"
  loc: "Lines 29-31"
  note: "Branch handling zero-length (empty) numeric input strings throws an Error but is not covered by tests."
- path: "src/domain/wait-request.ts"
  loc: "Lines 37-39"
  note: "Branch handling truthy boolean string inputs is not covered by tests."
- path: "src/domain/wait-request.ts"
  loc: "Line 53"
  note: "Branch handling length 0 labels is not fully covered by tests."

## Change Scope

- `tests/domain/duration.test.ts`
- `tests/domain/wait-request.test.ts`
