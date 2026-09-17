import { incidents, mapRendered, networkRendered, connectionsRendered, liveIncidentMapRendered } from '../state.js';
import { mitreAttckData, campaignDefs, vectorChartColors, vectorChartLabels, typeLabels, confidenceMeta, tierMeta } from '../data/lookups.js';
import { parseReachValue, formatCompactNumber } from '../logic/reach.js';
import { computeNationalPosture, statusForPosture } from '../logic/posture.js';
import { renderCalendarHeatmap } from './timeline.js';
import { syncFilterHighlights, filterByVector } from './filters.js';
import { renderMap } from './map.js';
import { renderNetwork } from './network.js';
import { renderConnections } from './connections.js';
import { renderLeaderboards, searchFromLeaderboard } from './leaderboards.js';
import { renderLiveIncidentTable, renderLiveIncidentMap } from './liveIncidents.js';

export function renderMitreTTPSection(actorName) {
  const data = mitreAttckData[actorName];
  if (!data) return '';
  return `
    <div class="net-detail-list-title" style="display:flex;align-items:center;gap:8px;">
      ⬡ MITRE ATT&CK Profile ${data.mitreId ? `<a href="${data.url}" target="_blank" style="color:var(--teal);font-family:var(--mono);font-size:9px;">${data.mitreId} ↗</a>` : ''}
    </div>
    <div style="font-family:var(--mono);font-size:9px;color:var(--text-dim);margin-bottom:8px;">Aliases: ${data.aliases.join(', ')}</div>
    <div style="font-family:var(--mono);font-size:9px;color:var(--text-dim);margin-bottom:4px;text-transform:uppercase;">Malware / Tools</div>
    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px;">
      ${data.malware.map(m => `<a href="${m.url}" target="_blank" class="pk-badge" style="text-decoration:none;">${m.name}</a>`).join('')}
    </div>
    <div style="font-family:var(--mono);font-size:9px;color:var(--text-dim);margin-bottom:4px;text-transform:uppercase;">Techniques (${data.techniques.length})</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:4px;margin-bottom:4px;">
      ${data.techniques.map(([id,name]) => `<a href="https://attack.mitre.org/techniques/${id.replace('.','/')}/" target="_blank" style="text-decoration:none;color:var(--text-dim);font-size:10px;border:1px solid var(--border);border-radius:3px;padding:4px 7px;display:block;" title="${name}"><span style="color:var(--teal);font-family:var(--mono);">${id}</span> ${name}</a>`).join('')}
    </div>
    <div style="font-family:var(--mono);font-size:8px;color:var(--muted);margin-top:6px;">© The MITRE Corporation. Data from the official ATT&CK STIX dataset.</div>
  `;
}

// ── CHANGELOG ── a real, honest record of dataset changes, including corrections and removals,
// not just additions. Reconstructed from the actual work done on this dataset.

export function updateReachStat() {
  let total = 0, counted = 0;
  incidents.forEach(inc => {
    const v = parseReachValue(inc.reach);
    if (v !== null) { total += v; counted++; }
  });
  const el = document.getElementById('stat-reach');
  const note = document.getElementById('stat-reach-note');
  const wrap = document.getElementById('stat-reach-wrap');
  if (el) el.textContent = total > 0 ? formatCompactNumber(total) + '+' : '\u2014';
  if (note) note.textContent = `(est., ${counted}/${incidents.length} quantified)`;
  if (wrap) wrap.title = 'Sum of the largest reported views/subscribers/tweets/accounts figure per incident, where a number is stated. This is total views and mentions, not unique people \u2014 the same viewer is counted every time they watch another clip, and audiences overlap heavily across incidents. Not a reach or unique-audience estimate. Incidents with no stated figure are excluded rather than guessed at.';
}

// ── IW INTENSITY INDEX ── a composite per-campaign score, in the spirit of a stress index:
// normalized volume + confirmed-attribution share + source-authority share + severity share,
// with a floor rule so a campaign that's gone quiet but has verified incidents on record
// doesn't silently drop out of view just because recent volume is low.

export function computeCampaignIndex() {
  const keys = Object.keys(campaignDefs);
  const byCampaign = {};
  keys.forEach(k => { byCampaign[k] = incidents.filter(i => i._campaign === k); });
  const maxVol = Math.max(...keys.map(k => byCampaign[k].length), 1);

  return keys.map(key => {
    const list = byCampaign[key];
    const vol = list.length;
    const pct = (n) => vol ? Math.round((n / vol) * 100) : 0;
    const confirmedCount = list.filter(i => i._confidence === 'confirmed').length;
    const authoritativeCount = list.filter(i => ['gov','academic','thinktank'].includes(i._tier)).length;
    const criticalCount = list.filter(i => i.sev === 'critical').length;

    const volScore = Math.round((vol / maxVol) * 100);
    const confirmedScore = pct(confirmedCount);
    const authorityScore = pct(authoritativeCount);
    const severityScore = pct(criticalCount);

    let composite = Math.round(0.35*volScore + 0.25*confirmedScore + 0.20*authorityScore + 0.20*severityScore);
    const floorApplied = confirmedCount >= 1 && composite < 40;
    if (floorApplied) composite = 40;
    composite = Math.max(0, Math.min(100, composite));

    return { key, def: campaignDefs[key], vol, confirmedCount, authoritativeCount, criticalCount, composite, floorApplied };
  }).sort((a,b) => b.composite - a.composite);
}


export function renderCampaignIndex() {
  const host = document.getElementById('campaignIndexHost');
  if (!host) return;
  const rows = computeCampaignIndex();
  host.innerHTML = rows.map(r => `
    <div onclick="setCampaignFilter('${r.key}'); document.querySelector('.tab-btn[data-tab=\\'feed\\']').click();"
         style="cursor:pointer;border:1px solid ${r.def.color}40;border-radius:8px;padding:14px;background:linear-gradient(180deg, ${r.def.color}14, transparent);transition:border-color .15s;"
         onmouseover="this.style.borderColor='${r.def.color}90'" onmouseout="this.style.borderColor='${r.def.color}40'">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
        <div style="font-family:var(--mono);font-size:10px;letter-spacing:.08em;color:${r.def.color};text-transform:uppercase;">${r.def.short}${r.floorApplied ? ' ⚑' : ''}</div>
        <div style="font-family:var(--mono);font-size:22px;font-weight:700;color:${r.def.color};line-height:1;">${r.composite}</div>
      </div>
      <div style="font-size:12px;color:var(--text-bright);margin-top:4px;font-weight:600;">${r.def.label}</div>
      <div style="font-family:var(--mono);font-size:9px;color:var(--muted);margin-top:8px;display:flex;gap:10px;flex-wrap:wrap;">
        <span>${r.vol} incident${r.vol===1?'':'s'}</span>
        <span>${r.confirmedCount} confirmed</span>
        <span>${r.authoritativeCount} authoritative-source</span>
      </div>
    </div>`).join('');
}

// ── NATIONAL IW POSTURE INDEX ── a single top-line aggregate across all campaigns,
// in the spirit of CONTAINMENT's composite Global Status: four toggleable factors,
// each 0-100, combined into one score. Reuses computeCampaignIndex() rather than
// re-deriving campaign intensity from scratch.

export let postureFactorState = { intensity: true, recency: true, severity: true, response: true };


export function renderNationalPosture() {
  const scoreEl = document.getElementById('postureScore');
  if (!scoreEl) return; // widget only lives on the Analytics tab
  const { factors, composite } = computeNationalPosture();
  const status = statusForPosture(composite);

  scoreEl.textContent = composite;
  const statusEl = document.getElementById('postureStatus');
  statusEl.textContent = status.label;
  statusEl.className = 'posture-status ' + status.cls;

  const track = document.getElementById('postureBarTrack');
  const activeFactors = factors.filter(f => postureFactorState[f.id]);
  const sum = activeFactors.reduce((s, f) => s + f.val, 0) || 1;
  track.innerHTML = activeFactors.map(f =>
    `<div class="posture-bar-seg" style="width:${(f.val / sum) * 100}%;background:${f.color}"></div>`
  ).join('');

  const host = document.getElementById('postureFactors');
  host.innerHTML = factors.map(f => `
    <button class="posture-factor ${postureFactorState[f.id] ? 'on' : 'off'}"
            style="color:${f.color}" onclick="togglePostureFactor('${f.id}')">
      <span class="posture-factor-name">${f.label}</span>
      <span class="posture-factor-val">${f.val}</span>
    </button>
  `).join('');
}


export function togglePostureFactor(id) {
  postureFactorState[id] = !postureFactorState[id];
  renderNationalPosture();
}


export function updateStats() {
  renderCalendarHeatmap();
  renderCampaignIndex();
  renderNationalPosture();
  const total = incidents.length;
  const critical = incidents.filter(i => i.sev === 'critical').length;
  const now = new Date();
  const thisMonth = incidents.filter(i => {
    const d = new Date(i.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  animateCount('stat-total', total);
  animateCount('stat-critical', critical);
  animateCount('stat-this-month', thisMonth);
  updateReachStat();

  // Vector counts + threat bars (now driven by real data, not hardcoded)
  const types = ['social','media','psyops','cyber','diplo','proxy'];
  const vectorCounts = {};
  const maxVec = Math.max(...types.map(t => incidents.filter(i => i.type === t).length), 1);
  types.forEach(t => {
    const c = incidents.filter(i => i.type === t).length;
    vectorCounts[t] = c;
    const el = document.getElementById('vc-'+t);
    if (el) el.textContent = c;
    const tp = document.getElementById('tp-'+t);
    if (tp) tp.textContent = c;
    const tb = document.getElementById('tb-'+t);
    if (tb) tb.style.width = Math.round((c/maxVec)*100) + '%';
  });
  syncFilterHighlights();

  // Platform breakdown
  const platMap = { x:0, w:0, yt:0, tt:0 };
  incidents.forEach(i => {
    const p = (i.platform||'').toLowerCase();
    if (p.includes('twitter') || p.includes('/x') || p.startsWith('x')) platMap.x++;
    if (p.includes('whatsapp')) platMap.w++;
    if (p.includes('youtube')) platMap.yt++;
    if (p.includes('tiktok')) platMap.tt++;
  });
  const pMax = Math.max(...Object.values(platMap), 1);
  Object.entries(platMap).forEach(([k,v]) => {
    const pct = Math.round((v/pMax)*100);
    const bar = document.getElementById('pb-'+k);
    const cnt = document.getElementById('pc-'+k);
    if (bar) bar.style.width = pct+'%';
    if (cnt) cnt.textContent = v;
  });

  // Narrative target breakdown (was previously static/dead — now driven by real data)
  const targetCounts = { kashmir:0, muslim:0, army:0, goi:0, west:0, sikh:0 };
  incidents.forEach(i => {
    (i._targets || []).forEach(t => { if (targetCounts.hasOwnProperty(t)) targetCounts[t]++; });
  });
  Object.entries(targetCounts).forEach(([k,v]) => {
    const el = document.getElementById('tgt-'+k);
    if (el) el.textContent = v;
  });

  updateVectorChart(vectorCounts);
  updateTimelineChart();
  updateVectorTimelineChart();
  updatePlatformTimelineChart();
  updatePlatformPieChart();
  updateConfidencePieChart();
  updateTierPieChart();
  updateVectorConfirmationChart();
  renderLeaderboards();
  renderLiveIncidentTable();

  if (mapRendered) renderMap();
  if (networkRendered) renderNetwork();
  if (connectionsRendered) renderConnections();
  if (liveIncidentMapRendered) renderLiveIncidentMap();
}

// ── INTERACTIVE CHARTS ──

export let vectorChartInstance = null;

export function updateVectorChart(counts) {
  const canvas = document.getElementById('vectorChart');
  if (!canvas || typeof Chart === 'undefined') return;
  const types = Object.keys(counts);
  const data = types.map(t => counts[t]);
  const colors = types.map(t => vectorChartColors[t]);
  const labels = types.map(t => vectorChartLabels[t]);

  if (vectorChartInstance) {
    vectorChartInstance.data.datasets[0].data = data;
    vectorChartInstance.update();
    return;
  }
  vectorChartInstance = new Chart(canvas.getContext('2d'), {
    type: 'doughnut',
    data: { labels, datasets: [{ data, backgroundColor: colors, borderColor: '#0e1220', borderWidth: 2, hoverOffset: 10 }] },
    options: {
      responsive: true, maintainAspectRatio: false,
      cutout: '62%',
      plugins: {
        legend: { position: 'bottom', labels: { color: '#8b96ab', font: { family: 'IBM Plex Mono', size: 9 }, boxWidth: 8, padding: 8 } },
        tooltip: { backgroundColor: '#161c30', borderColor: '#2a3350', borderWidth: 1, titleFont:{family:'IBM Plex Mono'}, bodyFont:{family:'IBM Plex Mono'} }
      },
      onClick: (evt, elements) => {
        if (elements.length > 0) {
          const idx = elements[0].index;
          filterByVector(types[idx]);
        }
      },
      onHover: (evt, elements) => { evt.native.target.style.cursor = elements.length ? 'pointer' : 'default'; }
    }
  });
}


export let timelineChartInstance = null;

export function updateTimelineChart() {
  const canvas = document.getElementById('timelineChart');
  if (!canvas || typeof Chart === 'undefined') return;

  // Group incidents by year-month
  const counts = {};
  incidents.forEach(i => {
    if (!i.date) return;
    const key = i.date.slice(0,7); // YYYY-MM
    counts[key] = (counts[key]||0) + 1;
  });
  const months = Object.keys(counts).sort();
  const data = months.map(m => counts[m]);
  const labels = months.map(m => {
    const [y,mo] = m.split('-');
    return new Date(y, mo-1, 1).toLocaleDateString('en-US', { month:'short', year:'2-digit' });
  });

  if (timelineChartInstance) {
    timelineChartInstance.data.labels = labels;
    timelineChartInstance.data.datasets[0].data = data;
    timelineChartInstance.update();
    return;
  }
  timelineChartInstance = new Chart(canvas.getContext('2d'), {
    type: 'bar',
    data: { labels, datasets: [{
      data,
      backgroundColor: 'rgba(0,245,212,0.55)',
      hoverBackgroundColor: '#00f5d4',
      borderRadius: 3,
      barThickness: 10
    }]},
    options: {
      responsive: true, maintainAspectRatio: false,
      scales: {
        x: { ticks: { color: '#8b96ab', font: { family:'IBM Plex Mono', size: 8 } }, grid: { display:false } },
        y: { ticks: { color: '#8b96ab', font: { family:'IBM Plex Mono', size: 8 }, precision:0 }, grid: { color: '#2a3350' } }
      },
      plugins: {
        legend: { display: false },
        tooltip: { backgroundColor: '#161c30', borderColor: '#2a3350', borderWidth: 1, titleFont:{family:'IBM Plex Mono'}, bodyFont:{family:'IBM Plex Mono'} }
      }
    }
  });
}

// ── MULTI-SERIES TIME-SERIES CHARTS ── same year-month bucketing as updateTimelineChart()
// above, but split into one line per category instead of a single aggregate total — surfaces
// which vector/platform is driving a given month's volume, not just that volume moved.

function monthLabel(m) {
  const [y, mo] = m.split('-');
  return new Date(y, mo - 1, 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

const LINE_CHART_BASE_OPTIONS = {
  responsive: true, maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  scales: {
    x: { ticks: { color: '#8b96ab', font: { family: 'IBM Plex Mono', size: 8 } }, grid: { display: false } },
    y: { ticks: { color: '#8b96ab', font: { family: 'IBM Plex Mono', size: 8 }, precision: 0 }, grid: { color: '#2a3350' } }
  },
  plugins: {
    legend: { position: 'bottom', labels: { color: '#8b96ab', font: { family: 'IBM Plex Mono', size: 9 }, boxWidth: 8, padding: 8 } },
    tooltip: { backgroundColor: '#161c30', borderColor: '#2a3350', borderWidth: 1, titleFont: { family: 'IBM Plex Mono' }, bodyFont: { family: 'IBM Plex Mono' }, mode: 'index', intersect: false }
  }
};

function lineDataset(label, data, color) {
  return { label, data, borderColor: color, backgroundColor: color + '33', tension: 0.3, pointRadius: 2, pointHoverRadius: 4, borderWidth: 1.75, fill: false };
}

export let vectorTimelineChartInstance = null;

const VECTOR_TIMELINE_TYPES = ['social', 'media', 'psyops', 'cyber', 'diplo', 'proxy'];

export function updateVectorTimelineChart() {
  const canvas = document.getElementById('vectorTimelineChart');
  if (!canvas || typeof Chart === 'undefined') return;

  const counts = {};
  VECTOR_TIMELINE_TYPES.forEach(t => { counts[t] = {}; });
  const monthsSet = new Set();
  incidents.forEach(i => {
    if (!i.date) return;
    const m = i.date.slice(0, 7);
    monthsSet.add(m);
    if (counts[i.type]) counts[i.type][m] = (counts[i.type][m] || 0) + 1;
  });
  const months = [...monthsSet].sort();
  const labels = months.map(monthLabel);
  const datasets = VECTOR_TIMELINE_TYPES.map(t =>
    lineDataset(vectorChartLabels[t], months.map(m => counts[t][m] || 0), vectorChartColors[t])
  );

  if (vectorTimelineChartInstance) {
    vectorTimelineChartInstance.data.labels = labels;
    vectorTimelineChartInstance.data.datasets = datasets;
    vectorTimelineChartInstance.update();
    return;
  }
  vectorTimelineChartInstance = new Chart(canvas.getContext('2d'), {
    type: 'line',
    data: { labels, datasets },
    options: {
      ...LINE_CHART_BASE_OPTIONS,
      // Independent of the tooltip's index-mode interaction above (which deliberately activates
      // every series at the hovered month) — click hit-testing needs 'nearest'+intersect:true so
      // it only fires for the specific line/point actually under the cursor.
      onClick: (evt, _elements, chart) => {
        const hit = chart.getElementsAtEventForMode(evt, 'nearest', { intersect: true }, true);
        if (hit.length) filterByVector(VECTOR_TIMELINE_TYPES[hit[0].datasetIndex]);
      },
      onHover: (evt, elements) => { evt.native.target.style.cursor = elements.length ? 'pointer' : 'default'; }
    }
  });
}


export let platformTimelineChartInstance = null;

const PLATFORM_TIMELINE_DEFS = [
  { key: 'x',  label: 'X / Twitter',    color: '#2f9bff', term: 'twitter',  test: p => p.includes('twitter') || p.includes('/x') || p.startsWith('x') },
  { key: 'w',  label: 'WhatsApp',       color: '#00ff9d', term: 'whatsapp', test: p => p.includes('whatsapp') },
  { key: 'yt', label: 'YouTube',        color: '#ff2d6a', term: 'youtube',  test: p => p.includes('youtube') },
  { key: 'tt', label: 'TikTok / Other', color: '#c724ff', term: 'tiktok',   test: p => p.includes('tiktok') }
];

export function updatePlatformTimelineChart() {
  const canvas = document.getElementById('platformTimelineChart');
  if (!canvas || typeof Chart === 'undefined') return;

  const counts = {};
  PLATFORM_TIMELINE_DEFS.forEach(p => { counts[p.key] = {}; });
  const monthsSet = new Set();
  incidents.forEach(i => {
    if (!i.date) return;
    const m = i.date.slice(0, 7);
    monthsSet.add(m);
    const p = (i.platform || '').toLowerCase();
    PLATFORM_TIMELINE_DEFS.forEach(def => { if (def.test(p)) counts[def.key][m] = (counts[def.key][m] || 0) + 1; });
  });
  const months = [...monthsSet].sort();
  const labels = months.map(monthLabel);
  const datasets = PLATFORM_TIMELINE_DEFS.map(def =>
    lineDataset(def.label, months.map(m => counts[def.key][m] || 0), def.color)
  );

  if (platformTimelineChartInstance) {
    platformTimelineChartInstance.data.labels = labels;
    platformTimelineChartInstance.data.datasets = datasets;
    platformTimelineChartInstance.update();
    return;
  }
  platformTimelineChartInstance = new Chart(canvas.getContext('2d'), {
    type: 'line',
    data: { labels, datasets },
    options: {
      ...LINE_CHART_BASE_OPTIONS,
      onClick: (evt, _elements, chart) => {
        const hit = chart.getElementsAtEventForMode(evt, 'nearest', { intersect: true }, true);
        if (hit.length) searchFromLeaderboard(PLATFORM_TIMELINE_DEFS[hit[0].datasetIndex].term);
      },
      onHover: (evt, elements) => { evt.native.target.style.cursor = elements.length ? 'pointer' : 'default'; }
    }
  });
}


// ── DISTRIBUTION PIES (per-axis breakdown, beyond the existing Vector Distribution doughnut) ──
// Same doughnut shell as updateVectorChart() above, factored into one small helper since these
// three differ only in which field they group by and what an active slice does on click.

const DOUGHNUT_BASE_OPTIONS = {
  responsive: true, maintainAspectRatio: false,
  cutout: '62%',
  plugins: {
    legend: { position: 'bottom', labels: { color: '#8b96ab', font: { family: 'IBM Plex Mono', size: 9 }, boxWidth: 8, padding: 8 } },
    tooltip: { backgroundColor: '#161c30', borderColor: '#2a3350', borderWidth: 1, titleFont: { family: 'IBM Plex Mono' }, bodyFont: { family: 'IBM Plex Mono' } }
  }
};

function createDoughnutRenderer(canvasId, compute, onClickIndex) {
  let instance = null;
  return function render() {
    const canvas = document.getElementById(canvasId);
    if (!canvas || typeof Chart === 'undefined') return;
    const { labels, data, colors } = compute();

    if (instance) {
      instance.data.labels = labels;
      instance.data.datasets[0].data = data;
      instance.data.datasets[0].backgroundColor = colors;
      instance.update();
      return;
    }
    instance = new Chart(canvas.getContext('2d'), {
      type: 'doughnut',
      data: { labels, datasets: [{ data, backgroundColor: colors, borderColor: '#0e1220', borderWidth: 2, hoverOffset: 10 }] },
      options: {
        ...DOUGHNUT_BASE_OPTIONS,
        onClick: onClickIndex ? (evt, elements) => { if (elements.length) onClickIndex(elements[0].index); } : undefined,
        onHover: onClickIndex ? (evt, elements) => { evt.native.target.style.cursor = elements.length ? 'pointer' : 'default'; } : undefined
      }
    });
  };
}

export const updatePlatformPieChart = createDoughnutRenderer(
  'platformPieChart',
  () => {
    const counts = {};
    PLATFORM_TIMELINE_DEFS.forEach(p => { counts[p.key] = 0; });
    incidents.forEach(i => {
      const p = (i.platform || '').toLowerCase();
      PLATFORM_TIMELINE_DEFS.forEach(def => { if (def.test(p)) counts[def.key]++; });
    });
    return {
      labels: PLATFORM_TIMELINE_DEFS.map(d => d.label),
      data: PLATFORM_TIMELINE_DEFS.map(d => counts[d.key]),
      colors: PLATFORM_TIMELINE_DEFS.map(d => d.color)
    };
  },
  idx => searchFromLeaderboard(PLATFORM_TIMELINE_DEFS[idx].term)
);

export const updateConfidencePieChart = createDoughnutRenderer(
  'confidencePieChart',
  () => {
    const keys = Object.keys(confidenceMeta);
    const counts = {};
    keys.forEach(k => { counts[k] = 0; });
    incidents.forEach(i => { if (counts.hasOwnProperty(i._confidence)) counts[i._confidence]++; });
    return {
      labels: keys.map(k => confidenceMeta[k].short),
      data: keys.map(k => counts[k]),
      colors: keys.map(k => confidenceMeta[k].color)
    };
  }
  // No click-to-filter: attribution confidence isn't a text-searchable or pill-filterable field
  // anywhere else in the app yet, unlike vector/platform.
);

export const updateTierPieChart = createDoughnutRenderer(
  'tierPieChart',
  () => {
    const keys = Object.keys(tierMeta);
    const counts = {};
    keys.forEach(k => { counts[k] = 0; });
    incidents.forEach(i => { if (counts.hasOwnProperty(i._tier)) counts[i._tier]++; });
    return {
      labels: keys.map(k => tierMeta[k].short),
      data: keys.map(k => counts[k]),
      colors: keys.map(k => tierMeta[k].color)
    };
  }
);

// ── VECTOR × CONFIRMATION STATUS (grouped bar) ── the "incidents by category, split by
// attribution side" pattern from comparable OSINT dashboards, adapted to this tracker's own
// attribution axis: for each vector (including Indian Response), how much of its volume is
// confirmed vs not — surfaces which vectors are well-evidenced vs largely unconfirmed claims.

export let vectorConfirmationChartInstance = null;

const ALL_TYPES_ORDERED = ['social', 'media', 'psyops', 'cyber', 'diplo', 'proxy', 'response'];

export function updateVectorConfirmationChart() {
  const canvas = document.getElementById('vectorConfirmationChart');
  if (!canvas || typeof Chart === 'undefined') return;

  const confirmed = [], unconfirmed = [];
  ALL_TYPES_ORDERED.forEach(t => {
    const list = incidents.filter(i => i.type === t);
    const conf = list.filter(i => i._confidence === 'confirmed').length;
    confirmed.push(conf);
    unconfirmed.push(list.length - conf);
  });
  const labels = ALL_TYPES_ORDERED.map(t => typeLabels[t] || t);

  const datasets = [
    { label: 'Confirmed', data: confirmed, backgroundColor: 'rgba(0,200,83,0.75)', hoverBackgroundColor: '#00c853', borderRadius: 3 },
    { label: 'Not Confirmed', data: unconfirmed, backgroundColor: 'rgba(139,150,171,0.4)', hoverBackgroundColor: '#8b96ab', borderRadius: 3 }
  ];

  if (vectorConfirmationChartInstance) {
    vectorConfirmationChartInstance.data.labels = labels;
    vectorConfirmationChartInstance.data.datasets = datasets;
    vectorConfirmationChartInstance.update();
    return;
  }
  vectorConfirmationChartInstance = new Chart(canvas.getContext('2d'), {
    type: 'bar',
    data: { labels, datasets },
    options: {
      responsive: true, maintainAspectRatio: false,
      scales: {
        x: { ticks: { color: '#8b96ab', font: { family: 'IBM Plex Mono', size: 8 } }, grid: { display: false } },
        y: { ticks: { color: '#8b96ab', font: { family: 'IBM Plex Mono', size: 8 }, precision: 0 }, grid: { color: '#2a3350' } }
      },
      plugins: {
        legend: { position: 'bottom', labels: { color: '#8b96ab', font: { family: 'IBM Plex Mono', size: 9 }, boxWidth: 8, padding: 8 } },
        tooltip: { backgroundColor: '#161c30', borderColor: '#2a3350', borderWidth: 1, titleFont: { family: 'IBM Plex Mono' }, bodyFont: { family: 'IBM Plex Mono' } }
      },
      onClick: (evt, _elements, chart) => {
        const hit = chart.getElementsAtEventForMode(evt, 'nearest', { intersect: true }, true);
        if (hit.length) filterByVector(ALL_TYPES_ORDERED[hit[0].index]);
      },
      onHover: (evt, elements) => { evt.native.target.style.cursor = elements.length ? 'pointer' : 'default'; }
    }
  });
}


export function animateCount(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  const start = parseInt(el.textContent) || 0;
  const step = (target - start) / 20;
  let cur = start;
  const t = setInterval(() => {
    cur += step;
    el.textContent = Math.round(cur);
    if (Math.abs(cur - target) < 0.5) { el.textContent = target; clearInterval(t); }
  }, 30);
}

// ── ADD INCIDENT ──
