---
label: "refacts"
created_at: "2026-03-29"
author_role: "taxonomy"
confidence: "high"
---

## Problem

The concepts of pausing execution are referred to interchangeably as `wait` and `delay` within the same boundaries without deliberate distinction.

## Goal

Unify around the canonical term `wait` for the action of pausing execution across all layers to ensure naming shape consistency and avoid near-synonyms.

## Context

The repository is named `wait`, the domain uses `wait` (`WaitRequest`, `WaitResult`, `executeWait`), and documentation refers to a "cancellation-aware wait". However, the technical implementation boundary introduces the near-synonym `delay` (`cancellationAwareDelay`, `delay` dependency), yet internally throws a `WaitCancelledError`, mixing the terms in the same module. This violates the "One Concept, One Preferred Term" principle.

## Evidence

- path: "src/adapters/cancellation-aware-delay.ts"
  loc: "cancellationAwareDelay vs WaitCancelledError"
  note: "The adapter mixes 'delay' in its exported function name and 'wait' in its error name."
- path: "src/app/execute-wait/execute-wait-dependencies.ts"
  loc: "delay: (seconds: number) => Promise<void>"
  note: "The domain use-case requires a 'delay' dependency, creating a term collision with the domain's 'wait' vocabulary."
- path: "README.md"
  loc: "cancellation-aware wait"
  note: "Documentation establishes 'wait' as the canonical term, not 'delay'."

## Change Scope

- `src/adapters/cancellation-aware-delay.ts`
- `src/app/execute-wait/execute-wait-dependencies.ts`
- `src/app/execute-wait/index.ts`
- `src/index.ts`
- `tests/adapters/cancellation-aware-delay.test.ts`
