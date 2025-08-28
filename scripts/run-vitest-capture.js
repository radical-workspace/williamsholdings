const { exec } = require('child_process');
const fs = require('fs');
const out = fs.createWriteStream('vitest-capture.log');
const cmd = 'npx vitest run tests/admin-approval.test.ts --reporter=verbose --run';
console.log('Running:', cmd);
const p = exec(cmd, { maxBuffer: 1024 * 1024 * 10 });
p.stdout.pipe(out);
p.stderr.pipe(out);
p.on('exit', (code) => {
  console.log('Vitest process exited with code', code);
});
p.on('error', (err) => {
  console.error('Failed to start Vitest:', err);
});
