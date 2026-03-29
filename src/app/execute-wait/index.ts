import type { WaitRequest } from '../../domain/wait-request'
import type { WaitResult } from '../../domain/wait-result'
import type { ExecuteWaitDependencies } from './execute-wait-dependencies'

export async function executeWait(
  request: WaitRequest,
  dependencies: ExecuteWaitDependencies,
): Promise<WaitResult> {
  const labelSegment = request.label ? ` label=${request.label}` : ''

  if (!request.enabled) {
    dependencies.log(
      `Skipping wait because enabled=false. effective_seconds=${request.effectiveSeconds}${labelSegment}.`,
    )
    return { waited: false, effectiveSeconds: request.effectiveSeconds }
  }

  if (request.effectiveSeconds === 0) {
    dependencies.log(
      `Skipping wait because effective_seconds=0.${labelSegment}`,
    )
    return { waited: false, effectiveSeconds: request.effectiveSeconds }
  }

  dependencies.log(
    `Starting wait for ${request.effectiveSeconds} second(s).${labelSegment}`,
  )
  await dependencies.wait(request.effectiveSeconds)
  dependencies.log(
    `Wait completed after ${request.effectiveSeconds} second(s).${labelSegment}`,
  )

  return { waited: true, effectiveSeconds: request.effectiveSeconds }
}
