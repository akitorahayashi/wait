# Usage

`wait` resolves one effective duration and performs one cancellation-aware wait when required.

## Standard Workflow Usage

```yaml
- uses: akitorahayashi/wait@v1
  with:
    enabled: true
    seconds: 30
```

This form performs a 30-second wait and emits `waited=true` and `effective_seconds=30`.

## Input Behavior

The action reads:

- optional `enabled`
- optional `minutes`
- optional `seconds`
- optional `label`

The output surface is:

- `waited`
- `effective_seconds`

## Duration Precedence

```yaml
- uses: akitorahayashi/wait@v1
  with:
    minutes: 2
    seconds: 15
```

In this example, `seconds` is authoritative and the effective duration is 15 seconds.

## Skip Behavior

The action completes without waiting when either condition is true:

- `enabled` resolves to `false`
- `effective_seconds` resolves to `0`

Outputs still report the resolved state.

## Cancellation Behavior

When GitHub Actions cancellation sends `SIGINT` or `SIGTERM`, the running wait is interrupted promptly.
The action does not report a normal completed wait after cancellation.

## Local Verification

Repository-local verification commands are:

- `just fix`
- `just check`
- `just test`

`just fix` applies formatter and safe lint updates.
`just check` covers formatter, lint, and typecheck validation on source changes.

Targeted npm commands remain available behind the `just` recipes:

- `npm run format`
- `npm run format:check`
- `npm run lint`
- `npm run lint:fix`
- `npm test`
- `npm run typecheck`
- `npm run package`
