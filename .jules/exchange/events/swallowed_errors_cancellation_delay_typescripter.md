---
label: "bugs"
created_at: "2026-03-25"
author_role: "typescripter"
confidence: "high"
---

## Problem

Errors caught during event listener registration and setTimeout scheduling in `cancellationAwareDelay` are swallowed and replaced by generic messages without preserving the original error context.

## Goal

Preserve error context explicitly when wrapping failures in `cancellationAwareDelay` or handle them transparently according to the failure semantics.

## Context

The `typescripter` role forbids `catch` blocks that swallow errors or coerce them to `any`. In `cancellationAwareDelay`, there are `catch` blocks around `process.on` and `setTimeout` that catch `unknown` exceptions but do not log or pass the original error to the returned `Error`. This erases runtime evidence of why a cancellation handler installation or delay chunk scheduling failed.

## Evidence

- path: "src/adapters/cancellation-aware-delay.ts"
  loc: "44-47"
  note: "`process.on` block catches an exception and throws a generic 'Failed to install cancellation handlers.' error without passing or logging the underlying failure."
- path: "src/adapters/cancellation-aware-delay.ts"
  loc: "62-67"
  note: "`setTimeout` block catches an exception and throws a generic 'Failed to start wait timer.' error, again swallowing the original error."

## Change Scope

- `src/adapters/cancellation-aware-delay.ts`