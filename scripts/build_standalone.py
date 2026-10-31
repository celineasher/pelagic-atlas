#!/usr/bin/env python3
"""Produce a self-contained HTML preview: python3 scripts/build_standalone.py.

The preview packs source code and coastline geometry into a single file.
Remote biodiversity APIs, photos, video and the external Three.js module still
require network access. The GitHub Pages deployment uses normal source modules.
"""
import json, re
from pathlib import Path
root=Path(__file__).resolve().parents[1]
def source(path):return (root/path).read_text(encoding='utf-8')
seed=source('data/species.js').replace('export const','const')
art=source('src/fish-art.js').replace('export function','function')
globe=source('src/globe.js').replace('export async function','async function').replace('export function','function')
land=json.loads(source('data/land.json'))['polygons']
globe=globe.replace('let landCache;',f'let landCache={json.dumps(land,separators=(",",":"))};')
globe=globe.replace("new URL('../data/land.json',import.meta.url)","'data/land.json'")
model=source('src/model.js').replace('export async function','async function')
app=re.sub(r'^import .*?;\s*$','',source('src/app.js'),flags=re.M)
js='\n'.join([seed,art,globe,model,app])
assert '</script>' not in js.lower()
css=source('styles.css')
css=re.sub(r'^@import [^;]+;\s*','',css,count=1)
html=f'''<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#071d27"><title>Pelagic Atlas — Offline Browser Preview</title><style>{css}</style></head><body><div id="app"><p>Opening the ocean atlas…</p></div><script>{js}</script></body></html>'''
for out in [root/'preview.html',root.parent/'pelagic-atlas-preview.html']:
    out.write_text(html,encoding='utf-8');print('Wrote',out,'bytes',out.stat().st_size)
