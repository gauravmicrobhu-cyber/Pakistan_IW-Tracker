import { incidents, setCurrentFilter, setCurrentCampaignFilter, setSearchTerm } from '../state.js';
import { geoDefs, siteDefs, geoColor, typeLabels } from '../data/lookups.js';
import { greatCircleArc } from '../logic/geo.js';
import { formatDate } from '../logic/dates.js';
import { escapeHtml } from '../logic/escapeHtml.js';
import { globalSelectedActor } from './actorDossier.js';
import { renderTicker } from './connections.js';
import { renderFeed } from './feed.js';

export let mapSelectedGeo = null;

export let leafletMapInstance = null;

export let leafletLayers = []; // markers + polylines, cleared/rebuilt on each renderMap()

export let flowAnimId = null;

export let flowSegments = []; // {latlngs: [[lat,lng],...], color, packetEl, t}


export function renderMap() {
  const hostEl = document.getElementById('leafletMap');
  if (!hostEl || typeof L === 'undefined') return;

  if (!leafletMapInstance) {
    leafletMapInstance = L.map('leafletMap', { worldCopyJump: false, minZoom: 2, maxZoom: 8, zoomControl: true });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd', maxZoom: 19
    }).addTo(leafletMapInstance);
    leafletMapInstance.setView([30, 45], 3);
  }

  // Clear previous layers + animation loop
  leafletLayers.forEach(l => leafletMapInstance.removeLayer(l));
  leafletLayers = [];
  flowSegments = [];
  if (flowAnimId) cancelAnimationFrame(flowAnimId);

  // Count incidents touching each geo node, and which destination(s) each incident links to (excluding origin)
  // Response-type incidents (India's own countermeasures) are excluded entirely from this map's
  // arc/marker system — they have no Pakistan-origin flow to visualise.
  const nodeCounts = {};
  Object.keys(geoDefs).forEach(k => nodeCounts[k] = 0);
  const destEdges = {};
  incidents.filter(inc => inc.type !== 'response').forEach(inc => {
    (inc._geo || []).forEach(g => { if (nodeCounts.hasOwnProperty(g)) nodeCounts[g]++; });
    (inc._geo || []).filter(g => g !== 'pakistan').forEach(dest => {
      destEdges[dest] = destEdges[dest] || { count: 0, byType: {} };
      destEdges[dest].count++;
      destEdges[dest].byType[inc.type] = (destEdges[dest].byType[inc.type]||0) + 1;
    });
  });

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
    const count = nodeCounts[key] || 0;
    if (key !== 'pakistan' && count === 0) return;
    const selected = mapSelectedGeo === 'geo:'+key;
    const isFocused = globalSelectedActor && incidents.some(i => (i._geo||[]).includes(key) && i._actor === globalSelectedActor);

    if (def.isOrigin) {
      const icon = L.divIcon({ className: '', html: `<div class="origin-pin" title="${def.label}"></div>`, iconSize: [16,16] });
      const m = L.marker([def.lat, def.lng], { icon, zIndexOffset: 1000 }).addTo(leafletMapInstance);
      m.bindPopup(`<strong>${def.label}</strong><br/>Attribution origin for tracked activity`);
      leafletLayers.push(m);
    } else {
      const size = Math.max(20, Math.min(20 + count * 4, 52));
      const icon = L.divIcon({
        className: '',
        html: `<div class="geo-pin${selected?' selected':''}${isFocused?' global-focus':''}" style="width:${size}px;height:${size}px;font-size:${Math.max(10, size*0.32)}px;">${count}</div>`,
        iconSize: [size, size]
      });
      const m = L.marker([def.lat, def.lng], { icon }).addTo(leafletMapInstance);
      m.on('click', () => selectMapNode('geo', key));
      m.bindTooltip(def.label, { permanent: false, direction: 'top', className: 'geo-label-tip' });
      leafletLayers.push(m);
    }
  });

  // Cyber target-site markers — distinct layer for specific institutions/sectors hit by cyber incidents
  const siteCounts = {};
  Object.keys(siteDefs).forEach(k => siteCounts[k] = 0);
  incidents.filter(inc => inc.type !== 'response').forEach(inc => (inc._sites || []).forEach(s => { if (siteCounts.hasOwnProperty(s)) siteCounts[s]++; }));

  Object.entries(siteDefs).forEach(([key, def]) => {
    const count = siteCounts[key] || 0;
    if (count === 0) return;
    const selected = mapSelectedGeo === 'site:'+key;
    const isFocused = globalSelectedActor && incidents.some(i => (i._sites||[]).includes(key) && i._actor === globalSelectedActor);

    // dashed purple flow line from origin to the targeted site (cyber vector color)
    const o = geoDefs['pakistan'];
    const latlngs = greatCircleArc(o, def, 4 + Math.random()*2);
    const line = L.polyline(latlngs, { color: geoColor.cyber, weight: Math.min(1 + count*0.6, 5), opacity: 0.3, dashArray: '2,6' }).addTo(leafletMapInstance);
    leafletLayers.push(line);
    const packetIcon = L.divIcon({ className: '', html: `<div class="flow-packet" style="background:${geoColor.cyber};color:${geoColor.cyber}"></div>`, iconSize: [5,5] });
    const packet = L.marker(latlngs[0], { icon: packetIcon, interactive: false }).addTo(leafletMapInstance);
    leafletLayers.push(packet);
    flowSegments.push({ latlngs, marker: packet, t: Math.random(), speed: 0.003 + Math.random()*0.0015 });

    const size = Math.max(18, Math.min(18 + count * 5, 44));
    const icon = L.divIcon({
      className: '',
      html: `<div class="site-pin${selected?' selected':''}${isFocused?' global-focus':''}" style="width:${size}px;height:${size}px;font-size:${Math.max(10, size*0.4)}px;">⚡</div>`,
      iconSize: [size, size]
    });
    const m = L.marker([def.lat, def.lng], { icon, zIndexOffset: 500 }).addTo(leafletMapInstance);
    m.on('click', () => selectMapNode('site', key));
    m.bindTooltip(`${def.label} · ${count} cyber incident(s)`, { permanent: false, direction: 'top', className: 'geo-label-tip' });
    leafletLayers.push(m);
  });

  // Legend
  const legend = document.getElementById('mapLegend');
  if (legend) {
    legend.innerHTML = `
      <span class="map-legend-item"><span class="map-legend-dot" style="background:#ff2d6a"></span>Origin (Pakistan-based actors)</span>
      <span class="map-legend-item"><span class="map-legend-dot" style="background:#00f5d4"></span>Narrative target region · size/number = incident count</span>
      <span class="map-legend-item"><span class="map-legend-dot" style="background:${geoColor.cyber}"></span>⚡ Cyber-attack target site · size/number = incident count</span>
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
  const list = key === 'pakistan'
    ? incidents.slice().sort((a,b)=> new Date(b.date)-new Date(a.date))
    : incidents.filter(i => (i[fieldName]||[]).includes(key)).sort((a,b) => new Date(b.date) - new Date(a.date));

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
