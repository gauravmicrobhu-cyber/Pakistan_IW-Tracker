import { trackedHashtags } from '../data/trackedHashtags.js';
import { initYoutubePanel } from './youtube.js';
import { initFacebookPanel } from './facebook.js';

export let currentHashtag = trackedHashtags[0].tag;


export function initLiveSignals() {
  const pills = document.getElementById('hashtagPills');
  pills.innerHTML = trackedHashtags.map(h =>
    `<button class="pill${h.tag===currentHashtag?' active':''}" data-tag="${h.tag}" onclick="loadHashtag('${h.tag}')">${h.tag}</button>`
  ).join('');
  loadHashtag(currentHashtag);
}


export function loadHashtag(tag) {
  currentHashtag = tag;
  document.querySelectorAll('#hashtagPills .pill').forEach(p => p.classList.toggle('active', p.dataset.tag === tag));

  const def = trackedHashtags.find(h => h.tag === tag);
  const host = document.getElementById('twitterEmbedHost');
  const searchUrl = 'https://twitter.com/search?q=' + encodeURIComponent(def.query) + '&src=typed_query&f=live';

  host.innerHTML = `<a class="twitter-timeline" data-theme="dark" data-height="560" data-chrome="noheader nofooter transparent" href="${searchUrl}">Live tweets: ${tag}</a>`;

  ensureTwitterWidgets(() => {
    window.twttr.widgets.load(host);
  });
}

// ── NEWS MONITOR (GDELT Project — free, key-less, CORS-open public news API) ──
// GDELT enforces a strict server-side limit of 1 request per 5 seconds per source and returns
// a plain-text warning (not a proper HTTP error) when exceeded. We enforce our own client-side
// cooldown well above that floor so the tracker itself can never trigger it.

export function ensureTwitterWidgets(cb, attempts) {
  attempts = attempts || 0;
  if (window.twttr && window.twttr.widgets) { cb(); return; }
  if (attempts > 40) {
    const host = document.getElementById('twitterEmbedHost');
    if (host) host.innerHTML = '<div class="map-empty">Live feed unavailable — X/Twitter\'s embed script did not load (check your connection, or X may be blocked on this network). <a href="'+ 'https://twitter.com/search?q=' + encodeURIComponent(trackedHashtags.find(h=>h.tag===currentHashtag).query) +'&f=live" target="_blank" style="color:var(--teal)">Open this search on X instead →</a></div>';
    return;
  }
  setTimeout(() => ensureTwitterWidgets(cb, attempts + 1), 250);
}

// ── PLATFORM SWITCHER ──

export let currentLivePlatform = 'x';

export let ytInited = false, fbInited = false;


export function switchLivePlatform(p) {
  currentLivePlatform = p;
  document.querySelectorAll('.platform-tab').forEach(b => b.classList.toggle('active', b.dataset.platform === p));
  document.querySelectorAll('.live-platform-panel').forEach(el => el.classList.remove('active'));
  document.getElementById('live-' + p).classList.add('active');
  if (p === 'youtube' && !ytInited) { ytInited = true; initYoutubePanel(); }
  if (p === 'facebook' && !fbInited) { fbInited = true; initFacebookPanel(); }
}

// ── YOUTUBE (verified official Pakistan-linked channels; no key needed for these) ──
// Channel IDs verified via Wikidata / official channel pages.
