/**
 * Webpack loader for src/content/event-data.json, registered in gatsby-node.js.
 *
 * The pages import event-data.json directly, so webpack would otherwise ship
 * the whole file (venue included) in the site's JavaScript. This drops the
 * venue fields from the bundled copy unless location.announceVenue is true.
 * gatsby-config.js and gatsby-node.js read the full file in Node and go
 * through hasVenue() / getEventPlace() instead.
 */
const { withoutHiddenVenue } = require("./event-details");

module.exports = function eventDataLoader(source) {
  return JSON.stringify(withoutHiddenVenue(JSON.parse(source)), null, 2);
};
