MARIA VERA PORTFOLIO — PDF ROUTE FIX

Fixed:
- All case-study PDF buttons now use root-absolute URLs:
  /pdf/Fiji_Plastic_Waste_Profile_Redesign_Maria_Vera_IUCN.pdf
  /pdf/The_Dark_Fleet_Visual_Communication_Maria_Vera.pdf
  /pdf/Quantifying_Shrimp_Welfare_Threats_Visual_Summary_Maria_Vera.pdf

Why:
Relative pdf/... URLs could resolve under /case-studies/... when a project was opened directly,
causing a 404 and then a redirect back to Home.

Also improved:
- Unknown 404 paths no longer silently redirect to Home.
- The three supported legacy case-study fallback routes still redirect correctly.

This package is based on the current Search Console / SEO Stable build.
