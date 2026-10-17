import { hasExactDate, hasVenue } from "./event-details";

/**
 * Derives which parts of the site are ready to show from event-data.json.
 * A link that is an empty string is treated as "not ready yet" and the
 * matching call to action stays hidden until it is filled in.
 * The venue is only shown when location.announceVenue is true (see
 * ./event-details.js, which every venue mention goes through).
 */
const hasLink = (value) => typeof value === "string" && value.trim().length > 0;

export function getEventLifecycle(eventData) {
  const links = eventData.links || {};
  const sections = eventData.sections || {};

  return {
    isComingSoon: eventData.status === "coming-soon",
    isCfpOpen: hasLink(links.cfp),
    isRegistrationOpen: hasLink(links.registration),
    isSponsorProspectusVisible: hasLink(links.sponsorProspectus),
    isVolunteerFormVisible: hasLink(links.volunteer),
    hasContactEmail: hasLink(links.email),
    hasLinkedIn: hasLink(links.linkedin),
    hasTwitter: hasLink(links.twitter),
    hasCncfCommunity: hasLink(links.cncfCommunity),
    hasWebsite: hasLink(links.website),
    hasAnySocial: hasLink(links.linkedin) || hasLink(links.twitter) || hasLink(links.cncfCommunity),
    hasVenue: hasVenue(eventData),
    hasExactDate: hasExactDate(eventData),
    showAbout: sections.about !== false,
    showGetInvolved: sections.getInvolved !== false,
    showKeyDates: sections.keyDates === true && Array.isArray(eventData.keyDates) && eventData.keyDates.length > 0,
    showSponsors: sections.sponsors === true,
    showSpeakers: sections.speakers === true,
    showSchedule: sections.schedule === true,
    showTeam: sections.team === true,
    showLegal: sections.legal === true,
  };
}
