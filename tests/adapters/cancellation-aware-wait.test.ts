import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  WaitCancelledError,
  cancellationAwareWait,
} from '../../src/adapters/cancellation-aware-wait'

function captureSignalHandlers(): {
  handlers: Map<NodeJS.Signals, () => void>
  restore: () => void
} {
  const handlers = new Map<NodeJS.Signals, () => void>()

  const onSpy = vi.spyOn(process, 'on').mockImplementation(((
    event,
    listener,
  ) => {
    if (event === 'SIGINT' || event === 'SIGTERM') {
      handlers.set(event, listener as () => void)
    }
    return process
  }) as typeof process.on)

  const offSpy = vi.spyOn(process, 'off').mockImplementation(((event) => {
    if (event === 'SIGINT' || event === 'SIGTERM') {
      handlers.delete(event)
    }
    return process
  }) as typeof process.off)

  return {
    handlers,
    restore: () => {
      onSpy.mockRestore()
      offSpy.mockRestore()
    },
  }
}

describe('cancellationAwareWait', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('resolves after the requested duration', async () => {
    vi.useFakeTimers()

    const waitPromise = cancellationAwareWait(2)
    await vi.advanceTimersByTimeAsync(2000)

    await expect(waitPromise).resolves.toBeUndefined()
  })

  it('cancels promptly on SIGINT', async () => {
    vi.useFakeTimers()
    const { handlers, restore } = captureSignalHandlers()

    try {
      const waitPromise = cancellationAwareWait(60)
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
      const waitPromise = cancellationAwareWait(60)
      const handler = handlers.get('SIGTERM')

      expect(handler).toBeTypeOf('function')
      handler?.()

      await expect(waitPromise).rejects.toBeInstanceOf(WaitCancelledError)
      expect(vi.getTimerCount()).toBe(0)
    } finally {
      restore()
    }
  })
})
