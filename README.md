# Moonplan website

Static website for Moonplan by Aurelia Labs LLC, in English, German and Japanese. Each language includes the landing page, privacy policy, terms, support and publisher information. A language selector and branded 404 are included.

Production: https://moonplan.day/
Repository: https://github.com/serg-rgb/moonplan-site

## Build locally

Python 3.9+ is the only build requirement; no packages or API keys are needed.

```sh
python3 build.py --preview
python3 -m http.server 4817 --directory dist
```

Open http://localhost:4817/en/ (or `/de/`, `/ja/`). `python3 build.py` builds production with indexing enabled. `--preview` adds noindex and omits the production sitemap entries.

## Edit

- `content/`: marketing and support text for en, de and ja.
- `legal/`: privacy, terms and publisher text for each language.
- `site.json`: company, contact, origin and eventual App Store URL.
- `scripts/render.py`: shared HTML templates.
- `assets/`: styles, progressive enhancement, local fonts and real app screenshots.
- `vercel.json`: static build, output directory and URL handling.

When the app launches, set `appStoreUrl` and update release text and the first FAQ answer in all three languages. Review the preview wording in the terms. Update legal text before introducing purchases, analytics or another data flow.

## Hosting and deployment

Production is hosted in the already active Vercel Pro account, project `moonplan-site`. Pushing main automatically builds the static output. The framework is Other, build command `python3 build.py`, output `dist`. No server functions or new paid subscription were added. Domain registration and renewal are managed separately in Vercel; see `docs/domain-setup.md`.

The GitHub Pages workflow is manual and serves an optional noindex preview using its project base path. It does not deploy production or configure the production domain.

For manual production deployment from an explicitly linked directory, inspect the project and scope first, then use `vercel deploy --prod --scope sergcreator69-1812s-projects`. Keep `.vercel/` local and out of Git.

## Assets and privacy

Unbounded / Manrope match the current AstroGuide website. Font licences are bundled in `assets/fonts`. Japanese glyphs use system fonts. App screenshots were converted to WebP; no new external image assets were downloaded. The social preview is a browser rendering of the branding and a real app screenshot.

No advertising or analytics cookies, signup forms, remote scripts, tracking or payment forms were added. Infrastructure logs are described in the privacy policy, covering Vercel production and the GitHub Pages preview.

## App Store metadata

| Language | Marketing | Privacy | Support | Terms |
|---|---|---|---|---|
| English | `/en/` | `/en/privacy.html` | `/en/support.html` | `/en/terms.html` |
| German | `/de/` | `/de/privacy.html` | `/de/support.html` | `/de/terms.html` |
| Japanese | `/ja/` | `/ja/privacy.html` | `/ja/support.html` | `/ja/terms.html` |

Use https://moonplan.day as the origin. Apple also requires an accessible privacy policy link inside the app. This website does not modify the iOS code or App Store Connect fields. Apple's Standard EULA applies unless a different licence is expressly supplied; these website terms supplement it. Legal text describes the implementation reviewed November 5, 2026 and does not certify App Review approval or replace legal review.

## Checks and local materials

`scripts/check-site.cjs` verifies all page variants at four widths, menu and FAQ behavior, language changes, accessibility basics and internal links. `scripts/check-production.cjs` checks the production domain, all translated documents, HTTPS, www redirect and custom 404. Both use an existing Playwright installation and Chrome.

```sh
PLAYWRIGHT_MODULE=/path/to/playwright node scripts/check-site.cjs
PLAYWRIGHT_MODULE=/path/to/playwright node scripts/check-production.cjs
```

Reports and screenshots default to `verification/`. `deliverables/` contains the source archive and Russian handoff/domain documents. `work/` contains reference and diagnostic files. These three directories are local, ignored by Git and excluded from the website build. All landing materials remain in this Desktop project directory.
