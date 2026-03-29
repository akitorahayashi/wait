import { describe, expect, it, vi } from 'vitest'
import { executeWait } from '../../src/app/execute-wait'

describe('executeWait', () => {
  it('skips when enabled is false', async () => {
    const wait = vi.fn<(seconds: number) => Promise<void>>()
    const log = vi.fn<(message: string) => void>()

    const result = await executeWait(
      {
        enabled: false,
        effectiveSeconds: 20,
        label: undefined,
      },
      { wait, log },
    )

    expect(result).toEqual({ waited: false, effectiveSeconds: 20 })
    expect(wait).not.toHaveBeenCalled()
    expect(log).toHaveBeenCalledWith(
      'Skipping wait because enabled=false. effective_seconds=20.',
    )
  })

  it('skips when effective duration is zero', async () => {
    const wait = vi.fn<(seconds: number) => Promise<void>>()
    const log = vi.fn<(message: string) => void>()

    const result = await executeWait(
      {
        enabled: true,
        effectiveSeconds: 0,
        label: 'build',
      },
      { wait, log },
    )

    expect(result).toEqual({ waited: false, effectiveSeconds: 0 })
    expect(wait).not.toHaveBeenCalled()
    expect(log).toHaveBeenCalledWith(
      'Skipping wait because effective_seconds=0. label=build',
    )
  })

  it('waits when enabled and duration is positive', async () => {
    const wait = vi.fn<(seconds: number) => Promise<void>>().mockResolvedValue()
    const log = vi.fn<(message: string) => void>()

    const result = await executeWait(
      {
        enabled: true,
        effectiveSeconds: 12,
        label: 'deploy',
      },
      { wait, log },
    )

    expect(result).toEqual({ waited: true, effectiveSeconds: 12 })
    expect(wait).toHaveBeenCalledWith(12)
    expect(log).toHaveBeenCalledWith(
      'Starting wait for 12 second(s). label=deploy',
    )
    expect(log).toHaveBeenCalledWith(
      'Wait completed after 12 second(s). label=deploy',
    )
  })

  it('propagates wait failures', async () => {
    const wait = vi
      .fn<(seconds: number) => Promise<void>>()
      .mockRejectedValue(new Error('cancelled'))

    await expect(
      executeWait(
        {
          enabled: true,
          effectiveSeconds: 15,
          label: undefined,
        },
        { wait, log: vi.fn() },
      ),
    ).rejects.toThrow('cancelled')
  })
})
