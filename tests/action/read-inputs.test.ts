import { afterEach, describe, expect, it, vi } from 'vitest'
import * as core from '@actions/core'
import { readInputs } from '../../src/action/read-inputs'

vi.mock('@actions/core', () => ({
  getInput: vi.fn(),
}))

const mockedGetInput = vi.mocked(core.getInput)

describe('readInputs', () => {
  afterEach(() => {
    mockedGetInput.mockReset()
  })

  it('uses enabled=true and zero duration by default', () => {
    mockedGetInput.mockReturnValue('')

    expect(readInputs()).toEqual({
      enabled: true,
      effectiveSeconds: 0,
      label: undefined,
    })
  })

  it('uses seconds as the authoritative duration source', () => {
    mockedGetInput.mockImplementation((name: string) => {
      switch (name) {
        case 'enabled':
          return 'true'
        case 'minutes':
          return '5'
        case 'seconds':
          return '12'
        default:
          return ''
      }
    })

    expect(readInputs().effectiveSeconds).toBe(12)
  })

  it('converts minutes when seconds is omitted', () => {
    mockedGetInput.mockImplementation((name: string) => {
      if (name === 'minutes') {
        return '2'
      }
      return ''
    })

    expect(readInputs().effectiveSeconds).toBe(120)
  })

  it('parses false enabled values', () => {
    mockedGetInput.mockImplementation((name: string) => {
      if (name === 'enabled') {
        return 'off'
      }
      return ''
    })

    expect(readInputs().enabled).toBe(false)
  })

  it('trims labels and keeps non-empty values', () => {
    mockedGetInput.mockImplementation((name: string) => {
      if (name === 'label') {
        return '  deploy gate  '
      }
      return ''
    })

    expect(readInputs().label).toBe('deploy gate')
  })

  it('fails for unrecognized boolean values', () => {
    mockedGetInput.mockImplementation((name: string) => {
      if (name === 'enabled') {
        return 'sometimes'
      }
      return ''
    })

    expect(() => readInputs()).toThrow(
      "Input 'enabled' must be a recognized boolean value.",
    )
  })

  it('fails for non-integer durations', () => {
    mockedGetInput.mockImplementation((name: string) => {
      if (name === 'seconds') {
        return '1.5'
      }
      return ''
    })

    expect(() => readInputs()).toThrow(
      "Input 'seconds' must be a non-negative integer.",
    )
  })
})
