# moonplan.day — pending registration

The user selected this domain and plans to add a payment method in Vercel and provide registrant details. No registration has been executed and no charge has been made. Get a fresh Vercel quote and explicit approval of its disclosures before a purchase. Do not use an expired quote or infer purchase approval from a domain preference.

The site is already live at https://serg-rgb.github.io/moonplan-site/ with `noindex`. No paid hosting is needed.

After the purchase, verify the domain in GitHub using the TXT challenge shown by the account settings. Add `moonplan.day` as the custom domain of the `serg-rgb/moonplan-site` Pages site before changing DNS. Then add the following records at the authoritative DNS provider:

| Type | Name | Value |
|---|---|---|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | serg-rgb.github.io |

Do not add a wildcard record. Keep unrelated DNS records intact. If an existing apex record conflicts, review that specific record before replacing it. IPv6 records are optional and can be added using GitHub’s documented values.

Set the repository Actions variables `SITE_URL=https://moonplan.day` and `INDEX_SITE=true`. Rerun the website workflow, verify DNS, wait for the GitHub certificate, enforce HTTPS and check the apex and www redirect. GitHub Actions Pages sites use the repository custom domain setting; a generated CNAME file alone does not configure it.

Check each language’s homepage, privacy, terms and support page at the final domain. The app and App Store Connect must use the final public URLs. Adding the website alone does not insert a privacy link into the iOS app.

Official configuration reference, checked November 5, 2026:
https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site
