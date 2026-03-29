---
label: "tests"
created_at: "2026-03-29"
author_role: "qa"
confidence: "high"
---

## Problem

The test file `wait-request.test.ts` violates the "Missing properties" principle. It explicitly checks for the negative test case (when `enabled` is mapped to false, or is unparsable), but it completely misses validation for the truthy mapping cases like "true", "yes", "on", or "1". Additionally, the integration and mapping logic for assigning duration components to `effectiveSeconds` entirely lacks verification in this boundary component.

## Goal

Ensure comprehensive coverage by adding representative test cases for truthy `enabled` variations, and verifying the expected propagation of `minutes` and `seconds` via `resolveEffectiveSeconds`.

## Context

Because tests for these properties are entirely absent, a regression might occur mapping `enabled: "yes"` to `true` or failing to map time components correctly from raw inputs. A change in those areas would be a silent regression. Tests should thoroughly cover the domain mapping boundaries to guarantee the component properly delegates and structures requests correctly.

## Evidence

- path: "tests/domain/wait-request.test.ts"
  loc: "5-22"
  note: "Only missing, negative, and invalid boolean values are tested; truthy logic is absent."
- path: "tests/domain/wait-request.test.ts"
  loc: "5-22"
  note: "There is no test coverage for mapping the duration components (`minutes` or `seconds`) to `effectiveSeconds` through this adapter mapping function."

## Change Scope

- `tests/domain/wait-request.test.ts`
