# moonplan.day

Registered November 5, 2026 through the existing Vercel account for Aurelia Labs LLC. Billing and renewal are managed in Vercel.

Production uses the existing active Vercel Pro plan. Project: `moonplan-site`; repository: `serg-rgb/moonplan-site`. Git pushes to main build the static site with `python3 build.py` and publish `dist/`. No server functions, analytics or additional subscription were added.

## DNS

Vercel is the authoritative DNS provider. Current project recommendations:

| Type | Name | Value |
|---|---|---|
| A | @ | 216.150.1.1 |
| A | @ | 216.150.16.1 |
| CNAME | www | 01fd712a13ce3ce3.vercel-dns-016.com. |

The www hostname redirects to the apex domain with HTTP 308. Vercel manages HTTPS certificates. Existing certificate authority records were preserved. DNS recommendations can change; inspect the specific Vercel project before making future changes.

GitHub Pages is an optional preview at https://serg-rgb.github.io/moonplan-site/ with noindex. Its workflow is manual and does not manage the production domain.

Reference: https://vercel.com/docs/domains/working-with-domains/add-a-domain
