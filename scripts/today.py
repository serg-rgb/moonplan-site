"""/{lang}/today/ : "Moon today". Static, indexable explanations (content/{lang}.json -> today) plus a live block filled in the browser by
assets/today/today-ui.js from Astronomy Engine (assets/vendor/astronomy-engine). The Moon picture is one of 72 pre-rendered frames
(assets/today/phases/, made by tools/today/render_phases.cjs). No location, no network requests besides the page's own files."""
import json
from html import escape as e
from articles import json_ld
from banner import banner, stylesheet as banner_css
from render import footer, head, header

PAGE = 'today/'
LIVE_KEYS = ('tz', 'todayAt', 'utc', 'pNew', 'pFirst', 'pFull', 'pLast', 'pWaxingCrescent', 'pWaxing', 'pWaning', 'pWaningCrescent',
             'lLit', 'lAge', 'lDist', 'lDiam', 'lLibLon', 'lLibLat', 'lPhaseAngle', 'uDays', 'uKm', 'qTitle', 'apTitle', 'ecTitle',
             'perigee', 'apogee', 'eTotal', 'ePartial', 'ePenumbral', 'imgAlt', 'stub', 'error')

def url_of(cfg, lang): return f'{cfg["url"]}/{lang}/{PAGE}'

def today_page(lang, c, cfg):
    t = c['today']; base = cfg['base']; url = url_of(cfg, lang)
    live = dict({k: t[k] for k in LIVE_KEYS}, locale=c['locale'].replace('_', '-'), phases=f'{base}/assets/today/phases/')
    ld = json_ld({'@context': 'https://schema.org', '@graph': [
        {'@type': 'WebPage', 'name': t['h1'], 'description': t['description'], 'url': url, 'inLanguage': c['locale'].replace('_', '-'),
         'isPartOf': {'@type': 'WebSite', 'name': 'Moonplan', 'url': cfg['url'] + '/'}},
        {'@type': 'BreadcrumbList', 'itemListElement': [
            {'@type': 'ListItem', 'position': 1, 'name': c['breadcrumbHome'], 'item': f'{cfg["url"]}/{lang}/'},
            {'@type': 'ListItem', 'position': 2, 'name': t['crumb']}]}]})
    top = head(lang, c, cfg, PAGE, title=t['seoTitle'], description=t['description'], noindex=cfg['noindex'])
    top = top.replace('</head>', f'<link rel="stylesheet" href="{base}/assets/article.css"><link rel="stylesheet" href="{base}/assets/today.css">{banner_css(cfg)}'
                      f'<script defer src="{base}/assets/vendor/astronomy-engine/astronomy.browser.min.js"></script>'
                      f'<script type="module" src="{base}/assets/today/today-ui.js"></script>{ld}</head>', 1)
    crumbs = (f'<nav class="crumbs" aria-label="{e(c["breadcrumbLabel"], quote=True)}"><ol><li><a href="{base}/{lang}/">{e(c["breadcrumbHome"])}</a></li>'
              f'<li aria-current="page">{e(t["crumb"])}</li></ol></nav>')
    sections = ''.join(f'<h2>{e(s["title"])}</h2><p>{e(s["text"])}</p>' for s in t['sections'])
    how = ''.join(f'<p>{e(p)}</p>' for p in t['how'])
    i18n = json.dumps(live, ensure_ascii=False).replace('<', '\\u003c')
    body = (f'<main id="main" class="article-page today-page wrap">{crumbs}'
        f'<header class="article-head"><p class="eyebrow">{e(c["eyebrow"])}</p><h1>{e(t["h1"])}</h1><p class="intro">{e(t["lead"])}</p></header>'
        f'<section class="today-live"><figure class="today-moon" data-moon><div class="today-frame" data-frame></div><figcaption>{e(t["imgCredit"])}</figcaption></figure>'
        f'<div class="today-data" data-today></div><noscript><p class="today-note">{e(t["noscript"])}</p></noscript>'
        f'<script type="application/json" id="today-i18n">{i18n}</script></section>'
        f'<div class="article-body">{sections}<h2>{e(t["howTitle"])}</h2>{how}<h2>{e(t["srcTitle"])}</h2><p>{e(t["srcText"])}</p></div>'
        f'{banner(c, cfg, lang, "today")}</main>')
    return top + header(lang, c, cfg, PAGE) + body + footer(lang, c, cfg, PAGE)

def build(root, out, cfg, contents):
    """Writes /{lang}/today/index.html for every language; returns the URLs for the sitemap."""
    urls = []
    for lang in cfg['languages']:
        d = out / lang / 'today'; d.mkdir(parents=True, exist_ok=True)
        (d / 'index.html').write_text(today_page(lang, contents[lang], cfg), encoding='utf-8')
        urls.append(url_of(cfg, lang))
    return urls
