import { describe, expect, it, vi } from 'vitest'
import { executeWait } from '../../src/app/execute-wait'

describe('executeWait', () => {
  it('skips when enabled is false', async () => {
    const delay = vi.fn<(seconds: number) => Promise<void>>()
    const log = vi.fn<(message: string) => void>()

    const result = await executeWait(
      {
        enabled: false,
        effectiveSeconds: 20,
        label: undefined,
      },
      { delay, log },
    )

    expect(result).toEqual({ waited: false, effectiveSeconds: 20 })
    expect(delay).not.toHaveBeenCalled()
    expect(log).toHaveBeenCalledWith(
      'Skipping wait because enabled=false. effective_seconds=20',
    )
  })

  it('skips when effective duration is zero', async () => {
    const delay = vi.fn<(seconds: number) => Promise<void>>()
    const log = vi.fn<(message: string) => void>()

    const result = await executeWait(
      {
        enabled: true,
        effectiveSeconds: 0,
        label: 'build',
      },
      { delay, log },
    )

    expect(result).toEqual({ waited: false, effectiveSeconds: 0 })
    expect(delay).not.toHaveBeenCalled()
    expect(log).toHaveBeenCalledWith(
      'Skipping wait because effective_seconds=0. label=build',
    )
  })

  it('waits when enabled and duration is positive', async () => {
    const delay = vi
      .fn<(seconds: number) => Promise<void>>()
      .mockResolvedValue()
    const log = vi.fn<(message: string) => void>()

    const result = await executeWait(
      {
        enabled: true,
        effectiveSeconds: 12,
        label: 'deploy',
      },
      { delay, log },
    )

    expect(result).toEqual({ waited: true, effectiveSeconds: 12 })
    expect(delay).toHaveBeenCalledWith(12)
    expect(log).toHaveBeenCalledWith(
      'Starting wait for 12 second(s). label=deploy',
    )
    expect(log).toHaveBeenCalledWith(
      'Wait completed after 12 second(s). label=deploy',
    )
  })

  it('propagates delay failures', async () => {
    const delay = vi
      .fn<(seconds: number) => Promise<void>>()
      .mockRejectedValue(new Error('cancelled'))

    await expect(
      executeWait(
        {
          enabled: true,
          effectiveSeconds: 15,
          label: undefined,
        },
        { delay, log: vi.fn() },
      ),
    ).rejects.toThrow('cancelled')
  })
})
