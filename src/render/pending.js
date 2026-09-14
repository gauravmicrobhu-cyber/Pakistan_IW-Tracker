import { PENDING_ACTIONED_KEY, incidents, saveIncidents, setMapRendered, setNetworkRendered } from '../state.js';
import { pullLog } from '../data/pullLog.js';
import { pendingSeed } from '../data/pendingSeed.js';
import { platColors, tierMeta, confidenceMeta, tagClass, typeLabels } from '../data/lookups.js';
import { formatDate } from '../logic/dates.js';
import { enrichIncident } from '../logic/enrichIncident.js';
import { renderFeed } from './feed.js';

export function getActionedPendingIds() {
  try { return new Set(JSON.parse(localStorage.getItem(PENDING_ACTIONED_KEY) || '[]')); }
  catch(e) { return new Set(); }
}

export function markPendingActioned(id) {
  const s = getActionedPendingIds();
  s.add(id);
  localStorage.setItem(PENDING_ACTIONED_KEY, JSON.stringify([...s]));
}


export function renderPullLogSummary() {
  const el = document.getElementById('pullLogSummary');
  if (!el || !pullLog.length) return;
  const last = pullLog[pullLog.length - 1];
  el.innerHTML = `LAST PULL: ${formatDate(last.date)} · found ${last.found}, declined ${last.declined} · checked: ${last.sourcesChecked}` +
    (last.note ? `<br/>${last.note}` : '');
}


export function renderPending() {
  renderPullLogSummary();
  const feed = document.getElementById('pendingFeed');
  if (!feed) return;
  const actioned = getActionedPendingIds();
  const live = pendingSeed.filter(p => !actioned.has(p.id));
  live.forEach(enrichIncident);

  const sorted = [...live].sort((a,b) => new Date(b.date) - new Date(a.date));
  feed.innerHTML = sorted.map(inc => {
    const platKey = (inc.platform||'').toLowerCase().split('/')[0].trim();
    const platColor = platColors[platKey] || 'var(--text-dim)';
    const tier = tierMeta[inc._tier] || tierMeta.other;
    const conf = confidenceMeta[inc._confidence] || confidenceMeta.likely;
    return `<div class="incident-card pending" data-id="${inc.id}">
      <div class="card-top">
        <div class="card-meta">
          <span class="pending-badge">⏳ Pending</span>
          <span class="tag ${tagClass[inc.type]}">${typeLabels[inc.type]}</span>
          <span class="sev-badge sev-${inc.sev}">${inc.sev}</span>
          <span class="tier-badge" style="color:${tier.color};border-color:${tier.color}55;" title="${tier.label}">${tier.short}</span>
          <span class="tier-badge" style="color:${conf.color};border-color:${conf.color}55;" title="${conf.label}">${conf.icon} ${conf.short}</span>
        </div>
        <span class="pending-found">FOUND: ${inc.foundDate ? formatDate(inc.foundDate) : '—'}</span>
      </div>
      <div class="card-title">${inc.title}</div>
      <div class="card-body">${inc.detail}</div>
      <div class="card-footer">
        <span class="card-date">${formatDate(inc.date)}</span>
        <div class="card-platform">
          <div class="platform-dot" style="background:${platColor}"></div>
          <span class="platform-label">${inc.platform||'—'}</span>
        </div>
        ${inc.reach ? `<span class="card-reach">Reach: <span>${inc.reach}</span></span>` : ''}
      </div>
      <div style="margin-top:6px;font-family:var(--mono);font-size:9px;color:var(--muted);letter-spacing:0.08em;display:flex;gap:10px;flex-wrap:wrap;align-items:center;">
        ${inc.source ? `<span>SOURCE: ${inc.source}</span>` : ''}
        <span>ACTOR: ${inc._actor||'Unattributed'}</span>
      </div>
      ${inc.pullNote ? `<div style="margin-top:8px;font-size:11px;color:var(--text-dim);font-style:italic;border-left:2px solid var(--accent2);padding-left:8px;">${inc.pullNote}</div>` : ''}
      <div style="margin-top:10px;display:flex;gap:8px;">
        <button class="btn-promote" onclick="promotePending('${inc.id}')">✓ Promote to Registry</button>
        <button class="btn-dismiss" onclick="dismissPending('${inc.id}')">✕ Dismiss</button>
      </div>
    </div>`;
  }).join('');

  const countEl = document.getElementById('pendingCount');
  if (countEl) countEl.textContent = live.length;
  const tabCount = document.getElementById('pendingTabCount');
  if (tabCount) tabCount.textContent = live.length > 0 ? live.length : '';
  const empty = document.getElementById('pendingEmptyState');
  if (empty) empty.classList.toggle('visible', live.length === 0);
}


export function promotePending(id) {
  const item = pendingSeed.find(p => p.id === id);
  if (!item) return;
  const { pending, foundDate, pullNote, ...clean } = item;
  clean.id = Date.now();
  enrichIncident(clean);
  incidents.unshift(clean);
  saveIncidents();
  markPendingActioned(id);
  renderPending();
  renderFeed();
  if (typeof mapRendered !== 'undefined') { setMapRendered(false); }
  if (typeof networkRendered !== 'undefined') { setNetworkRendered(false); }
}


export function dismissPending(id) {
  markPendingActioned(id);
  renderPending();
}

// ── ENRICHMENT: derive actor / narrative-target / geography for the Map & Network tabs ──
// Explicit fields set via the Log-Incident form (inc.actor, inc.targets) always win;
// otherwise these are inferred from the incident text so older/seed entries still work.
