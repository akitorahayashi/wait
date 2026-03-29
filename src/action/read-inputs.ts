import * as core from '@actions/core'
import { createWaitRequest, type WaitRequest } from '../domain/wait-request'
import type { DurationInput } from '../domain/duration'
import { type Result, err } from '../domain/result'

export function readInputs(): Result<WaitRequest, Error> {
  const enabledInput = readOptionalInput('enabled')
  const enabled = parseBooleanInput(enabledInput, true, 'enabled')

  const minutesInput = readOptionalInput('minutes')
  const secondsInput = readOptionalInput('seconds')

  if (minutesInput !== undefined && secondsInput !== undefined) {
    return err(
      new Error(
        "Inputs 'minutes' and 'seconds' are mutually exclusive. Please provide only one.",
      ),
    )
  }

  let duration: DurationInput = {}

  if (minutesInput !== undefined) {
    const parsedMinutes = Number(minutesInput)
    if (Number.isNaN(parsedMinutes)) {
      return err(new Error("Input 'minutes' must be a non-negative number."))
    }
    duration = { minutes: parsedMinutes }
  } else if (secondsInput !== undefined) {
    const parsedSeconds = Number(secondsInput)
    if (Number.isNaN(parsedSeconds)) {
      return err(new Error("Input 'seconds' must be a non-negative number."))
    }
    duration = { seconds: parsedSeconds }
  }

  return createWaitRequest(enabled, duration, readOptionalInput('label'))
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

  throw new Error(`Input '${name}' must be a recognized boolean value.`)
}
