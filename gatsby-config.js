const eventData = require("./src/content/event-data.json");
const { getEventPlace } = require("./src/utils/event-details");

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

// "Friday 16 April 2027 at the <venue>, <area>" once the venue is announced,
// otherwise "... in Cairo, Egypt" (see location.announceVenue in event-data.json).
const place = getEventPlace(eventData);
const whenWhere = `${eventData.date.display} ${place.hasVenue ? "at the" : "in"} ${place.short}`;

module.exports = {
  /*flags: {
    DEV_SSR: true
  },*/
  siteMetadata: {
    title: eventData.name,
    description: `${eventData.fullName} — ${whenWhere}. ${eventData.tagline}`,
    siteUrl,
  },
  plugins: [
    ...(enableEventSite ? ["@openeventkit/event-site"] : []),
  ],
};
