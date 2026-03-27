---
label: "bugs"
created_at: "2026-03-27"
author_role: "typescripter"
confidence: "high"
---

## Problem

The action boundary error handler relies on a string coercion (`String(error)`) for unknown errors, swallowing the potential structure of thrown non-Error objects (like library response bodies).

## Goal

Improve boundary type integrity by implementing strict failure semantics at the edge for unknown errors, ensuring unhandled rejections or throws are safely structured before logging.

## Context

In `src/index.ts`, the `handleError(error: unknown)` function acts as the final boundary before GitHub Actions process exit. If the error is not a `WaitCancelledError` and not an `Error` (e.g. if a library throws an object or primitive), the error is forcefully stringified (`core.setFailed(String(error))`), which loses context if it is an object literal and provides poor operational transparency.

## Evidence

- path: "src/index.ts"
  loc: "line 31"
  note: "Fallback error coercion stringifies `unknown` rather than checking if it has a `message` property or handling it safely."

## Change Scope

- `src/index.ts`
