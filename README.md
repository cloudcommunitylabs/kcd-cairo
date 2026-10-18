# KCD Cairo 2027 Website

Official website for **Kubernetes Community Days Cairo 2027**, part of the [CNCF Kubernetes Community Days](https://www.cncf.io/kcds/) program. KCD Cairo is on the [CNCF H1 2027 KCD calendar](https://www.cncf.io/blog/2026/08/20/announcing-h1-2027-kcds/) and takes place on **Friday 16 April 2027**.

The site currently serves a **"coming soon" landing page**. The full event template that this repo was created from (FNTech / OpenEventKit) is still in the repo, just switched off until we are ready to fill it in (see [Full event template](#-full-event-template-openeventkit)).

## 🚀 Quick start

```bash
# Node 20 (see .nvmrc)
yarn install

# Start the dev server at http://localhost:8000
yarn develop

# Production build into ./public
yarn build

# Serve the production build at http://localhost:9000
yarn serve
```

If you hit cache or module errors, run `yarn gatsby-clean` and try again.

---

## 📁 Project structure

```
kcd-cairo/
├── .github/workflows/deploy.yml   # Build + deploy to Cloudflare Pages
├── .github/rulesets/main.json    # Branch ruleset for main (import it in Settings → Rules)
├── .coderabbit.yaml               # CodeRabbit reviews, and approves PRs once its comments are resolved
├── gatsby-config.js               # Site metadata; loads the full template only when ENABLE_EVENT_SITE=true
├── gatsby-node.js                 # Writes the .ics calendar file; keeps an unannounced venue out of the JS bundle
├── src/
│   ├── content/
│   │   ├── event-data.json        # ★ Single source of truth for the landing page (dates, links, sections)
│   │   └── ...                    # OpenEventKit template content (unused until the template is enabled)
│   ├── components/
│   │   ├── layout.js              # Navbar + footer for the landing page
│   │   ├── layout.css             # Landing page styles and brand colours
│   │   └── seo.js                 # <head> metadata
│   ├── utils/event-lifecycle.js   # Decides which links/sections are ready to show
│   ├── utils/event-details.js     # Date, venue (announceVenue) and calendar helpers
│   ├── hooks/use-site-url.js      # siteMetadata.siteUrl for structured data and calendar links
│   └── pages/
│       ├── index.js               # Coming-soon landing page
│       ├── 404.js                 # Not-found page
│       └── content-pages/*.md     # OpenEventKit template pages (unused until the template is enabled)
├── static/
│   ├── brand/                     # Official KCD Cairo 2027 logo assets (SVG)
│   ├── fonts/                     # Self-hosted Lexend + Inter (+ template fonts)
│   ├── favicon.svg, og-image.png, robots.txt
│   └── img/                       # OpenEventKit template assets
└── netlify.toml                   # Legacy Netlify config from the template (not used by Cloudflare)
```

---

## ✏️ Updating the landing page

Everything visible on the landing page is driven by **`src/content/event-data.json`**. Nothing is deleted from the template; sections and buttons simply stay hidden until their data is filled in.

| Field | What it controls |
| --- | --- |
| `date.display`, `date.short`, `date.iso`, `date.note` | `display` is the full date in the hero, the navy "Save the date" band and the meta description (e.g. `Friday 16 April 2027`); `short` is the compact form in the navbar badge (e.g. `16 April 2027`). `iso` (`YYYY-MM-DD`) marks the exact date as confirmed: it switches the "Coming soon" labels to "Save the date", sets the structured data start/end date and turns on the calendar buttons and file (see below). While `iso` is empty, `display` holds the month (e.g. `April 2027`) and `note` is shown under it. |
| `location.city`, `location.country`, `location.countryCode` | The event brand location (`Cairo, Egypt`), used in the hero eyebrow and wherever no venue is shown. `countryCode` (ISO 3166, e.g. `EG`) goes into the structured data. |
| `location.venue`, `location.area`, `location.announceVenue` | The venue name and the area it is in (e.g. `Giza`), shown in the hero "Where", the navy band, the structured data, the meta description and the calendar entry. **`announceVenue`** must be `true` for the venue to appear anywhere; set it to `false` to hide the venue name everywhere on the built site (pages, structured data, meta description, calendar file and Google Calendar link) while keeping the date. The build fails if the venue name still turns up in `public/` while it is `false`. (The name still sits in this file in the public repo; only the built site hides it.) Without a venue the site shows `Cairo, Egypt`, and the venue fields are also stripped from the copy of this file bundled into the site's JavaScript (`src/utils/event-data-loader.js`). |
| `location.address`, `location.note` | Reserved for a street address (not shown yet) and a note shown under "Where" while no venue is announced. |
| `links.registration` | Shows the **Register** button in the navbar and hero. |
| `links.cfp` | Shows **Call for Proposals** in the navbar and **Submit a talk** buttons. |
| `links.sponsorProspectus` | Shows **Sponsor KCD Cairo** / **View the prospectus** buttons. |
| `links.volunteer` | Shows the **Volunteer** button. |
| `links.email` | Shows the contact email in the footer and a **Talk to us** sponsor button. |
| `links.linkedin`, `links.twitter`, `links.cncfCommunity` | Social links in the hero and footer. |
| `sections.*` | Toggle whole sections (`about`, `getInvolved`, `keyDates`, `sponsors`, `speakers`, `schedule`, `team`, `legal`). Navigation items for `schedule`/`speakers`/`sponsors`/`team` only appear when the section is enabled *and* a matching page exists. |
| `keyDates` | Array of `{ "date": "...", "label": "..." }` shown when `sections.keyDates` is `true`. |
| `status` | Set to anything other than `coming-soon` to remove the hero status pill ("Coming soon", or "Save the date" once `date.iso` is set). Until registration opens, the navbar badge shows `date.short` once the date is set, otherwise "Coming soon" while `status` is `coming-soon`. |
| `newsletter.constantContactFormId`, `newsletter.constantContactAccountId` | The "Stay in the loop" sign-up section (Constant Contact inline form) plus a **Get updates** button in the hero. See [Email sign-up](#-email-sign-up-constant-contact). |

Leave a link as an empty string (`""`) to keep it hidden.

### 📅 Add to calendar

Once `date.iso` is set, the navy band shows **Add to Google Calendar** and **Download calendar file (.ics)** buttons for an all-day entry (no session times). Both come from `src/utils/event-details.js`, the same helper that decides whether the venue is shown:

- The Google Calendar button is a `calendar.google.com/calendar/render?action=TEMPLATE` link with the date, the site URL and (only when `announceVenue` is `true`) the venue.
- The `.ics` file is generated at build time by `gatsby-node.js` (`onPostBuild`) into `public/kcd-cairo-2027.ics` (an RFC 5545 all-day event), and served at the same path by `yarn develop`. It is not committed; edit `event-data.json` and rebuild. `static/_headers` tells Cloudflare Pages to serve it as `text/calendar`.

Both links use the site URL from `gatsby-config.js` (`GATSBY_SITE_URL`, defaulting to `https://kcd-cairo-2027.pages.dev`).

### 📬 Email sign-up (Constant Contact)

The sign-up form is Constant Contact's inline form. Two values in `src/content/event-data.json` → `newsletter` control it:

- `constantContactFormId` — the `data-form-id` from the form's inline code (`<div class="ctct-inline-form" data-form-id="…">`).
- `constantContactAccountId` — the `_ctct_m` value from the account's **Universal Code** (Constant Contact → Sign-up Forms → your form → Inline code → *Universal Code*, the line `var _ctct_m = "…"`).

The widget cannot render without `_ctct_m`, so the section, the hero button and the widget only appear once **both** values are set.

How the widget is loaded (`src/components/newsletter-signup.js`):

- The server-rendered HTML puts nothing from Constant Contact in `<head>` except a `preconnect` to `static.ctctcdn.com`: no `_ctct_m` snippet and no widget `<script>`. (Once running, the widget adds its own jQuery `<script>` and `<style>` tags.)
- Once the section has mounted (after React hydration), the component sets `window._ctct_m` and adds the widget script to `<body>`, once per page load. The widget then renders the form into the empty `<div class="ctct-inline-form">`, which React never renders into.
- The widget only looks for that div when it starts. When the section mounts again after client-side navigation (for example the 404 page's **Back to home** link), the component calls `SignUpFormWidget.main()` to render the form again. It only does this while the div is empty and no other render pass is still waiting for its config, so the form never gets rendered twice or gets two submit handlers.
- Until the form appears, the card shows a loading placeholder. After 15 seconds it becomes a hint to refresh the page or allow Constant Contact (`ctctcdn.com`) in content blockers. If the widget script fails to load, the next visit to the section tries again.

Don't paste Constant Contact's universal code or widget `<script>` into a `Head` export or `gatsby-ssr.js`. In `<head>` the widget can render before React hydrates, and React then throws the form away; on client-side navigation Gatsby runs the script again and the widget refuses to load twice ("Universal code snippet was installed more than once"), so the form stays missing until a refresh.

The widget loads from `static.ctctcdn.com` and pulls in its own dependencies (jQuery and Underscore from `cdnjs.cloudflare.com`, reCAPTCHA from `google.com`); the site ships no other third-party script.

### Branding

The site uses the official **KCD Cairo 2027** identity from the Canva logo pack (`KCD_Cairo_2027.pdf`). The vector assets were extracted from it into `static/brand/`:

| File | Use |
| --- | --- |
| `kcd-cairo-lockup-blue.svg` | Horizontal "KCD Cairo 2027" lockup, blue on light (navbar) |
| `kcd-cairo-lockup-white.svg` | Same lockup in white (navy band, footer) |
| `kcd-cairo-skyline.svg` | Cairo skyline illustration (hero) |
| `kcd-cairo-logo.svg` / `kcd-cairo-logo-round.svg` | Full square and round logos (about section, social) |
| `kcd-icon.svg` | Hands-in-hexagon icon (also `static/favicon.svg`) |
| `kcd-growing-cloud-native-together.png` | KCD wordmark with the programme slogan |

Brand colours are defined as CSS variables at the top of `src/components/layout.css`: KCD blue `#0087FF`, navy `#022150`, sky `#4EBBD5` / `#A9D9E3`, sand `#F5D57A` / `#EAC463`. The logo wordmark is set in THICCCBOI; the site uses self-hosted **Lexend** (display) and **Inter** (body) from `static/fonts/` as the closest open-licensed match, so no third-party font requests are made.

`static/og-image.png` (1200×630) is the social sharing preview, composed from the same assets. Regenerate it if the date or slogan changes, and keep the venue name out of it so `location.announceVenue` stays the single switch for the venue.

---

## ☁️ Deployment (Cloudflare Pages)

Deployment mirrors [kcd-new-york](https://github.com/cloudcommunitylabs/kcd-new-york): GitHub Actions builds the site and publishes the `public/` folder to Cloudflare Pages with `wrangler`.

**Workflow:** `.github/workflows/deploy.yml`


- Push to `main` → production deployment.
- Pull request against `main` → preview deployment; the workflow comments the preview URL on the PR.
- `workflow_dispatch` → manual run.

**Deploy order**

- Production deploys run one at a time. A deploy that has started always finishes. If more merges land meanwhile, only the newest waiting run is kept; the others show as *cancelled* in the Actions tab, which is expected.
- A production run deploys only if its commit is still the newest on `main` when it starts. If `main` has moved on (the run waited in the queue, or it's a re-run of an older run), it skips the deploy and starts a fresh run on `main`, so the site never goes back to an older version and catches up to the latest `main`.
- To redeploy, use **Run workflow** on `main` in the Actions tab rather than re-running an old run; runs from before October 2026 don't have these checks. Don't cancel a waiting production run, because it's the one that will deploy the newest merge. If one was cancelled, use Run workflow on `main` to catch up.
- If the newest `main` doesn't build, production stays on its last good deploy until `main` is fixed or the change is reverted.
- To roll back, use *Rollback* on an earlier deployment in the Cloudflare Pages dashboard for an immediate fix, then revert the change on `main` so the next deploy doesn't bring it back.
- Each pull request's preview runs in its own lane, so previews never hold up production. A new push to a PR cancels that PR's older preview run. Pull requests from forks build but skip the preview, since they don't get the Cloudflare secrets.
- A run that takes longer than 30 minutes is cancelled, so a stuck run can't hold up production.

**One-time setup**

1. In the Cloudflare dashboard create a Pages project named **`kcd-cairo-2027`** (Direct Upload; no Git integration needed). To use a different name, change `CLOUDFLARE_PAGES_PROJECT` in the workflow.
2. Add these repository secrets in GitHub (**Settings → Secrets and variables → Actions**):
   - `CLOUDFLARE_API_TOKEN` — API token with the *Cloudflare Pages: Edit* permission.
   - `CLOUDFLARE_ACCOUNT_ID` — your Cloudflare account ID.
3. (Optional) Attach the custom domain to the Pages project in Cloudflare and set `GATSBY_SITE_URL` (e.g. as a workflow `env`) so canonical/Open Graph URLs use it. Until then the site URL defaults to `https://kcd-cairo-2027.pages.dev`.

**Manual deploy**

```bash
yarn build
npx wrangler pages deploy public --project-name=kcd-cairo-2027
```

---

## 🧩 Full event template (OpenEventKit)

This repository started from FNTech's `fnevent-tier1-default-theme`, which uses the [`@openeventkit/event-site`](https://www.npmjs.com/package/@openeventkit/event-site) Gatsby theme (schedule, registration, sponsors, lobby, CMS, etc.). None of it has been removed:

- `src/content/**` — template content (site settings, navbar, footer, marketing page, ads, sponsors…)
- `src/pages/content-pages/*.md` — template content pages
- `src/@openeventkit/event-site/cms/config` — CMS config override
- `static/img`, `static/fonts` — template assets
- `netlify.toml` — the template's Netlify config

The theme is **not loaded** by default because it needs a live OpenEvent summit API and OAuth credentials at build time. To turn it back on, set `ENABLE_EVENT_SITE=true` together with the OpenEvent variables the theme expects (`GATSBY_SUMMIT_API_BASE_URL`, `GATSBY_SUMMIT_ID`, `GATSBY_IDP_BASE_URL`, OAuth client settings, etc. — the full list is in `node_modules/@openeventkit/event-site/env.template` after `yarn install`) in the build environment, then update `src/content/**` with KCD Cairo content. When the theme is enabled it generates its own home page, so remove or rename `src/pages/index.js` at that point.

---

## 🤝 Contributing

1. Create a branch: `git checkout -b feature/your-change`
2. Edit `src/content/event-data.json` or the page components and check with `yarn develop`.
3. Open a pull request to `main`; the workflow posts a Cloudflare preview URL to review.
4. CodeRabbit reviews the PR. Fix or reply to its comments; once they're resolved it approves, and the PR can be merged.

**Reviews and merging**

`main` is protected by the ruleset in `.github/rulesets/main.json`:

- A PR needs one approval, every review conversation resolved, and the `deploy` and `CodeRabbit` checks passing. Pushing new commits dismisses earlier approvals.
- CodeRabbit gives that approval (`request_changes_workflow` in `.coderabbit.yaml`). It requests changes when it leaves inline comments, and approves once they're resolved, the latest commit has been reviewed and no pre-merge check is failing. An approval doesn't merge anything; someone with write access still clicks Merge.
- Requiring the `CodeRabbit` check means CodeRabbit has to finish reviewing the latest commit before anyone can merge, even if a person has already approved. If it requested changes, that blocks the merge until it approves or someone with write access dismisses its review.
- PR authors can't force an approval with `@coderabbitai approve` (`allow_author_approval: false`). If CodeRabbit hasn't approved after its comments are resolved, comment `@coderabbitai review`. CodeRabbit also pauses after reviewing 5 commits on a PR; the same command gets the latest commit reviewed.
- Repository admins can bypass the rules when merging a PR, for example during a CodeRabbit outage. Nobody can push straight to `main`, force-push it or delete it.

To apply the ruleset: **Settings → Rules → Rulesets → New ruleset → Import a ruleset**, pick `.github/rulesets/main.json`, check that the bypass list shows *Repository admin*, then **Create**. If you change the ruleset in Settings later, export it and update this file so the two stay in sync. GitHub leaves the bypass list out of exported rulesets, so keep the `bypass_actors` entry from this file, and check the bypass list after every import.

---

## 📄 License

See [LICENSE](LICENSE). KCD Cairo is part of the [Kubernetes Community Days](https://www.cncf.io/kcds/) program supported by the [Cloud Native Computing Foundation](https://www.cncf.io/).
