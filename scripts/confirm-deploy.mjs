import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { pathToFileURL } from "node:url";

const PROMPT = "Type 'deploy' to publish to GitHub Pages: ";

export async function confirmDeploy({ isTTY, ask }) {
  if (!isTTY) {
    throw new Error("Deployment requires an interactive terminal; refusing to publish.");
  }

  const answer = await ask(PROMPT);
  if (answer.trim().toLowerCase() !== "deploy") {
    throw new Error("Deployment cancelled.");
  }
}

async function main() {
  const terminal = createInterface({ input: stdin, output: stdout });
  try {
    await confirmDeploy({
      isTTY: Boolean(stdin.isTTY && stdout.isTTY),
      ask: (prompt) => terminal.question(prompt),
    });
  } finally {
    terminal.close();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
