import { isPakistanSignal } from '../logic/signals.js';
import { formatGdeltDate } from '../logic/dates.js';

export let gdeltRefreshTimer = null;

export let gdeltLastRequestAt = 0;

export const GDELT_MIN_INTERVAL_MS = 6000;


export async function runGdeltSearch(userTriggered) {
  const query = document.getElementById('gdeltQuery').value.trim();
  const resultsHost = document.getElementById('gdeltResults');
  const searchBtn = document.getElementById('gdeltSearchBtn');
  if (!query) return;

  const sinceLast = Date.now() - gdeltLastRequestAt;
  if (sinceLast < GDELT_MIN_INTERVAL_MS) {
    const waitSec = Math.ceil((GDELT_MIN_INTERVAL_MS - sinceLast) / 1000);
    if (userTriggered) {
      resultsHost.innerHTML = `<div class="map-empty">Please wait ${waitSec}s \u2014 GDELT allows at most one request every 5 seconds, and the tracker adds a small safety margin on top of that.</div>`;
    }
    return;
  }
  gdeltLastRequestAt = Date.now();

  if (userTriggered) {
    resultsHost.innerHTML = '<div class="map-empty">Searching…</div>';
    if (searchBtn) { searchBtn.disabled = true; setTimeout(() => { if (searchBtn) searchBtn.disabled = false; }, GDELT_MIN_INTERVAL_MS); }
  }

  try {
    const url = 'https://api.gdeltproject.org/api/v2/doc/doc?query=' + encodeURIComponent(query) +
      '&mode=artlist&format=json&sort=datedesc&maxrecords=60';
    const res = await fetch(url);
    if (!res.ok) throw new Error('HTTP ' + res.status);

    // GDELT returns plain-text warnings (rate-limit notices, malformed-query notices) with a
    // 200 OK status rather than a proper HTTP error, so we read as text first and inspect
    // before parsing — otherwise this surfaces as a confusing "Unexpected token" JSON error.
    const raw = await res.text();
    if (/limit requests|one every 5 seconds/i.test(raw)) {
      throw new Error('RATE_LIMITED');
    }
    let data;
    try {
      data = JSON.parse(raw);
    } catch (parseErr) {
      throw new Error('GDELT rejected the query syntax (returned a non-JSON response). Try simplifying the query — avoid nesting extra parentheses around plain keywords; only wrap OR-groups in parentheses, e.g. "India Pakistan (disinformation OR ISPR)".');
    }

    const articles = data.articles || [];

    document.getElementById('gdeltLastUpdated').textContent = 'Last updated: ' + new Date().toLocaleTimeString('en-IN', { hour12: true }) + ' IST';

    if (!articles.length) {
      resultsHost.innerHTML = '<div class="map-empty">No matching articles in the current GDELT window. Try broadening the query.</div>';
      return;
    }

    resultsHost.innerHTML = articles.map(a => {
      const flagged = isPakistanSignal(a.title) || isPakistanSignal(a.domain);
      const dateStr = a.seendate ? formatGdeltDate(a.seendate) : '';
      return `
        <div class="news-card${flagged ? ' highlighted' : ''}">
          ${a.socialimage ? `<img class="news-thumb" src="${a.socialimage}" loading="lazy" onerror="this.style.display='none'"/>` : ''}
          <div class="news-body">
            <a class="news-title" href="${a.url}" target="_blank" rel="noopener">${a.title || '(untitled)'}</a>
            <div class="news-meta">
              <span>${a.domain || ''}</span>
              <span>${a.sourcecountry || ''}</span>
              <span>${dateStr}</span>
              ${flagged ? '<span class="pk-badge">🇵🇰 Pakistan-linked</span>' : ''}
            </div>
          </div>
        </div>`;
    }).join('');
  } catch (err) {
    const directLink = `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(query)}&mode=artlist&format=html`;
    let diagnosis;
    if (err.message === 'RATE_LIMITED') {
      diagnosis = `GDELT is rate-limiting this source (it allows only 1 request per 5 seconds, sometimes shared across everyone on the same network/IP). This isn't a bug \u2014 it clears on its own; the auto-refresh will retry in a few minutes, or wait a few seconds and press Search again.`;
    } else if (err.message === 'Failed to fetch' || err.message.includes('NetworkError') || err.message.includes('Load failed')) {
      diagnosis = `The request never reached GDELT, and browsers don't expose why for security reasons \u2014 could be an ad-blocker or privacy extension blocking an unfamiliar API domain, a network/firewall restriction, or GDELT's own rate limit dropping CORS headers on a throttled response (indistinguishable from the browser's side). <a href="${directLink}" target="_blank" style="color:var(--teal)">Open this same query directly</a> in a new tab to check.`;
    } else {
      diagnosis = `(${err.message}). <a href="${directLink}" target="_blank" style="color:var(--teal)">Check this query directly on GDELT</a>.`;
    }
    resultsHost.innerHTML = `<div class="map-empty">Live feed unavailable right now. ${diagnosis}</div>`;
  }

  if (gdeltRefreshTimer) clearInterval(gdeltRefreshTimer);
  gdeltRefreshTimer = setInterval(() => runGdeltSearch(false), 3 * 60 * 1000);
}

