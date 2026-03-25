---
label: "tests"
implementation_ready: false
---

## Goal

Add testing for the top-level execution paths, verifying that `run()` sets the correct outputs and that unhandled rejections result in appropriate exit codes and error logs. Alternatively, encapsulate the exit-code logic in an explicitly tested module and keep `index.ts` purely declarative.

## Problem

The `src/index.ts` bootstrap file has 0% coverage. While bootstrapping code is often excluded, its error handling—specifically how `WaitCancelledError` and generic errors translate into GitHub Action notices and exit codes—is critical to the reliability of the action. Without coverage, changes could easily break the contract of correctly reporting wait cancellations versus fatal errors.

## Context

`src/index.ts` is the runtime entrypoint. If it fails to catch or translate exceptions correctly, the GitHub Action might crash silently or return confusing exit codes. The `WaitCancelledError` translation to specific exit codes (130 for SIGINT, 143 for SIGTERM) is an important part of the expected behavior, but the logic in `signalExitCode` is currently untested.

## Evidence

- source_event: "index_bootstrap_coverage_cov.md"
  path: "src/index.ts"
  loc: "1-46"
  note: "The entire file is reported as 0% coverage. Lines 24-46 define critical logic for translating runtime errors into process exit states, which must be verified."

## Change Scope

- `src/index.ts`
- `tests/index.test.ts` (new)

## Constraints

- Ensure no regressions in existing functionality.
- Adhere to the principles defined in the root context.

## Acceptance Criteria

- The goals specified are fully achieved.
- The problems described are completely resolved.
