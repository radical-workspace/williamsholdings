#!/usr/bin/env node
import { run } from 'vitest'
import fs from 'fs'

async function main(){
  const result = await run({
    include: ['tests/admin-approval.test.ts'],
    reporters: ['json'],
    watch: false,
    run: true,
    silent: true,
    maxConcurrency: 1,
    environment: 'node'
  })
  try{
    fs.writeFileSync('vitest-result.json', JSON.stringify(result, null, 2))
    console.log('Wrote vitest-result.json')
  }catch(e){
    console.error('Failed to write result file', e)
  }
  if (typeof result === 'number') process.exit(result)
  if (result && (result.exitCode || result.success === false)) process.exit(result.exitCode ?? 1)
  process.exit(0)
}
main()
