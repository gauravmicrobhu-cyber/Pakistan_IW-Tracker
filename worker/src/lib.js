// ── PURE(ish) HELPERS ── request validation, rate-limit key/threshold logic, and GitHub Issue
// body formatting, kept separate from the fetch handler (index.js) precisely so they can be unit
// tested without spinning up Workers KV or making real network calls. Nothing in this file
// touches `env`, `fetch`, or KV directly.

export const RATE_LIMIT_MAX = 5;
export const RATE_LIMIT_WINDOW_SECONDS = 3600; // 1 hour

// Max lengths are deliberately generous but bounded — this is a public, unauthenticated endpoint,
// so nothing should be allowed to submit an unbounded-size payload.
export const FIELD_LIMITS = {
  title: 200,
  detail: 5000,
  type: 50,
  sev: 50,
  platform: 300,
  reach: 200,
  date: 20,
  source: 300,
  actor: 300,
};

const REQUIRED_FIELDS = ['title', 'detail', 'type', 'sev', 'date'];

// Validates a submitted incident payload. Returns { valid, errors } rather than throwing, so the
// caller can return a clean 400 with a details list instead of a generic 500.
export function validateSubmission(fields) {
  const errors = [];
  if (!fields || typeof fields !== 'object' || Array.isArray(fields)) {
    return { valid: false, errors: ['Request body must be a JSON object.'] };
  }

  REQUIRED_FIELDS.forEach((f) => {
    const v = fields[f];
    if (typeof v !== 'string' || !v.trim()) {
      errors.push(`Missing required field: ${f}`);
    }
  });

  Object.entries(FIELD_LIMITS).forEach(([field, max]) => {
    const v = fields[field];
    if (typeof v === 'string' && v.length > max) {
      errors.push(`Field "${field}" exceeds max length of ${max} characters.`);
    }
  });

  if (fields.targets !== undefined) {
    if (!Array.isArray(fields.targets) || !fields.targets.every((t) => typeof t === 'string')) {
      errors.push('Field "targets" must be an array of strings, if present.');
    } else if (fields.targets.length > 20) {
      errors.push('Field "targets" has too many entries.');
    }
  }

  return { valid: errors.length === 0, errors };
}

// A filled-in honeypot field is a strong bot signal — real users never see or fill it in (it's
// hidden via CSS and removed from the tab order in index.html). Deliberately permissive about
// what counts as "filled in": any non-whitespace content trips it.
export function isHoneypotTripped(fields) {
  return !!(fields && typeof fields.website === 'string' && fields.website.trim().length > 0);
}

// Builds the GitHub Issue body: a human-readable summary for the reviewer, followed by an
// HTML-comment-wrapped JSON block that both this Worker and the promote-submission Actions
// workflow (and the frontend Pending Review tab) parse via the exact same
// `<!-- SUBMISSION_JSON ... SUBMISSION_JSON -->` marker. Keep that marker text exactly in sync
// across all three call sites if it ever needs to change.
export function buildIssueBody(fields) {
  const targets = Array.isArray(fields.targets) ? fields.targets : [];
  const jsonPayload = {
    title: fields.title || '',
    detail: fields.detail || '',
    type: fields.type || '',
    sev: fields.sev || '',
    platform: fields.platform || '',
    reach: fields.reach || '',
    date: fields.date || '',
    source: fields.source || '',
    actor: fields.actor || '',
    targets,
  };

  return `**Submitted via the public tracker form.**

**Title:** ${fields.title || ''}
**Type:** ${fields.type || ''} · **Severity:** ${fields.sev || ''}
**Platform:** ${fields.platform || ''} · **Date:** ${fields.date || ''}
**Source:** ${fields.source || ''} · **Actor:** ${fields.actor || ''}

${fields.detail || ''}

<!-- SUBMISSION_JSON
${JSON.stringify(jsonPayload)}
SUBMISSION_JSON -->`;
}

export function rateLimitKey(ip) {
  return `ratelimit:${ip || 'unknown'}`;
}

export function isOverRateLimit(currentCount, max = RATE_LIMIT_MAX) {
  return (currentCount || 0) >= max;
}

// Reflects the configured ALLOWED_ORIGIN — a fixed value from wrangler.toml [vars], never the
// request's own Origin header — so this never turns into an open reflector.
export function buildCorsHeaders(allowedOrigin) {
  return {
    'Access-Control-Allow-Origin': allowedOrigin || '',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}
