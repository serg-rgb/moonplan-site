#!/usr/bin/env python3
"""Reads the app's planner_rules.json and writes assets/today/rules.json (approved activities without needsSourceCheck).

Sign names become indexes (0..11), garden elements become indexes (0 fruit, 1 root, 2 flower, 3 leaf), phase tags stay words.
The "notes" and "synonyms" fields are not exported. The app's language code "pt" becomes the site's "pt-br".

Usage: python3 tools/today/export_rules.py [path/to/planner_rules.json]
"""
import json, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DEFAULT = Path('/Users/admin/Desktop/Moonplan/moonplan-ios/Moonplan/Resources/planner_rules.json')
SIGNS = ["aries", "taurus", "gemini", "cancer", "leo", "virgo", "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"]
ELEMENTS = ["fruit", "root", "flower", "leaf"]
LANGS = ('en', 'de', 'es', 'fr', 'it', 'pt', 'ru', 'ja')

def texts(d):
    missing = [l for l in LANGS if not d.get(l)]
    if missing: raise SystemExit(f'missing languages {missing} in {d}')
    return {('pt-br' if l == 'pt' else l): d[l] for l in LANGS}

def conditions(c):
    out = {
        'phase': c['phase'], 'phaseAvoid': c['phaseAvoid'],
        'signsGood': sorted(SIGNS.index(s) for s in c['signsGood']), 'signsAvoid': sorted(SIGNS.index(s) for s in c['signsAvoid']),
        'gardenGood': sorted(ELEMENTS.index(s) for s in c['gardenElement']), 'gardenAvoid': sorted(ELEMENTS.index(s) for s in c['gardenAvoid']),
        'avoidVoid': c['avoidVoid'], 'avoidNewFull': c['avoidNewFull'], 'earlyWaxing': c['earlyWaxing'],
    }
    return {k: v for k, v in out.items() if v not in ([], False)}

def main():
    src = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT
    rules = json.loads(src.read_text(encoding='utf-8'))
    acts = [a for a in rules['activities'] if a['approved'] and not a['needsSourceCheck']]
    used = {a['group'] for a in acts}
    out = {
        'groups': [{'id': g['id'], 'names': texts(g['names'])} for g in rules['groups'] if g['id'] in used],
        'activities': [{'id': a['id'], 'group': a['group'], 'names': texts(a['names']), 'why': texts(a['whyPhrase']),
                        'cond': conditions(a['conditions'])} for a in acts],
    }
    dest = ROOT / 'assets' / 'today' / 'rules.json'
    dest.write_text(json.dumps(out, ensure_ascii=False, separators=(',', ':')) + '\n', encoding='utf-8')
    print(f'{len(acts)} activities, {len(out["groups"])} groups -> {dest} ({dest.stat().st_size} bytes)')

main()
