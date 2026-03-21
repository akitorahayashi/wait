# Architecture

## Repository Boundary

`wait` is a single-action repository. The repository owns one GitHub Action that resolves a wait duration, performs one cancellation-aware wait when needed, and emits explicit outputs.

The repository surfaces are:

- `action.yml`: public action contract
- `src/`: TypeScript runtime organized by action, app, domain, and adapters boundaries
- `dist/`: release-managed package output used by GitHub Actions at tag resolution time
- `tests/`: repository-owned boundary tests under `tests/action`, `tests/app`, `tests/domain`, and `tests/adapters`

## Runtime Boundaries

The runtime boundaries are:

- `src/index.ts`: bootstrap and top-level orchestration only
- `src/action/`: action boundary input decoding and output emission
- `src/app/execute-wait/`: wait use-case orchestration
- `src/domain/`: pure duration and wait request/result modeling
- `src/adapters/`: cancellation-aware waiting over Node timers and signals

## Dependency Direction

Runtime dependencies follow this direction:

```text
index -> action -> app -> domain
app -> adapters
domain -> none
adapters -> node runtime
```

`domain` remains pure and does not depend on runtime boundaries.

## Runtime Execution Flow

The action runtime executes this sequence:

1. Read optional action inputs (`enabled`, `minutes`, `seconds`, `label`).
2. Resolve one effective duration with explicit validation.
3. Skip when disabled or when effective duration is zero.
4. Wait when duration is positive, with cancellation handling for `SIGINT` and `SIGTERM`.
5. Emit `waited` and `effective_seconds`.

## Reusable Baseline

The repository demonstrates a boundary-owned wait action implementation with explicit cancellation handling and explicit output semantics.

## Failure Invariants

The action fails explicitly when:

- boolean input values are not recognized
- numeric input values are not non-negative integers
- cancellation handlers cannot be installed or timer creation fails

No silent fallback paths are used.
