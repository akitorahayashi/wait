export interface ExecuteWaitDependencies {
  delay: (seconds: number) => Promise<void>
  log: (message: string) => void
}
