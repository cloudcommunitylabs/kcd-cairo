# KCD Cairo 2027 Website

Official website for **Kubernetes Community Days Cairo 2027**, part of the [CNCF Kubernetes Community Days](https://www.cncf.io/kcds/) program. KCD Cairo is on the [CNCF H1 2027 KCD calendar](https://www.cncf.io/blog/2026/08/20/announcing-h1-2027-kcds/) for **April 2027**.

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
├── gatsby-config.js               # Site metadata; loads the full template only when ENABLE_EVENT_SITE=true
├── src/
│   ├── content/
│   │   ├── event-data.json        # ★ Single source of truth for the landing page (dates, links, sections)
│   │   └── ...                    # OpenEventKit template content (unused until the template is enabled)
│   ├── components/
│   │   ├── layout.js              # Navbar + footer for the landing page
│   │   ├── layout.css             # Landing page styles and brand colours
│   │   └── seo.js                 # <head> metadata
│   ├── utils/event-lifecycle.js   # Decides which links/sections are ready to show
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
| `date.display`, `date.note` | The "When" text in the hero (e.g. `April 2027`). Set `date.iso` (e.g. `2027-04-17`) once the exact date is confirmed; the note disappears and structured data gets a start date. |
| `location.venue`, `location.address` | The "Where" text. While `venue` is empty the page shows `Cairo, Egypt` and the "to be announced" note. |
| `links.registration` | Shows the **Register** button in the navbar and hero. |
| `links.cfp` | Shows **Call for Proposals** in the navbar and **Submit a talk** buttons. |
| `links.sponsorProspectus` | Shows **Sponsor KCD Cairo** / **View the prospectus** buttons. |
| `links.volunteer` | Shows the **Volunteer** button. |
| `links.email` | Shows the contact email in the footer and a **Talk to us** sponsor button. |
| `links.linkedin`, `links.twitter`, `links.cncfCommunity` | Social links in the hero and footer. |
| `sections.*` | Toggle whole sections (`about`, `getInvolved`, `keyDates`, `sponsors`, `speakers`, `schedule`, `team`, `legal`). Navigation items for `schedule`/`speakers`/`sponsors`/`team` only appear when the section is enabled *and* a matching page exists. |
| `keyDates` | Array of `{ "date": "...", "label": "..." }` shown when `sections.keyDates` is `true`. |
| `status` | Set to anything other than `coming-soon` to remove the "Coming soon" badges. |

Leave a link as an empty string (`""`) to keep it hidden.

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

`static/og-image.png` (1200×630) is the social sharing preview, composed from the same assets. Regenerate it if the date or slogan changes.

---

## ☁️ Deployment (Cloudflare Pages)

Deployment mirrors [kcd-new-york](https://github.com/cloudcommunitylabs/kcd-new-york): GitHub Actions builds the site and publishes the `public/` folder to Cloudflare Pages with `wrangler`.

**Workflow:** `.github/workflows/deploy.yml`


- Push to `main` → production deployment.
- Pull request against `main` → preview deployment; the workflow comments the preview URL on the PR.
- `workflow_dispatch` → manual run.

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

---

## 📄 License

See [LICENSE](LICENSE). KCD Cairo is part of the [Kubernetes Community Days](https://www.cncf.io/kcds/) program supported by the [Cloud Native Computing Foundation](https://www.cncf.io/).
