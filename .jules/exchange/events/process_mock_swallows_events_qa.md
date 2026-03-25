---
label: "tests"
created_at: "2025-03-25"
author_role: "qa"
confidence: "high"
---

## Problem

The test utility `captureSignalHandlers` in `cancellation-aware-delay.test.ts` replaces `process.on` and `process.off` with spies, but its mock implementation swallows all events that are not `'SIGINT'` or `'SIGTERM'`.

## Goal

Fix the `captureSignalHandlers` mock to delegate non-signal events back to the original `process.on` and `process.off` implementations, so the test runner or other libraries are not disrupted.

## Context

In `tests/adapters/cancellation-aware-delay.test.ts`, the `captureSignalHandlers` function uses `vi.spyOn(process, 'on').mockImplementation(...)`. If the event is not `SIGINT` or `SIGTERM`, it simply returns `process` without actually registering the listener with the real `process.on`. This can cause unpredictable and flaky behavior in tests if the test runner (like vitest) or other parts of the Node process attempt to register event listeners (e.g., for `uncaughtException`, `unhandledRejection`, `exit`, etc.) while the mock is active. The original behavior must be preserved for any unrelated event.

## Evidence

- path: "tests/adapters/cancellation-aware-delay.test.ts"
  loc: "14-22"
  note: "The `onSpy` mock implementation checks if the event is SIGINT or SIGTERM, but returns `process` unconditionally without calling the original `process.on` for other events."

- path: "tests/adapters/cancellation-aware-delay.test.ts"
  loc: "24-30"
  note: "The `offSpy` mock implementation has the same issue, swallowing removal of listeners for all other events."

## Change Scope

- `tests/adapters/cancellation-aware-delay.test.ts`
