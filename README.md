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

## Documentation

- [Usage](docs/usage.md)
- [Architecture](docs/architecture.md)
- [Configuration](docs/configuration.md)
