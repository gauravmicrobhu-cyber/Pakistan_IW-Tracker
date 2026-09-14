export const seedIncidents = [
    {
      id: Date.now() - 9e6,
      title: "Operation Sindoor: ISPR deploys pre-staged fake aircraft shootdown videos",
      detail: "Within 90 minutes of India's strikes, ISPR-linked accounts flooded X/Twitter and TikTok with recycled footage from unrelated conflicts, falsely claiming Indian Air Force jets were shot down. Content was identified as fabricated by OSINT community within hours but had already achieved significant international media confusion.",
      type: "psyops", sev: "critical",
      platform: "X/Twitter, TikTok", reach: "14.2M impressions",
      date: "2025-05-07", source: "ISPR / Open-source verification",
      actor: "ISPR-linked accounts; individual amplifiers documented incl. @HRazaPK (Hassan Raza, 'reconstruction of events' shootdown graphic) and @therehmanism (Hamza, fabricated Gujranwala drone-interception clip) — Nucleus/Saptang Labs monitoring, 7-8 May 2025"
    },
    {
      id: Date.now() - 8e6,
      title: "Pahalgam false flag narrative seeded across Pakistani diaspora WhatsApp networks",
      detail: "Within hours of the Pahalgam terrorist attack, ISI-linked accounts across Pakistani diaspora WhatsApp groups in the UK and Canada began circulating narratives attributing the attack to RSS/Hindu nationalist groups as a false flag operation. Templates were identical, suggesting central coordination.",
      type: "social", sev: "high",
      platform: "WhatsApp", reach: "Est. 500K users",
      date: "2025-04-22", source: "ISI-linked network / DFRLab"
    },
    {
      id: Date.now() - 7e6,
      title: "Graphika/Facebook takedown: AlphaPro-run fake media network linked to ISPR exposed",
      detail: "Facebook removed a Pakistan-originating network of 40 profiles, 25 pages, 6 groups, and 28 Instagram accounts (aggregate reach ~800,000 followers) for coordinated inauthentic behaviour. Graphika traced the network to AlphaPro, an Islamabad PR firm whose public client list includes ISPR directly, and identified 4+ former ISPR employees now at the firm. Outlets (CJ Post, Pakistan Media Check, Poorv Files, Asal Baat) posed as independent news, using paid Fiverr actors (from ~$25/appearance) as fabricated news anchors. Content mix: pro-military messaging, anti-India narratives on Kashmir/minorities, and CPEC promotion tied to AlphaPro's Chinese commercial clients.",
      type: "proxy", sev: "critical",
      platform: "Facebook / Instagram / YouTube", reach: "~800K followers, decade-long operation (2011–2021)",
      date: "2021-06-03", source: "Graphika (Ronzaud et al.) / Meta"
    },
    {
      id: Date.now() - 1e6,
      title: "NCRI: Coordinated false-flag network seeds and scales #IndianFalseFlag after Pahalgam",
      detail: "NCRI (with Cyabra and ThinkFi) documented a three-tier operation: state-linked actors (led by former Pakistani High Commissioner Abdul Basit) seeded the false-flag narrative within hours; bot networks and AI-generated 'INDIAN FALSE FLAG EXPOSED' memes scaled it (168 accounts confirmed created in April 2025 alone, ~40% of driving accounts showing CIB/automation signatures); Western conspiracy influencer Jackson Hinkle (2.9M followers, himself ~40% bot-like engagement) then carried it to global audiences via an interview with Basit. 23,365 unique tweets analysed across 8 hashtag variants (#IndianFalseFlag: 9,703; #IndianFalseFlagExposed: 5,416).",
      type: "social", sev: "critical",
      platform: "X/Twitter", reach: "23,365 tweets analysed; Hinkle interview 1M+ views",
      date: "2025-04-22", source: "NCRI / Cyabra / ThinkFi"
    },
    {
      id: Date.now() - 950000,
      title: "Deepfake video: fabricated 'confession' by Indian Army general on staged Pahalgam attack",
      detail: "AI-generated deepfake video circulated on Telegram, WhatsApp, and X purporting to show a senior Indian Army general admitting the Pahalgam attack was staged by Indian agencies. Open-source investigators traced production to Pakistan-linked AI capacity using facial-mimicry and voice-synthesis tools. Part of a broader wave of calibrated, regionally-targeted synthetic content documented by GNET.",
      type: "psyops", sev: "critical",
      platform: "Telegram, WhatsApp, X/Twitter", reach: "Unquantified; rapid cross-platform spread",
      date: "2025-04-22", source: "GNET / OSINT investigators"
    },
    {
      id: Date.now() - 900000,
      title: "Officer-targeting disinformation: fake removal/dismissal claims against named Indian generals",
      detail: "Pakistan-based media outlets and proxy handles falsely claimed Lt Gen M.V. Suchindra Kumar was 'shunted out' of Northern Command over Pahalgam 'failures,' and that Air Marshal S.P. Dharkar was 'dismissed' for 'refusing to fight a war' against Pakistan. A third claim alleged Lt Gen D.S. Rana was 'sacked and exiled.' All three officers had in fact completed full, honourable tenures — PIB Fact Check and the Indian MoD issued individualised rebuttals for each.",
      type: "social", sev: "high",
      platform: "Pakistani TV, X/Twitter", reach: "National India-Pakistan news cycle",
      date: "2025-04-30", source: "PIB Fact Check / Indian MoD"
    },
    {
      id: Date.now() - 850000,
      title: "AI-generated false claim: female Rafale pilot Shivangi Singh 'captured' after jet crash",
      detail: "AI-generated and fabricated images/videos falsely claimed India's first female Rafale pilot, Shivangi Singh, had been captured in Pakistan after her jet crashed during Operation Sindoor. India's Directorate General of Air Operations rebutted directly ('all our pilots are back home'); Pakistan's own DG ISPR later confirmed no Indian pilot was in custody.",
      type: "psyops", sev: "critical",
      platform: "X/Twitter, WhatsApp", reach: "Viral within Operation Sindoor news cycle",
      date: "2025-05-08", source: "IJFMR (Sharma & Sharma) / Indian DGAO",
      actor: "Pakistani propaganda accounts; individual amplifier documented @MAKhan1271 (M A Khan, 'war trophy' post) — Nucleus/Saptang Labs monitoring, 11 May 2025"
    },
    {
      id: Date.now() - 800000,
      title: "Staged video: fabricated destruction of Indian Army Brigade HQ, Poonch",
      detail: "Fabricated video circulated showing actors in a demolished building beside a burning Indian flag, falsely claiming Pakistan had destroyed an Indian Army Brigade Headquarters in Poonch. A separate staged video claimed Indian troops surrendered under a white flag at Chora Post; the latter was endorsed on social media by a serving Pakistani minister.",
      type: "media", sev: "high",
      platform: "X/Twitter, TikTok", reach: "Regional/national amplification",
      date: "2025-05-08", source: "IJFMR (Sharma & Sharma)"
    },
    {
      id: Date.now() - 750000,
      title: "'Downed jets' escalation saga: claim inflates from 3 to 7 over months, reaches UN General Assembly",
      detail: "Pakistan's initial 7 May claim of 3 Indian jets downed was revised by ISPR to 5 within hours, then to 6 by a Pakistani Air Vice Marshal citing an unverified 'intercepted communications' audio clip (driving a viral '6-0' campaign). The claim resurfaced and grew to 7 in July 2025 when then-US President Trump repeated it, and again in September 2025 when Pakistan's PM cited '7 jets' at the UN General Assembly — a five-month escalation from an unverified battlefield claim to head-of-state-level repetition.",
      type: "diplo", sev: "high",
      platform: "ISPR briefings, X/Twitter, UN General Assembly", reach: "International; head-of-state amplification",
      date: "2025-05-07", source: "IJFMR (Sharma & Sharma) / multiple wire services",
      actor: "ISPR / Pakistani Air Vice Marshal; individual amplifiers documented incl. @HRazaPK and @bankay_mian62 (Rafale/air-defense-failure claims) — Nucleus/Saptang Labs monitoring, 7-11 May 2025"
    },
    {
      id: Date.now() - 550000,
      title: "Study: Operation Sindoor news/Twitter sentiment correlated with Indian defence-stock volatility",
      detail: "Academic sentiment-analysis study (Hybrid BERT+TextBlob, fine-tuned BERT at 87% classification accuracy, and FinBERT) of 1,777 news articles and 575 tweets during Operation Sindoor (Apr–May 2025) found predominantly negative sentiment in both news and social coverage. Twitter-based sentiment showed the strongest same-day correlation with stock returns (Nifty 50 ≈0.55, HDFC Bank ≈0.46) — more than double the strength of news-sentiment correlations — with defence and energy-sector stocks (HAL, ONGC) most sentiment-responsive. Correlations were highly unstable over time (7-day rolling correlations repeatedly flipped sign), indicating a real but short-lived, event-driven market effect rather than a stable predictive signal.",
      type: "media", sev: "medium",
      platform: "X/Twitter, news media, NSE/BSE market data", reach: "1,777 articles, 575 tweets; correlated vs. Nifty 50/Sensex + 12 sector stocks",
      date: "2025-05-07", source: "Tripathi & Rao, IIETA Journal, Vol. 30 (Aug 2025)"
    },
    {
      id: Date.now() - 500000,
      title: "APT36 (Transparent Tribe) deploys DeskRAT against Indian government Linux systems",
      detail: "Sekoia.io documented a campaign beginning June 2025 primarily targeting systems running BOSS Linux, the Bharat Operating System Solutions distribution mandated across Indian government departments. Phishing emails delivered malicious ZIP archives referencing defense matters and regional unrest (timed to Ladakh/Delhi protests); opening the decoy triggered a bash sequence that fetched a new remote-access tool, 'DeskRAT', before displaying a decoy PDF to the victim.",
      type: "cyber", sev: "critical",
      platform: "Email (spear-phishing) / BOSS Linux endpoints", reach: "Govt. Linux endpoints, scope undisclosed",
      date: "2025-06-15", source: "Sekoia.io threat intelligence", actor: "APT36 / Transparent Tribe",
      site: "nic", targets: ["army","goi"]
    },
    {
      id: Date.now() - 480000,
      title: "APT36 Crimson RAT phishing wave exploits Pahalgam attack to breach defense networks",
      detail: "Within 48 hours of the 22 April 2025 Pahalgam attack, APT36 (aka Earth Karkaddan, Transparent Tribe) launched a phishing campaign using two lure formats: PowerPoint add-on files (.ppam) with malicious macros disguised as 'Report & Update Regarding Pahalgam Terror Attack,' and a PDF titled 'Action Points & Response by Govt Regarding Pahalgam Terror Attack' (authored under the alias 'Kalu Badshah,' created 24 April 2025) linking to a credential-harvesting page spoofing the J&K Police website (jkpolice.gov.in.kashmirattack.exposed). The macros dropped Crimson RAT disguised as an image file (WEISTT.jpg), which connected to a hardcoded C2 server at 93.127.133.58:1097, supporting 22+ commands including screenshot capture, file exfiltration, and persistence via registry run-keys. APT36 registered a network of spoofed domains from 16 April 2025 onward — including iaf.nic.in.ministryofdefenceindia.org, email.gov.in.departmentofdefence.de and indianarmy.nic.in.departmentofdefence.de — hosted via Alexhost Srl, IP Connect Inc and Shinjiru Technology. CloudSEK assessed Crimson RAT's tradecraft as largely unchanged for ~6 years, posing limited risk to organisations with mature security postures but a persistent threat to under-defended government endpoints.",
      type: "cyber", sev: "critical",
      platform: "Email (spear-phishing) / spoofed govt domains", reach: "Indian military & govt personnel, scope undisclosed",
      date: "2025-04-24", source: "CloudSEK (Pagilla Manohar Reddy)", actor: "APT36 / Transparent Tribe",
      site: "mod", targets: ["army"]
    },
    {
      id: Date.now() - 470000,
      title: "Named Pakistan-linked X accounts amplify unverified cyberattack claims under 'Operation Bunyan al-Marsous' banner",
      detail: "Beyond the organised hacktivist groups, CloudSEK identified individual Pakistan-linked X accounts independently amplifying unverified breach claims against India. P@kistanCyberForce claimed breaches of the Manohar Parrikar Institute for Defence Studies and Analyses (idsa.in), Armoured Vehicles Nigam Limited, and an ECHS healthcare portal. CyberLegendX (@cyber4982) attributed attacks on a vehicle-tracking platform and Bharti Airtel to 'Pakistan Cyber Force' as retaliation for Operation Sindoor. A cluster of accounts (Taymiyyah Umer/@MAkhtar508, @Mubashirbilal00, mirhakhan_99, and 'several dozen' similar accounts per CloudSEK) promoted claims under the banner PAFCyberForce/'Operation Bunyan al-Marsous,' alleging infiltration of civilian systems, hospitals and security-camera feeds while emphasising 'no visible disruption' as evidence of restraint. A self-identified Pakistani hacker, @Amad__khan, separately claimed intrusions against the SSC, MEA, Delhi Police clearance-certificate system, and the Ministry of Housing and Urban Affairs.",
      type: "social", sev: "medium",
      platform: "X/Twitter", reach: "Multiple named accounts, unverified claims",
      date: "2025-05-11", source: "CloudSEK (Pagilla Manohar Reddy)", actor: "P@kistanCyberForce / PAFCyberForce",
      targets: ["goi","army"]
    },
    {
      id: Date.now() - 460000,
      title: "Road of Sindoor report: seven Pakistan-aligned APT/hacktivist groups log 1.5M attacks on Indian infrastructure",
      detail: "Maharashtra Cyber's 'Road of Sindoor' report identified seven groups — APT36, Pakistan Cyber Force, Team Insane PK, Mysterious Bangladesh, Indo Hacks Sec, Cyber Group HOAX 1337 and National Cyber Crew — behind roughly 1.5 million attempted attacks on Indian government and critical-infrastructure websites in the weeks after Pahalgam, using malware, DDoS, GPS spoofing and defacement. Officials stated only ~150 attempts succeeded.",
      type: "cyber", sev: "high",
      platform: "Multiple (web, DDoS botnets, spoofing tools)", reach: "~1.5M attempts, 150 successful",
      date: "2025-05-12", source: "Maharashtra Cyber (ADGP Yashasvi Yadav briefing)", actor: "Pakistan Cyber Force / Team Insane PK / APT36",
      site: "powergrid", targets: ["army","goi"]
    },
    {
      id: Date.now() - 440000,
      title: "Hacktivist coalition claims DDoS wave against Indian government and PMO-linked sites",
      detail: "A coalition including 'Lực Lượng Đặc Biệt Quân Đội Điện Tử', Vulture and GARUDA ERROR SYSTEM announced DDoS attacks on high-profile Indian government websites, including claims against the Prime Minister's Office. CloudSEK's investigation found most claimed breaches were exaggerated — recycled data leaks and defacements with no lasting footprint — with DDoS causing only minutes of disruption; the genuine ongoing threat during this window was APT36's separate Crimson RAT espionage campaign.",
      type: "cyber", sev: "medium",
      platform: "DDoS botnets / defaced web portals", reach: "100+ claimed incidents, largely unverified",
      date: "2025-05-08", source: "CloudSEK investigation", actor: "Hacktivist coalition (unverified claims)",
      site: "mod", targets: ["goi"]
    },
    {
      id: Date.now() - 420000,
      title: "APT36 shifts to Linux .desktop file lures in government procurement phishing campaign",
      detail: "APT36 began using malicious Linux .desktop shortcut files packed inside ZIP archives disguised as procurement documents, exploiting metadata fields to execute payloads on Indian government Linux endpoints — an evolution from earlier Windows-only tradecraft as more Indian departments migrate to indigenous Linux distributions.",
      type: "cyber", sev: "high",
      platform: "Email / Linux desktop-entry files", reach: "Government procurement offices, scope undisclosed",
      date: "2025-08-14", source: "SecurityWeek / Trend Micro (Earth Karkaddan)", actor: "APT36 / Transparent Tribe",
      site: "nic", targets: ["goi"]
    },
    {
      id: Date.now() - 400000,
      title: "'Gopher Strike' and 'Sheet Attack': new Pakistan-linked subgroup abuses Google Sheets/Firebase for C2",
      detail: "Zscaler ThreatLabz identified two related campaigns against Indian government entities, assessed with medium confidence as originating from a Pakistan-linked subgroup operating alongside APT36. 'Sheet Attack' abused legitimate services — Google Sheets, Firebase and email — as covert command-and-control channels to evade network detection.",
      type: "cyber", sev: "high",
      platform: "Google Sheets / Firebase (C2) / Email", reach: "Indian govt entities, scope undisclosed",
      date: "2025-09-10", source: "Zscaler ThreatLabz", actor: "Pakistan-linked subgroup (APT36-adjacent)",
      site: "mod", targets: ["goi","army"]
    },
    {
      id: Date.now() - 380000,
      title: "APT36 persistent-surveillance campaign hits Indian academic and strategic institutions",
      detail: "CSIS logged a January 2026 hacking campaign by a Pakistan-aligned group against Indian government, academic and strategic institutions, aimed at exfiltrating data and establishing persistent surveillance footholds. The activity was attributed to APT36 (Transparent Tribe), which has a long record of targeting Indian government bodies, military-linked organizations and universities.",
      type: "cyber", sev: "critical",
      platform: "Spear-phishing / persistent implants", reach: "Govt, academic & strategic institutions",
      date: "2026-01-14", source: "CSIS Significant Cyber Incidents tracker", actor: "APT36 / Transparent Tribe",
      site: "academia", targets: ["goi","army"]
    },
    {
      id: Date.now() - 350000,
      title: "PIB/MIB blocks 20 YouTube channels + 2 websites linked to 'Naya Pakistan Group' — first use of IT Rules 2021 emergency powers",
      detail: "The Ministry of Information & Broadcasting invoked the emergency provisions of Rule 16 of the IT Rules 2021 for the first time, ordering the blocking of 20 YouTube channels and 2 websites identified as a coordinated disinformation network operating from Pakistan. Content was posted in a coordinated manner on Kashmir, the Indian Army, minority communities in India, the Ram Mandir issue, and the death of former CDS General Bipin Rawat. The core network, the Naya Pakistan Group (NPG), had over 2 million subscribers on its lead channel alone; combined reach across all 20 channels was 35 lakh subscribers and 55 crore+ views. Two channels focused specifically on Khalistan-related propaganda (InternationalWeb News, Khalsa TV).",
      type: "response", sev: "high",
      platform: "YouTube / Websites", reach: "35 lakh subscribers, 55 crore+ views",
      date: "2021-12-21", source: "PIB / Ministry of Information & Broadcasting", actor: "Naya Pakistan Group (NPG)",
      targets: ["kashmir","army","sikh"]
    },
    {
      id: Date.now() - 340000,
      title: "PIB/MIB blocks 35 Pakistan-based YouTube channels, 2 websites, and Instagram/Twitter/Facebook accounts — Apni Duniya & Talha Films networks",
      detail: "In the second such action within a month, MIB blocked 35 YouTube channels, 2 websites, 2 Instagram accounts, 2 Twitter accounts and 1 Facebook account, all operating from Pakistan and identified as four coordinated disinformation networks: the Apni Duniya Network (14 YouTube channels) and the Talha Films Network (13 YouTube channels), plus two smaller synchronised clusters. Combined subscriber base was 1.2 crore with 130 crore+ views. I&B Secretary Apurva Chandra stated the action followed fresh intelligence inputs and that further blocking actions were expected as the process continued.",
      type: "response", sev: "high",
      platform: "YouTube / Instagram / X (Twitter) / Facebook / Websites", reach: "1.2 crore subscribers, 130 crore+ views",
      date: "2022-01-21", source: "PIB / Ministry of Information & Broadcasting", actor: "Apni Duniya Network / Talha Films Network",
      targets: ["kashmir","army","goi"]
    },
    {
      id: Date.now() - 330000,
      title: "PIB/MIB blocks 22 YouTube channels (4 Pakistan-based, 18 Indian), 3 Twitter accounts, 1 Facebook account, 1 website",
      detail: "MIB ordered blocking of 22 YouTube news channels with a cumulative viewership of 260 crore, along with 3 Twitter accounts, 1 Facebook account and 1 news website. This was the first time the IT Rules 2021 were invoked against Indian YouTube publishers (18 of the 22 channels were India-based) alongside 4 Pakistan-based channels; the blocked accounts used logos and templates of legitimate TV news channels and false thumbnails to mislead viewers. Since December 2021, the Ministry noted, 78 YouTube channels had been blocked in total under these emergency powers.",
      type: "response", sev: "high",
      platform: "YouTube / X (Twitter) / Facebook / Website", reach: "260 crore cumulative viewership",
      date: "2022-04-04", source: "PIB / Ministry of Information & Broadcasting", actor: "Unattributed / crowd-sourced",
      targets: ["army","goi"]
    },
    {
      id: Date.now() - 320000,
      title: "PIB/MIB blocks 16 YouTube news channels (6 Pakistan-based, 10 India-based) + 1 Facebook account",
      detail: "Two separate MIB orders blocked sixteen YouTube-based news channels and one Facebook account for spreading disinformation on subjects related to India's national security, foreign relations and public order. Pakistan-based channels among the sixteen were found to have posted fake news in a coordinated manner on the Indian Army, Jammu and Kashmir, and India's foreign relations in light of the Ukraine situation. Combined viewership across the blocked channels exceeded 68 crore.",
      type: "response", sev: "high",
      platform: "YouTube / Facebook", reach: "68 crore+ cumulative viewership",
      date: "2022-04-22", source: "PIB / Ministry of Information & Broadcasting", actor: "Unattributed / crowd-sourced",
      targets: ["army","kashmir"]
    },
    {
      id: Date.now() - 310000,
      title: "PIB/MIB blocks 8 YouTube channels (7 Indian, 1 Pakistani) for monetised 'fake anti-India content'",
      detail: "MIB blocked eight YouTube channels — seven Indian, one Pakistani — with a combined 85 lakh subscribers and 114 crore views, for spreading disinformation on India's national security, foreign relations and public order. The channels made false claims including demolition of religious structures by the Government of India, bans on religious festival celebrations, and declaration of religious war in India; some content was found to be monetised, and some was assessed as designed to spread communal hatred, including claims that Muslims should leave for Pakistan or Bangladesh.",
      type: "response", sev: "medium",
      platform: "YouTube", reach: "85 lakh subscribers, 114 crore views",
      date: "2022-08-18", source: "PIB / Ministry of Information & Broadcasting", actor: "Unattributed / crowd-sourced",
      targets: ["muslim","goi"]
    },
    {
      id: Date.now() - 300000,
      title: "India blocks 16 Pakistani YouTube news channels post-Pahalgam (Dawn News, Samaa TV, ARY News, Geo News, Bol News, Raftar, Suno News, GNN)",
      detail: "In the immediate aftermath of the 22 April 2025 Pahalgam attack, the Government of India blocked 16 Pakistani YouTube channels — including major broadcasters Dawn News, Samaa TV, ARY News, Geo News, Bol News, Raftar, Suno News and GNN — with a combined Indian subscriber base of over 63 million, for 'disseminating provocative and communally sensitive content, false and misleading narratives and misinformation' against India, its Army and security agencies. The Information Ministry separately issued an advisory to journalists and social media users to exercise caution in reporting on defence-related operations, citing precedent from the 1999 Kargil conflict.",
      type: "response", sev: "critical",
      platform: "YouTube", reach: "63 million+ subscriber base",
      date: "2025-04-28", source: "PIB / Ministry of Information & Broadcasting", actor: "Pakistani state broadcasters",
      targets: ["army","goi"]
    },
    {
      id: Date.now() - 290000,
      title: "India blocks Pakistan Army's ISPR YouTube channel and Government of Pakistan's official account",
      detail: "As the crackdown widened, India blocked the YouTube channel of the Pakistan Army's media wing ISPR, along with the official account of the Government of Pakistan. Additional Pakistani entertainment channels (ARY, Har Pal Geo, Hum TV) and the Instagram accounts of Pakistani celebrities — including Hania Aamir, Mahira Khan, Ali Zafar, Sanam Saeed, Bilal Abbas, Iqra Aziz, Imran Abbas and Sajal Aly — were also blocked. Government sources indicated platforms including YouTube, Instagram and X were urged to bar all Pakistani handles from operating in India.",
      type: "response", sev: "high",
      platform: "YouTube / Instagram / X", reach: "Multiple official and celebrity accounts",
      date: "2025-05-02", source: "PIB / Ministry of Information & Broadcasting", actor: "ISPR",
      site: "mod", targets: ["army","goi"]
    },
    {
      id: Date.now() - 280000,
      title: "MIB advisory directs OTT platforms to discontinue all Pakistani-origin content",
      detail: "A day after Operation Sindoor began, the Ministry of Information & Broadcasting issued an advisory under the IT Rules, 2021 directing all OTT platforms, streaming services and digital intermediaries to discontinue streaming Pakistani-origin content — web series, films, songs and podcasts, whether subscription-based or free — on the grounds that hosted content 'must not threaten India's sovereignty, integrity, national security, or public order.'",
      type: "response", sev: "medium",
      platform: "OTT platforms / streaming services", reach: "Industry-wide advisory",
      date: "2025-05-08", source: "PIB / Ministry of Information & Broadcasting", actor: "Government of India",
      targets: ["goi"]
    },
    {
      id: Date.now() - 270000,
      title: "~8,000 X accounts blocked in India in Operation Sindoor-linked crackdown, including international journalists and Kashmiri voices",
      detail: "X's Global Affairs account confirmed receiving Indian government orders to block over 8,000 accounts, including accounts belonging to international news organisations and prominent users, without published justification. Coverage identified affected accounts as including Pakistani, Kashmiri and some Indian journalists and outlets, plus Chinese state media (Xinhua). Press-freedom groups noted the order's scope extended well beyond Pakistan-linked disinformation networks to independent journalists and regional media covering the conflict, drawing criticism as overbroad relative to the stated national-security rationale.",
      type: "response", sev: "high",
      platform: "X (Twitter)", reach: "~8,000 accounts",
      date: "2025-05-09", source: "X Global Affairs / PIB", actor: "Government of India",
      targets: ["goi"]
    },
    {
      id: Date.now() - 260000,
      title: "India blocks X accounts of Global Times, Xinhua and TRT World over alleged Pakistani propaganda amplification",
      detail: "India blocked the X accounts of China's Global Times and Xinhua News Agency, and Turkey's state broadcaster TRT World, citing their alleged role in disseminating Pakistani propaganda during the Operation Sindoor crisis. The action reflects this report's broader finding (Section 6A.2) that international state broadcasters — particularly TRT World, Anadolu Agency, and Al Jazeera — were assessed by Indian officials as disproportionately amplifying Pakistan-aligned framing during the 2025 crisis.",
      type: "response", sev: "medium",
      platform: "X (Twitter)", reach: "3 state-linked accounts",
      date: "2025-05-14", source: "PIB / Government of India", actor: "TRT World amplification",
      targets: ["goi","west"]
    },
    {
      id: Date.now() - 250000,
      title: "MeitY orders Google to remove 3,000+ apps from Play Store, many traced to Pakistani developers",
      detail: "Between 29 April and 15 May 2025, MeitY issued three orders under Section 69A of the IT Act directing Google to remove more than 3,000 apps from the Play Store. The list was unusually broad — VPN services, Islamic religious apps, streaming platforms, language tools, AI-powered generators, and basic utilities — and investigators traced a significant number of the affected apps to developers based in Pakistan, coinciding with the peak of Pahalgam/Sindoor-period border tensions.",
      type: "response", sev: "medium",
      platform: "Google Play Store", reach: "3,000+ apps",
      date: "2025-05-15", source: "MeitY / Moneycontrol reporting", actor: "Government of India",
      site: "nic", targets: ["goi"]
    },
    {
      id: Date.now() - 240000,
      title: "PIB Fact Check mass-debunks 40+ Pakistan-linked fabricated claims during Operation Sindoor (72-hour window)",
      detail: "Beyond the officer-targeting rebuttals (Section documented separately), PIB Fact Check's @PIBFactCheck unit issued a rapid sequence of individual debunks between 7-12 May 2025 covering distinct fabricated claims: a fake CNN-branded infographic comparing India-Pakistan military losses (CNN never published it); a claim that a Pakistani cyberattack had disabled 70% of India's power grid (Ministry of Power confirmed no disruption); a claim that Pakistan had destroyed India's S-400 air defence system (confirmed intact); a hoax that an Indian pilot had ejected over Pakistan-occupied Kashmir; a staged video claiming an Indian Army post was destroyed by a fictitious '20 Raj Battalion' unit that does not exist in the Indian Army; an old 2020 Beirut explosion video recirculated as a 'Pakistani missile strike on India'; a false 'fidayeen attack' on an Army brigade in Rajouri; a fabricated letter attributed to the Chief of Army Staff; a false claim of an Indian strike launched from Ambala airbase on Amritsar's own citizens; and a false claim that DG ISPR's press briefing used a doctored clip of Aaj Tak footage to claim an Indian airfield was destroyed (the original footage in fact showed a Pakistani airfield's destruction). PIB documented over 40 such claims debunked across the escalation window.",
      type: "response", sev: "high",
      platform: "X/Twitter, WhatsApp, various", reach: "40+ individually debunked claims, national audience",
      date: "2025-05-09", source: "PIB Fact Check", actor: "Pro-Pakistan social media handles",
      targets: ["army","goi"]
    },
    {
      id: Date.now() - 230000,
      title: "AI deepfake wave impersonating PM Modi falsely claims Pakistan destroyed Rafale jets and threatens Iran/Israel escalation",
      detail: "Two separate AI-generated deepfake videos of Prime Minister Narendra Modi were circulated by Pakistani propaganda accounts and debunked by PIB Fact Check within a one-month span: a February 2026 video falsely depicting Modi, in a fabricated joint press appearance with French President Macron, claiming Pakistan had destroyed India's Rafale jets; and a March 2026 video attributing invented remarks to Modi threatening that 'Iran will have to answer for spreading terrorism' and invoking 'Akhand Bharat' rhetoric against Pakistan and Israel. PIB confirmed both as digitally manipulated and published the original, unedited source footage in each case.",
      type: "psyops", sev: "critical",
      platform: "X/Twitter, social media", reach: "National audience; PM-level impersonation",
      date: "2026-02-18", source: "PIB Fact Check", actor: "Pakistani propaganda accounts",
      targets: ["goi","army"]
    },
    {
      id: Date.now() - 220000,
      title: "AI deepfake of Army Chief Gen Upendra Dwivedi and fake Navy officer account claim Indian complicity in Israel-Iran ship incident",
      detail: "Pakistani propaganda accounts circulated an AI-generated deepfake of Chief of Army Staff General Upendra Dwivedi, manipulating his genuine Raisina Dialogue 2026 remarks to fabricate a claim that India, as a 'strategic ally' of Israel, had a duty to disclose an Iranian vessel's location. A parallel fake account impersonating Indian Naval personnel claimed Defence Minister Rajnath Singh and Vice Chief of Naval Staff Sanjay Vatsayan had assisted an attack on the Iranian ship IRIS Dena, and that Naval Chief Admiral Dinesh Kumar Tripathi was preparing to resign over it. A related deepfake separately manipulated EAM Jaishankar's Parliament remarks to invent claims about a USD 3 billion Israeli grant to Afghanistan. PIB Fact Check debunked all three as fabricated and published the original Raisina Dialogue footage.",
      type: "psyops", sev: "critical",
      platform: "X/Twitter, social media", reach: "National audience; senior military leadership impersonation",
      date: "2026-03-09", source: "PIB Fact Check", actor: "Pakistani propaganda accounts",
      site: "mod", targets: ["army","goi"]
    },
    {
      id: Date.now() - 210000,
      title: "AI deepfake attributes fabricated anti-Army statements to former Army Chief Gen Manoj Pande (Retd)",
      detail: "A deepfake video circulated on social media falsely attributed statements critical of the Indian Army to former Chief of Army Staff General Manoj Pande (Retired). PIB's Fact Check Unit confirmed the video was AI-generated and that Gen. Pande had made no such statement, attributing the circulation to Pakistani propaganda accounts seeking to undermine public trust in the Indian Armed Forces.",
      type: "psyops", sev: "high",
      platform: "Social media", reach: "National audience; retired senior officer impersonation",
      date: "2026-03-16", source: "PIB Fact Check", actor: "Pakistani propaganda accounts",
      targets: ["army","goi"]
    },
    {
      id: Date.now() - 200000,
      title: "Pakistan runs sustained manipulated-satellite-imagery campaign claiming strikes on six Indian military sites",
      detail: "Through June 2025, Pakistan continued a disinformation campaign using manipulated or misattributed satellite and photographic imagery to claim damage at Indian military installations: a pre-war MiG-29 maintenance photo (soot deposits from routine engine tests) presented as a struck Sukhoi-30MKI at Adampur airbase; an unrelated vehicle-depot oil/fuel-spill photo presented as damage to an S-400 radar facility at Bhuj; and further false claims of strikes on Suratgarh and Sirsa airfields, the Nagrota BrahMos base, and a Forward Ammunition Depot in Chandigarh. Foreign Secretary Vikram Misri publicly rebutted the claims at an MEA briefing, calling them 'heavy on lies, misinformation and propaganda,' while Wing Commander Vyomika Singh presented timestamped satellite counter-imagery showing the Sirsa and Suratgarh runways intact. PM Modi's subsequent visit to Adampur, alongside its S-400 battery, was framed by the government as a direct rebuttal of the claim.",
      type: "media", sev: "high",
      platform: "Social media, Pakistani state media", reach: "Six separate false strike claims",
      date: "2025-06-08", source: "WION / Tribune India / MEA briefing", actor: "Pakistani state agencies; individual amplifier documented @HummaSaif (Dr Humma Saif, 'PAF Response — Targeting S-400 at Adampur' video) — Nucleus/Saptang Labs monitoring, 12 May 2025",
      site: "mod", targets: ["army","goi"]
    },
    {
      id: Date.now() - 190000,
      title: "Web defacement and DDoS attacks target Army Public Schools websites in Srinagar and Ranikhet",
      detail: "Pakistan-based hackers targeted the websites of Army Public Schools in Srinagar and Ranikhet with web defacement and distributed denial-of-service (DDoS) attacks in the days following the Pahalgam attack, before the escalation into Operation Sindoor. The intrusions were swiftly rectified by site administrators with no lasting disruption.",
      type: "cyber", sev: "medium",
      platform: "Institutional websites", reach: "2 school websites",
      date: "2025-04-29", source: "NDTV / MP-IDSA Issue Brief", actor: "Pakistan-based hackers",
      site: "mod", targets: ["army"]
    },
    {
      id: Date.now() - 180000,
      title: "Attempted network breaches of Army Welfare Housing Organisation database and IAF Placement Organisation Portal",
      detail: "Pakistan-based threat actors attempted network breaches against the Army Welfare Housing Organisation's database and the Indian Air Force Placement Organisation Portal in the days following the Pahalgam attack. Affected sites were isolated and restored with no impact on classified networks in either case.",
      type: "cyber", sev: "medium",
      platform: "Government/defence web portals", reach: "2 institutional targets",
      date: "2025-04-29", source: "New Indian Express / MP-IDSA Issue Brief", actor: "Pakistan-based hackers",
      site: "mod", targets: ["army"]
    },
    {
      id: Date.now() - 170000,
      title: "Rajasthan Education Department website defaced, message from 'Pakistan Cyber Force' displayed",
      detail: "The Rajasthan Education Department's website was hacked and defaced with inflammatory messaging, with the intrusion signed by a group identifying itself as 'Pakistan Cyber Force.' Adequate remedial measures were undertaken and no sensitive data leaks were reported.",
      type: "cyber", sev: "medium",
      platform: "State government website", reach: "1 state department website",
      date: "2025-04-29", source: "New Indian Express / MP-IDSA Issue Brief", actor: "Pakistan Cyber Force",
      targets: ["goi"]
    },
    {
      id: Date.now() - 160000,
      title: "SideCopy APT campaign spoofs official Indian entities via fake domains to distribute malware",
      detail: "SideCopy, a Pakistan-based APT actor distinct from APT36, ran a sustained phishing campaign during the Operation Sindoor period, sending emails impersonating official Indian government and defence entities and delivering malware through fake domains mimicking legitimate services. Indian agencies identified SideCopy as one of seven APT groups active against India during the crisis window.",
      type: "cyber", sev: "high",
      platform: "Email / spoofed domains", reach: "Government and defence targets, scope undisclosed",
      date: "2025-05-10", source: "MP-IDSA Issue Brief (Samuel & Sharma)", actor: "SideCopy",
      site: "mod", targets: ["army","goi"]
    },
    {
      id: Date.now() - 150000,
      title: "CERT-In issues advisories to MSMEs and large industries citing sharp rise in ransomware, DDoS and defacement",
      detail: "India's Computer Emergency Response Team (CERT-In) issued a formal advisory on 10 May 2025 outlining essential cybersecurity measures for MSMEs, followed by a parallel advisory for large industries, reporting a sharp rise in ransomware attacks, DDoS incidents, malware infections and web defacements coinciding with the Operation Sindoor crisis window. The Department of Telecommunications separately began evaluating measures to harden critical infrastructure — energy, defence manufacturing, telecommunications and transport.",
      type: "response", sev: "medium",
      platform: "National advisory (multi-sector)", reach: "Industry-wide",
      date: "2025-05-10", source: "CERT-In / MP-IDSA Issue Brief", actor: "Government of India",
      targets: ["goi"]
    },
    {
      id: Date.now() - 140000,
      title: "CloudSEK assessment finds named hacktivist groups' breach claims mostly unsubstantiated or exaggerated",
      detail: "CloudSEK's independent technical assessment of hacktivist claims during the Sindoor-period surge found most to be overblown. Nation Of Saviors was the single largest claimant (32 claimed attacks) against Indian government portals including the CBI, Election Commission of India, and National Portal of India. KAL EGY 319 (31 claims) targeted education and healthcare-affiliated sites. SYLHET GANG-SG and DieNet's claimed exfiltration of 247GB from India's National Informatics Centre was found largely unsubstantiated — a 1.5GB 'proof' sample released consisted of publicly available marketing materials. Team Azrael-Angel of Death's claimed breach of the Election Commission of India and leak of Army personnel data was traced to previously-leaked 2023 data, not a fresh compromise, and the alleged Army-personnel dataset showed internal inconsistencies (mismatched names/emails/phone numbers) consistent with fabrication. KAL EGY 319's claimed large-scale defacement of ~40 Indian educational and medical websites had minimal actual impact — all named sites were confirmed functioning normally. SYLHET GANG-SG's claimed unauthorised access to Andhra Pradesh High Court records did expose some password hashes alongside already-public case metadata, but not the 'massive breach of private judicial records' claimed. A coordinated DDoS claim by Lực Lượng Đặc Biệt Quân Đội Điện Tử, Vulture and GARUDA ERROR SYSTEM against the PMO and other top government sites, and a separate DDoS claim by Vulture/Electronic Army Special Forces against CERT-In and the National Testing Agency, both showed no evidence of operational disruption beyond a few minutes at most.",
      type: "cyber", sev: "low",
      platform: "Various (claimed breaches, mostly unverified)", reach: "5+ named groups assessed, 100+ claimed attacks",
      date: "2025-05-11", source: "CloudSEK (Pagilla Manohar Reddy)", actor: "Nation Of Saviors / SYLHET GANG-SG / KAL EGY 319",
      targets: ["goi"]
    },
    {
      id: Date.now() - 130000,
      title: "Pakistan's UN envoy Maleeha Lodhi displays fake Gaza photo as 'Kashmir pellet-gun victim' at UNGA",
      detail: "Exercising her right of reply after Indian EAM Sushma Swaraj's UN General Assembly address, Pakistan's Permanent Representative Maleeha Lodhi held up a photograph of an injured girl, declaring it 'the true face of India' and evidence of pellet-gun brutality in Kashmir. The photo was in fact a 2014 image of 17-year-old Rawya Abu Joma'a, a Palestinian girl injured in an Israeli airstrike in Gaza, taken by photographer Heidi Levine and previously published by the Guardian and other outlets. The Pakistani mission's official Twitter account also posted the image, which remained its pinned tweet after the fabrication was exposed. India's delegation publicly rebutted the claim the following day.",
      type: "diplo", sev: "high",
      platform: "UN General Assembly / Twitter", reach: "International diplomatic forum",
      date: "2017-09-24", source: "BBC / PTI / Tribune India / USC Center on Public Diplomacy", actor: "Maleeha Lodhi / Government of Pakistan",
      targets: ["west","kashmir"]
    },
    {
      id: Date.now() - 120000,
      title: "Pakistan posts fake UN Security Council speech accusing India of using 'mercenary terrorists'",
      detail: "Pakistan's permanent mission to the UN posted a transcript on its official website and via Twitter claiming Ambassador Munir Akram had addressed a UNSC high-level virtual debate on terrorism, alleging India backed the Tehrik-e-Taliban Pakistan and Jamaat-ul-Ahrar as 'mercenary terrorists' and listing four individuals it claimed were on a UN terrorist-sanctions list. In fact, Pakistan was not a UNSC member and was not on the session's speakers list; Akram did not appear in the meeting video, corroborated by Germany's mission (a sitting UNSC member) which also confirmed his absence. India's UN mission publicly noted the Security Council's 1267 Committee list contained no such Indian names and rebutted the claims point by point.",
      type: "diplo", sev: "high",
      platform: "Official government website / Twitter", reach: "International diplomatic forum",
      date: "2020-08-24", source: "Tribune India / Zee News / Deccan Herald", actor: "Munir Akram / Government of Pakistan",
      targets: ["goi","west"]
    },
    {
      id: Date.now() - 110000,
      title: "Iran's Khamenei tweets #IndianMuslimsInDanger amid CAA/Delhi-riots disinformation environment, drawing formal Indian protest",
      detail: "Amid a documented wave of disinformation around India's Citizenship Amendment Act and the February 2020 Delhi riots — during which fake and mislabelled content circulated across social media, a significant share of it traced to accounts outside India — Iran's Supreme Leader Ali Khamenei tweeted on 5 March 2020: 'The hearts of Muslims all over the world are grieving over the massacre of Muslims in India... to prevent India's isolation from the world of Islam,' using the hashtag #IndianMuslimsInDanger. India summoned Iran's ambassador and formally protested the remarks as 'irresponsible.' Note: the specific claim that this hashtag was directly 'ISPR-sponsored' could not be independently corroborated beyond a single secondary source and is not asserted as established fact here — the entry documents the verified diplomatic episode itself.",
      type: "diplo", sev: "medium",
      platform: "Twitter", reach: "International diplomatic incident",
      date: "2020-03-05", source: "The Wire / Hindustan Times / Siasat", actor: "Unattributed / crowd-sourced",
      targets: ["muslim","goi"]
    },
    {
      id: Date.now() - 100000,
      title: "Pakistan releases official documentary and dossier branding Pahalgam attack an 'Indian false flag operation'",
      detail: "Pakistan released a 27-minute-51-second documentary titled 'Marka-e-Haq' explicitly framed 'to expose Pahalgam false flag operation,' alongside a formal government dossier asserting the Pahalgam attack was 'orchestrated by India' as a domestic-political pretext, citing the FIR's ten-minute filing time and the rejection of Pakistan's proposed joint investigation as evidence. Both were produced with state backing and amplified through Pakistani state media (Radio Pakistan, The Nation). This marked the formal state-level institutionalization of the false-flag narrative that had circulated on social media within hours of the actual attack.",
      type: "psyops", sev: "high",
      platform: "State media / official dossier", reach: "National and international audiences",
      date: "2025-05-18", source: "Radio Pakistan / The Nation (Pakistan)", actor: "Government of Pakistan / ISPR",
      targets: ["goi","army","west"]
    },
    {
      id: Date.now() - 90000,
      title: "ISPR and Ministry of Information release 'Marka-e-Haq: The Battle of Truth' — official narrative-institutionalization publication",
      detail: "On the first anniversary of the May 2025 conflict, Pakistan's Ministry of Information & Broadcasting and ISPR jointly launched 'Marka-e-Haq: The Battle of Truth,' a state-produced pictorial publication chronicling Pakistan's version of the conflict and its broader historical rivalry with India, unveiled by the Defence Minister and Information Minister at the Pak-China Friendship Centre, Islamabad. Independent analysis found the publication reframes the 1971 war primarily as an Indian proxy operation via Mukti Bahini/RAW, labels Chittisinghpura (2000), Samjhauta Express (2007), Uri (2016), Pulwama (2019) and Pahalgam (2025) as alleged Indian false-flag operations, and frames Balochistan separatism almost exclusively as an Indian intelligence project — extending the institutionalized false-flag narrative (see 18 May 2025 entry) into a comprehensive, state-sanctioned historical-revisionist document aimed at both domestic and international audiences.",
      type: "psyops", sev: "high",
      platform: "State publication / digital distribution", reach: "National and international audiences",
      date: "2026-05-05", source: "Daily Times / Radio Pakistan / The Diplomatic Insight", actor: "Government of Pakistan / ISPR",
      targets: ["goi","army","west"]
    },
    {
      id: Date.now() - 90000,
      title: "RAND working paper: 'Trees meme' and F-16/AMRAAM dispute dominated Balakot-era Twitter discourse",
      detail: "A Pardee RAND Graduate School working paper analysed roughly 7.4 million tweets (Jan 2019-Jul 2020, ~1 million unique authors; 2.4 million India-origin, 1.1 million Pakistan-origin, ~3 million with no geographic data) referencing the Balakot airstrike and the following day's air skirmish. Pakistani Twitter users rapidly spread a 'trees meme' claiming Indian jets had only hit a forest, not a Jaish-e-Mohammed camp -- circulating well before independent satellite evidence was available, later converging with genuine satellite-imagery discussion once it emerged. A parallel dispute centred on Pakistan's use of F-16 aircraft (initially denied by Islamabad, then partially conceded by ISPR in an April 1 statement while still disputing losses -- a claim that would have been militarily and diplomatically significant since it implied a breach of US export conditions); India's counter-evidence centred on a recovered AMRAAM missile fragment. F-16 discussion became the single dominant topic in the dataset by April 2019, roughly two months after the initial strike.",
      type: "social", sev: "medium",
      platform: "X/Twitter", reach: "7.4 million tweets, ~1 million unique authors",
      date: "2019-02-26", source: "Matthews, Ryseff & Khan (2021), Pardee RAND Graduate School Working Paper WR-A1489-1", actor: "Pakistan-based Twitter users",
      targets: ["army"]
    },
    {
      id: Date.now() - 80000,
      title: "APT36 conducts watering-hole attacks against Indian military and defense organizations",
      detail: "A Pakistani-sponsored threat actor, tracked as APT36 (aka Mythic Leopard, Transparent Tribe), used watering-hole attacks — compromising websites likely to be visited by the intended targets — to target Indian military service members. Documented by the Council on Foreign Relations' Cyber Operations Tracker as a distinct campaign from APT36's more frequently-cited phishing/RAT operations.",
      type: "cyber", sev: "high",
      platform: "Watering-hole (compromised websites)", reach: "Indian military service members",
      date: "2021-05-01", source: "Council on Foreign Relations Cyber Operations Tracker", actor: "APT36 / Transparent Tribe",
      site: "mod", targets: ["army"]
    },
    {
      id: Date.now() - 70000,
      title: "Pakistani state-linked group uses fake apps and websites to spy on Indian and Pakistani military personnel",
      detail: "An unnamed state-linked Pakistani threat group used fake mobile apps and websites to compromise and surveil the personal devices of military personnel in India, as well as personnel in the Pakistani Air Force itself. Documented by the Council on Foreign Relations' Cyber Operations Tracker as a distinct 2023 campaign.",
      type: "cyber", sev: "high",
      platform: "Fake mobile apps / websites", reach: "Military personnel in India and Pakistan",
      date: "2023-05-01", source: "Council on Foreign Relations Cyber Operations Tracker", actor: "Unattributed / crowd-sourced",
      site: "mod", targets: ["army"]
    },
    {
      id: Date.now() - 60000,
      title: "Coordinated fake Army-officer Twitter accounts spread fabricated 'resignation' claims after Article 370 abrogation",
      detail: "In the days following the 5 August 2019 abrogation of Article 370, over 50 fake Twitter accounts impersonating senior Indian Army officers — including Chief of Army Staff Gen. Bipin Rawat, Northern Army Commander Lt Gen Ranbir Singh, former Vice Chief Lt Gen Devraj Anbu, and former Central Army Commander Lt Gen B.S. Negi — posted fabricated messages citing invented mass casualties and announcing fictitious 'resignations' over Kashmir. The most-viral case impersonated retired Col. Vijay Acharya (cloned from his dormant account, created 16 August), falsely claiming 25 of his unit's soldiers had been killed with 'no media coverage.' Fact-checkers found the account was newly created, grammatically inconsistent with an officer's rank, and confirmed via direct contact with Col. Acharya that his identity had been cloned. Pakistani TV channels amplified several of these fabricated accounts as genuine. Twitter suspended over 50 such accounts within 15-20 minutes of each surge, per Indian security officials.",
      type: "social", sev: "high",
      platform: "X/Twitter", reach: "50+ fake accounts, national news amplification",
      date: "2019-08-16", source: "Alt News / BOOM / Factly / The Quint / Hindustan Times / The Print / ANI", actor: "Unattributed / crowd-sourced",
      site: "mod", targets: ["army","kashmir"]
    },
    {
      id: Date.now() - 50000,
      title: "'Kashmir Fight': TRF-operated social media handle threatens migrant Kashmiri Pandit employees",
      detail: "In February 2024, a social media handle called 'Kashmir Fight' — operated by The Resistance Front (TRF), a UAPA-proscribed terrorist organisation widely assessed as a Lashkar-e-Taiba proxy/rebrand — published a series of posts issuing direct threats against migrant Kashmiri Pandit employees in the Valley, aiming to spread fear and unrest. Jammu's State Investigation Agency (SIA) launched an investigation and, on 23 December 2024, filed a chargesheet before the 3rd Additional Sessions Judge, Jammu, against two named operatives: Farhaan Muzaffar Mattoo of Srinagar, who allegedly gathered and passed sensitive data on targeted employees via encrypted platforms, and Sheikh Sajjad Ahmad (alias Sajjad Gul), a Srinagar resident named as the 'mastermind,' now operating from Pakistan. SIA's investigation found Mattoo acted as a conduit relaying employee data to Pakistan-based handlers, who then issued the threats through the platform.",
      type: "psyops", sev: "critical",
      platform: "Social media / encrypted messaging", reach: "Migrant Kashmiri Pandit employee community",
      date: "2024-02-01", source: "J&K Police / State Investigation Agency Jammu / ANI", actor: "The Resistance Front (TRF)",
      targets: ["kashmir"]
    },
    {
      id: Date.now() - 40000,
      title: "ISI directs Lashkar-e-Taiba/TRF and Khalistani proxies toward coordinated psyops in J&K and Punjab",
      detail: "Indian intelligence officials told IANS that ISI is directing proxy groups toward coordinated psychological operations in Jammu & Kashmir and Punjab, aimed at creating fear among migrant workers, government staff and police to disrupt law and order and distract security forces from infiltration and arms-smuggling efforts. In J&K, Lashkar-e-Taiba is reported reviving its established pattern (previously executed via The Resistance Front) of targeting migrant workers and police personnel, this time operating under a further proxy name, the United Liberation Council (ULC); officials cited two recent incidents — a Head Constable targeted and two migrants killed — as part of this pattern. In Punjab, Khalistan Zindabad Force and Babbar Khalsa International were reported using Sikhs for Justice and other foreign-based outfits to circulate similar intimidation messaging aimed at police. Note: this entry is sourced to a single wire report (IANS) syndicated across multiple outlets, attributed to anonymous intelligence officials — treat as a reported claim, not independently confirmed.",
      type: "psyops", sev: "high",
      platform: "Proxy networks / social media", reach: "J&K and Punjab, unquantified",
      date: "2026-08-10", source: "IANS", actor: "ISI / Lashkar-e-Taiba / Khalistan Zindabad Force",
      targets: ["kashmir","sikh"]
    },
    {
      id: Date.now() - 30000,
      title: "SAUSMF sockpuppet network amplifies anti-India narratives using fabricated multi-country personas",
      detail: "South Asian United Social Media Front (SAUSMF), an active X/Twitter account and associated network, has been documented running a large-scale sockpuppet operation: thousands of fabricated profiles using stock photos and national flags (Pakistan, China, Nepal, Afghanistan, Bangladesh, Sri Lanka, Iran, among others) to simulate broad international support for anti-India and pro-Pakistan narratives, including on Kashmir. Independent write-ups and a CLAWS (Centre for Land Warfare Studies) academic case study on Pakistani psychological warfare via Twitter document the network's activity; investigative pieces additionally identify Radio Pakistan (Pakistan's state broadcaster) as a significant amplifier of content originating from the handle, alongside accounts associated with ISPR and PTI messaging. Note: the core existence and pattern of the network is independently verifiable (the account remains publicly active); the specific characterisation of official Pakistani state backing draws on advocacy-oriented Indian sources and should be treated as their assessment rather than an independently confirmed attribution.",
      type: "social", sev: "medium",
      platform: "X/Twitter", reach: "Thousands of sockpuppet profiles reported",
      date: "2019-08-20", source: "CENJOWS / CLAWS case study / DisinfoLab", actor: "SAUSMF",
      targets: ["kashmir","goi"]
    },
  ].map(i => ({ ...i, seed: true }));
