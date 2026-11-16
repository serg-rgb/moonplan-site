"""Article system: articles/{slug}/{lang}.md -> /{lang}/{section}/{slug}.html and hub /{lang}/{section}/. See README, Articles."""
import json, math, re, shutil, struct
from datetime import date
from html import escape as e
from pathlib import Path
from markdown import ArticleError, convert, front_matter
from figures import render as render_figure
from news import format_date
from render import LANGS, SECTIONS, cta, footer, head, header, tag

IMAGES = ('.webp', '.png', '.jpg', '.jpeg', '.svg')  # only these are published; data/.md/.txt/.csv stay in the source folder
REQUIRED = ('slug', 'section', 'title', 'seoTitle', 'description', 'author', 'updated')
LD = 'application/ld+json'

def load(root):
    """All articles: list of dicts sorted by slug. Validates front matter; any problem is a build error."""
    found = []
    for md in sorted((root / 'articles').glob('*/*.md')):
        lang, folder = md.stem, md.parent
        if lang not in LANGS: raise ArticleError(f'{md}: unknown language file name')
        try:
            meta, body = front_matter(md.read_text(encoding='utf-8'))
            for k in REQUIRED:
                if not meta.get(k): raise ArticleError(f'missing "{k}"')
            if meta['slug'] != folder.name: raise ArticleError('slug differs from folder name')
            if meta['section'] not in SECTIONS: raise ArticleError(f'unknown section "{meta["section"]}"')
            date.fromisoformat(meta['updated'])
            meta.setdefault('figures', []); meta.setdefault('sources', [])
            if meta.get('cover') and not (folder / meta['cover']).exists(): raise ArticleError('cover file not found')
            for f in meta['figures']:
                if f.get('kind') == 'photo':
                    for k in ('file', 'caption'):
                        if not f.get(k): raise ArticleError(f'photo figure {f.get("id")}: missing "{k}"')
                    for n in photo_names(f['file']):
                        if not (folder / n).exists(): raise ArticleError(f'{n} not found: run tools/articles/prepare_images.py')
        except (ArticleError, ValueError) as err:
            raise ArticleError(f'{md}: {err}') from None
        found.append(dict(meta=meta, body=body, folder=folder, lang=lang, slug=meta['slug']))
    return found

def image_size(path):
    d = path.read_bytes()
    if d[:8] == b'\x89PNG\r\n\x1a\n': return struct.unpack('>II', d[16:24])
    if d[:4] == b'RIFF' and d[8:12] == b'WEBP':
        k = d[12:16]
        if k == b'VP8 ': return struct.unpack('<HH', d[26:30])[0] & 0x3fff, struct.unpack('<HH', d[26:30])[1] & 0x3fff
        if k == b'VP8L':
            b = struct.unpack('<I', d[21:25])[0]; return (b & 0x3fff) + 1, ((b >> 14) & 0x3fff) + 1
        if k == b'VP8X': return int.from_bytes(d[24:27], 'little') + 1, int.from_bytes(d[27:30], 'little') + 1
    raise ArticleError(f'{path}: cannot read image size')

def photo_names(file):  # derivatives written next to the source by tools/articles/prepare_images.py
    st = Path(file).stem
    return f'{st}-800.webp', f'{st}-1600.webp'

def photo(f, a, cfg):
    small, big = photo_names(f['file']); base = f'{cfg["base"]}/assets/articles/{a["slug"]}/'
    w, h = image_size(a['folder'] / big); w2 = image_size(a['folder'] / small)[0]
    alt = e(f.get('alt') or f['caption'], quote=True)
    return (f'<figure class="fig fig-photo"><img src="{base}{big}" srcset="{base}{small} {w2}w, {base}{big} {w}w" '
            f'sizes="(min-width:1000px) 960px, 100vw" width="{w}" height="{h}" loading="lazy" decoding="async" alt="{alt}">'
            f'<figcaption>{e(f["caption"])}</figcaption></figure>')

def figure_html(kind, ident, a, cfg):
    f = next((x for x in a['meta']['figures'] if x['id'] == ident), None)
    if kind == 'figure' and f and f.get('kind') == 'photo': return photo(f, a, cfg)
    return render_figure(kind, ident, a['lang'], a['folder'], a['meta']['figures'])

def url_of(cfg, lang, slug=None, sec='moon'): return f'{cfg["url"]}/{lang}/{sec}/' + (f'{slug}.html' if slug else '')
def page_of(slug=None, sec='moon'): return f'{sec}/' + (f'{slug}.html' if slug else '')
def sk(c, name, sec): return c.get(f'{name}_{sec}', c[name])  # per-section string, else the generic one

def alt_links(cfg, items):  # items: [(lang, url)]
    x = next((u for l, u in items if l == 'en'), items[0][1])
    return ''.join(f'<link rel="alternate" hreflang="{tag(l)}" href="{u}">' for l, u in items) + f'<link rel="alternate" hreflang="x-default" href="{x}">'

def crumbs(c, cfg, lang, tail, sec):
    base = cfg['base']
    items = [(c['breadcrumbHome'], f'{base}/{lang}/'), (c[f'articleSection_{sec}'], f'{base}/{lang}/{sec}/' if tail else None)]
    if tail: items.append((tail, None))
    li = ''.join(f'<li><a href="{u}">{e(t)}</a></li>' if u else f'<li aria-current="page">{e(t)}</li>' for t, u in items)
    return f'<nav class="crumbs" aria-label="{e(c["breadcrumbLabel"], quote=True)}"><ol>{li}</ol></nav>', items

def json_ld(data): return f'<script type="{LD}">' + json.dumps(data, ensure_ascii=False).replace('<', '\\u003c') + '</script>'

def cover(a, cfg):
    m, f = a['meta'], a['folder']
    if not m.get('cover'): return ''
    base = f'{cfg["base"]}/assets/articles/{a["slug"]}/'
    w, h = image_size(f / m['cover']); p = Path(m['cover'])
    small = p.with_name(p.stem + '-800' + p.suffix)
    srcset = f' srcset="{base}{small.name} {image_size(f/small)[0]}w, {base}{p.name} {w}w" sizes="(min-width:1000px) 1000px, 100vw"' if (f / small).exists() else ''
    return (f'<figure class="article-cover"><img src="{base}{p.name}"{srcset} width="{w}" height="{h}" '
            f'alt="{e(m.get("coverAlt", ""), quote=True)}" fetchpriority="high" decoding="async"></figure>')

def article_page(a, cfg, c, langs_here):
    m, lang, slug = a['meta'], a['lang'], a['slug']; sec = m['section']
    base = cfg['base']; url = url_of(cfg, lang, slug, sec)
    html, heads = convert(a['body'], lambda k, i: figure_html(k, i, a, cfg))
    words = len(re.findall(r'\w+', re.sub(r'\[\[.*?\]\]', '', a['body'])))
    minutes = math.ceil(words / 180)
    nav, items = crumbs(c, cfg, lang, m['title'], sec)
    og = (f'{cfg["url"]}/assets/articles/{slug}/og.png' if (a['folder'] / 'og.png').exists() else None)
    img = og or f'{cfg["url"]}/assets/og-image.png'
    ld = json_ld({'@context': 'https://schema.org', '@graph': [
        {'@type': 'Article', 'headline': m['title'], 'description': m['description'], 'datePublished': m['updated'],
         'dateModified': m['updated'], 'author': {'@type': 'Organization', 'name': m['author']},
         'publisher': {'@type': 'Organization', 'name': 'Aurelia Labs LLC'}, 'inLanguage': tag(lang),
         'mainEntityOfPage': url, 'image': img},
        {'@type': 'BreadcrumbList', 'itemListElement': [
            {'@type': 'ListItem', 'position': i + 1, 'name': t, **({'item': u if u.startswith('http') else cfg['url'] + u[len(base):]} if u else {})}
            for i, (t, u) in enumerate(items)]}]})
    top = head(lang, c, cfg, page_of(slug, sec), title=m['seoTitle'], description=m['description'], noindex=cfg['noindex'],
               alts=alt_links(cfg, [(l, url_of(cfg, l, slug, sec)) for l in langs_here]), og='article', image=img)
    top = top.replace('</head>', f'<link rel="stylesheet" href="{base}/assets/article.css">{ld}</head>', 1)
    switch = {l: page_of(slug, sec) for l in langs_here}
    toc = ''.join(f'<li><a href="#{i}">{inline_text(t)}</a></li>' for i, t in heads)
    src = ''.join(source_item(s) for s in m['sources'])
    return (top + header(lang, c, cfg, switch) + f'<main id="main" class="article-page wrap">{nav}<article class="article">'
        f'<header class="article-head"><p class="eyebrow">{e(c[f"articleSection_{sec}"])}</p><h1>{e(m["title"])}</h1>'
        f'<p class="article-meta">{e(m["author"])} · {e(c["articleUpdated"])} <time datetime="{m["updated"]}">{e(format_date(m["updated"], lang))}</time> · {minutes} {e(c["articleMinutes"])}</p></header>'
        f'{cover(a, cfg)}<nav class="toc" aria-label="{e(c["articleContents"], quote=True)}"><p class="eyebrow">{e(c["articleContents"])}</p><ol>{toc}</ol></nav>'
        f'<div class="article-body">{html}</div>'
        + (f'<section class="article-sources"><h2 id="sources">{e(c["articleSources"])}</h2><ol>{src}</ol></section>' if src else '')
        + f'</article><aside class="article-cta"><p class="eyebrow">{e(c["eyebrow"])}</p>{cta(c, cfg, base + "/" + lang + "/", lang)}'
        f'<p class="article-more"><span>{e(c["articleRead"])}</span><a href="{base}/{lang}/{sec}/">{e(sk(c, "articleBack", sec))} →</a></p></aside></main>'
        + footer(lang, c, cfg, switch))

def source_item(s):  # "text: https://url" -> link; a line without a URL is plain text
    mt = re.fullmatch(r'(.+?):\s+(https?://\S+)', s)
    return f'<li><a href="{e(mt.group(2), quote=True)}" rel="noopener">{e(mt.group(1))}</a></li>' if mt else f'<li>{e(s)}</li>'

def inline_text(t): return e(t.replace('**', ''))

def hub_page(lang, arts, cfg, c, hub_langs, sec):
    base = cfg['base']; url = url_of(cfg, lang, None, sec); nav, _ = crumbs(c, cfg, lang, None, sec)
    name, intro = c[f'articleSection_{sec}'], sk(c, 'articleHubIntro', sec)
    top = head(lang, c, cfg, page_of(None, sec), title=f'{name} · Moonplan', description=intro, noindex=cfg['noindex'],
               alts=alt_links(cfg, [(l, url_of(cfg, l, None, sec)) for l in hub_langs]))
    top = top.replace('</head>', f'<link rel="stylesheet" href="{base}/assets/article.css"></head>', 1)
    switch = {l: page_of(None, sec) for l in hub_langs}
    cards = ''.join(f'<li><a href="{base}/{lang}/{sec}/{a["slug"]}.html"><h2>{e(a["meta"]["title"])}</h2><p>{e(a["meta"]["description"])}</p>'
                    f'<span class="go">{e(c["articleRead"])} →</span></a></li>' for a in arts)
    return (top + header(lang, c, cfg, switch) + f'<main id="main" class="article-page wrap">{nav}<header class="article-head"><p class="eyebrow">Moonplan</p>'
            f'<h1>{e(name)}</h1><p class="intro">{e(intro)}</p></header><ul class="article-list">{cards}</ul></main>' + footer(lang, c, cfg, switch))

def published(img, folder):
    """Photo originals (jpg/png with a -1600.webp next to them) stay in the repo; only derivatives are published."""
    return img.suffix.lower() in IMAGES and not (img.suffix.lower() in ('.jpg', '.jpeg', '.png') and (folder / f'{img.stem}-1600.webp').exists())

def build(root, out, cfg, contents):
    """Writes pages and images; returns absolute URLs for the sitemap. cfg['hubs'] ({section: [langs]}) must be set by hubs()."""
    arts = load(root); urls = []
    for slug in sorted({a['slug'] for a in arts}):
        d = root / 'articles' / slug
        for img in sorted(x for x in d.iterdir() if published(x, d)):
            (out / 'assets' / 'articles' / slug).mkdir(parents=True, exist_ok=True)
            shutil.copy2(img, out / 'assets' / 'articles' / slug / img.name)
    for sec, langs in cfg['hubs'].items():
        for lang in langs:
            mine = [a for a in arts if a['lang'] == lang and a['meta']['section'] == sec]
            (out / lang / sec).mkdir(parents=True, exist_ok=True)
            (out / lang / sec / 'index.html').write_text(hub_page(lang, mine, cfg, contents[lang], langs, sec), encoding='utf-8')
            urls.append(url_of(cfg, lang, None, sec))
            for a in mine:
                here = [x['lang'] for x in arts if x['slug'] == a['slug']]
                (out / lang / sec / f'{a["slug"]}.html').write_text(article_page(a, cfg, contents[lang], here), encoding='utf-8')
                urls.append(url_of(cfg, lang, a['slug'], sec))
    return urls

def hubs(root, languages):
    """{section: [languages with at least one article in it]}; sections without articles are omitted."""
    arts = load(root)
    return {s: l for s in SECTIONS if (l := [x for x in languages if any(a['lang'] == x and a['meta']['section'] == s for a in arts)])}
