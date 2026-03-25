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

  it('reads and trims inputs before passing them to the domain layer', () => {
    mockedGetInput.mockImplementation((name: string) => {
      switch (name) {
        case 'enabled':
          return '  false  '
        case 'minutes':
          return '  2  '
        case 'seconds':
          return '  10  '
        case 'label':
          return '  my label  '
        default:
          return ''
      }
    })

    expect(readInputs()).toEqual({
      enabled: false,
      effectiveSeconds: 10,
      label: 'my label',
    })
  })

  it('treats empty or whitespace-only inputs as absent', () => {
    mockedGetInput.mockReturnValue('   ')

    expect(readInputs()).toEqual({
      enabled: true,
      effectiveSeconds: 0,
      label: undefined,
    })
  })
})
