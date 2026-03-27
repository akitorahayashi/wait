---
label: "refacts"
created_at: "2024-03-27"
author_role: "taxonomy"
confidence: "high"
---

## Problem

Synonym collision between "Wait" and "Delay". The terms are used interchangeably across domain and adapter boundaries, creating confusion about the canonical concept.

## Goal

Establish "Wait" as the canonical domain term for the act of suspending execution, and reserve "Delay" (if used at all) strictly for low-level technical timer implementations. Avoid mixing the two in the same logical layer.

## Context

The repository represents a GitHub Action designed to "wait" for a duration. The domain speaks of `WaitRequest` and `WaitResult`, but the application layer (`executeWait`) relies on an injected `ExecuteWaitDependencies.delay` function. Furthermore, the adapter `cancellationAwareDelay` throws a `WaitCancelledError`, mixing the two concepts in a single file. This violates the "One Concept, One Preferred Term" principle.

## Evidence

- path: "src/app/execute-wait/execute-wait-dependencies.ts"
  loc: "line 2"
  note: "Domain application boundary `ExecuteWaitDependencies` uses `delay: (seconds: number) => Promise<void>` instead of `wait`."

- path: "src/adapters/cancellation-aware-delay.ts"
  loc: "lines 4-13, 17"
  note: "The function is named `cancellationAwareDelay` but it explicitly throws `WaitCancelledError`, mixing 'wait' and 'delay' in the same context."

## Change Scope

- `src/app/execute-wait/execute-wait-dependencies.ts`
- `src/app/execute-wait/index.ts`
- `src/adapters/cancellation-aware-delay.ts`
- `src/index.ts`
