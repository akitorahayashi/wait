# Architecture

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
index -> action, app, adapters
action -> domain
app -> domain
adapters -> node runtime
```

The `index.ts` file acts as the root orchestrator. It orchestrates the `action`, `app`, and `adapters` modules.

The `app` module utilizes dependency inversion. It defines an explicit dependency interface instead of importing from `adapters` directly. This protects `app` logic from `adapters`.

The `domain` module remains pure and does not depend on runtime boundaries.

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
- numeric input values are not non-negative numbers
- cancellation handlers cannot be installed or timer creation fails

No silent fallback paths are used.
