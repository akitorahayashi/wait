import { afterEach, describe, expect, it, vi } from 'vitest'
import * as core from '@actions/core'
import { readInputs } from '../../src/action/read-inputs'
import { normalizeWaitRequest } from '../../src/domain/wait-request'

vi.mock('@actions/core', () => ({
  getInput: vi.fn(),
}))

vi.mock('../../src/domain/wait-request', () => ({
  normalizeWaitRequest: vi.fn(),
}))

const mockedGetInput = vi.mocked(core.getInput)
const mockedNormalizeWaitRequest = vi.mocked(normalizeWaitRequest)

describe('readInputs', () => {
  afterEach(() => {
    vi.resetAllMocks()
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

    readInputs()

    expect(mockedNormalizeWaitRequest).toHaveBeenCalledWith({
      enabled: 'false',
      minutes: '2',
      seconds: '10',
      label: 'my label',
    })
  })

  it('treats empty or whitespace-only inputs as absent', () => {
    mockedGetInput.mockReturnValue('   ')

    readInputs()

    expect(mockedNormalizeWaitRequest).toHaveBeenCalledWith({
      enabled: undefined,
      minutes: undefined,
      seconds: undefined,
      label: undefined,
    })
  })
})
