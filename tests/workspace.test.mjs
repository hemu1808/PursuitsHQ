import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, mkdir, writeFile, appendFile } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { createWorkspaceStore, validatePatch } from '../src/lib/workspace-store.ts';
import { canonicalJob, readPursuitsData, resumeFile } from '../src/lib/pursuitshq-data.ts';
import { pursuitStats } from '../src/lib/pursuitshq-analytics.ts';
import { sameOrigin } from '../src/lib/http.ts';
test('origin validation uses the incoming host rather than an internal Next.js hostname', () => {
  assert.equal(sameOrigin(new Request('http://localhost:3301/api/workspace', { headers: { host: '127.0.0.1:3301', origin: 'http://127.0.0.1:3301' } })), true);
  assert.equal(sameOrigin(new Request('http://localhost:3301/api/workspace', { headers: { host: '127.0.0.1:3301', origin: 'https://unrelated.example' } })), false);
});

test('workspace changes persist beyond the originating store instance', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'pursuits-store-'));
  const file = path.join(directory, 'workspace.json'), first = createWorkspaceStore(file);
  const saved = await first.update({ version: 0, entity: 'application', id: 'example', patch: { note: 'Keep this note', saved: true, followUp: '2026-11-01' } });
  assert.equal(saved.version, 1);
  const reopened = await createWorkspaceStore(file).read();
  assert.equal(reopened.items['application:example'].note, 'Keep this note');
  assert.equal(reopened.items['application:example'].followUp, '2026-11-01');
  assert.equal(reopened.events.length, 1);
  assert.ok((await readFile(file, 'utf8')).includes('Keep this note'));
});
test('concurrent edits reject the stale version instead of silently losing a note', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'pursuits-concurrency-'));
  const store = createWorkspaceStore(path.join(directory, 'workspace.json'));
  const results = await Promise.allSettled([store.update({ version: 0, entity: 'queue', id: 'a', patch: { priority: 2 } }), store.update({ version: 0, entity: 'queue', id: 'b', patch: { priority: 0 } })]);
  assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
  assert.equal(results.find(result => result.status === 'rejected').reason.status, 409);
});
test('queue creation is stored as unverified planning data', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'pursuits-queue-'));
  const store = createWorkspaceStore(path.join(directory, 'workspace.json'));
  const saved = await store.update({ version: 0, create: { company: 'Example', role: 'Engineer', url: 'https://example.test/jobs/123' } });
  assert.equal(saved.customQueue[0].company, 'Example'); assert.ok(saved.customQueue[0].id.startsWith('local-'));
  await assert.rejects(store.update({ version: 1, create: { company: 'Bad', role: 'Engineer', url: 'javascript:alert(1)' } }));
});
test('writes accept only supported fields and valid dates', () => {
  assert.throws(() => validatePatch({ sourcePath: '/secret' }));
  assert.throws(() => validatePatch({ followUp: 'next week' }));
  assert.throws(() => validatePatch({ acknowledged: 'yes' }));
  assert.throws(() => validatePatch({ stage: 'guaranteed offer' }));
});
test('canonical requisitions consolidate tracking links without merging different jobs', () => {
  assert.equal(canonicalJob('https://boards.greenhouse.io/acme/jobs/123/application?utm_source=x'), canonicalJob('https://job-boards.greenhouse.io/acme/jobs/123'));
  assert.notEqual(canonicalJob('https://example.test/jobs/123'), canonicalJob('https://example.test/jobs/124'));
});
test('live adapter rereads changed sources, links attachments, and retains held queue states', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'pursuits-sources-')); const career = path.join(root, 'career'), ledger = path.join(root, 'ledger');
  await mkdir(path.join(career, 'data/company-queue-current'), { recursive: true }); await mkdir(ledger, { recursive: true });
  const pdf = path.join(career, 'sent.pdf'); await writeFile(pdf, '%PDF-1.4 test fixture');
  await writeFile(path.join(ledger, 'applications.ndjson'), JSON.stringify({ id: 'a', company: 'Example', role: 'Engineer', url: 'https://example.test/jobs/a', status: 'submitted', submittedAt: '2026-10-01', answers: { Resume: pdf } }) + '\n');
  await writeFile(path.join(ledger, 'outcomes.ndjson'), '');
  await writeFile(path.join(career, 'data/company-queue-current/master.json'), JSON.stringify({ applications: [], queue: [{ id: 'q', company: 'Other', role: 'Engineer', url: 'https://other.test/jobs/q', status: 'Held — eligibility', blocker: 'Verify eligibility', resume: pdf }] }));
  const previous = { root: process.env.PURSUITSHQ_ROOT, ledger: process.env.JOB_AGENT_STATE_DIR };
  process.env.PURSUITSHQ_ROOT = career; process.env.JOB_AGENT_STATE_DIR = ledger;
  try {
    const data = readPursuitsData(true); assert.equal(data.applications.length, 1); assert.ok(data.resumes.some(resume => resume.applicationIds.length && resume.exists)); assert.ok(data.queue.some(row => row.readiness === 'blocked' && row.blocker));
    assert.equal(resumeFile('not-an-indexed-id'), null); assert.equal(resumeFile(data.applications[0].resumeIds[0]).path, pdf);
    await appendFile(path.join(ledger, 'applications.ndjson'), JSON.stringify({ id: 'b', company: 'Second', role: 'Engineer', url: 'https://second.test/jobs/b', status: 'Applied', date_applied: '2026-10-02' }) + '\n');
    assert.equal(readPursuitsData(true).applications.length, 2);
  } finally { if (previous.root === undefined) delete process.env.PURSUITSHQ_ROOT; else process.env.PURSUITSHQ_ROOT = previous.root; if (previous.ledger === undefined) delete process.env.JOB_AGENT_STATE_DIR; else process.env.JOB_AGENT_STATE_DIR = previous.ledger; }
});
test('timing excludes outcomes before submission and uses the first recorded event', () => {
  const base = { id: 'x', ids: ['x'], company: 'Example', role: 'Engineer', url: '', ats: 'Other', source: 'unknown', appliedAt: '2026-10-01T00:00:00Z', latestAppliedAt: '2026-10-01', stage: 'rejected', resumeIds: [], attempts: 1, outcomeAt: '', evidence: '' };
  const stats = pursuitStats([{ ...base, events: [{ at: '2026-09-01T00:00:00Z', stage: 'interview', note: '' }, { at: '2026-10-05T00:00:00Z', stage: 'rejected', note: '' }] }], '2026-10-24');
  assert.equal(stats.median, 4); assert.equal(stats.timingSample, 1); assert.equal(stats.interviews, 1);
});
