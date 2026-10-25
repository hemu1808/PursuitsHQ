import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { stageOf, uniqueApplications, summarize, weeklySeries, followUpQueue, withinRange, csvText } from '../src/lib/analytics.ts';
const make = (id, status, submittedAt = '2026-10-01T12:00:00Z') => ({ id, index: 1, company: id, role: 'Software Engineer', url: `https://example.test/jobs/${id}`, ats: 'Other', source: 'direct-company', status, submittedAt });
const reference = '2026-10-24T16:00:00Z';
test('terminal status is preserved while interview history remains countable', () => {
  const rows = [make('closed', 'Rejected'), make('active', 'Interview'), make('pending', 'Submitted (Pending)')];
  const history = [{ id: 'closed', status: 'interview', occurredAt: '2026-10-03', note: 'Recorded interview' }, { id: 'closed', status: 'interview', occurredAt: '2026-10-05', note: 'Second event' }, { id: 'outside-cohort', status: 'interview', occurredAt: '2026-10-05', note: '' }];
  const stats = summarize(rows, history, reference);
  assert.equal(stats.counts.rejected, 1); assert.equal(stats.counts.interview, 1); assert.equal(stats.interviewIds.size, 2); assert.equal(stats.outcomes, 2); assert.equal(stats.maturePending, 1);
  assert.equal(stageOf('Assessment Pending'), 'assessment'); assert.equal(stageOf('Submitted (Pending)'), 'pending');
});
test('deduplication keeps the latest exact ID and retains separate reapplications', () => {
  const oldest = make('same', 'Submitted (Pending)', '2026-10-01'); const newest = make('same', 'Rejected', '2026-10-02'); const other = { ...make('other', 'Submitted (Pending)'), url: oldest.url };
  const result = uniqueApplications([newest, oldest, other]); assert.equal(result.length, 2); assert.equal(result.find(row => row.id === 'same').status, 'Rejected');
});
test('weekly buckets start Monday in UTC and include zero-volume weeks', () => {
  const result = weeklySeries([make('sunday', 'Submitted', '2026-10-18T23:59:59Z'), make('monday', 'Submitted', '2026-10-19T00:00:00Z')], reference, 3);
  assert.deepEqual(result.map(row => row.value), [0, 1, 1]); assert.equal(result[2].date, '2026-10-19T00:00:00.000Z');
  assert.equal(withinRange(make('future', 'Submitted', '2026-10-25'), 7, reference), false);
});
test('follow-up planning honors completion and custom future dates', () => {
  const rows = [make('completed', 'Interview'), make('scheduled', 'Submitted'), make('assessment', 'Assessment Pending'), make('rejected', 'Rejected'), make('due', 'Submitted')];
  const queue = followUpQueue(rows, { completed: { completed: true }, scheduled: { followUp: '2026-11-01' } }, reference);
  assert.deepEqual(queue.map(row => row.id), ['assessment', 'due']);
});
test('CSV export escapes quotes and neutralizes spreadsheet formulas', () => { assert.equal(csvText([['=HYPERLINK("bad")', 'a,b', '@SUM(1)']]), '"\'=HYPERLINK(""bad"")","a,b","\'@SUM(1)"'); });
test('source fixture reconciles without invented active interview loops', () => {
  const rows = JSON.parse(readFileSync(new URL('../src/demo/applications.json', import.meta.url), 'utf8')); const metrics = JSON.parse(readFileSync(new URL('../src/demo/metrics.json', import.meta.url), 'utf8')); const unique = uniqueApplications(rows); const stats = summarize(unique, metrics.interviews, metrics.generatedAt);
  assert.equal(unique.length, rows.length - 2); assert.equal(stats.counts.rejected, 2); assert.equal(stats.counts.interview, 1); assert.equal(stats.counts.assessment, 1); assert.equal(stats.interviewIds.size, 3); assert.equal(Object.values(stats.counts).reduce((a, b) => a + b, 0), unique.length);
});
