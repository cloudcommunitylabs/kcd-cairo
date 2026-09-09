import * as React from "react";
import { Link } from "gatsby";
import Layout from "../components/layout";
import Seo from "../components/seo";

export const Head = () => <Seo title="Page not found" />;

export default function NotFoundPage() {
  return (
    <Layout>
      <section className="kcd-section kcd-section-dark kcd-not-found">
        <div className="kcd-container kcd-center">
          <p className="kcd-eyebrow">404</p>
          <h1 className="kcd-title">That page isn't ready yet</h1>
          <p className="kcd-lead">
            We're still building the KCD Cairo 2027 site. Head back home for the latest.
          </p>
          <Link to="/" className="kcd-button kcd-button-primary">
            Back to home
          </Link>
        </div>
      </section>
    </Layout>
  );
}
