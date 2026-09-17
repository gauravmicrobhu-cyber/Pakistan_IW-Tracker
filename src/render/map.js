import { incidents, setCurrentFilter, setCurrentCampaignFilter, setSearchTerm, getFilteredIncidents } from '../state.js';
import { geoDefs, siteDefs, geoColor, typeLabels } from '../data/lookups.js';
import { greatCircleArc } from '../logic/geo.js';
import { formatDate } from '../logic/dates.js';
import { escapeHtml } from '../logic/escapeHtml.js';
import { parseReachValue, formatCompactNumber } from '../logic/reach.js';
import { globalSelectedActor } from './actorDossier.js';
import { renderTicker } from './connections.js';
import { renderFeed } from './feed.js';

export let mapSelectedGeo = null;

// ── BUBBLE SIZE METRIC ── which quantity each region/site marker's radius represents. Defaults
// to incident count (the original behavior); reach and severity give an "intensity" reading
// instead — the same node might rank low by count but dwarf everything else by reach or by how
// many critical/high incidents it's carried, which count alone hides.
export let mapSizeMetric = 'count'; // 'count' | 'reach' | 'severity'

const SEVERITY_WEIGHT = { critical: 4, high: 3, medium: 2, low: 1 };

export function setMapSizeMetric(metric) {
  mapSizeMetric = metric;
  document.querySelectorAll('.size-pill').forEach(b => b.classList.toggle('active', b.dataset.metric === metric));
  renderMap();
}

function nodeMetricValue(list) {
  if (mapSizeMetric === 'reach') return list.reduce((sum, inc) => sum + (parseReachValue(inc.reach) || 0), 0);
  if (mapSizeMetric === 'severity') return list.reduce((sum, inc) => sum + (SEVERITY_WEIGHT[inc.sev] || 0), 0);
  return list.length;
}

function formatMetricValue(list) {
  if (mapSizeMetric === 'reach') {
    const v = nodeMetricValue(list);
    return v > 0 ? `${formatCompactNumber(v)} reach` : 'no quantified reach';
  }
  if (mapSizeMetric === 'severity') return `${nodeMetricValue(list)} severity pts`;
  return `${list.length} incident${list.length === 1 ? '' : 's'}`;
}

export let leafletMapInstance = null;

export let leafletLayers = []; // markers + polylines, cleared/rebuilt on each renderMap()

export let flowAnimId = null;

export let flowSegments = []; // {latlngs: [[lat,lng],...], color, packetEl, t}


export function renderMap() {
  const hostEl = document.getElementById('leafletMap');
  if (!hostEl || typeof L === 'undefined') return;

  if (!leafletMapInstance) {
    leafletMapInstance = L.map('leafletMap', { worldCopyJump: false, minZoom: 2, maxZoom: 8, zoomControl: true });
    // CARTO's free anonymous basemap tiles (formerly used here) now require an API key/account
    // and return a blocked "API key required" placeholder tile without one — switched to Esri's
    // dark-gray-canvas basemap, which is free with no signup, for the same minimal dark look.
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
      attribution: '&copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
      maxZoom: 16
    }).addTo(leafletMapInstance);
    leafletMapInstance.setView([30, 45], 3);
  }

  // Clear previous layers + animation loop
  leafletLayers.forEach(l => leafletMapInstance.removeLayer(l));
  leafletLayers = [];
  flowSegments = [];
  if (flowAnimId) cancelAnimationFrame(flowAnimId);

  // Group incidents touching each geo node (for both the displayed count and the active size
  // metric), and which destination(s) each incident links to (excluding origin). Respects the
  // same type/campaign/search/date-range filters the Feed tab uses, so switching to this tab
  // shows the filtered view rather than always the full dataset. Response-type incidents
  // (India's own countermeasures) are excluded entirely from this map's arc/marker system — they
  // have no Pakistan-origin flow to visualise.
  const filteredIncidents = getFilteredIncidents().filter(inc => inc.type !== 'response');
  const nodeIncidentLists = {};
  Object.keys(geoDefs).forEach(k => nodeIncidentLists[k] = []);
  const destEdges = {};
  filteredIncidents.forEach(inc => {
    (inc._geo || []).forEach(g => { if (nodeIncidentLists.hasOwnProperty(g)) nodeIncidentLists[g].push(inc); });
    (inc._geo || []).filter(g => g !== 'pakistan').forEach(dest => {
      destEdges[dest] = destEdges[dest] || { count: 0, byType: {} };
      destEdges[dest].count++;
      destEdges[dest].byType[inc.type] = (destEdges[dest].byType[inc.type]||0) + 1;
    });
  });
  const maxNodeMetric = Math.max(...Object.keys(geoDefs).filter(k => k !== 'pakistan').map(k => nodeMetricValue(nodeIncidentLists[k])), 1);

  // Animated flow lines: origin → each active destination
  Object.entries(destEdges).forEach(([dest, info]) => {
    const o = geoDefs['pakistan'], d = geoDefs[dest];
    if (!d) return;
    const dominant = Object.entries(info.byType).sort((a,b)=>b[1]-a[1])[0][0];
    const color = geoColor[dominant] || '#8b96ab';
    const weight = Math.min(1 + info.count * 0.7, 6);
    const curveHeight = 6 + Math.random()*2;
    const latlngs = greatCircleArc(o, d, curveHeight);

    const line = L.polyline(latlngs, { color, weight, opacity: 0.35, dashArray: '1,9', lineCap: 'round' }).addTo(leafletMapInstance);
    leafletLayers.push(line);

    // moving "packet" marker that travels along the arc — the animated part
    const packetIcon = L.divIcon({ className: '', html: `<div class="flow-packet" style="background:${color};color:${color}"></div>`, iconSize: [5,5] });
    const packet = L.marker(latlngs[0], { icon: packetIcon, interactive: false }).addTo(leafletMapInstance);
    leafletLayers.push(packet);
    flowSegments.push({ latlngs, marker: packet, t: Math.random(), speed: 0.0025 + Math.random()*0.0015 });
  });

  function animateFlows() {
    flowSegments.forEach(seg => {
      seg.t += seg.speed;
      if (seg.t > 1) seg.t = 0;
      const idx = Math.min(seg.latlngs.length - 1, Math.floor(seg.t * (seg.latlngs.length - 1)));
      seg.marker.setLatLng(seg.latlngs[idx]);
    });
    flowAnimId = requestAnimationFrame(animateFlows);
  }
  animateFlows();

  // Nodes (origin + destinations with hits)
  Object.entries(geoDefs).forEach(([key, def]) => {
    const list = nodeIncidentLists[key] || [];
    const count = list.length;
    if (key !== 'pakistan' && count === 0) return;
    const selected = mapSelectedGeo === 'geo:'+key;
    const isFocused = globalSelectedActor && list.some(i => i._actor === globalSelectedActor);

    if (def.isOrigin) {
      const icon = L.divIcon({ className: '', html: `<div class="origin-pin" title="${def.label}"></div>`, iconSize: [16,16] });
      const m = L.marker([def.lat, def.lng], { icon, zIndexOffset: 1000 }).addTo(leafletMapInstance);
      m.bindPopup(`<strong>${def.label}</strong><br/>Attribution origin for tracked activity`);
      leafletLayers.push(m);
    } else {
      const metricVal = nodeMetricValue(list);
      const size = Math.max(20, Math.min(20 + (metricVal / maxNodeMetric) * 32, 52));
      const icon = L.divIcon({
        className: '',
        html: `<div class="geo-pin${selected?' selected':''}${isFocused?' global-focus':''}" style="width:${size}px;height:${size}px;font-size:${Math.max(10, size*0.32)}px;">${count}</div>`,
        iconSize: [size, size]
      });
      const m = L.marker([def.lat, def.lng], { icon }).addTo(leafletMapInstance);
      m.on('click', () => selectMapNode('geo', key));
      m.bindTooltip(`${def.label} · ${formatMetricValue(list)}`, { permanent: false, direction: 'top', className: 'geo-label-tip' });
      leafletLayers.push(m);
    }
  });

  // Cyber target-site markers — distinct layer for specific institutions/sectors hit by cyber incidents
  const siteIncidentLists = {};
  Object.keys(siteDefs).forEach(k => siteIncidentLists[k] = []);
  filteredIncidents.forEach(inc => (inc._sites || []).forEach(s => { if (siteIncidentLists.hasOwnProperty(s)) siteIncidentLists[s].push(inc); }));
  const maxSiteMetric = Math.max(...Object.keys(siteDefs).map(k => nodeMetricValue(siteIncidentLists[k])), 1);

  Object.entries(siteDefs).forEach(([key, def]) => {
    const list = siteIncidentLists[key] || [];
    const count = list.length;
    if (count === 0) return;
    const selected = mapSelectedGeo === 'site:'+key;
    const isFocused = globalSelectedActor && list.some(i => i._actor === globalSelectedActor);

    // dashed purple flow line from origin to the targeted site (cyber vector color)
    const o = geoDefs['pakistan'];
    const latlngs = greatCircleArc(o, def, 4 + Math.random()*2);
    const line = L.polyline(latlngs, { color: geoColor.cyber, weight: Math.min(1 + count*0.6, 5), opacity: 0.3, dashArray: '2,6' }).addTo(leafletMapInstance);
    leafletLayers.push(line);
    const packetIcon = L.divIcon({ className: '', html: `<div class="flow-packet" style="background:${geoColor.cyber};color:${geoColor.cyber}"></div>`, iconSize: [5,5] });
    const packet = L.marker(latlngs[0], { icon: packetIcon, interactive: false }).addTo(leafletMapInstance);
    leafletLayers.push(packet);
    flowSegments.push({ latlngs, marker: packet, t: Math.random(), speed: 0.003 + Math.random()*0.0015 });

    const metricVal = nodeMetricValue(list);
    const size = Math.max(18, Math.min(18 + (metricVal / maxSiteMetric) * 26, 44));
    const icon = L.divIcon({
      className: '',
      html: `<div class="site-pin${selected?' selected':''}${isFocused?' global-focus':''}" style="width:${size}px;height:${size}px;font-size:${Math.max(10, size*0.4)}px;">⚡</div>`,
      iconSize: [size, size]
    });
    const m = L.marker([def.lat, def.lng], { icon, zIndexOffset: 500 }).addTo(leafletMapInstance);
    m.on('click', () => selectMapNode('site', key));
    m.bindTooltip(`${def.label} · ${formatMetricValue(list)}`, { permanent: false, direction: 'top', className: 'geo-label-tip' });
    leafletLayers.push(m);
  });

  // Legend
  const legend = document.getElementById('mapLegend');
  const sizeByLabel = mapSizeMetric === 'reach' ? 'cumulative reach' : mapSizeMetric === 'severity' ? 'severity-weighted intensity' : 'incident count';
  if (legend) {
    legend.innerHTML = `
      <span class="map-legend-item"><span class="map-legend-dot" style="background:#ff2d6a"></span>Origin (Pakistan-based actors)</span>
      <span class="map-legend-item"><span class="map-legend-dot" style="background:#00f5d4"></span>Narrative target region · number = incident count · size = ${sizeByLabel}</span>
      <span class="map-legend-item"><span class="map-legend-dot" style="background:${geoColor.cyber}"></span>⚡ Cyber-attack target site · size = ${sizeByLabel}</span>
      <span class="map-legend-item">Line color = dominant vector type on that route</span>
      <span class="map-legend-item">Moving dot = live animated flow along the route</span>
    `;
  }

  setTimeout(() => leafletMapInstance.invalidateSize(), 50);
  renderTicker();
  if (mapSelectedGeo) {
    const [kind, key] = mapSelectedGeo.split(':');
    renderMapSidebar(kind, key);
  }
}


export function selectGeo(key) { selectMapNode('geo', key); }


export function selectMapNode(kind, key) {
  const id = kind + ':' + key;
  mapSelectedGeo = (mapSelectedGeo === id) ? null : id;
  renderMap();
  if (mapSelectedGeo) {
    const [k, ky] = mapSelectedGeo.split(':');
    renderMapSidebar(k, ky);
  } else {
    document.getElementById('mapSidebarBody').innerHTML = '<div class="map-empty">Select a region or target site to view associated incidents.</div>';
  }
}


export function renderMapSidebar(kind, key) {
  const body = document.getElementById('mapSidebarBody');
  const defSource = kind === 'site' ? siteDefs : geoDefs;
  const fieldName = kind === 'site' ? '_sites' : '_geo';
  const def = defSource[key];
  const scoped = getFilteredIncidents();
  const list = key === 'pakistan'
    ? scoped.slice().sort((a,b)=> new Date(b.date)-new Date(a.date))
    : scoped.filter(i => (i[fieldName]||[]).includes(key)).sort((a,b) => new Date(b.date) - new Date(a.date));

  if (!list.length) { body.innerHTML = `<div class="map-empty">No incidents mapped to ${def.label}.</div>`; return; }

  // Tagging-confidence transparency: site tags can be explicitly set per-incident (inc.site);
  // regional geo tags have no such override and are always keyword-derived. Surfacing which is
  // which so a placement isn't mistaken for manually-verified when it was auto-detected.
  const confNote = kind === 'site'
    ? `<div class="live-note" style="margin-bottom:10px;font-size:10px;">✓ Explicit = author-set on this incident. ⚠ Auto = matched by keyword search of the incident text, not manually verified.</div>`
    : `<div class="live-note" style="margin-bottom:10px;font-size:10px;">⚠ All regional tags here are auto-detected by keyword-matching the incident text — none are manually verified per incident.</div>`;

  body.innerHTML = `<div style="font-family:var(--mono);font-size:9px;color:${kind==='site'?geoColor.cyber:'var(--teal)'};margin-bottom:8px;text-transform:uppercase;">${kind==='site'?'⚡ ':''}${def.label} · ${list.length} incident(s)</div>` +
    (key !== 'pakistan' ? confNote : '') +
    list.slice(0,15).map(i => {
      const isExplicit = kind === 'site' && i.site === key;
      const tagBadge = kind === 'site'
        ? `<span style="font-family:var(--mono);font-size:8px;color:${isExplicit?'#00c853':'#ff9f1c'};margin-left:6px;">${isExplicit?'✓ explicit':'⚠ auto'}</span>`
        : '';
      return `
      <div class="map-inc-item" onclick="jumpToIncident(${i.id})">
        <div class="map-inc-title">${escapeHtml(i.title)}${tagBadge}</div>
        <div class="map-inc-meta">${typeLabels[i.type]||i.type} · ${i.sev} · ${formatDate(i.date)}</div>
      </div>
    `;}).join('');
}



export function jumpToIncident(id) {
  const inc = incidents.find(i => i.id === id);
  if (!inc) return;
  document.querySelector('.tab-btn[data-tab="feed"]').click();
  setCurrentFilter('all');
  setCurrentCampaignFilter('all');
  document.querySelectorAll('.pill:not(.pill-campaign)').forEach(b => b.classList.toggle('active', b.dataset.filter === 'all'));
  document.querySelectorAll('.pill-campaign').forEach(b => b.classList.toggle('active', b.dataset.campaign === 'all'));
  setSearchTerm('');
  document.getElementById('searchBox').value = '';
  renderFeed();
  setTimeout(() => {
    const card = document.querySelector(`.incident-card[data-id="${id}"]`);
    if (card) { card.scrollIntoView({behavior:'smooth', block:'center'}); card.style.outline = '2px solid var(--teal)'; setTimeout(()=>card.style.outline='', 1800); }
  }, 60);
}

// ── LINKAGE NETWORK (D3 force graph: Actor → Platform → Target Audience) ──
