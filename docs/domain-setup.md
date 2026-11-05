# moonplan.day

Registered November 5, 2026 through the existing Vercel account for Aurelia Labs LLC. Domain billing and renewal are managed separately in Vercel; hosting uses GitHub Pages.

GitHub Pages repository: `serg-rgb/moonplan-site`. Production origin: `https://moonplan.day`. Actions variables: `SITE_URL=https://moonplan.day`, `INDEX_SITE=true`.

## DNS

Authoritative DNS is Vercel. The following records point to GitHub Pages:

| Type | Name | Value |
|---|---|---|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | serg-rgb.github.io |

The newly created default Vercel parking ALIAS records at the apex and wildcard were removed. Existing CAA records authorising certificate issuers, including letsencrypt.org, were preserved.

The GitHub Pages custom domain is set to moonplan.day. GitHub manages the HTTPS certificate. The root domain and www should be checked after any DNS or Pages configuration change.

Official reference: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site
