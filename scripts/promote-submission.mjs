#!/usr/bin/env node
// ── PROMOTE-SUBMISSION ── run by .github/workflows/promote-submission.yml when a
// `submission:pending` Issue is labeled `approved`. Parses the embedded SUBMISSION_JSON block out
// of the Issue body (the same marker format the Worker writes and the Pending Review tab parses —
// see worker/src/lib.js buildIssueBody() and src/render/pending.js), validates it, and appends a
// new entry to src/data/communityIncidents.json.
//
// The parsing/validation logic below is exported as plain functions specifically so it can be
// unit-tested (scripts/__tests__/promote-submission.test.js) without needing a real GitHub Issue
// or file I/O. Only the block guarded by the `import.meta.url` check at the bottom touches the
// filesystem or process.env/exit — everything above it is pure.

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SUBMISSION_JSON_RE = /<!--\s*SUBMISSION_JSON\r?\n([\s\S]*?)\r?\nSUBMISSION_JSON\s*-->/g;

const REQUIRED_FIELDS = ['title', 'detail', 'type', 'sev', 'date'];

// Extracts and JSON.parses the SUBMISSION_JSON block from an Issue body. Throws a descriptive
// Error (never returns null/undefined) so the caller can let the workflow step fail loudly and
// visibly, per the plan: a submission that can't be parsed should not be silently dropped or
// silently corrupt the data file — it should make noise so a maintainer can add it manually.
//
// Deliberately takes the LAST block in the body, not the first: worker/src/lib.js's
// buildIssueBody() always appends the Worker-authored, validated block at the very end, AFTER the
// submitter's own free-text `detail` field. A submitter can put anything in `detail`, including a
// forged `<!-- SUBMISSION_JSON ... -->` block of their own — if this picked the first match, a
// forged block placed early in the body would silently override the real, validated one (and the
// one a reviewer's eye is drawn to in the human-readable header above it). Taking the last match
// is safe regardless of how many decoy blocks a submitter stuffs into `detail`, because the
// Worker's own block is always the last thing concatenated into the body no matter what.
export function parseSubmissionJson(issueBody) {
  const body = issueBody || '';
  const re = new RegExp(SUBMISSION_JSON_RE.source, 'g');
  let match;
  let lastCapture = null;
  while ((match = re.exec(body)) !== null) {
    lastCapture = match[1];
  }
  if (lastCapture === null) {
    throw new Error('Could not find a SUBMISSION_JSON block in the issue body.');
  }
  let data;
  try {
    data = JSON.parse(lastCapture);
  } catch (e) {
    throw new Error(`SUBMISSION_JSON block is not valid JSON: ${e.message}`);
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('SUBMISSION_JSON block did not parse to a plain object.');
  }
  return data;
}

// Validates the parsed fields and returns a normalized, stably-shaped incident object (without an
// id yet — see assignIncidentId). Throws on any required field missing/empty.
export function validateIncidentFields(data) {
  const missing = REQUIRED_FIELDS.filter((f) => typeof data[f] !== 'string' || !data[f].trim());
  if (missing.length) {
    throw new Error(`Missing/empty required field(s): ${missing.join(', ')}`);
  }
  const targets = Array.isArray(data.targets) ? data.targets.filter((t) => typeof t === 'string') : [];

  return {
    title: String(data.title).trim(),
    detail: String(data.detail).trim(),
    type: String(data.type).trim(),
    sev: String(data.sev).trim(),
    platform: typeof data.platform === 'string' ? data.platform.trim() : '',
    reach: typeof data.reach === 'string' ? data.reach.trim() : '',
    date: String(data.date).trim(),
    source: typeof data.source === 'string' ? data.source.trim() : '',
    actor: typeof data.actor === 'string' ? data.actor.trim() : '',
    targets,
  };
}

// Deterministic, collision-safe numeric id derived from the Issue number. seedIncidents.js uses
// `Date.now() - <offset>` (a ~13-digit number close to build-time "now", i.e. roughly 1.7-1.8e12
// as of 2025-2026); this instead starts at 9e12 — well above any realistic Date.now() value for
// decades — so a community-promoted incident's id can never collide with a seed incident's id,
// while staying the same JS `number` type/shape used everywhere else ids are compared (`i.id ===
// id`, strict equality on a primitive). Same issue promoted twice would collide by construction,
// but the workflow only promotes a given Issue once (it closes + relabels immediately after).
export function assignIncidentId(issueNumber) {
  const n = Number(issueNumber);
  if (!Number.isFinite(n) || n < 0) throw new Error(`Invalid issue number: ${issueNumber}`);
  return 9_000_000_000_000 + n;
}

// Ties the three steps above together into the one thing the workflow actually needs: a
// ready-to-append incident object.
export function buildCommunityIncident(issueBody, issueNumber) {
  const parsed = parseSubmissionJson(issueBody);
  const fields = validateIncidentFields(parsed);
  return { id: assignIncidentId(issueNumber), ...fields };
}

// ── SCRIPT ENTRY POINT ── only runs when this file is executed directly (`node
// scripts/promote-submission.mjs`), not when its functions are imported for testing.
const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isMain) {
  (async () => {
    const issueBody = process.env.ISSUE_BODY || '';
    const issueNumber = process.env.ISSUE_NUMBER;

    let incident;
    try {
      incident = buildCommunityIncident(issueBody, issueNumber);
    } catch (e) {
      console.error('✗ Could not promote this submission:', e.message);
      process.exitCode = 1;
      return;
    }

    const dataPath = path.resolve(process.cwd(), 'src/data/communityIncidents.json');
    let existing;
    try {
      existing = JSON.parse(await readFile(dataPath, 'utf8'));
      if (!Array.isArray(existing)) throw new Error('communityIncidents.json does not contain a JSON array.');
    } catch (e) {
      console.error(`✗ Could not read ${dataPath}:`, e.message);
      process.exitCode = 1;
      return;
    }

    existing.push(incident);
    await writeFile(dataPath, JSON.stringify(existing, null, 2) + '\n', 'utf8');

    console.log(`✓ Promoted issue #${issueNumber} → incident id ${incident.id}: "${incident.title}"`);

    // Modern GitHub Actions output convention (replaces the deprecated ::set-output command).
    if (process.env.GITHUB_OUTPUT) {
      const fs = await import('node:fs/promises');
      await fs.appendFile(process.env.GITHUB_OUTPUT, `incident_id=${incident.id}\n`);
    }
  })();
}
