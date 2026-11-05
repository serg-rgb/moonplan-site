# Moonplan website

Static multilingual website for Moonplan by Aurelia Labs LLC. English, German and Japanese; each language includes the landing page, privacy policy, terms, support and publisher information. The root is a language selector and a custom 404 is included.

## Build and preview

Python 3.9+ is the only build requirement. No packages or API keys are needed.

```sh
python3 build.py --preview
python3 -m http.server 4817 --directory dist
```

Open http://localhost:4817/en/ (or `/de/`, `/ja/`). The default production origin in `site.json` is `https://moonplan.day`; it is a planned domain until registration and DNS are completed.

For a GitHub project preview, build with its base path:

```sh
python3 build.py --url https://serg-rgb.github.io/moonplan-site --preview
```

The preview is marked `noindex`; it is publicly accessible, not password protected. Production is built without `--preview`, with canonical URLs, reciprocal language alternates, sitemap and CNAME.

## Edit

- `content/en.json`, `de.json`, `ja.json`: marketing, navigation and support text.
- `legal/en.json`, `de.json`, `ja.json`: privacy, terms and publisher pages.
- `site.json`: contact, company details, target domain, eventual App Store URL.
- `scripts/render.py`: shared HTML templates.
- `assets/site.css`, `responsive.css`: layout and responsive rules.
- `assets/site.js`: progressive enhancement for menu, reveals and copy email.

When the app launches, set `appStoreUrl` and update the release status and first FAQ answer in all three content files. Review the terms’ preview wording. When subscriptions, analytics or another data flow are introduced, update the matching legal text before the feature ships.

## Hosting

Repository: https://github.com/serg-rgb/moonplan-site

GitHub Actions builds HTML and deploys to GitHub Pages. Hosting and public repository Actions use the existing GitHub account; no backend, paid site builder, database or email signup service is used. Domain registration and renewal are separate purchases.

The workflow defaults to the preview URL. After the domain is registered and configured, set repository variables `SITE_URL=https://moonplan.day` and `INDEX_SITE=true`, update the Pages custom domain, and rerun the workflow. Wait for certificate approval before enforcing HTTPS on the custom domain. The website does not manage domain registration or billing.

## Assets and privacy

The font pair Unbounded / Manrope matches the current AstroGuide website. Original fonts and screenshots come from the existing Moonplan project; font licences are in `assets/fonts/`. Screenshots were converted to WebP for delivery. Japanese glyphs use the visitor’s system fonts. No external font requests are made. The social preview is a browser rendering of the website branding and a real app screenshot.

No cookies, analytics, local storage, remote scripts, signup forms or payment processing are added. GitHub Pages infrastructure still processes access logs, as explained in the privacy policy. The publisher’s address matches https://aurelialabs.io/ at the time of preparation.

## Store metadata

Once live on the final domain, use these paths in App Store Connect:

| Language | Marketing | Privacy | Support | Terms |
|---|---|---|---|---|
| English | `/en/` | `/en/privacy.html` | `/en/support.html` | `/en/terms.html` |
| German | `/de/` | `/de/privacy.html` | `/de/support.html` | `/de/terms.html` |
| Japanese | `/ja/` | `/ja/privacy.html` | `/ja/support.html` | `/ja/terms.html` |

Apple also requires an easily accessible privacy policy link **inside the app**. Publishing this website does not add that app link or change App Store Connect metadata. App distribution uses Apple’s Standard EULA unless a different licence is explicitly supplied; these website terms supplement it.

Legal text describes the implementation reviewed on November 5, 2026. It does not certify App Review approval or substitute for jurisdiction specific legal review. The publisher should confirm its operational handling of support emails and international transfers before relying on the policy.

## Verification

`scripts/check-site.cjs` uses an existing Playwright installation and Chrome. It checks all public page variants at 320, 390, 768 and 1440 px, translated legal navigation, mobile menu, native FAQ without JS, reduced motion, clipboard feedback, local links and browser errors. Screenshots are written outside the site output.

```sh
PLAYWRIGHT_MODULE=/path/to/playwright ARTIFACTS=/tmp/moonplan-checks node scripts/check-site.cjs
```

Set `SITE_URL` when testing a base path or deployed preview. The test expects all route requests to return 200 including the direct `/404.html` document; an unknown URL on the deployed host should instead return HTTP 404 with that document.
