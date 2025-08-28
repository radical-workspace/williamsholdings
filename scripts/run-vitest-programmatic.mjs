#!/usr/bin/env node
// Programmatic Vitest runner to avoid interactive watch UI and capture a single-run verbose report
import { run } from 'vitest'

const result = await run({
  include: ['tests/admin-approval.test.ts'],
  reporters: ['verbose'],
  watch: false,
  run: true,
  silent: false,
  maxConcurrency: 1,
  // force environment CI to true
  env: {
    CI: 'true'
  }
})

// vitest's run may return an exit code or undefined; normalize
if (typeof result === 'number') process.exit(result)
if (result && (result.exitCode || result.success === false)) process.exit(result.exitCode ?? 1)
process.exit(0)
