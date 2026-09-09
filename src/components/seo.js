import * as React from "react";
import { useStaticQuery, graphql } from "gatsby";

function Seo({ description, title, children }) {
  const { site } = useStaticQuery(
    graphql`
      query {
        site {
          siteMetadata {
            title
            description
            siteUrl
          }
        }
      }
    `
  );

  const metaDescription = description || site.siteMetadata.description;
  const defaultTitle = site.siteMetadata?.title;
  const siteUrl = site.siteMetadata?.siteUrl || "";
  const fullTitle = title ? `${title} | ${defaultTitle}` : defaultTitle;

  return (
    <>
      <html lang="en" />
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="theme-color" content="#0b1f3a" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:type" content="website" />
      {siteUrl && <meta property="og:url" content={siteUrl} />}
      {siteUrl && <meta property="og:image" content={`${siteUrl}/og-image.png`} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      <link rel="preload" href="/fonts/lexend-variable-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      {children}
    </>
  );
}

export default Seo;
