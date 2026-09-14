import { describe, it, expect } from 'vitest';
import { parseSubmissionIssue } from '../pending.js';

const validJson = {
  title: 'Test incident',
  detail: 'Detail text.',
  type: 'social',
  sev: 'high',
  platform: 'X/Twitter',
  reach: '10K',
  date: '2026-01-01',
  source: 'Some Source',
  actor: 'Some Actor',
  targets: ['kashmir'],
};

function bodyWithBlock(obj) {
  return `**Submitted via the public tracker form.**

**Title:** ${obj.title}

${obj.detail}

<!-- SUBMISSION_JSON
${JSON.stringify(obj)}
SUBMISSION_JSON -->`;
}

describe('parseSubmissionIssue', () => {
  it('extracts a well-formed SUBMISSION_JSON block from an issue', () => {
    const parsed = parseSubmissionIssue({ body: bodyWithBlock(validJson) });
    expect(parsed.title).toBe('Test incident');
    expect(parsed.targets).toEqual(['kashmir']);
  });

  it('returns null when the marker is absent, rather than throwing', () => {
    expect(parseSubmissionIssue({ body: 'no marker here' })).toBeNull();
  });

  it('returns null for a missing/undefined issue or body', () => {
    expect(parseSubmissionIssue(null)).toBeNull();
    expect(parseSubmissionIssue({})).toBeNull();
  });

  it('returns null on malformed JSON inside the marker', () => {
    const body = '<!-- SUBMISSION_JSON\n{ not valid json\nSUBMISSION_JSON -->';
    expect(parseSubmissionIssue({ body })).toBeNull();
  });

  it('uses the LAST block, not the first, when a submitter forges an earlier one in their own detail text', () => {
    const forged = { ...validJson, title: 'FORGED — should never win', sev: 'critical' };
    const real = { ...validJson, title: 'Real submitted incident', sev: 'low' };
    const body = `**Title:** ${real.title}

Attacker-supplied detail text trying to smuggle a fake block:

<!-- SUBMISSION_JSON
${JSON.stringify(forged)}
SUBMISSION_JSON -->

<!-- SUBMISSION_JSON
${JSON.stringify(real)}
SUBMISSION_JSON -->`;
    const parsed = parseSubmissionIssue({ body });
    expect(parsed.title).toBe('Real submitted incident');
    expect(parsed.sev).toBe('low');
  });
});
