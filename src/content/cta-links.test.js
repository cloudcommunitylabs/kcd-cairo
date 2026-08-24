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
