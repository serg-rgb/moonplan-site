"""Small, dependency-free HTML renderer. Content is stored per language."""
from html import escape as e

LANGS = ('en', 'de', 'es', 'fr', 'it', 'pt-br', 'ru', 'ja')
NAMES = {'en': 'English', 'de': 'Deutsch', 'es': 'Español', 'fr': 'Français', 'it': 'Italiano',
         'pt-br': 'Português', 'ru': 'Русский', 'ja': '日本語'}
CODES = {'pt-br': 'PT', 'ja': '日本語'}  # short label in the header switcher
def tag(l): return 'pt-BR' if l == 'pt-br' else l  # BCP 47 tag for lang/hreflang

def lines(value):
    return '<br>'.join(e(x) for x in (value if isinstance(value, list) else value.split('\n')))

def moon_mark():
    return '<svg class="moon-mark" viewBox="0 0 40 40" aria-hidden="true"><path d="M29 30A15 15 0 0 1 14 5a16 16 0 1 0 15 25Z" fill="currentColor"/><path d="M29 6v10m-5-5h10" stroke="currentColor" stroke-width="1.4"/></svg>'

def lang_links(lang, page, base):
    return ''.join(f'<a href="{base}/{l}/{page}" lang="{tag(l)}" hreflang="{tag(l)}"' +
        (' aria-current="page"' if lang == l else '') + f'>{NAMES[l]}</a>' for l in LANGS)

def langs(lang, page, base, label):
    # Header: compact disclosure (works without JavaScript). Footer: full list.
    return (f'<details class="lang-menu"><summary aria-label="{e(label,quote=True)}: {NAMES[lang]}">'
            f'<span>{CODES.get(lang, lang.upper())}</span><i aria-hidden="true"></i></summary>'
            f'<nav class="lang-list" aria-label="{e(label,quote=True)}">{lang_links(lang,page,base)}</nav></details>')

def footer_langs(lang, page, base, label):
    return f'<nav class="footer-languages" aria-label="{e(label,quote=True)}">{lang_links(lang,page,base)}</nav>'

def head(lang, c, cfg, page='', title=None, description=None, noindex=False, root=False):
    base = cfg['base']
    url = cfg['url'] + ('/' if root else f'/{lang}/{page}')
    alternates = ''.join(f'<link rel="alternate" hreflang="{tag(l)}" href="{cfg["url"]}/{l}/{page}">' for l in LANGS)
    title, description = title or c['title'], description or c['description']
    # No inline script is needed. The CSP is also enforced on GitHub Pages via this meta tag.
    csp = "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'self'; form-action 'none'"
    return f'''<!doctype html>
<html lang="{tag(lang)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">{'<meta name="apple-itunes-app" content="app-id=6830957447">' if cfg.get('appStoreUrl') else ''}
<meta http-equiv="Content-Security-Policy" content="{e(csp, quote=True)}"><meta name="referrer" content="strict-origin-when-cross-origin">
<title>{e(title)}</title><meta name="description" content="{e(description, quote=True)}">
<meta name="robots" content="{'noindex, follow' if noindex else 'index, follow'}"><link rel="canonical" href="{url}">
{alternates}<link rel="alternate" hreflang="x-default" href="{cfg['url'] + ('/' if not page else '/en/' + page)}">
<meta property="og:type" content="website"><meta property="og:site_name" content="Moonplan"><meta property="og:locale" content="{c['locale']}">
<meta property="og:title" content="{e(title, quote=True)}"><meta property="og:description" content="{e(description, quote=True)}"><meta property="og:url" content="{url}">
<meta property="og:image" content="{cfg['url']}/assets/og-image.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="Moonplan">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="{e(title, quote=True)}"><meta name="twitter:description" content="{e(description, quote=True)}"><meta name="twitter:image" content="{cfg['url']}/assets/og-image.png">
<meta name="theme-color" content="#070711"><link rel="icon" href="{base}/assets/favicon.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="{base}/assets/apple-touch-icon.png">
<link rel="preload" href="{base}/assets/fonts/manrope_regular.ttf" as="font" type="font/ttf" crossorigin><link rel="stylesheet" href="{base}/assets/site.css"><link rel="stylesheet" href="{base}/assets/responsive.css">
<script defer src="{base}/assets/site.js"></script></head>'''

def header(lang, c, cfg, page=''):
    base = cfg['base']
    targets = ('discover', 'how', 'questions')
    nav = ''.join(f'<a href="{base}/{lang}/#{t}">{e(label)}</a>' for t,label in zip(targets,c['nav']))
    return f'''<body><a class="skip" href="#main">{e(c['skip'])}</a>
<header class="site-header"><a class="brand" href="{base}/{lang}/" aria-label="Moonplan · {e(c['home'])}">{moon_mark()}<span>Moonplan</span></a>
<nav class="desktop-nav" aria-label="{e(c['menu'])}">{nav}</nav>{langs(lang,page,base,c['language'])}
<details class="mobile-menu"><summary aria-label="{e(c['menu'])}"><span></span><span></span></summary><nav aria-label="{e(c['menu'])}">{nav}<a href="{base}/{lang}/support.html">{e(c['support'])}</a></nav></details></header>'''

def footer(lang,c,cfg,page=''):
    base=cfg['base']
    return f'''<footer class="site-footer wrap"><div class="footer-top"><div><a class="brand" href="{base}/{lang}/">{moon_mark()}<span>Moonplan</span></a><p>{e(c['footerLine'])}</p></div>
<nav aria-label="{e(c['legalNotice'])}"><a href="{base}/{lang}/privacy.html">{e(c['privacy'])}</a><a href="{base}/{lang}/terms.html">{e(c['terms'])}</a><a href="{base}/{lang}/support.html">{e(c['support'])}</a><a href="{base}/{lang}/publisher.html">{e(c['legalNotice'])}</a></nav></div>
<div class="footer-bottom"><span>© 2026 Aurelia Labs LLC</span>{footer_langs(lang,page,base,c['language'])}<a href="{base}/{lang}/publisher.html#credits">{e(c['credits'])}</a></div></footer></body></html>'''

def phone(lang, kind, alt, cfg, hero=False):
    return f'<div class="phone{ " phone-hero" if hero else ""}"><img src="{cfg["base"]}/assets/screens/{kind}-{lang}.webp" width="1290" height="2796" alt="{e(alt,quote=True)}" loading="{"eager" if hero else "lazy"}" decoding="async" {"fetchpriority=high" if hero else ""}></div>'

def badge(lang):
    """Localized badge if present, else the English one; width from the SVG viewBox at 56 px height."""
    import re
    from pathlib import Path
    d = Path(__file__).resolve().parent.parent / 'assets' / 'badges'
    f = d / f'app-store-{lang}.svg'
    if not f.exists(): f = d / 'app-store-en.svg'
    vb = re.search(r'viewBox="([\d.\s-]+)"', f.read_text()).group(1).split()
    return f.name, round(56 * float(vb[2]) / float(vb[3]))

def cta(c,cfg,href,lang='en'):
    if cfg["appStoreUrl"]:  # official, unmodified Apple badge (Apple Marketing Tools), localized per page language
        name, width = badge(lang)
        return f'<a class="store-badge" href="{e(cfg["appStoreUrl"],quote=True)}" rel="noopener"><img src="{cfg["base"]}/assets/badges/{name}" alt="{e(c["download"],quote=True)}" height="56" width="{width}" decoding="async"></a>'
    return f'<a class="button" href="{e(href,quote=True)}">{e(c["cta"])}<span aria-hidden="true">↗</span></a>'

def landing(lang,c,cfg):
    result=head(lang,c,cfg,noindex=cfg['noindex'])+header(lang,c,cfg)
    result+=f'''<main id="main"><section class="hero wrap"><div class="hero-copy"><p class="eyebrow"><span class="tiny-moon" aria-hidden="true"></span>{e(c['eyebrow'])}</p>
<h1>{lines(c['hero'])}</h1><p class="intro">{e(c['intro'])}</p><p class="hero-body">{e(c['heroBody'])}</p><div class="hero-actions">{cta(c,cfg,'#discover',lang)}<p class="release">{e(c['status']) if not cfg['appStoreUrl'] else e(c['compatibility'])}</p></div>
<ul class="proof">{''.join('<li>'+e(p)+'</li>' for p in c['proof'])}</ul></div>
<figure class="hero-visual"><div class="orbit orbit-one" aria-hidden="true"></div><div class="orbit orbit-two" aria-hidden="true"></div>{phone(lang,'today',c['heroAlt'],cfg,True)}<figcaption>{e(c['heroCaption'])}</figcaption></figure></section>
<div class="phase-rail wrap" aria-hidden="true">{''.join(f'<span><i class="phase phase-{i}"></i>{e(s)}</span>' for i,s in enumerate(c['rail']))}</div>
<section id="discover" class="section wrap"><div class="section-heading reveal"><p class="eyebrow">{e(c['featureEyebrow'])}</p><h2>{lines(c['featureTitle'])}</h2><p>{e(c['featureIntro'])}</p></div>'''
    for f in c['features']:
        result+=f'''<article class="feature reveal"><div class="feature-copy"><p class="eyebrow"><span class="index">{f['number']}</span>{e(f['tag'])}</p><h3>{e(f['title'])}</h3><p>{e(f['body'])}</p><p class="feature-detail">{e(f['detail'])}</p>{'<p class="note">'+e(f['note'])+'</p>' if f.get('note') else ''}</div><figure class="feature-visual">{phone(lang,f['image'],f['alt'],cfg)}</figure></article>'''
    result+=f'''<p class="preview-note">{e(c['preview'])}</p><div class="extra-grid">{''.join(f'<article class="extra reveal"><span class="extra-symbol" aria-hidden="true">{s}</span><h3>{e(x["title"])}</h3><p>{e(x["body"])}</p></article>' for s,x in zip(('◔','☾','文'),c['extras']))}</div></section>
<section id="how" class="section wrap"><div class="section-heading reveal"><p class="eyebrow">{e(c['howEyebrow'])}</p><h2>{lines(c['howTitle'])}</h2></div><ol class="steps">{''.join(f'<li class="reveal"><span class="step-number" aria-hidden="true">0{i+1}</span><h3>{e(x["title"])}</h3><p>{e(x["body"])}</p></li>' for i,x in enumerate(c['steps']))}</ol></section>
<section class="tagline wrap" aria-label="{e(' '.join(c['tagline']),quote=True)}"><div class="tagline-orbit" aria-hidden="true"></div><p aria-hidden="true">{''.join('<span class="tagline-line">'+''.join('<span class="word">'+e(w)+'</span>'+('' if lang=='ja' else ' ') for w in (list(line) if lang=='ja' else line.split(' ')))+'</span>' for line in c['tagline'])}</p></section>
<section class="section principles wrap"><div class="section-heading reveal"><p class="eyebrow">{e(c['principleEyebrow'])}</p><h2>{lines(c['principleTitle'])}</h2></div><div class="principle-list">{''.join(f'<article class="reveal"><span class="index" aria-hidden="true">0{i+1}</span><div><h3>{e(x["title"])}</h3><p>{e(x["body"])}</p></div></article>' for i,x in enumerate(c['principles']))}</div></section>
<section id="questions" class="section wrap faq"><div class="section-heading reveal"><p class="eyebrow">{e(c['faqEyebrow'])}</p><h2>{e(c['faqTitle'])}</h2></div><div class="faq-items">{''.join(f'<details><summary>{e(q)}<span aria-hidden="true">+</span></summary><p>{e(a)}</p></details>' for q,a in c['faq'])}</div></section>
<section class="final-cta section wrap reveal"><span class="final-moon" aria-hidden="true">☾</span><p class="eyebrow">{e(c['finalEyebrow'])}</p><h2>{lines(c['finalTitle'])}</h2><p>{e(c['finalBody'])}</p>{cta(c,cfg,'#discover',lang)}<p class="release">{e(c['status']) if not cfg['appStoreUrl'] else e(c['compatibility'])}</p></section></main>'''
    return result+footer(lang,c,cfg)

def legal_page(lang,c,legal,cfg,kind):
    page=kind+'.html'; label=c['legalNotice' if kind=='publisher' else kind]; data=legal[kind]
    result=head(lang,c,cfg,page,title=f'{label} · Moonplan',description=data['intro'],noindex=cfg['noindex'])+header(lang,c,cfg,page)
    result+=f'<main id="main" class="legal wrap"><a class="back-link" href="{cfg["base"]}/{lang}/">← {e(c["back"])}</a><p class="eyebrow">{e(c["legalEyebrow"])}</p><h1>{e(label)}</h1><p class="updated">{e(c["updated"])}</p><p class="legal-intro">{e(data["intro"])}</p><div class="legal-layout"><aside><nav aria-label="{e(c["contents"])}"><p class="eyebrow">{e(c["contents"])}</p>'
    for section in data['sections']:
        result+=f'<a href="#{section["id"]}">{e(section["title"])}</a>'
    result+='</nav></aside><article class="legal-body">'
    for section in data['sections']:
        result+=f'<section id="{section["id"]}"><h2>{e(section["title"])}</h2>'+''.join('<p>'+p+'</p>' for p in section['paragraphs'])+'</section>'
    return result+'</article></div></main>'+footer(lang,c,cfg,page)

def support(lang,c,cfg):
    page='support.html'
    result=head(lang,c,cfg,page,title=f'{c["support"]} · Moonplan',description=c['supportIntro'],noindex=cfg['noindex'])+header(lang,c,cfg,page)
    result+=f'''<main id="main" class="support wrap"><p class="eyebrow">{e(c['support'])}</p><h1>{lines(c['supportTitle'])}</h1><p class="intro">{e(c['supportIntro'])}</p>
<div class="contact-card"><a class="email-address" href="mailto:{cfg['email']}">{cfg['email']}</a><div class="contact-actions"><a class="button" href="mailto:{cfg['email']}?subject=Moonplan">{e(c['emailAction'])}<span aria-hidden="true">↗</span></a><button class="text-button copy-email" data-email="{cfg['email']}" data-success="{e(c['copied'])}" data-error="{e(c['copyFailed'])}">{e(c['copyEmail'])}</button></div><p class="copy-status" role="status"></p></div>
<section class="support-info"><h2>{e(c['supportChecklistTitle'])}</h2><ul>{''.join('<li>'+e(x)+'</li>' for x in c['supportChecklist'])}</ul><p>{e(c['supportPrivacy'])}</p><a href="privacy.html">{e(c['privacy'])} →</a></section></main>'''
    return result+footer(lang,c,cfg,page)

def root_page(c,cfg,error=False):
    title = c['notFoundTitle'] if error else 'Moonplan · Choose your language'
    result=head('en',c,cfg,title=title,noindex=cfg['noindex'] or error,root=True)
    result+=f'<body class="language-page"><main id="main"><a class="brand" href="{cfg["base"]}/">{moon_mark()}<span>Moonplan</span></a><p class="eyebrow">{"404" if error else " · ".join(NAMES[l] for l in LANGS)}</p><h1>{e(c["notFoundTitle"] if error else c["rootTitle"])}</h1><p>{e(c["notFoundBody"] if error else c["rootBody"])}</p><nav aria-label="Language" class="language-choices">'
    for l in LANGS:
        result+=f'<a href="{cfg["base"]}/{l}/" lang="{tag(l)}">{NAMES[l]}<span aria-hidden="true">↗</span></a>'
    return result+f'</nav><p class="root-footer">Aurelia Labs LLC · <a href="{cfg["base"]}/en/privacy.html">Privacy</a> · <a href="{cfg["base"]}/en/terms.html">Terms</a></p></main></body></html>'
