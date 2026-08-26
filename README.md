# KCD Cairo 2027

Website for Kubernetes Community Days Cairo 2027. Currently a coming-soon
landing page.

## Run it

```bash
nvm use          # Node 20.19.4, from .nvmrc
yarn install
yarn develop     # https://localhost:8000 (the script passes -S; first run
                 # generates a local dev cert and may prompt for sudo)
```

```bash
yarn test        # unit tests (bare `node --test`, see note below)
yarn build       # production build into public/
yarn serve       # serve the production build on :9000
bash scripts/verify-build.sh   # assert the build actually rendered its content
node scripts/check-contrast.mjs # assert colours meet WCAG AA
```

## Editing content

Everything on the page comes from **`src/content/event-data.json`**. No code
change is needed to update copy or links.

| Field | Effect |
| --- | --- |
| `name` | Page `<title>` and meta description |
| `shortName` | Footer copy |
| `city`, `country`, `year` | Headline and metadata |
| `dateLabel` | Status line. Keep it honest — there is no confirmed date yet |
| `siteUrl` | Canonical URL and Open Graph URL |
| `links.linkedin`, `links.x` | Full profile URLs |
| `links.contactEmail` | Bare address; `mailto:` is added for you |
| `newsletter.constantContactFormId` | Constant Contact inline form id |
| `newsletter.constantContactAccountId` | The `_ctct_m` value from the account's universal code |
| `program.kcd`, `program.cncf` | The two footer links, to the KCD program and the CNCF |

**A link or form renders only when its value is non-empty.** Leave a field as
`""` and it disappears from the page — no dead anchors, no empty boxes.

The signup form needs **both** newsletter fields. Constant Contact's loader
aborts without `_ctct_m`, so a form id alone would render an empty div.

## Deployment

Pushes to `main` and pull requests trigger `.github/workflows/deploy.yml`, which
tests, builds, verifies the output, then deploys to Cloudflare Pages via
`wrangler-action`. Pull requests get a preview URL posted as a comment, upserted
in place so reruns don't spam the thread.

**Pull requests from forks do not deploy.** GitHub withholds repository secrets
from fork-triggered runs and gives them a read-only token, so the deploy and
comment steps are skipped deliberately and a step in the log says so. Tests,
build and output verification still run, so a fork PR is still fully checked —
it just has no preview URL. To preview a community contribution, push the branch
to this repo.

Superseded PR runs are cancelled; pushes to `main` are not, so a fast-follow
commit cannot interrupt a production deploy mid-flight.

Required setup, outside this repo:

1. A Cloudflare Pages project named `kcd-cairo-2027`.
2. Repo secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.
3. `kcdcairo.com` added as a custom domain in the Pages project. `static/CNAME`
   records the intent but Cloudflare does not read it.

## A note on `yarn test`

The script is bare `node --test`, with no path or glob. That is deliberate and
worth not "tidying": a directory argument works on Node 20 but throws
`MODULE_NOT_FOUND` on Node 22, and a glob argument works on Node 22 but fails on
Node 20. Only the bare form works on both, and CI runs Node 20 while most
developers are on something newer.

The trade-off is that bare discovery walks the whole repo rather than just
`src/`. It excludes `node_modules`, but any file anywhere matching Node's default
test patterns (`*.test.js`, `*-test.js`, `test-*.js`, a `test/` directory) will be
picked up. Today that is exactly one file, `src/content/cta-links.test.js`.

## The parked openeventkit template

This repo began as a fork of the OCP Global Summit site, built on the
[`@openeventkit/event-site`](https://www.npmjs.com/package/@openeventkit/event-site)
Gatsby theme. **The theme is intentionally disabled** in `gatsby-config.js`.

Its `onPreBootstrap` unconditionally fetches marketing settings, summit, events,
speakers and sponsors from FNTech's OpenEvent API using an OAuth
client-credentials grant. Without those credentials the build fails before any
page is created:

```
ValidationError: Invalid options provided to simple-oauth2 "auth.tokenHost" is required
  gatsby-node.js:257  onPreBootstrap
```

Nothing was deleted. The dependency is still installed and all the original
content is on disk under `src/content/` and `src/pages/content-pages/`. Those
`.md` pages produce no routes while the theme is off, because Gatsby's default
page scan only picks up `js/jsx/ts/tsx` — that is what keeps the OCP content
hidden without editing it.

To revive the theme you need **both**: uncomment the plugin in
`gatsby-config.js`, *and* supply the variables in
`node_modules/@openeventkit/event-site/env.template`. Uncommenting alone will
not build.

That is still not sufficient to get the theme's own pages back:

- The theme runs `gatsby-plugin-page-creator` over the **site's** `src/pages`
  (`node_modules/@openeventkit/event-site/src/utils/filePath.js` sets
  `PAGES_DIR_PATH = "src/pages"`) and ships its own
  `src/pages/index.js`. The site's `src/pages/index.js` takes precedence over
  the theme's, so after uncommenting the plugin `/` would still be this
  coming-soon page. You must also remove or rename this repo's
  `src/pages/index.js` (and `src/pages/index.css`, see next point) for the
  theme's homepage to take over.
- `src/pages/index.css`'s global resets (`:root`, `*`, `html`, `body`) compile
  into Gatsby's shared stylesheet, which is linked on **every** page in
  production, not into a page-scoped chunk. Left in place, the dark `#0b1016`
  background, `margin: 0` and the font stack would apply site-wide and fight
  the theme's own Sass. Removing or renaming `src/pages/index.css` alongside
  `src/pages/index.js` avoids that.

The `build` script also invokes `cross-env`, which today resolves only as a
transitive dependency of `@openeventkit/event-site` — it is not declared
directly in `package.json`. If the theme dependency is ever removed as "dead
weight" without noticing this, `build` breaks with `cross-env: command not
found` and nothing in the error points at the theme as the cause.

Design notes live in `docs/superpowers/specs/`. `docs/superpowers/plans/` also
has the original implementation plan for this landing page — kept as a
historical record of how it was built, not maintained, and not a source of
current truth.

## Licence

Part of the [Kubernetes Community Days](https://kubernetescommunitydays.org/)
program, supported by the [CNCF](https://www.cncf.io/). See `LICENSE`.

`src/images/kcd-logo-white.svg` is CNCF artwork from
[`cncf/artwork`](https://github.com/cncf/artwork)
(`other/kubernetes-community-days/horizontal/white/kcd-logo-white.svg`),
licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), used
here under that licence's attribution requirement.
