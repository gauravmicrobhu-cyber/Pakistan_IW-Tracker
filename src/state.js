import { seedIncidents } from './data/seedIncidents.js';
import communityIncidentsRaw from './data/communityIncidents.json';
import { enrichIncident } from './logic/enrichIncident.js';

export const STORAGE_KEY = 'prism_iw_incidents';

export const VERSION_KEY  = 'prism_iw_seed_version';

export const SEED_VERSION = 18; // bump this whenever the curated seed list below changes

// ── COMMUNITY INCIDENTS ── approved via the public GitOps submission pipeline (Log Incident
// form → Cloudflare Worker → GitHub Issue → human `approved` label → Actions workflow appends
// to this file and pushes to main). Static, build-time/deploy-time data refreshed on every
// deploy — like seedIncidents, it is never cached in or read from localStorage (see
// saveIncidents() below, which strips it back out before persisting). `community: true`
// distinguishes it from both the curated seed set and any genuinely local/personal incidents a
// user's browser still holds from before this pipeline existed.
export const communityIncidents = communityIncidentsRaw.map(i => ({ ...i, seed: false, community: true }));


export let incidents = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

export const storedVersion = parseInt(localStorage.getItem(VERSION_KEY) || '0', 10);

export const needsReseed = storedVersion < SEED_VERSION;

// Seed data if empty, OR if the curated seed set has been updated since last visit.
// User-added incidents (logged via the form, not part of the curated seed) are preserved either way.
// Community incidents are NOT persisted here — see the unconditional merge below.
if (incidents.length === 0 || needsReseed) {
  const userAdded = incidents.filter(i => !i.seed && !i.community);
  incidents = [...seedIncidents, ...userAdded];
  localStorage.setItem(VERSION_KEY, String(SEED_VERSION));
  saveIncidents();
}

// Community incidents are merged in on every load, unconditionally — not gated behind the
// seed-reseed-version check above, since they're refreshed by every deploy rather than versioned
// the way the curated seed set is.
incidents = [...incidents.filter(i => !i.community), ...communityIncidents];

export function saveIncidents() {
  // Community incidents are build-time data (this file, refreshed each deploy) — never written
  // back to localStorage, so a stale locally-cached copy can never shadow a newer deployed one.
  localStorage.setItem(STORAGE_KEY, JSON.stringify(incidents.filter(i => !i.community)));
}

// ── PENDING REVIEW QUEUE ──
// The live queue is now sourced from open GitHub Issues labeled `submission:pending` (see
// src/render/pending.js), fetched client-side from GitHub's public REST API — there is no more
// localStorage-based promote/dismiss state to track here; moderation happens on GitHub via
// issue labels (`approved`/`declined`), handled by .github/workflows/promote-submission.yml.
// pendingSeed/pullLog (src/data/) remain as a read-only historical record of research pulls run
// before that pipeline existed — informational only, shown in the Pending Review tab's "Past
// Research Pulls" section.

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
