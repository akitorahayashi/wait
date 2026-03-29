import { describe, expect, it } from 'vitest'
import { createWaitRequest } from '../../src/domain/wait-request'

describe('createWaitRequest', () => {
  it('maps valid inputs into wait request', () => {
    const result = createWaitRequest(true, { seconds: 10 }, 'my label')
    expect(result).toEqual({
      ok: true,
      value: {
        enabled: true,
        effectiveSeconds: 10,
        label: 'my label',
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
})
