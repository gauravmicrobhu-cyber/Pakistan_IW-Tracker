export const targetKeywords = {
  kashmir: ['kashmir', 'j&k', 'poonch', 'chora post', 'jammu'],
  muslim:  ['muslim', 'communal', 'caa', 'nrc'],
  army:    ['army', ' mod ', 'general', 'brigade', 'military', 'air marshal', 'pilot', 'dgao', 'ispr briefing', 'ministry of defence', 'ministry of defense'],
  goi:     ['bjp', 'modi', ' goi ', 'government of india', 'election'],
  west:    ['western', 'un general assembly', 'un hrc', 'oic', 'eu parliament', 'trump', 'hinkle', 'international media'],
  sikh:    ['sikh', 'khalistan', 'punjab', 'diaspora', 'farmers']
};

export const targetLabels = { kashmir:'Kashmir / J&K', muslim:'Indian Muslims', army:'Indian Army / MOD', goi:'BJP / GoI', west:'Western Audiences', sikh:'Sikh Diaspora' };


export const geoDefs = {
  pakistan: { label: 'Islamabad / Rawalpindi (Origin)', lat: 33.6844, lng: 73.0479, isOrigin: true },
  kashmir:  { label: 'Kashmir / J&K (Srinagar)', lat: 34.0837, lng: 74.7973 },
  punjab:   { label: 'Punjab Border Belt (Amritsar)', lat: 31.6340, lng: 74.8723 },
  delhi:    { label: 'Delhi / NCR', lat: 28.6139, lng: 77.2090 },
  panindia: { label: 'Pan-India / National', lat: 21.1458, lng: 79.0882 },
  uk:       { label: 'UK Diaspora (London)', lat: 51.5072, lng: -0.1276 },
  canada:   { label: 'Canada Diaspora (Toronto)', lat: 43.6532, lng: -79.3832 },
  us:       { label: 'US Diaspora (Washington DC)', lat: 38.9072, lng: -77.0369 },
  global:   { label: 'UN / OIC / Global (Geneva)', lat: 46.2044, lng: 6.1432 }
};

// ── CYBER-ATTACK TARGET SITES ── specific victim sectors/institutions, shown as a distinct
// marker layer on the Regional Map so cyber incidents can be pinned to a real target, not just a region.

export const siteDefs = {
  mod:       { label: 'Ministry of Defence networks (New Delhi)', lat: 28.6129, lng: 77.2295 },
  nic:       { label: 'Govt. Linux / National Informatics Centre (Delhi)', lat: 28.6289, lng: 77.2065 },
  powergrid: { label: 'Power Grid / SCADA feeders (Northern Region)', lat: 28.5707, lng: 77.3219 },
  railways:  { label: 'Indian Railways systems (Rail Bhawan, Delhi)', lat: 28.6157, lng: 77.2126 },
  banking:   { label: 'Banking & Financial Sector (Mumbai)', lat: 18.9322, lng: 72.8264 },
  academia:  { label: 'Academic & Research Institutions (Delhi NCR)', lat: 28.5450, lng: 77.1926 }
};

export const siteKeywords = {
  mod:       ['ministry of defence', 'mod ', 'defence network', 'defense network', 'military network', 'defense matters'],
  nic:       ['boss linux', 'national informatics', 'govt linux', 'government linux', 'linux endpoint', 'linux system'],
  powergrid: ['power grid', 'scada', 'power feeder', 'electricity', 'grid'],
  railways:  ['railway', 'rail bhawan', 'train operation'],
  banking:   ['bank', 'financial sector', 'cryptocurrency exchange'],
  academia:  ['university', 'iit ', 'educational institution', 'strategic institution']
};

export const geoKeywords = {
  kashmir: ['kashmir', 'j&k', 'poonch', 'chora post'],
  punjab:  ['punjab', 'sikh', 'khalistan'],
  delhi:   ['delhi', 'brigade hq'],
  uk:      ['uk ', 'united kingdom', 'london'],
  canada:  ['canada'],
  us:      ['united states', 'washington', 'trump'],
  global:  ['un hrc', 'un general assembly', 'oic', 'eu parliament', 'international', 'global', 'western']
};

// ── CAMPAIGNS ── groups incidents into the named crisis windows this tracker's report
// covers, so the Map/Network/Feed can be filtered to one campaign and a shareable link
// captures that view. Classified in priority order (most specific first) from keywords in
// the incident text, falling back to date-range membership for entries that don't name the
// crisis explicitly (e.g. a standalone APT report published during the Sindoor window).

export const campaignDefs = {
  pulwama_balakot: { label: 'Pulwama–Balakot (2019)', short: 'PULWAMA', color: '#ff9f1c', range: ['2019-02-01','2019-03-31'] },
  article370:       { label: 'Article 370 Abrogation (2019–21)', short: 'ART.370', color: '#c724ff', range: ['2019-08-01','2021-02-28'] },
  pahalgam:         { label: 'Pahalgam Attack (Apr 2025)', short: 'PAHALGAM', color: '#ff2d6a', range: ['2025-04-22','2025-05-06'] },
  sindoor:          { label: 'Operation Sindoor (May 2025–)', short: 'SINDOOR', color: '#2f9bff', range: ['2025-05-07','2026-12-31'] },
  ongoing:          { label: 'Ongoing / Uncategorised', short: 'OTHER', color: '#8b96ab', range: null }
};

export const typeLabels = { social:'Social Media IO', media:'Fake Media', psyops:'PsyOps', cyber:'Cyber', diplo:'Diplomatic', proxy:'Proxy Network', response:'Indian Response' };

export const tagClass   = { social:'tag-social', media:'tag-media', psyops:'tag-psyops', cyber:'tag-cyber', diplo:'tag-diplo', proxy:'tag-proxy', response:'tag-response' };

export const platColors = { 'x/twitter':'var(--blue)','twitter':'var(--blue)', whatsapp:'var(--green)', youtube:'var(--accent)', tiktok:'var(--purple)', wikipedia:'var(--accent2)', web:'var(--teal)' };

export const tierMeta = {
  gov:       { label: 'Government/Official', short: 'GOV', color: '#00c853' },
  academic:  { label: 'Academic/Journal', short: 'ACAD', color: '#2f9bff' },
  thinktank: { label: 'Think-tank/Research', short: 'RESEARCH', color: '#c724ff' },
  media:     { label: 'Media/Press', short: 'PRESS', color: '#ff9f1c' },
  self:      { label: 'Self-sourced/Unverified', short: 'SELF', color: '#8b96ab' },
  other:     { label: 'Other', short: 'OTHER', color: '#8b96ab' }
};

export const confidenceMeta = {
  confirmed: { label: 'Confirmed — official/legal action or 3+ independent outlets', short: 'CONFIRMED', color: '#00c853', icon: '●●●' },
  likely:    { label: 'Likely — credible single source, not independently cross-verified', short: 'LIKELY', color: '#2f9bff', icon: '●●○' },
  alleged:   { label: 'Alleged — single/anonymous sourcing, unconfirmed claim', short: 'ALLEGED', color: '#ff9f1c', icon: '●○○' },
  disputed:  { label: 'Disputed — investigators found this claim exaggerated or unsubstantiated', short: 'DISPUTED', color: '#ff2d6a', icon: '✕' }
};


export const mitreAttckData = {
  'APT36 / Transparent Tribe': {
    mitreId: 'G0134',
    url: 'https://attack.mitre.org/groups/G0134/',
    aliases: ['Transparent Tribe', 'COPPER FIELDSTONE', 'APT36', 'Mythic Leopard', 'ProjectM'],
    malware: [
      { name: 'Crimson', url: 'https://attack.mitre.org/software/S0115/' },
      { name: 'ObliqueRAT', url: 'https://attack.mitre.org/software/S0644/' },
      { name: 'DarkComet', url: 'https://attack.mitre.org/software/S0334/' },
      { name: 'njRAT', url: 'https://attack.mitre.org/software/S0385/' },
      { name: 'Peppy', url: 'https://attack.mitre.org/software/S0643/' }
    ],
    techniques: [
      ['T1566.001','Spearphishing Attachment'], ['T1566.002','Spearphishing Link'],
      ['T1204.001','Malicious Link'], ['T1204.002','Malicious File'],
      ['T1203','Exploitation for Client Execution'], ['T1189','Drive-by Compromise'],
      ['T1608.004','Drive-by Target'], ['T1568','Dynamic Resolution'],
      ['T1583.001','Domains (Acquire Infrastructure)'], ['T1584.001','Domains (Compromise Infrastructure)'],
      ['T1036.005','Match Legitimate Resource Name or Location'], ['T1059.005','Visual Basic'],
      ['T1564.001','Hidden Files and Directories'], ['T1027.013','Encrypted/Encoded File']
    ]
  },
  'SideCopy': {
    mitreId: null,
    url: 'https://attack.mitre.org/groups/',
    aliases: ['SideCopy'],
    malware: [
      { name: 'Action RAT', url: 'https://attack.mitre.org/software/' },
      { name: 'AuTo Stealer', url: 'https://attack.mitre.org/software/' }
    ],
    techniques: [
      ['T1566.001','Spearphishing Attachment'], ['T1598.002','Spearphishing Attachment (Recon)'],
      ['T1204.002','Malicious File'], ['T1218.005','Mshta'], ['T1574.001','DLL Search Order Hijacking'],
      ['T1105','Ingress Tool Transfer'], ['T1106','Native API'], ['T1608.001','Upload Malware'],
      ['T1584.001','Domains (Compromise Infrastructure)'], ['T1036.005','Match Legitimate Resource Name or Location'],
      ['T1059.005','Visual Basic'], ['T1016','System Network Configuration Discovery'],
      ['T1082','System Information Discovery'], ['T1518','Software Discovery'],
      ['T1518.001','Security Software Discovery'], ['T1614','System Location Discovery']
    ]
  }
};


export const vectorChartColors = {
  social: '#ff2d6a', media: '#ff9f1c', psyops: '#ff2d6a',
  cyber: '#c724ff', diplo: '#ff9f1c', proxy: '#ffe600'
};

export const vectorChartLabels = { social:'Social Media', media:'Fake Media', psyops:'PsyOps', cyber:'Cyber', diplo:'Diplomatic', proxy:'Proxy Nets' };


export const typeMap = {
  'social media':'social','social':'social','twitter':'social','whatsapp':'social',
  'fake media':'media','disinformation outlet':'media','proxy media':'media','media':'media',
  'psyops':'psyops','psychological':'psyops','narrative':'psyops','cognitive':'psyops',
  'cyber':'cyber','hacking':'cyber','malware':'cyber','wikipedia':'cyber',
  'diplomatic':'diplo','diplomacy':'diplo','un ':'diplo','oic':'diplo',
  'proxy':'proxy','front organisation':'proxy','cutout':'proxy','ngo':'proxy'
};


export const typeColor = { social:'#ff2d6a', media:'#ff9f1c', psyops:'#e91ea8', cyber:'#c724ff', diplo:'#ffe600', proxy:'#2f9bff', response:'#5c8fd6' };

export const geoColor = typeColor; // single source of truth — was previously a separate, inconsistent color map

