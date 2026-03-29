---
label: "refacts"
created_at: "2024-03-29"
author_role: "typescripter"
confidence: "high"
---

## Problem

The `signalExitCode` function in `src/index.ts` relies on the function return type enforcing that the `switch` block returns in all cases to prevent unhandled variations of the `'SIGINT' | 'SIGTERM'` union type. While this works because the function lacks a default return, it's brittle and not a compiler-enforced state exhaustiveness check. If a new signal is added and the `switch` is not updated, the compiler flags the missing return instead of pinpointing the unhandled union member via a `never` check.

## Goal

Ensure state handling exhaustiveness is enforced deliberately using a `never` check (e.g., passing the unhandled value to a function expecting `never` or throwing a descriptive error with the unhandled value) rather than relying on TypeScript's default return checking behavior.

## Context

Relying on implicit function return type validation instead of explicit exhaustiveness checking can lead to confusing errors when union types are expanded. Explicitly handling the `default` case and assigning the value to `never` ensures that invalid or missing states are flagged clearly by the compiler directly at the state handling site, making invalid states unrepresentable.

## Evidence

- path: "src/index.ts"
  loc: "35-42"
  note: "`signalExitCode` uses a switch statement without a default case asserting the exhaustive check via `never`."

## Change Scope

- `src/index.ts`