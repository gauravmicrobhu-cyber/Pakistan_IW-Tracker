# PRISM Submission Worker — Setup Runbook

This Cloudflare Worker is the relay that lets anonymous visitors submit incidents through the
site's Log Incident form. It exists for exactly one reason: a public browser can't safely hold a
GitHub write token, so this sits in between — it checks a Turnstile challenge, a honeypot field,
and a per-IP rate limit, then opens a GitHub Issue on your behalf using a token that only this
Worker ever sees.

**None of this infrastructure has been deployed or tested by the agent that wrote this code.**
There is no Cloudflare account available in that environment. Everything below is reviewed logic
and unit-tested pure functions (`npm test` from the repo root runs `worker/src/lib.test.js`) —
not a live, end-to-end-verified system. Follow this runbook yourself, then actually submit a test
incident through the live site and confirm a GitHub Issue appears, before considering this done.

## 1. Create a free Cloudflare account

If you don't already have one: go to https://dash.cloudflare.com/sign-up and sign up (free tier
is sufficient for everything here — Workers, KV, and Turnstile all have generous free tiers).

## 2. Install Wrangler (Cloudflare's CLI)

From the `worker/` directory:

```bash
cd worker
npm install
```

This installs `wrangler` as a local devDependency. You can also skip the install and just prefix
every command below with `npx`, e.g. `npx wrangler login`.

## 3. Log in

```bash
npx wrangler login
```

This opens a browser window to authorize Wrangler against your Cloudflare account.

## 4. Create the KV namespace (used for rate limiting)

```bash
npx wrangler kv namespace create RATE_LIMIT_KV
```

This prints an `id`. Open `worker/wrangler.toml` and replace the placeholder:

```toml
[[kv_namespaces]]
binding = "RATE_LIMIT_KV"
id = "REPLACE_AFTER_RUNNING_wrangler_kv_namespace_create"   # <- paste the real id here
```

## 5. Create a GitHub fine-grained personal access token

Go to https://github.com/settings/personal-access-tokens/new (fine-grained tokens, **not** a
classic token — a classic token's scopes are far broader than this Worker needs).

- **Repository access:** "Only select repositories" → select just this repo
  (`gauravmicrobhu-cyber/Pakistan_IW-Tracker`).
- **Permissions:** under "Repository permissions", set **Issues: Read and write**. Leave
  everything else at "No access."
- Generate the token and copy it — you won't be able to see it again.

**Do not use a classic PAT with broad `repo` scope for this.** This token only ever needs to
create Issues on one repo; a fine-grained token scoped that tightly limits the blast radius if it
ever leaks.

Set it as a Worker secret (you'll be prompted to paste it):

```bash
npx wrangler secret put GITHUB_TOKEN
```

## 6. Set up Cloudflare Turnstile (free CAPTCHA alternative)

1. In the Cloudflare dashboard, go to **Turnstile** (left sidebar) → **Add site**.
2. Domain: your GitHub Pages domain (e.g. `gauravmicrobhu-cyber.github.io`).
3. Widget mode: **Managed** (recommended default).
4. Create it. You'll get a **Site Key** (public — goes in frontend code) and a **Secret Key**
   (private — Worker secret only).

Set the secret key:

```bash
npx wrangler secret put TURNSTILE_SECRET_KEY
```

## 7. Deploy the Worker

```bash
npx wrangler deploy
```

This prints a URL that looks like `https://pakistan-iw-tracker.<your-subdomain>.workers.dev` — the
Worker's name (and so its URL) comes from the `name` field in `worker/wrangler.toml`, currently
`pakistan-iw-tracker`. If you ever rename it there, the deployed URL changes too — update
`src/config.js` (step 8) and the site's Turnstile domain (step 6) to match.

Copy the printed URL.

## 8. Wire the frontend config

Open `src/config.js` at the repo root (not in `worker/`) and fill in the two placeholders:

```js
export const SUBMISSION_ENDPOINT = 'https://pakistan-iw-tracker.<your-subdomain>.workers.dev'; // from step 7
export const TURNSTILE_SITE_KEY = '<your Turnstile site key>'; // from step 6
```

Commit and redeploy the site (the existing `.github/workflows/deploy.yml` handles that — pushing
to `main` is enough).

## 9. Add the three GitHub labels this pipeline depends on

In the repo: **Settings → Labels → New label**. Create:

| Label | Suggested color |
|---|---|
| `submission:pending` | `#fbca04` (yellow) |
| `approved` | `#0e8a16` (green) |
| `declined` | `#b60205` (red) |

The `promoted` and `declined-final` labels used after moderation are created automatically the
first time the promote-submission workflow runs (GitHub creates a label on first use if it
doesn't exist), so you don't need to pre-create those two.

## 10. Test it end-to-end

1. Open the live site, go to Log Incident, fill in the form, complete the Turnstile challenge,
   submit.
2. Check the repo's Issues tab — a new Issue labeled `submission:pending` should appear within a
   few seconds.
3. Check the Pending Review tab on the site — it should show that submission (it polls GitHub's
   public API directly, no auth needed).
4. Label the Issue `approved`. Within a minute or two, `.github/workflows/promote-submission.yml`
   should run, append the incident to `src/data/communityIncidents.json`, close the Issue with a
   confirmation comment, and swap the label to `promoted`. The push to `main` triggers the
   existing deploy workflow, so the incident should appear on the live site shortly after.
5. Try `declined` on a second test Issue — it should just close with a comment, no data change.

If any step doesn't behave as described, something in this runbook or the code needs fixing —
please don't assume it's working without actually seeing all five steps happen.

## What this Worker does NOT do

- It does not see or store your GitHub token or Turnstile secret anywhere but Cloudflare's
  encrypted Worker secrets store — they are never logged, never returned in a response body, and
  never present in any frontend code.
- It does not moderate content — it only relays a validated, rate-limited, Turnstile-passed
  submission into a GitHub Issue. All actual moderation (accept/reject) happens when you label
  the Issue on GitHub.
