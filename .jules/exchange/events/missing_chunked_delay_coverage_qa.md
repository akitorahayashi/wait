---
label: "tests"
created_at: "2025-03-25"
author_role: "qa"
confidence: "high"
---

## Problem

`cancellationAwareDelay` has complex looping logic to handle delays longer than 60 seconds (chunking), but there are no tests verifying this behavior. The maximum tested duration is 60 seconds.

## Goal

Add a test for `cancellationAwareDelay` that verifies it correctly loops for durations > 60 seconds and still responds to cancellation signals during subsequent chunks.

## Context

The `cancellationAwareDelay` adapter contains an internal loop (`scheduleNextChunk`) to process long delays in 60-second increments (`SECONDS_PER_DELAY_CHUNK`). This is a critical piece of logic to prevent Node.js from warning about excessively large timeouts or hitting maximum timeout limits. The tests in `tests/adapters/cancellation-aware-delay.test.ts` only cover up to 60 seconds, leaving the looping logic completely untested. An error in the remaining duration calculation or re-scheduling could cause incorrect behavior for long waits.

## Evidence

- path: "tests/adapters/cancellation-aware-delay.test.ts"
  loc: "44-51"
  note: "Test `resolves after the requested duration` only tests a 2-second delay."

- path: "tests/adapters/cancellation-aware-delay.test.ts"
  loc: "53-69"
  note: "Test `cancels promptly on SIGINT` only tests a 60-second delay (the exact chunk size), never triggering the >60s loop condition."

- path: "tests/adapters/cancellation-aware-delay.test.ts"
  loc: "71-87"
  note: "Test `cancels promptly on SIGTERM` also only tests a 60-second delay."

## Change Scope

- `tests/adapters/cancellation-aware-delay.test.ts`
