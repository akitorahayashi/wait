import { describe, expect, it } from 'vitest'
import { resolveEffectiveSeconds } from '../../src/domain/duration'
import { ValidationError } from '../../src/domain/validation-error'

describe('resolveEffectiveSeconds', () => {
  it('uses seconds when type is seconds', () => {
    expect(resolveEffectiveSeconds({ type: 'seconds', value: 9 })).toBe(9)
  })

  it('converts minutes to seconds when type is minutes', () => {
    expect(resolveEffectiveSeconds({ type: 'minutes', value: 3 })).toBe(180)
  })

  it('throws ValidationError when type is none', () => {
    const act = () => resolveEffectiveSeconds({ type: 'none' })
    expect(act).toThrow(ValidationError)
    expect(act).toThrow('A duration (minutes or seconds) must be specified.')
  })
})
