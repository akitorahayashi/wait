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
    return parseNonNegativeNumber('seconds', input.seconds).ok
      ? ok(normalizeToIntegerSeconds(input.seconds))
      : err(new Error("Input 'seconds' must be a non-negative number."))
  }

  if ('minutes' in input) {
    return parseNonNegativeNumber('minutes', input.minutes).ok
      ? ok(normalizeToIntegerSeconds(input.minutes * SECONDS_PER_MINUTE))
      : err(new Error("Input 'minutes' must be a non-negative number."))
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
