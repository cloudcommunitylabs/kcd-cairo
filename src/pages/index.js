import * as React from "react";
import { Script } from "gatsby";
import eventData from "../content/event-data.json";
import { buildCtaLinks } from "../content/cta-links";
import kcdMark from "../images/kcd-logo-white.svg";
import "./index.css";

const CTCT_LOADER_SRC =
  "https://static.ctctcdn.com/js/signup-form-widget/current/signup-form-widget.min.js";

const newsletter = eventData.newsletter ?? {};
const ctctFormId = (newsletter.constantContactFormId ?? "").trim();
const ctctAccountId = (newsletter.constantContactAccountId ?? "").trim();

/**
 * Both halves are required. The loader aborts without _ctct_m, so a form id on
 * its own would render a permanently empty div.
 */
const isNewsletterConfigured = ctctFormId !== "" && ctctAccountId !== "";

/**
 * JSON.stringify escapes quotes and backslashes but NOT "<", and the HTML
 * tokenizer closes a <script> on the literal bytes "</script" with no regard
 * for JS string context. A value containing "</script>" would therefore break
 * out of the script element. Replacing "<" with its unicode escape parses back
 * to the identical string while making that impossible.
 */
const toScriptSafeJson = (value) =>
  JSON.stringify(value).replace(/</g, "\\u003c");

export default function ComingSoonPage() {
  const { shortName, city, country, year, dateLabel, program } = eventData;
  const ctaLinks = buildCtaLinks(eventData.links);

  return (
    <main className="page">
      <svg className="page__motif" aria-hidden="true" focusable="false">
        <defs>
          {/* Eight-point khatam star — a nod to Cairo's geometric tradition,
              built from two squares so it needs no image asset. */}
          <pattern
            id="kcd-khatam"
            width="80"
            height="80"
            patternUnits="userSpaceOnUse"
          >
            <g fill="none" stroke="#326ce5" strokeWidth="1">
              <rect x="20" y="20" width="40" height="40" />
              <rect
                x="20"
                y="20"
                width="40"
                height="40"
                transform="rotate(45 40 40)"
              />
            </g>
            <circle cx="40" cy="40" r="1.75" fill="#e0a458" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#kcd-khatam)" />
      </svg>

      <section className="hero">
        <img
          className="hero__mark"
          src={kcdMark}
          alt="Kubernetes Community Days"
          width="290"
          height="93"
        />
        {/* The space matters: without it the accessible name is "Cairo2027". */}
        <h1 className="hero__place">
          {city}{" "}
          <span className="hero__year">{year}</span>
        </h1>
        <hr className="hero__rule" />
        <p className="hero__status">
          Coming {year} to {country}. {dateLabel} — the call for papers, tickets
          and schedule are on their way.
        </p>
      </section>

      {isNewsletterConfigured && (
        <section className="signup">
          <h2 className="signup__heading">Get launch updates</h2>
          <div className="ctct-inline-form" data-form-id={ctctFormId} />
          <Script src={CTCT_LOADER_SRC} strategy="idle" />
        </section>
      )}

      {ctaLinks.length > 0 && (
        <nav className="links" aria-label="Contact and social links">
          <ul className="links__list">
            {ctaLinks.map(({ key, label, href }) => (
              <li key={key}>
                <a
                  className="links__link"
                  href={href}
                  {...(key === "contactEmail"
                    ? {}
                    : { target: "_blank", rel: "noopener noreferrer" })}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <footer className="footer">
        <p>
          {shortName} is part of the{" "}
          <a href={program.kcd} target="_blank" rel="noopener noreferrer">
            Kubernetes Community Days
          </a>{" "}
          program, supported by the{" "}
          <a href={program.cncf} target="_blank" rel="noopener noreferrer">
            Cloud Native Computing Foundation
          </a>
          .
        </p>
        <p>© {new Date().getFullYear()} {shortName}</p>
      </footer>
    </main>
  );
}

export const Head = () => {
  const { name, city, country, year, dateLabel, siteUrl } = eventData;
  const description = `${name} is coming to ${city}, ${country}. ${dateLabel}. Sign up to hear first when the date, call for papers and tickets are announced.`;

  return (
    <>
      <html lang="en" />
      <title>{`${name} — Coming ${year}`}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={siteUrl} />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={name} />
      <meta property="og:title" content={`${name} — Coming ${year}`} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={siteUrl} />

      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={`${name} — Coming ${year}`} />
      <meta name="twitter:description" content={description} />

      <meta name="theme-color" content="#0B1016" />

      {isNewsletterConfigured && (
        <script
          dangerouslySetInnerHTML={{
            __html: `var _ctct_m = ${toScriptSafeJson(ctctAccountId)};`
          }}
        />
      )}
    </>
  );
};
