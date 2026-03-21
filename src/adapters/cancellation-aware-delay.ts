export class WaitCancelledError extends Error {
  public readonly signal: NodeJS.Signals

  constructor(signal: NodeJS.Signals) {
    super(`Wait cancelled by ${signal}.`)
    this.name = 'WaitCancelledError'
    this.signal = signal
  }
}

export async function cancellationAwareDelay(seconds: number): Promise<void> {
  if (seconds <= 0) {
    return
  }

  await new Promise<void>((resolve, reject) => {
    let timeout: NodeJS.Timeout | undefined
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

    const onSignal = (signal: NodeJS.Signals) => {
      rejectWithError(new WaitCancelledError(signal))
    }

    const onSigint = () => onSignal('SIGINT')
    const onSigterm = () => onSignal('SIGTERM')

    try {
      process.on('SIGINT', onSigint)
      process.on('SIGTERM', onSigterm)
    } catch {
      rejectWithError(new Error('Failed to install cancellation handlers.'))
      return
    }

    try {
      timeout = setTimeout(() => {
        if (settled) {
          return
        }
        settled = true
        cleanup()
        resolve()
      }, seconds * 1000)
    } catch {
      rejectWithError(new Error('Failed to start wait timer.'))
    }
  })
}
