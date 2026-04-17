import { describe, expect, it } from 'vitest'
import { createWaitRequest } from '../../src/domain/wait-request'

describe('normalizeWaitRequest', () => {
  it('defaults enabled to true', () => {
    expect(normalizeWaitRequest({}).enabled).toBe(true)
  })

  it('normalizes boolean tokens', () => {
    expect(normalizeWaitRequest({ enabled: 'true' }).enabled).toBe(true)
    expect(normalizeWaitRequest({ enabled: 'YES' }).enabled).toBe(true)
    expect(normalizeWaitRequest({ enabled: 'on' }).enabled).toBe(true)
    expect(normalizeWaitRequest({ enabled: '1' }).enabled).toBe(true)
    expect(normalizeWaitRequest({ enabled: 'false' }).enabled).toBe(false)
    expect(normalizeWaitRequest({ enabled: 'no' }).enabled).toBe(false)
    expect(normalizeWaitRequest({ enabled: 'OFF' }).enabled).toBe(false)
    expect(normalizeWaitRequest({ enabled: '0' }).enabled).toBe(false)
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
    expect(normalizeWaitRequest({ seconds: '15' }).effectiveSeconds).toBe(15)
  })

  it('maps minutes to effectiveSeconds', () => {
    expect(normalizeWaitRequest({ minutes: '2' }).effectiveSeconds).toBe(120)
  })

  it('prioritizes seconds over minutes for effectiveSeconds', () => {
    expect(
      normalizeWaitRequest({ seconds: '30', minutes: '5' }).effectiveSeconds,
    ).toBe(30)
  })
})
