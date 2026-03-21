import { resolveEffectiveSeconds } from './duration'

export interface WaitRequest {
  enabled: boolean
  effectiveSeconds: number
  label?: string
}

export interface RawWaitInputs {
  enabled?: string
  minutes?: string
  seconds?: string
  label?: string
}

export function normalizeWaitRequest(raw: RawWaitInputs): WaitRequest {
  return {
    enabled: parseBooleanInput(raw.enabled, true, 'enabled'),
    effectiveSeconds: resolveEffectiveSeconds({
      minutes: raw.minutes,
      seconds: raw.seconds,
    }),
    label: normalizeLabel(raw.label),
  }
}

function parseBooleanInput(
  value: string | undefined,
  defaultValue: boolean,
  name: 'enabled',
): boolean {
  if (value === undefined) {
    return defaultValue
  }

  const normalizedValue = value.toLowerCase()
  if (['1', 'true', 'yes', 'on'].includes(normalizedValue)) {
    return true
  }

  if (['0', 'false', 'no', 'off'].includes(normalizedValue)) {
    return false
  }

  throw new Error(`Input '${name}' must be a recognized boolean value.`)
}

function normalizeLabel(value: string | undefined): string | undefined {
  if (value === undefined) {
    return undefined
  }

  return value.length === 0 ? undefined : value
}
