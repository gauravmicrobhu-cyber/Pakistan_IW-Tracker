// ── PRISM IW TRACKER — SUBMISSION RELAY WORKER ──
// The only reason this Worker exists: an anonymous browser can't safely hold a GitHub write
// token, so this sits in between. It verifies a Turnstile challenge + honeypot + per-IP rate
// limit, then opens a GitHub Issue (labeled `submission:pending`) using a token that lives ONLY
// as a Worker secret (env.GITHUB_TOKEN) — never sent to, or readable by, the browser.
//
// Credential handling (read this before touching this file): env.GITHUB_TOKEN and
// env.TURNSTILE_SECRET_KEY are read ONLY from `env` (Worker secrets set via `wrangler secret
// put`), never logged, and never echoed back in any response body — the only thing returned to
// the caller on success is the created issue's public html_url.

import {
  validateSubmission,
  isHoneypotTripped,
  buildIssueBody,
  rateLimitKey,
  isOverRateLimit,
  buildCorsHeaders,
  RATE_LIMIT_MAX,
  RATE_LIMIT_WINDOW_SECONDS,
} from './lib.js';

function json(status, obj, extraHeaders) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', ...(extraHeaders || {}) },
  });
}

async function verifyTurnstile(token, secret, remoteip) {
  if (!token || !secret) return false;
  const body = new URLSearchParams();
  body.set('secret', secret);
  body.set('response', token);
  if (remoteip) body.set('remoteip', remoteip);

  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const data = await res.json().catch(() => ({ success: false }));
  return data && data.success === true;
}

async function createGithubIssue(env, fields) {
  const title = `[Submission] ${fields.title}`.slice(0, 250);
  return fetch(`https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/issues`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      // GitHub's API requires a User-Agent on every request.
      'User-Agent': 'prism-iw-tracker-submission-worker',
    },
    body: JSON.stringify({
      title,
      body: buildIssueBody(fields),
      labels: ['submission:pending'],
    }),
  });
}

export default {
  async fetch(request, env) {
    const cors = buildCorsHeaders(env.ALLOWED_ORIGIN);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    if (request.method !== 'POST') {
      return json(405, { error: 'Method not allowed' }, cors);
    }

    let fields;
    try {
      fields = await request.json();
    } catch (e) {
      return json(400, { error: 'Invalid JSON body' }, cors);
    }

    const { valid, errors } = validateSubmission(fields);
    if (!valid) {
      return json(400, { error: 'Invalid submission', details: errors }, cors);
    }

    // Honeypot: pretend success without doing anything real, so a bot filling in every field
    // (including this hidden one) gets no signal that it was caught.
    if (isHoneypotTripped(fields)) {
      return json(200, { success: true }, cors);
    }

    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const key = rateLimitKey(ip);

    let currentCount = 0;
    try {
      const stored = await env.RATE_LIMIT_KV.get(key);
      currentCount = stored ? (parseInt(stored, 10) || 0) : 0;
    } catch (e) {
      // KV unavailable: fail open on the read (don't block legitimate submissions on an
      // infrastructure hiccup) but never surface the internal error to the client.
      console.error('RATE_LIMIT_KV read failed:', e);
    }

    if (isOverRateLimit(currentCount, RATE_LIMIT_MAX)) {
      return json(429, { error: 'Too many submissions from this network — please try again later.' }, cors);
    }

    // Turnstile verification. Checked after the honeypot/rate-limit short-circuits (cheaper
    // checks first) but before the counter is incremented or GitHub is touched.
    let turnstileOk = false;
    try {
      turnstileOk = await verifyTurnstile(fields['cf-turnstile-response'], env.TURNSTILE_SECRET_KEY, ip);
    } catch (e) {
      console.error('Turnstile verification request failed:', e);
    }
    if (!turnstileOk) {
      return json(403, { error: 'Verification challenge failed — please retry.' }, cors);
    }

    // Increment the rate-limit counter only once a submission has cleared every other check —
    // so a bot repeatedly failing Turnstile burns its own budget, not a legitimate submitter's.
    try {
      await env.RATE_LIMIT_KV.put(key, String(currentCount + 1), { expirationTtl: RATE_LIMIT_WINDOW_SECONDS });
    } catch (e) {
      console.error('RATE_LIMIT_KV write failed:', e);
    }

    let ghRes;
    try {
      ghRes = await createGithubIssue(env, fields);
    } catch (e) {
      console.error('GitHub issue-creation request failed:', e);
      return json(502, { error: 'Could not submit right now — please try again later.' }, cors);
    }

    if (!ghRes.ok) {
      // Deliberately generic — never leak GitHub's raw error body or status details, which could
      // include information about the token/repo configuration, back to an anonymous caller.
      console.error('GitHub API returned', ghRes.status, await ghRes.text().catch(() => ''));
      return json(502, { error: 'Could not submit right now — please try again later.' }, cors);
    }

    const issue = await ghRes.json().catch(() => null);
    return json(200, { success: true, url: (issue && issue.html_url) || null }, cors);
  },
};
