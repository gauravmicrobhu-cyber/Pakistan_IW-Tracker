import { incidents, currentFilter, setCurrentFilter, currentCampaignFilter, setCurrentCampaignFilter, searchTerm, setSearchTerm } from '../state.js';
import { typeLabels, campaignDefs } from '../data/lookups.js';
import { renderFeed } from './feed.js';
import { jumpToIncident } from './map.js';
import { showToast } from './misc.js';

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


export function syncFilterHighlights() {
  document.querySelectorAll('.threat-row').forEach(el => el.classList.toggle('active-filter', el.dataset.vtype === currentFilter));
  document.querySelectorAll('.vector-item').forEach(el => el.classList.toggle('active-filter', el.dataset.vtype === currentFilter));
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
