"""/{lang}/today/ : live "Moon today" block (assets/today/today-ui.js) plus static, indexable content built from assets/today/rules.json."""
import json
from html import escape as e
from pathlib import Path
from articles import json_ld
from render import LANGS, cta, footer, head, header

PAGE = 'today/'
PHASE_KEYS = {'waxing': 'cWaxing', 'waning': 'cWaning', 'new': 'cNew', 'full': 'cFull'}
AVOID_KEYS = {'waxing': 'cNotWaxing', 'waning': 'cNotWaning'}
LIVE_KEYS = ('lang', 'locale', 'tz', 'lit', 'age', 'phaseWaxing', 'phaseWaning', 'phaseNew', 'phaseFull', 'good', 'avoid', 'empty', 'vg',
             'rWaxing', 'rWaning', 'rNew', 'rFull', 'rCal', 'rVoid', 'strip', 'stripFmt', 'todayWord', 'error')

def conditions_text(cond, t):
    """Traditional conditions of one activity in words. Calendar-day conditions are mentioned only generically."""
    pos = [t['cEarly'] if (p == 'waxing' and cond.get('earlyWaxing')) else t[PHASE_KEYS[p]] for p in cond.get('phase', [])]
    neg = [t[AVOID_KEYS[p]] for p in cond.get('phaseAvoid', [])]
    if cond.get('avoidNewFull'): neg.append(t['cNotNewFull'])
    if cond.get('avoidVoid'): neg.append(t['cNotVoid'])
    if any(cond.get(k) for k in ('signsGood', 'gardenGood')):  # avoid-only calendar rules are not mentioned
        pos.append(t['cCalExtra'] if pos else t['cCal'])
    text = ', '.join(pos + neg)
    return text[:1].upper() + text[1:] if text else ''

def url_of(cfg, lang): return f'{cfg["url"]}/{lang}/{PAGE}'

def today_page(lang, c, cfg, rules):
    t = dict(c['today']); base = cfg['base']; url = url_of(cfg, lang)
    live = dict({k: t[k] for k in LIVE_KEYS if k in t}, lang=lang, locale=c['locale'].replace('_', '-'))
    ld = json_ld({'@context': 'https://schema.org', '@graph': [
        {'@type': 'WebPage', 'name': t['h1'], 'description': t['description'], 'url': url, 'inLanguage': c['locale'].replace('_', '-'),
         'isPartOf': {'@type': 'WebSite', 'name': 'Moonplan', 'url': cfg['url'] + '/'}},
        {'@type': 'BreadcrumbList', 'itemListElement': [
            {'@type': 'ListItem', 'position': 1, 'name': c['breadcrumbHome'], 'item': f'{cfg["url"]}/{lang}/'},
            {'@type': 'ListItem', 'position': 2, 'name': t['crumb']}]}]})
    top = head(lang, c, cfg, PAGE, title=t['seoTitle'], description=t['description'], noindex=cfg['noindex'])
    top = top.replace('</head>', f'<link rel="stylesheet" href="{base}/assets/article.css"><link rel="stylesheet" href="{base}/assets/today.css">'
                      f'<script type="module" src="{base}/assets/today/today-ui.js"></script>{ld}</head>', 1)
    crumbs = (f'<nav class="crumbs" aria-label="{e(c["breadcrumbLabel"], quote=True)}"><ol><li><a href="{base}/{lang}/">{e(c["breadcrumbHome"])}</a></li>'
              f'<li aria-current="page">{e(t["crumb"])}</li></ol></nav>')
    groups = ''
    for g in rules['groups']:
        items = ''.join(f'<li><strong>{e(a["names"][lang])}</strong><span>{e(conditions_text(a["cond"], t))}</span></li>'
                        for a in rules['activities'] if a['group'] == g['id'])
        groups += f'<h3>{e(g["names"][lang])}</h3><ul class="today-all">{items}</ul>'
    how = ''.join(f'<p>{e(p)}</p>' for p in t['how'])
    body = (f'<main id="main" class="article-page today-page wrap">{crumbs}'
        f'<header class="article-head"><p class="eyebrow">{e(c["eyebrow"])}</p><h1>{e(t["h1"])}</h1><p class="intro">{e(t["lead"])}</p></header>'
        f'<section class="today-live" aria-live="polite"><div data-today></div><noscript><p class="today-note">{e(t["noscript"])}</p></noscript>'
        f'<script type="application/json" id="today-i18n">{json.dumps(live, ensure_ascii=False).replace("<", chr(92) + "u003c")}</script></section>'
        f'<div class="article-body"><h2>{e(t["introTitle"])}</h2><p>{e(t["intro"])}</p><h2>{e(t["howTitle"])}</h2>{how}'
        f'<h2>{e(t["listTitle"])}</h2>{groups}<p class="today-disclaimer">{e(t["disclaimer"])}</p></div>'
        f'<aside class="article-cta"><p class="eyebrow">{e(c["eyebrow"])}</p><p class="today-cta-text">{e(t["ctaText"])}</p>{cta(c, cfg, base + "/" + lang + "/", lang)}</aside></main>')
    return top + header(lang, c, cfg, PAGE) + body + footer(lang, c, cfg, PAGE)

def build(root, out, cfg, contents):
    """Writes /{lang}/today/index.html for every language; returns the URLs for the sitemap."""
    rules = json.loads((Path(root) / 'assets' / 'today' / 'rules.json').read_text(encoding='utf-8'))
    urls = []
    for lang in cfg['languages']:
        d = out / lang / 'today'; d.mkdir(parents=True, exist_ok=True)
        (d / 'index.html').write_text(today_page(lang, contents[lang], cfg, rules), encoding='utf-8')
        urls.append(url_of(cfg, lang))
    return urls
