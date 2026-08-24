import * as React from "react";
import eventData from "../content/event-data.json";

export default function ComingSoonPage() {
  const { shortName, city, year, dateLabel, program } = eventData;

  return (
    <main>
      <p>Kubernetes Community Days</p>
      <h1>
        {city} <span>{year}</span>
      </h1>
      <p>Coming {year}</p>
      <p>{dateLabel}</p>
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
