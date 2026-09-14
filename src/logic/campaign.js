import { campaignDefs } from '../data/lookups.js';
import { campaignChecks } from '../data/campaignChecks.js';

export function classifyCampaign(inc, text) {
  if (inc.campaign && campaignDefs[inc.campaign]) return inc.campaign;
  const kwMatch = campaignChecks.find(([, kws]) => kws.some(kw => text.includes(kw)));
  if (kwMatch) return kwMatch[0];
  if (inc.date) {
    const t = new Date(inc.date + 'T00:00:00').getTime();
    const hit = Object.entries(campaignDefs).find(([, def]) => def.range &&
      t >= new Date(def.range[0]+'T00:00:00').getTime() && t <= new Date(def.range[1]+'T00:00:00').getTime());
    if (hit) return hit[0];
  }
  return 'ongoing';
}

