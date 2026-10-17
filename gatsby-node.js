/**
 * Site-level Gatsby Node APIs for the KCD Cairo 2027 landing page.
 *
 * - Publishes the "add to calendar" file (/kcd-cairo-2027.ics) built from
 *   src/content/event-data.json by src/utils/event-details.js, the same helper
 *   behind the Google Calendar link on the page. Nothing is written while the
 *   exact date is unknown, and the venue is left out unless
 *   location.announceVenue is true.
 * - Strips the venue from the copy of event-data.json bundled into the site's
 *   JavaScript while location.announceVenue is not true
 *   (src/utils/event-data-loader.js).
 *
 * Gatsby runs these alongside the @openeventkit/event-site theme's own
 * gatsby-node.js when ENABLE_EVENT_SITE=true. The theme implements neither
 * onPostBuild nor onCreateDevServer, and both files' onCreateWebpackConfig
 * only call setWebpackConfig, which Gatsby merges.
 */
const fs = require("fs");
const path = require("path");
const eventData = require("./src/content/event-data.json");
const { buildIcs, getCalendarFileName, hasVenue } = require("./src/utils/event-details");

// Every built file is scanned except binary assets.
const LEAK_CHECK_SKIP_EXTENSIONS = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".webp", ".avif", ".ico",
  ".woff", ".woff2", ".ttf", ".otf", ".eot", ".pdf", ".mp4", ".webm",
]);

function* walkFiles(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walkFiles(full);
    } else if (!LEAK_CHECK_SKIP_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      yield full;
    }
  }
}

/**
 * Safety net for location.announceVenue: while the venue is not announced,
 * its name must not appear anywhere in the built site. Run from a clean
 * public/ (CI always does; locally run `yarn gatsby-clean` after switching
 * announceVenue off, since Gatsby keeps old bundles in public/).
 */
function findVenueLeaks(publicDir) {
  const venue = ((eventData.location || {}).venue || "").trim();
  if (!venue || hasVenue(eventData) || !fs.existsSync(publicDir)) {
    return [];
  }
  const needle = venue.toLowerCase();
  const leaks = [];
  for (const file of walkFiles(publicDir)) {
    if (fs.readFileSync(file, "utf8").toLowerCase().includes(needle)) {
      leaks.push(path.relative(publicDir, file));
    }
  }
  return leaks;
}

const getSiteUrl = (store) => {
  const { config } = store.getState();
  return (config && config.siteMetadata && config.siteMetadata.siteUrl) || "";
};

exports.onCreateWebpackConfig = ({ actions, store }) => {
  const { directory } = store.getState().program;
  actions.setWebpackConfig({
    module: {
      rules: [
        {
          test: path.join(directory, "src", "content", "event-data.json"),
          use: [path.join(directory, "src", "utils", "event-data-loader.js")],
        },
      ],
    },
  });
};

exports.onPostBuild = async ({ store, reporter }) => {
  const { program } = store.getState();
  const publicDir = path.join(program.directory, "public");

  const ics = buildIcs(eventData, getSiteUrl(store));
  if (ics) {
    const file = path.join(publicDir, getCalendarFileName(eventData));
    await fs.promises.writeFile(file, ics, "utf8");
    reporter.info(`Wrote calendar file ${path.relative(program.directory, file)}`);
  } else {
    reporter.info("event-data.json has no exact date yet, so no calendar file was written");
  }

  const leaks = findVenueLeaks(publicDir);
  if (leaks.length) {
    reporter.panicOnBuild(
      `location.announceVenue is not true, but the venue name appears in ${leaks.length} built file(s): ` +
        `${leaks.slice(0, 10).join(", ")}. If you just switched announceVenue off, run "yarn gatsby-clean" and build again.`
    );
  }
};

// `gatsby develop` never runs onPostBuild, so serve the same file there.
exports.onCreateDevServer = ({ app, store }) => {
  app.get(`/${getCalendarFileName(eventData)}`, (req, res) => {
    const ics = buildIcs(eventData, getSiteUrl(store));
    if (!ics) {
      res.sendStatus(404);
      return;
    }
    res.type("text/calendar; charset=utf-8").send(ics);
  });
};
