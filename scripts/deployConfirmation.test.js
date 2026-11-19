import { PassThrough } from 'node:stream';
import { expect, it } from 'vitest';
import { confirmDeploy } from './deployConfirmation.mjs';

const createTerminal = (inputText) => {
  const input = new PassThrough();
  const output = new PassThrough();
  let outputText = '';

  input.isTTY = true;
  output.isTTY = true;
  output.on('data', (chunk) => {
    outputText += chunk.toString();
  });

  return {
    input,
    output,
    outputText: () => outputText,
    submit: () => input.end(inputText),
  };
};

it('confirms deployment only when the exact deploy word is entered', async () => {
  const terminal = createTerminal('deploy\n');
  const confirmation = confirmDeploy(terminal.input, terminal.output);
  terminal.submit();

  await expect(confirmation).resolves.toBe(true);
});

it.each(['no\n', ' deploy\n', 'deploy \n', '\n'])(
  'cancels deployment for non-matching input %j',
  async (inputText) => {
    const terminal = createTerminal(inputText);
    const confirmation = confirmDeploy(terminal.input, terminal.output);
    terminal.submit();

    await expect(confirmation).resolves.toBe(false);
    expect(terminal.outputText()).toContain('Deployment cancelled.');
  }
);

it('refuses deployment without an interactive terminal', async () => {
  const input = new PassThrough();
  const output = new PassThrough();
  let outputText = '';
  output.on('data', (chunk) => {
    outputText += chunk.toString();
  });

  await expect(confirmDeploy(input, output)).resolves.toBe(false);
  expect(outputText).toContain('requires an interactive terminal');
  expect(input.listenerCount('data')).toBe(0);
});
