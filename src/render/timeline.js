import { incidents, timelineMinTs, setTimelineMinTs, timelineTotalDays, setTimelineTotalDays, setTimelineActiveRange } from '../state.js';
import { dayIdxToDate } from '../logic/dates.js';
import { renderFeed } from './feed.js';

export function initTimelineScrubber() {
  const dates = incidents.map(i => new Date(i.date+'T00:00:00').getTime()).filter(t => !isNaN(t));
  if (!dates.length) return;
  setTimelineMinTs(Math.min(...dates));
  const maxTs = Math.max(...dates);
  setTimelineTotalDays(Math.max(1, Math.round((maxTs - timelineMinTs) / 86400000)));

  const minEl = document.getElementById('tlMin'), maxEl = document.getElementById('tlMax');
  minEl.min = 0; minEl.max = timelineTotalDays; minEl.value = 0;
  maxEl.min = 0; maxEl.max = timelineTotalDays; maxEl.value = timelineTotalDays;
  setTimelineActiveRange(null);
  updateTimelineLabels();
  updateTimelineHighlight();
}


export function updateTimelineLabels() {
  const minEl = document.getElementById('tlMin'), maxEl = document.getElementById('tlMax');
  if (!minEl || !maxEl) return;
  const lo = Math.min(+minEl.value, +maxEl.value), hi = Math.max(+minEl.value, +maxEl.value);
  const fmt = d => d.toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
  document.getElementById('tlRangeLabel').textContent = `${fmt(dayIdxToDate(lo))} — ${fmt(dayIdxToDate(hi))}`;
}


export function updateTimelineHighlight() {
  const minEl = document.getElementById('tlMin'), maxEl = document.getElementById('tlMax');
  if (!minEl || !maxEl) return;
  const lo = Math.min(+minEl.value, +maxEl.value), hi = Math.max(+minEl.value, +maxEl.value);
  const highlight = document.getElementById('tlHighlight');
  highlight.style.left = (lo / timelineTotalDays * 100) + '%';
  highlight.style.width = ((hi - lo) / timelineTotalDays * 100) + '%';
}


export function onTimelineChange() {
  updateTimelineLabels();
  updateTimelineHighlight();
  const minEl = document.getElementById('tlMin'), maxEl = document.getElementById('tlMax');
  const lo = Math.min(+minEl.value, +maxEl.value), hi = Math.max(+minEl.value, +maxEl.value);
  setTimelineActiveRange((lo === 0 && hi === timelineTotalDays) ? null : [dayIdxToDate(lo).getTime(), dayIdxToDate(hi).getTime() + 86400000 - 1]);
  renderFeed();
}


export function resetTimeline() {
  const minEl = document.getElementById('tlMin'), maxEl = document.getElementById('tlMax');
  minEl.value = 0; maxEl.value = timelineTotalDays;
  setTimelineActiveRange(null);
  updateTimelineLabels();
  updateTimelineHighlight();
  renderFeed();
}

// ── CALENDAR HEATMAP ──

export function renderCalendarHeatmap() {
  const host = document.getElementById('calendarHeatmapHost');
  if (!host) return;
  const counts = {};
  incidents.forEach(i => { if (i.date) counts[i.date] = (counts[i.date]||0) + 1; });
  const years = [...new Set(incidents.map(i => i.date ? i.date.slice(0,4) : null).filter(Boolean))].sort();
  const maxCount = Math.max(1, ...Object.values(counts));

  function colorFor(c) {
    if (!c) return 'rgba(255,255,255,0.04)';
    const ratio = c / maxCount;
    if (ratio > 0.75) return '#00f5d4';
    if (ratio > 0.5) return '#0bc7ad';
    if (ratio > 0.25) return '#0a8f7d';
    return '#0a5c50';
  }

  let html = '<div style="overflow-x:auto;">';
  years.forEach(year => {
    const startDate = new Date(year + '-01-01T00:00:00');
    const startDow = startDate.getDay();
    const daysInYear = Math.round((new Date(+year+1, 0, 1) - startDate) / 86400000);
    html += `<div style="margin-bottom:14px;">
      <div style="font-family:var(--mono);font-size:10px;color:var(--text-dim);margin-bottom:6px;">${year}</div>
      <div style="display:grid;grid-auto-flow:column;grid-template-rows:repeat(7,11px);gap:2px;width:max-content;">`;
    for (let i=0; i<startDow; i++) html += `<div style="width:11px;height:11px;"></div>`;
    for (let d=0; d<daysInYear; d++) {
      const dt = new Date(startDate.getTime() + d*86400000);
      const key = dt.toISOString().slice(0,10);
      const c = counts[key] || 0;
      html += `<div title="${key}: ${c} incident(s)" style="width:11px;height:11px;border-radius:2px;background:${colorFor(c)};cursor:${c?'pointer':'default'};" ${c?`onclick="filterFeedByDate('${key}')"`:''}></div>`;
    }
    html += `</div></div>`;
  });
  html += `<div style="display:flex;align-items:center;gap:6px;font-family:var(--mono);font-size:9px;color:var(--text-dim);margin-top:4px;">Less
    <div style="width:11px;height:11px;border-radius:2px;background:rgba(255,255,255,0.04);"></div>
    <div style="width:11px;height:11px;border-radius:2px;background:#0a5c50;"></div>
    <div style="width:11px;height:11px;border-radius:2px;background:#0a8f7d;"></div>
    <div style="width:11px;height:11px;border-radius:2px;background:#0bc7ad;"></div>
    <div style="width:11px;height:11px;border-radius:2px;background:#00f5d4;"></div>
    More</div></div>`;
  host.innerHTML = html;
}


export function filterFeedByDate(dateStr) {
  if (!timelineMinTs) return;
  const idx = Math.round((new Date(dateStr+'T00:00:00').getTime() - timelineMinTs) / 86400000);
  const minEl = document.getElementById('tlMin'), maxEl = document.getElementById('tlMax');
  minEl.value = Math.max(0, idx); maxEl.value = Math.min(timelineTotalDays, idx);
  onTimelineChange();
  document.querySelector('.tab-btn[data-tab="feed"]').click();
}

// ── EXPORT (JSON/CSV) — exports whatever is currently filtered in the Feed ──
