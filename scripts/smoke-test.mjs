import assert from 'node:assert/strict';
import fs from 'node:fs';
import {uniqueSpecies} from '../data/species.js';
import {fishSVG} from '../src/fish-art.js';
assert.ok(uniqueSpecies.length >= 50, 'Expected at least 50 curated taxonomic species');
assert.equal(new Set(uniqueSpecies.map(x=>x.scientificName)).size,uniqueSpecies.length);
for (const s of uniqueSpecies){
  assert.ok(s.scientificName.includes(' '),`Missing binomial: ${s.scientificName}`);
  assert.ok(s.commonName && s.family && s.summary,`Incomplete profile: ${s.scientificName}`);
  const svg=fishSVG(s);
  assert.ok(svg.startsWith('<svg ') && svg.endsWith('</svg>'));
  assert.ok(!svg.includes('<script'));
}
for (const file of ['index.html','styles.css','src/app.js','src/globe.js','src/model.js','data/land.json'])assert.ok(fs.existsSync(new URL('../'+file,import.meta.url)),`Missing ${file}`);
const world=JSON.parse(fs.readFileSync(new URL('../data/land.json',import.meta.url),'utf8'));
assert.ok(world.polygons.length>50,'Expected coastline geometry');
console.log(`PASS: ${uniqueSpecies.length} unique species, ${world.polygons.length} coastline polygons, all generated SVG illustrations valid as strings`);
