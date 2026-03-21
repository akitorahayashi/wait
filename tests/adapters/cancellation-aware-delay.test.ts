import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  WaitCancelledError,
  cancellationAwareDelay,
} from '../../src/adapters/cancellation-aware-delay'

describe('cancellationAwareDelay', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('resolves after the requested duration', async () => {
    vi.useFakeTimers()

    const waitPromise = cancellationAwareDelay(2)
    await vi.advanceTimersByTimeAsync(2000)

    await expect(waitPromise).resolves.toBeUndefined()
  })

  it('cancels promptly on SIGINT', async () => {
    vi.useFakeTimers()

    const waitPromise = cancellationAwareDelay(60)
    process.emit('SIGINT')

    await expect(waitPromise).rejects.toBeInstanceOf(WaitCancelledError)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('cancels promptly on SIGTERM', async () => {
    vi.useFakeTimers()

    const waitPromise = cancellationAwareDelay(60)
    process.emit('SIGTERM')

    await expect(waitPromise).rejects.toBeInstanceOf(WaitCancelledError)
    expect(vi.getTimerCount()).toBe(0)
  })
})
