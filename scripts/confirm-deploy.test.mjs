import { describe, expect, it, vi } from "vitest";
import { confirmDeploy } from "./confirm-deploy.mjs";

describe("deploy confirmation", () => {
  it("allows publishing only after the explicit confirmation token", async () => {
    const ask = vi.fn().mockResolvedValue(" deploy ");

    await expect(confirmDeploy({ isTTY: true, ask })).resolves.toBeUndefined();
    expect(ask).toHaveBeenCalledWith("Type 'deploy' to publish to GitHub Pages: ");
  });

  it("rejects cancellation and non-interactive terminals", async () => {
    const ask = vi.fn().mockResolvedValue("no");

    await expect(confirmDeploy({ isTTY: true, ask })).rejects.toThrow(
      "Deployment cancelled."
    );
    await expect(confirmDeploy({ isTTY: false, ask })).rejects.toThrow(
      "Deployment requires an interactive terminal"
    );
    expect(ask).toHaveBeenCalledTimes(1);
  });
});
