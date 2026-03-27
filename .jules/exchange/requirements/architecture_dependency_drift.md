---
label: "docs"
implementation_ready: false
---

## Goal

Correct documentation regarding dependency direction to accurately reflect the decoupled architecture.

## Problem

`docs/architecture.md` states `app -> adapters`, but runtime composition dynamically injects dependencies in `index.ts`.

## Context

The documentation should accurately reflect the decoupled architecture of the system. Currently, `docs/architecture.md` states `app -> adapters`. But the implementation injects the delay dependency into `executeWait` from `src/index.ts`, meaning `app -> none` (or only domain), and `index -> adapters`.

## Evidence

- source_event: "architecture_dependency_drift_consistency.md"
  path: "docs/architecture.md"
  loc: "14"
  note: "Claims `app -> adapters` dependency direction."

- source_event: "architecture_dependency_drift_consistency.md"
  path: "src/app/execute-wait/index.ts"
  loc: "1-5"
  note: "Shows `executeWait` importing only from `domain` and relying on `ExecuteWaitDependencies` interface."

- source_event: "architecture_dependency_drift_consistency.md"
  path: "src/index.ts"
  loc: "5-15"
  note: "Shows `index.ts` importing from `adapters` and passing `cancellationAwareDelay` into `executeWait`."

## Change Scope

- `docs/architecture.md`

## Constraints

- The documentation update must reflect the actual decoupled dependency structure.

## Acceptance Criteria

- `docs/architecture.md` correctly models the dependency injection architecture (`app -> none`, `index -> adapters`).
