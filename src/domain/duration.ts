import { ValidationError } from './validation-error'

export type DurationInput =
  | { type: 'minutes'; value: number }
  | { type: 'seconds'; value: number }
  | { type: 'none' }

const SECONDS_PER_MINUTE = 60

export function resolveEffectiveSeconds(input: DurationInput): number {
  switch (input.type) {
    case 'seconds':
      return input.value
    case 'minutes':
      return input.value * SECONDS_PER_MINUTE
    case 'none':
      throw new ValidationError(
        'A duration (minutes or seconds) must be specified.',
      )
  }
}
