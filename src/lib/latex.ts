import { Sandbox } from "e2b";

export const generatePDF = async (
  latex_code: string,
  compiler: string = "pdflatex",
): Promise<Buffer> => {
  const sandbox = await Sandbox.create("pdflatex-sandbox-dev");

  try {
    const texFilePath = "/home/user/resume.tex";
    const pdfPath = "/home/user/resume.pdf";

    await sandbox.files.write(texFilePath, latex_code);

    // Run twice (important for references, formatting, etc.)
    for (let i = 0; i < 2; i++) {
      try {
        const result = await sandbox.commands.run(
          `${compiler} -interaction=nonstopmode -halt-on-error ${texFilePath}`,
          { cwd: "/home/user" },
        );
        console.log("SUCCESS STDOUT:", result.stdout);
      } catch (err: any) {
        // E2B throws CommandExitError. We extract the logs from it.
        console.error("LATEX FAILED!");
        console.error("EXIT CODE:", err.exitCode);
        console.error("STDOUT:", err.stdout);
        console.error("STDERR:", err.stderr);

        // Throw a descriptive error so Inngest shows it in the dashboard
        throw new Error(
          `LaTeX Error: ${err.stdout.split("\n").slice(-10).join("\n")}`,
        );
      }
    }

    // Check if PDF exists
    const exists = await sandbox.files.exists(pdfPath);
    if (!exists) {
      throw new Error("PDF not generated");
    }

    const pdfData = await sandbox.files.read(pdfPath, { format: "bytes" });
    const buffer = Buffer.from(pdfData);

    if (!buffer || buffer.length === 0) throw new Error("Empty PDF generated");

    return buffer;
  } finally {
    await sandbox.kill();
  }
};
