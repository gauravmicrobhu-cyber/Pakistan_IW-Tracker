// ── PUBLIC SUBMISSION PIPELINE CONFIG ──
// The two values below must be filled in after you deploy the Cloudflare Worker + Turnstile
// widget described in worker/README.md. Until then, submissions from the Log Incident tab will
// fail (the endpoint below is a placeholder, not a real one) and the Pending Review tab will
// simply show no live candidates.
//
// SUBMISSION_ENDPOINT is the Cloudflare Worker URL the Log Incident form POSTs to.
// TURNSTILE_SITE_KEY is the PUBLIC Turnstile site key (safe to ship to the browser — this is
// NOT the secret key; the secret key lives only as a Worker secret, see worker/README.md).
export const SUBMISSION_ENDPOINT = 'https://pakistan-iw-tracker.gaurav-microbhu.workers.dev';
export const TURNSTILE_SITE_KEY = '0x4AAAAAAE4RARreZWL1pXoB';

export const GITHUB_OWNER = 'gauravmicrobhu-cyber';
export const GITHUB_REPO = 'Pakistan_IW-Tracker';
