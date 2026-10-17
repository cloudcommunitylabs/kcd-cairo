/**
 * Event date, place and calendar helpers built from src/content/event-data.json.
 *
 * Shared by the landing page (src/pages/index.js, src/components/layout.js),
 * gatsby-config.js (meta description) and gatsby-node.js (the .ics calendar
 * file), so it is plain CommonJS with no dependencies: Node can require it at
 * build time and webpack bundles it for the browser.
 *
 * The venue is only ever read through hasVenue() / getEventPlace(). Setting
 * location.announceVenue to false removes the venue name from every page, the
 * structured data, the meta description and both calendar links, while the
 * date stays.
 */
"use strict";

const hasText = (value) => typeof value === "string" && value.trim().length > 0;

// Calendar apps match updates to an entry people already imported by its UID,
// so keep it fixed (it deliberately does not follow GATSBY_SITE_URL).
const CALENDAR_UID_DOMAIN = "kcd-cairo-2027.pages.dev";
const CALENDAR_PRODID = "-//KCD Cairo//KCD Cairo 2027 website//EN";

const slugify = (value) =>
  String(value || "event")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const trimSiteUrl = (siteUrl) => (hasText(siteUrl) ? siteUrl.trim().replace(/\/+$/, "") : "");

/** True only when the organisers have switched the venue on and named it. */
function hasVenue(eventData) {
  const location = (eventData && eventData.location) || {};
  return location.announceVenue === true && hasText(location.venue);
}

/**
 * eventData without the venue fields unless the venue is announced. Applied
 * to the copy of event-data.json bundled into the site's JavaScript (see
 * ./event-data-loader.js), so an unannounced venue never reaches the browser.
 */
function withoutHiddenVenue(eventData) {
  if (!eventData || !eventData.location || hasVenue(eventData)) {
    return eventData;
  }
  const location = Object.assign({}, eventData.location);
  delete location.venue;
  delete location.area;
  delete location.address;
  return Object.assign({}, eventData, { location });
}

/**
 * The confirmed event day from date.iso ("YYYY-MM-DD"), or null while the
 * exact date is not known. One-day event: `end` is the same day, while
 * `calendarEnd` is the exclusive next day that all-day calendar entries need.
 */
function getEventDates(eventData) {
  const iso = ((eventData && eventData.date) || {}).iso;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(hasText(iso) ? iso.trim() : "");
  if (!match) {
    return null;
  }
  const start = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  if (Number.isNaN(start.getTime()) || start.toISOString().slice(0, 10) !== match[0]) {
    return null;
  }
  const nextDay = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  const compact = (day) => day.toISOString().slice(0, 10).replace(/-/g, "");
  return {
    start: match[0],
    end: match[0],
    calendarStart: compact(start),
    calendarEnd: compact(nextDay),
  };
}

function hasExactDate(eventData) {
  return getEventDates(eventData) !== null;
}

/**
 * Every way the site names the event location. Without an announced venue
 * all of them fall back to the city ("Cairo, Egypt").
 */
function getEventPlace(eventData) {
  const location = (eventData && eventData.location) || {};
  const city = location.city || "";
  const country = location.country || "";
  const cityLine = [city, country].filter(hasText).join(", ");
  const base = { countryCode: location.countryCode || "", country };

  if (!hasVenue(eventData)) {
    return Object.assign(base, {
      hasVenue: false,
      name: cityLine, // Hero "Where", schema.org Place name
      detail: "", // Small line under the hero "Where"
      short: cityLine, // Navy band headline, meta description
      locality: city, // schema.org addressLocality
      calendarLocation: "", // LOCATION in the .ics file and the Google Calendar link
    });
  }

  const venue = location.venue.trim();
  const locality = hasText(location.area) ? location.area.trim() : city;
  return Object.assign(base, {
    hasVenue: true,
    name: venue,
    detail: [locality, country].filter(hasText).join(", "),
    short: [venue, locality].filter(hasText).join(", "),
    locality,
    calendarLocation: [venue, locality, country].filter(hasText).join(", "),
  });
}

/** "kcd-cairo-2027.ics", published at the site root by gatsby-node.js. */
function getCalendarFileName(eventData) {
  return `${slugify(eventData && eventData.name)}.ics`;
}

/** The all-day calendar entry behind both the .ics file and the Google link. */
function getCalendarEvent(eventData, siteUrl) {
  const dates = getEventDates(eventData);
  if (!dates) {
    return null;
  }
  const place = getEventPlace(eventData);
  const url = trimSiteUrl(siteUrl);
  const intro = eventData.fullName || eventData.name;
  return {
    uid: `${slugify(eventData.name)}@${CALENDAR_UID_DOMAIN}`,
    summary: eventData.name,
    description: url
      ? `${intro}. Event details, registration and the call for proposals: ${url}/`
      : `${intro}.`,
    url: url ? `${url}/` : "",
    location: place.calendarLocation,
    start: dates.calendarStart,
    end: dates.calendarEnd,
  };
}

/** calendar.google.com "add event" link for the all-day entry ("" without a date). */
function getGoogleCalendarUrl(eventData, siteUrl) {
  const event = getCalendarEvent(eventData, siteUrl);
  if (!event) {
    return "";
  }
  const query = [
    "action=TEMPLATE",
    `text=${encodeURIComponent(event.summary)}`,
    `dates=${event.start}/${event.end}`,
    `details=${encodeURIComponent(event.description)}`,
  ];
  if (event.location) {
    query.push(`location=${encodeURIComponent(event.location)}`);
  }
  return `https://calendar.google.com/calendar/render?${query.join("&")}`;
}

// RFC 5545 §3.3.11 TEXT escaping.
const escapeText = (value) =>
  String(value)
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r\n|\r|\n/g, "\\n");

const utf8Length = (char) => {
  const code = char.codePointAt(0);
  if (code < 0x80) return 1;
  if (code < 0x800) return 2;
  if (code < 0x10000) return 3;
  return 4;
};

// RFC 5545 §3.1: fold lines longer than 75 octets, never splitting a character.
function foldLine(line) {
  const chars = Array.from(line);
  const parts = [];
  let current = "";
  let octets = 0;
  for (let i = 0; i < chars.length; i += 1) {
    const size = utf8Length(chars[i]);
    // Continuation lines start with a space, which counts towards the 75.
    const limit = parts.length === 0 ? 75 : 74;
    if (octets + size > limit) {
      parts.push(current);
      current = "";
      octets = 0;
    }
    current += chars[i];
    octets += size;
  }
  parts.push(current);
  return parts.join("\r\n ");
}

const formatStamp = (date) => date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

/**
 * The .ics calendar file as a string (CRLF line endings), or "" while the
 * exact date is not known. `now` is the DTSTAMP (the file's creation time).
 */
function buildIcs(eventData, siteUrl, now) {
  const event = getCalendarEvent(eventData, siteUrl);
  if (!event) {
    return "";
  }
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:${CALENDAR_PRODID}`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.uid}`,
    `DTSTAMP:${formatStamp(now || new Date())}`,
    `DTSTART;VALUE=DATE:${event.start}`,
    `DTEND;VALUE=DATE:${event.end}`,
    `SUMMARY:${escapeText(event.summary)}`,
    `DESCRIPTION:${escapeText(event.description)}`,
  ];
  if (event.url) {
    lines.push(`URL:${event.url}`);
  }
  if (event.location) {
    lines.push(`LOCATION:${escapeText(event.location)}`);
  }
  lines.push("STATUS:CONFIRMED", "END:VEVENT", "END:VCALENDAR");
  return `${lines.map(foldLine).join("\r\n")}\r\n`;
}

module.exports = {
  hasVenue,
  withoutHiddenVenue,
  hasExactDate,
  getEventDates,
  getEventPlace,
  getCalendarFileName,
  getCalendarEvent,
  getGoogleCalendarUrl,
  buildIcs,
};
