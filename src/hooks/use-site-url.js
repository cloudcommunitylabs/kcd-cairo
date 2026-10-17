import { useStaticQuery, graphql } from "gatsby";

/**
 * siteMetadata.siteUrl from gatsby-config.js (GATSBY_SITE_URL or the
 * pages.dev default), without a trailing slash.
 */
export default function useSiteUrl() {
  const { site } = useStaticQuery(graphql`
    query SiteUrl {
      site {
        siteMetadata {
          siteUrl
        }
      }
    }
  `);
  return (site.siteMetadata.siteUrl || "").replace(/\/+$/, "");
}
