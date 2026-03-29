---
label: "tests"
created_at: "2026-03-29"
author_role: "qa"
confidence: "high"
---

## Problem

The test `cancellation-aware-delay.test.ts` violates the anti-pattern "Over-coupling tests to private implementation details". Specifically, it spies on `setTimeout` to extract a callback representing `scheduleNextChunk` and then manually executes it to simulate an edge case.

## Goal

Refactor the tests so they exercise externally observable behavior and do not break if the internal mechanism of fulfilling the delay changes from `setTimeout` to an alternative implementation.

## Context

By stubbing the internal logic with `vi.spyOn(global, 'setTimeout')` and extracting internal functions like `scheduleNextChunk`, the test is bound intimately to the component's internal state. This creates highly brittle tests that fail on refactoring, and fail to validate true, externally observable behavior, defeating the purpose of unit testing.

## Evidence

- path: "tests/adapters/cancellation-aware-delay.test.ts"
  loc: "204-209"
  note: "Intercepts the callback provided to `setTimeout` manually capturing a private component function `scheduleNextChunk`."
- path: "tests/adapters/cancellation-aware-delay.test.ts"
  loc: "223"
  note: "Arbitrarily executing the extracted internal function to stimulate a state outside the ordinary control flow."

## Change Scope

- `tests/adapters/cancellation-aware-delay.test.ts`
