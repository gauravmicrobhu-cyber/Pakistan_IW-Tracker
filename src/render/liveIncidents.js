import { incidents } from '../state.js';
import { geoDefs, geoColor, typeLabels, tagClass } from '../data/lookups.js';
import { parseReachValue, formatCompactNumber } from '../logic/reach.js';
import { formatDate } from '../logic/dates.js';
import { escapeHtml } from '../logic/escapeHtml.js';
import { jumpToIncident } from './map.js';

// ── RECENT INCIDENT ACTIVITY ── a sortable table of the most recently dated incidents in this
// dataset, paired with a small map plotting only those same rows — the "Live Updates" pattern
// from comparable OSINT/conflict dashboards, adapted to this tracker's own data. NOT a
// real-time external feed: it reflects the curated+community incident set already loaded, most
// recent first by default, and only updates when that set (or the sort) changes.

const LIVE_LIMIT = 15;

export let liveMiniMapInstance = null;

let liveSortCol = 'date';
let liveSortDir = 'desc';

function getLiveRows() {
  const rows = incidents.filter(i => i.date);
  const rank = { critical: 3, high: 2, medium: 1, low: 0 };
  const sorted = rows.slice().sort((a, b) => {
    let av, bv;
    if (liveSortCol === 'sev') { av = rank[a.sev] ?? -1; bv = rank[b.sev] ?? -1; }
    else if (liveSortCol === 'reach') { av = parseReachValue(a.reach) ?? -1; bv = parseReachValue(b.reach) ?? -1; }
    else { av = new Date(a.date).getTime(); bv = new Date(b.date).getTime(); }
    return liveSortDir === 'desc' ? bv - av : av - bv;
  });
  return sorted.slice(0, LIVE_LIMIT);
}

export function sortLiveIncidents(col) {
  liveSortDir = (liveSortCol === col) ? (liveSortDir === 'desc' ? 'asc' : 'desc') : 'desc';
  liveSortCol = col;
  renderLiveIncidentTable();
  renderLiveIncidentMap();
}

export function renderLiveIncidentTable() {
  const body = document.getElementById('liveIncidentTableBody');
  if (!body) return;
  const rows = getLiveRows();

  document.querySelectorAll('.live-table th[data-sort]').forEach(th => {
    th.classList.toggle('active', th.dataset.sort === liveSortCol);
    const arrow = th.querySelector('.live-sort-arrow');
    if (arrow) arrow.textContent = th.dataset.sort === liveSortCol ? (liveSortDir === 'desc' ? '▼' : '▲') : '⇅';
  });

  if (!rows.length) { body.innerHTML = `<tr><td colspan="6" class="lb-empty">No incidents logged yet.</td></tr>`; return; }

  body.innerHTML = rows.map(inc => {
    const reachVal = parseReachValue(inc.reach);
    return `
    <tr class="live-row" onclick="jumpToIncident(${inc.id})">
      <td class="live-td-date">${formatDate(inc.date)}</td>
      <td class="live-td-actor" title="${escapeHtml(inc._actor || '')}">${escapeHtml(inc._actor || 'Unattributed')}</td>
      <td><span class="tag ${tagClass[inc.type] || ''}">${escapeHtml(typeLabels[inc.type] || inc.type || '—')}</span></td>
      <td class="live-td-plat" title="${escapeHtml(inc.platform || '')}">${escapeHtml(inc.platform || '—')}</td>
      <td><span class="sev-badge sev-${inc.sev}">${escapeHtml(inc.sev || '—')}</span></td>
      <td class="live-td-reach">${reachVal !== null ? formatCompactNumber(reachVal) : '—'}</td>
    </tr>`;
  }).join('');
}

export function renderLiveIncidentMap() {
  const hostEl = document.getElementById('liveMiniMap');
  if (!hostEl || typeof L === 'undefined') return;

  if (!liveMiniMapInstance) {
    liveMiniMapInstance = L.map('liveMiniMap', { worldCopyJump: false, minZoom: 2, maxZoom: 8, zoomControl: false, attributionControl: false });
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', { maxZoom: 16 }).addTo(liveMiniMapInstance);
    liveMiniMapInstance.setView([28, 55], 2);
    liveMiniMapInstance._liveLayers = [];
  }

  liveMiniMapInstance._liveLayers.forEach(l => liveMiniMapInstance.removeLayer(l));
  liveMiniMapInstance._liveLayers = [];

  getLiveRows().forEach(inc => {
    const geoKey = (inc._geo || []).find(g => g !== 'pakistan') || (inc._geo || [])[0];
    const def = geoDefs[geoKey];
    if (!def) return;
    const color = geoColor[inc.type] || '#8b96ab';
    const icon = L.divIcon({ className: '', html: `<div class="live-pin" style="background:${color}"></div>`, iconSize: [10, 10] });
    const m = L.marker([def.lat, def.lng], { icon }).addTo(liveMiniMapInstance);
    m.bindTooltip(`${escapeHtml(inc.title)} · ${formatDate(inc.date)}`, { direction: 'top', className: 'geo-label-tip' });
    m.on('click', () => jumpToIncident(inc.id));
    liveMiniMapInstance._liveLayers.push(m);
  });

  setTimeout(() => liveMiniMapInstance.invalidateSize(), 50);
}
