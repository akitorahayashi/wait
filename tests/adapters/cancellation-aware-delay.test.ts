import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  WaitCancelledError,
  cancellationAwareDelay,
} from '../../src/adapters/cancellation-aware-delay'

function captureSignalHandlers(): {
  handlers: Map<NodeJS.Signals, () => void>
  restore: () => void
} {
  const handlers = new Map<NodeJS.Signals, () => void>()
  const originalOn = process.on.bind(process)
  const originalOff = process.off.bind(process)

  const onSpy = vi.spyOn(process, 'on').mockImplementation(((
    event,
    listener,
  ) => {
    if (event === 'SIGINT' || event === 'SIGTERM') {
      handlers.set(event, listener as () => void)
      return process
    }
    return originalOn(event, listener)
  }) as typeof process.on)

  const offSpy = vi.spyOn(process, 'off').mockImplementation(((
    event,
    listener,
  ) => {
    if (event === 'SIGINT' || event === 'SIGTERM') {
      handlers.delete(event)
      return process
    }
    return originalOff(event, listener)
  }) as typeof process.off)

  return {
    handlers,
    restore: () => {
      onSpy.mockRestore()
      offSpy.mockRestore()
    },
  }
}

describe('cancellationAwareDelay', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('resolves immediately if duration is 0', async () => {
    const waitPromise = cancellationAwareDelay(0)
    await expect(waitPromise).resolves.toBeUndefined()
  })

  it('resolves immediately if duration is negative', async () => {
    const waitPromise = cancellationAwareDelay(-5)
    await expect(waitPromise).resolves.toBeUndefined()
  })

  it('resolves after the requested duration', async () => {
    vi.useFakeTimers()

    const waitPromise = cancellationAwareDelay(2)
    await vi.advanceTimersByTimeAsync(2000)

    await expect(waitPromise).resolves.toBeUndefined()
  })

  it('cancels promptly on SIGINT', async () => {
    vi.useFakeTimers()
    const { handlers, restore } = captureSignalHandlers()

    try {
      const waitPromise = cancellationAwareDelay(60)
      const handler = handlers.get('SIGINT')

      expect(handler).toBeTypeOf('function')
      handler?.()

      await expect(waitPromise).rejects.toBeInstanceOf(WaitCancelledError)
      expect(vi.getTimerCount()).toBe(0)
    } finally {
      restore()
    }
  })

  it('cancels promptly on SIGTERM', async () => {
    vi.useFakeTimers()
    const { handlers, restore } = captureSignalHandlers()

    try {
      const waitPromise = cancellationAwareDelay(60)
      const handler = handlers.get('SIGTERM')

      expect(handler).toBeTypeOf('function')
      handler?.()

      await expect(waitPromise).rejects.toBeInstanceOf(WaitCancelledError)
      expect(vi.getTimerCount()).toBe(0)
    } finally {
      restore()
    }
  })

  it('resolves correctly for chunked delays longer than 60 seconds', async () => {
    vi.useFakeTimers()

    const waitPromise = cancellationAwareDelay(150) // 60s + 60s + 30s

    // First chunk
    await vi.advanceTimersByTimeAsync(60_000)

    // Second chunk
    await vi.advanceTimersByTimeAsync(60_000)

    // Third (final) chunk
    await vi.advanceTimersByTimeAsync(30_000)

    await expect(waitPromise).resolves.toBeUndefined()
  })

  it('cancels properly during a subsequent chunk of a long delay', async () => {
    vi.useFakeTimers()
    const { handlers, restore } = captureSignalHandlers()

    try {
      const waitPromise = cancellationAwareDelay(150)

      // Complete first chunk
      await vi.advanceTimersByTimeAsync(60_000)

      const handler = handlers.get('SIGINT')

      expect(handler).toBeTypeOf('function')
      handler?.()

      await expect(waitPromise).rejects.toBeInstanceOf(WaitCancelledError)
      expect(vi.getTimerCount()).toBe(0)
    } finally {
      restore()
    }
  })

  it('rejects if process.on throws an error', async () => {
    const onSpy = vi.spyOn(process, 'on').mockImplementation(() => {
      throw new Error('Fake error during process.on')
    })

    try {
      const waitPromise = cancellationAwareDelay(2)
      await expect(waitPromise).rejects.toThrow(
        'Failed to install cancellation handlers.',
      )
    } finally {
      onSpy.mockRestore()
    }
  })

  it('rejects if setTimeout throws an error', async () => {
    const setTimeoutSpy = vi
      .spyOn(global, 'setTimeout')
      .mockImplementation(() => {
        throw new Error('Fake error during setTimeout')
      })

    try {
      const waitPromise = cancellationAwareDelay(2)
      await expect(waitPromise).rejects.toThrow('Failed to start wait timer.')
    } finally {
      setTimeoutSpy.mockRestore()
    }
  })

  it('ignores duplicate cancellation signals', async () => {
    vi.useFakeTimers()
    const { handlers, restore } = captureSignalHandlers()

    try {
      const waitPromise = cancellationAwareDelay(60)
      const handler = handlers.get('SIGINT')

      expect(handler).toBeTypeOf('function')
      handler?.()

      // Call again to trigger early return in rejectWithError
      handler?.()

      await expect(waitPromise).rejects.toBeInstanceOf(WaitCancelledError)
      expect(vi.getTimerCount()).toBe(0)
    } finally {
      restore()
    }
  })

  it('ignores subsequent chunk scheduling after wait is cancelled', async () => {
    vi.useFakeTimers()
    const { handlers, restore } = captureSignalHandlers()

    let capturedScheduleNextChunk: (() => void) | undefined
    const setTimeoutSpy = vi.spyOn(global, 'setTimeout').mockImplementation(((
      callback: () => void,
    ) => {
      capturedScheduleNextChunk = callback
      // We don't actually schedule it, just capture it
      return 123 as unknown as NodeJS.Timeout
    }) as typeof setTimeout)

    try {
      const waitPromise = cancellationAwareDelay(150)

      const handler = handlers.get('SIGINT')
      expect(handler).toBeTypeOf('function')

      handler?.() // Cancels the wait, marks as settled

      await expect(waitPromise).rejects.toBeInstanceOf(WaitCancelledError)

      // Trigger the chunk schedule manually after it's settled.
      // This covers lines 57-59 in the source code.
      expect(capturedScheduleNextChunk).toBeTypeOf('function')
      capturedScheduleNextChunk?.()

      // The promise is already rejected and settled, so nothing should happen,
      // and coverage should capture the early return.
      expect(vi.getTimerCount()).toBe(0)
    } finally {
      restore()
      setTimeoutSpy.mockRestore()
    }
  })
})
