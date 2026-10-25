import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import os from 'node:os';
import { sourceRoots } from '../src/lib/source-config.ts';

function withConfiguration(values, check) {
  const keys = ['PURSUITSHQ_REPO', 'PURSUITSHQ_ROOT', 'PURSUITSHQ_DATA_DIR', 'CAREER_OPS_REPO', 'CAREER_OPS_ROOT', 'CAREER_OPS_DATA_DIR', 'JOB_AGENT_STATE_DIR'];
  const previous = Object.fromEntries(keys.map(key => [key, process.env[key]]));
  for (const key of keys) { if (values[key] === undefined) delete process.env[key]; else process.env[key] = values[key]; }
  try { check(); } finally { for (const key of keys) { if (previous[key] === undefined) delete process.env[key]; else process.env[key] = previous[key]; } }
}
test('renamed source settings take precedence without redirecting the application ledger', () => {
  const repository = path.join(os.tmpdir(), 'pursuitshq-configuration-only');
  withConfiguration({ PURSUITSHQ_REPO: repository, PURSUITSHQ_ROOT: 'current', CAREER_OPS_ROOT: 'previous', JOB_AGENT_STATE_DIR: path.join(repository, 'ledger') }, () => {
    assert.deepEqual(sourceRoots(), { pursuits: path.join(repository, 'current'), ledger: path.join(repository, 'ledger') });
  });
});
test('existing source configuration still resolves during the project rename', () => {
  const repository = path.join(os.tmpdir(), 'pursuitshq-configuration-only');
  withConfiguration({ CAREER_OPS_REPO: repository, CAREER_OPS_DATA_DIR: 'archive', JOB_AGENT_STATE_DIR: path.join(repository, 'ledger') }, () => {
    assert.equal(sourceRoots().pursuits, path.join(repository, 'archive'));
  });
});
