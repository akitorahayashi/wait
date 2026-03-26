import { afterEach, describe, expect, it, vi } from 'vitest'
import * as core from '@actions/core'
import { readInputs } from '../../src/action/read-inputs'
import { ValidationError } from '../../src/domain/validation-error'

vi.mock('@actions/core', () => ({
  getInput: vi.fn(),
}))

const mockedGetInput = vi.mocked(core.getInput)

describe('readInputs', () => {
  afterEach(() => {
    mockedGetInput.mockReset()
  })

  it('fails when no duration inputs are provided', () => {
    mockedGetInput.mockReturnValue('')

    const act = () => readInputs()
    expect(act).toThrow(ValidationError)
    expect(act).toThrow('A duration (minutes or seconds) must be specified.')
  })

  it('fails when both minutes and seconds are provided', () => {
    mockedGetInput.mockImplementation((name: string) => {
      switch (name) {
        case 'minutes':
          return '5'
        case 'seconds':
          return '12'
        default:
          return ''
      }
    })

    const act = () => readInputs()
    expect(act).toThrow(ValidationError)
    expect(act).toThrow(
      'Inputs "minutes" and "seconds" are mutually exclusive.',
    )
  })

  it('uses seconds when provided', () => {
    mockedGetInput.mockImplementation((name: string) => {
      if (name === 'seconds') {
        return '12'
      }
      return ''
    })

    expect(readInputs().effectiveSeconds).toBe(12)
  })

  it('converts minutes to seconds', () => {
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
      if (name === 'seconds') {
        return '10'
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
      if (name === 'seconds') {
        return '10'
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
      if (name === 'seconds') {
        return '10'
      }
      return ''
    })

    const act = () => readInputs()
    expect(act).toThrow(ValidationError)
    expect(act).toThrow("Input 'enabled' must be a recognized boolean value.")
  })

  it('fails for negative non-integer durations', () => {
    mockedGetInput.mockImplementation((name: string) => {
      if (name === 'seconds') {
        return '-1'
      }
      return ''
    })

    const act = () => readInputs()
    expect(act).toThrow(ValidationError)
    expect(act).toThrow("Input 'seconds' must be a non-negative integer.")
  })

  it('fails for decimal non-integer durations', () => {
    mockedGetInput.mockImplementation((name: string) => {
      if (name === 'seconds') {
        return '1.5'
      }
      return ''
    })

    const act = () => readInputs()
    expect(act).toThrow(ValidationError)
    expect(act).toThrow("Input 'seconds' must be a non-negative integer.")
  })
})
