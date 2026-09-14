import { seedIncidents } from './data/seedIncidents.js';
import { enrichIncident } from './logic/enrichIncident.js';

export const STORAGE_KEY = 'prism_iw_incidents';

export const VERSION_KEY  = 'prism_iw_seed_version';

export const SEED_VERSION = 18; // bump this whenever the curated seed list below changes


export let incidents = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

export const storedVersion = parseInt(localStorage.getItem(VERSION_KEY) || '0', 10);

export const needsReseed = storedVersion < SEED_VERSION;

// Seed data if empty, OR if the curated seed set has been updated since last visit.
// User-added incidents (logged via the form, not part of the curated seed) are preserved either way.
if (incidents.length === 0 || needsReseed) {
  const userAdded = incidents.filter(i => !i.seed);
  incidents = [...seedIncidents, ...userAdded];
  localStorage.setItem(VERSION_KEY, String(SEED_VERSION));
  saveIncidents();
}

export function saveIncidents() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(incidents));
}

// ── PENDING REVIEW QUEUE ──
// Populated by sourced research pulls, run on request ("run a pull") rather than on a schedule.
// Candidates are checked against the same source-tier + independent-corroboration bar as the main
// registry (see enrichIncident below) before landing here — but they still don't count toward
// incidents, charts, the map, or reach totals until a human promotes them. A pull that can't clear
// the bar for a lead doesn't add a weak entry; it's simply not added, same as declining an
// uncorroborated claim outright (see changelog v17).

export const PENDING_ACTIONED_KEY = 'prism_iw_pending_actioned'; // ids the user has promoted or dismissed

// Log of pull runs — each entry records when a pull ran, what it checked, and what it found.
// Purely informational (shown in the Pending Review banner); doesn't affect data.

export function enrichAll() { incidents.forEach(enrichIncident); }

// ── RENDER ──

export let currentFilter = 'all';

export let currentCampaignFilter = 'all';

export let searchTerm = '';

export let mapRendered = false;

export let networkRendered = false;

export let annotations = {};
try { annotations = JSON.parse(localStorage.getItem('tracker_annotations') || '{}'); } catch(e) { annotations = {}; }


export function getAnnotation(id) { return annotations[id] || {}; }

export function saveAnnotations() { localStorage.setItem('tracker_annotations', JSON.stringify(annotations)); }


export let timelineMinTs = null, timelineTotalDays = 1;

export let timelineActiveRange = null; // [loTs, hiTs] or null = full range (no filtering)



// ── render-lazy flags (moved from top-level MAIN_LET) ──
export let liveRendered = false;

export let newsMonitorRendered = false;

export let connectionsRendered = false;


// ── setters (allow other modules to reassign this module's live bindings) ──
export function setIncidents(v) { incidents = v; }
export function setAnnotations(v) { annotations = v; }
export function setCurrentFilter(v) { currentFilter = v; }
export function setCurrentCampaignFilter(v) { currentCampaignFilter = v; }
export function setSearchTerm(v) { searchTerm = v; }
export function setMapRendered(v) { mapRendered = v; }
export function setNetworkRendered(v) { networkRendered = v; }
export function setLiveRendered(v) { liveRendered = v; }
export function setNewsMonitorRendered(v) { newsMonitorRendered = v; }
export function setConnectionsRendered(v) { connectionsRendered = v; }
export function setTimelineMinTs(v) { timelineMinTs = v; }
export function setTimelineTotalDays(v) { timelineTotalDays = v; }
export function setTimelineActiveRange(v) { timelineActiveRange = v; }
