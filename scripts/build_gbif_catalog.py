#!/usr/bin/env python3
"""Build a GBIF Taxonomic Backbone fish-*candidate* catalogue snapshot.

Run manually: python3 scripts/build_gbif_catalog.py --out data/catalog-gbif.json
GBIF is not identical to Eschmeyer's Catalog of Fishes. This script does not
represent an authoritative complete set; review names/lineages and licensing.

No external Python dependencies. Uses a bounded request rate, retries and
writes a reproducible data-source manifest alongside the output.
"""
import argparse, json, sys, time, urllib.parse, urllib.request, urllib.error
from datetime import datetime, timezone
from pathlib import Path

BASE='https://api.gbif.org/v1'
GROUPS=('Actinopterygii','Chondrichthyes','Sarcopterygii','Myxini','Petromyzonti','Petromyzontida')
FISH_CLASSES=set(GROUPS)|{'Holocephali','Cephalaspidomorphi'}
USER_AGENT='PelagicAtlasResearch/0.1 (https://github.com; data-use research prototype)'


def get_json(path, retry=5):
    url=BASE+path
    for attempt in range(retry):
        try:
            req=urllib.request.Request(url,headers={'Accept':'application/json','User-Agent':USER_AGENT})
            with urllib.request.urlopen(req,timeout=28) as r:return json.load(r)
        except (urllib.error.URLError, ValueError) as exc:
            if attempt==retry-1:raise RuntimeError(f'{url}: {exc}')
            time.sleep(min(20,1.6**attempt*2))


def normalize(r):
    if r.get('rank')!='SPECIES' or not r.get('key'):return None
    if r.get('taxonomicStatus') not in ('ACCEPTED','DOUBTFUL','PROVISIONALLY_ACCEPTED',None):return None
    if r.get('class') not in FISH_CLASSES:return None
    if r.get('extinct') is True:return None
    name=r.get('canonicalName') or r.get('species')
    if not name or not name[0].isalpha():return None
    return {'gbifKey':r['key'],'scientificName':name,'commonName':r.get('vernacularName') or name,
            'family':r.get('family') or '', 'order':r.get('order') or '', 'class':r.get('class') or '',
            'status':r.get('taxonomicStatus') or 'unresolved','source':'GBIF backbone',
            'sourceUrl':f'https://www.gbif.org/species/{r["key"]}'}


def main():
    p=argparse.ArgumentParser();p.add_argument('--out',default='data/catalog-gbif.json');p.add_argument('--max-pages',type=int,default=200);p.add_argument('--delay',type=float,default=.8);args=p.parse_args()
    records={};stats={};started=datetime.now(timezone.utc).isoformat()
    for group in GROUPS:
        match=get_json('/species/match?'+urllib.parse.urlencode({'name':group,'strict':'true'}))
        key=match.get('usageKey')
        if not key:
            print(f'SKIP {group}: no matching GBIF key',file=sys.stderr);continue
        count=0;offset=0;pages=0
        while pages<args.max_pages:
            params={'rank':'SPECIES','highertaxon_key':key,'limit':1000,'offset':offset}
            result=get_json('/species/search?'+urllib.parse.urlencode(params))
            rows=result.get('results') or []
            for r in rows:
                item=normalize(r)
                if item:
                    records[item['scientificName']]=item;count+=1
            pages+=1;offset+=len(rows)
            print(f'{group}: page {pages} / {result.get("count","?")} raw records, {len(records)} unique fish candidates',flush=True)
            if result.get('endOfRecords') or not rows:break
            time.sleep(args.delay)
        stats[group]={'queriedKey':key,'pages':pages,'matchingRows':count}
    dest=Path(args.out);dest.parent.mkdir(parents=True,exist_ok=True)
    data=sorted(records.values(),key=lambda x:x['scientificName'])
    dest.write_text(json.dumps(data,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
    manifest={'source':'GBIF Taxonomic Backbone','endpoint':'https://api.gbif.org/v1/species/search',
              'retrievedAt':started,'records':len(data),'groupStats':stats,'note':'Taxonomic candidates; not Eschmeyer-verified and not a complete species authority'}
    dest.with_name(dest.stem+'.manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
    print('Wrote',len(data),'candidate species to',dest)

if __name__=='__main__':main()
