---
label: "refacts"
created_at: "2026-03-29"
author_role: "data_arch"
confidence: "high"
---

## Problem

Transport DTOs and string parsing logic are located inside the core domain model instead of at the entry boundary.

## Goal

Decouple transport/UI string inputs from the pure domain model by moving `DurationInputs` and `RawWaitInputs` to the adapters or action layer. The domain `WaitRequest` and `Duration` should only deal with validated, strongly-typed values (e.g., numbers, booleans) instead of handling parsing logic.

## Context

According to the data architecture first principles on "Boundary Sovereignty", domain models should be kept independent of transport/UI/runtime concerns. In the codebase, `src/domain/wait-request.ts` exposes `RawWaitInputs` consisting entirely of optional strings, which are transport-layer types (e.g. GitHub Action inputs). The same applies to `DurationInputs` in `src/domain/duration.ts`. The domain is thus coupled to string parsing logic such as `'1', 'true', 'yes', 'on'`, preventing it from representing valid states only and enforcing invariants strictly at the boundaries.

## Evidence

- path: "src/domain/wait-request.ts"
  loc: "line 10-15"
  note: "`RawWaitInputs` defines string inputs which are typical of a transport layer (Action inputs), leaking into the domain module."

- path: "src/domain/wait-request.ts"
  loc: "line 29-45"
  note: "`parseBooleanInput` handles string values parsing logic (e.g., `'1', 'true', 'yes', 'on'`), which belongs to a transport/action adapter rather than core domain."

- path: "src/domain/duration.ts"
  loc: "line 1-4"
  note: "`DurationInputs` represents string inputs instead of a strongly-typed duration model, indicating boundary leakage."

## Change Scope

- `src/domain/wait-request.ts`
- `src/domain/duration.ts`
- `src/action/read-inputs.ts`
