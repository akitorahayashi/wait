import { describe, expect, it } from 'vitest'
import { normalizeWaitRequest } from '../../src/domain/wait-request'

describe('normalizeWaitRequest', () => {
  it('defaults enabled to true', () => {
    expect(normalizeWaitRequest({}).enabled).toBe(true)
  })

  it('normalizes false boolean token', () => {
    expect(normalizeWaitRequest({ enabled: 'false' }).enabled).toBe(false)
  })

  it('drops empty labels', () => {
    expect(normalizeWaitRequest({ label: '' }).label).toBeUndefined()
  })

  it('fails for unknown boolean token', () => {
    expect(() => normalizeWaitRequest({ enabled: 'disabled' })).toThrow(
      "Input 'enabled' must be a recognized boolean value.",
    )
  })
})
