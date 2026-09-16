import { describe, it, expect } from 'vitest';
import {
  tokenize,
  jaccardSimilarity,
  daysBetween,
  scoreCandidate,
  findLikelyDuplicates,
  buildExistingIncidentCandidates,
  buildPendingIssueCandidates,
  formatDuplicateComment,
  DUPLICATE_MAX_DAYS_APART,
  DUPLICATE_MIN_SIMILARITY,
} from '../check-duplicate-submission.mjs';

describe('tokenize', () => {
  it('lowercases, strips punctuation, and drops short/stopword tokens', () => {
    const tokens = tokenize('ISPR deploys fake videos, and the network amplifies it!');
    expect(tokens.has('ispr')).toBe(true);
    expect(tokens.has('deploys')).toBe(true);
    expect(tokens.has('videos')).toBe(true);
    expect(tokens.has('and')).toBe(false); // stopword
    expect(tokens.has('it')).toBe(false); // too short
  });

  it('filters out india/pakistan mentions (near-universal, not distinguishing)', () => {
    const tokens = tokenize('Pakistan targets India with Indian Pakistani disinformation');
    expect(tokens.has('pakistan')).toBe(false);
    expect(tokens.has('india')).toBe(false);
    expect(tokens.has('indian')).toBe(false);
    expect(tokens.has('pakistani')).toBe(false);
    expect(tokens.has('disinformation')).toBe(true);
  });

  it('returns an empty set for empty/undefined input', () => {
    expect(tokenize('').size).toBe(0);
    expect(tokenize(undefined).size).toBe(0);
  });
});

describe('jaccardSimilarity', () => {
  it('is 1 for identical sets', () => {
    const a = new Set(['fake', 'video', 'network']);
    expect(jaccardSimilarity(a, new Set(a))).toBe(1);
  });

  it('is 0 for disjoint sets', () => {
    expect(jaccardSimilarity(new Set(['fake']), new Set(['real']))).toBe(0);
  });

  it('is 0 if either set is empty', () => {
    expect(jaccardSimilarity(new Set(), new Set(['x']))).toBe(0);
    expect(jaccardSimilarity(new Set(['x']), new Set())).toBe(0);
  });

  it('computes partial overlap correctly', () => {
    const a = new Set(['fake', 'video', 'network', 'ispr']);
    const b = new Set(['fake', 'video', 'real', 'account']);
    // intersection = 2 (fake, video), union = 6
    expect(jaccardSimilarity(a, b)).toBeCloseTo(2 / 6, 5);
  });
});

describe('daysBetween', () => {
  it('computes whole-day differences', () => {
    expect(daysBetween('2025-05-07', '2025-05-07')).toBe(0);
    expect(daysBetween('2025-05-07', '2025-05-09')).toBe(2);
    expect(daysBetween('2025-05-09', '2025-05-07')).toBe(2); // order-independent
  });

  it('returns Infinity for missing or invalid dates', () => {
    expect(daysBetween('', '2025-05-07')).toBe(Infinity);
    expect(daysBetween('not-a-date', '2025-05-07')).toBe(Infinity);
    expect(daysBetween(undefined, undefined)).toBe(Infinity);
  });
});

describe('scoreCandidate', () => {
  it('scores near-identical title+detail with a close date highly', () => {
    const a = { title: 'ISPR fake shootdown videos', detail: 'Recycled footage from unrelated conflicts', date: '2025-05-07' };
    const b = { title: 'ISPR fake shootdown video', detail: 'Recycled footage from an unrelated conflict', date: '2025-05-08' };
    const { similarity, daysApart } = scoreCandidate(a, b);
    expect(similarity).toBeGreaterThan(0.5);
    expect(daysApart).toBe(1);
  });

  it('scores unrelated incidents low', () => {
    const a = { title: 'ISPR fake shootdown videos', detail: 'Recycled footage', date: '2025-05-07' };
    const b = { title: 'Cyber attack on a power grid substation', detail: 'Malware disrupted operations for days', date: '2019-01-01' };
    const { similarity } = scoreCandidate(a, b);
    expect(similarity).toBeLessThan(DUPLICATE_MIN_SIMILARITY);
  });
});

describe('findLikelyDuplicates', () => {
  const newIncident = { title: 'ISPR fake shootdown videos flood X/Twitter', detail: 'Recycled footage from unrelated conflicts', date: '2025-05-07' };

  it('excludes candidates that are too far apart in date, however similar the text', () => {
    const candidates = [{ title: 'ISPR fake shootdown videos flood X/Twitter', detail: 'Recycled footage from unrelated conflicts', date: '2025-01-01' }];
    expect(findLikelyDuplicates(newIncident, candidates)).toHaveLength(0);
  });

  it('excludes candidates below the similarity threshold, however close the date', () => {
    const candidates = [{ title: 'Completely different topic entirely', detail: 'Nothing overlapping here at all', date: '2025-05-07' }];
    expect(findLikelyDuplicates(newIncident, candidates)).toHaveLength(0);
  });

  it('includes and ranks qualifying candidates by similarity descending', () => {
    const strong = { title: 'ISPR fake shootdown videos flood X/Twitter', detail: 'Recycled footage from unrelated conflicts', date: '2025-05-08' };
    const weak = { title: 'ISPR shootdown claim disputed by OSINT community members online', detail: 'Some unrelated extra detail text padding this out further', date: '2025-05-06' };
    const matches = findLikelyDuplicates(newIncident, [weak, strong]);
    expect(matches.length).toBeGreaterThanOrEqual(1);
    expect(matches[0].candidate).toBe(strong);
  });

  it('caps results to the given limit', () => {
    const candidates = Array.from({ length: 10 }, (_, i) => ({
      title: 'ISPR fake shootdown videos flood X/Twitter',
      detail: 'Recycled footage from unrelated conflicts',
      date: '2025-05-07',
      id: i,
    }));
    expect(findLikelyDuplicates(newIncident, candidates, { limit: 3 })).toHaveLength(3);
  });

  it('returns an empty array for an empty candidate list', () => {
    expect(findLikelyDuplicates(newIncident, [])).toEqual([]);
  });
});

describe('buildExistingIncidentCandidates', () => {
  it('tags seed vs community incidents and builds a deep-link URL', () => {
    const seed = [{ id: 1, title: 'Seed one', detail: 'x', date: '2025-01-01' }];
    const community = [{ id: 2, title: 'Community one', detail: 'y', date: '2025-01-02', community: true }];
    const candidates = buildExistingIncidentCandidates(seed, community, 'https://example.github.io/repo');
    expect(candidates).toEqual([
      { source: 'seed', title: 'Seed one', detail: 'x', date: '2025-01-01', url: 'https://example.github.io/repo/?incident=1' },
      { source: 'community', title: 'Community one', detail: 'y', date: '2025-01-02', url: 'https://example.github.io/repo/?incident=2' },
    ]);
  });

  it('handles missing arrays gracefully', () => {
    expect(buildExistingIncidentCandidates(undefined, undefined, 'https://x')).toEqual([]);
  });
});

describe('buildPendingIssueCandidates', () => {
  function bodyWithBlock(obj) {
    return `**Title:** ${obj.title}\n\n<!-- SUBMISSION_JSON\n${JSON.stringify(obj)}\nSUBMISSION_JSON -->`;
  }

  it('parses other issues into candidates and excludes the new issue itself', () => {
    const other = { title: 'Other submission', detail: 'd', type: 't', sev: 's', date: '2025-01-01' };
    const issues = [
      { number: 5, html_url: 'https://github.com/x/y/issues/5', body: bodyWithBlock(other) },
      { number: 7, html_url: 'https://github.com/x/y/issues/7', body: bodyWithBlock(other) }, // this is "the new issue"
    ];
    const candidates = buildPendingIssueCandidates(issues, 7);
    expect(candidates).toHaveLength(1);
    expect(candidates[0].issueNumber).toBe(5);
    expect(candidates[0].source).toBe('pending');
  });

  it('skips issues whose body cannot be parsed instead of throwing', () => {
    const issues = [{ number: 1, html_url: 'https://x', body: 'no marker here' }];
    expect(buildPendingIssueCandidates(issues, 999)).toEqual([]);
  });

  it('handles a missing/undefined issue list', () => {
    expect(buildPendingIssueCandidates(undefined, 1)).toEqual([]);
  });
});

describe('formatDuplicateComment', () => {
  it('includes each match as a table row with a link, source label, date, and percentage', () => {
    const matches = [
      { candidate: { source: 'seed', title: 'Some incident', date: '2025-05-07', url: 'https://x/?incident=1' }, similarity: 0.62 },
      { candidate: { source: 'pending', issueNumber: 12, date: '2025-05-08', url: 'https://github.com/x/y/issues/12' }, similarity: 0.41 },
    ];
    const comment = formatDuplicateComment(matches);
    expect(comment).toContain('Possible duplicate');
    expect(comment).toContain('[Some incident](https://x/?incident=1)');
    expect(comment).toContain('[#12](https://github.com/x/y/issues/12)');
    expect(comment).toContain('~62%');
    expect(comment).toContain('~41%');
    expect(comment).toContain('not a block');
  });
});
