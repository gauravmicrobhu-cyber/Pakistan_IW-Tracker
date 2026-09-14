import { describe, it, expect } from 'vitest';
import { enrichIncident } from '../enrichIncident.js';

function base(overrides = {}) {
  return {
    id: 1,
    title: 'Untitled incident',
    detail: '',
    type: 'social',
    source: '',
    ...overrides,
  };
}

describe('enrichIncident — source tier classification', () => {
  it('classifies a PIB-sourced incident as tier "gov"', () => {
    const inc = enrichIncident(base({ source: 'PIB Fact Check' }));
    expect(inc._tier).toBe('gov');
  });

  it('classifies a RAND Corporation source as tier "thinktank"', () => {
    const inc = enrichIncident(base({ source: 'RAND Corporation report' }));
    expect(inc._tier).toBe('thinktank');
  });

  it('classifies a BBC source as tier "media"', () => {
    const inc = enrichIncident(base({ source: 'BBC Monitoring' }));
    expect(inc._tier).toBe('media');
  });

  it('classifies an unrecognised source as tier "other"', () => {
    const inc = enrichIncident(base({ source: 'Some Random Blog' }));
    expect(inc._tier).toBe('other');
  });
});

describe('enrichIncident — attribution confidence classification', () => {
  it('classifies a detail containing "chargesheet" as confirmed', () => {
    const inc = enrichIncident(base({ source: 'Local Times', detail: 'The SIA filed a chargesheet against the accused.' }));
    expect(inc._confidence).toBe('confirmed');
  });

  it('classifies a detail with disputed-hedging language as disputed', () => {
    const inc = enrichIncident(base({ source: 'Local Times', detail: 'The claim was found to be largely unsubstantiated by investigators.' }));
    expect(inc._confidence).toBe('disputed');
  });

  it('classifies a detail with alleged-hedging language as alleged', () => {
    const inc = enrichIncident(base({ source: 'Local Times', detail: 'This was not independently confirmed by other outlets.' }));
    expect(inc._confidence).toBe('alleged');
  });

  it('classifies a detail with no hedging language and a single outlet as likely', () => {
    const inc = enrichIncident(base({ source: 'Local Times', detail: 'A plain factual account with no hedging language at all.' }));
    expect(inc._confidence).toBe('likely');
  });

  it('classifies as confirmed when 3+ outlets are cited in the source field, even without confirming keywords', () => {
    const inc = enrichIncident(base({ source: 'Outlet A / Outlet B / Outlet C', detail: 'A plain factual account.' }));
    expect(inc._confidence).toBe('confirmed');
  });

  it('disputed language takes priority over a 3+ outlet count', () => {
    const inc = enrichIncident(base({
      source: 'Outlet A / Outlet B / Outlet C',
      detail: 'Investigators found this exaggerated and largely unsubstantiated.',
    }));
    expect(inc._confidence).toBe('disputed');
  });
});

describe('enrichIncident — targets', () => {
  it('preserves an explicit non-empty targets array as-is', () => {
    const inc = enrichIncident(base({ targets: ['goi'] }));
    expect(inc._targets).toEqual(['goi']);
  });

  it('infers targets from keywords in the incident text when none are explicit', () => {
    const inc = enrichIncident(base({ title: 'Disinformation targeting Kashmir', targets: [] }));
    expect(inc._targets).toContain('kashmir');
  });

  it('falls back to panindia_target when nothing matches and no explicit targets', () => {
    const inc = enrichIncident(base({ title: 'A generic incident', detail: '', targets: [] }));
    expect(inc._targets).toEqual(['panindia_target']);
  });
});

describe('enrichIncident — actor attribution', () => {
  it('preserves an explicit, non-empty actor string, trimmed', () => {
    const inc = enrichIncident(base({ actor: '  Custom Actor  ' }));
    expect(inc._actor).toBe('Custom Actor');
  });

  it('infers a known actor from the incident text via keyword/regex match', () => {
    const inc = enrichIncident(base({ title: 'ISPR issues a statement', actor: '' }));
    expect(inc._actor).toBe('ISPR');
  });

  it('falls back to "Unattributed / crowd-sourced" when nothing matches', () => {
    const inc = enrichIncident(base({ title: 'A generic incident', actor: '' }));
    expect(inc._actor).toBe('Unattributed / crowd-sourced');
  });
});

describe('enrichIncident — geography', () => {
  it('includes "pakistan" as the origin for a non-response incident', () => {
    const inc = enrichIncident(base({ type: 'social', title: 'generic' }));
    expect(inc._geo).toContain('pakistan');
  });

  it('excludes "pakistan" as origin for a response-type incident', () => {
    const inc = enrichIncident(base({ type: 'response', title: 'CERT-In advisory issued' }));
    expect(inc._geo).not.toContain('pakistan');
  });

  it('detects a matched destination region from the text', () => {
    const inc = enrichIncident(base({ title: 'Disinformation about Kashmir unrest' }));
    expect(inc._geo).toContain('kashmir');
  });

  it('falls back to panindia when no region keyword matches', () => {
    const inc = enrichIncident(base({ title: 'A generic incident with no geography hints' }));
    expect(inc._geo).toContain('panindia');
  });
});

describe('enrichIncident — cyber-attack target sites', () => {
  it('honors an explicit inc.site field regardless of type', () => {
    const inc = enrichIncident(base({ site: 'banking', type: 'social' }));
    expect(inc._sites).toEqual(['banking']);
  });

  it('infers a site from keywords only for cyber-type incidents', () => {
    const inc = enrichIncident(base({ type: 'cyber', title: 'Attack on the power grid SCADA systems' }));
    expect(inc._sites).toContain('powergrid');
  });

  it('does not infer a site for a non-cyber incident even if keywords are present', () => {
    const inc = enrichIncident(base({ type: 'social', title: 'A story mentioning the power grid in passing' }));
    expect(inc._sites).toEqual([]);
  });
});

describe('enrichIncident — campaign classification integration', () => {
  it('sets _campaign via classifyCampaign', () => {
    const inc = enrichIncident(base({ title: 'Operation Sindoor disinformation wave' }));
    expect(inc._campaign).toBe('sindoor');
  });

  it('defaults to "ongoing" when nothing matches', () => {
    const inc = enrichIncident(base({ title: 'A generic incident', date: undefined }));
    expect(inc._campaign).toBe('ongoing');
  });
});

describe('enrichIncident — return value', () => {
  it('mutates and returns the same incident object', () => {
    const inc = base();
    const result = enrichIncident(inc);
    expect(result).toBe(inc);
  });
});
