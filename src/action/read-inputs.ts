import * as core from '@actions/core'
import { resolveEffectiveSeconds, type DurationInput } from '../domain/duration'
import { ValidationError } from '../domain/validation-error'
import type { WaitRequest } from '../domain/wait-request'

export function readInputs(): WaitRequest {
  const enabledStr = readOptionalInput('enabled')
  const minutesStr = readOptionalInput('minutes')
  const secondsStr = readOptionalInput('seconds')
  const label = readOptionalInput('label')

  const enabled = parseBooleanInput(enabledStr, true, 'enabled')

  let durationInput: DurationInput = { type: 'none' }
  if (minutesStr !== undefined && secondsStr !== undefined) {
    throw new ValidationError(
      'Inputs "minutes" and "seconds" are mutually exclusive.',
    )
  }

  if (secondsStr !== undefined) {
    durationInput = {
      type: 'seconds',
      value: parseNonNegativeInteger('seconds', secondsStr),
    }
  } else if (minutesStr !== undefined) {
    durationInput = {
      type: 'minutes',
      value: parseNonNegativeInteger('minutes', minutesStr),
    }
  }

  const effectiveSeconds = resolveEffectiveSeconds(durationInput)

  return {
    enabled,
    effectiveSeconds,
    label,
  }
}

function readOptionalInput(name: string): string | undefined {
  const value = core.getInput(name)
  const normalized = value.trim()
  return normalized.length === 0 ? undefined : normalized
}

function parseBooleanInput(
  value: string | undefined,
  defaultValue: boolean,
  name: string,
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

  throw new ValidationError(
    `Input '${name}' must be a recognized boolean value.`,
  )
}

function parseNonNegativeInteger(
  name: 'minutes' | 'seconds',
  value: string,
): number {
  if (!/^\d+$/.test(value)) {
    throw new ValidationError(`Input '${name}' must be a non-negative integer.`)
  }

  return Number.parseInt(value, 10)
}
