import * as core from '@actions/core'
import { emitOutputs } from './action/emit-outputs'
import { readInputs } from './action/read-inputs'
import {
  WaitCancelledError,
  cancellationAwareDelay,
} from './adapters/cancellation-aware-delay'
import { executeWait } from './app/execute-wait'

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
      core.setFailed(error.message)
      return
    }

    if (error instanceof Error) {
      core.setFailed(error.message)
      return
    }
    core.setFailed(String(error))
  })
}
