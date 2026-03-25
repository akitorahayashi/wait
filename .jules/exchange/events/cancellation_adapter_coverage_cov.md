---
label: "tests"
created_at: "2024-03-25"
author_role: "cov"
confidence: "high"
---

## Problem

The error handling branches inside `cancellationAwareDelay` in `src/adapters/cancellation-aware-delay.ts` are uncovered by tests, creating a risk that runtime errors during signal handler installation or timeout scheduling will silently cause test failures or production freezes without proper verification.

## Goal

Add tests to ensure that `cancellationAwareDelay` robustly propagates errors when `process.on` or `setTimeout` fail.

## Context

The coverage report clearly shows that lines 48-54 (signal handler installation try-catch), 58-59 (scheduleNextChunk early return for settled state), and 76-77 (setTimeout try-catch) in `src/adapters/cancellation-aware-delay.ts` are uncovered. Given that this code is an adapter at the boundary of the Node.js event loop and specifically deals with cancellation, verifying its error paths is critical to prevent hangs in the GitHub Action environment.

## Evidence

- path: "src/adapters/cancellation-aware-delay.ts"
  loc: "48-54, 58-59, 76-77"
  note: "Coverage report explicitly marks these lines as uncovered. They represent error handling and early-exit conditions in the delay adapter."

## Change Scope

- `tests/adapters/cancellation-aware-delay.test.ts`
