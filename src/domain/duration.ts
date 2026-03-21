export interface DurationInputs {
  minutes?: string
  seconds?: string
}

export function resolveEffectiveSeconds(inputs: DurationInputs): number {
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
