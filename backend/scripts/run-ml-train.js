const { spawnSync } = require('child_process');
const path = require('path');

const script = path.join(__dirname, '..', 'ml', 'train_baseline.py');
const candidates = process.platform === 'win32'
  ? [
      'python',
      'py',
      'python3',
      path.join(process.env.LOCALAPPDATA ?? '', 'Programs', 'Python', 'Python311', 'python.exe'),
    ]
  : ['python3', 'python'];

for (const command of candidates) {
  if (!command) continue;
  const result = spawnSync(command, [script], { stdio: 'inherit' });
  if (result.error && result.error.code === 'ENOENT') continue;
  if (result.status === 0) process.exit(0);
}

console.error(
  'Python was not found. Install Python 3.11+ to retrain, or use the committed backend/ml/artifacts model for runtime inference.',
);
process.exit(1);
