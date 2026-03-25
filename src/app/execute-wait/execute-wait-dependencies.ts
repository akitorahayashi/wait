export interface ExecuteWaitDependencies {
  wait: (seconds: number) => Promise<void>
  log: (message: string) => void
}
