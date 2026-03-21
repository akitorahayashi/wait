import { afterEach, describe, expect, it, vi } from 'vitest'
import * as core from '@actions/core'
import { emitOutputs } from '../../src/action/emit-outputs'

vi.mock('@actions/core', () => ({
  setOutput: vi.fn(),
}))

const mockedSetOutput = vi.mocked(core.setOutput)

describe('emitOutputs', () => {
  afterEach(() => {
    mockedSetOutput.mockReset()
  })

  it('emits waited and effective_seconds outputs', () => {
    emitOutputs({
      waited: true,
      effectiveSeconds: 45,
    })

    expect(mockedSetOutput).toHaveBeenCalledWith('waited', true)
    expect(mockedSetOutput).toHaveBeenCalledWith('effective_seconds', 45)
  })
})
