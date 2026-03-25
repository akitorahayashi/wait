# wait

`wait` is a TypeScript GitHub Action repository.
The public action contract is defined in `action.yml`.
The runtime entrypoint for GitHub Actions is `dist/index.js`.
The authored implementation lives under `src/`.

## Repository Layout

`src/index.ts` bootstraps the action runtime.
`src/action/` owns input reading and output emission.
`src/app/` owns wait use-case orchestration.
`src/domain/` owns pure duration and wait request/result logic.
`src/adapters/` owns runtime cancellation-aware waiting.
`tests/action/`, `tests/app/`, and `tests/domain/` verify boundary behavior.
`tests/adapters/` verifies runtime adapter behavior.
[docs/](docs/README.md) is the central documentation index for usage, configuration, and architecture.
`.github/workflows/` contains CI and release automation.

## Validation

`just fix` runs formatting and safe lint fixes.
`just check` runs format, lint, and typecheck validation.
`just test` runs the test suite.

## Constraints

Do not update `dist/` in normal development changes or pull requests.
