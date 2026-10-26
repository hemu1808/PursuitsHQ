import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { companyHqMap, getGenericRoleTitle, classifyRoleDomain } from './config.ts';
import { generateTailoredLaTeX } from './tailor.ts';
import { compileLaTeX } from './compiler.ts';
import { checkResumeQuality, checkResumeStyle } from './quality-gate.ts';
import { renderPdfProofs } from './proofs.ts';
import { buildManifest, buildExecutiveReport } from './manifest.ts';
import type { TargetCompany, RoleReview } from './types.ts';

const slugify = (s: string) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const hash = (p: string) => createHash('sha256').update(fs.readFileSync(p)).digest('hex');

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';

  const root = process.cwd();
  const templatesDir = path.join(root, 'templates');
  const masterTexPath = path.join(templatesDir, 'resume.master.tex');

  if (command === 'help') {
    console.log(`
PursuitsHQ Pipeline CLI
=======================
Usage:
  node --experimental-strip-types pipeline/cli.ts <command> [options]

Commands:
  tailor        Tailor and compile resumes from a JSON checks file
  proofs        Render visual proofs for all compiled PDFs
  all           Execute the end-to-end pipeline (tailor -> compile -> gate -> proof -> manifest)

Options:
  --input=<file>       Path to live-role-checks.json (default: data/live-role-checks.json)
  --outdir=<dir>       Output directory for tailored folders (default: output/submission-preparation)
  --limit=<n>          Limit number of roles to process
`);
    return;
  }

  if (command === 'tailor' || command === 'all') {
    if (!fs.existsSync(masterTexPath)) {
      console.error(`Master LaTeX template not found: ${masterTexPath}`);
      process.exit(1);
    }
    const masterTex = fs.readFileSync(masterTexPath, 'utf8');

    const inputArg = args.find(a => a.startsWith('--input='));
    const inputFile = inputArg ? inputArg.split('=')[1] : path.join(root, 'data', 'live-role-checks.json');

    const outArg = args.find(a => a.startsWith('--outdir='));
    const outDir = outArg ? outArg.split('=')[1] : path.join(root, 'output', 'submission-preparation');

    const limitArg = args.find(a => a.startsWith('--limit='));

    if (!fs.existsSync(inputFile)) {
      console.error(`Input role checks file not found: ${inputFile}`);
      process.exit(1);
    }

    const checksData = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
    const allRows: TargetCompany[] = checksData.rows || [];
    const activeRoles = allRows.filter(r => r.status === 'Active exact role verified');
    const skippedRoles = allRows.filter(r => r.status !== 'Active exact role verified');

    const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : activeRoles.length;
    const targets = activeRoles.slice(0, limit);

    console.log(`[PIPELINE] Processing ${targets.length} active roles into: ${outDir}`);

    const reviews: RoleReview[] = [];
    let passed = 0;
    let failed = 0;

    for (let i = 0; i < targets.length; i++) {
      const r = targets[i];
      const company = r.company;
      const hqLocation = companyHqMap[company] || 'New York, NY';
      const roleTitle = getGenericRoleTitle(company, r.expectedRole, r.verifiedRoleTitle);
      const domain = classifyRoleDomain(company, roleTitle, r.completeJdText);
      const numPadded = String(r.num || i + 1).padStart(3, '0');
      const folderSlug = `${numPadded}-${slugify(company)}-${slugify(roleTitle)}`;
      const folder = path.join(outDir, folderSlug);

      const tailoredTex = generateTailoredLaTeX(masterTex, company, roleTitle, domain, hqLocation, r.completeJdText);
      const texPath = path.join(folder, 'resume.tex');
      const jdPath = path.join(folder, 'job-description.txt');

      fs.mkdirSync(folder, { recursive: true });
      fs.writeFileSync(texPath, tailoredTex, 'utf8');
      fs.writeFileSync(jdPath, r.completeJdText || '', 'utf8');

      // 1. Compile with Tectonic
      const compileRes = compileLaTeX(texPath, folder);
      if (!compileRes.success) {
        console.error(`[FAIL] ${company} compilation error:`, compileRes.error);
        failed++;
        continue;
      }

      // 2. Style Check
      const styleReport = checkResumeStyle(tailoredTex);
      if (styleReport.verdict !== 'pass') {
        console.error(`[FAIL] ${company} style check failed:`, styleReport.errors);
        failed++;
        continue;
      }

      // 3. Quality Gate (2-Page Strict Fit)
      const qualReport = checkResumeQuality(tailoredTex, compileRes.pdfPath, 2);
      if (qualReport.verdict !== 'pass') {
        console.error(`[FAIL] ${company} quality gate failed:`, qualReport.errors);
        failed++;
        continue;
      }

      const review: RoleReview = {
        id: r.id || String(r.num || i + 1),
        num: r.num || i + 1,
        company,
        role: roleTitle,
        rawExpectedRole: r.expectedRole,
        domain,
        folderSlug,
        exactUrl: r.officialRoleUrl || r.requestedUrl || '',
        roleLocation: hqLocation,
        folder,
        tex: texPath,
        pdf: compileRes.pdfPath,
        pdfHash: hash(compileRes.pdfPath),
        summary: tailoredTex.match(/\\sectionhead\{Summary\}\s*\n([\s\S]*?)\n\\vspace/)?.[1] || '',
        style: styleReport,
        quality: qualReport,
        pages: qualReport.pdf?.pages,
        readyToSubmit: true
      };

      fs.writeFileSync(path.join(folder, 'review.json'), JSON.stringify(review, null, 2));
      reviews.push(review);
      passed++;

      if ((i + 1) % 10 === 0 || i === targets.length - 1) {
        console.log(`[PROGRESS] ${i + 1}/${targets.length} completed. Passed: ${passed}, Failed: ${failed}`);
      }
    }

    // Build Manifest and Report
    const manifestPath = path.join(path.dirname(inputFile), 'tailored-resumes-manifest.json');
    const reportPath = path.join(path.dirname(inputFile), 'REPORT.md');
    const manifest = buildManifest(reviews, skippedRoles.map(s => ({
      num: s.num || 0,
      company: s.company,
      role: s.expectedRole,
      ats: s.ats || 'Other',
      url: s.requestedUrl || '',
      reason: s.status || 'Closed'
    })), allRows.length, manifestPath);
    buildExecutiveReport(manifest, reportPath);

    console.log(`\n================ PIPELINE FINISHED ================`);
    console.log(`Total: ${targets.length} | Passed: ${passed} | Failed: ${failed}`);
    console.log(`Manifest: ${manifestPath}`);
    console.log(`Report: ${reportPath}`);

    if (command === 'all' && passed > 0) {
      console.log('\n[PROOFS] Rendering visual proof PNGs...');
      const proofDir = path.join(path.dirname(inputFile), 'visual');
      const items = reviews.map(r => ({ id: r.folderSlug, pdfPath: r.pdf }));
      const proofRes = await renderPdfProofs(items, proofDir);
      console.log(`Proofs completed: ${proofRes.rendered}/${proofRes.total} rendered to ${proofDir}`);
    }
  }
}

main().catch(console.error);
