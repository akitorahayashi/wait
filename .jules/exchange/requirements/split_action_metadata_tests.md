---
label: "tests"
implementation_ready: true
---

## Goal

Separate distinct and unrelated assertions regarding the GitHub action metadata into isolated test blocks to ensure unambiguous test failures and precise reporting.

## Problem

The test file `action-metadata.test.ts` contains a single monolithic `it` block asserting multiple unrelated configurations (e.g., node environment setup, inputs structure, outputs specification). This violates the "Single tests asserting multiple unrelated concerns" anti-pattern. A failure early in the block will mask potential failures later in the block, forcing iterative and slow test cycles.

## Context

Testing unrelated concerns in a single block leads to ambiguous failures, increasing recovery cost and time-to-fix. If one assertion fails, the execution stops and hides the validity of subsequent assertions, requiring multiple cycles to ensure everything works correctly.

## Evidence

- source_event: "action_metadata_multiple_concerns_qa.md"
  path: "tests/action/action-metadata.test.ts"
  loc: "22-32"
  note: "This single `it` block contains 8 assertions covering multiple distinct, unrelated concerns: runs structure, inputs structure, and outputs structure."

## Change Scope

- `tests/action/action-metadata.test.ts`

## Constraints

- Continue using Vitest test runner.
- Maintain identical coverage (all 8 assertions must still be executed).

## Acceptance Criteria

- The monolithic test block in `action-metadata.test.ts` is divided into multiple smaller `it` blocks.
- Each new `it` block focuses on verifying exactly one logical concern (e.g., one block for runs structure, another for inputs structure, another for outputs structure).