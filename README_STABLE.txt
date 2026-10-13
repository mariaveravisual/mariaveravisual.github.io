MARIA VERA PORTFOLIO — SEO STABLE BUILD

This build keeps the SEO improvements from SEO + Performance v2 but REMOVES native lazy loading from portfolio images.

Reason:
Images inside the dynamically hidden case-study overlay were not loading reliably after a clean-cache visit in some browser/deployment states.

Retained:
- sitemap.xml
- robots.txt
- canonical URLs
- unique case-study metadata
- structured data
- trailing-slash routes
- image width + height attributes
- decoding="async"
- Open Graph improvements
- Umami analytics
- direct case-study URLs / overlay behaviour
- automatic footer year

Removed:
- loading="lazy" / loading="eager" attributes

This intentionally prioritizes reliable image display over aggressive image deferral.
