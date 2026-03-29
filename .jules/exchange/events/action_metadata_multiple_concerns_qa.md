---
label: "tests"
created_at: "2026-03-29"
author_role: "qa"
confidence: "high"
---

## Problem

The test `action-metadata.test.ts` violates the anti-pattern "Single tests asserting multiple unrelated concerns". It bundles the verification of the Node environment, entry points, inputs configuration, and outputs specification into one ambiguous test.

## Goal

To separate these unrelated assertions into distinct, well-isolated tests so that a failure in one area (like input changes) doesn't obscure the status of others (like environment configuration).

## Context

Testing unrelated concerns in a single block leads to ambiguous failures, increasing recovery cost and time-to-fix. If one assertion fails, the execution stops and hides the validity of subsequent assertions, requiring multiple cycles to ensure everything works correctly.

## Evidence

- path: "tests/action/action-metadata.test.ts"
  loc: "22-32"
  note: "This single `it` block contains 8 assertions covering multiple distinct, unrelated concerns: runs structure, inputs structure, and outputs structure."

## Change Scope

- `tests/action/action-metadata.test.ts`
