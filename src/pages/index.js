import * as React from "react";
import eventData from "../content/event-data.json";
import { buildCtaLinks } from "../content/cta-links";

export default function ComingSoonPage() {
  const { shortName, city, year, dateLabel, program } = eventData;
  const ctaLinks = buildCtaLinks(eventData.links);

  return (
    <main>
      <p>Kubernetes Community Days</p>
      <h1>
        {city} <span>{year}</span>
      </h1>
      <p>Coming {year}</p>
      <p>{dateLabel}</p>
      {ctaLinks.length > 0 && (
        <nav aria-label="Contact and social links">
          <ul>
            {ctaLinks.map(({ key, label, href }) => (
              <li key={key}>
                <a
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
      <footer>
        <p>
          {shortName} is part of the{" "}
          <a href={program.kcd}>Kubernetes Community Days</a> program, supported
          by the <a href={program.cncf}>Cloud Native Computing Foundation</a>.
        </p>
      </footer>
    </main>
  );
}
