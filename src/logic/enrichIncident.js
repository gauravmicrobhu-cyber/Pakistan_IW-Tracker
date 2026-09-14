import { targetKeywords, geoKeywords, siteDefs, siteKeywords } from '../data/lookups.js';
import { actorKeywords } from '../data/actorKeywords.js';
import { classifyCampaign } from './campaign.js';

export function enrichIncident(inc) {
  const text = `${inc.title||''} ${inc.detail||''} ${inc.platform||''} ${inc.source||''}`.toLowerCase();

  // Targets
  if (Array.isArray(inc.targets) && inc.targets.length) {
    inc._targets = inc.targets;
  } else {
    const found = Object.keys(targetKeywords).filter(k => targetKeywords[k].some(kw => text.includes(kw)));
    inc._targets = found.length ? found : ['panindia_target'];
  }

  // Actor
  if (inc.actor && inc.actor.trim()) {
    inc._actor = inc.actor.trim();
  } else {
    const match = actorKeywords.find(([,re]) => re.test(text));
    inc._actor = match ? match[0] : 'Unattributed / crowd-sourced';
  }

  // Geography — always includes Pakistan as origin, plus any matched destination(s).
  // Exception: "response" incidents are India's own countermeasures, not Pakistan-attributed
  // actions — they get no Pakistan-origin arc on the Regional Map, since that view specifically
  // models Pakistan→India flow and a response incident has no such origin.
  const geoHits = Object.keys(geoKeywords).filter(k => geoKeywords[k].some(kw => text.includes(kw)));
  inc._geo = inc.type === 'response'
    ? (geoHits.length ? geoHits : ['panindia'])
    : ['pakistan', ...(geoHits.length ? geoHits : ['panindia'])];

  // Cyber-attack target site(s) — specific victim sector/institution, explicit inc.site always
  // wins; automatic keyword-inference is restricted to cyber-type incidents only, since a
  // non-cyber incident merely mentioning a bank/university (e.g. a stock-correlation study
  // citing "HDFC Bank" as a ticker) isn't a cyber-attack target and shouldn't render as one.
  if (inc.site && siteDefs[inc.site]) {
    inc._sites = [inc.site];
  } else if (inc.type === 'cyber') {
    inc._sites = Object.keys(siteKeywords).filter(k => siteKeywords[k].some(kw => text.includes(kw)));
  } else {
    inc._sites = [];
  }

  // Source-reliability tier — classified from the source string itself, checked in order of
  // authority (government/primary docs > academic journals > think-tank/research firms > press
  // > self-sourced), so a source citing multiple names resolves to its most authoritative element.
  const srcText = (inc.source || '').toLowerCase();
  const tierChecks = [
    ['gov', ['pib', 'mib', 'ministry of information', 'cert-in', 'meity', 'government of india', 'government of pakistan', 'ispr', 'radio pakistan', 'x global affairs', 'foreign secretary', 'mea ', 'newsonair', 'moneycontrol reporting']],
    ['academic', ['ijfmr', 'iieta', 'sage open', 'working paper', 'journal', 'pardee rand graduate school']],
    ['thinktank', ['rand corporation', 'mp-idsa', 'idsa', 'ncri', 'graphika', 'blackbird.ai', 'cloudsek', 'sekoia', 'zscaler', 'csis', 'stanford internet observatory', 'dfrlab', 'trend micro', 'securityweek', 'infosecurity magazine', 'maharashtra cyber']],
    ['media', ['bbc', 'pti', 'tribune', 'zee news', 'deccan herald', 'ndtv', 'new indian express', 'wion', 'daily times', 'the nation', 'usc center', 'malaymail', 'gulf news', 'hindustan times', 'the wire', 'siasat', 'the diplomatic insight', 'boom', 'factly', 'fact crescendo', 'newschecker', 'alt news', 'the quint', 'webqoof']],
    ['self', ['prism', 'unverified', 'unattributed']]
  ];
  const tierMatch = tierChecks.find(([, kws]) => kws.some(kw => srcText.includes(kw)));
  inc._tier = tierMatch ? tierMatch[0] : 'other';

  // Attribution confidence — DISTINCT from source tier above. Tier says how credible the
  // source is; this says how confident the specific attribution/claim is. Classified from the
  // hedging language actually written into each entry's detail field during verification this
  // session, not hand-guessed after the fact — so it reflects real provenance.
  const detText = (inc.detail || '').toLowerCase();
  const disputedKw = ['unsubstantiated', 'exaggerated', 'largely unsubstantiated', 'overblown', 'no evidence', 'minimal actual impact', 'not fully executed as claimed', 'fabricated or entirely misattributed', 'traced to previously-leaked', 'flagged for review', 'not substantiated by the nature', 'inconsistencies'];
  const allegedKw = ['not independently confirmed', 'not independently corroborated', 'single wire report', 'anonymous intelligence official', 'advocacy-oriented', 'attributed to a single secondary source', 'treat as a reported claim', 'could not be independently corroborated beyond a single', 'unverified claims', 'self-proclaimed'];
  const confirmedKw = ['chargesheet', 'sia filed', 'filed a chargesheet', 'meta announced', 'facebook said', 'twitter suspended', 'mea briefing', 'pib fact check confirmed', 'foreign secretary', 'government of pakistan officially', 'court', 'jk police', 'j&k police', 'official statement', 'press conference'];
  const outletCount = (inc.source || '').split('/').length;

  if (disputedKw.some(kw => detText.includes(kw))) {
    inc._confidence = 'disputed';
  } else if (allegedKw.some(kw => detText.includes(kw))) {
    inc._confidence = 'alleged';
  } else if (outletCount >= 3 || confirmedKw.some(kw => detText.includes(kw))) {
    inc._confidence = 'confirmed';
  } else {
    inc._confidence = 'likely';
  }

  // Campaign — which named crisis window this incident belongs to (see classifyCampaign above).
  inc._campaign = classifyCampaign(inc, text);

  return inc;
}

