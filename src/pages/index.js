import * as React from "react";
import Layout from "../components/layout";
import Seo from "../components/seo";
import eventData from "../content/event-data.json";
import { getEventLifecycle } from "../utils/event-lifecycle";

const HeroArt = () => (
  <svg
    className="kcd-hero-art"
    viewBox="0 0 1440 260"
    preserveAspectRatio="xMidYMax slice"
    aria-hidden="true"
    focusable="false"
  >
    <defs>
      <linearGradient id="skyline" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#163a6b" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#0b1f3a" stopOpacity="1" />
      </linearGradient>
    </defs>
    <path
      d="M0 260 L0 214 L120 214 L140 200 L200 200 L230 176 L262 200 L330 200 L340 190 L420 190 L520 88 L640 190 L700 190 L710 178 L760 178 L830 108 L900 178 L980 178 L1000 166 L1060 166 L1110 128 L1160 166 L1240 166 L1260 152 L1320 152 L1350 190 L1440 190 L1440 260 Z"
      fill="url(#skyline)"
    />
    <path
      d="M520 88 L580 190 L460 190 Z M830 108 L880 178 L780 178 Z M1110 128 L1140 166 L1080 166 Z"
      fill="#0b1f3a"
      opacity="0.5"
    />
  </svg>
);

const InfoIcon = ({ children }) => (
  <span className="kcd-info-icon" aria-hidden="true">
    {children}
  </span>
);

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="17" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);

const PinIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const aboutCards = [
  {
    title: "Community-organized",
    body: "Run by local cloud native practitioners, for practitioners. Vendor-neutral talks, honest lessons and real-world Kubernetes.",
  },
  {
    title: "Supported by the CNCF",
    body: "KCDs are official Cloud Native Computing Foundation community events, following the same code of conduct and diversity commitments as KubeCon.",
  },
  {
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
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: {
      "@type": "Place",
      name: eventData.location.venue || `${eventData.location.city}, ${eventData.location.country}`,
      address: {
        "@type": "PostalAddress",
        addressLocality: eventData.location.city,
        addressCountry: eventData.location.country,
      },
    },
    organizer: {
      "@type": "Organization",
      name: eventData.shortName,
    },
  };
  if (eventData.date.iso) {
    schema.startDate = eventData.date.iso;
  }

  return (
    <Seo>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Seo>
  );
};

export default function IndexPage() {
  const lifecycle = getEventLifecycle(eventData);
  const { links, date, location } = eventData;

  const primaryActions = [
    lifecycle.isRegistrationOpen && { href: links.registration, label: "Register now", kind: "accent" },
    lifecycle.isCfpOpen && { href: links.cfp, label: "Submit a talk", kind: "primary" },
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
        <div className="kcd-hero-glow kcd-hero-glow-blue" aria-hidden="true" />
        <div className="kcd-hero-glow kcd-hero-glow-gold" aria-hidden="true" />
        <div className="kcd-container kcd-hero-content">
          <p className="kcd-eyebrow">Kubernetes Community Days</p>
          <h1 className="kcd-hero-title">
            <span className="kcd-hero-title-line">KCD Cairo</span>
            <span className="kcd-hero-title-year">{eventData.year}</span>
          </h1>
          {lifecycle.isComingSoon && (
            <p className="kcd-coming-soon" role="status">
              <span className="kcd-pulse" aria-hidden="true" />
              Coming soon
            </p>
          )}
          <p className="kcd-hero-tagline">{eventData.tagline}</p>

          <dl className="kcd-hero-facts">
            <div className="kcd-fact">
              <InfoIcon>
                <CalendarIcon />
              </InfoIcon>
              <div>
                <dt>When</dt>
                <dd>
                  {date.display}
                  {!lifecycle.hasExactDate && date.note && <small>{date.note}</small>}
                </dd>
              </div>
            </div>
            <div className="kcd-fact">
              <InfoIcon>
                <PinIcon />
              </InfoIcon>
              <div>
                <dt>Where</dt>
                <dd>
                  {lifecycle.hasVenue ? location.venue : `${location.city}, ${location.country}`}
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
                  target="_blank"
                  rel="noopener noreferrer"
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
        <HeroArt />
      </section>

      {lifecycle.showAbout && (
        <section className="kcd-section" id="about">
          <div className="kcd-container">
            <p className="kcd-eyebrow kcd-eyebrow-dark">About the event</p>
            <h2 className="kcd-title">Cloud native, made in Cairo</h2>
            <p className="kcd-lead">{eventData.description}</p>
            <div className="kcd-card-grid">
              {aboutCards.map((card) => (
                <article key={card.title} className="kcd-card">
                  <h3>{card.title}</h3>
                  <p>{card.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {lifecycle.showKeyDates && (
        <section className="kcd-section kcd-section-muted" id="key-dates">
          <div className="kcd-container">
            <p className="kcd-eyebrow kcd-eyebrow-dark">Key dates</p>
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
        <section className="kcd-section kcd-section-dark" id="get-involved">
          <div className="kcd-container kcd-center">
            <p className="kcd-eyebrow">Get involved</p>
            <h2 className="kcd-title">Speak. Sponsor. Volunteer.</h2>
            <p className="kcd-lead">
              Call for proposals, sponsorship packages, volunteering and registration for {eventData.name}{" "}
              will be announced right here. Bookmark this page and check back soon.
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
              <div className="kcd-hero-actions">
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
