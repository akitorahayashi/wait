import { describe, expect, it } from 'vitest'
import { resolveEffectiveSeconds } from '../../src/domain/duration'

describe('resolveEffectiveSeconds', () => {
  it('returns zero when no duration inputs are provided', () => {
    expect(resolveEffectiveSeconds({})).toEqual({ ok: true, value: 0 })
  })

  it('uses seconds when provided', () => {
    expect(resolveEffectiveSeconds({ seconds: 9 })).toEqual({
      ok: true,
      value: 9,
    })
  })

  it('converts minutes to seconds when seconds is absent', () => {
    expect(resolveEffectiveSeconds({ minutes: 3 })).toEqual({
      ok: true,
      value: 180,
    })
  })

  it('rejects negative values', () => {
    const result = resolveEffectiveSeconds({ seconds: -1 })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.message).toBe(
        "Input 'seconds' must be a non-negative number.",
      )
    }
  })

  it('accepts decimal seconds and truncates', () => {
    expect(resolveEffectiveSeconds({ seconds: 30.9 })).toEqual({
      ok: true,
      value: 30,
    })
  })

  it('accepts decimal minutes and truncates after conversion', () => {
    expect(resolveEffectiveSeconds({ minutes: 0.02 })).toEqual({
      ok: true,
      value: 1,
    })
  })

  it('rejects empty string values for seconds', () => {
    expect(() => resolveEffectiveSeconds({ seconds: '' })).toThrow(
      "Input 'seconds' must be a non-negative number.",
    )
  })

  it('rejects blank string values for minutes', () => {
    expect(() => resolveEffectiveSeconds({ minutes: '   ' })).toThrow(
      "Input 'minutes' must be a non-negative number.",
    )
  })
})
