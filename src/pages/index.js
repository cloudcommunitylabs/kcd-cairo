import * as React from "react";
import Layout from "../components/layout";
import Seo from "../components/seo";
import eventData from "../content/event-data.json";
import { getEventLifecycle } from "../utils/event-lifecycle";
import { getCalendarFileName, getEventDates, getEventPlace, getGoogleCalendarUrl } from "../utils/event-details";
import useSiteUrl from "../hooks/use-site-url";
import NewsletterSignup, { NEWSLETTER_WIDGET_SRC, hasNewsletterForm } from "../components/newsletter-signup";

const SKYLINE = "/brand/kcd-cairo-skyline.svg";
const LOCKUP_WHITE = "/brand/kcd-cairo-lockup-white.svg";
const LOGO_ROUND = "/brand/kcd-cairo-logo-round.svg";

// Date and place as published (the venue only when location.announceVenue is true).
const eventDates = getEventDates(eventData);
const place = getEventPlace(eventData);
const CALENDAR_FILE = `/${getCalendarFileName(eventData)}`;

// "Friday 16 April 2027" -> keep "16 April 2027" on one line, so a narrow band
// breaks after the weekday instead of leaving the year on its own line.
const bandDate = (display) => {
  const [weekday, ...rest] = display.split(" ");
  if (!rest.length) {
    return display;
  }
  return (
    <>
      {weekday} <span className="kcd-nowrap">{rest.join(" ")}</span>
    </>
  );
};

const Cloud = ({ className }) => (
  <svg className={`kcd-cloud ${className}`} viewBox="0 0 90 44" aria-hidden="true" focusable="false">
    <path
      d="M20 40h50a12 12 0 0 0 1-24 17 17 0 0 0-32-5 13 13 0 0 0-21 11 9 9 0 0 0 2 18z"
      fill="#ffffff"
      stroke="#4ebbd5"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
  </svg>
);

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="4" width="18" height="17" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);

const DownloadIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
  </svg>
);

const PinIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const HandsIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M7 11V6a1.5 1.5 0 0 1 3 0v5M10 10V4a1.5 1.5 0 0 1 3 0v6M13 10V6a1.5 1.5 0 0 1 3 0v6M16 12a1.5 1.5 0 0 1 3 1c0 4-2 8-7 8s-7-3-8-6a2 2 0 0 1 3-2l1 1" />
  </svg>
);

const HexIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 2l8.5 5v10L12 22l-8.5-5V7z" />
    <path d="M12 7l4.3 2.5v5L12 17l-4.3-2.5v-5z" />
  </svg>
);

const TalkIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 5h16v11H9l-5 4z" />
    <path d="M8 9h8M8 12h5" />
  </svg>
);

const aboutCards = [
  {
    icon: <HandsIcon />,
    title: "Community-organized",
    body: "Run by local cloud native practitioners, for practitioners. Vendor-neutral talks, honest lessons and real-world Kubernetes.",
  },
  {
    icon: <HexIcon />,
    title: "Supported by the CNCF",
    body: "KCDs are official Cloud Native Computing Foundation community events, following the same code of conduct and diversity commitments as KubeCon.",
  },
  {
    icon: <TalkIcon />,
    title: "Learn, share, connect",
    body: "Sessions, workshops and hallway conversations with engineers, maintainers and adopters from Egypt and across the region.",
  },
];

export const Head = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: eventData.fullName,
    description: eventData.description,
    url: useSiteUrl(),
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: {
      "@type": "Place",
      name: place.name,
      address: {
        "@type": "PostalAddress",
        addressLocality: place.locality,
        addressCountry: place.countryCode || place.country,
      },
    },
    organizer: {
      "@type": "Organization",
      name: eventData.shortName,
    },
  };
  if (eventDates) {
    schema.startDate = eventDates.start;
    schema.endDate = eventDates.end;
  }

  const newsletterReady = hasNewsletterForm(eventData.newsletter);

  return (
    <Seo>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
      {newsletterReady && (
        <>
          {/* Begin Constant Contact Active Forms (universal code) */}
          <script
            dangerouslySetInnerHTML={{
              __html: `var _ctct_m = ${JSON.stringify(eventData.newsletter.constantContactAccountId)};`,
            }}
          />
          <script id="signupScript" src={NEWSLETTER_WIDGET_SRC} async defer />
          {/* End Constant Contact Active Forms */}
        </>
      )}
    </Seo>
  );
};

export default function IndexPage() {
  const lifecycle = getEventLifecycle(eventData);
  const { links, date, location } = eventData;

  const newsletterReady = hasNewsletterForm(eventData.newsletter);
  const googleCalendarUrl = getGoogleCalendarUrl(eventData, useSiteUrl());

  const primaryActions = [
    lifecycle.isRegistrationOpen && { href: links.registration, label: "Register now", kind: "primary" },
    newsletterReady && { href: "#updates", label: "Get updates", kind: "primary", internal: true },
    lifecycle.isCfpOpen && { href: links.cfp, label: "Submit a talk", kind: "accent" },
    lifecycle.isSponsorProspectusVisible && { href: links.sponsorProspectus, label: "Sponsor KCD Cairo", kind: "ghost" },
  ].filter(Boolean);

  const socialActions = [
    lifecycle.hasLinkedIn && { href: links.linkedin, label: "Follow on LinkedIn" },
    lifecycle.hasTwitter && { href: links.twitter, label: "Follow on X" },
    lifecycle.hasCncfCommunity && { href: links.cncfCommunity, label: "Join the CNCF community group" },
  ].filter(Boolean);

  return (
    <Layout>
      <section className="kcd-hero">
        <Cloud className="kcd-cloud-1" />
        <Cloud className="kcd-cloud-2" />
        <Cloud className="kcd-cloud-3" />
        <Cloud className="kcd-cloud-4" />
        <div className="kcd-hero-sun" aria-hidden="true" />

        <div className="kcd-container kcd-hero-content">
          <p className="kcd-eyebrow">Kubernetes Community Days · {location.city}, {location.country}</p>
          <h1 className="kcd-hero-title">
            KCD Cairo <span className="kcd-year">{eventData.year}</span>
          </h1>
          <p className="kcd-hero-slogan">Growing cloud native together</p>
          {lifecycle.isComingSoon && (
            <p className="kcd-coming-soon" role="status">
              <span className="kcd-pulse" aria-hidden="true" />
              {lifecycle.hasExactDate ? "Save the date" : "Coming soon"}
            </p>
          )}
          <p className="kcd-hero-tagline">{eventData.tagline}</p>

          <dl className="kcd-hero-facts">
            <div className="kcd-fact">
              <span className="kcd-info-icon">
                <CalendarIcon />
              </span>
              <div>
                <dt>When</dt>
                <dd>
                  {lifecycle.hasExactDate ? <time dateTime={eventDates.start}>{date.display}</time> : date.display}
                  {!lifecycle.hasExactDate && date.note && <small>{date.note}</small>}
                </dd>
              </div>
            </div>
            <div className="kcd-fact kcd-fact-sand">
              <span className="kcd-info-icon">
                <PinIcon />
              </span>
              <div>
                <dt>Where</dt>
                <dd>
                  {place.name}
                  {place.detail && <small>{place.detail}</small>}
                  {!lifecycle.hasVenue && location.note && <small>{location.note}</small>}
                </dd>
              </div>
            </div>
          </dl>

          {(primaryActions.length > 0 || socialActions.length > 0) && (
            <div className="kcd-hero-actions">
              {primaryActions.map((action) => (
                <a
                  key={action.label}
                  href={action.href}
                  className={`kcd-button kcd-button-${action.kind}`}
                  target={action.internal ? undefined : "_blank"}
                  rel={action.internal ? undefined : "noopener noreferrer"}
                >
                  {action.label}
                </a>
              ))}
              {primaryActions.length === 0 &&
                socialActions.map((action) => (
                  <a
                    key={action.label}
                    href={action.href}
                    className="kcd-button kcd-button-ghost"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {action.label}
                  </a>
                ))}
            </div>
          )}
        </div>

        <div className="kcd-hero-skyline">
          <img
            src={SKYLINE}
            alt="Illustrated Cairo skyline with the Cairo Tower, a mosque, the pyramids and a felucca on the Nile"
            width="1406"
            height="518"
          />
          <div className="kcd-hero-horizon" aria-hidden="true" />
        </div>
      </section>

      <section className="kcd-section-dark kcd-band" id="save-the-date">
        <div className="kcd-container kcd-band-grid">
          <div className="kcd-band-logo">
            <img src={LOCKUP_WHITE} alt="" width="300" height="86" />
          </div>
          <div className="kcd-band-copy">
            <p className="kcd-eyebrow">{lifecycle.hasExactDate ? "Save the date" : "Save the month"}</p>
            <p className="kcd-band-date">
              {lifecycle.hasExactDate ? (
                <time dateTime={eventDates.start}>{bandDate(date.display)}</time>
              ) : (
                date.display
              )}
              <span className="kcd-band-sep"> · </span>
              <span className="kcd-band-place">{place.short}</span>
            </p>
            <p className="kcd-band-note">
              {!lifecycle.hasExactDate
                ? lifecycle.hasVenue
                  ? "The exact date will be confirmed soon. Bookmark this page and check back."
                  : "The exact date and venue will be confirmed soon. Bookmark this page and check back."
                : !lifecycle.isRegistrationOpen && !lifecycle.isCfpOpen
                  ? `Registration and the call for proposals open soon. Add ${eventData.name} to your calendar so you don't miss it.`
                  : "Add it to your calendar and we'll see you there."}
            </p>
            {lifecycle.hasExactDate && (
              <div className="kcd-band-actions">
                <a href={googleCalendarUrl} className="kcd-button kcd-button-accent" target="_blank" rel="noopener noreferrer">
                  <CalendarIcon />
                  Add to Google Calendar
                  <span className="kcd-sr-only"> (opens in a new tab)</span>
                </a>
                <a href={CALENDAR_FILE} className="kcd-button kcd-button-ghost" type="text/calendar">
                  <DownloadIcon />
                  Download calendar file (.ics)
                </a>
              </div>
            )}
          </div>
        </div>
      </section>

      <NewsletterSignup newsletter={eventData.newsletter} />

      {lifecycle.showAbout && (
        <section className="kcd-section" id="about">
          <div className="kcd-container">
            <div className="kcd-about-grid">
              <div>
                <p className="kcd-eyebrow">About the event</p>
                <h2 className="kcd-title">Cloud native, made in Cairo</h2>
                <p className="kcd-lead">{eventData.description}</p>
              </div>
              <div className="kcd-about-logo">
                <img src={LOGO_ROUND} alt="KCD Cairo 2027 round logo" width="349" height="349" />
              </div>
            </div>
            <div className="kcd-card-grid">
              {aboutCards.map((card) => (
                <article key={card.title} className="kcd-card">
                  <span className="kcd-card-icon">{card.icon}</span>
                  <h3>{card.title}</h3>
                  <p>{card.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {lifecycle.showKeyDates && (
        <section className="kcd-section kcd-section-sky" id="key-dates">
          <div className="kcd-container">
            <p className="kcd-eyebrow">Key dates</p>
            <h2 className="kcd-title">Mark your calendar</h2>
            <ol className="kcd-timeline">
              {eventData.keyDates.map((item) => (
                <li key={`${item.date}-${item.label}`}>
                  <span className="kcd-timeline-date">{item.date}</span>
                  <span className="kcd-timeline-label">{item.label}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {lifecycle.showGetInvolved && (
        <section className="kcd-section kcd-section-sky" id="get-involved">
          <div className="kcd-container kcd-center">
            <p className="kcd-eyebrow">Get involved</p>
            <h2 className="kcd-title">Speak. Sponsor. Volunteer.</h2>
            <p className="kcd-lead">
              Call for proposals, sponsorship packages, volunteering and registration for {eventData.name}{" "}
              will be announced right here.
            </p>
            <div className="kcd-involve-grid">
              <div className="kcd-involve">
                <h3>Speakers</h3>
                <p>Have a story about running cloud native in production? The call for proposals opens soon.</p>
                {lifecycle.isCfpOpen ? (
                  <a href={links.cfp} className="kcd-button kcd-button-primary" target="_blank" rel="noopener noreferrer">
                    Submit a talk
                  </a>
                ) : (
                  <span className="kcd-chip">CFP opens soon</span>
                )}
              </div>
              <div className="kcd-involve">
                <h3>Sponsors</h3>
                <p>Put your brand in front of Egypt's cloud native community and support a community-run event.</p>
                {lifecycle.isSponsorProspectusVisible ? (
                  <a href={links.sponsorProspectus} className="kcd-button kcd-button-primary" target="_blank" rel="noopener noreferrer">
                    View the prospectus
                  </a>
                ) : lifecycle.hasContactEmail ? (
                  <a href={`mailto:${links.email}`} className="kcd-button kcd-button-primary">
                    Talk to us
                  </a>
                ) : (
                  <span className="kcd-chip">Prospectus coming soon</span>
                )}
              </div>
              <div className="kcd-involve">
                <h3>Volunteers</h3>
                <p>Help us make KCD Cairo happen, from registration desks to room moderation.</p>
                {lifecycle.isVolunteerFormVisible ? (
                  <a href={links.volunteer} className="kcd-button kcd-button-primary" target="_blank" rel="noopener noreferrer">
                    Volunteer
                  </a>
                ) : (
                  <span className="kcd-chip">Sign-up opens soon</span>
                )}
              </div>
            </div>
            {socialActions.length > 0 && (
              <div className="kcd-social-row">
                {socialActions.map((action) => (
                  <a
                    key={action.label}
                    href={action.href}
                    className="kcd-button kcd-button-ghost"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {action.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </Layout>
  );
}
