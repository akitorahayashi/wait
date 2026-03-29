---
label: "tests"
implementation_ready: false
---

## Goal

Refactor the `cancellation-aware-delay` tests to decouple assertions from internal implementation details like `setTimeout` and specific scheduling mechanisms, ensuring tests exclusively validate externally observable behavior.

## Problem

The current test suite for `cancellation-aware-delay` violates test design principles by tightly coupling itself to private implementation internals. By using `vi.spyOn(global, 'setTimeout')` to intercept inner callback functions (such as `scheduleNextChunk`) and manually executing them, the test asserts on knowledge of internal structure rather than boundary behavior. This results in brittle tests that fail unnecessarily if the underlying fulfillment mechanism (e.g., swapping `setTimeout` for `setImmediate` or a different polling strategy) changes, entirely defeating the reliability goals of unit testing.

## Context

By stubbing the internal logic with explicit spying and extracting internal functions, the test is bound intimately to the component's internal state. This creates highly brittle tests that fail on refactoring and fail to validate true externally observable behavior. Test suites must assert externally observable behavior at the owning boundary.

## Evidence

- source_event: "delay_implementation_coupling_qa.md"
  path: "tests/adapters/cancellation-aware-delay.test.ts"
  loc: "204-209"
  note: "Intercepts the callback provided to `setTimeout` manually capturing a private component function `scheduleNextChunk`."

- source_event: "delay_implementation_coupling_qa.md"
  path: "tests/adapters/cancellation-aware-delay.test.ts"
  loc: "223"
  note: "Arbitrarily executing the extracted internal function to stimulate a state outside the ordinary control flow."

## Change Scope

- `tests/adapters/cancellation-aware-delay.test.ts`

## Constraints

- Rely on fake timers provided by Vitest (`vi.useFakeTimers()`, `vi.advanceTimersByTimeAsync()`) to simulate passing time, rather than manually extracting and calling functions from spies.
- Retain edge case coverage while evaluating outputs from the public function boundary only.

## Acceptance Criteria

- `vi.spyOn(global, 'setTimeout')` is completely removed from the test file.
- The execution of internal functions (like `scheduleNextChunk`) is eliminated from the test logic.
- Tests effectively simulate the passage of time and state changes utilizing standard, non-invasive fake timer controls provided by the test framework.