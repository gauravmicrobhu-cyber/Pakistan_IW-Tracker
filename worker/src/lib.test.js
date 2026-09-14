import { describe, it, expect } from 'vitest';
import {
  validateSubmission,
  isHoneypotTripped,
  buildIssueBody,
  rateLimitKey,
  isOverRateLimit,
  buildCorsHeaders,
  RATE_LIMIT_MAX,
} from './lib.js';

const validFields = {
  title: 'Test incident title',
  detail: 'Some detail text describing the operation.',
  type: 'social',
  sev: 'high',
  platform: 'X/Twitter',
  reach: '10K',
  date: '2026-01-01',
  source: 'Some Source',
  actor: 'Some Actor',
  targets: ['kashmir'],
};

describe('validateSubmission', () => {
  it('accepts a fully valid submission', () => {
    const { valid, errors } = validateSubmission(validFields);
    expect(valid).toBe(true);
    expect(errors).toEqual([]);
  });

  it('rejects a non-object body', () => {
    expect(validateSubmission(null).valid).toBe(false);
    expect(validateSubmission('nope').valid).toBe(false);
    expect(validateSubmission([1, 2]).valid).toBe(false);
    expect(validateSubmission(undefined).valid).toBe(false);
  });

  it('rejects when a required field is missing', () => {
    const { valid, errors } = validateSubmission({ ...validFields, title: '' });
    expect(valid).toBe(false);
    expect(errors.some((e) => e.includes('title'))).toBe(true);
  });

  it('rejects when a required field is only whitespace', () => {
    const { valid, errors } = validateSubmission({ ...validFields, detail: '   ' });
    expect(valid).toBe(false);
    expect(errors.some((e) => e.includes('detail'))).toBe(true);
  });

  it('rejects a title over the max length', () => {
    const { valid, errors } = validateSubmission({ ...validFields, title: 'x'.repeat(201) });
    expect(valid).toBe(false);
    expect(errors.some((e) => e.includes('title'))).toBe(true);
  });

  it('rejects a detail over the max length', () => {
    const { valid, errors } = validateSubmission({ ...validFields, detail: 'x'.repeat(5001) });
    expect(valid).toBe(false);
    expect(errors.some((e) => e.includes('detail'))).toBe(true);
  });

  it('accepts a submission with no targets field at all', () => {
    const { title, detail, type, sev, date } = validFields;
    expect(validateSubmission({ title, detail, type, sev, date }).valid).toBe(true);
  });

  it('rejects a non-array targets field', () => {
    const { valid, errors } = validateSubmission({ ...validFields, targets: 'kashmir' });
    expect(valid).toBe(false);
    expect(errors.some((e) => e.includes('targets'))).toBe(true);
  });

  it('rejects a targets array with non-string entries', () => {
    const { valid } = validateSubmission({ ...validFields, targets: [1, 2] });
    expect(valid).toBe(false);
  });
});

describe('isHoneypotTripped', () => {
  it('is false when the honeypot field is absent or empty', () => {
    expect(isHoneypotTripped({})).toBe(false);
    expect(isHoneypotTripped({ website: '' })).toBe(false);
    expect(isHoneypotTripped({ website: '   ' })).toBe(false);
  });

  it('is true when the honeypot field has real content', () => {
    expect(isHoneypotTripped({ website: 'http://spam.example' })).toBe(true);
  });
});

describe('buildIssueBody', () => {
  it('includes the human-readable summary fields', () => {
    const body = buildIssueBody(validFields);
    expect(body).toContain('**Title:** Test incident title');
    expect(body).toContain('social');
    expect(body).toContain('high');
  });

  it('embeds a well-formed, round-trippable SUBMISSION_JSON block with the exact marker', () => {
    const body = buildIssueBody(validFields);
    expect(body).toContain('<!-- SUBMISSION_JSON');
    expect(body).toContain('SUBMISSION_JSON -->');

    const m = body.match(/<!-- SUBMISSION_JSON\n([\s\S]*?)\nSUBMISSION_JSON -->/);
    expect(m).not.toBeNull();
    const parsed = JSON.parse(m[1]);
    expect(parsed.title).toBe(validFields.title);
    expect(parsed.detail).toBe(validFields.detail);
    expect(parsed.targets).toEqual(['kashmir']);
  });

  it('defaults an absent targets field to an empty array in the embedded JSON', () => {
    const { targets, ...withoutTargets } = validFields;
    const body = buildIssueBody(withoutTargets);
    const m = body.match(/<!-- SUBMISSION_JSON\n([\s\S]*?)\nSUBMISSION_JSON -->/);
    expect(JSON.parse(m[1]).targets).toEqual([]);
  });
});

describe('rateLimitKey', () => {
  it('namespaces the key by IP', () => {
    expect(rateLimitKey('1.2.3.4')).toBe('ratelimit:1.2.3.4');
  });

  it('falls back to a stable key when IP is missing', () => {
    expect(rateLimitKey(undefined)).toBe('ratelimit:unknown');
    expect(rateLimitKey('')).toBe('ratelimit:unknown');
  });
});

describe('isOverRateLimit', () => {
  it('is false below the max', () => {
    expect(isOverRateLimit(0)).toBe(false);
    expect(isOverRateLimit(RATE_LIMIT_MAX - 1)).toBe(false);
  });

  it('is true at or above the max', () => {
    expect(isOverRateLimit(RATE_LIMIT_MAX)).toBe(true);
    expect(isOverRateLimit(RATE_LIMIT_MAX + 1)).toBe(true);
  });

  it('treats a missing/undefined count as zero', () => {
    expect(isOverRateLimit(undefined)).toBe(false);
  });
});

describe('buildCorsHeaders', () => {
  it('reflects the configured allowed origin, not an arbitrary one', () => {
    const headers = buildCorsHeaders('https://example.github.io');
    expect(headers['Access-Control-Allow-Origin']).toBe('https://example.github.io');
    expect(headers['Access-Control-Allow-Methods']).toContain('POST');
  });

  it('falls back to an empty string when no origin is configured', () => {
    expect(buildCorsHeaders(undefined)['Access-Control-Allow-Origin']).toBe('');
  });
});
