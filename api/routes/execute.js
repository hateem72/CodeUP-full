import express from 'express';
import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
  const { code, language } = req.body;
  
  if (!code || !language) {
    return res.status(400).json({ 
      message: "Code and language are required" 
    });
  }

  console.log('Received execution request:', { language, codeLength: code.length });

  try {
    let output = "";
    const tempDir = path.join(process.cwd(), "temp");
    await fs.mkdir(tempDir, { recursive: true });

    switch (language.toLowerCase()) {
      case "javascript":
        const jsFile = path.join(tempDir, "temp.js");
        await fs.writeFile(jsFile, code);
        output = await new Promise((resolve, reject) => {
          exec(`node "${jsFile}"`, (err, stdout, stderr) => {
            if (err) reject(stderr || err.message);
            else resolve(stdout);
          });
        });
        await fs.unlink(jsFile);
        break;

      case "python":
        const pyFile = path.join(tempDir, "temp.py");
        await fs.writeFile(pyFile, code);
        output = await new Promise((resolve, reject) => {
          exec(`python "${pyFile}"`, (err, stdout, stderr) => {
            if (err) reject(stderr || err.message);
            else resolve(stdout);
          });
        });
        await fs.unlink(pyFile);
        break;

      case "cpp":
        const cppFile = path.join(tempDir, "temp.cpp");
        const cppOutput = path.join(tempDir, "temp.exe");
        await fs.writeFile(cppFile, code);
        await new Promise((resolve, reject) => {
          exec(`g++ "${cppFile}" -o "${cppOutput}"`, (err, stdout, stderr) => {
            if (err) reject(stderr || err.message);
            else resolve(stdout);
          });
        });
        output = await new Promise((resolve, reject) => {
          exec(`"${cppOutput}"`, (err, stdout, stderr) => {
            if (err) reject(stderr || err.message);
            else resolve(stdout);
          });
        });
        await Promise.all([
          fs.unlink(cppFile),
          fs.unlink(cppOutput)
        ]);
        break;

      case "java":
        const javaFile = path.join(tempDir, "Main.java");
        await fs.writeFile(javaFile, code);
        await new Promise((resolve, reject) => {
          exec(`javac "${javaFile}"`, (err, stdout, stderr) => {
            if (err) reject(stderr || err.message);
            else resolve(stdout);
          });
        });
        output = await new Promise((resolve, reject) => {
          exec(`java -cp "${tempDir}" Main`, (err, stdout, stderr) => {
            if (err) reject(stderr || err.message);
            else resolve(stdout);
          });
        });
        await Promise.all([
          fs.unlink(javaFile),
          fs.unlink(path.join(tempDir, "Main.class"))
        ]);
        break;

      case "c":
        const cFile = path.join(tempDir, "temp.c");
        const cOutput = path.join(tempDir, "temp.exe");
        await fs.writeFile(cFile, code);
        await new Promise((resolve, reject) => {
          exec(`gcc "${cFile}" -o "${cOutput}"`, (err, stdout, stderr) => {
            if (err) reject(stderr || err.message);
            else resolve(stdout);
          });
        });
        output = await new Promise((resolve, reject) => {
          exec(`"${cOutput}"`, (err, stdout, stderr) => {
            if (err) reject(stderr || err.message);
            else resolve(stdout);
          });
        });
        await Promise.all([
          fs.unlink(cFile),
          fs.unlink(cOutput)
        ]);
        break;

      default:
        return res.status(400).json({ 
          message: `Unsupported language: ${language}` 
        });
    }

    console.log('Execution successful:', { language, output });
    res.json({ output: output.trim() });
  } catch (error) {
    console.error('Execution error:', error);
    res.status(500).json({ 
      message: error.message || 'Code execution failed',
      error: error.stack 
    });
  }
});

export default router;