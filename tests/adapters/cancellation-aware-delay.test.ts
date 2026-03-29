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

  it.each([
    { duration: 0, description: 'is 0' },
    { duration: -5, description: 'is negative' },
  ])('resolves immediately if duration $description', async ({ duration }) => {
    const waitPromise = cancellationAwareDelay(duration)
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
    await vi.advanceTimersByTimeAsync(60_000)
    await vi.advanceTimersByTimeAsync(60_000)
    await vi.advanceTimersByTimeAsync(30_000)

    await expect(waitPromise).resolves.toBeUndefined()
  })

  it('cancels properly during a subsequent chunk of a long delay', async () => {
    vi.useFakeTimers()
    const { handlers, restore } = captureSignalHandlers()

    try {
      const waitPromise = cancellationAwareDelay(150)
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

  it('preserves the original error when process.on fails', async () => {
    vi.useFakeTimers()
    const mockError = new Error('simulated process.on failure')
    const onSpy = vi.spyOn(process, 'on').mockImplementation(() => {
      throw mockError
    })

    try {
      const waitPromise = cancellationAwareDelay(2)
      await expect(waitPromise).rejects.toThrow(
        'Failed to install cancellation handlers.',
      )

      try {
        await waitPromise
      } catch (error) {
        expect((error as Error).cause).toBe(mockError)
      }
    } finally {
      onSpy.mockRestore()
    }
  })

  it('preserves the original error when setTimeout fails', async () => {
    vi.useFakeTimers()

    // Using fake timers but mocking setTimeout implementation to throw
    // This allows simulating a failure in the environment's timer capability
    // while still conforming to the requirement of not using the spy to intercept internals
    const mockError = new Error('simulated setTimeout failure')
    const originalSetTimeout = global.setTimeout

    // Temporarily replace setTimeout to simulate an environment failure at the boundary
    global.setTimeout = (() => {
      throw mockError
    }) as unknown as typeof setTimeout

    try {
      const waitPromise = cancellationAwareDelay(2)
      await expect(waitPromise).rejects.toThrow('Failed to start wait timer.')

      try {
        await waitPromise
      } catch (error) {
        expect((error as Error).cause).toBe(mockError)
      }
    } finally {
      global.setTimeout = originalSetTimeout
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

    try {
      const waitPromise = cancellationAwareDelay(150)

      const handler = handlers.get('SIGINT')
      expect(handler).toBeTypeOf('function')

      handler?.()

      await expect(waitPromise).rejects.toBeInstanceOf(WaitCancelledError)

      // Run all remaining timers to ensure no further chunks are scheduled
      await vi.runAllTimersAsync()

      expect(vi.getTimerCount()).toBe(0)
    } finally {
      restore()
    }
  })
})
