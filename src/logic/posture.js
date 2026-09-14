import { incidents } from '../state.js';
import { computeCampaignIndex } from '../render/analytics.js';
import { postureFactorState } from '../render/analytics.js';

export function computeNationalPosture() {
  const threatIncidents = incidents.filter(i => i.type !== 'response');
  const respCount = incidents.filter(i => i.type === 'response').length;
  const campaignRows = computeCampaignIndex();

  // 1. Intensity: volume-weighted mean of the existing per-campaign composites
  const totalVol = campaignRows.reduce((s, r) => s + r.vol, 0);
  const intensity = totalVol
    ? Math.round(campaignRows.reduce((s, r) => s + r.composite * r.vol, 0) / totalVol)
    : 0;

  // 2. Recency: share of threat incidents logged in the last 30 days
  const now = new Date();
  const cutoff = new Date(now); cutoff.setDate(cutoff.getDate() - 30);
  const recentCount = threatIncidents.filter(i => new Date(i.date) >= cutoff).length;
  const recency = threatIncidents.length ? Math.round((recentCount / threatIncidents.length) * 100) : 0;

  // 3. Severity: share of threat incidents rated critical
  const criticalCount = threatIncidents.filter(i => i.sev === 'critical').length;
  const severity = threatIncidents.length ? Math.round((criticalCount / threatIncidents.length) * 100) : 0;

  // 4. Response gap: fewer logged Indian-response entries relative to threat volume
  //    = a bigger gap = a higher (worse) contribution to the score.
  //    Scaling is illustrative: a 25%+ response-to-threat ratio is treated as full coverage.
  const responseRatio = threatIncidents.length ? respCount / threatIncidents.length : 0;
  const coverage = Math.min(100, Math.round(responseRatio * 400));
  const responseGap = 100 - coverage;

  const factors = [
    { id: 'intensity', label: 'Campaign Intensity', val: intensity, color: 'var(--accent2)' },
    { id: 'recency',   label: '30-Day Recency',     val: recency,   color: 'var(--teal)' },
    { id: 'severity',  label: 'Critical-Sev Share',  val: severity,  color: 'var(--accent)' },
    { id: 'response',  label: 'Response Gap',        val: responseGap, color: 'var(--blue)' },
  ];

  const active = factors.filter(f => postureFactorState[f.id]);
  const composite = active.length
    ? Math.round(active.reduce((s, f) => s + f.val, 0) / active.length)
    : 0;

  return { factors, composite };
}


export function statusForPosture(score) {
  if (score >= 70) return { label: 'CRITICAL', cls: 'critical' };
  if (score >= 40) return { label: 'ELEVATED', cls: 'elevated' };
  return { label: 'GUARDED', cls: 'guarded' };
}

