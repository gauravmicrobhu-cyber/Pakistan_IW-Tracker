import { incidents, setSearchTerm } from '../state.js';
import { geoDefs } from '../data/lookups.js';
import { parseReachValue, formatCompactNumber } from '../logic/reach.js';
import { escapeHtml } from '../logic/escapeHtml.js';
import { selectGeo } from './map.js';
import { renderFeed } from './feed.js';
import { syncURLState } from './filters.js';

// ── TOP-5 LEADERBOARDS ── ranked breakdowns across four axes the rest of the Analytics tab
// doesn't already rank (Vector Distribution, Platform Distribution and Narrative Targets show
// raw counts per fixed category, not a sorted top-N). Pure aggregation over the same enriched
// incident fields the rest of the app already computes — no new data model.

// Same free-text-into-onclick escaping feed.js uses for actor names: backslash- and quote-escape
// for the JS string literal first, then HTML-escape the result (so a literal `"` in the label
// can't break out of the double-quoted onclick="..." attribute either) — reused here since
// region/actor/platform/source labels are equally free text.
function jsArg(s) { return escapeHtml((s || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'")); }

export function focusRegionFromLeaderboard(key) {
  const btn = document.querySelector('.tab-btn[data-tab="map"]');
  if (btn) btn.click();
  setTimeout(() => selectGeo(key), 80);
}

export function searchFromLeaderboard(term) {
  const btn = document.querySelector('.tab-btn[data-tab="feed"]');
  if (btn) btn.click();
  const box = document.getElementById('searchBox');
  if (box) box.value = term;
  setSearchTerm(term.toLowerCase().trim());
  renderFeed();
  syncURLState();
}

function topEntries(counter, limit = 5) {
  return Object.entries(counter).sort((a, b) => b[1].value - a[1].value).slice(0, limit);
}

function computeTopRegions() {
  const counter = {};
  incidents.forEach(inc => {
    (inc._geo || []).forEach(key => {
      if (key === 'pakistan' || !geoDefs[key]) return;
      counter[key] = counter[key] || { label: geoDefs[key].label, value: 0 };
      counter[key].value++;
    });
  });
  return topEntries(counter);
}

function computeTopActors() {
  const counter = {};
  incidents.forEach(inc => {
    const actor = (inc._actor || '').trim();
    if (!actor || actor === 'Unattributed / crowd-sourced') return;
    counter[actor] = counter[actor] || { label: actor, value: 0, confirmed: 0 };
    counter[actor].value++;
    if (inc._confidence === 'confirmed') counter[actor].confirmed++;
  });
  return topEntries(counter);
}

function computeTopPlatforms() {
  const counter = {};
  incidents.forEach(inc => {
    if (!inc.platform) return;
    const reach = parseReachValue(inc.reach);
    const tokens = [...new Set(inc.platform.split(/[,/&]|\band\b/i).map(t => t.trim()).filter(Boolean))];
    tokens.forEach(tok => {
      counter[tok] = counter[tok] || { label: tok, value: 0, count: 0 };
      counter[tok].count++;
      if (reach !== null) counter[tok].value += reach;
    });
  });
  return topEntries(counter);
}

function computeTopSources() {
  const counter = {};
  incidents.forEach(inc => {
    if (!inc.source) return;
    const tokens = [...new Set(inc.source.split('/').map(t => t.trim()).filter(Boolean))];
    tokens.forEach(tok => {
      counter[tok] = counter[tok] || { label: tok, value: 0 };
      counter[tok].value++;
    });
  });
  return topEntries(counter);
}

function renderLbCard(hostId, rows, { onclick, format, extra } = {}) {
  const host = document.getElementById(hostId);
  if (!host) return;
  if (!rows.length) { host.innerHTML = `<div class="lb-empty">No data yet.</div>`; return; }
  const max = rows[0][1].value || 1;
  host.innerHTML = rows.map(([key, r], i) => `
    <div class="lb-row">
      <span class="lb-rank">${i + 1}</span>
      <span class="lb-name" ${onclick ? `onclick="${onclick(key)}"` : ''} title="${escapeHtml(r.label)}">${escapeHtml(r.label)}</span>
      <span class="lb-bar-wrap"><span class="lb-bar" style="width:${Math.round((r.value / max) * 100)}%"></span></span>
      <span class="lb-value"><span>${format ? format(r.value) : r.value}</span>${extra ? `<span class="lb-extra">${extra(r)}</span>` : ''}</span>
    </div>
  `).join('');
}

export function renderLeaderboards() {
  renderLbCard('lbRegions', computeTopRegions(), {
    onclick: key => `focusRegionFromLeaderboard('${jsArg(key)}')`
  });
  renderLbCard('lbActors', computeTopActors(), {
    onclick: key => `openActorDossier('${jsArg(key)}')`,
    extra: r => `${r.confirmed} confirmed`
  });
  renderLbCard('lbPlatforms', computeTopPlatforms(), {
    onclick: key => `searchFromLeaderboard('${jsArg(key)}')`,
    format: v => v > 0 ? formatCompactNumber(v) : '—',
    extra: r => `${r.count} inc.`
  });
  renderLbCard('lbSources', computeTopSources(), {
    onclick: key => `searchFromLeaderboard('${jsArg(key)}')`
  });
}
