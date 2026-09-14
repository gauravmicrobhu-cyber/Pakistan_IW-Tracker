import { describe, it, expect } from 'vitest';
import { classifyCampaign } from '../campaign.js';

describe('classifyCampaign', () => {
  it('honors an explicit inc.campaign field when it names a known campaign', () => {
    const inc = { campaign: 'pahalgam' };
    expect(classifyCampaign(inc, 'irrelevant text')).toBe('pahalgam');
  });

  it('ignores an explicit inc.campaign field that does not match a known campaign', () => {
    const inc = { campaign: 'not-a-real-campaign', date: null };
    expect(classifyCampaign(inc, 'nothing relevant here')).toBe('ongoing');
  });

  it('matches by keyword when no explicit campaign is set', () => {
    const inc = {};
    expect(classifyCampaign(inc, 'coverage of operation sindoor and the downed jet claims')).toBe('sindoor');
    expect(classifyCampaign(inc, 'fallout from the pahalgam attack')).toBe('pahalgam');
    expect(classifyCampaign(inc, 'the balakot strikes followed pulwama')).toBe('pulwama_balakot');
    expect(classifyCampaign(inc, 'coverage of the article 370 abrogation')).toBe('article370');
  });

  it('checks keyword matches in priority order (pulwama_balakot before article370 etc.)', () => {
    const inc = {};
    // "jem link" is a pulwama_balakot keyword and should win even if nothing else matches
    expect(classifyCampaign(inc, 'a jem link was reported')).toBe('pulwama_balakot');
  });

  it('falls back to date-range membership when no keyword matches', () => {
    const inc = { date: '2019-02-15' }; // inside the pulwama_balakot range
    expect(classifyCampaign(inc, 'a generic incident with no campaign keywords')).toBe('pulwama_balakot');
  });

  it('falls back to "ongoing" when neither keyword nor date-range match', () => {
    const inc = { date: '2010-01-01' };
    expect(classifyCampaign(inc, 'a generic incident with no campaign keywords')).toBe('ongoing');
  });

  it('falls back to "ongoing" when there is no date at all and no keyword match', () => {
    const inc = {};
    expect(classifyCampaign(inc, 'nothing relevant here')).toBe('ongoing');
  });
});
