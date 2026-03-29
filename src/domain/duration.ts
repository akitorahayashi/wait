export interface DurationInputs {
  minutes?: string
  seconds?: string
}

const SECONDS_PER_MINUTE = 60

export function resolveEffectiveSeconds(inputs: DurationInputs): number {
  if (inputs.seconds !== undefined) {
    return normalizeToIntegerSeconds(
      parseNonNegativeNumber('seconds', inputs.seconds),
    )
  }

  if (inputs.minutes !== undefined) {
    return normalizeToIntegerSeconds(
      parseNonNegativeNumber('minutes', inputs.minutes) * SECONDS_PER_MINUTE,
    )
  }

  return 0
}

function parseNonNegativeNumber(
  name: 'minutes' | 'seconds',
  value: string,
): number {
  const normalized = value.trim()
  if (normalized.length === 0) {
    throw new Error(`Input '${name}' must be a non-negative number.`)
  }

  const parsed = Number(normalized)
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`Input '${name}' must be a non-negative number.`)
  }

  return parsed
}

function normalizeToIntegerSeconds(value: number): number {
  return Math.trunc(value)
}
