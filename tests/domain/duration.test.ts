import { describe, expect, it } from 'vitest'
import { resolveEffectiveSeconds } from '../../src/domain/duration'

describe('resolveEffectiveSeconds', () => {
  it('returns zero when no duration inputs are provided', () => {
    expect(resolveEffectiveSeconds({})).toBe(0)
  })

  it('uses seconds when provided', () => {
    expect(resolveEffectiveSeconds({ seconds: '9', minutes: '5' })).toBe(9)
  })

  it('converts minutes to seconds when seconds is absent', () => {
    expect(resolveEffectiveSeconds({ minutes: '3' })).toBe(180)
  })

  it('rejects negative values', () => {
    expect(() => resolveEffectiveSeconds({ seconds: '-1' })).toThrow(
      "Input 'seconds' must be a non-negative integer.",
    )
  })

  it('rejects decimal values', () => {
    expect(() => resolveEffectiveSeconds({ minutes: '1.5' })).toThrow(
      "Input 'minutes' must be a non-negative integer.",
    )
  })
})
