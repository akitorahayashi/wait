---
label: "tests"
created_at: "2026-03-27"
author_role: "cov"
confidence: "high"
---

## Problem

Some branches and execution paths related to user inputs are completely uncovered by tests, creating regression risks around core action configuration logic.

## Goal

Add tests to ensure `parseBooleanInput` and `normalizeLabel` are fully covered, reducing regression risks during configuration normalization.

## Context

Test coverage analysis shows that specific branches in `src/domain/wait-request.ts` are uncovered. For example, `parseBooleanInput`'s branch checking for truthy values (`'1'`, `'true'`, `'yes'`, `'on'`) and `normalizeLabel`'s branch checking for empty string and returning `undefined` or a non-empty string. These are simple logic branches but are essential to accurately ingest action parameters. Uncovered configuration parsing can cause broken GitHub actions.

## Evidence

- path: "src/domain/wait-request.ts"
  loc: "37-39"
  note: "Branch parsing truthy boolean tokens (like 'true', '1') is untested."

- path: "src/domain/wait-request.ts"
  loc: "53"
  note: "The ternary operator `value.length === 0 ? undefined : value` in normalizeLabel is untested, leaving empty string checking unverified."

## Change Scope

- `src/domain/wait-request.ts`
- `tests/domain/wait-request.test.ts`
