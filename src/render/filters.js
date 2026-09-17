import { incidents, currentFilter, setCurrentFilter, currentCampaignFilter, setCurrentCampaignFilter, searchTerm, setSearchTerm, timelineActiveRange, getFilteredIncidents } from '../state.js';
import { typeLabels, campaignDefs } from '../data/lookups.js';
import { renderFeed } from './feed.js';
import { jumpToIncident } from './map.js';
import { showToast } from './misc.js';
import { resetTimeline } from './timeline.js';

export function jumpToIncidentFromURL() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('incident');
  if (!id) return;
  const inc = incidents.find(i => String(i.id) === String(id));
  if (!inc) return;
  setTimeout(() => jumpToIncident(inc.id), 300);
}

// ── ACTOR DOSSIER ──
// ── LINKED CROSS-VISUALIZATION FOCUS ── clicking an actor anywhere (feed, dossier, network,
// connections map) highlights that same actor across Map/Network/Connections simultaneously.

export function setCampaignFilter(campaign) {
  setCurrentCampaignFilter(campaign || 'all');
  document.querySelectorAll('.pill-campaign').forEach(b => b.classList.toggle('active', b.dataset.campaign === currentCampaignFilter));
  renderFeed();
  syncFilterHighlights();
  syncURLState();
}


export function filterByVector(type) {
  setCurrentFilter((currentFilter === type) ? 'all' : type); // click again to clear
  document.querySelectorAll('.pill:not(.pill-campaign)').forEach(b => b.classList.toggle('active', b.dataset.filter === currentFilter));
  renderFeed();
  syncFilterHighlights();
  syncURLState();
  document.getElementById('incidentFeed').scrollIntoView({ behavior: 'smooth', block: 'start' });
}


// ── SHARED FILTER BAR (Map / Linkage Network / Connections tabs) ── a compact type+campaign
// dropdown pair, identical on all three tabs, bound to the same global filter state the Feed's
// pill bar uses. A dropdown's onchange always fires with a definite value (never "toggle back to
// all" the way a re-clicked pill does), so this needs its own setter rather than reusing
// filterByVector()'s toggle semantics.

export function setTypeFilter(type) {
  setCurrentFilter(type || 'all');
  document.querySelectorAll('.pill:not(.pill-campaign)').forEach(b => b.classList.toggle('active', b.dataset.filter === currentFilter));
  renderFeed();
  syncFilterHighlights();
  syncURLState();
}


export function resetAllFilters() {
  setCurrentFilter('all');
  setCurrentCampaignFilter('all');
  setSearchTerm('');
  document.querySelectorAll('.pill:not(.pill-campaign)').forEach(b => b.classList.toggle('active', b.dataset.filter === 'all'));
  document.querySelectorAll('.pill-campaign').forEach(b => b.classList.toggle('active', b.dataset.campaign === 'all'));
  const box = document.getElementById('searchBox');
  if (box) box.value = '';
  resetTimeline(); // also calls renderFeed()
  syncFilterHighlights();
  syncURLState();
}


export function syncFilterHighlights() {
  document.querySelectorAll('.threat-row').forEach(el => el.classList.toggle('active-filter', el.dataset.vtype === currentFilter));
  document.querySelectorAll('.vector-item').forEach(el => el.classList.toggle('active-filter', el.dataset.vtype === currentFilter));
  syncSharedFilterBarUI();
}


function syncSharedFilterBarUI() {
  document.querySelectorAll('.js-type-filter-select').forEach(el => { el.value = currentFilter; });
  document.querySelectorAll('.js-campaign-filter-select').forEach(el => { el.value = currentCampaignFilter; });
  const total = incidents.length;
  const shown = getFilteredIncidents().length;
  const noFiltersActive = currentFilter === 'all' && currentCampaignFilter === 'all' && !searchTerm && !timelineActiveRange;
  const label = noFiltersActive ? `Showing all ${total} incidents` : `Showing ${shown} of ${total} incidents`;
  document.querySelectorAll('.js-filter-summary').forEach(el => { el.textContent = label; });
}


export let _urlSyncTimer = null;

export function syncURLState() {
  clearTimeout(_urlSyncTimer);
  _urlSyncTimer = setTimeout(() => {
    const url = new URL(window.location.href);
    const activeTab = document.querySelector('.tab-btn.active');
    const tab = activeTab ? activeTab.dataset.tab : 'feed';
    const setOrDelete = (key, val, def) => { if (val && val !== def) url.searchParams.set(key, val); else url.searchParams.delete(key); };
    setOrDelete('tab', tab, 'feed');
    setOrDelete('type', currentFilter, 'all');
    setOrDelete('campaign', currentCampaignFilter, 'all');
    setOrDelete('q', searchTerm, '');
    if (url.searchParams.has('incident')) url.searchParams.delete('incident'); // per-incident links are separate from view-state links
    history.replaceState(null, '', url.toString());
  }, 200);
}


export function restoreURLState() {
  const params = new URLSearchParams(window.location.search);
  const tab = params.get('tab');
  const type = params.get('type');
  const campaign = params.get('campaign');
  const q = params.get('q');

  if (type && (typeLabels[type] || type === 'response')) {
    setCurrentFilter(type);
    document.querySelectorAll('.pill:not(.pill-campaign)').forEach(b => b.classList.toggle('active', b.dataset.filter === type));
  }
  if (campaign && campaignDefs[campaign]) {
    setCurrentCampaignFilter(campaign);
    document.querySelectorAll('.pill-campaign').forEach(b => b.classList.toggle('active', b.dataset.campaign === campaign));
  }
  if (q) {
    setSearchTerm(q.toLowerCase().trim());
    const box = document.getElementById('searchBox');
    if (box) box.value = q;
  }
  if (tab) {
    const btn = document.querySelector(`.tab-btn[data-tab="${tab}"]`);
    if (btn) btn.click();
  }
  renderFeed();
  syncFilterHighlights();
}


export function copyFilteredViewLink() {
  syncURLState();
  setTimeout(() => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      showToast('Filtered view link copied — reopens this exact tab + filter combination');
    }).catch(() => {
      prompt('Copy this link:', window.location.href);
    });
  }, 210);
}

// ── CLOCK ──
