import { eventKeywordLabels } from '../data/eventKeywordLabels.js';
import { formatDate } from './dates.js';

export function clusterByDate(items, gapDays) {
  const dated = items.filter(i => i.date).slice().sort((a,b) => new Date(a.date) - new Date(b.date));
  if (!dated.length) return [];
  const clusters = [];
  let cur = [dated[0]];
  for (let i = 1; i < dated.length; i++) {
    const gap = (new Date(dated[i].date) - new Date(dated[i-1].date)) / 86400000;
    if (gap <= gapDays) cur.push(dated[i]);
    else { clusters.push(cur); cur = [dated[i]]; }
  }
  clusters.push(cur);
  return clusters.filter(c => c.length >= 2);
}


export function labelCluster(cluster) {
  const joinedTitles = cluster.map(i => i.title.toLowerCase()).join(' | ');
  const hit = eventKeywordLabels.find(e => joinedTitles.includes(e.kw));
  if (hit) return hit.label;
  return `Event window (${formatDate(cluster[0].date)} – ${formatDate(cluster[cluster.length-1].date)})`;
}


export function normalizeSourceName(src) {
  if (!src) return null;
  const first = src.split(/[\(\/,]/)[0].trim();
  return first.length >= 2 ? first : null;
}

