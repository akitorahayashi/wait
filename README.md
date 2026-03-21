# wait

`wait` is a TypeScript GitHub Action that resolves one effective duration and performs one cancellation-aware wait.

The action contract is intentionally small:

- inputs: `enabled`, `minutes`, `seconds`, `label`
- outputs: `waited`, `effective_seconds`

## Quick Start

```yaml
- uses: akitorahayashi/wait@v1
  with:
    enabled: true
    seconds: 30
    label: post-deploy cooldown
```

## Action Contract

Inputs: `enabled`, `minutes`, `seconds`, `label`

Outputs: `waited`, `effective_seconds`

## Runtime Flow

1. Read inputs from the GitHub Actions boundary.
2. Resolve one effective duration with input validation.
3. Skip when disabled or when effective duration is zero.
4. Perform one cancellation-aware wait when duration is positive.
5. Emit `waited` and `effective_seconds`.

## Documentation

- [Usage](docs/usage.md)
- [Architecture Boundary](docs/architecture/boundary.md)
- [Action Inputs](docs/configuration/inputs.md)
