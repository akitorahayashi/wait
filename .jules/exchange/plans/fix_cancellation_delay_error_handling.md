---
label: "bugs"
---

## Goal

Preserve original error context when catching failures in `cancellationAwareDelay`, constrain the `WaitCancelledError` signal type to explicit handled signals, and make the `signalExitCode` switch statement exhaustive.

## Current State

- `src/adapters/cancellation-aware-delay.ts`: `WaitCancelledError` accepts an overly broad `NodeJS.Signals` type. In `cancellationAwareDelay`, `catch` blocks for `process.on` and `setTimeout` swallow the original error and replace it with a generic message, hiding the runtime evidence of why it failed.
- `src/index.ts`: `signalExitCode` switches on the broad `NodeJS.Signals` type and includes a `default` case, preventing the compiler from exhaustively checking for known handled signals.

## Plan

1. In `src/adapters/cancellation-aware-delay.ts`, update the `WaitCancelledError` constructor and property to strictly accept `'SIGINT' | 'SIGTERM'` instead of `NodeJS.Signals`.
2. In `src/adapters/cancellation-aware-delay.ts` within `cancellationAwareDelay`, update the `catch` blocks around `process.on` and `setTimeout` to capture the thrown exception and preserve it (e.g., using the `cause` property) in the rejected `Error`.
3. In `src/index.ts`, update `signalExitCode` to accept `'SIGINT' | 'SIGTERM'` and remove the `default` fallback, ensuring the `switch` statement is exhaustively checked.
4. Update `tests/adapters/cancellation-aware-delay.test.ts` to mock failures for `process.on` and `setTimeout`, ensuring the original errors are preserved in the rejections.

## Acceptance Criteria

- Errors thrown due to handler installation or timer scheduling failures explicitly contain the original underlying error.
- `WaitCancelledError.signal` is typed as the union `'SIGINT' | 'SIGTERM'`.
- The switch statement in `signalExitCode` has no `default` case and is exhaustively checked by the TypeScript compiler.
- Tests pass, including new coverage for error preservation boundaries.

## Risks

- Other parts of the code might expect `WaitCancelledError` to hold an arbitrary `NodeJS.Signals` value.
- Removing the `default` case in `signalExitCode` will cause a build failure if the `signal` type is not properly constrained beforehand.
- The `cause` property might not be perfectly serialized if the application logs the error without inspecting causes, though standard Error reporting usually covers it.
