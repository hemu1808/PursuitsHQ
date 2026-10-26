import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

export interface CompileResult {
  success: boolean;
  code: number;
  pdfPath: string;
  error?: string;
}

export function compileLaTeX(
  texPath: string,
  outDir: string,
  tectonicBin = 'C:/Users/hemu1/bin/tectonic-0.17.0/tectonic.exe'
): CompileResult {
  const pdfName = path.basename(texPath, '.tex') + '.pdf';
  const targetPdf = path.join(outDir, pdfName);

  fs.mkdirSync(outDir, { recursive: true });

  // Remove existing PDF if possible to prevent locks
  if (fs.existsSync(targetPdf)) {
    try { fs.unlinkSync(targetPdf); } catch {}
  }

  const res = spawnSync(tectonicBin, [texPath, '--outdir', outDir], {
    encoding: 'utf8',
    windowsHide: true
  });

  if (res.status !== 0) {
    return {
      success: false,
      code: res.status || 1,
      pdfPath: targetPdf,
      error: res.stderr || res.stdout || 'Unknown Tectonic error'
    };
  }

  if (!fs.existsSync(targetPdf)) {
    return {
      success: false,
      code: 1,
      pdfPath: targetPdf,
      error: 'Compiled PDF not found on disk.'
    };
  }

  return {
    success: true,
    code: 0,
    pdfPath: targetPdf
  };
}
