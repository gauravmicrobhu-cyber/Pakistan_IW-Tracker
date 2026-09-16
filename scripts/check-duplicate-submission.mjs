#!/usr/bin/env node
// ── CHECK-DUPLICATE-SUBMISSION ── run by .github/workflows/check-duplicate-submission.yml
// whenever the Worker opens a new `submission:pending` Issue. Compares the new submission
// against the curated seed registry, already-approved community incidents, and other currently
// open pending submissions — and, if anything looks similar enough, writes a markdown comment
// (duplicate-comment.md) for the workflow to post on the Issue.
//
// This is a HINT, not a gate: it never blocks, labels, or closes anything. Free-text incident
// matching is fuzzy enough that an automatic hard block risks silently dropping legitimate
// distinct submissions — a human still decides, this just saves them from missing an obvious
// duplicate buried in a busy queue.
//
// All the matching logic below is pure functions with no file/network I/O, specifically so it's
// unit-testable (scripts/__tests__/check-duplicate-submission.test.js) without a real repo
// checkout or GitHub API. Only the block guarded by the `import.meta.url` check at the bottom
// touches the filesystem or process.env/exit.

import { readFile } from 'node:fs/promises';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseSubmissionJson } from './promote-submission.mjs';

// A submission more than this many days apart from a candidate is never considered a duplicate,
// however similar the text — incidents get re-reported/re-amplified weeks apart legitimately.
export const DUPLICATE_MAX_DAYS_APART = 3;

// Minimum title+detail token-overlap (Jaccard) for a candidate to qualify at all. Tuned low
// deliberately — this only ever produces an informational comment, never blocks anything, so
// erring toward more hints (some of them weak) is safer than missing a real duplicate.
export const DUPLICATE_MIN_SIMILARITY = 0.25;

const MAX_MATCHES_SHOWN = 5;

const STOPWORDS = new Set([
  'the', 'and', 'for', 'with', 'from', 'that', 'this', 'was', 'were', 'has', 'have', 'had',
  'its', 'into', 'over', 'after', 'before', 'amid', 'following', 'about', 'against', 'among',
  'are', 'been', 'being', 'but', 'not', 'off', 'out', 'per', 'via', 'who', 'what', 'when',
  'where', 'which', 'while', 'their', 'they', 'them', 'than', 'then', 'also', 'more', 'most',
  'some', 'such', 'each', 'both', 'into', 'onto', 'upon', 'amidst', 'india', 'indian', 'pakistan',
  'pakistani',
]);

export function normalizeText(str) {
  return (str || '').toLowerCase();
}

// Tokenizes into a Set of significant words: strips punctuation, drops short/stopword tokens.
// Filtering "india"/"pakistan"/"indian"/"pakistani" out of the stopword list is deliberate — this
// tracker's incidents virtually all mention both, so leaving them in would inflate similarity
// between totally unrelated incidents.
export function tokenize(str) {
  const words = normalizeText(str)
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !STOPWORDS.has(w));
  return new Set(words);
}

export function jaccardSimilarity(setA, setB) {
  if (!setA.size || !setB.size) return 0;
  let intersection = 0;
  for (const word of setA) {
    if (setB.has(word)) intersection++;
  }
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

// Returns Infinity for missing/invalid dates on either side, so a candidate with a garbage date
// never qualifies via the date-proximity gate rather than accidentally matching everything.
export function daysBetween(dateA, dateB) {
  const a = new Date(`${dateA}T00:00:00`);
  const b = new Date(`${dateB}T00:00:00`);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return Infinity;
  return Math.abs(a.getTime() - b.getTime()) / 86400000;
}

export function scoreCandidate(newIncident, candidate) {
  const newTokens = tokenize(`${newIncident.title || ''} ${newIncident.detail || ''}`);
  const candidateTokens = tokenize(`${candidate.title || ''} ${candidate.detail || ''}`);
  return {
    similarity: jaccardSimilarity(newTokens, candidateTokens),
    daysApart: daysBetween(newIncident.date, candidate.date),
  };
}

// Filters candidates to those within DUPLICATE_MAX_DAYS_APART AND at/above
// DUPLICATE_MIN_SIMILARITY, sorted by similarity descending, capped to `limit`.
export function findLikelyDuplicates(newIncident, candidates, opts = {}) {
  const maxDaysApart = opts.maxDaysApart ?? DUPLICATE_MAX_DAYS_APART;
  const minSimilarity = opts.minSimilarity ?? DUPLICATE_MIN_SIMILARITY;
  const limit = opts.limit ?? MAX_MATCHES_SHOWN;

  return candidates
    .map((candidate) => ({ candidate, ...scoreCandidate(newIncident, candidate) }))
    .filter((m) => m.daysApart <= maxDaysApart && m.similarity >= minSimilarity)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
}

// Maps the curated seed + approved community incidents into the common candidate shape, with a
// deep link into the live site (same ?incident=<id> convention used elsewhere, e.g. the
// promote-submission workflow's success comment).
export function buildExistingIncidentCandidates(seedIncidents, communityIncidents, siteBaseUrl) {
  const all = [...(seedIncidents || []), ...(communityIncidents || [])];
  return all.map((inc) => ({
    source: inc.community ? 'community' : 'seed',
    title: inc.title,
    detail: inc.detail,
    date: inc.date,
    url: `${siteBaseUrl}/?incident=${inc.id}`,
  }));
}

// Parses each other open pending Issue's SUBMISSION_JSON block into the common candidate shape.
// An issue whose body can't be parsed (hand-edited, malformed) is skipped rather than thrown —
// one bad issue shouldn't break duplicate-checking for everyone else. Always excludes the new
// issue itself, in case the caller's issue list happens to include it.
export function buildPendingIssueCandidates(otherIssues, newIssueNumber) {
  const candidates = [];
  for (const issue of otherIssues || []) {
    if (issue.number === newIssueNumber) continue;
    let parsed;
    try {
      parsed = parseSubmissionJson(issue.body);
    } catch (e) {
      continue;
    }
    candidates.push({
      source: 'pending',
      title: parsed.title,
      detail: parsed.detail,
      date: parsed.date,
      url: issue.html_url || issue.url,
      issueNumber: issue.number,
    });
  }
  return candidates;
}

const SOURCE_LABELS = {
  seed: 'Existing incident (curated)',
  community: 'Existing incident (community-approved)',
  pending: 'Another pending submission',
};

export function formatDuplicateComment(matches) {
  const rows = matches
    .map(({ candidate, similarity }) => {
      const label = SOURCE_LABELS[candidate.source] || candidate.source;
      const pct = Math.round(similarity * 100);
      const linkText = candidate.source === 'pending' ? `#${candidate.issueNumber}` : candidate.title;
      return `| [${linkText}](${candidate.url}) | ${label} | ${candidate.date || '—'} | ~${pct}% |`;
    })
    .join('\n');

  return [
    '⚠️ **Possible duplicate(s) detected** — please check before approving:',
    '',
    '| Match | Source | Date | Text similarity |',
    '|---|---|---|---|',
    rows,
    '',
    '_This is an automated hint based on title/detail text overlap and date proximity (±3 days) — not a guarantee of an actual duplicate, and not a block. Please verify manually before labeling this `approved` or `declined`._',
  ].join('\n');
}

// ── SCRIPT ENTRY POINT ── only runs when this file is executed directly, not when its functions
// are imported for testing (same guard pattern as scripts/promote-submission.mjs).
const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isMain) {
  (async () => {
    const newIssueBody = process.env.NEW_ISSUE_BODY || '';
    const newIssueNumber = Number(process.env.NEW_ISSUE_NUMBER);
    const otherIssuesFile = process.env.OTHER_ISSUES_FILE;
    const repoOwner = process.env.REPO_OWNER;
    const repoName = process.env.REPO_NAME;
    const commentOutFile = process.env.COMMENT_OUT_FILE || 'duplicate-comment.md';

    let newIncident;
    try {
      newIncident = parseSubmissionJson(newIssueBody);
    } catch (e) {
      console.log('Could not parse the new issue’s SUBMISSION_JSON block — skipping duplicate check:', e.message);
      return;
    }

    // A literal (non-computed) specifier deliberately — resolves relative to this file's own
    // location regardless of cwd, and (unlike a computed `pathToFileURL(...).href` argument,
    // which trips up Vite's SSR transform when this file is loaded under Vitest) is statically
    // analyzable by tooling.
    const { seedIncidents } = await import('../src/data/seedIncidents.js');
    const communityPath = path.resolve(process.cwd(), 'src/data/communityIncidents.json');
    const communityIncidents = JSON.parse(await readFile(communityPath, 'utf8'));

    let otherIssues = [];
    if (otherIssuesFile) {
      try {
        otherIssues = JSON.parse(await readFile(otherIssuesFile, 'utf8'));
      } catch (e) {
        console.log(`Could not read ${otherIssuesFile} (${e.message}) — continuing without other-pending-issue candidates.`);
      }
    }

    const siteBaseUrl = `https://${repoOwner}.github.io/${repoName}`;
    const candidates = [
      ...buildExistingIncidentCandidates(seedIncidents, communityIncidents, siteBaseUrl),
      ...buildPendingIssueCandidates(otherIssues, newIssueNumber),
    ];

    const matches = findLikelyDuplicates(newIncident, candidates);

    if (!matches.length) {
      console.log('No likely duplicates found.');
      return;
    }

    console.log(`Found ${matches.length} likely duplicate(s):`, matches.map((m) => `${m.candidate.title} (${Math.round(m.similarity * 100)}%)`));
    await writeFile(commentOutFile, formatDuplicateComment(matches), 'utf8');
  })();
}
