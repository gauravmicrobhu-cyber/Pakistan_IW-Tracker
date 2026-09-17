import { incidents, annotations, getAnnotation, saveAnnotations, saveIncidents, setIncidents, setMapRendered, setNetworkRendered, incidentMatchesFilters } from '../state.js';
import { platColors, tierMeta, confidenceMeta, campaignDefs, tagClass, typeLabels } from '../data/lookups.js';
import { formatDate } from '../logic/dates.js';
import { escapeHtml } from '../logic/escapeHtml.js';
import { updateBackupBanner } from './backup.js';
import { showToast } from './misc.js';
import { updateStats } from './analytics.js';
import { callClaude } from '../ai.js';
import { SUBMISSION_ENDPOINT } from '../config.js';

export function toggleFlag(id, flagType) {
  const a = annotations[id] || {};
  a.flag = (a.flag === flagType) ? null : flagType;
  annotations[id] = a;
  saveAnnotations();
  renderFeed();
  updateBackupBanner();
}


export function toggleNoteBox(id) {
  const box = document.getElementById('notebox-' + id);
  if (box) box.style.display = (box.style.display === 'none' || !box.style.display) ? 'block' : 'none';
}


export function saveNote(id) {
  const text = document.getElementById('notetext-' + id).value.trim();
  const a = annotations[id] || {};
  a.note = text || null;
  annotations[id] = a;
  saveAnnotations();
  showToast('Note saved locally');
  renderFeed();
  updateBackupBanner();
}

// ── CITATION EXPORT ──

export function citeIncident(id, btnEl) {
  const inc = incidents.find(i => i.id === id);
  if (!inc) return;
  const d = inc.date ? new Date(inc.date + 'T00:00:00') : null;
  const dateStr = d ? d.toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' }) : 'n.d.';
  const accessed = new Date().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' });
  const citation = `${inc.source || 'Source unspecified'}. (${dateStr}). "${inc.title}." Documented in: PRISM Pakistan Information-Warfare Tracker. Policy Research Institute for Security, Intelligence & Modern Threats. Accessed ${accessed}.`;
  navigator.clipboard.writeText(citation).then(() => {
    showToast('Citation copied to clipboard');
  }).catch(() => {
    prompt('Copy this citation:', citation);
  });
}

// ── DEEP LINKS ──

export function copyDeepLink(id, btnEl) {
  const url = new URL(window.location.href);
  url.hash = '';
  url.search = '?incident=' + id;
  navigator.clipboard.writeText(url.toString()).then(() => {
    showToast('Link copied — opens directly to this incident');
  }).catch(() => {
    prompt('Copy this link:', url.toString());
  });
}


export function renderFeed() {
  const feed = document.getElementById('incidentFeed');
  const empty = document.getElementById('emptyState');
  let cards = '';
  let visible = 0;

  const sorted = [...incidents].sort((a,b) => new Date(b.date) - new Date(a.date));

  sorted.forEach(inc => {
    const show = incidentMatchesFilters(inc);
    if (show) visible++;

    const platKey = (inc.platform||'').toLowerCase().split('/')[0].trim();
    const platColor = platColors[platKey] || 'var(--text-dim)';
    const tier = tierMeta[inc._tier] || tierMeta.other;
    const conf = confidenceMeta[inc._confidence] || confidenceMeta.likely;
    const camp = campaignDefs[inc._campaign] || campaignDefs.ongoing;
    const ann = getAnnotation(inc.id);

    const safeTitle = escapeHtml(inc.title);
    const safeDetail = escapeHtml(inc.detail);
    const safePlatform = escapeHtml(inc.platform);
    const safeReach = escapeHtml(inc.reach);
    const safeSource = escapeHtml(inc.source);
    const safeActor = escapeHtml(inc._actor || 'Unattributed');
    // JS-string-literal-safe (for the single-quoted onclick arg), then HTML-attribute-safe on top —
    // entity-decoding happens before the browser parses the onclick attribute as JS, so this nests correctly.
    const actorJsArg = escapeHtml((inc._actor || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'"));

    cards += `<div class="incident-card sev-${inc.sev} ${show?'visible':''}" data-id="${inc.id}" id="incident-${inc.id}">
      <div class="card-top">
        <div class="card-meta">
          <span class="tag ${tagClass[inc.type]}">${typeLabels[inc.type]}</span>
          <span class="sev-badge sev-${inc.sev}">${inc.sev}</span>
          <span class="tier-badge" style="color:${tier.color};border-color:${tier.color}55;" title="${tier.label}">${tier.short}</span>
          <span class="tier-badge" style="color:${conf.color};border-color:${conf.color}55;" title="${conf.label}">${conf.icon} ${conf.short}</span>
          <span class="tier-badge" style="color:${camp.color};border-color:${camp.color}55;" title="${camp.label}">${camp.short}</span>
        </div>
        <div style="display:flex;align-items:center;gap:6px;">
          <button class="card-icon-btn ${ann.flag==='verified'?'active-verified':''}" onclick="toggleFlag(${inc.id},'verified')" title="Mark verified">✓</button>
          <button class="card-icon-btn ${ann.flag==='review'?'active-review':''}" onclick="toggleFlag(${inc.id},'review')" title="Flag for review">⚠</button>
          <button class="card-icon-btn ${ann.note?'active-note':''}" onclick="toggleNoteBox(${inc.id})" title="Add note">✎</button>
          <button class="card-icon-btn" onclick="citeIncident(${inc.id}, this)" title="Copy citation">❝</button>
          <button class="card-icon-btn" onclick="copyDeepLink(${inc.id}, this)" title="Copy link to this incident">🔗</button>
          <button onclick="deleteIncident(${inc.id})" style="background:none;border:none;color:var(--muted);cursor:pointer;font-size:16px;line-height:1;" title="Delete">×</button>
        </div>
      </div>
      <div class="card-title">${safeTitle}</div>
      <div class="card-body">${safeDetail}</div>
      <div class="card-footer">
        <span class="card-date">${formatDate(inc.date)}</span>
        <div class="card-platform">
          <div class="platform-dot" style="background:${platColor}"></div>
          <span class="platform-label">${safePlatform||'—'}</span>
        </div>
        ${inc.reach ? `<span class="card-reach">Reach: <span>${safeReach}</span></span>` : ''}
      </div>
      <div style="margin-top:6px;font-family:var(--mono);font-size:9px;color:var(--muted);letter-spacing:0.08em;display:flex;gap:10px;flex-wrap:wrap;align-items:center;">
        ${inc.source ? `<span>SOURCE: ${safeSource}</span>` : ''}
        <span>ACTOR: <span class="actor-link" onclick="openActorDossier('${actorJsArg}')">${safeActor}</span></span>
      </div>
      <div class="note-box" id="notebox-${inc.id}" style="display:${ann.note ? 'block' : 'none'};">
        <textarea class="note-textarea" id="notetext-${inc.id}" placeholder="Personal note (saved locally in your browser only)...">${ann.note||''}</textarea>
        <button class="btn-reset" style="margin-top:6px;" onclick="saveNote(${inc.id})">Save note</button>
      </div>
      <div style="margin-top:8px;display:flex;align-items:center;gap:8px;">
        <button class="btn-ai-inline" onclick="analyseCard(${inc.id}, this)">⬡ AI Analyse</button>
        ${inc.aiSummary ? `<span style="font-family:var(--mono);font-size:9px;color:var(--purple);">✓ AI assessed</span>` : ''}
      </div>
      <div class="ai-panel ${inc.aiSummary ? 'visible' : ''}" id="aipanel-${inc.id}">
        <div class="ai-panel-title">⬡ AI ASSESSMENT <span class="ai-spinner" id="spinner-${inc.id}"></span></div>
        ${inc.aiSummary ? renderAiPanel(inc) : '<div style="font-family:var(--mono);font-size:11px;color:var(--text-dim);">Click AI Analyse to assess this incident.</div>'}
      </div>
    </div>`;
  });

  feed.innerHTML = cards;
  document.getElementById('feedCount').textContent = visible;
  empty.classList.toggle('visible', visible === 0);
  updateStats();
}


// ── PUBLIC SUBMISSION PIPELINE ── the Log Incident form no longer writes straight into the
// local incidents array / localStorage (that only ever reached the submitter's own browser).
// It now POSTs to a Cloudflare Worker (SUBMISSION_ENDPOINT, see src/config.js), which verifies
// a Turnstile challenge + honeypot + IP rate-limit, then opens a GitHub Issue labeled
// `submission:pending`. Nothing is added to the local feed here — it isn't live until a
// maintainer approves the Issue on GitHub, which promotes it into src/data/communityIncidents.json
// via .github/workflows/promote-submission.yml.

export async function addIncident() {
  const title  = document.getElementById('f-title').value.trim();
  const detail = document.getElementById('f-detail').value.trim();
  if (!title) { alert('Please enter an incident title.'); return; }

  // Honeypot: real users never fill this hidden field in; a non-empty value is a strong bot
  // signal. Still sent through to the Worker (which silently no-ops on it) rather than
  // special-cased here, per the Worker's own honeypot handling.
  const honeypot = document.getElementById('f-website')?.value || '';

  const checkedTargets = Array.from(document.querySelectorAll('#f-targets input[type=checkbox]:checked')).map(c => c.value);

  const fields = {
    title,
    detail,
    type:     document.getElementById('f-type').value,
    sev:      document.getElementById('f-sev').value,
    platform: document.getElementById('f-platform').value.trim(),
    reach:    document.getElementById('f-reach').value.trim(),
    date:     document.getElementById('f-date').value || new Date().toISOString().slice(0,10),
    source:   document.getElementById('f-source').value.trim(),
    actor:    document.getElementById('f-actor').value.trim(),
    targets:  checkedTargets,
    website:  honeypot
  };

  let turnstileToken = '';
  try {
    if (typeof turnstile !== 'undefined' && window._turnstileWidgetId != null) {
      turnstileToken = turnstile.getResponse(window._turnstileWidgetId) || '';
    }
  } catch(e) { /* Turnstile not loaded/ready — handled by the empty-token check below */ }

  if (!turnstileToken) {
    showToast('Please complete the verification challenge before submitting.', 'var(--accent)');
    return;
  }
  fields['cf-turnstile-response'] = turnstileToken;

  const submitBtn = document.querySelector('#tab-log .btn-submit');
  if (submitBtn) submitBtn.disabled = true;

  try {
    const res = await fetch(SUBMISSION_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fields)
    });

    if (!res.ok) {
      if (res.status === 429) throw new Error('Too many submissions from this network — please try again in an hour.');
      if (res.status === 403) throw new Error('Verification challenge failed — please retry.');
      if (res.status === 400) throw new Error('Please fill in all required fields and try again.');
      throw new Error('Submission failed — please try again later.');
    }

    // Reset form — nothing is added to the local feed; it only appears once approved.
    ['f-title','f-detail','f-platform','f-reach','f-source','f-actor'].forEach(id => { document.getElementById(id).value = ''; });
    document.querySelectorAll('#f-targets input[type=checkbox]').forEach(c => c.checked = false);
    try {
      if (typeof turnstile !== 'undefined' && window._turnstileWidgetId != null) turnstile.reset(window._turnstileWidgetId);
    } catch(e) {}

    showToast('Submitted for review — visible once approved');
  } catch(e) {
    showToast(e.message || 'Submission failed — check your connection and try again.', 'var(--accent)');
    console.error(e);
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
}

// ── DELETE ──

export function deleteIncident(id) {
  if (!confirm('Remove this incident from the tracker?')) return;
  setIncidents(incidents.filter(i => i.id !== id));
  saveIncidents();
  renderFeed();
  setMapRendered(false);
  setNetworkRendered(false);
  updateBackupBanner();
}

// ── FILTERS ──

export function renderAiPanel(inc) {
  if (!inc.aiSummary) return '';
  const tags = (inc.aiTags||[]).map(t => `<span class="ai-tag">${t}</span>`).join('');
  return `
    <div class="ai-grid">
      <div class="ai-field">
        <div class="ai-field-label">Vector Type</div>
        <div class="ai-field-val">${inc.aiType||'—'}</div>
      </div>
      <div class="ai-field">
        <div class="ai-field-label">Severity</div>
        <div class="ai-field-val">${inc.aiSev||'—'}</div>
      </div>
      <div class="ai-field">
        <div class="ai-field-label">Confidence</div>
        <div class="ai-field-val ai-confidence">${inc.aiConf||'—'}</div>
      </div>
      <div class="ai-field">
        <div class="ai-field-label">Primary Actor</div>
        <div class="ai-field-val">${inc.aiActor||'—'}</div>
      </div>
      <div class="ai-field" style="grid-column:1/-1">
        <div class="ai-field-label">AI Summary</div>
        <div class="ai-field-val full">${inc.aiSummary}</div>
      </div>
      <div class="ai-field" style="grid-column:1/-1">
        <div class="ai-field-label">Strategic Objective</div>
        <div class="ai-field-val full">${inc.aiObjective||'—'}</div>
      </div>
      <div class="ai-field" style="grid-column:1/-1">
        <div class="ai-field-label">OSINT Tags</div>
        <div class="ai-tags">${tags}</div>
      </div>
    </div>`;
}


export async function analyseCard(id, btn) {
  const inc = incidents.find(i => i.id === id);
  if (!inc) return;

  const panel   = document.getElementById(`aipanel-${id}`);
  const spinner = document.getElementById(`spinner-${id}`);
  panel.classList.add('visible');
  spinner.classList.add('active');
  btn.disabled = true;
  panel.querySelector('div').innerHTML = '<div style="font-family:var(--mono);font-size:11px;color:var(--text-dim);display:flex;align-items:center;gap:8px;"><span class="ai-spinner active" style="display:inline-block;"></span> Analysing incident...</div>';

  const prompt = `You are an expert analyst at PRISM specialising in Pakistan information warfare operations against India.

Analyse this tracked incident:
Title: ${inc.title}
Details: ${inc.detail}
Current classification: ${inc.type} / ${inc.sev}
Platform: ${inc.platform||'unknown'}
Date: ${inc.date}
Source: ${inc.source||'unattributed'}

Respond ONLY with JSON, no preamble:
{
  "type": "one of: social | media | psyops | cyber | diplo | proxy",
  "severity": "one of: critical | high | medium | low",
  "confidence": "percentage",
  "actor": "specific actor attribution",
  "summary": "2-3 sentence analytical assessment including doctrinal context",
  "objective": "strategic objective this operation serves within Pakistan's IW doctrine",
  "tags": ["5-8 OSINT tags"]
}`;

  try {
    const raw = await callClaude(prompt);
    const result = JSON.parse(raw);

    // Store in incident
    inc.aiType      = result.type;
    inc.aiSev       = result.severity;
    inc.aiConf      = result.confidence;
    inc.aiActor     = result.actor;
    inc.aiSummary   = result.summary;
    inc.aiObjective = result.objective;
    inc.aiTags      = result.tags || [];
    saveIncidents();

    panel.innerHTML = `<div class="ai-panel-title">⬡ AI ASSESSMENT <span class="ai-spinner" id="spinner-${id}"></span></div>${renderAiPanel(inc)}`;
  } catch(e) {
    panel.innerHTML = '<div style="font-family:var(--mono);font-size:11px;color:var(--accent);">Analysis failed. Please retry.</div>';
    console.error(e);
  }

  btn.disabled = false;
}

// ── AI INTELLIGENCE BRIEF ──
