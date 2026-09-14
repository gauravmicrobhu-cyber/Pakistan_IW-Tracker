import { incidents } from '../state.js';
import { changelogData } from '../data/changelogData.js';
import { cmdPaletteTabs } from '../data/cmdPaletteTabs.js';
import { formatDate } from '../logic/dates.js';
import { escapeHtml } from '../logic/escapeHtml.js';
import { openActorDossier } from './actorDossier.js';
import { jumpToIncident } from './map.js';

export function openChangelog() {
  const body = document.getElementById('changelogBody');
  body.innerHTML = `
    <div class="live-note" style="margin-bottom:1rem;">This is a real record of how this dataset has changed, including corrections and removals — not just a list of additions. Version numbers correspond to the tracker's internal seed-data version.</div>
    ${changelogData.map(c => `
      <div class="changelog-entry">
        <div class="changelog-version">v${c.v}</div>
        <div class="changelog-summary">${c.tags.map(t => `<span class="changelog-tag ${t}">${t}</span>`).join('')}${c.summary}</div>
      </div>
    `).join('')}
  `;
  document.getElementById('changelogOverlay').classList.add('show');
}

export function closeChangelog() {
  document.getElementById('changelogOverlay').classList.remove('show');
}

// ── METHODOLOGY & LIMITATIONS ──

export function openMethodology() {
  const respCount = incidents.filter(i => i.type === 'response').length;
  document.getElementById('methodologyBody').innerHTML = `
    <div class="net-detail-list-title" style="margin-top:0;">How this dataset was built</div>
    <p style="font-size:12px;color:var(--text);line-height:1.7;">This is an <strong>opportunistically-sampled research tracker</strong>, built incident-by-incident across research sessions as sources were reviewed — not a systematic pull from a defined universe of sources on a fixed schedule. Compare this to a systematic effort like EuRepoC's Global Dataset of Cyber Incidents, which defines its source set upfront (220+ outlets, 600+ Twitter accounts, scanned daily) and codes every incident against a fixed 60-variable codebook with documented inter-rater reliability. This tracker has neither of those things. Treat the ${incidents.length} incidents here as "things that were found and verified," not "everything that happened."</p>

    <div class="net-detail-list-title">Classification process</div>
    <p style="font-size:12px;color:var(--text);line-height:1.7;">Every incident here was researched and classified by a single reviewer (this tool's assistant), in a single pass, with no second reviewer or inter-rater reliability check. Vector type, actor, target audience, and geography are assigned via a mix of explicit tagging (where known) and automated keyword-matching (where inferred) — see "Source Tier" and "Confidence" badges on each card:</p>
    <ul style="font-size:12px;color:var(--text);line-height:1.8;padding-left:20px;">
      <li><strong>Source Tier</strong> (GOV/ACAD/RESEARCH/PRESS/SELF) — how credible the <em>source</em> is, derived from keyword-matching the source string.</li>
      <li><strong>Confidence</strong> (Confirmed/Likely/Alleged/Disputed) — how confident the specific <em>attribution</em> is, derived from hedging language actually written into each entry's detail text during verification. These two are deliberately kept separate: a government source can still carry a low-confidence attribution.</li>
    </ul>

    <div class="net-detail-list-title">Vector taxonomy</div>
    <p style="font-size:12px;color:var(--text);line-height:1.7;">Six vectors describe Pakistan-attributed activity: Social Media IO, Fake Media, PsyOps, Cyber, Diplomatic, Proxy Network. A seventh, <strong>Response</strong> (${respCount} incidents), was added separately for Indian institutional countermeasures (platform-blocking orders, CERT-In advisories, fact-check debunking) — these are India's actions, not Pakistan's, and were previously force-fit into the attack-vector taxonomy, which misrepresented them. Response-type incidents are intentionally excluded from the Regional Map's origin-arc visualisation, since that view specifically models Pakistan→India flow and an Indian countermeasure has no such origin.</p>

    <div class="net-detail-list-title">Geo/cyber-site tagging</div>
    <p style="font-size:12px;color:var(--text);line-height:1.7;">Regional and cyber-target-site tags are assigned by keyword-matching each incident's own text against a fixed list of regions and institutions, with a manual override available per incident (used where the automated match would be wrong). This is fast but not infallible — a periodic manual audit pass is the intended safeguard, not a substitute for per-incident verification by a second reviewer.</p>

    <div class="net-detail-list-title">Known limitations, honestly stated</div>
    <ul style="font-size:12px;color:var(--text);line-height:1.8;padding-left:20px;">
      <li>Scope is strictly Pakistan → India. Reverse-direction incidents are deliberately excluded, even when directly relevant context (see Changelog).</li>
      <li>Personal annotations, notes, and self-logged incidents live only in this browser's local storage — see the Backup banner in the Log Incident tab.</li>
      <li>The Regional Map, Live Signals, and News Monitor tabs depend on external CDNs and APIs outside this tool's control — see the Status panel.</li>
      <li>This tool has not been extensively tested on mobile/small-screen devices; the dashboard is designed primarily for desktop use.</li>
      <li>"Combined Reach" and similar aggregate stats sum whatever numbers are stated in the underlying sources — they are not independently audited, deduplicated audience figures.</li>
    </ul>
  `;
  document.getElementById('methodologyOverlay').classList.add('show');
}

export function closeMethodology() {
  document.getElementById('methodologyOverlay').classList.remove('show');
}

// ── SYSTEM STATUS ── visibility into external dependencies, so a silent failure doesn't
// look identical to "nothing happening." Checked live when the panel opens.

export function openSystemStatus() {
  const checks = [
    { name: 'Leaflet (Regional Map)', ok: typeof L !== 'undefined', note: 'CDN: cdnjs.cloudflare.com/leaflet' },
    { name: 'D3.js (Network graph, Connections map)', ok: typeof d3 !== 'undefined', note: 'CDN: cdnjs.cloudflare.com/d3' },
    { name: 'Chart.js (Analytics charts)', ok: typeof Chart !== 'undefined', note: 'CDN: cdnjs.cloudflare.com/Chart.js' },
    { name: 'X/Twitter embed widget (Live Signals)', ok: typeof twttr !== 'undefined', note: 'CDN: platform.twitter.com/widgets.js — loads asynchronously, may show "unavailable" briefly on slow connections' },
    { name: 'GDELT public API (News Monitor)', ok: null, note: 'Not proactively checked here to avoid an unnecessary network call — open the News Monitor tab directly to test it live' },
    { name: 'Anthropic API (AI Analyse / Brief)', ok: null, note: 'Checked on first use — see the AI Assessment panel on any incident card' }
  ];
  document.getElementById('systemStatusBody').innerHTML = `
    <div class="live-note" style="margin-bottom:1rem;">This tracker depends on several external CDNs and APIs it doesn't control. If a tab looks broken or empty, check here first — it may be an outside dependency, not the tracker itself.</div>
    ${checks.map(c => `
      <div class="changelog-entry" style="display:flex;align-items:center;justify-content:space-between;gap:12px;">
        <div>
          <div style="font-size:12px;color:var(--text-bright);">${c.name}</div>
          <div style="font-family:var(--mono);font-size:9px;color:var(--text-dim);margin-top:2px;">${c.note}</div>
        </div>
        <div style="font-family:var(--mono);font-size:10px;flex-shrink:0;color:${c.ok===true?'#00c853':c.ok===false?'#ff2d6a':'var(--text-dim)'};">
          ${c.ok===true ? '● LOADED' : c.ok===false ? '● NOT LOADED' : '○ CHECK ON USE'}
        </div>
      </div>
    `).join('')}
  `;
  document.getElementById('systemStatusOverlay').classList.add('show');
}

export function closeSystemStatus() {
  document.getElementById('systemStatusOverlay').classList.remove('show');
}

// ── BACKUP / RESTORE ── annotations and user-logged incidents live only in this browser's
// localStorage. This gives a real way to get them out and back in, plus a visible nudge.

export let cmdPaletteActiveIdx = -1;
export function setCmdPaletteActiveIdx(v) { cmdPaletteActiveIdx = v; }


export function openCmdPalette() {
  document.getElementById('cmdPaletteOverlay').classList.add('show');
  const input = document.getElementById('cmdPaletteInput');
  input.value = '';
  runCmdPaletteSearch('');
  setTimeout(() => input.focus(), 30);
}

export function closeCmdPalette() {
  document.getElementById('cmdPaletteOverlay').classList.remove('show');
}


export function runCmdPaletteSearch(q) {
  const query = q.trim().toLowerCase();
  const results = document.getElementById('cmdPaletteResults');
  cmdPaletteActiveIdx = -1;
  let items = [];

  if (!query) {
    items = cmdPaletteTabs.map(t => ({ type: 'tab', label: `${t.icon} ${t.label}`, action: () => { closeCmdPalette(); document.querySelector(`.tab-btn[data-tab="${t.tab}"]`).click(); } }));
  } else {
    cmdPaletteTabs.filter(t => t.label.toLowerCase().includes(query)).forEach(t => {
      items.push({ type: 'tab', label: `${t.icon} ${t.label}`, action: () => { closeCmdPalette(); document.querySelector(`.tab-btn[data-tab="${t.tab}"]`).click(); } });
    });

    const actorSet = [...new Set(incidents.map(i => i._actor).filter(Boolean))];
    actorSet.filter(a => a.toLowerCase().includes(query)).slice(0,5).forEach(a => {
      const count = incidents.filter(i => i._actor === a).length;
      items.push({ type: 'actor', label: a, meta: `${count} incidents`, action: () => { closeCmdPalette(); openActorDossier(a); } });
    });

    incidents.filter(i => i.title.toLowerCase().includes(query) || (i.detail||'').toLowerCase().includes(query))
      .slice(0,15).forEach(i => {
        items.push({ type: 'incident', label: i.title, meta: formatDate(i.date), action: () => { closeCmdPalette(); jumpToIncident(i.id); } });
      });
  }

  if (!items.length) {
    results.innerHTML = '<div class="map-empty" style="padding:18px;">No matches.</div>';
    return;
  }

  results.innerHTML = items.map((it, idx) =>
    `<div class="cmd-result-row" data-idx="${idx}"><span class="cmd-result-type">${it.type}</span><span class="cmd-result-title">${escapeHtml(it.label)}</span>${it.meta ? `<span class="cmd-result-meta">${escapeHtml(it.meta)}</span>` : ''}</div>`
  ).join('');

  Array.from(results.children).forEach((row, idx) => {
    row.addEventListener('click', () => items[idx].action());
  });

  window._cmdPaletteItems = items;
}

