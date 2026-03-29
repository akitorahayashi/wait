---
label: "docs"
implementation_ready: true
---

## Goal

Ensure `docs/architecture.md` accurately describes the system's dependency boundaries, explicitly outlining the use of dependency inversion to protect `app` logic from `adapters`.

## Problem

The current `docs/architecture.md` documentation exhibits architectural drift by misrepresenting the module dependencies. It erroneously claims that `action` depends on `app`, and `app` depends on `adapters`. However, the implementation correctly maintains boundary isolation, utilizing dependency injection inside `index.ts` and having `app` define an explicit dependency interface (`ExecuteWaitDependencies`) rather than importing from `adapters` directly. Inaccurate documentation creates confusion and risks contributors violating boundary invariants.

## Context

Incorrect architectural documentation misleads contributors about module boundaries. The `wait` action carefully maintains isolated boundaries by defining its own dependencies rather than importing directly from other domains. The documentation must serve as a reliable contract for these boundaries to prevent regressions.

## Evidence

- source_event: "architecture_drift_consistency.md"
  path: "docs/architecture.md"
  loc: "17-21"
  note: "Claims `action -> app` and `app -> adapters` dependency direction."

- source_event: "architecture_drift_consistency.md"
  path: "src/action/"
  loc: "src/action/read-inputs.ts, src/action/emit-outputs.ts"
  note: "No imports from `src/app/` exist in the `action` module; it depends only on `@actions/core` and `src/domain/`."

- source_event: "architecture_drift_consistency.md"
  path: "src/app/execute-wait/execute-wait-dependencies.ts"
  loc: "1-4"
  note: "Defines an interface for its dependencies, inverting control."

- source_event: "architecture_drift_consistency.md"
  path: "src/app/execute-wait/index.ts"
  loc: "imports"
  note: "No imports from `src/adapters/` exist in the `app` module; it depends only on `src/domain/` and its own dependency interface."

- source_event: "architecture_drift_consistency.md"
  path: "src/index.ts"
  loc: "12-15"
  note: "Orchestrates the modules and injects the adapter into the app layer."

## Change Scope

- `docs/architecture.md`

## Constraints

- Documentation must use declarative language detailing the *current* state of the system, rather than an imperative "changelog" style.
- The description must be strictly English.
- Avoid using bold formatting (`**`) in Markdown; rely on hierarchy and headings instead.

## Acceptance Criteria

- `docs/architecture.md` text correctly describes the dependency inversion pattern used between `app` and `adapters`.
- `docs/architecture.md` explicitly describes `index.ts` as the root orchestrator composing `action`, `app`, and `adapters`.
- The incorrect statements describing `action -> app` and `app -> adapters` dependencies are removed or replaced.