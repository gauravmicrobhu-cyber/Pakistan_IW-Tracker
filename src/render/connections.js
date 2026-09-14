import { incidents } from '../state.js';
import { typeColor, typeLabels } from '../data/lookups.js';
import { clusterByDate, labelCluster, normalizeSourceName } from '../logic/cluster.js';
import { formatDate } from '../logic/dates.js';
import { escapeHtml } from '../logic/escapeHtml.js';
import { globalSelectedActor, setGlobalActorFocus } from './actorDossier.js';
import { jumpToIncident } from './map.js';

export function renderConnections() {
  const all = incidents;
  const statsHost = document.getElementById('connStats');
  const clustersHost = document.getElementById('connClusters');
  const recurHost = document.getElementById('connRecurring');
  const platHost = document.getElementById('connPlatforms');
  const mentionsHost = document.getElementById('connMentions');
  if (!statsHost) return;

  // 1. Temporal clusters
  const clusters = clusterByDate(all, 10).sort((a,b) => b.length - a.length);
  const largestClusterPct = clusters.length ? Math.round(100 * clusters[0].length / all.length) : 0;

  // 2. Recurring sources (normalized) and actors
  const sourceCounts = {}, sourceIncidents = {};
  const actorCounts = {}, actorIncidents = {};
  all.forEach(inc => {
    const s = normalizeSourceName(inc.source);
    if (s) {
      sourceCounts[s] = (sourceCounts[s]||0) + 1;
      (sourceIncidents[s] = sourceIncidents[s]||[]).push(inc);
    }
    const a = inc._actor;
    if (a && a !== 'Unattributed / crowd-sourced') {
      actorCounts[a] = (actorCounts[a]||0) + 1;
      (actorIncidents[a] = actorIncidents[a]||[]).push(inc);
    }
  });
  const recurringSources = Object.entries(sourceCounts).filter(([,c]) => c >= 2).sort((a,b)=>b[1]-a[1]);
  const recurringActors = Object.entries(actorCounts).filter(([,c]) => c >= 2).sort((a,b)=>b[1]-a[1]);

  // 3. Platform token frequency
  const platCounts = {};
  all.forEach(inc => {
    (inc.platform || '').split(/[,\/]/).map(t=>t.trim()).filter(Boolean).forEach(t => {
      platCounts[t] = (platCounts[t]||0) + 1;
    });
  });
  const platSorted = Object.entries(platCounts).sort((a,b)=>b[1]-a[1]).slice(0,10);
  const maxPlat = platSorted.length ? platSorted[0][1] : 1;

  // 4. Cross-referenced mentions: does incident A's text name incident B's actor/source?
  const mentions = [];
  const distinctiveNames = [...new Set(all.map(i => i._actor).filter(a => a && a !== 'Unattributed / crowd-sourced')
    .concat(all.map(i => normalizeSourceName(i.source)).filter(Boolean)))]
    .filter(n => n.length > 3);
  all.forEach(a => {
    const text = `${a.title} ${a.detail}`.toLowerCase();
    distinctiveNames.forEach(name => {
      if (name === a._actor || name === normalizeSourceName(a.source)) return; // skip self
      if (text.includes(name.toLowerCase())) {
        const owners = all.filter(b => b.id !== a.id && (b._actor === name || normalizeSourceName(b.source) === name));
        owners.forEach(b => mentions.push({ from: a, to: b, via: name }));
      }
    });
  });
  // de-dup identical from/to pairs
  const seenPairs = new Set();
  const dedupedMentions = mentions.filter(m => {
    const key = m.from.id + '>' + m.to.id + ':' + m.via;
    if (seenPairs.has(key)) return false;
    seenPairs.add(key); return true;
  });

  // ── RENDER: stat cards ──
  statsHost.innerHTML = `
    <div class="conn-stat"><div class="conn-stat-num">${largestClusterPct}%</div><div class="conn-stat-label">of incidents fall in the single largest event window</div></div>
    <div class="conn-stat"><div class="conn-stat-num">${recurringActors[0] ? recurringActors[0][1] : 0}</div><div class="conn-stat-label">${recurringActors[0] ? recurringActors[0][0] : 'No repeat actor'} — most recurring actor</div></div>
    <div class="conn-stat"><div class="conn-stat-num">${recurringSources[0] ? recurringSources[0][1] : 0}</div><div class="conn-stat-label">${recurringSources[0] ? recurringSources[0][0] : 'No repeat source'} — most cited source</div></div>
    <div class="conn-stat"><div class="conn-stat-num">${platSorted[0] ? platSorted[0][1] : 0}</div><div class="conn-stat-label">${platSorted[0] ? platSorted[0][0] : 'n/a'} — dominant platform</div></div>
  `;

  // ── RENDER: clusters ──
  clustersHost.innerHTML = clusters.length ? clusters.map(c => `
    <div class="cluster-card">
      <div class="cluster-head">
        <div class="cluster-label">${labelCluster(c)}</div>
        <div class="cluster-range">${formatDate(c[0].date)} – ${formatDate(c[c.length-1].date)} · ${c.length} incidents</div>
      </div>
      <div class="cluster-items">
        ${c.map(i => `
          <div class="cluster-item-row" onclick="jumpToIncident(${i.id})">
            <span class="cluster-item-date">${formatDate(i.date)}</span>
            <span class="map-inc-title">${escapeHtml(i.title)}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('') : '<div class="map-empty">No incidents cluster within a 10-day window yet.</div>';

  // ── RENDER: recurring table ──
  const recurRows = [
    ...recurringActors.map(([name,count]) => ({name, count, kind:'actor', incs: actorIncidents[name]})),
    ...recurringSources.map(([name,count]) => ({name, count, kind:'source', incs: sourceIncidents[name]}))
  ].sort((a,b) => b.count - a.count);
  recurHost.innerHTML = recurRows.length ? `
    <table class="recur-table">
      <thead><tr><th>Name</th><th>Count</th><th>Incidents</th></tr></thead>
      <tbody>
        ${recurRows.map(r => `
          <tr>
            <td><span class="recur-name">${escapeHtml(r.name)}</span><span class="recur-kind-badge">${r.kind}</span></td>
            <td class="recur-count">${r.count}</td>
            <td>${r.incs.map(i => `<span class="recur-inc-link" onclick="jumpToIncident(${i.id})">${escapeHtml(i.title)}</span>`).join('')}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  ` : '<div class="map-empty">No actor or source appears more than once yet.</div>';

  // ── RENDER: platform bars ──
  platHost.innerHTML = platSorted.length ? platSorted.map(([name,count]) => `
    <div class="plat-bar-row">
      <div class="plat-bar-label">${escapeHtml(name)}</div>
      <div class="plat-bar-track"><div class="plat-bar-fill" style="width:${Math.max(4, 100*count/maxPlat)}%"></div></div>
      <div class="plat-bar-count">${count}</div>
    </div>
  `).join('') : '<div class="map-empty">No platform data yet.</div>';

  // ── RENDER: cross-mentions ──
  mentionsHost.innerHTML = dedupedMentions.length ? dedupedMentions.slice(0,25).map(m => `
    <div class="mention-row">
      <span class="mention-link" onclick="jumpToIncident(${m.from.id})">${escapeHtml(m.from.title)}</span>
      <span class="mention-arrow">→ names "${escapeHtml(m.via)}" →</span>
      <span class="mention-link" onclick="jumpToIncident(${m.to.id})">${escapeHtml(m.to.title)}</span>
    </div>
  `).join('') : '<div class="map-empty">No incident\'s own text explicitly names another logged actor/source yet.</div>';

  // ── RENDER: animated connections map ──
  buildConnectionsMap(all, clusters, recurringActors, actorIncidents, recurringSources, sourceIncidents, dedupedMentions);
}


export let cmSimulation = null;

export let cmFlowAnimId = null;

export let cmFlowSegments = [];


export function buildConnectionsMap(all, clusters, recurringActors, actorIncidents, recurringSources, sourceIncidents, dedupedMentions) {
  const svgEl = document.getElementById('connMapSvg');
  if (!svgEl || typeof d3 === 'undefined') return;

  const nodes = [];
  const links = [];
  const nodeById = {};
  function addNode(n) { nodeById[n.id] = n; nodes.push(n); return n; }

  // incident nodes
  all.forEach(inc => addNode({ id: 'inc:'+inc.id, kind: 'incident', label: inc.title, type: inc.type, incident: inc }));

  // actor hub nodes
  recurringActors.forEach(([name, count]) => {
    addNode({ id: 'actor:'+name, kind: 'actor-hub', label: name, count });
    actorIncidents[name].forEach(inc => links.push({ source: 'actor:'+name, target: 'inc:'+inc.id, kind: 'actor' }));
  });

  // source hub nodes
  recurringSources.forEach(([name, count]) => {
    addNode({ id: 'source:'+name, kind: 'source-hub', label: name, count });
    sourceIncidents[name].forEach(inc => links.push({ source: 'source:'+name, target: 'inc:'+inc.id, kind: 'source' }));
  });

  // event-window hub nodes
  clusters.forEach((c, idx) => {
    const hubId = 'cluster:'+idx;
    addNode({ id: hubId, kind: 'cluster-hub', label: labelCluster(c), count: c.length });
    c.forEach(inc => links.push({ source: hubId, target: 'inc:'+inc.id, kind: 'cluster' }));
  });

  // cross-mention direct edges
  dedupedMentions.forEach(m => {
    if (nodeById['inc:'+m.from.id] && nodeById['inc:'+m.to.id]) {
      links.push({ source: 'inc:'+m.from.id, target: 'inc:'+m.to.id, kind: 'mention' });
    }
  });

  const width = svgEl.clientWidth || 800, height = 560;
  svgEl.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svgEl.innerHTML = '';
  if (cmSimulation) cmSimulation.stop();
  if (cmFlowAnimId) cancelAnimationFrame(cmFlowAnimId);
  cmFlowSegments = [];

  const svg = d3.select(svgEl);
  const g = svg.append('g');
  svg.call(d3.zoom().scaleExtent([0.4, 2.5]).on('zoom', ev => g.attr('transform', ev.transform)));

  const linkColor = { actor: '#ff2d6a', source: '#2f9bff', cluster: '#ffe600', mention: '#00f5d4' };
  const radiusFor = n => n.kind === 'incident' ? 6 : Math.max(10, Math.min(10 + (n.count||1) * 2.5, 30));

  cmSimulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id(d => d.id).distance(d => d.kind === 'mention' ? 130 : 70).strength(0.6))
    .force('charge', d3.forceManyBody().strength(-180))
    .force('center', d3.forceCenter(width/2, height/2))
    .force('collide', d3.forceCollide().radius(d => radiusFor(d) + 10));

  const link = g.append('g').selectAll('line')
    .data(links).join('line')
    .attr('class', 'net-link')
    .attr('stroke', d => linkColor[d.kind])
    .attr('stroke-opacity', d => d.kind === 'mention' ? 0.7 : 0.35)
    .attr('stroke-dasharray', d => d.kind === 'mention' ? '4,3' : null)
    .attr('stroke-width', d => d.kind === 'mention' ? 1.5 : 1.2);

  const node = g.append('g').selectAll('g')
    .data(nodes).join('g')
    .attr('class', 'net-node')
    .on('click', (ev, d) => { ev.stopPropagation(); selectCmNode(d, links); })
    .call(d3.drag()
      .on('start', (ev,d) => { if (!ev.active) cmSimulation.alphaTarget(0.3).restart(); d.fx=d.x; d.fy=d.y; })
      .on('drag', (ev,d) => { d.fx=ev.x; d.fy=ev.y; })
      .on('end', (ev,d) => { if (!ev.active) cmSimulation.alphaTarget(0); d.fx=null; d.fy=null; }));

  node.append('circle')
    .attr('r', d => radiusFor(d))
    .attr('fill', d => d.kind === 'incident' ? (typeColor[d.type]||'#8b96ab') : d.kind === 'actor-hub' ? '#ff2d6a' : d.kind === 'source-hub' ? '#2f9bff' : '#ffe600')
    .attr('opacity', d => d.kind === 'incident' ? 0.75 : 0.9)
    .attr('stroke', d => (d.kind === 'actor-hub' && d.label === globalSelectedActor) ? '#ffe600' : (d.kind === 'incident' ? 'none' : 'rgba(255,255,255,0.25)'))
    .attr('stroke-width', d => (d.kind === 'actor-hub' && d.label === globalSelectedActor) ? 3 : 1);

  node.filter(d => d.kind !== 'incident').append('text')
    .attr('dy', d => radiusFor(d) + 11)
    .attr('text-anchor', 'middle')
    .text(d => d.label.length > 22 ? d.label.slice(0,20)+'…' : d.label);

  node.append('title').text(d => d.kind === 'incident' ? d.incident.title : `${d.label} (${d.count})`);

  // animated flowing dots along a sample of edges (skip incident<->incident-heavy clutter, animate hub links + mentions)
  const animatable = links.filter(l => l.kind === 'mention' || Math.random() < 0.5);
  animatable.forEach(l => cmFlowSegments.push({ link: l, t: Math.random(), speed: 0.004 + Math.random()*0.003 }));
  const packets = g.append('g').selectAll('circle.cm-packet')
    .data(cmFlowSegments).join('circle')
    .attr('class', 'cm-packet')
    .attr('r', 2.5)
    .attr('fill', d => linkColor[d.link.kind])
    .style('filter', d => `drop-shadow(0 0 3px ${linkColor[d.link.kind]})`);

  cmSimulation.on('tick', () => {
    link.attr('x1', d => d.source.x).attr('y1', d => d.source.y).attr('x2', d => d.target.x).attr('y2', d => d.target.y);
    node.attr('transform', d => `translate(${d.x},${d.y})`);
  });

  function animateCmFlows() {
    cmFlowSegments.forEach(s => {
      s.t += s.speed;
      if (s.t > 1) s.t = 0;
    });
    packets
      .attr('cx', d => d.link.source.x + (d.link.target.x - d.link.source.x) * d.t)
      .attr('cy', d => d.link.source.y + (d.link.target.y - d.link.source.y) * d.t);
    cmFlowAnimId = requestAnimationFrame(animateCmFlows);
  }
  animateCmFlows();

  window._cmNodes = nodes;
  window._cmLinks = links;

  const legend = document.getElementById('cmLegend');
  if (legend) {
    legend.innerHTML = `
      <span class="cm-legend-item"><span class="cm-legend-dot" style="background:#ff2d6a"></span>Actor hub</span>
      <span class="cm-legend-item"><span class="cm-legend-dot" style="background:#2f9bff"></span>Source hub</span>
      <span class="cm-legend-item"><span class="cm-legend-dot" style="background:#ffe600"></span>Event-window hub</span>
      <span class="cm-legend-item"><span class="cm-legend-dot" style="background:#00f5d4"></span>Direct cross-mention (dashed)</span>
      <span class="cm-legend-item">Small dots = incidents, colored by vector type</span>
    `;
  }
}


export function selectCmNode(d, links) {
  const sidebar = document.getElementById('cmSidebar');
  if (d.kind === 'incident') { jumpToIncident(d.incident.id); return; }

  const connected = links.filter(l => l.source.id === d.id || l.target.id === d.id)
    .map(l => l.source.id === d.id ? l.target : l.source);

  sidebar.innerHTML = `
    <div class="net-detail-title">${escapeHtml(d.label)}</div>
    <div class="net-detail-type">${d.kind.replace('-hub','')} · ${d.count} linked incident(s)</div>
    <div class="net-detail-list-title">Connected incidents</div>
    ${connected.map(c => `<div class="map-inc-item" onclick="jumpToIncident(${c.incident.id})"><div class="map-inc-title">${escapeHtml(c.incident.title)}</div><div class="map-inc-meta">${formatDate(c.incident.date)} · ${c.incident.sev}</div></div>`).join('')}
  `;

  if (d.kind === 'actor-hub') setGlobalActorFocus(d.label);
}

// ── LIVE DETECTION TICKER (Kaspersky-Cybermap-style bottom bar) ──
// Real counts and real incidents only — no simulated/fake live numbers, just an animated
// presentation of the tracker's actual current data.

export function renderTicker() {
  const host = document.getElementById('tickerBar');
  if (!host) return;

  const counts = {};
  incidents.forEach(i => { counts[i.type] = (counts[i.type]||0) + 1; });
  const countsHtml = Object.keys(typeColor).map(t => `
    <div class="ticker-count-item">
      <span class="ticker-count-dot" style="background:${typeColor[t]};box-shadow:0 0 6px ${typeColor[t]}"></span>
      ${typeLabels[t]||t}: <span class="ticker-count-num">${counts[t]||0}</span>
    </div>
  `).join('');

  const sorted = incidents.slice().sort((a,b) => new Date(b.date) - new Date(a.date));
  const scrollItems = sorted.map(i => `
    <div class="ticker-item">
      <span class="tdot" style="background:${typeColor[i.type]||'#8b96ab'};box-shadow:0 0 5px ${typeColor[i.type]||'#8b96ab'}"></span>
      <span class="tdate">${formatDate(i.date)}</span>
      <span class="ttitle">${i.title}</span>
    </div>
  `).join('');
  // duplicate the track so the CSS marquee (translateX -50%) loops seamlessly
  const trackHtml = scrollItems + scrollItems;

  host.innerHTML = `
    <div class="ticker-counts">${countsHtml}</div>
    <div class="ticker-scroll-wrap"><div class="ticker-scroll-track" id="tickerScrollTrack">${trackHtml}</div></div>
  `;

  // Set animation duration from actual measured width so scroll speed stays constant
  // and readable (~28px/sec) no matter how many incidents are logged.
  requestAnimationFrame(() => {
    const track = document.getElementById('tickerScrollTrack');
    if (!track) return;
    const halfWidth = track.scrollWidth / 2; // track content is duplicated for seamless loop
    const pxPerSecond = 28;
    const duration = Math.max(halfWidth / pxPerSecond, 20); // never faster than 20s minimum either way
    track.style.animationDuration = duration + 's';
  });
}

