import { pakFacebookPages } from '../data/pakFacebookPages.js';

export let currentFbPage = pakFacebookPages[0].url;


export function initFacebookPanel() {
  const pills = document.getElementById('fbPagePills');
  pills.innerHTML = pakFacebookPages.map(p =>
    `<button class="pill${p.url===currentFbPage?' active':''}" data-url="${p.url}" onclick="loadFbPage('${p.url}')">${p.name}</button>`
  ).join('');
  loadFbPage(currentFbPage);
}


export function loadFbPage(url) {
  currentFbPage = url;
  document.querySelectorAll('#fbPagePills .pill').forEach(p => p.classList.toggle('active', p.dataset.url === url));
  const p = pakFacebookPages.find(x => x.url === url);
  const host = document.getElementById('fbEmbedHost');
  const embedSrc = `https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(url)}&tabs=timeline&width=560&height=560&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=false`;
  host.innerHTML = `
    <div class="pk-badge" style="margin-bottom:8px;">🇵🇰 Verified Pakistan-linked source — ${p.note}</div>
    <div class="fb-frame-wrap">
      <iframe src="${embedSrc}" width="560" height="560" style="border:none;overflow:hidden;" scrolling="no" frameborder="0" allowfullscreen="true"
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>
    </div>`;
}

// ── CONNECTIONS: temporal clustering, recurring actors/sources, platform overlap, cross-mentions ──
// Computed live from whatever is in `incidents` right now — seed data plus anything logged in this browser.
