# KCD Cairo 2027 Coming-Soon Landing Page — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a KCD Cairo 2027 coming-soon page deployed to Cloudflare Pages, without deleting any part of the existing OCP template.

**Architecture:** The `@openeventkit/event-site` theme is commented out of `gatsby-config.js` because it cannot build without FNTech's OpenEvent API. A self-contained `src/pages/index.js` renders from a single `src/content/event-data.json`. All template files stay on disk; the OCP `.md` content pages go dormant automatically because Gatsby's default page scan ignores `.md`.

**Tech Stack:** Gatsby 5.16.1, React 18.2.0, plain CSS (no framework), Node's built-in test runner (`node --test`, zero new dependencies), GitHub Actions + `cloudflare/wrangler-action@v3`.

**Spec:** `docs/superpowers/specs/2026-08-23-kcd-cairo-2027-landing-design.md`

## Global Constraints

- Node `20.19.4` (from `.nvmrc`); CI reads it via `node-version-file`.
- Delete nothing. `@openeventkit/event-site` stays in `package.json` and `yarn.lock`. `src/content/**` (except the new `event-data.json` and `cta-links*.js`), `src/pages/content-pages/**`, `src/images/**` (except the new logo), `static/img/**`, `netlify.toml` are untouched.
- No new runtime dependencies beyond `react` and `react-dom`, both pinned to `18.2.0`.
- No CSS framework, no CSS-in-JS.
- Cloudflare Pages project name is exactly `kcd-cairo-2027`.
- Site URL is exactly `https://kcdcairo.com`.
- Event date is unknown: copy says `Coming 2027` and `Date to be announced`. Never invent a date.
- Colors: ground `#0B1016`, Kubernetes blue `#326CE5`, sand `#E0A458`, body text `#F2F5F8`, muted text `#9AA7B4`.
- `#326CE5` on `#0B1016` measures ~4.0:1 — **below** the 4.5:1 AA floor for body text. Use it only for borders, large text and non-text UI. Use `#E0A458` (~8.8:1) or `#F2F5F8` for anything small.
- Brand mark is the **white** variant (`kcd-logo-white.svg`), not `color` — the ground is dark and CNCF ships the white variant for exactly this.
- Every commit message ends with `Co-Authored-By: Claude <noreply@anthropic.com>`. This repo has no JIRA project; its history uses plain conventional commits, so no ticket ID.
- Stage files explicitly by name. Never `git add -A` or `git add .`.

---

### Task 1: Park the theme and render the hero from config

**Files:**
- Modify: `gatsby-config.js` (whole file)
- Modify: `package.json:20-23` (dependencies block)
- Modify: `yarn.lock` (regenerated)
- Create: `src/content/event-data.json`
- Create: `src/pages/index.js`

**Interfaces:**
- Consumes: nothing.
- Produces: `src/content/event-data.json` with keys `name`, `shortName`, `city`, `country`, `year`, `dateLabel`, `siteUrl`, `links.{linkedin,x,contactEmail}`, `newsletter.{constantContactFormId,constantContactAccountId}`, `program.{kcd,cncf}`. `src/pages/index.js` default-exports `ComingSoonPage`.

- [ ] **Step 1: Write the failing check**

Create `scripts/verify-build.sh`:

```bash
#!/usr/bin/env bash
# Verifies the built landing page actually rendered its content.
# Usage: bash scripts/verify-build.sh
set -euo pipefail

OUT="public/index.html"

fail() { echo "FAIL: $1" >&2; exit 1; }

[ -f "$OUT" ] || fail "$OUT does not exist"

for needle in "Cairo" "2027" "Date to be announced"; do
  grep -qF "$needle" "$OUT" || fail "$OUT is missing literal '$needle'"
done

for dormant in registration travel faq contact help; do
  if [ -d "public/$dormant" ]; then
    fail "public/$dormant/ exists — dormant OCP page produced a route"
  fi
done

echo "PASS: build output verified"
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `bash scripts/verify-build.sh`
Expected: `FAIL: public/index.html does not exist` (exit 1). If `public/` is stale from an earlier run, `rm -rf public` first.

- [ ] **Step 3: Create the content config**

Create `src/content/event-data.json`:

```json
{
  "name": "Kubernetes Community Days Cairo 2027",
  "shortName": "KCD Cairo 2027",
  "city": "Cairo",
  "country": "Egypt",
  "year": "2027",
  "dateLabel": "Date to be announced",
  "siteUrl": "https://kcdcairo.com",
  "links": {
    "linkedin": "https://www.linkedin.com/company/kcd-cairo",
    "x": "",
    "contactEmail": ""
  },
  "newsletter": {
    "constantContactFormId": "a539b1a8-b115-4dec-9f68-e4b018488b17",
    "constantContactAccountId": ""
  },
  "program": {
    "kcd": "https://kubernetescommunitydays.org/",
    "cncf": "https://www.cncf.io/"
  }
}
```

- [ ] **Step 4: Park the theme in `gatsby-config.js`**

Replace the entire file:

```js
const eventData = require("./src/content/event-data.json");

/**
 * @type {import('gatsby').GatsbyConfig}
 *
 * The @openeventkit/event-site theme is intentionally NOT enabled.
 *
 * Its gatsby-node.js `onPreBootstrap` unconditionally fetches marketing
 * settings, summit, events, speakers and sponsors from FNTech's OpenEvent API
 * using an OAuth client-credentials grant. Without those credentials the build
 * dies before a single page is created:
 *
 *   ValidationError: Invalid options provided to simple-oauth2
 *   "auth.tokenHost" is required        gatsby-node.js:257 onPreBootstrap
 *
 * To re-enable it you must BOTH restore the plugin entry below AND supply the
 * variables in node_modules/@openeventkit/event-site/env.template — at minimum
 * GATSBY_SUMMIT_ID, GATSBY_SUMMIT_API_BASE_URL, GATSBY_MARKETING_API_BASE_URL,
 * GATSBY_IDP_BASE_URL, GATSBY_OAUTH_TOKEN_PATH, GATSBY_OAUTH2_CLIENT_ID_BUILD,
 * GATSBY_OAUTH2_CLIENT_SECRET_BUILD and GATSBY_BUILD_SCOPES. Uncommenting on
 * its own will not build.
 *
 * The template's content under src/content and src/pages/content-pages is left
 * untouched for that day. Those .md pages produce no routes while the theme is
 * off, because Gatsby's default page scan only picks up js/jsx/ts/tsx.
 */
module.exports = {
  siteMetadata: {
    title: eventData.name,
    description: `${eventData.name}. Coming ${eventData.year} to ${eventData.city}, ${eventData.country}.`,
    siteUrl: eventData.siteUrl
  },
  plugins: [
    // "@openeventkit/event-site"
  ]
};
```

- [ ] **Step 5: Declare React explicitly in `package.json`**

Replace the `dependencies` block. Leave `scripts` and `devDependencies` alone:

```json
  "dependencies": {
    "@openeventkit/event-site": "2.1.62",
    "gatsby": "~5.16.1",
    "react": "18.2.0",
    "react-dom": "18.2.0"
  },
```

- [ ] **Step 6: Refresh the lockfile**

Run: `yarn install`
Then confirm CI's exact command still works: `yarn install --frozen-lockfile`
Expected: both exit 0. `git diff --stat yarn.lock` should show a small change, not a rewrite.

- [ ] **Step 7: Write the minimal page**

Create `src/pages/index.js`:

```jsx
import * as React from "react";
import eventData from "../content/event-data.json";

export default function ComingSoonPage() {
  const { shortName, city, year, dateLabel, program } = eventData;

  return (
    <main>
      <p>Kubernetes Community Days</p>
      <h1>
        {city} <span>{year}</span>
      </h1>
      <p>Coming {year}</p>
      <p>{dateLabel}</p>
      <footer>
        <p>
          {shortName} is part of the{" "}
          <a href={program.kcd}>Kubernetes Community Days</a> program, supported
          by the <a href={program.cncf}>Cloud Native Computing Foundation</a>.
        </p>
      </footer>
    </main>
  );
}
```

- [ ] **Step 8: Build and run the check**

Run: `rm -rf public .cache && yarn build && bash scripts/verify-build.sh`
Expected: build exits 0, then `PASS: build output verified`.

- [ ] **Step 9: Confirm the theme is genuinely out of the graph**

Run: `yarn build 2>&1 | grep -iE 'openeventkit|fnvirtual|simple-oauth2|ValidationError' || echo "CLEAN: no theme activity"`
Expected: `CLEAN: no theme activity`.

Do **not** grep for `onPreBootstrap`: Gatsby core logs that lifecycle name on
every build regardless of which plugins are active, so it matches always and
proves nothing. The four patterns above are theme-specific — a live theme
produces all of them.

- [ ] **Step 10: Commit**

```bash
git add gatsby-config.js package.json yarn.lock src/content/event-data.json src/pages/index.js scripts/verify-build.sh
git commit -m "$(cat <<'MSG'
feat(landing): park openeventkit theme and render Cairo 2027 hero

The theme's onPreBootstrap requires FNTech's OpenEvent API and OAuth build
credentials, so it cannot build here. Comment it out of the plugin list, keep
the dependency and all template content on disk, and serve a self-contained
page driven by src/content/event-data.json.

Co-Authored-By: Claude <noreply@anthropic.com>
MSG
)"
```

---

### Task 2: CTA link resolution

Pure logic with a real branch, so it gets real unit tests. Node 20 ships a test runner, so this adds no dependency.

**Files:**
- Create: `src/content/cta-links.js`
- Test: `src/content/cta-links.test.js`
- Modify: `package.json` (add `test` script)
- Modify: `src/pages/index.js` (render the CTA row)

**Interfaces:**
- Consumes: `event-data.json`'s `links` object from Task 1.
- Produces: CommonJS module exporting `buildCtaLinks(links)` → `Array<{ key: string, label: string, href: string }>`, and `CTA_DEFINITIONS`. CommonJS so `node --test` can require it without a bundler; webpack's interop lets `index.js` import it with ESM syntax.

- [ ] **Step 1: Write the failing tests**

Create `src/content/cta-links.test.js`:

```js
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { buildCtaLinks } = require("./cta-links");

test("returns nothing when no links are configured", () => {
  assert.deepEqual(buildCtaLinks({}), []);
});

test("returns nothing when links is undefined", () => {
  assert.deepEqual(buildCtaLinks(undefined), []);
});

test("skips empty and whitespace-only values", () => {
  assert.deepEqual(buildCtaLinks({ linkedin: "", x: "   " }), []);
});

test("ignores non-string values", () => {
  assert.deepEqual(buildCtaLinks({ linkedin: 42, x: null }), []);
});

test("uses profile URLs verbatim", () => {
  assert.deepEqual(
    buildCtaLinks({ linkedin: "https://www.linkedin.com/company/kcd-cairo" }),
    [
      {
        key: "linkedin",
        label: "LinkedIn",
        href: "https://www.linkedin.com/company/kcd-cairo"
      }
    ]
  );
});

test("prefixes contactEmail with mailto:", () => {
  assert.deepEqual(buildCtaLinks({ contactEmail: "hello@kcdcairo.com" }), [
    {
      key: "contactEmail",
      label: "Email us",
      href: "mailto:hello@kcdcairo.com"
    }
  ]);
});

test("trims surrounding whitespace before building the href", () => {
  assert.deepEqual(buildCtaLinks({ contactEmail: "  hello@kcdcairo.com  " }), [
    {
      key: "contactEmail",
      label: "Email us",
      href: "mailto:hello@kcdcairo.com"
    }
  ]);
});

test("preserves definition order regardless of config key order", () => {
  const result = buildCtaLinks({
    contactEmail: "hello@kcdcairo.com",
    x: "https://x.com/kcdcairo",
    linkedin: "https://www.linkedin.com/company/kcd-cairo"
  });
  assert.deepEqual(
    result.map((link) => link.key),
    ["linkedin", "x", "contactEmail"]
  );
});
```

- [ ] **Step 2: Add the test script to `package.json`**

Add to `scripts`:

```json
    "test": "node --test",
```

Bare `node --test`, with no path argument. Measured across the two Node majors
in play:

| Invocation | Node 20.8.0 | Node 22.22.2 |
| --- | --- | --- |
| `node --test src/` | passes | `MODULE_NOT_FOUND` |
| `node --test src/content/` | passes | `MODULE_NOT_FOUND` |
| `node --test "src/**/*.test.js"` | `Could not find` | passes |
| `node --test src/content/cta-links.test.js` | passes | passes |
| `node --test` | passes | passes |

Directory arguments and glob arguments each work on exactly one of the two
majors, in opposite directions — so either would pass locally and fail in CI.
Bare `node --test` uses Node's built-in discovery, needs no glob support,
excludes `node_modules`, and picks up future test files without edits.

- [ ] **Step 3: Run the tests to verify they fail**

Run: `yarn test`
Expected: FAIL — `Cannot find module './cta-links'`.

- [ ] **Step 4: Write the minimal implementation**

Create `src/content/cta-links.js`:

```js
/**
 * Order here is the render order on the page, independent of key order in
 * event-data.json.
 */
const CTA_DEFINITIONS = [
  { key: "linkedin", label: "LinkedIn", toHref: (value) => value },
  { key: "x", label: "X", toHref: (value) => value },
  { key: "contactEmail", label: "Email us", toHref: (value) => `mailto:${value}` }
];

const normalize = (value) => (typeof value === "string" ? value.trim() : "");

/**
 * A CTA is visible if and only if its configured value is non-empty, so an
 * unconfigured link cannot render as a dead anchor.
 */
function buildCtaLinks(links) {
  return CTA_DEFINITIONS.map((definition) => ({
    definition,
    value: normalize(links?.[definition.key])
  }))
    .filter(({ value }) => value !== "")
    .map(({ definition, value }) => ({
      key: definition.key,
      label: definition.label,
      href: definition.toHref(value)
    }));
}

module.exports = { buildCtaLinks, CTA_DEFINITIONS };
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `yarn test`
Expected: `# pass 8`, `# fail 0`.

- [ ] **Step 6: Render the CTA row**

In `src/pages/index.js`, add the import:

```jsx
import { buildCtaLinks } from "../content/cta-links";
```

Inside the component, after the existing destructure:

```jsx
  const ctaLinks = buildCtaLinks(eventData.links);
```

And between the `dateLabel` paragraph and the `<footer>`:

```jsx
      {ctaLinks.length > 0 && (
        <nav aria-label="Contact and social links">
          <ul>
            {ctaLinks.map(({ key, label, href }) => (
              <li key={key}>
                <a
                  href={href}
                  {...(key === "contactEmail"
                    ? {}
                    : { target: "_blank", rel: "noopener noreferrer" })}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
```

- [ ] **Step 7: Verify the rendered output**

Run: `rm -rf public .cache && yarn build && grep -c 'linkedin.com/company/kcd-cairo' public/index.html`
Expected: build exits 0 and grep prints `1` or more.

Run: `grep -o 'mailto:[^"]*' public/index.html || echo "ABSENT: no mailto, contactEmail is empty"`
Expected: `ABSENT: no mailto, contactEmail is empty` — proving the empty value renders nothing.

- [ ] **Step 8: Commit**

```bash
git add src/content/cta-links.js src/content/cta-links.test.js package.json src/pages/index.js
git commit -m "$(cat <<'MSG'
feat(landing): derive CTA links from config values

A link renders only when its configured value is non-empty, so the page ships
safely with blanks and filling one later needs no code change. Visibility is
derived from the value rather than a parallel feature flag, which removes the
chance of the two disagreeing.

Co-Authored-By: Claude <noreply@anthropic.com>
MSG
)"
```

---

### Task 3: Constant Contact newsletter embed

**Files:**
- Modify: `src/pages/index.js`

**Interfaces:**
- Consumes: `event-data.json`'s `newsletter.constantContactFormId` and `newsletter.constantContactAccountId`.
- Produces: nothing consumed by later tasks. Task 5 styles the `.signup` and `.signup__heading` class names introduced here.

Verified against the live loader: it targets `.ctct-inline-form[data-form-id="<id>"]`, it reads `window._ctct_m`, and it does **not** need the `id="signupScript"` attribute from Constant Contact's copy-paste snippet.

- [ ] **Step 1: Add the loader constant and the gate**

At the top of `src/pages/index.js`, add to the imports:

```jsx
import { Script } from "gatsby";
```

Below the imports, at module scope:

```jsx
const CTCT_LOADER_SRC =
  "https://static.ctctcdn.com/js/signup-form-widget/current/signup-form-widget.min.js";

const newsletter = eventData.newsletter ?? {};
const ctctFormId = (newsletter.constantContactFormId ?? "").trim();
const ctctAccountId = (newsletter.constantContactAccountId ?? "").trim();

/**
 * Both halves are required. The loader aborts without _ctct_m, so a form id on
 * its own would render a permanently empty div.
 */
const isNewsletterConfigured = ctctFormId !== "" && ctctAccountId !== "";
```

- [ ] **Step 2: Render the form above the CTA row**

Insert immediately before the `{ctaLinks.length > 0 && (` block:

```jsx
      {isNewsletterConfigured && (
        <section className="signup">
          <h2 className="signup__heading">Get launch updates</h2>
          <div className="ctct-inline-form" data-form-id={ctctFormId} />
          <Script src={CTCT_LOADER_SRC} strategy="idle" />
        </section>
      )}
```

- [ ] **Step 3: Define `_ctct_m` in `Head` so it exists before the loader runs**

Add at the bottom of `src/pages/index.js`:

```jsx
export const Head = () => (
  <>
    {isNewsletterConfigured && (
      <script
        dangerouslySetInnerHTML={{
          __html: `var _ctct_m = ${JSON.stringify(ctctAccountId)};`
        }}
      />
    )}
  </>
);
```

`JSON.stringify` rather than string interpolation, so a value containing a quote cannot break out of the script.

- [ ] **Step 4: Verify the disabled state emits nothing**

`constantContactAccountId` is empty at this point, so the embed must be absent.

Run: `rm -rf public .cache && yarn build && bash scripts/verify-build.sh`
Expected: build exits 0, `PASS`.

Run: `grep -c 'ctct-inline-form\|_ctct_m\|ctctcdn' public/index.html || echo "ABSENT: embed correctly omitted"`
Expected: `ABSENT: embed correctly omitted` — no orphan div, no wasted third-party request.

- [ ] **Step 5: Verify the enabled state emits both halves**

Temporarily set `constantContactAccountId` to `"testaccounthash"` in `src/content/event-data.json`.

Run: `rm -rf public .cache && yarn build && grep -o 'ctct-inline-form' public/index.html && grep -o '_ctct_m = "testaccounthash"' public/index.html`
Expected: both grep results print.

Then revert the value to `""`:

Run: `git checkout -- src/content/event-data.json && grep '"constantContactAccountId"' src/content/event-data.json`
Expected: shows `""` again.

- [ ] **Step 6: Commit**

```bash
git add src/pages/index.js
git commit -m "$(cat <<'MSG'
feat(landing): embed Constant Contact signup when configured

The organisers use an inline form rather than a hosted page. The loader needs
both a form id and the account's _ctct_m value, so the embed renders only when
both are present; a form id alone would produce a permanently empty div.

_ctct_m is assigned in Head and the loader is injected with strategy="idle", so
the variable exists before the loader runs and the script never blocks paint.

Co-Authored-By: Claude <noreply@anthropic.com>
MSG
)"
```

---

### Task 4: Brand mark and page metadata

**Files:**
- Create: `src/images/kcd-logo-white.svg`
- Modify: `src/pages/index.js`

**Interfaces:**
- Consumes: `event-data.json`'s `name`, `shortName`, `city`, `country`, `year`, `dateLabel`, `siteUrl`.
- Produces: the `Head` export gains title/description/canonical/OG/Twitter tags alongside the `_ctct_m` script from Task 3.

- [ ] **Step 1: Fetch the official mark**

Run:

```bash
curl -fsSL -o src/images/kcd-logo-white.svg \
  https://raw.githubusercontent.com/cncf/artwork/main/other/kubernetes-community-days/horizontal/white/kcd-logo-white.svg
head -c 120 src/images/kcd-logo-white.svg
```

Expected: exits 0 and prints an `<?xml ... <svg` prefix. CNCF artwork is CC-BY 4.0 and KCD organisers are its intended users. Committed rather than hotlinked so the build has no network dependency.

- [ ] **Step 2: Render the mark instead of the placeholder text**

In `src/pages/index.js`, add the import:

```jsx
import kcdMark from "../images/kcd-logo-white.svg";
```

Replace `<p>Kubernetes Community Days</p>` with:

```jsx
      <img
        className="hero__mark"
        src={kcdMark}
        alt="Kubernetes Community Days"
        width="290"
        height="93"
      />
```

- [ ] **Step 3: Expand `Head` with metadata**

Replace the whole `Head` export from Task 3 with:

```jsx
export const Head = () => {
  const { name, city, country, year, dateLabel, siteUrl } = eventData;
  const description = `${name} is coming to ${city}, ${country}. ${dateLabel}. Sign up to hear first when the date, call for papers and tickets are announced.`;

  return (
    <>
      <html lang="en" />
      <title>{`${name} — Coming ${year}`}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={siteUrl} />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={name} />
      <meta property="og:title" content={`${name} — Coming ${year}`} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={siteUrl} />

      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={`${name} — Coming ${year}`} />
      <meta name="twitter:description" content={description} />

      <meta name="theme-color" content="#0B1016" />

      {isNewsletterConfigured && (
        <script
          dangerouslySetInnerHTML={{
            __html: `var _ctct_m = ${JSON.stringify(ctctAccountId)};`
          }}
        />
      )}
    </>
  );
};
```

No `og:image` tag: there is no artwork to point at, and a tag referencing a missing file is worse than its absence. Listed as a follow-up in the spec.

- [ ] **Step 4: Verify metadata reached the output**

Run: `rm -rf public .cache && yarn build && bash scripts/verify-build.sh`
Expected: build exits 0, `PASS`.

Run:

```bash
for needle in '<title>Kubernetes Community Days Cairo 2027 — Coming 2027</title>' \
              'rel="canonical" href="https://kcdcairo.com"' \
              'og:description' \
              'kcd-logo-white' \
              'lang="en"'; do
  grep -qF "$needle" public/index.html && echo "OK: $needle" || echo "MISSING: $needle"
done
```

Expected: five `OK:` lines.

- [ ] **Step 5: Commit**

```bash
git add src/images/kcd-logo-white.svg src/pages/index.js
git commit -m "$(cat <<'MSG'
feat(landing): add official KCD mark and page metadata

Uses the white horizontal variant from cncf/artwork, which is the variant CNCF
ships for dark backgrounds. Adds title, description, canonical, Open Graph and
Twitter tags derived from event-data.json. No og:image, because there is no
artwork to reference and a tag pointing at a missing file is worse than none.

Co-Authored-By: Claude <noreply@anthropic.com>
MSG
)"
```

---

### Task 5: Visual design

**Files:**
- Create: `src/pages/index.css`
- Modify: `src/pages/index.js` (import the stylesheet, add the motif, add class names)

**Interfaces:**
- Consumes: the class names introduced in Tasks 1–4 (`hero__mark`, `signup`, `signup__heading`).
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Write the stylesheet**

Create `src/pages/index.css`:

```css
:root {
  --ground: #0b1016;
  --ground-raised: #121a24;
  --k8s-blue: #326ce5;
  --sand: #e0a458;
  --text: #f2f5f8;
  --text-muted: #9aa7b4;
  --measure: 34rem;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  background: var(--ground);
}

body {
  margin: 0;
  font-family: "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI",
    Roboto, "Helvetica Neue", Arial, sans-serif;
  color: var(--text);
  -webkit-font-smoothing: antialiased;
}

.page {
  position: relative;
  isolation: isolate;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2.5rem;
  min-height: 100vh;
  min-height: 100dvh;
  padding: 4rem 1.5rem 2.5rem;
  overflow: hidden;
  text-align: center;
}

/* The motif is decoration only; it must never compete with the type. */
.page__motif {
  position: absolute;
  inset: -10%;
  z-index: -1;
  width: 120%;
  height: 120%;
  opacity: 0.13;
  -webkit-mask-image: radial-gradient(ellipse at 50% 38%, #000 0%, transparent 72%);
  mask-image: radial-gradient(ellipse at 50% 38%, #000 0%, transparent 72%);
}

.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.hero__mark {
  width: min(290px, 72vw);
  height: auto;
}

.hero__place {
  margin: 0;
  font-size: clamp(3.25rem, 17vw, 8.5rem);
  font-weight: 800;
  line-height: 0.9;
  letter-spacing: -0.03em;
}

.hero__year {
  display: block;
  margin-top: 0.35rem;
  /* letter-spacing appends a trailing gap after the last glyph, which throws
     the centring off by half that amount. Pull it back. */
  margin-right: -0.34em;
  color: var(--sand);
  font-size: clamp(1.5rem, 6vw, 2.75rem);
  font-weight: 600;
  letter-spacing: 0.34em;
}

.hero__status {
  margin: 0;
  max-width: var(--measure);
  color: var(--text-muted);
  font-size: 1.0625rem;
  line-height: 1.6;
}

.hero__rule {
  width: 3.5rem;
  height: 3px;
  border: 0;
  margin: 0;
  background: var(--k8s-blue);
}

.signup {
  width: 100%;
  max-width: var(--measure);
  padding: 1.75rem 1.5rem;
  border: 1px solid rgba(50, 108, 229, 0.45);
  border-radius: 14px;
  background: var(--ground-raised);
}

.signup__heading {
  margin: 0 0 1rem;
  font-size: 1.125rem;
  font-weight: 600;
  letter-spacing: 0.01em;
}

.links {
  margin: 0;
}

.links__list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
  margin: 0;
  padding: 0;
  list-style: none;
}

.links__link {
  display: inline-block;
  padding: 0.6rem 1.25rem;
  border: 1px solid rgba(242, 245, 248, 0.24);
  border-radius: 999px;
  color: var(--text);
  font-size: 0.9375rem;
  text-decoration: none;
  transition: border-color 160ms ease, color 160ms ease;
}

.links__link:hover,
.links__link:focus-visible {
  border-color: var(--sand);
  color: var(--sand);
}

:where(a):focus-visible {
  outline: 2px solid var(--sand);
  outline-offset: 3px;
}

.footer {
  max-width: var(--measure);
  margin-top: auto;
  color: var(--text-muted);
  font-size: 0.875rem;
  line-height: 1.6;
}

.footer p {
  margin: 0 0 0.4rem;
}

.footer a {
  color: var(--sand);
  text-decoration: none;
  border-bottom: 1px solid rgba(224, 164, 88, 0.4);
}

.footer a:hover,
.footer a:focus-visible {
  border-bottom-color: var(--sand);
}

@media (prefers-reduced-motion: reduce) {
  .links__link {
    transition: none;
  }
}
```

- [ ] **Step 2: Wire the stylesheet, the motif and the class names**

In `src/pages/index.js`, add below the other imports:

```jsx
import "./index.css";
```

Replace the component's returned JSX with this, keeping the existing `eventData`, `ctaLinks` and newsletter logic above it:

```jsx
  return (
    <main className="page">
      <svg className="page__motif" aria-hidden="true" focusable="false">
        <defs>
          {/* Eight-point khatam star — a nod to Cairo's geometric tradition,
              built from two squares so it needs no image asset. */}
          <pattern
            id="kcd-khatam"
            width="80"
            height="80"
            patternUnits="userSpaceOnUse"
          >
            <g fill="none" stroke="#326ce5" strokeWidth="1">
              <rect x="20" y="20" width="40" height="40" />
              <rect
                x="20"
                y="20"
                width="40"
                height="40"
                transform="rotate(45 40 40)"
              />
            </g>
            <circle cx="40" cy="40" r="1.75" fill="#e0a458" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#kcd-khatam)" />
      </svg>

      <section className="hero">
        <img
          className="hero__mark"
          src={kcdMark}
          alt="Kubernetes Community Days"
          width="290"
          height="93"
        />
        {/* The space matters: without it the accessible name is "Cairo2027". */}
        <h1 className="hero__place">
          {city}{" "}
          <span className="hero__year">{year}</span>
        </h1>
        <hr className="hero__rule" />
        <p className="hero__status">
          Coming {year} to {country}. {dateLabel} — the call for papers, tickets
          and schedule are on their way.
        </p>
      </section>

      {isNewsletterConfigured && (
        <section className="signup">
          <h2 className="signup__heading">Get launch updates</h2>
          <div className="ctct-inline-form" data-form-id={ctctFormId} />
          <Script src={CTCT_LOADER_SRC} strategy="idle" />
        </section>
      )}

      {ctaLinks.length > 0 && (
        <nav className="links" aria-label="Contact and social links">
          <ul className="links__list">
            {ctaLinks.map(({ key, label, href }) => (
              <li key={key}>
                <a
                  className="links__link"
                  href={href}
                  {...(key === "contactEmail"
                    ? {}
                    : { target: "_blank", rel: "noopener noreferrer" })}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <footer className="footer">
        <p>
          {shortName} is part of the{" "}
          <a href={program.kcd} target="_blank" rel="noopener noreferrer">
            Kubernetes Community Days
          </a>{" "}
          program, supported by the{" "}
          <a href={program.cncf} target="_blank" rel="noopener noreferrer">
            Cloud Native Computing Foundation
          </a>
          .
        </p>
        <p>© {new Date().getFullYear()} {shortName}</p>
      </footer>
    </main>
  );
```

The component's destructure must now include everything used above:

```jsx
  const { shortName, city, country, year, dateLabel, program } = eventData;
```

- [ ] **Step 3: Verify contrast against the values actually shipped**

Create `scripts/check-contrast.mjs`:

```js
// WCAG 2.1 relative luminance and contrast ratio.
const channel = (eight) => {
  const s = eight / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};

const luminance = (hex) => {
  const [r, g, b] = hex
    .replace("#", "")
    .match(/../g)
    .map((pair) => channel(parseInt(pair, 16)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const ratio = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const GROUND = "#0b1016";
const RAISED = "#121a24";

const checks = [
  ["body text on ground", "#f2f5f8", GROUND, 4.5],
  ["muted text on ground", "#9aa7b4", GROUND, 4.5],
  ["sand link on ground", "#e0a458", GROUND, 4.5],
  ["heading on raised panel", "#f2f5f8", RAISED, 4.5],
  ["year (large text) on ground", "#e0a458", GROUND, 3],
  ["blue rule (non-text) on ground", "#326ce5", GROUND, 3]
];

let failed = 0;
for (const [label, fg, bg, floor] of checks) {
  const value = ratio(fg, bg);
  const ok = value >= floor;
  if (!ok) failed += 1;
  console.log(
    `${ok ? "PASS" : "FAIL"}  ${value.toFixed(2)}:1  (needs ${floor}:1)  ${label}`
  );
}

if (failed > 0) {
  console.error(`\n${failed} contrast check(s) failed`);
  process.exit(1);
}
console.log("\nAll contrast checks pass");
```

Run: `node scripts/check-contrast.mjs`
Expected: every line `PASS`, then `All contrast checks pass`, exit 0. If any line fails, adjust that color in `index.css` and in this script together, then re-run — the Global Constraints colors are a starting point, not a contract.

- [ ] **Step 4: Rebuild and verify**

Run: `rm -rf public .cache && yarn build && bash scripts/verify-build.sh && yarn test`
Expected: build exits 0, `PASS: build output verified`, `# fail 0`.

- [ ] **Step 5: Check the built page renders at narrow width**

Run: `yarn serve` and open `http://localhost:9000` at a 320px-wide viewport.
Expected: no horizontal scrollbar, the mark and headline stay inside the viewport, nothing clipped. Stop the server when done.

- [ ] **Step 6: Verify the fully-collapsed state leaves no empty region**

The spec requires that with no newsletter and no links, sections 4 and 5 vanish
without leaving a gap or an empty bordered panel. Neither is exercised by the
shipped config, so force it once.

Temporarily set `links.linkedin` to `""` in `src/content/event-data.json`, then:

```bash
rm -rf public .cache && yarn build
grep -c 'links__list\|signup' public/index.html || echo "ABSENT: both optional sections collapsed"
```
Expected: `ABSENT: both optional sections collapsed`.

Open `yarn serve` at `http://localhost:9000` and confirm the hero and footer sit
with no orphaned gap or stray border between them. Because `.page` uses flex
`gap`, an absent child contributes no space — this step confirms that rather than
assuming it.

Then restore the value:

```bash
git checkout -- src/content/event-data.json
grep '"linkedin"' src/content/event-data.json
```
Expected: shows the LinkedIn URL again.

- [ ] **Step 7: Commit**

```bash
git add src/pages/index.css src/pages/index.js scripts/check-contrast.mjs
git commit -m "$(cat <<'MSG'
feat(landing): style the coming-soon page

Dark ground with Kubernetes blue as the anchor and a sand accent for Cairo. The
background motif is an eight-point khatam star built from two rotated squares,
so it needs no image asset and stays purely decorative.

Kubernetes blue measures ~4.0:1 on this ground, below the AA floor for body
text, so it is used only for the rule and panel borders. scripts/check-contrast.mjs
asserts that against the values actually shipped rather than leaving it to eye.

Co-Authored-By: Claude <noreply@anthropic.com>
MSG
)"
```

---

### Task 6: Cloudflare Pages deployment

**Files:**
- Create: `.github/workflows/deploy.yml`
- Create: `static/CNAME`

**Interfaces:**
- Consumes: `yarn test` script from Task 2, `yarn build` from Task 1, `scripts/verify-build.sh` from Task 1.
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Add the CNAME**

Run: `printf 'kcdcairo.com\n' > static/CNAME && cat static/CNAME`
Expected: prints `kcdcairo.com`. Matches `kcd-new-york/static/CNAME`. Cloudflare Pages reads custom domains from project settings, so this is parity and intent, not the mechanism.

- [ ] **Step 2: Write the workflow**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main
  workflow_dispatch:

concurrency:
  group: pages-${{ github.head_ref || github.ref_name }}
  cancel-in-progress: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version-file: '.nvmrc'
          cache: 'yarn'

      - name: Install dependencies
        run: yarn install --frozen-lockfile

      - name: Run tests
        run: yarn test

      - name: Build Gatsby site
        run: yarn build

      - name: Verify build output
        run: bash scripts/verify-build.sh

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages deploy public --project-name=kcd-cairo-2027 --branch=${{ github.head_ref || github.ref_name }}

      - name: Comment preview URL on PR
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            const branch = context.payload.pull_request.head.ref;
            const sha = context.payload.pull_request.head.sha.substring(0, 8);
            const alias = branch.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
            const url = `https://${alias}.kcd-cairo-2027.pages.dev`;

            const marker = '<!-- kcd-cairo-preview -->';
            const body = [
              marker,
              '## Cloudflare Pages preview',
              '',
              `**Preview:** ${url}`,
              '',
              'Worth checking:',
              '- Headline and "Coming 2027" copy, with no invented event date',
              '- Signup form renders only when the Constant Contact account id is set',
              '- Social and email links appear only for values present in `src/content/event-data.json`',
              '- Layout holds at 320px width with no horizontal scroll',
              '- No OCP content leaking in (no /registration, /travel or /faq routes)',
              '',
              `*${sha} on \`${branch}\`*`
            ].join('\n');

            const { data: comments } = await github.rest.issues.listComments({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.payload.pull_request.number
            });

            const existing = comments.find((c) => c.body.includes(marker));

            if (existing) {
              await github.rest.issues.updateComment({
                owner: context.repo.owner,
                repo: context.repo.repo,
                comment_id: existing.id,
                body
              });
              return;
            }

            await github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.payload.pull_request.number,
              body
            });
```

Differences from `kcd-new-york`'s version, each deliberate:
- A hidden `<!-- kcd-cairo-preview -->` marker identifies the bot comment. NY matches on a visible emoji heading and on `user.type === 'Bot'`, which breaks the moment the heading is reworded.
- `yarn test` and the build-output verification run before deploy, so a broken build cannot reach Cloudflare.
- `concurrency` cancels superseded runs per branch.
- The review checklist describes this page. NY's lists floor plans, transit tabs and a photo gallery, none of which exist here.

- [ ] **Step 3: Validate the workflow parses**

Run:

```bash
node -e "const fs=require('fs');const s=fs.readFileSync('.github/workflows/deploy.yml','utf8');const bad=s.split('\n').filter(l=>/\t/.test(l));if(bad.length){console.error('tabs found in YAML');process.exit(1)}console.log('no tabs')"
```
Expected: `no tabs`.

Run: `gh workflow list 2>/dev/null || echo "not yet pushed — expected"`
Expected: either a list or the fallback message. The workflow's real validation is the first push.

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/deploy.yml static/CNAME
git commit -m "$(cat <<'MSG'
ci(pages): deploy to Cloudflare Pages

Ports kcd-new-york's wrangler-action workflow. Adds a test and build-output gate
before deploy so a broken build cannot reach Cloudflare, identifies the preview
comment with a hidden marker instead of a visible heading, and cancels
superseded runs per branch.

Requires a Cloudflare Pages project named kcd-cairo-2027 to exist, plus the
CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID repo secrets.

Co-Authored-By: Claude <noreply@anthropic.com>
MSG
)"
```

---

### Task 7: README

**Files:**
- Modify: `README.md` (whole file)

**Interfaces:**
- Consumes: everything above.
- Produces: nothing.

- [ ] **Step 1: Replace the stock starter readme**

The current `README.md` is the unmodified Gatsby minimal-starter text and describes neither this repo nor this event. Replace it entirely:

```markdown
# KCD Cairo 2027

Website for Kubernetes Community Days Cairo 2027. Currently a coming-soon
landing page.

## Run it

```bash
nvm use          # Node 20.19.4, from .nvmrc
yarn install
yarn develop     # http://localhost:8000
```

```bash
yarn test        # unit tests (node --test)
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
| `city`, `country`, `year` | Headline and metadata |
| `dateLabel` | Status line. Keep it honest — there is no confirmed date yet |
| `links.linkedin`, `links.x` | Full profile URLs |
| `links.contactEmail` | Bare address; `mailto:` is added for you |
| `newsletter.constantContactFormId` | Constant Contact inline form id |
| `newsletter.constantContactAccountId` | The `_ctct_m` value from the account's universal code |

**A link or form renders only when its value is non-empty.** Leave a field as
`""` and it disappears from the page — no dead anchors, no empty boxes.

The signup form needs **both** newsletter fields. Constant Contact's loader
aborts without `_ctct_m`, so a form id alone would render an empty div.

## Deployment

Pushes to `main` and pull requests trigger `.github/workflows/deploy.yml`, which
tests, builds, verifies the output, then deploys to Cloudflare Pages via
`wrangler-action`. Pull requests get a preview URL posted as a comment.

Required setup, outside this repo:

1. A Cloudflare Pages project named `kcd-cairo-2027`.
2. Repo secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.
3. `kcdcairo.com` added as a custom domain in the Pages project. `static/CNAME`
   records the intent but Cloudflare does not read it.

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

Design notes live in `docs/superpowers/specs/`.

## Licence

Part of the [Kubernetes Community Days](https://kubernetescommunitydays.org/)
program, supported by the [CNCF](https://www.cncf.io/). See `LICENSE`.
```

- [ ] **Step 2: Verify the documented commands actually work**

Run: `yarn test && rm -rf public .cache && yarn build && bash scripts/verify-build.sh && node scripts/check-contrast.mjs`
Expected: all four succeed. Any failure means the README documents something untrue — fix the README or the code, not the claim.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "$(cat <<'MSG'
docs: replace starter readme with KCD Cairo instructions

The previous readme was the unmodified Gatsby minimal-starter text. Documents
the content config, the derived-visibility rule, Cloudflare setup, and why the
openeventkit theme is parked and what reviving it requires.

Co-Authored-By: Claude <noreply@anthropic.com>
MSG
)"
```

---

## Final verification before opening the PR

Run every gate from the spec's Verification section, in order, and paste real
output. No completion claim on a green exit code alone.

- [ ] `yarn install --frozen-lockfile` exits 0 against the committed lockfile
- [ ] `yarn test` — 8 passing, 0 failing
- [ ] `rm -rf public .cache && yarn build` exits 0
- [ ] `bash scripts/verify-build.sh` prints `PASS`
- [ ] `node scripts/check-contrast.mjs` prints `All contrast checks pass`
- [ ] `yarn build 2>&1 | grep -iE 'openeventkit|fnvirtual|simple-oauth2|ValidationError'` finds nothing (not `onPreBootstrap` — Gatsby core logs that name unconditionally)
- [ ] `ls public/` contains `index.html` and no `registration/`, `travel/`, `faq/`
- [ ] Every non-empty URL in `event-data.json` returns 2xx/3xx:
      `node -e 'const d=require("./src/content/event-data.json");const u=[...Object.values(d.links),...Object.values(d.program)].filter(v=>v&&v.startsWith("http"));Promise.all(u.map(x=>fetch(x,{method:"HEAD",redirect:"follow"}).then(r=>console.log(r.status,x)).catch(e=>console.log("ERR",x,e.message))))'`
- [ ] `git status --short` is clean apart from intended files
- [ ] PR opened as **draft** (per CLAUDE.md), body under 150 words, and the two
      Cloudflare prerequisites stated in it
