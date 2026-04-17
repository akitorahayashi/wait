import { describe, expect, it } from 'vitest'
import { createWaitRequest } from '../../src/domain/wait-request'

describe('createWaitRequest', () => {
  it('builds a wait request with the provided enabled value', () => {
    const result = createWaitRequest(false, {})

    expect(result).toEqual({
      ok: true,
      value: {
        enabled: false,
        effectiveSeconds: 0,
        label: undefined,
      },
    })
  })

  it('drops empty labels', () => {
    const result = createWaitRequest(true, {}, '')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.label).toBeUndefined()
    }
  })

  it('returns explicit error from duration validation', () => {
    const result = createWaitRequest(true, { seconds: -1 })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.message).toBe(
        "Input 'seconds' must be a non-negative number.",
      )
    }
  })

  it('maps seconds to effectiveSeconds', () => {
    const result = createWaitRequest(true, { seconds: 15 })

    expect(result).toEqual({
      ok: true,
      value: {
        enabled: true,
        effectiveSeconds: 15,
        label: undefined,
      },
    })
  })

  it('maps minutes to effectiveSeconds', () => {
    const result = createWaitRequest(true, { minutes: 2 })

    expect(result).toEqual({
      ok: true,
      value: {
        enabled: true,
        effectiveSeconds: 120,
        label: undefined,
      },
    })
  })
})
