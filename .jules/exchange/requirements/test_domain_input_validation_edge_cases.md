---
label: "tests"
implementation_ready: false
---

## Goal

Ensure comprehensive test coverage for domain parameter validation and input mapping logic by explicitly testing missing branch paths, edge cases, and property propagation.

## Problem

Critical validation and boundary mapping logic paths are currently untested. This lack of coverage creates vulnerabilities to silent regressions in how the system protects itself from invalid inputs or maps valid inputs. Specifically:
1. Missing coverage for error paths on empty string values.
2. Missing coverage for truthy boolean string parsing.
3. Missing coverage for length-0 labels.
4. Missing verification of property propagation (e.g., how `minutes` and `seconds` map to `effectiveSeconds`).

## Context

Because tests for these properties are entirely absent, a regression might occur when mapping boolean variations or failing to propagate time components correctly from raw inputs. A change in those areas would be a silent regression. Tests must comprehensively cover the domain mapping boundaries to guarantee that the component properly structures requests and delegates behavior, explicitly validating paths that protect the application from invalid workflow inputs.

## Evidence

- source_event: "untested_error_paths_cov.md"
  path: "src/domain/duration.ts"
  loc: "Lines 29-31"
  note: "Branch handling zero-length (empty) numeric input strings throws an Error but is not covered by tests."

- source_event: "untested_error_paths_cov.md"
  path: "src/domain/wait-request.ts"
  loc: "Lines 37-39"
  note: "Branch handling truthy boolean string inputs is not covered by tests."

- source_event: "untested_error_paths_cov.md"
  path: "src/domain/wait-request.ts"
  loc: "Line 53"
  note: "Branch handling length 0 labels is not fully covered by tests."

- source_event: "wait_request_missing_properties_qa.md"
  path: "tests/domain/wait-request.test.ts"
  loc: "5-22"
  note: "Only missing, negative, and invalid boolean values are tested; truthy logic is absent."

- source_event: "wait_request_missing_properties_qa.md"
  path: "tests/domain/wait-request.test.ts"
  loc: "5-22"
  note: "There is no test coverage for mapping the duration components (`minutes` or `seconds`) to `effectiveSeconds` through this adapter mapping function."

## Change Scope

- `tests/domain/duration.test.ts`
- `tests/domain/wait-request.test.ts`

## Constraints

- Test files must reside alongside the code they verify, maintaining established repository structure.
- Assertions should rely on standard test libraries in the stack (Vitest).

## Acceptance Criteria

- `tests/domain/duration.test.ts` contains cases asserting the behavior of parsing empty numeric string inputs.
- `tests/domain/wait-request.test.ts` contains cases validating successful mapping of truthy string values (e.g., `'true'`, `'yes'`, `'on'`, `'1'`).
- `tests/domain/wait-request.test.ts` contains cases covering zero-length (empty string) label handling.
- `tests/domain/wait-request.test.ts` contains integration-style verification ensuring `minutes` and `seconds` values are correctly mapped into an `effectiveSeconds` property.