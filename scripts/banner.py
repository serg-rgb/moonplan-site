"""App banner shown on every content page. Texts: content/{lang}.json -> banners.{kind}.{title,text}.
kind: apollo | luna | china | new | moon (article sections), today, home, general (legal pages, support, publisher)."""
from html import escape as e

KINDS = ('apollo', 'luna', 'china', 'new', 'moon', 'today', 'home', 'general')

def stylesheet(cfg): return f'<link rel="stylesheet" href="{cfg["base"]}/assets/banner.css">'

def banner(c, cfg, lang, kind):
    from render import cta  # late import: render imports pages that import this module
    b = c['banners'][kind]
    return (f'<aside class="app-banner" data-banner="{kind}"><p class="eyebrow">{e(c["eyebrow"])}</p>'
            f'<h2 class="app-banner-title">{e(b["title"])}</h2><p class="app-banner-text">{e(b["text"])}</p>'
            f'{cta(c, cfg, cfg["base"] + "/" + lang + "/", lang)}</aside>')
