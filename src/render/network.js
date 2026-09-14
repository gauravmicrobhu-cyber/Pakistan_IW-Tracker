import { incidents } from '../state.js';
import { targetLabels } from '../data/lookups.js';
import { formatDate } from '../logic/dates.js';
import { globalSelectedActor, setGlobalActorFocus } from './actorDossier.js';

export let netSelectedNode = null;

// ── ANNOTATIONS (personal flags/notes, stored only in this browser) ──

export let netSimulation = null;


export function buildNetworkGraph() {
  const nodesMap = new Map();
  const linksMap = new Map();

  function ensureNode(id, type, label) {
    if (!nodesMap.has(id)) nodesMap.set(id, { id, type, label, count: 0, incidentIds: new Set() });
    return nodesMap.get(id);
  }
  function ensureLink(a, b) {
    const key = [a,b].sort().join('|||');
    if (!linksMap.has(key)) linksMap.set(key, { source: a, target: b, count: 0 });
    return linksMap.get(key);
  }

  incidents.forEach(inc => {
    const actorId = 'actor:' + inc._actor;
    const aNode = ensureNode(actorId, 'actor', inc._actor);
    aNode.count++; aNode.incidentIds.add(inc.id);

    const platforms = (inc.platform||'Unspecified').split(',').map(p=>p.trim()).filter(Boolean);
    const plist = platforms.length ? platforms : ['Unspecified'];
    plist.forEach(p => {
      const platId = 'platform:' + p;
      const pNode = ensureNode(platId, 'platform', p);
      pNode.count++; pNode.incidentIds.add(inc.id);
      const l1 = ensureLink(actorId, platId); l1.count++;

      (inc._targets||[]).forEach(t => {
        const tId = 'target:' + t;
        const label = targetLabels[t] || 'Pan-India / General';
        const tNode = ensureNode(tId, 'target', label);
        tNode.count++; tNode.incidentIds.add(inc.id);
        const l2 = ensureLink(platId, tId); l2.count++;
      });
    });
  });

  const nodes = Array.from(nodesMap.values());
  const links = Array.from(linksMap.values());
  return { nodes, links };
}


export function renderNetwork() {
  const svgEl = document.getElementById('networkSvg');
  if (!svgEl || typeof d3 === 'undefined') return;
  const { nodes, links } = buildNetworkGraph();

  const width = svgEl.clientWidth || 800;
  const height = 640;
  svgEl.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svgEl.innerHTML = '';

  const svg = d3.select(svgEl);
  const g = svg.append('g');

  svg.call(d3.zoom().scaleExtent([0.4, 2.5]).on('zoom', (ev) => g.attr('transform', ev.transform)));

  const colorFor = t => t === 'actor' ? '#ff2d6a' : t === 'platform' ? '#2f9bff' : '#00f5d4';
  const radiusFor = n => Math.max(6, Math.min(6 + n.count * 2.2, 30));

  if (netSimulation) netSimulation.stop();
  netSimulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id(d => d.id).distance(90).strength(0.5))
    .force('charge', d3.forceManyBody().strength(-220))
    .force('center', d3.forceCenter(width/2, height/2))
    .force('collide', d3.forceCollide().radius(d => radiusFor(d) + 14));

  const link = g.append('g').selectAll('line')
    .data(links).join('line')
    .attr('class', 'net-link')
    .attr('stroke-width', d => Math.min(1 + d.count*0.6, 6));

  const node = g.append('g').selectAll('g')
    .data(nodes).join('g')
    .attr('class', 'net-node')
    .on('click', (ev, d) => { ev.stopPropagation(); selectNetNode(d); })
    .call(d3.drag()
      .on('start', (ev,d) => { if (!ev.active) netSimulation.alphaTarget(0.3).restart(); d.fx=d.x; d.fy=d.y; })
      .on('drag', (ev,d) => { d.fx=ev.x; d.fy=ev.y; })
      .on('end', (ev,d) => { if (!ev.active) netSimulation.alphaTarget(0); d.fx=null; d.fy=null; }));

  node.append('circle')
    .attr('r', d => radiusFor(d))
    .attr('fill', d => colorFor(d.type))
    .attr('opacity', 0.88)
    .attr('stroke', d => (netSelectedNode === d.id || (d.type === 'actor' && d.label === globalSelectedActor)) ? '#ffe600' : 'none')
    .attr('stroke-width', d => (d.type === 'actor' && d.label === globalSelectedActor) ? 3 : 2);

  node.append('text')
    .attr('dy', d => radiusFor(d) + 11)
    .attr('text-anchor', 'middle')
    .text(d => d.label.length > 20 ? d.label.slice(0,18)+'…' : d.label);

  node.append('title').text(d => `${d.label} (${d.count} incident${d.count===1?'':'s'})`);

  netSimulation.on('tick', () => {
    link
      .attr('x1', d => d.source.x).attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
    node.attr('transform', d => `translate(${d.x},${d.y})`);
  });

  window._netNodes = nodes;
  window._netLinks = links;
}


export function selectNetNode(d) {
  netSelectedNode = d.id;
  const sidebar = document.getElementById('netSidebar');
  const connected = window._netLinks.filter(l => l.source.id === d.id || l.target.id === d.id)
    .map(l => l.source.id === d.id ? l.target : l.source)
    .sort((a,b) => b.count - a.count);

  const relatedIncidentIds = new Set(d.incidentIds);
  const relatedIncidents = incidents.filter(i => relatedIncidentIds.has(i.id))
    .sort((a,b)=> new Date(b.date)-new Date(a.date)).slice(0,10);

  sidebar.innerHTML = `
    <div class="net-detail-title">${d.label}</div>
    <div class="net-detail-type">${d.type} · ${d.count} incident${d.count===1?'':'s'}</div>
    <div class="net-detail-list-title">Connected nodes (${connected.length})</div>
    ${connected.map(c => `<div class="net-conn-row">${c.label} <span style="color:var(--text-dim);font-family:var(--mono);font-size:9px;">${c.type}</span></div>`).join('') || '<div class="net-conn-row">None</div>'}
    <div class="net-detail-list-title">Related incidents</div>
    ${relatedIncidents.map(i => `<div class="map-inc-item" onclick="jumpToIncident(${i.id})"><div class="map-inc-title">${i.title}</div><div class="map-inc-meta">${formatDate(i.date)} · ${i.sev}</div></div>`).join('')}
  `;

  // re-render to show selection ring; actor nodes also cross-highlight Map/Connections
  if (d.type === 'actor') {
    setGlobalActorFocus(d.label);
  } else {
    document.querySelectorAll('#networkSvg circle').forEach(c => c.setAttribute('stroke','none'));
    renderNetwork();
  }
}


export function resetNetworkSelection() {
  netSelectedNode = null;
  document.getElementById('netSidebar').innerHTML = '<div class="net-sidebar-empty">Click any node — an actor, platform, or target audience — to see what it connects to and which incidents drive that link. Drag nodes to rearrange the graph.</div>';
  renderNetwork();
}

