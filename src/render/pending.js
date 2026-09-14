import { pullLog } from '../data/pullLog.js';
import { pendingSeed } from '../data/pendingSeed.js';
import { platColors, tierMeta, confidenceMeta, tagClass, typeLabels } from '../data/lookups.js';
import { formatDate } from '../logic/dates.js';
import { enrichIncident } from '../logic/enrichIncident.js';
import { escapeHtml } from '../logic/escapeHtml.js';
import { GITHUB_OWNER, GITHUB_REPO } from '../config.js';

// ── PENDING REVIEW TAB ── live queue of public submissions awaiting moderation.
//
// This used to render a localStorage/pendingSeed-driven queue with client-side Promote/Dismiss
// buttons that wrote straight into the local incidents array. That entire mechanism is gone:
// anyone on the internet can now submit via the Log Incident tab (see addIncident() in feed.js),
// so moderation has to happen somewhere a stranger can't just click "Promote" on their own
// submission. It happens on GitHub instead — every submission becomes a GitHub Issue labeled
// `submission:pending`, and the repo owner reviews it there and labels it `approved` or
// `declined` (handled by .github/workflows/promote-submission.yml). This tab just fetches and
// displays those open Issues, read-only, via GitHub's public REST API (no auth needed — public
// repo, read-only). IMPORTANT: this renders unmoderated public text from a GitHub Issue BEFORE a
// human has reviewed it, so every field pulled from the issue is escaped before it touches
// innerHTML — see escapeHtml() calls below.

const SUBMISSION_JSON_RE = /<!--\s*SUBMISSION_JSON\r?\n([\s\S]*?)\r?\nSUBMISSION_JSON\s*-->/;

// Pulls the embedded machine-readable JSON block out of a submission Issue's body (see
// worker/src/lib.js buildIssueBody() for the format both sides agree on). Returns null — rather
// than throwing — for a missing or malformed block, so one bad/hand-edited Issue can't crash the
// whole tab; the caller falls back to a plain title + "review on GitHub" link in that case.
export function parseSubmissionIssue(issue) {
  const body = (issue && issue.body) || '';
  const m = body.match(SUBMISSION_JSON_RE);
  if (!m) return null;
  try {
    const data = JSON.parse(m[1]);
    if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
    if (!data.title || typeof data.title !== 'string') return null;
    return data;
  } catch (e) {
    return null;
  }
}

function updatePendingCounts(n) {
  const countEl = document.getElementById('pendingCount');
  if (countEl) countEl.textContent = n;
  const tabCount = document.getElementById('pendingTabCount');
  if (tabCount) tabCount.textContent = n > 0 ? n : '';
  const empty = document.getElementById('pendingEmptyState');
  if (empty) empty.classList.toggle('visible', n === 0);
}

function renderSubmissionCard(issue) {
  const submittedDate = issue.created_at ? formatDate(issue.created_at.slice(0, 10)) : '—';
  const parsed = parseSubmissionIssue(issue);

  if (!parsed) {
    return `<div class="incident-card pending">
      <div class="card-top">
        <div class="card-meta"><span class="pending-badge">⏳ Pending</span></div>
        <span class="pending-found">SUBMITTED: ${submittedDate}</span>
      </div>
      <div class="card-title">${escapeHtml(issue.title)}</div>
      <div class="card-body" style="font-style:italic;color:var(--text-dim);">Couldn't parse this submission's structured data (edited or malformed Issue body) — open it on GitHub to review the raw content.</div>
      <div style="margin-top:10px;"><a href="${issue.html_url}" target="_blank" rel="noopener noreferrer" class="btn-reset" style="display:inline-block;text-decoration:none;">Review on GitHub →</a></div>
    </div>`;
  }

  // Work on a shallow copy — enrichIncident() mutates in place — so we never mistake
  // issue-derived data for something belonging to the real incidents registry.
  const inc = enrichIncident({ ...parsed });
  const platKey = (inc.platform || '').toLowerCase().split('/')[0].trim();
  const platColor = platColors[platKey] || 'var(--text-dim)';
  const tier = tierMeta[inc._tier] || tierMeta.other;
  const conf = confidenceMeta[inc._confidence] || confidenceMeta.likely;

  return `<div class="incident-card pending">
    <div class="card-top">
      <div class="card-meta">
        <span class="pending-badge">⏳ Pending</span>
        <span class="tag ${tagClass[inc.type] || ''}">${typeLabels[inc.type] || escapeHtml(inc.type) || '—'}</span>
        <span class="sev-badge sev-${escapeHtml(inc.sev) || 'medium'}">${escapeHtml(inc.sev) || '—'}</span>
        <span class="tier-badge" style="color:${tier.color};border-color:${tier.color}55;" title="${tier.label}">${tier.short}</span>
        <span class="tier-badge" style="color:${conf.color};border-color:${conf.color}55;" title="${conf.label}">${conf.icon} ${conf.short}</span>
      </div>
      <span class="pending-found">SUBMITTED: ${submittedDate}</span>
    </div>
    <div class="card-title">${escapeHtml(inc.title)}</div>
    <div class="card-body">${escapeHtml(inc.detail)}</div>
    <div class="card-footer">
      <span class="card-date">${formatDate(inc.date)}</span>
      <div class="card-platform">
        <div class="platform-dot" style="background:${platColor}"></div>
        <span class="platform-label">${escapeHtml(inc.platform) || '—'}</span>
      </div>
      ${inc.reach ? `<span class="card-reach">Reach: <span>${escapeHtml(inc.reach)}</span></span>` : ''}
    </div>
    <div style="margin-top:6px;font-family:var(--mono);font-size:9px;color:var(--muted);letter-spacing:0.08em;display:flex;gap:10px;flex-wrap:wrap;align-items:center;">
      ${inc.source ? `<span>SOURCE: ${escapeHtml(inc.source)}</span>` : ''}
      <span>ACTOR: ${escapeHtml(inc._actor || 'Unattributed')}</span>
    </div>
    <div style="margin-top:10px;">
      <a href="${issue.html_url}" target="_blank" rel="noopener noreferrer" class="btn-reset" style="display:inline-block;text-decoration:none;">Review &amp; moderate on GitHub →</a>
    </div>
  </div>`;
}

export async function renderPending() {
  renderPastPulls();
  const feed = document.getElementById('pendingFeed');
  if (!feed) return;

  feed.innerHTML = '<div class="map-empty">Loading live submissions from GitHub…</div>';

  let issues;
  try {
    const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues?labels=submission:pending&state=open&per_page=100`;
    const res = await fetch(url, { headers: { Accept: 'application/vnd.github+json' } });
    if (!res.ok) {
      if (res.status === 403 || res.status === 429) {
        throw new Error("GitHub's anonymous API rate limit (~60 requests/hour/IP) has been reached — try again later.");
      }
      throw new Error(`GitHub API returned an error (status ${res.status}).`);
    }
    issues = await res.json();
    if (!Array.isArray(issues)) throw new Error('Unexpected response from GitHub API.');
  } catch (e) {
    feed.innerHTML = `<div class="map-empty">Couldn't load pending submissions from GitHub. ${escapeHtml(e.message || 'Network error — check your connection.')}</div>`;
    console.error(e);
    updatePendingCounts(0);
    return;
  }

  if (!issues.length) {
    feed.innerHTML = '';
    updatePendingCounts(0);
    return;
  }

  const sorted = issues.slice().sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  feed.innerHTML = sorted.map(renderSubmissionCard).join('');
  updatePendingCounts(sorted.length);
}

// ── PAST RESEARCH PULLS ── a read-only historical record of manually-researched candidates
// found before the public submission pipeline existed. These predate GitHub-Issue-based
// moderation and were never wired to it, so there is no Promote/Dismiss for them any more (that
// client-side mechanism is what this whole rework removes) — they're kept visible purely as a
// record of past research, not as actionable items.
export function renderPullLogSummary() {
  const el = document.getElementById('pullLogSummary');
  if (!el || !pullLog.length) return;
  const last = pullLog[pullLog.length - 1];
  el.innerHTML = `LAST PULL: ${formatDate(last.date)} · found ${last.found}, declined ${last.declined} · checked: ${escapeHtml(last.sourcesChecked)}` +
    (last.note ? `<br/>${escapeHtml(last.note)}` : '');
}

export function renderPastPulls() {
  renderPullLogSummary();
  const host = document.getElementById('pastPullsFeed');
  if (!host) return;
  if (!pendingSeed.length) { host.innerHTML = ''; return; }

  const sorted = [...pendingSeed].sort((a, b) => new Date(b.date) - new Date(a.date));
  host.innerHTML = sorted.map(item => {
    const inc = enrichIncident({ ...item });
    const tier = tierMeta[inc._tier] || tierMeta.other;
    const conf = confidenceMeta[inc._confidence] || confidenceMeta.likely;
    return `<div class="incident-card pending" style="opacity:0.8;">
      <div class="card-top">
        <div class="card-meta">
          <span class="pending-badge">📋 Past pull</span>
          <span class="tag ${tagClass[inc.type] || ''}">${typeLabels[inc.type] || inc.type}</span>
          <span class="sev-badge sev-${inc.sev}">${inc.sev}</span>
          <span class="tier-badge" style="color:${tier.color};border-color:${tier.color}55;" title="${tier.label}">${tier.short}</span>
          <span class="tier-badge" style="color:${conf.color};border-color:${conf.color}55;" title="${conf.label}">${conf.icon} ${conf.short}</span>
        </div>
        <span class="pending-found">FOUND: ${inc.foundDate ? formatDate(inc.foundDate) : '—'}</span>
      </div>
      <div class="card-title">${escapeHtml(inc.title)}</div>
      <div class="card-body">${escapeHtml(inc.detail)}</div>
      <div class="card-footer">
        <span class="card-date">${formatDate(inc.date)}</span>
        <div class="card-platform">
          <span class="platform-label">${escapeHtml(inc.platform) || '—'}</span>
        </div>
        ${inc.reach ? `<span class="card-reach">Reach: <span>${escapeHtml(inc.reach)}</span></span>` : ''}
      </div>
      <div style="margin-top:6px;font-family:var(--mono);font-size:9px;color:var(--muted);letter-spacing:0.08em;display:flex;gap:10px;flex-wrap:wrap;align-items:center;">
        ${inc.source ? `<span>SOURCE: ${escapeHtml(inc.source)}</span>` : ''}
        <span>ACTOR: ${escapeHtml(inc._actor || 'Unattributed')}</span>
      </div>
      ${inc.pullNote ? `<div style="margin-top:8px;font-size:11px;color:var(--text-dim);font-style:italic;border-left:2px solid var(--accent2);padding-left:8px;">${escapeHtml(inc.pullNote)}</div>` : ''}
      <div style="margin-top:8px;font-family:var(--mono);font-size:9px;color:var(--muted);">Not part of the live registry — submit via the Log Incident tab to route a candidate like this through moderation.</div>
    </div>`;
  }).join('');
}
