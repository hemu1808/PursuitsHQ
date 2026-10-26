import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

export async function renderPdfProofs(
  items: { id: string; pdfPath: string }[],
  outDir: string,
  concurrency = 8,
  mutoolBin = 'C:/Users/hemu1/bin/mupdf-1.28.0/mupdf-1.28.0-windows/mutool.exe'
): Promise<{ total: number; rendered: number; failed: number }> {
  fs.mkdirSync(outDir, { recursive: true });

  let nextIdx = 0;
  let doneCount = 0;
  let failCount = 0;

  const renderOne = (item: { id: string; pdfPath: string }) => {
    return new Promise<void>((resolve, reject) => {
      const outPattern = path.join(outDir, `${item.id}-%d.png`);
      const p = spawn(mutoolBin, ['draw', '-q', '-r', '96', '-o', outPattern, item.pdfPath], {
        windowsHide: true
      });
      let err = '';
      p.stderr.on('data', (d) => err += d);
      p.on('close', (code) => (code === 0 ? resolve() : reject(new Error(err || `mutool exited with code ${code}`))));
      p.on('error', reject);
    });
  };

  async function worker() {
    while (nextIdx < items.length) {
      const item = items[nextIdx++];
      try {
        await renderOne(item);
        doneCount++;
      } catch (e) {
        failCount++;
      }
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
  await Promise.all(workers);

  return {
    total: items.length,
    rendered: doneCount,
    failed: failCount
  };
}
