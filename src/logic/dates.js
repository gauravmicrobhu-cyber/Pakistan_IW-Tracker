import { timelineMinTs } from '../state.js';

export function dayIdxToDate(idx) { return new Date(timelineMinTs + idx * 86400000); }


export function formatDate(d) {
  if (!d) return '—';
  const dt = new Date(d + 'T00:00:00');
  return dt.toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }).toUpperCase();
}

// ── COMBINED REACH ── parses the free-text `reach` field on each incident (lakh/crore/million/
// billion/thousand, "2.9M" style suffixes, comma-formatted counts) and sums the largest quantifiable
// figure per incident. This is an order-of-magnitude estimate, not a deduplicated unique-audience
// count — different incidents measure different things (views, subscribers, tweets, accounts), and
// the same person may be counted in more than one incident. Incidents with no parseable number
// (e.g. "National broadcast", "Industry-wide") are excluded rather than guessed at.

export function formatGdeltDate(seendate) {
  // GDELT format: YYYYMMDDTHHMMSSZ
  const y = seendate.slice(0,4), mo = seendate.slice(4,6), d = seendate.slice(6,8);
  const h = seendate.slice(9,11), mi = seendate.slice(11,13);
  const dt = new Date(Date.UTC(+y, +mo-1, +d, +h, +mi));
  return dt.toLocaleString('en-IN', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit', hour12:true });
}

