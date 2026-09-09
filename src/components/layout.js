import * as React from "react";
import { Link } from "gatsby";
import "./layout.css";
import eventData from "../content/event-data.json";
import { getEventLifecycle } from "../utils/event-lifecycle";

const KcdMark = () => (
  <span className="kcd-mark" aria-hidden="true">
    <svg viewBox="0 0 40 40" width="28" height="28" focusable="false">
      <polygon
        points="20,2 36,11 36,29 20,38 4,29 4,11"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M14 12v16M14 20l10-8M14 20l10 8"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </span>
);

/**
 * Minimal site chrome for the coming-soon landing page.
 * Navigation items only appear when the matching section or link is ready
 * (see src/content/event-data.json and src/utils/event-lifecycle.js).
 */
export default function Layout({ children }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const lifecycle = getEventLifecycle(eventData);
  const { links } = eventData;

  const navItems = [
    { to: "/", label: "Home", show: true },
    { to: "/schedule", label: "Schedule", show: lifecycle.showSchedule },
    { to: "/speakers", label: "Speakers", show: lifecycle.showSpeakers },
    { to: "/sponsors", label: "Sponsors", show: lifecycle.showSponsors },
    { to: "/team", label: "Team", show: lifecycle.showTeam },
  ].filter((item) => item.show);

  const showBurger = navItems.length > 1 || lifecycle.isCfpOpen || lifecycle.isRegistrationOpen;

  return (
    <div className="site">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="kcd-navbar">
        <div className="kcd-navbar-inner">
          <Link to="/" className="kcd-brand" aria-label={`${eventData.name} home`}>
            <KcdMark />
            <span className="kcd-brand-text">
              <span className="kcd-brand-name">{eventData.shortName}</span>
              <span className="kcd-brand-year">{eventData.year}</span>
            </span>
          </Link>

          {showBurger && (
            <button
              type="button"
              className={`kcd-burger${isOpen ? " is-open" : ""}`}
              aria-label="Toggle navigation"
              aria-expanded={isOpen}
              aria-controls="site-navigation"
              onClick={() => setIsOpen((open) => !open)}
            >
              <span />
              <span />
              <span />
            </button>
          )}

          <nav
            id="site-navigation"
            className={`kcd-nav${isOpen ? " is-open" : ""}${showBurger ? "" : " is-static"}`}
            aria-label="Main navigation"
          >
            {navItems.length > 1 &&
              navItems.map((item) => (
                <Link key={item.to} to={item.to} className="kcd-nav-link" activeClassName="is-active">
                  {item.label}
                </Link>
              ))}
            {lifecycle.isCfpOpen && (
              <a href={links.cfp} className="kcd-nav-link" target="_blank" rel="noopener noreferrer">
                Call for Proposals
              </a>
            )}
            {lifecycle.isRegistrationOpen && (
              <a
                href={links.registration}
                className="kcd-button kcd-button-accent kcd-nav-cta"
                target="_blank"
                rel="noopener noreferrer"
              >
                Register
              </a>
            )}
            {!lifecycle.isRegistrationOpen && lifecycle.isComingSoon && (
              <span className="kcd-nav-badge">Coming soon</span>
            )}
          </nav>
        </div>
      </header>

      <main id="main" className="main-content">
        {children}
      </main>

      <footer className="kcd-footer">
        <div className="kcd-container kcd-footer-grid">
          <div>
            <p className="kcd-footer-heading">{eventData.fullName}</p>
            <p className="kcd-footer-text">
              A community-organized event, part of the{" "}
              <a href={links.kcdProgram} target="_blank" rel="noopener noreferrer">
                Kubernetes Community Days
              </a>{" "}
              program supported by the{" "}
              <a href={links.cncf} target="_blank" rel="noopener noreferrer">
                Cloud Native Computing Foundation
              </a>
              .
            </p>
          </div>

          {(lifecycle.hasAnySocial || lifecycle.hasContactEmail) && (
            <div>
              <p className="kcd-footer-heading">Stay connected</p>
              <ul className="kcd-footer-links">
                {lifecycle.hasLinkedIn && (
                  <li>
                    <a href={links.linkedin} target="_blank" rel="noopener noreferrer">
                      LinkedIn
                    </a>
                  </li>
                )}
                {lifecycle.hasTwitter && (
                  <li>
                    <a href={links.twitter} target="_blank" rel="noopener noreferrer">
                      X (Twitter)
                    </a>
                  </li>
                )}
                {lifecycle.hasCncfCommunity && (
                  <li>
                    <a href={links.cncfCommunity} target="_blank" rel="noopener noreferrer">
                      CNCF Community page
                    </a>
                  </li>
                )}
                {lifecycle.hasContactEmail && (
                  <li>
                    <a href={`mailto:${links.email}`}>{links.email}</a>
                  </li>
                )}
              </ul>
            </div>
          )}

          {lifecycle.showLegal && (
            <div>
              <p className="kcd-footer-heading">Legal</p>
              <ul className="kcd-footer-links">
                <li>
                  <Link to="/privacy-policy/">Privacy Policy</Link>
                </li>
                <li>
                  <Link to="/cookie-policy/">Cookie Policy</Link>
                </li>
              </ul>
            </div>
          )}
        </div>
        <div className="kcd-container kcd-footer-copy">
          <p>
            © {new Date().getFullYear()} {eventData.shortName}. Kubernetes and the Kubernetes logo are
            trademarks of The Linux Foundation.
          </p>
        </div>
      </footer>
    </div>
  );
}
