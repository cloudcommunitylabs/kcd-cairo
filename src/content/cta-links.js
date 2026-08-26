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
