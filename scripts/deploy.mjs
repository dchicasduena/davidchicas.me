import { spawnSync } from 'node:child_process';
import { confirmDeploy } from './deployConfirmation.mjs';

const runCommand = (command, args) => {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  if (result.error) {
    console.error(`Unable to run ${command}: ${result.error.message}`);
    return 1;
  }

  return result.status ?? 1;
};

if (await confirmDeploy()) {
  const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const ghPagesCommand = process.platform === 'win32' ? 'gh-pages.cmd' : 'gh-pages';
  const buildStatus = runCommand(npmCommand, ['run', 'build']);

  if (buildStatus !== 0) {
    process.exitCode = buildStatus;
  } else {
    process.exitCode = runCommand(ghPagesCommand, ['-d', 'build']);
  }
} else {
  process.exitCode = 1;
}
