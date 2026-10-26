import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

export interface SubmittedApplication {
  id: string;
  company: string;
  role: string;
  url: string;
  canonicalUrl: string;
  ats: string;
  resumePath: string;
  resumeHash: string;
  submittedAt: string;
  status: 'submitted' | 'applied';
  source: string;
  answers?: Record<string, string>;
}

export interface OutcomeRecord {
  id: string;
  company: string;
  occurredAt: string;
  status: 'interview' | 'screening' | 'assessment' | 'offer' | 'rejected' | 'archived';
  note?: string;
}

export function canonicalJobUrl(rawUrl: string): string {
  try {
    const u = new URL(rawUrl);
    u.hash = '';
    u.hostname = u.hostname.replace(/^boards\.greenhouse\./, 'job-boards.greenhouse.');
    u.pathname = u.pathname.replace(/\/(application|apply|confirmation|applications\/new)\/?$/i, '').replace(/\/$/, '');
    for (const key of [...u.searchParams.keys()]) {
      if (/^(utm_|ref|source|gh_src|tracking|trk|gclid|fbclid|lever-)/i.test(key)) {
        u.searchParams.delete(key);
      }
    }
    u.searchParams.sort();
    return u.href.toLowerCase();
  } catch {
    return (rawUrl || '').toLowerCase();
  }
}

export function checkReapplicationCooldown(
  company: string,
  existingApplications: SubmittedApplication[],
  cooldownDays = 15
): { allowed: boolean; daysSinceLast?: number; reason?: string } {
  const normComp = company.trim().toLowerCase();
  const matched = existingApplications
    .filter(a => a.company.trim().toLowerCase() === normComp)
    .sort((a, b) => Date.parse(b.submittedAt) - Date.parse(a.submittedAt));

  if (matched.length === 0) {
    return { allowed: true };
  }

  const latest = matched[0];
  const elapsedMs = Date.now() - Date.parse(latest.submittedAt);
  const elapsedDays = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));

  if (elapsedDays < cooldownDays) {
    return {
      allowed: false,
      daysSinceLast: elapsedDays,
      reason: `Company reapplication cooldown active: applied ${elapsedDays} days ago (minimum ${cooldownDays} days required).`
    };
  }

  return { allowed: true, daysSinceLast: elapsedDays };
}

export function checkDuplicateSubmission(
  url: string,
  existingApplications: SubmittedApplication[]
): { isDuplicate: boolean; duplicateId?: string } {
  const canon = canonicalJobUrl(url);
  const found = existingApplications.find(a => a.canonicalUrl === canon || canonicalJobUrl(a.url) === canon);
  if (found) {
    return { isDuplicate: true, duplicateId: found.id };
  }
  return { isDuplicate: false };
}

export function appendApplicationLedger(
  app: SubmittedApplication,
  ledgerDir: string
): void {
  fs.mkdirSync(ledgerDir, { recursive: true });
  const filePath = path.join(ledgerDir, 'applications.ndjson');
  const line = JSON.stringify(app) + '\n';
  fs.appendFileSync(filePath, line, 'utf8');
}

export function appendOutcomeLedger(
  outcome: OutcomeRecord,
  ledgerDir: string
): void {
  fs.mkdirSync(ledgerDir, { recursive: true });
  const filePath = path.join(ledgerDir, 'outcomes.ndjson');
  const line = JSON.stringify(outcome) + '\n';
  fs.appendFileSync(filePath, line, 'utf8');
}
