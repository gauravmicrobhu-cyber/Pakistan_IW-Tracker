import { incidents, currentFilter, currentCampaignFilter, searchTerm, timelineActiveRange } from '../state.js';
import { showToast } from './misc.js';

export function exportData(format) {
  const filtered = incidents.filter(inc => {
    const matchFilter = currentFilter === 'all' || inc.type === currentFilter;
    const matchCampaign = currentCampaignFilter === 'all' || inc._campaign === currentCampaignFilter;
    const matchSearch = !searchTerm ||
      inc.title.toLowerCase().includes(searchTerm) ||
      inc.detail.toLowerCase().includes(searchTerm) ||
      (inc.source||'').toLowerCase().includes(searchTerm);
    const matchTimeline = !timelineActiveRange || (() => {
      const t = new Date(inc.date + 'T00:00:00').getTime();
      return t >= timelineActiveRange[0] && t <= timelineActiveRange[1];
    })();
    return matchFilter && matchCampaign && matchSearch && matchTimeline;
  }).sort((a,b) => new Date(b.date) - new Date(a.date));

  const exportFields = ['id','title','detail','type','sev','platform','reach','date','source','actor','targets','site'];
  const cleaned = filtered.map(inc => {
    const o = {};
    exportFields.forEach(f => { if (inc[f] !== undefined) o[f] = inc[f]; });
    o.actor_resolved = inc._actor;
    o.targets_resolved = inc._targets;
    return o;
  });

  let blob, filename;
  const dateStamp = new Date().toISOString().slice(0,10);
  if (format === 'json') {
    blob = new Blob([JSON.stringify(cleaned, null, 2)], { type: 'application/json' });
    filename = `pakistan-iw-tracker-export-${dateStamp}.json`;
  } else {
    const headers = ['id','date','type','sev','title','actor','source','platform','reach'];
    const rows = [headers.join(',')];
    cleaned.forEach(o => {
      rows.push(headers.map(h => {
        let v = h === 'actor' ? o.actor_resolved : (o[h] ?? '');
        v = String(v).replace(/"/g,'""');
        return `"${v}"`;
      }).join(','));
    });
    blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    filename = `pakistan-iw-tracker-export-${dateStamp}.csv`;
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast(`Exported ${cleaned.length} incident(s) as ${format.toUpperCase()}`);
}

