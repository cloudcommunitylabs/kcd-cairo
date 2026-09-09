import * as React from "react";
import { Link } from "gatsby";
import "./layout.css";
import eventData from "../content/event-data.json";
import { getEventLifecycle } from "../utils/event-lifecycle";

const LOCKUP_BLUE = "/brand/kcd-cairo-lockup-blue.svg";
const LOCKUP_WHITE = "/brand/kcd-cairo-lockup-white.svg";

/**
 * Site chrome for the coming-soon landing page, using the official
 * KCD Cairo 2027 lockups from static/brand.
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
            <img src={LOCKUP_BLUE} alt={eventData.name} width="228" height="67" />
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
                className="kcd-button kcd-button-primary kcd-nav-cta"
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
            <img className="kcd-footer-logo" src={LOCKUP_WHITE} alt={eventData.name} width="228" height="65" />
            <p className="kcd-footer-text">
              Growing cloud native together. A community-organized event, part of the{" "}
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
