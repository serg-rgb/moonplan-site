"""Science-news cards for the landing page. Data: news.json (edit weekly, see README)."""
import json
from html import escape as e
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parent.parent

MONTHS = {
    'en': 'January February March April May June July August September October November December',
    'de': 'Januar Februar März April Mai Juni Juli August September Oktober November Dezember',
    'es': 'enero febrero marzo abril mayo junio julio agosto septiembre octubre noviembre diciembre',
    'fr': 'janvier février mars avril mai juin juillet août septembre octobre novembre décembre',
    'it': 'gennaio febbraio marzo aprile maggio giugno luglio agosto settembre ottobre novembre dicembre',
    'pt-br': 'janeiro fevereiro março abril maio junho julho agosto setembro outubro novembro dezembro',
    'ru': 'января февраля марта апреля мая июня июля августа сентября октября ноября декабря',
}
FORMATS = {  # day, month name, year
    'en': '{d} {m} {y}', 'de': '{d}. {m} {y}', 'es': '{d} de {m} de {y}', 'fr': '{d} {m} {y}',
    'it': '{d} {m} {y}', 'pt-br': '{d} de {m} de {y}', 'ru': '{d} {m} {y}',
}
_cache = {}

def load():
    if 'data' not in _cache:
        _cache['data'] = json.loads((Path(__file__).resolve().parent.parent / 'news.json').read_text(encoding='utf-8'))
    return _cache['data']

def format_date(iso, lang):
    y, m, d = (int(x) for x in iso.split('-'))
    if lang == 'ja':
        return f'{y}年{m}月{d}日'
    return FORMATS[lang].format(d=d, m=MONTHS[lang].split()[m - 1], y=y)

def news_section(lang, c, cfg):
    base = cfg['base']
    go = e(c['newsRead']) + (' · ' + e(c['newsLang']) if lang != 'en' else '')
    cards = ''
    for it in load()['items']:
        if not it['url'].startswith('https://'):
            raise ValueError(f'news item {it["id"]}: url must be https')
        t = it['text'].get(lang) or it['text']['en']
        from articles import image_size  # lazy: articles -> figures -> news would be circular at import time
        w, h = image_size(ROOT / 'assets' / 'news' / f'{it["image"]}.webp')  # whole picture, natural proportions (no crop)
        credit = it['credit'] if isinstance(it['credit'], str) else (it['credit'].get(lang) or it['credit']['en'])
        cards += (f'<li><a href="{e(it["url"], quote=True)}" target="_blank" rel="noopener">'
                  f'<figure><img src="{base}/assets/news/{it["image"]}.webp" alt="{e(t["alt"], quote=True)}" width="{w}" height="{h}" loading="lazy" decoding="async">'
                  f'<figcaption>{e(credit)}</figcaption></figure>'
                  f'<span class="meta">{e(it["source"])} <time datetime="{it["date"]}">{e(format_date(it["date"], lang))}</time></span>'
                  f'<h3>{e(t["title"])}</h3><p>{e(t["summary"])}</p><span class="go">{go}</span></a></li>')
    return (f'<section class="news wrap" id="news" aria-labelledby="news-title"><p class="eyebrow">{e(c["newsEyebrow"])}</p>'
            f'<h2 id="news-title">{e(c["newsTitle"])}</h2><p class="note">{e(c["newsNote"])}</p><ul class="feed">{cards}</ul></section>')
