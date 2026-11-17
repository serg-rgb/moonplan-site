"""Reading cards: the landing section #read, the header nav item and the article cards on hub pages.
Cards are built from what exists for the language: the "Moon today" page plus every article (newest first)."""
from html import escape as e
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TODAY_IMAGE = 'assets/news/supermoon.webp'  # same illustration as the news card
LIMIT = {'ja': 70}  # characters; Japanese has no word boundaries and is denser
STR = {  # (eyebrow, title, nav item)
    'ru': ('Читать', 'Луна, календарь и история', 'Статьи'),
    'en': ('Read', 'The Moon, the calendar and history', 'Articles'),
    'de': ('Lesen', 'Mond, Kalender und Geschichte', 'Artikel'),
    'es': ('Leer', 'La Luna, el calendario y la historia', 'Artículos'),
    'fr': ('Lire', 'La Lune, le calendrier et l\'histoire', 'Articles'),
    'it': ('Leggere', 'La Luna, il calendario e la storia', 'Articoli'),
    'pt-br': ('Ler', 'A Lua, o calendário e a história', 'Artigos'),
    'ja': ('読む', '月、暦、そして歴史', '記事'),
}
_cache = {}

def articles_for(lang):
    """Articles of one language, newest first (by 'updated', then slug)."""
    import articles  # late import: articles imports render, which imports this module
    if 'all' not in _cache: _cache['all'] = articles.load(ROOT)
    return sorted((a for a in _cache['all'] if a['lang'] == lang), key=lambda a: (a['meta']['updated'], a['slug']), reverse=True)

def shorten(text, lang, limit=140):
    limit = LIMIT.get(lang, limit); text = ' '.join(text.split())
    if len(text) <= limit: return text
    cut = text[:limit]
    if lang != 'ja' and ' ' in cut: cut = cut[:cut.rindex(' ')]
    return cut.rstrip(' ,;:.-–—、。') + '…'

def card(href, img, size, title, desc, label, lang, h='h3'):
    return (f'<li><a href="{e(href, quote=True)}"><figure><img src="{img}" alt="" width="{size[0]}" height="{size[1]}" loading="lazy" decoding="async"></figure>'
            f'<span class="meta">{e(label)}</span><{h}>{e(title)}</{h}><p>{e(shorten(desc, lang))}</p></a></li>')

def article_card(a, lang, cfg, c, h='h3'):
    import articles
    m, base = a['meta'], cfg['base']
    cov = m.get('cover'); small = Path(cov).with_name(Path(cov).stem + '-800.webp') if cov else None
    href = f'{base}/{lang}/{m["section"]}/{a["slug"]}.html'
    label = c[f'articleSection_{m["section"]}']
    if not (small and (a['folder'] / small).exists()):
        return f'<li><a href="{e(href, quote=True)}"><span class="meta">{e(label)}</span><{h}>{e(m["title"])}</{h}><p>{e(shorten(m["description"], lang))}</p></a></li>'
    return card(href, f'{base}/assets/articles/{a["slug"]}/{small.name}', articles.image_size(a['folder'] / small), m['title'], m['description'], label, lang, h)

def cards_list(arts, lang, cfg, c, h='h3'):
    return f'<ul class="read-cards">{"".join(article_card(a, lang, cfg, c, h) for a in arts)}</ul>'

def cover_of(a, cfg):
    """(url, (w, h)) of the 800 px cover of an article, or None."""
    import articles
    cov = a['meta'].get('cover')
    if not cov: return None
    small = Path(cov).with_name(Path(cov).stem + '-800.webp')
    if not (a['folder'] / small).exists(): return None
    return f'{cfg["base"]}/assets/articles/{a["slug"]}/{small.name}', articles.image_size(a['folder'] / small)

def group(sec, arts, lang, c, cfg):
    """One section: header tile (cover of its newest article, name, hub intro, link) and every article as a card."""
    base = cfg['base']; hub = f'{base}/{lang}/{sec}/'
    cov = cover_of(arts[0], cfg)
    fig = f'<figure><img src="{cov[0]}" alt="" width="{cov[1][0]}" height="{cov[1][1]}" loading="lazy" decoding="async"></figure>' if cov else ''
    intro = c.get(f'articleHubIntro_{sec}', c['articleHubIntro'])
    head = (f'<a class="read-head" href="{e(hub, quote=True)}">{fig}<div><h3>{e(c[f"articleSection_{sec}"])}</h3><p>{e(intro)}</p>'
            f'<span class="go">{e(c["articleBack"] if sec == "moon" else c[f"articleSection_{sec}"])} →</span></div></a>')
    return f'<div class="read-group">{head}{cards_list(arts, lang, cfg, c, "h4")}</div>'

def read_section(lang, c, cfg):
    import articles
    from render import SECTIONS
    base, t = cfg['base'], c['today']
    size = articles.image_size(ROOT / TODAY_IMAGE)
    today = (f'<div class="read-group read-today"><a class="read-head" href="{base}/{lang}/today/"><figure><img src="{base}/{TODAY_IMAGE}" alt="" width="{size[0]}" height="{size[1]}" loading="lazy" decoding="async"></figure>'
             f'<div><h3>{e(t["nav"])}</h3><p>{e(shorten(t["description"], lang, 200))}</p><span class="go">{e(t["nav"])} →</span></div></a></div>')
    arts = articles_for(lang)
    groups = ''.join(group(s, [a for a in arts if a['meta']['section'] == s], lang, c, cfg)
                     for s in SECTIONS if any(a['meta']['section'] == s for a in arts))
    eyebrow, title, _ = STR[lang]
    from banner import banner
    return (f'<section class="read wrap" id="read" aria-labelledby="read-title"><p class="eyebrow">{e(eyebrow)}</p><h2 id="read-title">{e(title)}</h2>'
            f'{today}{groups}{banner(c, cfg, lang, "home")}</section>')

def nav_link(lang, cfg):
    return f'<a href="{cfg["base"]}/{lang}/#read">{e(STR[lang][2])}</a>'

def stylesheet(cfg): return f'<link rel="stylesheet" href="{cfg["base"]}/assets/reading.css">'

def rail(lang, c, cfg):
    """Phase rail under the hero as real navigation. Targets: moon-phases article, today page, #discover (everyday plans = app features), Apollo hub;
    a target missing for the language falls back to #read."""
    base = cfg['base']
    have = {a['slug'] for a in articles_for(lang)}
    apollo = lang in cfg.get('hubs', {}).get('apollo', ())
    hrefs = [f'{base}/{lang}/moon/moon-phases.html' if 'moon-phases' in have else '#read', f'{base}/{lang}/today/', '#discover',
             f'{base}/{lang}/apollo/' if apollo else '#read']
    items = ''.join(f'<a href="{e(h, quote=True)}"><i class="phase phase-{i}" aria-hidden="true"></i>{e(x)}</a>' for i, (h, x) in enumerate(zip(hrefs, c['rail'])))
    return f'<nav class="phase-rail wrap" aria-label="{e(STR[lang][1], quote=True)}">{items}</nav>'
