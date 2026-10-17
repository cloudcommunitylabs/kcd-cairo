import * as React from "react";

/**
 * "Stay in the loop" section powered by a Constant Contact inline sign-up form.
 *
 * Constant Contact's widget script renders the form into
 * <div class="ctct-inline-form" data-form-id="…">, but it only looks for that
 * div once, when it starts. Gatsby unmounts and remounts this section on
 * client-side navigation, so instead of putting the widget in <head> this
 * component loads and drives it:
 *
 * - The div is rendered empty and React never renders children into it, so
 *   whatever the widget puts there cannot clash with hydration.
 * - After the section mounts (that is, after hydration), the widget script is
 *   added to <body> once. Its start-up pass renders the form into the div.
 * - When the section mounts again later, the widget is already running, so we
 *   ask it to render again with SignUpFormWidget.main().
 *
 * The form id and the account's universal code (_ctct_m) live in
 * src/content/event-data.json under "newsletter".
 */
export const NEWSLETTER_WIDGET_SRC =
  "https://static.ctctcdn.com/js/signup-form-widget/current/signup-form-widget.min.js";

const CHECK_EVERY_MS = 250;
// After this long without a form, the loading text turns into a hint.
const SLOW_AFTER_MS = 15000;
const STOP_CHECKING_AFTER_MS = 60000;
// SignUpFormWidget.main() calls per mount: one, plus one retry if it failed.
const MAX_MAIN_CALLS = 2;
// Only used if the widget stops exposing jQuery.active (see renderPassPending).
const FALLBACK_PASS_MS = 5000;

export function hasNewsletterForm(newsletter) {
  return Boolean(
    newsletter && newsletter.constantContactFormId && newsletter.constantContactAccountId
  );
}

/** Adds the widget script unless a tag for it is already in the page. Returns true if it added one. */
function loadWidgetScript() {
  if (document.querySelector(`script[src="${NEWSLETTER_WIDGET_SRC}"]`)) {
    return false;
  }
  const script = document.createElement("script");
  script.src = NEWSLETTER_WIDGET_SRC;
  script.async = true;
  // If the script cannot load (offline, blocked), drop the tag so the next
  // time the section mounts it tries again instead of waiting on a dead tag.
  script.onerror = () => script.remove();
  // The widget looks up its own <script> by src when it starts, so the element
  // has to stay in the page: <body> is outside both React's root and the
  // <head> tags Gatsby manages.
  document.body.appendChild(script);
  return true;
}

let lastPassStartedAt = 0;

/**
 * A render pass (the widget's start-up pass or a main() call) fetches the
 * account config, then renders into every matching div on the page at that
 * moment and adds another submit handler to each. A pass that is still waiting
 * for its config will also pick up a div mounted in the meantime, so starting
 * a second pass then would render that div twice. The widget's jQuery
 * (exposed as window.jQuery) counts outstanding requests in jQuery.active.
 */
function renderPassPending() {
  const jq = window.jQuery;
  if (jq && typeof jq.active === "number") {
    // No time limit: a slow but healthy config request still renders when it
    // lands, so starting another pass meanwhile would render the div twice.
    return jq.active > 0;
  }
  return Date.now() - lastPassStartedAt < FALLBACK_PASS_MS;
}

export default function NewsletterSignup({ newsletter }) {
  const containerRef = React.useRef(null);
  const [isSlow, setIsSlow] = React.useState(false);
  const accountId = hasNewsletterForm(newsletter) ? newsletter.constantContactAccountId : null;

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container || !accountId) {
      return undefined;
    }
    // The widget reads the account id once, when it starts.
    window._ctct_m = accountId;

    const mountedAt = Date.now();
    let mainCalls = 0;
    let triedLoading = false;
    let timer;

    const check = () => {
      // React never renders into the div, so any content came from the widget.
      if (container.hasChildNodes()) {
        return;
      }
      const widget = window.SignUpFormWidget;
      if (widget === undefined) {
        // First visit: once loaded, the widget's start-up pass finds this div.
        // One attempt per mount, so a failed load is not retried every tick.
        // A tag added by an earlier mount doesn't count: if that load fails,
        // its tag is removed and this mount gets its own attempt.
        if (!triedLoading) {
          triedLoading = loadWidgetScript();
        }
      } else if (typeof widget.main === "function") {
        if (!lastPassStartedAt) {
          // First sighting of the running widget: its start-up pass began at most now.
          lastPassStartedAt = Date.now();
        }
        // The widget is running but this div arrived after its pass (or the
        // pass failed): render again, unless a pass is still on its way.
        if (!renderPassPending() && mainCalls < MAX_MAIN_CALLS) {
          mainCalls += 1;
          lastPassStartedAt = Date.now();
          try {
            widget.main();
          } catch (error) {
            // Leave the page alone; the loading text turns into a hint below.
          }
        }
      }
      // Otherwise the widget is still loading its dependencies and its
      // start-up pass will find this div.

      const elapsed = Date.now() - mountedAt;
      if (elapsed >= SLOW_AFTER_MS) {
        setIsSlow(true);
      }
      if (elapsed < STOP_CHECKING_AFTER_MS) {
        timer = window.setTimeout(check, CHECK_EVERY_MS);
      }
    };

    check();
    return () => window.clearTimeout(timer);
  }, [accountId]);

  if (!accountId) {
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
          {/* Begin Constant Contact Inline Form Code (the widget fills it; React must not) */}
          <div
            ref={containerRef}
            className="ctct-inline-form"
            data-form-id={newsletter.constantContactFormId}
          />
          {/* End Constant Contact Inline Form Code */}
          {/* Shown by CSS only while the div above is empty */}
          <p className="kcd-updates-loading" role="status">
            {isSlow ? (
              "The sign-up form is taking a while to load. If it doesn't appear, refresh the page or allow Constant Contact (ctctcdn.com) in your content blocker."
            ) : (
              <>
                <span className="kcd-updates-spinner" aria-hidden="true" />
                Loading the sign-up form…
              </>
            )}
          </p>
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
