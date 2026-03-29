import { afterEach, describe, expect, it, vi } from 'vitest'
import * as core from '@actions/core'
import { readInputs } from '../../src/action/read-inputs'
import { createWaitRequest } from '../../src/domain/wait-request'
import { ok } from '../../src/domain/result'

vi.mock('@actions/core', () => ({
  getInput: vi.fn(),
}))

vi.mock('../../src/domain/wait-request', () => ({
  createWaitRequest: vi.fn(),
}))

const mockedGetInput = vi.mocked(core.getInput)
const mockedCreateWaitRequest = vi.mocked(createWaitRequest)

describe('readInputs', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })

  it('reads and trims inputs before passing them to the domain layer', () => {
    mockedCreateWaitRequest.mockReturnValue(
      ok({ enabled: false, effectiveSeconds: 10, label: 'my label' }),
    )

    mockedGetInput.mockImplementation((name: string) => {
      switch (name) {
        case 'enabled':
          return '  false  '
        case 'seconds':
          return '  10  '
        case 'label':
          return '  my label  '
        default:
          return ''
      }
    })

    readInputs()

    expect(mockedCreateWaitRequest).toHaveBeenCalledWith(
      false,
      { seconds: 10 },
      'my label',
    )
  })

  it('treats empty or whitespace-only inputs as absent', () => {
    mockedCreateWaitRequest.mockReturnValue(
      ok({ enabled: true, effectiveSeconds: 0 }),
    )

    mockedGetInput.mockReturnValue('   ')

    readInputs()

    expect(mockedCreateWaitRequest).toHaveBeenCalledWith(true, {}, undefined)
  })

  it('returns explicit error when mutually exclusive inputs are provided', () => {
    mockedGetInput.mockImplementation((name: string) => {
      switch (name) {
        case 'minutes':
          return '2'
        case 'seconds':
          return '10'
        default:
          return ''
      }
    })

    const result = readInputs()

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.message).toBe(
        "Inputs 'minutes' and 'seconds' are mutually exclusive. Please provide only one.",
      )
    }
  })

  it('fails for unknown boolean token', () => {
    mockedGetInput.mockImplementation((name: string) => {
      if (name === 'enabled') return 'disabled'
      return ''
    })

    expect(() => readInputs()).toThrow(
      "Input 'enabled' must be a recognized boolean value.",
    )
  })

  it('fails when parsing non-numeric duration string', () => {
    mockedGetInput.mockImplementation((name: string) => {
      if (name === 'minutes') return 'abc'
      return ''
    })

    const result = readInputs()

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.message).toBe(
        "Input 'minutes' must be a non-negative number.",
      )
    }
  })
})
