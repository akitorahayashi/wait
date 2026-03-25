---
label: "refacts"
created_at: "2026-03-25"
author_role: "data_arch"
confidence: "high"
---

## Problem

Validation failures for inputs (e.g., non-negative integers or recognized booleans) implicitly throw generic `Error` instances instead of explicitly modeling errors (e.g., via Result types or typed validation errors).

## Goal

Encode invariants and validation failures explicitly so invalid states are hard to express and errors are handled comprehensively without implicit panics/unwraps.

## Context

Using `throw new Error(...)` for expected validation issues obscures the data flow and prevents callers from handling specific error states programmatically. It violates the "Represent Valid States Only" principle and explicit error modeling guidelines.

## Evidence

- path: "src/domain/duration.ts"
  loc: "25-27"
  note: "`parseNonNegativeInteger` throws a generic `Error` if the regex fails."
- path: "src/domain/wait-request.ts"
  loc: "40-42"
  note: "`parseBooleanInput` throws a generic `Error` when the boolean value is unrecognized."
- path: "src/index.ts"
  loc: "24-27"
  note: "The top-level handler blindly catches `Error` and calls `core.setFailed`, lacking typed error differentiation."

## Change Scope

- `src/domain/duration.ts`
- `src/domain/wait-request.ts`
- `src/index.ts`
