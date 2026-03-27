---
label: "refacts"
created_at: "2024-03-27"
author_role: "taxonomy"
confidence: "high"
---

## Problem

Transport vocabulary leaking into the Domain. The term "Inputs", which is specific to GitHub Actions transport mechanics (`core.getInput()`), appears in core Domain structures (`RawWaitInputs`, `DurationInputs`).

## Goal

Decouple Domain concepts from Transport details. Re-name domain types to reflect unvalidated state or requests, reserving "Inputs" strictly for the `src/action` transport boundary.

## Context

The domain files `wait-request.ts` and `duration.ts` define types `RawWaitInputs` and `DurationInputs`. This implies the domain is aware of how it is invoked (via GitHub Action inputs). The Domain should model the problem space independently. A more domain-appropriate name for unparsed, transport-agnostic data would be something like `RawWaitRequest` and `RawDuration` or `UnvalidatedDuration`.

## Evidence

- path: "src/domain/wait-request.ts"
  loc: "line 9"
  note: "`RawWaitInputs` uses the word 'Inputs', leaking the action input concept into the Domain layer."

- path: "src/domain/duration.ts"
  loc: "line 1"
  note: "`DurationInputs` uses the word 'Inputs', unnecessarily associating raw temporal duration values with the action transport mechanism."

## Change Scope

- `src/domain/wait-request.ts`
- `src/domain/duration.ts`
- `src/action/read-inputs.ts`
