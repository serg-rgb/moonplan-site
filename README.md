# Moonplan website

Static website for Moonplan by Aurelia Labs LLC, in eight languages: English, German, Spanish, French, Italian, Portuguese (Brazil), Russian and Japanese. Each language includes the landing page, privacy policy, terms, support and publisher information. A language selector and branded 404 are included.

Production: https://moonplan.day/
Repository: https://github.com/serg-rgb/moonplan-site

## Build locally

Python 3.9+ is the only build requirement; no packages or API keys are needed.

```sh
python3 build.py --preview
python3 -m http.server 4817 --directory dist
```

Open http://localhost:4817/en/ (or `/de/`, `/es/`, `/fr/`, `/it/`, `/pt-br/`, `/ru/`, `/ja/`). `python3 build.py` builds production with indexing enabled. `--preview` adds noindex and omits the production sitemap entries.

## Edit

- `content/`: marketing and support text per language (`pt-br` is served with `lang="pt-BR"`).
- `legal/`: privacy, terms and publisher text for each language. es, fr, it, pt-br and ru are convenience translations of the English text (each intro says the English version applies); they are not lawyer-reviewed.
- `site.json`: company, contact, origin and eventual App Store URL.
- `scripts/render.py`: shared HTML templates.
- `news.json`: the four science-news cards (see below). Rendered by `scripts/news.py`.
- `assets/`: styles, progressive enhancement, local fonts and real app screenshots.
- `vercel.json`: static build, output directory and URL handling.

When the app launches, set `appStoreUrl` and update release text and the first FAQ answer in all languages. Review the preview wording in the terms. Update legal text before introducing purchases, analytics or another data flow.

## Hosting and deployment

Production is hosted in the already active Vercel Pro account, project `moonplan-site`. Pushing main automatically builds the static output. The framework is Other, build command `python3 build.py`, output `dist`. No server functions or new paid subscription were added. Domain registration and renewal are managed separately in Vercel; see `docs/domain-setup.md`.

The GitHub Pages workflow is manual and serves an optional noindex preview using its project base path. It does not deploy production or configure the production domain.

For manual production deployment from an explicitly linked directory, inspect the project and scope first, then use `vercel deploy --prod --scope sergcreator69-1812s-projects`. Keep `.vercel/` local and out of Git.

## Assets and privacy

Unbounded / Manrope match the current AstroGuide website. Font licences are bundled in `assets/fonts`. Japanese glyphs use system fonts. App screenshots were converted to WebP; no new external image assets were downloaded. The social preview is a browser rendering of the branding and a real app screenshot.

No cookies, signup forms, third-party scripts or payment forms. Production pages load Vercel Web Analytics (cookieless, same-origin script, `analyticsScript` in site.json; omitted in `--preview` builds); the privacy policy describes it in all languages. Infrastructure logs are described in the privacy policy, covering Vercel production and the GitHub Pages preview.

## App Store metadata

| Language | Marketing | Privacy | Support | Terms |
|---|---|---|---|---|
| English | `/en/` | `/en/privacy.html` | `/en/support.html` | `/en/terms.html` |
| German | `/de/` | `/de/privacy.html` | `/de/support.html` | `/de/terms.html` |
| Japanese | `/ja/` | `/ja/privacy.html` | `/ja/support.html` | `/ja/terms.html` |

The same four pages exist under `/es/`, `/fr/`, `/it/`, `/pt-br/` and `/ru/`.

App screenshots on the site are the raw App Store 1.1 captures (`../store/raw/<lang>/`: 01-today, 02-planner, 03-calendar, 06-moon-names) converted to WebP q80. Localized App Store badges for all 8 languages come from Apple Marketing Tools (toolbox.marketingtools.apple.com, black, downloaded 2026-11-11); the English badge is the fallback if one is missing.

Use https://moonplan.day as the origin. Apple also requires an accessible privacy policy link inside the app. This website does not modify the iOS code or App Store Connect fields. Apple's Standard EULA applies unless a different licence is expressly supplied; these website terms supplement it. Legal text describes the implementation reviewed November 5, 2026 and does not certify App Review approval or replace legal review.

## Checks and local materials

`scripts/check-site.cjs` verifies all page variants at four widths, menu and FAQ behavior, language changes, accessibility basics and internal links. `scripts/check-production.cjs` checks the production domain, all translated documents, HTTPS, www redirect and custom 404. Both use an existing Playwright installation and Chrome.

```sh
PLAYWRIGHT_MODULE=/path/to/playwright node scripts/check-site.cjs
PLAYWRIGHT_MODULE=/path/to/playwright node scripts/check-production.cjs
```

Reports and screenshots default to `verification/`. `deliverables/` contains the source archive and Russian handoff/domain documents. `work/` contains reference and diagnostic files. These three directories are local, ignored by Git and excluded from the website build. All landing materials remain in this Desktop project directory.

## Space background and news

The landing pages (not legal/support/root) draw the Moon on `canvas#space` with plain WebGL: `assets/space/space.js` (phase maths in `moonphase.js`, textures `*.webp`), styled by `assets/space.css`. No library, no network except same-origin files; reduced motion draws one still frame, and without WebGL the page keeps its dark background. HUD words come from `content/{lang}.json` (`moonNow`, `lit`, `waxing`, `waning`, `moonCredit`). Credits: Moon colour map and surface data from NASA SVS CGI Moon Kit 4720 (LRO LROC colour, LOLA elevation); news illustrations are Moonplan renders from the same LRO data.

News (`news.json`), update weekly: keep 4 items, newest or most relevant first. Each item has `id`, `url` (https, original source), `source`, `date` (YYYY-MM-DD), `image` (file name without extension in `assets/news/`) and `text` with `title`, `summary` and `alt` in all 8 languages (`ru`, `en`, `de`, `es`, `fr`, `it`, `pt-br`, `ja`); a missing language falls back to English. Paraphrase briefly, keep numbers exact, add no claims. Set `updated`, rebuild, run the check. Section labels are in `content/{lang}.json` (`news*`, `illustrationCredit`).

## Articles

Source: `articles/{slug}/{lang}.md` (one folder per article, one file per language) plus shared files in the same folder: data (`lunation-lengths.csv`, `phases-2027-utc.txt`) and images (`cover.webp`, optional `cover-800.webp` for srcset, `og.png`). Only `.webp/.png/.jpg/.svg` are copied to `dist/assets/articles/{slug}/`; data, `.md` and `*.SOURCE.txt` are not published. Build modules: `scripts/articles.py` (pages, hub, JSON-LD), `markdown.py` (front matter + Markdown subset), `figures.py` (inline SVG figures/tables), style `assets/article.css`.

Output: `/{lang}/moon/{slug}.html` for each language that has the file, and a hub `/{lang}/moon/` for each language with at least one article. Both go to `sitemap.xml`. hreflang lists only existing translations; the language switcher sends other languages to their home page. The footer links to the hub where it exists.

Front matter: `slug` (= folder name), `section` (`moon`), `title`, `seoTitle`, `description`, `author`, `updated` (YYYY-MM-DD, also used as published/modified date), optional `cover` and `coverAlt`, `figures` (list of `id`, `kind`, `caption`), `sources` (list of `text: https://url`; a line without a URL is shown as plain text). Body: `## headings` (table of contents), paragraphs, `- lists`, pipe tables, `**bold**`, `[text](url)`, and tokens alone on a line: `[[figure:phases-orbit]]`, `[[figure:lunation-length]]`, `[[table:phases-2027]]`. Unknown tokens or undeclared figures fail the build.

Add a language: copy `ru.md` to `articles/{slug}/{lang}.md`, translate it (keep slug and figure ids), add the language to the label dictionary `L` in `figures.py` if it is not ru/en (fallback is English), rebuild. UI strings are `article*` and `breadcrumb*` keys in `content/{lang}.json`. `check-site.cjs` discovers the article routes from the `articles/` folder.
