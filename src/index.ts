import * as core from '@actions/core'
import { emitOutputs } from './action/emit-outputs'
import { readInputs } from './action/read-inputs'
import {
  WaitCancelledError,
  cancellationAwareDelay,
} from './adapters/cancellation-aware-delay'
import { executeWait } from './app/execute-wait'

export async function run(): Promise<void> {
  const requestResult = readInputs()

  if (!requestResult.ok) {
    core.setFailed(requestResult.error.message)
    return
  }

  const result = await executeWait(requestResult.value, {
    delay: cancellationAwareDelay,
    log: core.info,
  })

  emitOutputs(result)
  core.debug('Wait action completed.')
}

export function handleError(error: unknown): void {
  if (error instanceof WaitCancelledError) {
    core.notice(error.message)
    process.exitCode = signalExitCode(error.signal)
    return
  }

  if (error instanceof Error) {
    core.setFailed(error.message)
    return
  }
  core.setFailed(String(error))
}

export function signalExitCode(signal: 'SIGINT' | 'SIGTERM'): number {
  switch (signal) {
    case 'SIGINT':
      return 130
    case 'SIGTERM':
      return 143
  }
}

if (require.main === module) {
  run().catch(handleError)
}
