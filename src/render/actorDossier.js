import { incidents, mapRendered, networkRendered, connectionsRendered } from '../state.js';
import { typeColor, typeLabels } from '../data/lookups.js';
import { formatDate } from '../logic/dates.js';
import { escapeHtml } from '../logic/escapeHtml.js';
import { renderMap } from './map.js';
import { renderNetwork } from './network.js';
import { renderConnections } from './connections.js';
import { renderMitreTTPSection } from './analytics.js';

export let globalSelectedActor = null;


export function setGlobalActorFocus(actorName) {
  if (!actorName) return;
  globalSelectedActor = actorName;
  document.querySelectorAll('.global-focus-bar').forEach(bar => {
    bar.classList.add('show');
    bar.querySelector('.gfb-label').textContent = `🔍 Focused across tabs: ${actorName}`;
  });
  if (mapRendered) renderMap();
  if (networkRendered) renderNetwork();
  if (connectionsRendered) renderConnections();
}


export function clearGlobalActorFocus() {
  globalSelectedActor = null;
  document.querySelectorAll('.global-focus-bar').forEach(bar => bar.classList.remove('show'));
  if (mapRendered) renderMap();
  if (networkRendered) renderNetwork();
  if (connectionsRendered) renderConnections();
}

// ── MITRE ATT&CK reference data ──
// Verified directly from the official STIX 2.1 bundle (mitre-attack/attack-stix-data,
// enterprise-attack, fetched and cross-checked before adding) for the two Pakistan-linked
// groups this tracker covers. Reference/knowledge-base data — refresh periodically by
// re-pulling the same bundle rather than treating this as a live feed.
// © The MITRE Corporation. Reproduced per MITRE ATT&CK's terms of use (https://attack.mitre.org/resources/terms-of-use/).

export function openActorDossier(actorName) {
  if (!actorName) return;
  const related = incidents.filter(i => i._actor === actorName).sort((a,b) => new Date(b.date) - new Date(a.date));
  if (!related.length) return;

  setGlobalActorFocus(actorName);
  document.getElementById('dossierActorName').textContent = actorName;

  const dates = related.map(i => i.date).filter(Boolean).sort();
  const first = dates[0], last = dates[dates.length-1];
  const critCount = related.filter(i => i.sev === 'critical').length;

  const vectorCounts = {};
  related.forEach(i => { vectorCounts[i.type] = (vectorCounts[i.type]||0) + 1; });
  const vectorBarHtml = Object.entries(vectorCounts).map(([t,c]) =>
    `<div style="width:${(c/related.length*100)}%;background:${typeColor[t]||'#8b96ab'};" title="${typeLabels[t]||t}: ${c}"></div>`
  ).join('');

  const platforms = {};
  related.forEach(i => (i.platform||'').split(/[,\/]/).map(p=>p.trim()).filter(Boolean).forEach(p => { platforms[p] = (platforms[p]||0)+1; }));
  const topPlatforms = Object.entries(platforms).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([p,c]) => `${escapeHtml(p)} (${c})`).join(', ');

  document.getElementById('dossierBody').innerHTML = `
    <div class="dossier-stats">
      <div class="dossier-stat"><div class="dossier-stat-num">${related.length}</div><div class="dossier-stat-label">Incidents</div></div>
      <div class="dossier-stat"><div class="dossier-stat-num" style="color:var(--accent)">${critCount}</div><div class="dossier-stat-label">Critical</div></div>
      <div class="dossier-stat"><div class="dossier-stat-num" style="font-size:13px;">${formatDate(first)}</div><div class="dossier-stat-label">First Seen</div></div>
      <div class="dossier-stat"><div class="dossier-stat-num" style="font-size:13px;">${formatDate(last)}</div><div class="dossier-stat-label">Last Seen</div></div>
    </div>
    <div class="dossier-vector-bar">${vectorBarHtml}</div>
    <div style="font-family:var(--mono);font-size:9px;color:var(--text-dim);margin-bottom:1.25rem;">TOP PLATFORMS: ${topPlatforms || 'n/a'}</div>
    ${renderMitreTTPSection(actorName)}
    <div class="net-detail-list-title" style="margin-top:0;">All incidents</div>
    ${related.map(i => `<div class="map-inc-item" onclick="closeActorDossier(); jumpToIncident(${i.id})"><div class="map-inc-title">${escapeHtml(i.title)}</div><div class="map-inc-meta">${typeLabels[i.type]||i.type} · ${i.sev} · ${formatDate(i.date)}</div></div>`).join('')}
  `;

  document.getElementById('actorDossierOverlay').classList.add('show');
}


export function closeActorDossier() {
  document.getElementById('actorDossierOverlay').classList.remove('show');
}

// ── COMMAND PALETTE ──
