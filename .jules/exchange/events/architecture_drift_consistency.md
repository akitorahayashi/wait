---
label: "docs"
created_at: "2025-03-29"
author_role: "consistency"
confidence: "high"
---

## Problem

The architectural dependency direction documented in `docs/architecture.md` contradicts the actual implementation. The documentation claims that `action` depends on `app` and that `app` depends on `adapters`. In reality, the boundaries are isolated: `action` does not depend on `app`, and `app` does not depend on `adapters`. Instead, `index.ts` orchestrates them using dependency injection, and `app` defines an explicit `ExecuteWaitDependencies` interface to invert the dependency on `adapters`.

## Goal

Update `docs/architecture.md` to accurately reflect the implemented dependency boundaries and the use of dependency injection/inversion.

## Context

Incorrect architectural documentation misleads contributors about module boundaries. The `wait` action carefully maintains isolated boundaries (e.g., `src/app/` defining its own dependencies rather than importing from `src/adapters/`). The documentation must serve as a reliable contract for these boundaries to prevent regressions.

## Evidence

- path: "docs/architecture.md"
  loc: "17-21"
  note: "Claims `action -> app` and `app -> adapters` dependency direction."

- path: "src/action/"
  loc: "src/action/read-inputs.ts, src/action/emit-outputs.ts"
  note: "No imports from `src/app/` exist in the `action` module; it depends only on `@actions/core` and `src/domain/`."

- path: "src/app/execute-wait/execute-wait-dependencies.ts"
  loc: "1-4"
  note: "Defines an interface for its dependencies, inverting control."

- path: "src/app/execute-wait/index.ts"
  loc: "imports"
  note: "No imports from `src/adapters/` exist in the `app` module; it depends only on `src/domain/` and its own dependency interface."

- path: "src/index.ts"
  loc: "12-15"
  note: "Orchestrates the modules and injects the adapter into the app layer (`executeWait(request, { delay: cancellationAwareDelay, log: core.info })`)."

## Change Scope

- `docs/architecture.md`
