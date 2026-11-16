"""Tiny front-matter parser and Markdown->HTML converter for the article subset (see README, Articles)."""
import re
from html import escape as e

class ArticleError(ValueError): pass

def front_matter(text):
    """Returns (meta, body). Shapes: `key: value`, `key:` + list of strings or list of `- k: v` mappings."""
    m = re.match(r'---\n(.*?)\n---\n(.*)\Z', text, re.S)
    if not m: raise ArticleError('front matter (--- ... ---) not found')
    meta, key, item = {}, None, None
    for raw in m.group(1).split('\n'):
        if not raw.strip(): continue
        if not raw.startswith(' '):
            k, _, v = raw.partition(':')
            key = k.strip(); v = v.strip()
            meta[key] = v if v else []
            item = None
        elif raw.strip().startswith('- '):
            v = raw.strip()[2:].strip()
            kv = re.match(r'(\w+):\s*(.*)$', v)
            if key == 'figures' and kv:
                item = {kv.group(1): kv.group(2)}; meta[key].append(item)
            else:
                meta[key].append(v); item = None
        elif item is not None:
            k, _, v = raw.strip().partition(':'); item[k.strip()] = v.strip()
        else:
            raise ArticleError(f'unexpected front matter line: {raw!r}')
    return meta, m.group(2)

def inline(s):
    s = e(s, quote=False)
    def link(m):
        url = m.group(2).replace('&amp;', '&')
        if not re.match(r'(https?://|/|#)', url): raise ArticleError(f'bad link: {url}')
        ext = url.startswith('http')
        return f'<a href="{e(url, quote=True)}"' + (' rel="noopener"' if ext else '') + f'>{m.group(1)}</a>'
    s = re.sub(r'\[([^\]]+)\]\(([^)\s]+)\)', link, s)
    return re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', s)

def cells(line):
    return [c.strip() for c in line.strip().strip('|').split('|')]

def convert(body, token, ids=None):
    """token(kind, id) -> HTML for [[figure:ID]] / [[table:ID]]. Returns (html, headings[(id, text)])."""
    out, heads = [], []
    for block in re.split(r'\n\s*\n', body.strip()):
        ls = [x.rstrip() for x in block.strip().split('\n')]
        if len(ls) == 1 and ls[0].startswith('[['):
            t = re.fullmatch(r'\[\[(figure|table):([\w-]+)\]\]', ls[0])
            if not t: raise ArticleError(f'unknown token: {ls[0]}')
            out.append(token(t.group(1), t.group(2)))
        elif '[[' in block: raise ArticleError(f'token must be alone on its line: {block[:40]!r}')
        elif ls[0].startswith('## ') and len(ls) == 1:
            heads.append((f's{len(heads)+1}', ls[0][3:].strip()))
            out.append(f'<h2 id="s{len(heads)}">{inline(ls[0][3:].strip())}</h2>')
        elif ls[0].startswith('#'): raise ArticleError(f'only ## headings are supported: {ls[0]}')
        elif all(x.startswith('- ') for x in ls):
            out.append('<ul>' + ''.join(f'<li>{inline(x[2:])}</li>' for x in ls) + '</ul>')
        elif ls[0].startswith('|'):
            if len(ls) < 3 or not re.fullmatch(r'[|\s:-]+', ls[1]): raise ArticleError('bad table')
            head = ''.join(f'<th scope="col">{inline(c)}</th>' for c in cells(ls[0]))
            rows = ''.join('<tr>' + ''.join(f'<td>{inline(c)}</td>' for c in cells(r)) + '</tr>' for r in ls[2:])
            out.append(f'<div class="table-wrap" tabindex="0"><table><thead><tr>{head}</tr></thead><tbody>{rows}</tbody></table></div>')
        else:
            out.append(f'<p>{inline(" ".join(x.strip() for x in ls))}</p>')
    return '\n'.join(out), heads
