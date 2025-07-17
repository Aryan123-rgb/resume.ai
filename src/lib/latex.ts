import path from "path";
import { exec } from "child_process";
import fs from "fs/promises";

export const generatePDF = async (latex_code: string) => {
    const folderPath = path.join(process.cwd(), "tmp");
    const texFilePath = path.join(folderPath, "resume.tex");
    const pdfPath = path.join(process.cwd(), 'tmp', 'resume.pdf');

    await fs.mkdir(folderPath, { recursive: true });
    await fs.writeFile(texFilePath, latex_code);

    // Make folderPath POSIX for Docker mount (important on Windows)
    const folderPathPosix = folderPath.replace(/\\/g, "/");
    const dockercmd = [
        "docker run --rm",
        `-v "${folderPathPosix}:/data"`,
        "blang/latex",
        "pdflatex -interaction=nonstopmode resume.tex"
    ].join(" ");

    await new Promise<void>((resolve, reject) => {

        exec(dockercmd, { cwd: folderPath }, async (err, stdout, stderr) => {
            if (err) {
                const pdfExists = await fs.access(pdfPath).then(() => true).catch(() => false)
                if (!pdfExists) {
                    console.error("Docker execution failed:", err);
                    console.error("stderr:", stderr);
                    console.error("stdout:", stdout);
                    return reject(new Error("Failed to compile the LaTeX code."));
                }
            }
            resolve();
        });
    });

    const pdfBuffer = await fs.readFile(pdfPath);

    return pdfBuffer;
};
