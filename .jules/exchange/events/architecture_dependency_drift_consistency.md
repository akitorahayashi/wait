---
label: "docs"
created_at: "2024-03-27"
author_role: "consistency"
confidence: "high"
---

## Problem

The documented runtime dependency direction in `docs/architecture.md` claims that `app` depends on `adapters`. However, the implementation in `src/app/execute-wait/index.ts` relies on dependency injection via `ExecuteWaitDependencies` and does not import anything from `src/adapters`. The actual runtime composition happens in `src/index.ts`.

## Goal

Correct the documented dependency direction in `docs/architecture.md` to reflect that `app` is decoupled from `adapters` and that `index` orchestrates the dependency injection.

## Context

The documentation should accurately reflect the decoupled architecture of the system. Currently, `docs/architecture.md` states:
```text
app -> adapters
```
But the implementation injects the delay dependency into `executeWait` from `src/index.ts`, meaning `app -> none` (or only domain), and `index -> adapters`.

## Evidence

- path: "docs/architecture.md"
  loc: "14"
  note: "Claims `app -> adapters` dependency direction."

- path: "src/app/execute-wait/index.ts"
  loc: "1-5"
  note: "Shows `executeWait` importing only from `domain` and relying on `ExecuteWaitDependencies` interface."

- path: "src/index.ts"
  loc: "5-15"
  note: "Shows `index.ts` importing from `adapters` and passing `cancellationAwareDelay` into `executeWait`."

## Change Scope

- `docs/architecture.md`
