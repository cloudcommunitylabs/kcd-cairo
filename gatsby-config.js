const eventData = require("./src/content/event-data.json");

/**
 * KCD Cairo 2027
 *
 * The site currently ships a lightweight "coming soon" landing page
 * (src/pages/index.js) that needs no external services to build.
 *
 * The full FNTech / OpenEventKit event template (@openeventkit/event-site)
 * is kept in the repo but is only loaded when ENABLE_EVENT_SITE=true, because
 * it requires a live OpenEvent summit API and OAuth credentials at build time.
 * See README.md for the environment variables needed to turn it back on.
 *
 * @type {import('gatsby').GatsbyConfig}
 */
const enableEventSite = process.env.ENABLE_EVENT_SITE === "true";

const siteUrl = process.env.GATSBY_SITE_URL || "https://kcd-cairo-2027.pages.dev";

module.exports = {
  /*flags: {
    DEV_SSR: true
  },*/
  siteMetadata: {
    title: eventData.name,
    description: `${eventData.fullName} — ${eventData.date.display} in ${eventData.location.city}, ${eventData.location.country}. ${eventData.tagline}`,
    siteUrl,
  },
  plugins: [
    ...(enableEventSite ? ["@openeventkit/event-site"] : []),
  ],
};
