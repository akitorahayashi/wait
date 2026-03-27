---
label: "tests"
created_at: "2025-02-18"
author_role: "qa"
confidence: "high"
---

## Problem

The test `tests/adapters/cancellation-aware-delay.test.ts` is overly coupled to the implementation details of `cancellationAwareDelay`. It relies on heavy mocking of `process.on`, `process.off`, and `setTimeout`, and uses a complex `captureSignalHandlers` helper.

## Goal

Refactor the test to validate externally visible behavior rather than internal implementation details, ensuring it relies less on mocking the Node.js event loop and signal management.

## Context

Tests should be resilient to internal refactoring. Because `cancellation-aware-delay.test.ts` heavily spies and mocks `process` and `setTimeout`, any change to the underlying timer mechanism (like adopting `timers/promises` or changing how chunks are processed) will break the test, causing brittleness and high maintenance costs.

## Evidence

- path: "tests/adapters/cancellation-aware-delay.test.ts"
  loc: "captureSignalHandlers"
  note: "This complex helper mocks `process.on` and `process.off` directly instead of observing external effects."
- path: "tests/adapters/cancellation-aware-delay.test.ts"
  loc: "setTimeoutSpy"
  note: "Spies on `global.setTimeout` directly instead of relying solely on `vi.useFakeTimers()` external behavior control."

## Change Scope

- `tests/adapters/cancellation-aware-delay.test.ts`
