import * as core from '@actions/core'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { emitOutputs } from '../src/action/emit-outputs'
import { readInputs } from '../src/action/read-inputs'
import { WaitCancelledError } from '../src/adapters/cancellation-aware-delay'
import { executeWait } from '../src/app/execute-wait'
import { run, handleError, signalExitCode } from '../src/index'

vi.mock('@actions/core', () => ({
  info: vi.fn(),
  debug: vi.fn(),
  notice: vi.fn(),
  setFailed: vi.fn(),
}))

vi.mock('../src/action/read-inputs', () => ({
  readInputs: vi.fn(),
}))

vi.mock('../src/action/emit-outputs', () => ({
  emitOutputs: vi.fn(),
}))

vi.mock('../src/app/execute-wait', () => ({
  executeWait: vi.fn(),
}))

describe('index bootstrap', () => {
  describe('run', () => {
    it('should read inputs, execute wait, and emit outputs', async () => {
      const mockRequest = {
        enabled: true,
        minutes: 1,
        seconds: 0,
        label: '',
        effectiveSeconds: 60,
      }
      const mockResult = { waited: true, effectiveSeconds: 60 }

      vi.mocked(readInputs).mockReturnValue(mockRequest)
      vi.mocked(executeWait).mockResolvedValue(mockResult)

      await run()

      expect(readInputs).toHaveBeenCalled()
      expect(executeWait).toHaveBeenCalledWith(mockRequest, expect.any(Object))
      expect(emitOutputs).toHaveBeenCalledWith(mockResult)
      expect(core.debug).toHaveBeenCalledWith('Wait action completed.')
    })
  })

  describe('handleError', () => {
    let originalExitCode: string | number | null | undefined

    beforeEach(() => {
      originalExitCode = process.exitCode
      process.exitCode = undefined
    })

    afterEach(() => {
      if (typeof originalExitCode === 'number') {
        process.exitCode = originalExitCode
      } else {
        process.exitCode = undefined
      }
      vi.clearAllMocks()
    })

    it('should handle WaitCancelledError with notice and set exit code', () => {
      const error = new WaitCancelledError('SIGINT')
      handleError(error)

      expect(core.notice).toHaveBeenCalledWith('Wait cancelled by SIGINT.')
      expect(process.exitCode).toBe(130)
    })

    it('should handle standard Error with setFailed', () => {
      const error = new Error('Standard error')
      handleError(error)

      expect(core.setFailed).toHaveBeenCalledWith('Standard error')
    })

    it('should handle non-Error unknown object with setFailed', () => {
      const error = 'String error'
      handleError(error)

      expect(core.setFailed).toHaveBeenCalledWith('String error')
    })
  })

  describe('signalExitCode', () => {
    it('should return 130 for SIGINT', () => {
      expect(signalExitCode('SIGINT')).toBe(130)
    })

    it('should return 143 for SIGTERM', () => {
      expect(signalExitCode('SIGTERM')).toBe(143)
    })

    it('should return 1 for unknown signal', () => {
      expect(signalExitCode('SIGQUIT' as NodeJS.Signals)).toBe(1)
    })
  })
})
