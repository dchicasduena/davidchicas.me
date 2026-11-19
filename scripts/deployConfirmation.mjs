import readline from 'node:readline';

export async function confirmDeploy(input = process.stdin, output = process.stdout) {
  if (!input.isTTY || !output.isTTY) {
    output.write('Deployment requires an interactive terminal; aborted.\n');
    return false;
  }

  const terminal = readline.createInterface({ input, output });
  try {
    const response = await new Promise((resolve) => {
      terminal.once('close', () => resolve(null));
      terminal.question('Type "deploy" to build and publish the site: ', resolve);
    });

    if (response !== 'deploy') {
      output.write('\nDeployment cancelled. Type deploy exactly to continue.\n');
      return false;
    }

    return true;
  } finally {
    terminal.close();
  }
}
