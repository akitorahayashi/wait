---
label: "refacts"
created_at: "2026-03-29"
author_role: "data_arch"
confidence: "high"
---

## Problem

Implicit validation via thrown errors instead of explicit error modeling within domain boundaries.

## Goal

Refactor the validation logic inside `src/domain/wait-request.ts` and `src/domain/duration.ts` to return explicit results (`Result<T, E>`) mapping valid/invalid states, instead of throwing errors globally.

## Context

According to the data architecture anti-patterns "Implicit validation via panics/unwraps instead of explicit error modeling", validation logic should be represented by explicitly modeling valid and invalid states within type signatures. However, both `parseBooleanInput` and `parseNonNegativeNumber` enforce assertions by using generic `throw new Error(...)`, relying on caller try-catch rather than explicit Result structures. The domain should represent validation rules using Result return types and encode invariants clearly at transport boundaries (e.g. read-inputs).

## Evidence

- path: "src/domain/wait-request.ts"
  loc: "line 43-44"
  note: "`parseBooleanInput` implicitly enforces validation rules by throwing a generic Error (`throw new Error(\`Input '\${name}' must be a recognized boolean value.\`)`)."

- path: "src/domain/duration.ts"
  loc: "line 29-30"
  note: "`parseNonNegativeNumber` implicitly fails on an empty string by throwing an Error instead of returning a typed validation result."

- path: "src/domain/duration.ts"
  loc: "line 34-35"
  note: "`parseNonNegativeNumber` implicitly fails on unparseable or negative values by throwing an Error instead of returning a typed validation result."

## Change Scope

- `src/domain/wait-request.ts`
- `src/domain/duration.ts`
- `src/action/read-inputs.ts`
- `src/index.ts`
