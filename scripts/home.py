"""Home page blocks (layout A, "magazine with alternation"): the Moon-today block (#read), article groups per programme
(header without picture, one big main article, compact list of the rest) and the three feature blocks with phones."""
from html import escape as e
import reading
from reading import shorten

MAIN = {'moon': 'moon-folk-signs', 'apollo': 'apollo-11', 'luna': 'lunokhod-1', 'china': 'change-4', 'new': 'artemis-2'}
THUMB_H, THUMB_MAX_W = 72, 144

def _link(a, lang, cfg):
    return f'{cfg["base"]}/{lang}/{a["meta"]["section"]}/{a["slug"]}.html'

def _main(a, lang, cfg, c):
    cov = reading.cover_of(a, cfg); m = a['meta']
    fig = f'<figure><img src="{cov[0]}" alt="" width="{cov[1][0]}" height="{cov[1][1]}" loading="lazy" decoding="async"></figure>' if cov else ''
    return (f'<a class="rg-main" href="{e(_link(a, lang, cfg), quote=True)}">{fig}<span class="meta">{e(c["articleSection_" + m["section"]])}</span>'
            f'<h4>{e(m["title"])}</h4><p>{e(shorten(m["description"], lang, 200))}</p></a>')

def _item(a, lang, cfg):
    cov = reading.cover_of(a, cfg); m = a['meta']; img = ''
    if cov:
        w, h = cov[1]; tw, th = round(THUMB_H * w / h), THUMB_H
        if tw > THUMB_MAX_W: tw, th = THUMB_MAX_W, round(THUMB_MAX_W * h / w)
        img = f'<img src="{cov[0]}" alt="" width="{tw}" height="{th}" loading="lazy" decoding="async">'
    return (f'<li><a href="{e(_link(a, lang, cfg), quote=True)}">{img}<span><h4>{e(m["title"])}</h4>'
            f'<p>{e(shorten(m["description"], lang, 90))}</p></span></a></li>')

def group(sec, arts, lang, c, cfg):
    hub = f'{cfg["base"]}/{lang}/{sec}/'
    main = next((a for a in arts if a['slug'] == MAIN.get(sec)), arts[0])
    rest = [a for a in arts if a is not main]
    head = (f'<div class="rg-head"><h3>{e(c[f"articleSection_{sec}"])}</h3><p>{e(c.get(f"articleHubIntro_{sec}", c["articleHubIntro"]))}</p>'
            f'<a class="go" href="{e(hub, quote=True)}">{e(c.get(f"articleBack_{sec}", c["articleBack"]))} →</a></div>')
    lst = f'<ul class="rg-list">{"".join(_item(a, lang, cfg) for a in rest)}</ul>' if rest else ''
    return f'<div class="read-group">{head}<div class="rg-body">{_main(main, lang, cfg, c)}{lst}</div></div>'

def groups_block(secs, lang, c, cfg, extra=''):
    arts = reading.articles_for(lang)
    out = ''.join(group(s, [a for a in arts if a['meta']['section'] == s], lang, c, cfg) for s in secs if any(a['meta']['section'] == s for a in arts))
    return f'<section class="read wrap {extra}" data-read>{out}</section>' if out else ''

def today_block(lang, c, cfg):
    import articles  # late import: articles imports render
    base, t = cfg['base'], c['today']; arts = reading.articles_for(lang)
    size = articles.image_size(reading.ROOT / reading.TODAY_IMAGE)
    eyebrow, title, _ = reading.STR[lang]
    return (f'<section class="read wrap" id="read" data-read aria-labelledby="read-title"><p class="eyebrow">{e(eyebrow)}</p><h2 id="read-title">{e(title)}</h2>'
            f'<div class="read-group read-today"><a class="today-fig" href="{base}/{lang}/today/" tabindex="-1" aria-hidden="true"><figure><img src="{base}/{reading.TODAY_IMAGE}" alt="" width="{size[0]}" height="{size[1]}" loading="lazy" decoding="async"></figure></a>'
            f'<div><h3>{e(t["nav"])}</h3><p>{e(shorten(t["description"], lang, 200))}</p><p class="links"><a class="go" href="{base}/{lang}/today/">{e(t["nav"])} →</a></p></div></div></section>')

def phone(lang, kind, alt, cfg):
    return f'<div class="phone"><img src="{cfg["base"]}/assets/screens/{kind}-{lang}.webp" width="1290" height="2796" alt="{e(alt, quote=True)}" loading="lazy" decoding="async"></div>'

def feature(f, lang, cfg, c, flip=False):
    from render import cta  # App Store badge next to every phone (Sergey, 2026-11-18)
    note = f'<p class="note">{e(f["note"])}</p>' if f.get('note') else ''
    return (f'<article class="feature reveal{" flip" if flip else ""}"><div class="feature-copy"><p class="eyebrow"><span class="index">{f["number"]}</span>{e(f["tag"])}</p><h3>{e(f["title"])}</h3>'
            f'<p>{e(f["body"])}</p><p class="feature-detail">{e(f["detail"])}</p>{note}<div class="feature-cta">{cta(c, cfg, "#discover", lang)}</div></div>'
            f'<figure class="feature-visual">{phone(lang, f["image"], f["alt"], cfg)}</figure></article>')

def lines(v): return '<br>'.join(e(x) for x in (v if isinstance(v, list) else v.split('\n')))

def discover(lang, c, cfg):
    return (f'<section id="discover" class="section wrap"><div class="section-heading reveal"><p class="eyebrow">{e(c["featureEyebrow"])}</p><h2>{lines(c["featureTitle"])}</h2><p>{e(c["featureIntro"])}</p></div>'
            f'{feature(c["features"][0], lang, cfg, c)}</section>')

def feature_block(i, lang, c, cfg):
    return f'<section class="wrap feature-block">{feature(c["features"][i], lang, cfg, c, flip=i == 1)}</section>'

def extras(c):
    return (f'<section class="section wrap"><p class="preview-note">{e(c["preview"])}</p><div class="extra-grid">'
            + ''.join(f'<article class="extra reveal"><span class="extra-symbol" aria-hidden="true">{s}</span><h3>{e(x["title"])}</h3><p>{e(x["body"])}</p></article>' for s, x in zip(('◔', '☾', '文'), c['extras']))
            + '</div></section>')

def middle(lang, c, cfg):
    """Everything between the phase rail and the "how" section, in the order of layout A."""
    return ''.join([today_block(lang, c, cfg), groups_block(('moon',), lang, c, cfg), groups_block(('apollo',), lang, c, cfg), discover(lang, c, cfg),
                    groups_block(('luna',), lang, c, cfg), feature_block(1, lang, c, cfg),
                    groups_block(('china', 'new'), lang, c, cfg, 'read-pair'), feature_block(2, lang, c, cfg), extras(c)])
