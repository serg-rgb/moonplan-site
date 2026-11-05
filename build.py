#!/usr/bin/env python3
"""Build plain HTML. No dependencies, accounts, API keys or paid services."""
import argparse
import json
from pathlib import Path
import shutil
import sys
from urllib.parse import urlsplit
from xml.sax.saxutils import escape

ROOT=Path(__file__).resolve().parent
sys.path.insert(0,str(ROOT/'scripts'))
from render import landing, legal_page, support, root_page

parser=argparse.ArgumentParser()
parser.add_argument('--url', help='Public origin and optional project path, without trailing slash')
parser.add_argument('--preview',action='store_true',help='Add noindex and exclude preview from sitemap')
parser.add_argument('--output',default='dist')
args=parser.parse_args()
cfg=json.loads((ROOT/'site.json').read_text())
cfg['url']=(args.url or cfg['url']).rstrip('/')
parsed=urlsplit(cfg['url'])
if parsed.scheme not in ('https','http') or parsed.query or parsed.fragment:
    parser.error('--url must be an HTTP(S) URL without query or fragment')
cfg['base']=parsed.path.rstrip('/')
cfg['noindex']=args.preview
out=ROOT/args.output
if out.resolve()==ROOT or ROOT not in out.resolve().parents:
    parser.error('output must be a subdirectory of the landing project')
# Remove only an earlier build directory created by this tool.
if out.exists():
    if not (out/'.moonplan-build').exists(): parser.error('Refusing to replace an unmarked directory')
    shutil.rmtree(out)
out.mkdir(parents=True)
(out/'.moonplan-build').write_text('Generated output\n')
shutil.copytree(ROOT/'assets',out/'assets',ignore=shutil.ignore_patterns('*.png.orig'))
(out/'.nojekyll').touch()
urls=[cfg['url']+'/']
for lang in cfg['languages']:
    c=json.loads((ROOT/'content'/f'{lang}.json').read_text())
    legal=json.loads((ROOT/'legal'/f'{lang}.json').read_text())
    target=out/lang; target.mkdir()
    (target/'index.html').write_text(landing(lang,c,cfg))
    (target/'support.html').write_text(support(lang,c,cfg))
    for kind in ('privacy','terms','publisher'):
        (target/f'{kind}.html').write_text(legal_page(lang,c,legal,cfg,kind))
    urls.extend(cfg['url']+f'/{lang}/'+p for p in ('','privacy.html','terms.html','support.html','publisher.html'))
c=json.loads((ROOT/'content/en.json').read_text())
(out/'index.html').write_text(root_page(c,cfg))
(out/'404.html').write_text(root_page(c,cfg,error=True))
(out/'robots.txt').write_text('User-agent: *\nAllow: /\n'+('' if args.preview else f'Sitemap: {cfg["url"]}/sitemap.xml\n'))
(out/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+''.join(f'<url><loc>{escape(u)}</loc></url>' for u in ([] if args.preview else urls))+'</urlset>\n')
if not cfg['base'] and not args.preview:
    (out/'CNAME').write_text(parsed.hostname+'\n')
print(f'Built {len(list(out.rglob("*.html")))} pages → {out}')
print(f'URL: {cfg["url"]}; indexing: {not args.preview}')
