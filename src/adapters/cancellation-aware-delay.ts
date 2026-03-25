export class WaitCancelledError extends Error {
  public readonly signal: 'SIGINT' | 'SIGTERM'

  constructor(signal: 'SIGINT' | 'SIGTERM') {
    super(`Wait cancelled by ${signal}.`)
    this.name = 'WaitCancelledError'
    this.signal = signal
  }
}

const MILLISECONDS_PER_SECOND = 1000
const SECONDS_PER_DELAY_CHUNK = 60

export async function cancellationAwareDelay(seconds: number): Promise<void> {
  if (seconds <= 0) {
    return
  }

  await new Promise<void>((resolve, reject) => {
    let timeout: NodeJS.Timeout | undefined
    let remainingSeconds = seconds
    let settled = false

    const cleanup = () => {
      if (timeout !== undefined) {
        clearTimeout(timeout)
      }
      process.off('SIGINT', onSigint)
      process.off('SIGTERM', onSigterm)
    }

    const rejectWithError = (error: Error) => {
      if (settled) {
        return
      }
      settled = true
      cleanup()
      reject(error)
    }

    const onSignal = (signal: 'SIGINT' | 'SIGTERM') => {
      rejectWithError(new WaitCancelledError(signal))
    }

    const onSigint = () => onSignal('SIGINT')
    const onSigterm = () => onSignal('SIGTERM')

    try {
      process.on('SIGINT', onSigint)
      process.on('SIGTERM', onSigterm)
    } catch (error) {
      rejectWithError(
        new Error('Failed to install cancellation handlers.', { cause: error }),
      )
      return
    }

    const scheduleNextChunk = () => {
      if (settled) {
        return
      }

      if (remainingSeconds <= 0) {
        settled = true
        cleanup()
        resolve()
        return
      }

      const chunkSeconds = Math.min(remainingSeconds, SECONDS_PER_DELAY_CHUNK)
      remainingSeconds -= chunkSeconds
      try {
        timeout = setTimeout(
          scheduleNextChunk,
          chunkSeconds * MILLISECONDS_PER_SECOND,
        )
      } catch (error) {
        rejectWithError(
          new Error('Failed to start wait timer.', { cause: error }),
        )
      }
    }

    scheduleNextChunk()
  })
}
