// ── ENTRY POINT ──
// Imports every module, runs the original top-level initialization code (event listeners,
// initial render calls, clock interval, etc.), and exposes every function referenced from an
// inline onclick/onchange/oninput attribute (in index.html or in a template-literal string
// built by a render function) onto `window`, since those attributes resolve names against the
// global scope, not against this module's local bindings.

import {
  enrichAll,
  mapRendered, setMapRendered,
  networkRendered, setNetworkRendered,
  liveRendered, setLiveRendered,
  newsMonitorRendered, setNewsMonitorRendered,
  connectionsRendered, setConnectionsRendered,
  setCurrentFilter, setCurrentCampaignFilter, setSearchTerm,
} from './state.js';

import { renderFeed, addIncident, analyseCard, citeIncident, copyDeepLink, deleteIncident, saveNote, toggleFlag, toggleNoteBox } from './render/feed.js';
import { renderMap, leafletMapInstance, jumpToIncident } from './render/map.js';
import { renderNetwork, resetNetworkSelection } from './render/network.js';
import { renderConnections } from './render/connections.js';
import { renderPending, promotePending, dismissPending } from './render/pending.js';
import {
  initTimelineScrubber, onTimelineChange, resetTimeline, filterFeedByDate,
} from './render/timeline.js';
import { openActorDossier, closeActorDossier, clearGlobalActorFocus } from './render/actorDossier.js';
import {
  openChangelog, closeChangelog, openMethodology, closeMethodology,
  openSystemStatus, closeSystemStatus, openCmdPalette, closeCmdPalette,
  runCmdPaletteSearch, cmdPaletteActiveIdx, setCmdPaletteActiveIdx,
} from './render/modals.js';
import {
  setCampaignFilter, filterByVector, syncFilterHighlights, syncURLState,
  restoreURLState, copyFilteredViewLink, jumpToIncidentFromURL,
} from './render/filters.js';
import { backupUserData, restoreUserData, updateBackupBanner } from './render/backup.js';
import { exportData } from './render/export.js';
import { updateClock } from './render/misc.js';
import { togglePostureFactor } from './render/analytics.js';

import { initLiveSignals, loadHashtag, switchLivePlatform } from './live/twitter.js';
import { runGdeltSearch } from './live/gdelt.js';
import { loadYtChannel, runYoutubeSearch } from './live/youtube.js';
import { loadFbPage } from './live/facebook.js';

import { analyseForm, applyAiToForm, generateBrief } from './ai.js';

// ── COMMAND PALETTE INPUT + GLOBAL KEYBOARD SHORTCUTS ──

document.getElementById('cmdPaletteInput')?.addEventListener('input', e => runCmdPaletteSearch(e.target.value));


document.addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    const overlay = document.getElementById('cmdPaletteOverlay');
    overlay.classList.contains('show') ? closeCmdPalette() : openCmdPalette();
    return;
  }
  if (e.key === 'Escape') {
    closeCmdPalette();
    closeActorDossier();
    closeChangelog();
    closeMethodology();
    closeSystemStatus();
    return;
  }
  const overlay = document.getElementById('cmdPaletteOverlay');
  if (overlay.classList.contains('show') && window._cmdPaletteItems) {
    const rows = document.querySelectorAll('.cmd-result-row');
    if (e.key === 'ArrowDown') { e.preventDefault(); setCmdPaletteActiveIdx(Math.min(cmdPaletteActiveIdx+1, rows.length-1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setCmdPaletteActiveIdx(Math.max(cmdPaletteActiveIdx-1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); if (cmdPaletteActiveIdx >= 0 && window._cmdPaletteItems[cmdPaletteActiveIdx]) window._cmdPaletteItems[cmdPaletteActiveIdx].action(); return; }
    else return;
    rows.forEach((r,i) => r.classList.toggle('kbd-active', i === cmdPaletteActiveIdx));
    rows[cmdPaletteActiveIdx]?.scrollIntoView({ block: 'nearest' });
  }
});

// ── TIMELINE SCRUBBER ──

document.querySelectorAll('.pill:not(.pill-campaign)').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.pill:not(.pill-campaign)').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    setCurrentFilter(btn.dataset.filter);
    renderFeed();
    syncFilterHighlights();
    syncURLState();
  });
});


document.querySelectorAll('.pill-campaign').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.pill-campaign').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    setCurrentCampaignFilter(btn.dataset.campaign);
    renderFeed();
    syncURLState();
  });
});


document.getElementById('searchBox').addEventListener('input', e => {
  setSearchTerm(e.target.value.toLowerCase().trim());
  renderFeed();
  syncURLState();
});

// ── URL-ENCODED VIEW STATE ── mirrors the tab/type/campaign/search filters into the URL
// query string (no page reload — history.replaceState) so a specific filtered view is a
// shareable, citable link, the same way map layer selections are encoded in the address bar
// on comparable OSINT dashboards. Restored on load by restoreURLState().

setInterval(updateClock, 1000);
updateClock();

// ── SET DEFAULT DATE ──

document.getElementById('f-date').value = new Date().toISOString().slice(0,10);

// ── TAB SWITCHING ──

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-'+btn.dataset.tab).classList.add('active');
    if (btn.dataset.tab === 'map') {
      if (!mapRendered) { renderMap(); setMapRendered(true); }
      else setTimeout(() => { if (leafletMapInstance) leafletMapInstance.invalidateSize(); }, 50);
    }
    if (btn.dataset.tab === 'network' && !networkRendered) { renderNetwork(); setNetworkRendered(true); }
    if (btn.dataset.tab === 'live' && !liveRendered) { initLiveSignals(); setLiveRendered(true); }
    if (btn.dataset.tab === 'newsmonitor' && !newsMonitorRendered) { runGdeltSearch(); setNewsMonitorRendered(true); }
    if (btn.dataset.tab === 'connections' && !connectionsRendered) { renderConnections(); setConnectionsRendered(true); }
    if (btn.dataset.tab === 'pending') { renderPending(); }
    syncURLState();
  });
});

// ── INIT ──
enrichAll();
initTimelineScrubber();
renderFeed();
renderPending();
restoreURLState();
jumpToIncidentFromURL();
updateBackupBanner();
// Auto-generate brief after short delay
setTimeout(generateBrief, 800);

// ── GLOBAL EXPOSURE ── every function referenced from an inline onclick/onchange/oninput
// attribute (in index.html itself, or in a template-literal string a render function builds)
// must live on `window`, since those attributes are resolved against the global scope.
window.addIncident = addIncident;
window.analyseCard = analyseCard;
window.analyseForm = analyseForm;
window.applyAiToForm = applyAiToForm;
window.backupUserData = backupUserData;
window.citeIncident = citeIncident;
window.clearGlobalActorFocus = clearGlobalActorFocus;
window.closeActorDossier = closeActorDossier;
window.closeChangelog = closeChangelog;
window.closeCmdPalette = closeCmdPalette;
window.closeMethodology = closeMethodology;
window.closeSystemStatus = closeSystemStatus;
window.copyDeepLink = copyDeepLink;
window.copyFilteredViewLink = copyFilteredViewLink;
window.deleteIncident = deleteIncident;
window.dismissPending = dismissPending;
window.exportData = exportData;
window.filterByVector = filterByVector;
window.filterFeedByDate = filterFeedByDate;
window.generateBrief = generateBrief;
window.jumpToIncident = jumpToIncident;
window.loadFbPage = loadFbPage;
window.loadHashtag = loadHashtag;
window.loadYtChannel = loadYtChannel;
window.onTimelineChange = onTimelineChange;
window.openActorDossier = openActorDossier;
window.openChangelog = openChangelog;
window.openMethodology = openMethodology;
window.openSystemStatus = openSystemStatus;
window.promotePending = promotePending;
window.resetNetworkSelection = resetNetworkSelection;
window.resetTimeline = resetTimeline;
window.restoreUserData = restoreUserData;
window.runGdeltSearch = runGdeltSearch;
window.runYoutubeSearch = runYoutubeSearch;
window.saveNote = saveNote;
window.setCampaignFilter = setCampaignFilter;
window.switchLivePlatform = switchLivePlatform;
window.toggleFlag = toggleFlag;
window.toggleNoteBox = toggleNoteBox;
window.togglePostureFactor = togglePostureFactor;
