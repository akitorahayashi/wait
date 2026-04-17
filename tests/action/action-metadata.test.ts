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
  const action = loadActionFile('action.yml')

  it('declares node24 runtime', () => {
    expect(action.runs.using).toBe('node24')
    expect(action.runs.main).toBe('dist/index.js')
  })

  it('declares wait input contract', () => {
    expect(action.inputs.enabled.required).toBe(false)
    expect(action.inputs.minutes.required).toBe(false)
    expect(action.inputs.seconds.required).toBe(false)
    expect(action.inputs.label.required).toBe(false)
  })

  it('declares wait outputs', () => {
    expect(Object.keys(action.outputs)).toContain('waited')
    expect(Object.keys(action.outputs)).toContain('effective_seconds')
  })
})
