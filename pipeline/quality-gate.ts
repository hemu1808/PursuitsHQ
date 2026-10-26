import fs from 'node:fs';
import type { QualityReport, StyleReport } from './types.ts';

const actionVerbs = new Set([
  'architected', 'automated', 'built', 'created', 'delivered', 'deployed',
  'designed', 'developed', 'engineered', 'implemented', 'integrated',
  'migrated', 'orchestrated', 'streamed'
]);

const vaguePattern = /\b(responsible for|worked on|helped with|various tasks|several things|multiple duties)\b/i;
const mechanismPattern = /\b(using|with|through|by|via|applying|behind|across|while|then|on|into|from)\b/i;
const outcomePattern = /\b(improv\w*|reduc\w*|cut\w*|rais\w*|achiev\w*|enabl\w*|secur\w*|process\w*|sustain\w*|ground\w*|keep\w*|guarantee\w*|eliminat\w*|deliver\w*|embed\w*|return\w*|expos\w*|restor\w*|validat\w*|confirm\w*|surface\w*|expand\w*|served)\b/i;

function plainText(value: string): string {
  return value
    .replace(/\\textasciitilde\{?\}?/g, '~')
    .replace(/\\%/g, '%')
    .replace(/\\&/g, '&')
    .replace(/\\[a-zA-Z]+\{([^{}]*)\}/g, '$1')
    .replace(/[{}]/g, '')
    .trim();
}

function wordCount(value: string): number {
  return (value.match(/[A-Za-z0-9][A-Za-z0-9+./&'-]*/g) || []).length;
}

export function checkResumeStyle(texContent: string): StyleReport {
  const errors: string[] = [];

  // Check required sections
  if (!/\\sectionhead\{Summary\}/i.test(texContent)) errors.push('Missing Summary section.');
  if (!/\\sectionhead\{Technical Skills\}/i.test(texContent)) errors.push('Missing Technical Skills section.');
  if (!/\\sectionhead\{Experience\}/i.test(texContent)) errors.push('Missing Experience section.');
  if (!/\\sectionhead\{Projects\}/i.test(texContent)) errors.push('Missing Projects section.');
  if (!/\\sectionhead\{Education\}/i.test(texContent)) errors.push('Missing Education section.');

  // Check for forbidden fluff in skills
  if (/pgvector/i.test(texContent.split(/\\sectionhead\{Technical Skills\}/)[1]?.split(/\\sectionhead/)[0] || '')) {
    errors.push('pgvector is forbidden in the Technical Skills section.');
  }
  if (/html5|css3/i.test(texContent.split(/\\sectionhead\{Technical Skills\}/)[1]?.split(/\\sectionhead/)[0] || '')) {
    errors.push('HTML5/CSS3 should not be in Technical Skills.');
  }

  return {
    verdict: errors.length === 0 ? 'pass' : 'fail',
    errors
  };
}

export function checkResumeQuality(texContent: string, pdfPath?: string, expectedPages = 2): QualityReport {
  const errors: string[] = [];
  const warnings: string[] = [];
  const sections: { type: string; header: string; bullets: number }[] = [];
  let totalBullets = 0;

  function auditSection(type: string, header: string, body: string) {
    const bullets = [...body.matchAll(/^\s*\\item\s+(.+)$/gm)].map((m) => plainText(m[1]));
    if (bullets.length < 3) {
      errors.push(`${type} "${plainText(header)}" has ${bullets.length} bullets; expected at least 3.`);
    }

    bullets.forEach((bullet, index) => {
      totalBullets++;
      const words = wordCount(bullet);
      const firstWord = (bullet.match(/^[A-Za-z]+/) || [''])[0].toLowerCase();
      const label = `${type} "${plainText(header)}" bullet ${index + 1}`;

      if (words < 18 || words > 32) errors.push(`${label} has ${words} words; tailored target is 18-32.`);
      if (!actionVerbs.has(firstWord)) errors.push(`${label} does not start with an approved concrete action verb ("${firstWord}").`);
      if (vaguePattern.test(bullet)) errors.push(`${label} contains vague task language.`);
      if (!mechanismPattern.test(bullet)) errors.push(`${label} does not state a concrete mechanism.`);
      if (!outcomePattern.test(bullet)) errors.push(`${label} does not state a concrete outcome.`);
      if (!/\d/.test(bullet)) warnings.push(`${label} has no metric.`);
    });

    sections.push({ type, header: plainText(header), bullets: bullets.length });
  }

  // Parse experience entries
  const entryPattern = /\\entryheader\{([^\n{}]+)\}\{[^\n{}]*\}\s*\\begin\{tightitemize\}([\s\S]*?)\\end\{tightitemize\}/g;
  for (const match of texContent.matchAll(entryPattern)) {
    auditSection('Experience', match[1], match[2]);
  }

  // Parse project entries
  const projectPattern = /\\projectheader\{([^\n{}]+)\}\{[^\n{}]*\}\s*\\begin\{tightitemize\}([\s\S]*?)\\end\{tightitemize\}/g;
  for (const match of texContent.matchAll(projectPattern)) {
    auditSection('Project', match[1], match[2]);
  }

  let pdfMeta: QualityReport['pdf'];
  if (pdfPath && fs.existsSync(pdfPath)) {
    const buffer = fs.readFileSync(pdfPath);
    const raw = buffer.toString('latin1');
    const bytes = buffer.length;

    // Fast robust page count detection
    let pages = 0;
    const match = raw.match(/\/Type\s*\/Pages[\s\S]*?\/Count\s+(\d+)/);
    if (match) {
      pages = parseInt(match[1], 10);
    } else {
      pages = (raw.match(/\/Type\s*\/Page\b/g) || []).length;
    }

    pdfMeta = {
      path: pdfPath,
      bytes,
      pages,
      extractedCharacters: raw.length
    };

    if (pages !== expectedPages) {
      errors.push(`Page count is ${pages}; strictly expected ${expectedPages} pages.`);
    }
  }

  return {
    verdict: errors.length === 0 ? 'pass' : 'block',
    sections,
    totals: {
      experienceEntries: sections.filter(s => s.type === 'Experience').length,
      projectEntries: sections.filter(s => s.type === 'Project').length,
      bullets: totalBullets
    },
    pdf: pdfMeta,
    errors,
    warnings
  };
}
