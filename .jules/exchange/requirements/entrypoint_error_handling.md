---
label: "bugs"
implementation_ready: false
---

## Goal

Ensure safe error coercion at the entrypoint and verify top-level error handling logic.

## Problem

The top-level `run().catch(handleError)` is untested and `handleError(error: unknown)` aggressively stringifies unknown errors, losing context. This can swallow the structure of non-Error objects thrown at runtime.

## Context

In `src/index.ts`, the `handleError(error: unknown)` function acts as the final boundary before GitHub Actions process exit. If the error is not a `WaitCancelledError` and not an `Error` (e.g. if a library throws an object or primitive), the error is forcefully stringified (`core.setFailed(String(error))`), which loses context if it is an object literal and provides poor operational transparency. Additionally, the main block executing the Action (`if (require.main === module) { run().catch(handleError) }`) does not get executed during standard tests because `require.main !== module` in vitest runner. While hard to test, this logic can be factored out or tested through child process execution to guarantee that uncaught exceptions correctly translate into action failures.

## Evidence

- source_event: "catch_block_coerces_error_to_any_typescripter.md"
  path: "src/index.ts"
  loc: "33"
  note: "Fallback error coercion stringifies `unknown` rather than checking if it has a `message` property or handling it safely."

- source_event: "untested_entrypoint_catch_cov.md"
  path: "src/index.ts"
  loc: "44-46"
  note: "The top-level `run().catch(handleError)` is ignored by test runs."

## Change Scope

- `src/index.ts`
- `tests/index.test.ts`

## Constraints

- Safely handle non-Error objects thrown at the top level.
- Must cover entrypoint catch block in tests.

## Acceptance Criteria

- Uncaught errors are correctly coerced or logged without losing structure if they aren't standard `Error` objects.
- `run().catch(handleError)` path has test coverage.
