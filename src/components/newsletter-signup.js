import * as React from "react";

/**
 * "Stay in the loop" section powered by a Constant Contact inline sign-up form.
 *
 * The form markup is the inline snippet from Constant Contact
 * (<div class="ctct-inline-form" data-form-id="…">). The widget script that
 * renders it is added in the page <head> (see src/pages/index.js) together
 * with the account's universal code (_ctct_m). Both values live in
 * src/content/event-data.json under "newsletter".
 */
export const NEWSLETTER_WIDGET_SRC =
  "https://static.ctctcdn.com/js/signup-form-widget/current/signup-form-widget.min.js";

export function hasNewsletterForm(newsletter) {
  return Boolean(
    newsletter && newsletter.constantContactFormId && newsletter.constantContactAccountId
  );
}

export default function NewsletterSignup({ newsletter }) {
  if (!hasNewsletterForm(newsletter)) {
    return null;
  }

  return (
    <section className="kcd-section kcd-section-updates" id="updates">
      <div className="kcd-container kcd-updates-grid">
        <div className="kcd-updates-copy">
          <p className="kcd-eyebrow">Stay in the loop</p>
          <h2 className="kcd-title">{newsletter.title || "Get KCD Cairo updates"}</h2>
          {newsletter.text && <p className="kcd-lead">{newsletter.text}</p>}
        </div>
        <div className="kcd-updates-card">
          {/* Begin Constant Contact Inline Form Code */}
          <div className="ctct-inline-form" data-form-id={newsletter.constantContactFormId} />
          {/* End Constant Contact Inline Form Code */}
          <noscript>
            <p className="kcd-updates-noscript">
              Enable JavaScript to see the sign-up form.
            </p>
          </noscript>
        </div>
      </div>
    </section>
  );
}
