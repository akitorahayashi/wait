---
label: "tests"
implementation_ready: false
---

## Goal

Refactor tests to validate observable outcomes rather than tightly coupling to implementation details via mocks.

## Problem

Both the adapter tests for `cancellation-aware-delay` and the integration tests for `index.ts` are overly brittle due to deep mocking of internal modules, timers, and the Node process object.

## Context

Tests should be resilient to internal refactoring. Because `cancellation-aware-delay.test.ts` heavily spies and mocks `process` and `setTimeout`, any change to the underlying timer mechanism (like adopting `timers/promises` or changing how chunks are processed) will break the test, causing brittleness and high maintenance costs. The main action file (`index.ts`) orchestrates the overall flow. Tests that mock out all internal dependencies provide little value in verifying that the integrated components actually work together correctly. This makes the test brittle during refactors when module boundaries change (e.g., if logic is moved between `readInputs` and `executeWait`).

## Evidence

- source_event: "cancellation_delay_mock_coupling_qa.md"
  path: "tests/adapters/cancellation-aware-delay.test.ts"
  loc: "captureSignalHandlers"
  note: "Mocks `process.on` and `process.off` directly instead of observing external effects."

- source_event: "cancellation_delay_mock_coupling_qa.md"
  path: "tests/adapters/cancellation-aware-delay.test.ts"
  loc: "setTimeoutSpy"
  note: "Spies on `global.setTimeout` directly instead of relying solely on `vi.useFakeTimers()` external behavior control."

- source_event: "index_mock_coupling_qa.md"
  path: "tests/index.test.ts"
  loc: "line 6-18"
  note: "Mocks internal components like `readInputs`, `executeWait`, and `emitOutputs` rather than testing the real coordination."

- source_event: "index_mock_coupling_qa.md"
  path: "tests/index.test.ts"
  loc: "line 40-42"
  note: "Relies on verifying that specific mocked functions were called with specific arguments, rather than validating external state changes or outcomes."

## Change Scope

- `tests/adapters/cancellation-aware-delay.test.ts`
- `tests/index.test.ts`

## Constraints

- Focus tests on observable inputs, outputs, and behaviors.

## Acceptance Criteria

- `index.test.ts` acts as a proper boundary or seam test without full internal mocking.
- `cancellation-aware-delay.test.ts` avoids mocking internal timer/process mechanics where external behavioral assertions suffice.
