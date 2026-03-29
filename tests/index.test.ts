import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as core from '@actions/core'
import { run, handleError, signalExitCode } from '../src/index'
import { WaitCancelledError } from '../src/adapters/cancellation-aware-wait'
import * as readInputsModule from '../src/action/read-inputs'
import * as executeWaitModule from '../src/app/execute-wait'
import * as emitOutputsModule from '../src/action/emit-outputs'
import type { WaitRequest } from '../src/domain/wait-request'
import type { WaitResult } from '../src/domain/wait-result'

vi.mock('@actions/core')
vi.mock('../src/action/read-inputs')
vi.mock('../src/app/execute-wait')
vi.mock('../src/action/emit-outputs')
vi.mock('../src/adapters/cancellation-aware-wait', async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import('../src/adapters/cancellation-aware-wait')
    >()
  return {
    ...actual,
    cancellationAwareWait: vi.fn(),
  }
})

describe('index bootstrap', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.exitCode = undefined
  })

  describe('run', () => {
    it('should read inputs, execute wait, and emit outputs', async () => {
      const mockRequest: WaitRequest = {
        enabled: true,
        effectiveSeconds: 5,
        label: undefined,
      }
      const mockResult: WaitResult = { waited: true, effectiveSeconds: 5 }

      vi.spyOn(readInputsModule, 'readInputs').mockReturnValue(mockRequest)
      vi.spyOn(executeWaitModule, 'executeWait').mockResolvedValue(mockResult)
      vi.spyOn(emitOutputsModule, 'emitOutputs').mockImplementation(() => {})

      await run()

      expect(readInputsModule.readInputs).toHaveBeenCalledOnce()
      expect(executeWaitModule.executeWait).toHaveBeenCalledWith(
        mockRequest,
        expect.objectContaining({
          wait: expect.any(Function),
          log: core.info,
        }),
      )
      expect(emitOutputsModule.emitOutputs).toHaveBeenCalledWith(mockResult)
      expect(core.debug).toHaveBeenCalledWith('Wait action completed.')
    })
  })

  describe('handleError', () => {
    it('should set exit code and log notice for WaitCancelledError SIGINT', () => {
      const error = new WaitCancelledError('SIGINT')
      handleError(error)

      expect(core.notice).toHaveBeenCalledWith('Wait cancelled by SIGINT.')
      expect(process.exitCode).toBe(130)
      expect(core.setFailed).not.toHaveBeenCalled()
    })

    it('should set exit code and log notice for WaitCancelledError SIGTERM', () => {
      const error = new WaitCancelledError('SIGTERM')
      handleError(error)

      expect(core.notice).toHaveBeenCalledWith('Wait cancelled by SIGTERM.')
      expect(process.exitCode).toBe(143)
      expect(core.setFailed).not.toHaveBeenCalled()
    })

    it('should fail with error message for generic Error', () => {
      const error = new Error('Something went wrong')
      handleError(error)

      expect(core.setFailed).toHaveBeenCalledWith('Something went wrong')
      expect(core.notice).not.toHaveBeenCalled()
      expect(process.exitCode).toBeUndefined()
    })

    it('should fail with stringified value for unknown error types', () => {
      const error = 'A string error'
      handleError(error)

      expect(core.setFailed).toHaveBeenCalledWith('A string error')
      expect(core.notice).not.toHaveBeenCalled()
      expect(process.exitCode).toBeUndefined()
    })
  })

  describe('signalExitCode', () => {
    it('should return 130 for SIGINT', () => {
      expect(signalExitCode('SIGINT')).toBe(130)
    })

    it('should return 143 for SIGTERM', () => {
      expect(signalExitCode('SIGTERM')).toBe(143)
    })
  })
})
