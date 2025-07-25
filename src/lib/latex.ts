import path from "path";
import { exec } from "child_process";
import fs from "fs/promises";

// simply accepts the latex code and returns the pdf blob
export const generatePDF = async (latex_code: string) => {
    const folderPath = path.join(process.cwd(), "tmp");
    const texFilePath = path.join(folderPath, "resume.tex");
    const pdfPath = path.join(process.cwd(), 'tmp', 'resume.pdf');

    await fs.mkdir(folderPath, { recursive: true });
    await fs.writeFile(texFilePath, latex_code);

    // remove the pdf if already exists
    await fs.rm(pdfPath, { force: true });

    // console.log("latex_code from latex.ts", latex_code);

    // Make folderPath POSIX for Docker mount (important on Windows)
    const folderPathPosix = folderPath.replace(/\\/g, "/");

    const compileResume = async (compiler: "xelatex" | "pdflatex") => {
        const dockercmd = [
            "docker run --rm",
            `-v "${folderPathPosix}:/data"`,
            "blang/latex",
            `${compiler} -interaction=nonstopmode resume.tex`
        ].join(" ");

        await new Promise<void>((resolve, reject) => {
            console.log("executing ", dockercmd);
            exec(dockercmd, { cwd: folderPath }, async (err, stdout, stderr) => {
                const pdfExists = await fs.access(pdfPath).then(() => true).catch(() => false);
                console.log("pdfExists", pdfExists);

                if (!pdfExists) {
                    if (compiler == 'pdflatex') {
                        console.error("Docker execution failed:", err);
                        console.error("stderr:", stderr);
                        console.error("stdout:", stdout);
                    }

                    let errorMessage = "Failed to compile the LaTeX code.";

                    return reject(new Error(errorMessage));
                }

                resolve();
            });

        });
    }

    try {
        await compileResume('xelatex');
    } catch (error) {
        try {
            const stdoutPath = path.join(folderPath, 'resume.out');
            const logPath = path.join(folderPath, 'resume.log');
            await fs.rm(stdoutPath, { force: true });
            await fs.rm(logPath, { force: true });
            console.log("executing pdflatex compiler");
            await compileResume('pdflatex');
        } catch (e) {
            console.log("compilation failed");
            throw new Error("Compilation failed");
        }
    }

    // await fs.rm(texFilePath, { force: true }).catch(() => { });
    // await fs.rm(pdfPath, { force: true }).catch(() => { });

    const pdfBuffer = await fs.readFile(pdfPath);

    return pdfBuffer;
};
