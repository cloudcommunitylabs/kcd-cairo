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
  /*flags: {
    DEV_SSR: true
  },*/
  plugins: [
    // "@openeventkit/event-site"
  ]
};
