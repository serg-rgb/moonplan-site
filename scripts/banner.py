"""App banner shown on every content page. Texts: content/{lang}.json -> banners.{kind}.{title,text}.
kind: apollo | luna | china | new | moon (article sections), today, home, general (legal pages, support, publisher)."""
from html import escape as e

KINDS = ('apollo', 'luna', 'china', 'new', 'moon', 'today', 'home', 'general')

def stylesheet(cfg): return f'<link rel="stylesheet" href="{cfg["base"]}/assets/banner.css">'

def banner(c, cfg, lang, kind):
    from render import cta  # late import: render imports pages that import this module
    b = c['banners'][kind]
    moon = (f'<figure class="app-banner-moon"><img src="{cfg["base"]}/assets/banner/full-moon.webp" width="480" height="480" alt="" '
            f'loading="lazy" decoding="async"><figcaption>NASA</figcaption></figure>')  # ISS014-E-08916, toned warm (assets/banner/SOURCE.txt)
    return (f'<aside class="app-banner" data-banner="{kind}">{moon}<div class="app-banner-body"><p class="eyebrow">{e(c["eyebrow"])}</p>'
            f'<h2 class="app-banner-title">{e(b["title"])}</h2><p class="app-banner-text">{e(b["text"])}</p>'
            f'{cta(c, cfg, cfg["base"] + "/" + lang + "/", lang)}</div></aside>')
