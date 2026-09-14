export const pendingSeed = [
  {
    id: "pending-20260817-01", // fixed, stable ID — NOT Date.now(), so Promote/Dismiss decisions survive page reloads
    title: "Fake letter: Pakistani accounts claim India asked Pakistan to hand over Imran Khan as a 'political prisoner'",
    detail: "Pakistani social media accounts circulated a fabricated letter in late November 2025 falsely claiming the Government of India had formally requested Pakistan send former Prime Minister Imran Khan to India as a 'political prisoner.' PIB's Fact Check Unit issued an official statement on 1 December 2025 declaring the letter false, baseless, and part of an ongoing disinformation campaign being pushed by Pakistan against India, and advised the public to rely only on official government statements rather than circulating social media documents.",
    type: "psyops", sev: "medium",
    platform: "X/Twitter, WhatsApp", reach: "Unquantified; national news-cycle pickup",
    date: "2025-12-01", source: "PIB Fact Check", actor: "Pakistani propaganda accounts",
    foundDate: "2026-08-17",
    pullNote: "Single-source (PIB) claim — this pull found no independent media corroboration beyond the PIB statement itself. Source tier is 'gov' (high), but it's one official statement, not cross-verified by outside outlets — worth a second check before promoting if you want that distinction to matter."
  },
  {
    id: "pending-20260817-02", // fixed, stable ID — NOT Date.now(), so Promote/Dismiss decisions survive page reloads
    title: "Fake claim: Indian telecom engineer 'Nitin Mohan' arrested in Bahrain for spying for Mossad",
    detail: "A viral claim circulated in March 2026 alleging Indian telecommunications engineer Nitin Mohan had been arrested by Bahraini authorities for espionage on behalf of Israel's Mossad, accompanied by a fabricated arrest photo. Independent fact-checks by Factly, Fact Crescendo, BOOM and Newschecker found no Bahraini or Indian official confirmation of any such arrest and identified the accompanying image as digitally fabricated; The Quint's WebQoof desk reached the same conclusion independently. DFRAC separately attributed amplification of the claim to a Pakistan-linked coordinated account network (including handles posting as 'ProudIndianNav' and 'Shadowfox_11') active alongside other fabricated claims during the March 2026 Iran-Israel-US tension cycle, under hashtags including #BahrainArrestsIndianSpy — the same wave that produced the Rajnath Singh and PM Modi deepfakes already logged under 'AI deepfake of Army Chief Gen Upendra Dwivedi and fake Navy officer account claim Indian complicity in Israel-Iran ship incident.'",
    type: "psyops", sev: "high",
    platform: "X/Twitter, WhatsApp", reach: "Viral cross-platform; exact reach unquantified",
    date: "2026-03-12", source: "Factly / Fact Crescendo / BOOM / Newschecker / The Quint", actor: "Pakistan-linked accounts (DFRAC network attribution, not independently re-verified this pull)",
    foundDate: "2026-08-17",
    pullNote: "5 independent IFCN-affiliated fact-checkers agree the claim itself is fabricated — solid ground for promoting the core claim. DFRAC's specific network/account attribution (@ProudIndianNav, @Shadowfox_11) is DFRAC's own investigative finding and wasn't independently re-verified in this pull; consider whether to keep, trim, or caveat that part before promoting."
  },
  {
    id: "pending-20260831-01",
    title: "AI-generated deepfake of President Murmu circulated by Pakistani propaganda accounts",
    detail: "In late November 2025, Pakistani propaganda-linked social media accounts circulated a digitally altered, AI-generated video of President Droupadi Murmu making false statements, intended to mislead audiences about extremism and the state of secularism in India. The Fact Check Unit of the Press Information Bureau flagged the video as fabricated, confirmed no such statement had been made by the President, and shared the genuine unedited footage, urging the public to verify suspicious claims before sharing.",
    type: "psyops", sev: "high",
    platform: "Social media (platform not specified in source)", reach: "Unquantified",
    date: "2025-11-27", source: "PIB Fact Check / All India Radio (newsonair.gov.in)", actor: "Pakistani propaganda accounts",
    foundDate: "2026-08-31",
    pullNote: "Single-source (PIB/AIR) claim, similar sourcing profile to pending-20260817-01 — no independent outlet corroboration found in this pull. Targets the Head of State specifically, which is why it's flagged 'high' despite the thin sourcing; worth weighing that against the single-source caveat before promoting."
  },
  {
    id: "pending-20260831-02",
    title: "ISPR launches counter-narrative offensive and fake-handle campaign against Discovery's 'Declassified: Operation Sindoor' documentary",
    detail: "Following the 15 August 2026 premiere of Discovery's two-part documentary 'Declassified: Operation Sindoor' — featuring Indian military leadership on the planning and execution of the operation — Pakistan's Inter-Services Public Relations (ISPR) launched a public counter-narrative campaign disputing the documentary's account and questioning India's stated success rate. Indian intelligence officials cited by IANS said ISPR has been directed to continuously question the documentary's authenticity, and that Pakistani Army/ISI-linked social media handles already active in an information-warfare campaign since Operation Sindoor were expected to amplify the pushback with manipulated videos and images aimed at discrediting the Indian armed forces and government, particularly for international audiences.",
    type: "social", sev: "medium",
    platform: "ISPR official channels; Pakistani Army/ISI-linked social media handles", reach: "Unquantified; ongoing at time of reporting",
    date: "2026-08-19", source: "IANS (via NewsGram)", actor: "ISPR / Pakistan Army-ISI-linked handles",
    foundDate: "2026-08-31",
    pullNote: "Single-wire-source (IANS), relying partly on anonymous intelligence-official quotes — treat as a lead worth watching rather than a fully corroborated incident until a second outlet or an on-record source confirms. Freshest item found this pull (4 days old relative to pull date)."
  },
  {
    id: "pending-20260902-01",
    title: "AI-generated deepfake falsely attributes political comments to Lt Gen Manjinder Singh",
    detail: "On 31 October 2025, PIB's Fact Check unit identified a digitally altered video circulating via Pakistani propaganda accounts that falsely attributed comments to Lieutenant General Manjinder Singh, Commander of the South Western Army, claiming he had criticised Indian Army exercises as 'political optics to boost the image for the Bihar elections.' PIB confirmed the video was AI-generated and that no such statement was made — the genuine underlying footage, recorded in Bikaner, Rajasthan, shows Lt Gen Singh discussing the Army's actual training posture and the 'New Normal' doctrine on responding to terror acts.",
    type: "psyops", sev: "high",
    platform: "Social media (Pakistani propaganda accounts)", reach: "Unquantified",
    date: "2025-10-31", source: "PIB Fact Check (via ANI/Tribune India)", actor: "Pakistani propaganda accounts",
    foundDate: "2026-09-02",
    pullNote: "Single-source (PIB/ANI) but a clear, named target and explicit AI-generation confirmation. Falls in a gap between the two prior pulls' search terms rather than being newly occurred — a reminder that date-bounded pulls can still miss items from well before the pull window. Flagged 'high' given it targets a serving general officer and ties the fabricated quote to a live domestic political controversy (Bihar elections), which is a distinct escalation pattern from the earlier deepfakes in this registry."
  },
  {
    id: "pending-20260902-02",
    title: "ISPR calls the Sindoor documentary 'propaganda,' extending the campaign flagged in the prior pull",
    detail: "Roughly a week before this pull, ISPR issued a fresh public statement on the Discovery documentary 'Declassified: Operation Sindoor' (already tracked as pending-20260831-02), calling it a 'Bollywood-style' production and accusing its creators of having 'hastily compiled propaganda video to project a military blunder as a successful endeavour.' The statement invoked Pakistan's own 'Marka-i-Haq' framing, saying 'more than a year after Marka-i-Haq, India refuses to face the harsh reality.' Reported via Caliber.az, citing Kashmir Media Service.",
    type: "social", sev: "medium",
    platform: "ISPR official statements, amplified via Kashmir Media Service", reach: "Unquantified",
    date: "2026-08-25", source: "Caliber.az, citing Kashmir Media Service", actor: "ISPR",
    foundDate: "2026-09-02",
    pullNote: "Two removes from the primary source (Caliber.az citing Kashmir Media Service, a Pakistan-administered-Kashmir outlet with its own alignment) — treat the direct quotes as attributed to ISPR but not independently re-verified against an ISPR primary release. This is best read as a continuation of pending-20260831-02 rather than a standalone incident — consider merging the two if both are promoted, since they describe the same ongoing campaign against the same documentary."
  }
].map(i => ({ ...i, pending: true }));

