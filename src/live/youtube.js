import { pakYoutubeChannels } from '../data/pakYoutubeChannels.js';
import { isPakistanSignal } from '../logic/signals.js';
import { formatDate } from '../logic/dates.js';

export let currentYtChannel = pakYoutubeChannels[0].channelId;


export function initYoutubePanel() {
  const pills = document.getElementById('ytChannelPills');
  pills.innerHTML = pakYoutubeChannels.map(c =>
    `<button class="pill${c.channelId===currentYtChannel?' active':''}" data-cid="${c.channelId}" onclick="loadYtChannel('${c.channelId}')">${c.name}</button>`
  ).join('');
  loadYtChannel(currentYtChannel);

  const savedKey = localStorage.getItem('yt_api_key');
  if (savedKey) document.getElementById('ytApiKey').value = savedKey;
}


export function loadYtChannel(channelId) {
  currentYtChannel = channelId;
  document.querySelectorAll('#ytChannelPills .pill').forEach(p => p.classList.toggle('active', p.dataset.cid === channelId));
  const c = pakYoutubeChannels.find(x => x.channelId === channelId);
  const uploadsPlaylist = 'UU' + channelId.slice(2); // YouTube convention: uploads playlist = channel ID with UC → UU
  const host = document.getElementById('ytEmbedHost');
  host.innerHTML = `
    <div class="pk-badge" style="margin-bottom:8px;">🇵🇰 Verified Pakistan-linked source — ${c.note}</div>
    <iframe width="100%" height="400" style="border:1px solid var(--border);border-radius:4px;"
      src="https://www.youtube.com/embed/videoseries?list=${uploadsPlaylist}"
      title="${c.name} live uploads" frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen></iframe>`;
}


export async function runYoutubeSearch() {
  const key = document.getElementById('ytApiKey').value.trim();
  const query = document.getElementById('ytSearchQuery').value.trim() || 'Pakistan';
  const resultsHost = document.getElementById('ytSearchResults');
  if (!key) {
    resultsHost.innerHTML = '<div class="map-empty">Paste a YouTube Data API v3 key above to enable keyword search across all of YouTube (free tier: console.cloud.google.com). Without a key you\'ll only see the verified channel feeds above.</div>';
    return;
  }
  localStorage.setItem('yt_api_key', key);
  resultsHost.innerHTML = '<div class="map-empty">Searching…</div>';
  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&order=date&maxResults=24&q=${encodeURIComponent(query)}&key=${encodeURIComponent(key)}`;
    const res = await fetch(url);
    if (!res.ok) {
      const errBody = await res.json().catch(()=>({}));
      throw new Error(errBody?.error?.message || `HTTP ${res.status}`);
    }
    const data = await res.json();
    const items = data.items || [];
    if (!items.length) { resultsHost.innerHTML = '<div class="map-empty">No results.</div>'; return; }

    resultsHost.innerHTML = items.map(it => {
      const sn = it.snippet;
      const flagged = isPakistanSignal(sn.channelTitle) || isPakistanSignal(sn.title) || isPakistanSignal(sn.description);
      const vidUrl = `https://www.youtube.com/watch?v=${it.id.videoId}`;
      return `
        <a href="${vidUrl}" target="_blank" class="yt-card${flagged?' highlighted':''}" style="text-decoration:none;color:inherit;display:block;">
          <img src="${sn.thumbnails?.medium?.url || sn.thumbnails?.default?.url}" loading="lazy"/>
          <div class="yt-card-body">
            <div class="yt-card-title">${sn.title}</div>
            <div class="yt-card-meta">${sn.channelTitle} · ${formatDate(sn.publishedAt.slice(0,10))}</div>
            ${flagged ? '<div class="pk-badge">🇵🇰 Pakistan-linked</div>' : ''}
          </div>
        </a>`;
    }).join('');
  } catch (err) {
    resultsHost.innerHTML = `<div class="map-empty">Search failed: ${err.message}. Check your API key and that the YouTube Data API v3 is enabled on it.</div>`;
  }
}

// ── FACEBOOK (verified official Pakistan-linked Pages via Facebook's own Page Plugin embed) ──
// Page URLs verified via official page listings; Graph API access-token search is not feasible key-less.
