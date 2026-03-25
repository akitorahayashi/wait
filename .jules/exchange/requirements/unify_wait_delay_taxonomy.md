---
label: "refacts"
implementation_ready: false
---

## Goal

Unify the terminology to consistently use the canonical term "wait" across all boundaries to enforce the "One Concept, One Preferred Term" principle.

## Problem

The terms "wait" and "delay" are used interchangeably for the same concept across domain, use-case, and adapter boundaries.

## Context

The repository represents a GitHub Action named "wait", and its domain uses models like `WaitRequest` and `WaitResult`. The application use case is named `executeWait` and user-facing logging consistently states "Starting wait...".

However, the application dependency interface defines a `delay` method (`delay: (seconds: number) => Promise<void>`). The adapter fulfilling this is named `cancellationAwareDelay`. This introduces confusing cognitive load where `cancellationAwareDelay` throws a `WaitCancelledError`, mixing "wait" and "delay" in the same component. The term "delay" should be renamed to "wait" consistently (e.g., `wait: (seconds: number) => Promise<void>` and `cancellationAwareWait`).

## Evidence

- source_event: "wait_vs_delay_taxonomy.md"
  path: "src/app/execute-wait/execute-wait-dependencies.ts"
  loc: "line 2"
  note: "Defines the dependency as `delay`, conflicting with the use-case name `executeWait`."
- source_event: "wait_vs_delay_taxonomy.md"
  path: "src/app/execute-wait/index.ts"
  loc: "line 28"
  note: "Calls `await dependencies.delay(request.effectiveSeconds)` while surrounding logs say `Starting wait...` and `Wait completed...`."
- source_event: "wait_vs_delay_taxonomy.md"
  path: "src/adapters/cancellation-aware-delay.ts"
  loc: "line 14"
  note: "Adapter is named `cancellationAwareDelay` but throws `WaitCancelledError` (line 1), demonstrating terminology drift."

## Change Scope

- `src/app/execute-wait/execute-wait-dependencies.ts`
- `src/app/execute-wait/index.ts`
- `src/adapters/cancellation-aware-delay.ts`
- `src/index.ts`
- `tests/app/execute-wait.test.ts` (and relevant adapter tests)

## Constraints

- Ensure no regressions in existing functionality.
- Adhere to the principles defined in the root context.

## Acceptance Criteria

- The goals specified are fully achieved.
- The problems described are completely resolved.
