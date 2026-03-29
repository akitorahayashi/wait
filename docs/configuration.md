# Inputs

`wait` defines these inputs in `action.yml`:

| Input | Required | Default | Meaning |
|------|----------|---------|---------|
| `enabled` | no | `true` | Optional boolean flag controlling whether waiting is active |
| `minutes` | no | none | Optional non-negative number of minutes used only when `seconds` is omitted; fractional values are truncated after conversion |
| `seconds` | no | none | Optional non-negative number of seconds, authoritative when provided; fractional values are truncated |
| `label` | no | empty | Optional descriptive text included in logs |

## Outputs

The action emits:

| Output | Meaning |
|--------|---------|
| `waited` | Boolean flag indicating whether a positive-duration wait was executed |
| `effective_seconds` | Resolved wait duration in seconds |

## Resolution Semantics

- `seconds` is authoritative when provided.
- `minutes` is converted to seconds only when `seconds` is absent.
- omitting both duration inputs resolves to `effective_seconds=0`.

## Validation Semantics

- `enabled` must be one of: `true`, `false`, `1`, `0`, `yes`, `no`, `on`, `off`.
- `minutes` and `seconds` must be non-negative numbers.
- fractional values are truncated to integer seconds after duration resolution.
- invalid values fail explicitly.

