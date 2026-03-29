import { resolveEffectiveSeconds, type DurationInput } from './duration'
import { type Result, ok, err } from './result'

export interface WaitRequest {
  enabled: boolean
  effectiveSeconds: number
  label?: string
}

export function createWaitRequest(
  enabled: boolean,
  duration: DurationInput,
  label?: string,
): Result<WaitRequest, Error> {
  const effectiveSecondsResult = resolveEffectiveSeconds(duration)

  if (!effectiveSecondsResult.ok) {
    return err(effectiveSecondsResult.error)
  }

  return ok({
    enabled,
    effectiveSeconds: effectiveSecondsResult.value,
    label: normalizeLabel(label),
  })
}

function normalizeLabel(value: string | undefined): string | undefined {
  if (value === undefined) {
    return undefined
  }

  return value.length === 0 ? undefined : value
}
