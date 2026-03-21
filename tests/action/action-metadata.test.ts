import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import yaml from 'js-yaml'

interface ActionFile {
  runs: {
    using: string
    main: string
  }
  inputs: Record<string, { required?: boolean }>
  outputs: Record<string, unknown>
}

function loadActionFile(path: string): ActionFile {
  const source = readFileSync(resolve(process.cwd(), path), 'utf8')
  const parsed = yaml.load(source)
  return parsed as ActionFile
}

describe('action metadata contracts', () => {
  it('declares node24, wait input contract, and wait outputs', () => {
    const action = loadActionFile('action.yml')
    expect(action.runs.using).toBe('node24')
    expect(action.runs.main).toBe('dist/index.js')
    expect(action.inputs.enabled.required).toBe(false)
    expect(action.inputs.minutes.required).toBe(false)
    expect(action.inputs.seconds.required).toBe(false)
    expect(action.inputs.label.required).toBe(false)
    expect(Object.keys(action.outputs)).toContain('waited')
    expect(Object.keys(action.outputs)).toContain('effective_seconds')
  })
})
