"""Build-time inline SVG figures and tables for articles. Data files live next to the article."""
import csv, math, re
from datetime import date
from html import escape as e
from news import MONTHS

L = {  # small label dictionaries; fallback en
 'ru': dict(sun='Солнечный свет', earth='Земля', mean='среднее', utc='Время UTC', month='Месяц',
   ph=['Новолуние','Растущий серп','Первая четверть','Растущая Луна','Полнолуние','Убывающая Луна','Последняя четверть','Убывающий серп']),
 'en': dict(sun='Sunlight', earth='Earth', mean='mean', utc='Times in UTC', month='Month',
   ph=['New Moon','Waxing crescent','First quarter','Waxing gibbous','Full Moon','Waning gibbous','Last quarter','Waning crescent']),
}
RU_NOM = 'Январь Февраль Март Апрель Май Июнь Июль Август Сентябрь Октябрь Ноябрь Декабрь'.split()
LIT, DARK, GOLD = '#e8e0cf', '#1a1a24', 'rgba(201,168,106,.35)'
FONT = 'font-family="Manrope,system-ui,sans-serif" font-size="13"'

def lab(lang): return {**L['en'], **L.get(lang, {})}
def num(x, lang, nd=2):
    s = f'{x:.{nd}f}'
    return s.replace('.', ',') if lang in ('ru', 'de', 'es', 'fr', 'it', 'pt-br') else s
def month_name(lang, i):
    if lang == 'ru': return RU_NOM[i]
    if lang == 'ja': return f'{i+1}月'
    return MONTHS[lang].split()[i].capitalize()
def svg(w, h, title, inner):
    return (f'<svg class="fig-svg" viewBox="0 0 {w} {h}" role="img" xmlns="http://www.w3.org/2000/svg">'
            f'<title>{e(title)}</title>{inner}</svg>')
def f1(x): return f'{x:.1f}'

def phase_disc(k, x, y, r):
    """Disc as seen from the Earth (northern hemisphere): k = 0..7, lit side right when waxing."""
    s = f'<circle cx="{f1(x)}" cy="{f1(y)}" r="{r}" fill="{DARK}" stroke="{GOLD}"/>'
    if k == 4: return s + f'<circle cx="{f1(x)}" cy="{f1(y)}" r="{r}" fill="{LIT}"/>'
    if k == 0: return s
    kk = k if k < 4 else 8 - k
    waxing = 1 if k < 4 else 0  # waning = mirror image: sweep flags flipped
    rx = r * abs(math.cos(math.radians(45 * kk)))
    term = (0 if kk < 2 else 1) ^ (0 if waxing else 1)
    d = (f'M{f1(x)} {f1(y-r)}A{r} {r} 0 0 {waxing} {f1(x)} {f1(y+r)}'
         f'A{rx:.2f} {r} 0 0 {term} {f1(x)} {f1(y-r)}Z')
    return s + f'<path d="{d}" fill="{LIT}"/>'

def orbit(lang, caption):
    t = lab(lang); cx, cy, R = 360, 285, 140
    o = [f'<circle cx="{cx}" cy="{cy}" r="{R}" fill="none" stroke="{GOLD}" stroke-width="1.5"/>']
    for y in range(205, 366, 40):  # parallel rays from the right edge, pointing left
        o.append(f'<path d="M740 {y}H655m10-5-10 5 10 5" fill="none" stroke="#e8d29e" stroke-opacity=".7" stroke-width="1.5"/>')
    o.append(f'<text x="700" y="178" text-anchor="middle" {FONT} fill="#e8d29e">{e(t["sun"])}</text>')
    o.append(f'<circle cx="{cx}" cy="{cy}" r="22" fill="#3d5a80" stroke="#7fa0c8"/><text x="{cx}" y="{cy+42}" text-anchor="middle" {FONT} fill="#b2abb9">{e(t["earth"])}</text>')
    for k in range(8):
        a = math.radians(45 * k); ux, uy = math.cos(a), -math.sin(a)
        mx, my = cx + R * ux, cy + R * uy
        o.append(f'<circle cx="{f1(mx)}" cy="{f1(my)}" r="13" fill="{DARK}" stroke="{GOLD}"/>'
                 f'<path d="M{f1(mx)} {f1(my-13)}A13 13 0 0 1 {f1(mx)} {f1(my+13)}Z" fill="{LIT}"/>')
        dx, dy = cx + (R + 62) * ux, cy + (R + 62) * uy
        o.append(phase_disc(k, dx, dy, 22))
        ly = dy - 32 if uy < -0.1 else dy + 42
        o.append(f'<text x="{f1(dx)}" y="{f1(ly)}" text-anchor="middle" {FONT} fill="#b2abb9">{e(t["ph"][k])}</text>')
    return svg(760, 560, caption, ''.join(o))

def chart(lang, caption, folder):
    t = lab(lang)
    rows = [(r['start_utc'], float(r['days'])) for r in csv.DictReader(open(folder / 'lunation-lengths.csv'))]
    X0, X1, Y0, Y1, V0, V1 = 62, 730, 24, 300, 29.2, 29.9
    d0, d1 = date(2000, 1, 1).toordinal(), date(2100, 1, 1).toordinal()
    px = lambda iso: X0 + (date.fromisoformat(iso).toordinal() - d0) / (d1 - d0) * (X1 - X0)
    py = lambda v: Y1 - (v - V0) / (V1 - V0) * (Y1 - Y0)
    o = []
    for v in (29.3, 29.5, 29.7, 29.9):
        o.append(f'<path d="M{X0} {f1(py(v))}H{X1}" stroke="rgba(201,168,106,.16)"/><text x="{X0-8}" y="{f1(py(v)+4)}" text-anchor="end" {FONT} fill="#9b95a5">{num(v, lang, 1)}</text>')
    for yr in range(2000, 2101, 10):
        x = px(f'{yr}-01-01')
        o.append(f'<path d="M{f1(x)} {Y1}v5" stroke="rgba(201,168,106,.5)"/><text x="{f1(x)}" y="{Y1+22}" text-anchor="middle" {FONT} fill="#9b95a5">{yr}</text>')
    o.append(f'<path d="M{X0} {Y1}H{X1}" stroke="rgba(201,168,106,.5)"/>')
    o.append('<polyline fill="none" stroke="#c9a86a" stroke-width="1" stroke-linejoin="round" points="' + ' '.join(f'{px(a):.1f},{py(v):.1f}' for a, v in rows) + '"/>')
    mean = sum(v for _, v in rows) / len(rows)
    o.append(f'<path d="M{X0} {f1(py(mean))}H{X1}" stroke="#e8d29e" stroke-width="1" stroke-dasharray="6 5"/>'
             f'<text x="{X1}" y="{f1(py(mean)-6)}" text-anchor="end" {FONT} fill="#e8d29e" stroke="#070711" stroke-width="4" paint-order="stroke">{e(t["mean"])} {num(mean, lang)}</text>')
    for (a, v), up in ((min(rows, key=lambda r: r[1]), False), (max(rows, key=lambda r: r[1]), True)):
        y, x = py(v), px(a)
        txt = f'{a[8:10]}.{a[5:7]}.{a[:4]} · {num(v, lang)}'
        o.append(f'<circle cx="{f1(x)}" cy="{f1(y)}" r="4" fill="#e8d29e" stroke="#070711"/>'
                 f'<text x="{f1(x)}" y="{f1(y-10 if up else y+20)}" text-anchor="middle" {FONT} fill="#f0e8d8" stroke="#070711" stroke-width="4" paint-order="stroke">{txt}</text>')
    return svg(760, 330, caption, ''.join(o))

def phases_table(lang, folder):
    t = lab(lang); data = {}
    for ln in open(folder / 'phases-2027-utc.txt', encoding='utf-8'):
        m = re.fullmatch(r'(new|first|full|last) (\d{4})-(\d\d)-(\d\d) (\d\d:\d\d)\s*', ln)
        if m: data.setdefault((int(m.group(3)), m.group(1)), []).append(f'{int(m.group(4))}, {m.group(5)}')
    if not data: raise ValueError('no phase lines parsed')
    heads = [t['month']] + [t['ph'][i] for i in (0, 2, 4, 6)]
    rows = ''.join(f'<tr><th scope="row">{e(month_name(lang, mo-1))}</th>' +
        ''.join(f'<td>{"<br>".join(data.get((mo, k), ["–"]))}</td>' for k in ('new', 'first', 'full', 'last')) + '</tr>' for mo in range(1, 13))
    return (f'<div class="table-wrap" tabindex="0"><table><caption>{e(t["utc"])}</caption><thead><tr>' +
            ''.join(f'<th scope="col">{e(h)}</th>' for h in heads) + f'</tr></thead><tbody>{rows}</tbody></table></div>')

def render(kind, ident, lang, folder, figs):
    """[[figure:ID]] / [[table:ID]] -> HTML. figs: front-matter figures list."""
    if kind == 'table':
        if ident == 'phases-2027': return phases_table(lang, folder)
        raise ValueError(f'unknown table: {ident}')
    f = next((x for x in figs if x['id'] == ident), None)
    if not f: raise ValueError(f'figure {ident} is not declared in front matter')
    fn = {'phases-orbit': lambda: orbit(lang, f['caption']), 'lunation-length': lambda: chart(lang, f['caption'], folder)}.get(ident)
    if not fn: raise ValueError(f'unknown figure: {ident}')
    return f'<figure class="fig fig-{ident}" tabindex="0">{fn()}<figcaption>{e(f["caption"])}</figcaption></figure>'
