import { describe, expect, it } from 'vitest'
import { normalizeWaitRequest } from '../../src/domain/wait-request'

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
    expect(normalizeWaitRequest({ label: '' }).label).toBeUndefined()
  })

  it('fails for unknown boolean token', () => {
    expect(() => normalizeWaitRequest({ enabled: 'disabled' })).toThrow(
      "Input 'enabled' must be a recognized boolean value.",
    )
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
