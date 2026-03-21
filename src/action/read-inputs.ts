import * as core from '@actions/core'
import { normalizeWaitRequest, type WaitRequest } from '../domain/wait-request'

export function readInputs(): WaitRequest {
  return normalizeWaitRequest({
    enabled: readOptionalInput('enabled'),
    minutes: readOptionalInput('minutes'),
    seconds: readOptionalInput('seconds'),
    label: readOptionalInput('label'),
  })
}

function readOptionalInput(name: string): string | undefined {
  const value = core.getInput(name)
  const normalized = value.trim()
  return normalized.length === 0 ? undefined : normalized
}
