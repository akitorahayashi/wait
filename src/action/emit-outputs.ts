import * as core from '@actions/core'
import type { WaitResult } from '../domain/wait-result'

export function emitOutputs(result: WaitResult): void {
  core.setOutput('waited', result.waited)
  core.setOutput('effective_seconds', result.effectiveSeconds)
}
