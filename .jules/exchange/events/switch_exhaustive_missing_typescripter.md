---
label: "bugs"
created_at: "2026-03-27"
author_role: "typescripter"
confidence: "high"
---

## Problem

The `signalExitCode` switch statement relies on TypeScript's default checks without an explicit `never` assertion, so expanding the union type won't trigger a runtime exhaustiveness error if the compiler checks are loose or ignored.

## Goal

Ensure state handling exhaustiveness by adding an explicit `never` check (or an `assertNever` helper) in the default case for the `signal` union.

## Context

In `src/index.ts`, `signalExitCode(signal: 'SIGINT' | 'SIGTERM')` correctly handles two string literals. However, if another signal (like `'SIGHUP'`) is later added to the union, TypeScript would only warn if `strictNullChecks` or `noImplicitReturns` forces it. A true exhaustiveness check (`const _: never = signal;`) explicitly prevents the invalid state at compile time and is a safer best practice for state unions.

## Evidence

- path: "src/index.ts"
  loc: "line 36-41"
  note: "Switch lacks an explicit default `never` case, making it potentially non-exhaustive if the type signature is expanded."

## Change Scope

- `src/index.ts`
