import * as core from '@actions/core'
import { emitOutputs } from './action/emit-outputs'
import { readInputs } from './action/read-inputs'
import {
  WaitCancelledError,
  cancellationAwareDelay,
} from './adapters/cancellation-aware-delay'
import { executeWait } from './app/execute-wait'
import { ValidationError } from './domain/validation-error'

async function run(): Promise<void> {
  const request = readInputs()
  const result = await executeWait(request, {
    delay: cancellationAwareDelay,
    log: core.info,
  })

  emitOutputs(result)
  core.debug('Wait action completed.')
}

if (require.main === module) {
  run().catch((error: unknown) => {
    if (error instanceof WaitCancelledError) {
      core.notice(error.message)
      process.exitCode = signalExitCode(error.signal)
      return
    }

    if (error instanceof ValidationError) {
      core.setFailed(error.message)
      return
    }

    if (error instanceof Error) {
      core.setFailed(`Unexpected error: ${error.message}`)
      return
    }
    core.setFailed(`Unexpected error: ${String(error)}`)
  })
}

function signalExitCode(signal: NodeJS.Signals): number {
  switch (signal) {
    case 'SIGINT':
      return 130
    case 'SIGTERM':
      return 143
    default:
      return 1
  }
}
