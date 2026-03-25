---
label: "tests"
implementation_ready: false
---

## Goal

Add a test for `cancellationAwareDelay` that verifies it correctly loops for durations > 60 seconds and still responds to cancellation signals during subsequent chunks.

Fix the `captureSignalHandlers` mock to delegate non-signal events back to the original `process.on` and `process.off` implementations, so the test runner or other libraries are not disrupted.

Add tests to ensure that `cancellationAwareDelay` robustly propagates errors when `process.on` or `setTimeout` fail.

## Problem

`cancellationAwareDelay` has complex looping logic to handle delays longer than 60 seconds (chunking), but there are no tests verifying this behavior. The maximum tested duration is 60 seconds.

The test utility `captureSignalHandlers` in `cancellation-aware-delay.test.ts` replaces `process.on` and `process.off` with spies, but its mock implementation swallows all events that are not `'SIGINT'` or `'SIGTERM'`.

The error handling branches inside `cancellationAwareDelay` in `src/adapters/cancellation-aware-delay.ts` are uncovered by tests, creating a risk that runtime errors during signal handler installation or timeout scheduling will silently cause test failures or production freezes without proper verification.

## Context

The `cancellationAwareDelay` adapter contains an internal loop (`scheduleNextChunk`) to process long delays in 60-second increments (`SECONDS_PER_DELAY_CHUNK`). This is a critical piece of logic to prevent Node.js from warning about excessively large timeouts or hitting maximum timeout limits. The tests in `tests/adapters/cancellation-aware-delay.test.ts` only cover up to 60 seconds, leaving the looping logic completely untested. An error in the remaining duration calculation or re-scheduling could cause incorrect behavior for long waits.

In `tests/adapters/cancellation-aware-delay.test.ts`, the `captureSignalHandlers` function uses `vi.spyOn(process, 'on').mockImplementation(...)`. If the event is not `SIGINT` or `SIGTERM`, it simply returns `process` without actually registering the listener with the real `process.on`. This can cause unpredictable and flaky behavior in tests if the test runner (like vitest) or other parts of the Node process attempt to register event listeners (e.g., for `uncaughtException`, `unhandledRejection`, `exit`, etc.) while the mock is active. The original behavior must be preserved for any unrelated event.

The coverage report clearly shows that lines 48-54 (signal handler installation try-catch), 58-59 (scheduleNextChunk early return for settled state), and 76-77 (setTimeout try-catch) in `src/adapters/cancellation-aware-delay.ts` are uncovered. Given that this code is an adapter at the boundary of the Node.js event loop and specifically deals with cancellation, verifying its error paths is critical to prevent hangs in the GitHub Action environment.

## Evidence

- source_event: "missing_chunked_delay_coverage_qa.md"
  path: "tests/adapters/cancellation-aware-delay.test.ts"
  loc: "44-51"
  note: "Test `resolves after the requested duration` only tests a 2-second delay."
- source_event: "missing_chunked_delay_coverage_qa.md"
  path: "tests/adapters/cancellation-aware-delay.test.ts"
  loc: "53-69"
  note: "Test `cancels promptly on SIGINT` only tests a 60-second delay (the exact chunk size), never triggering the >60s loop condition."
- source_event: "missing_chunked_delay_coverage_qa.md"
  path: "tests/adapters/cancellation-aware-delay.test.ts"
  loc: "71-87"
  note: "Test `cancels promptly on SIGTERM` also only tests a 60-second delay."
- source_event: "process_mock_swallows_events_qa.md"
  path: "tests/adapters/cancellation-aware-delay.test.ts"
  loc: "14-22"
  note: "The `onSpy` mock implementation checks if the event is SIGINT or SIGTERM, but returns `process` unconditionally without calling the original `process.on` for other events."
- source_event: "process_mock_swallows_events_qa.md"
  path: "tests/adapters/cancellation-aware-delay.test.ts"
  loc: "24-30"
  note: "The `offSpy` mock implementation has the same issue, swallowing removal of listeners for all other events."
- source_event: "cancellation_adapter_coverage_cov.md"
  path: "src/adapters/cancellation-aware-delay.ts"
  loc: "48-54, 58-59, 76-77"
  note: "Coverage report explicitly marks these lines as uncovered. They represent error handling and early-exit conditions in the delay adapter."

## Change Scope

- `tests/adapters/cancellation-aware-delay.test.ts`

## Constraints

- Ensure no regressions in existing functionality.
- Adhere to the principles defined in the root context.

## Acceptance Criteria

- The goals specified are fully achieved.
- The problems described are completely resolved.
