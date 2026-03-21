export interface DurationInputs {
  minutes?: string
  seconds?: string
}

const MAX_EFFECTIVE_SECONDS = 2_147_483

export function resolveEffectiveSeconds(inputs: DurationInputs): number {
  const effectiveSeconds = resolveWithoutBound(inputs)
  if (effectiveSeconds > MAX_EFFECTIVE_SECONDS) {
    throw new Error(`Duration must be <= ${MAX_EFFECTIVE_SECONDS} seconds.`)
  }

  return effectiveSeconds
}

function resolveWithoutBound(inputs: DurationInputs): number {
  if (inputs.seconds !== undefined) {
    return parseNonNegativeInteger('seconds', inputs.seconds)
  }

  if (inputs.minutes !== undefined) {
    return parseNonNegativeInteger('minutes', inputs.minutes) * 60
  }

  return 0
}

function parseNonNegativeInteger(
  name: 'minutes' | 'seconds',
  value: string,
): number {
  if (!/^\d+$/.test(value)) {
    throw new Error(`Input '${name}' must be a non-negative integer.`)
  }

  return Number.parseInt(value, 10)
}
