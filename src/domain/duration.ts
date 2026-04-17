import { type Result, ok, err } from './result'

export type DurationInput =
  | { minutes: number }
  | { seconds: number }
  | Record<string, never>

const SECONDS_PER_MINUTE = 60

export function resolveEffectiveSeconds(
  input: DurationInput,
): Result<number, Error> {
  if ('seconds' in input) {
    const secondsResult = parseNonNegativeNumber('seconds', input.seconds)
    return secondsResult.ok
      ? ok(normalizeToIntegerSeconds(secondsResult.value))
      : secondsResult
  }

  if ('minutes' in input) {
    const minutesResult = parseNonNegativeNumber('minutes', input.minutes)
    return minutesResult.ok
      ? ok(normalizeToIntegerSeconds(minutesResult.value * SECONDS_PER_MINUTE))
      : minutesResult
  }

  return ok(0)
}

function parseNonNegativeNumber(
  name: 'minutes' | 'seconds',
  parsed: number,
): Result<number, Error> {
  if (!Number.isFinite(parsed) || parsed < 0) {
    return err(new Error(`Input '${name}' must be a non-negative number.`))
  }

  return ok(parsed)
}

function normalizeToIntegerSeconds(value: number): number {
  return Math.trunc(value)
}
