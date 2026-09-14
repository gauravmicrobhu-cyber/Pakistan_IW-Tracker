import { describe, it, expect } from 'vitest';
import {
  parseSubmissionJson,
  validateIncidentFields,
  assignIncidentId,
  buildCommunityIncident,
} from '../promote-submission.mjs';

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

describe('parseSubmissionJson', () => {
  it('extracts and parses a well-formed SUBMISSION_JSON block', () => {
    const parsed = parseSubmissionJson(bodyWithBlock(validJson));
    expect(parsed.title).toBe('Test incident');
    expect(parsed.targets).toEqual(['kashmir']);
  });

  it('throws when the marker is entirely absent', () => {
    expect(() => parseSubmissionJson('Just some issue text with no marker.')).toThrow(/SUBMISSION_JSON block/);
  });

  it('throws on an empty/undefined body', () => {
    expect(() => parseSubmissionJson('')).toThrow();
    expect(() => parseSubmissionJson(undefined)).toThrow();
  });

  it('throws on malformed JSON inside the marker', () => {
    const badBody = '<!-- SUBMISSION_JSON\n{ this is not valid json\nSUBMISSION_JSON -->';
    expect(() => parseSubmissionJson(badBody)).toThrow(/not valid JSON/);
  });

  it('throws when the block parses to a non-object (e.g. an array)', () => {
    const badBody = '<!-- SUBMISSION_JSON\n["not","an","object"]\nSUBMISSION_JSON -->';
    expect(() => parseSubmissionJson(badBody)).toThrow(/plain object/);
  });
});

describe('validateIncidentFields', () => {
  it('accepts a fully valid payload and normalizes it', () => {
    const result = validateIncidentFields(validJson);
    expect(result).toEqual({
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
    });
  });

  it('throws listing every missing required field', () => {
    expect(() => validateIncidentFields({ title: 'Only a title' })).toThrow(/detail.*type.*sev.*date|date.*sev.*type.*detail/s);
  });

  it('throws when a required field is present but only whitespace', () => {
    expect(() => validateIncidentFields({ ...validJson, title: '   ' })).toThrow(/title/);
  });

  it('defaults optional fields (platform, reach, source, actor, targets) when absent', () => {
    const { platform, reach, source, actor, targets, ...required } = validJson;
    const result = validateIncidentFields(required);
    expect(result.platform).toBe('');
    expect(result.reach).toBe('');
    expect(result.source).toBe('');
    expect(result.actor).toBe('');
    expect(result.targets).toEqual([]);
  });

  it('drops non-string entries from targets rather than throwing', () => {
    const result = validateIncidentFields({ ...validJson, targets: ['kashmir', 42, null] });
    expect(result.targets).toEqual(['kashmir']);
  });
});

describe('assignIncidentId', () => {
  it('derives a stable id from the issue number', () => {
    expect(assignIncidentId(7)).toBe(9_000_000_000_007);
    expect(assignIncidentId('42')).toBe(9_000_000_000_042);
  });

  it('never collides with a realistic Date.now()-based seed id', () => {
    // seedIncidents.js ids are Date.now()-derived (currently ~1.7-1.8e12); the 9e12 base here is
    // far beyond that range (won't be reached by real epoch-ms values until the year ~2255).
    expect(assignIncidentId(1)).toBeGreaterThan(Date.now());
    expect(assignIncidentId(1)).toBeGreaterThan(9_000_000_000_000);
  });

  it('throws on a non-numeric or negative issue number', () => {
    expect(() => assignIncidentId('not-a-number')).toThrow();
    expect(() => assignIncidentId(-1)).toThrow();
    expect(() => assignIncidentId(undefined)).toThrow();
  });
});

describe('buildCommunityIncident', () => {
  it('parses, validates, and assigns an id in one call', () => {
    const inc = buildCommunityIncident(bodyWithBlock(validJson), 123);
    expect(inc.id).toBe(9_000_000_000_123);
    expect(inc.title).toBe('Test incident');
    expect(inc.targets).toEqual(['kashmir']);
  });

  it('propagates a parse failure', () => {
    expect(() => buildCommunityIncident('no marker here', 1)).toThrow();
  });

  it('propagates a validation failure', () => {
    const incomplete = { title: 'x' };
    expect(() => buildCommunityIncident(bodyWithBlock(incomplete), 1)).toThrow();
  });
});
