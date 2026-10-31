# Pelagic Atlas — a living fish encyclopedia

A responsive, zero-build, GitHub Pages-ready biodiversity web application with an interactive globe, fish profiles, 2D study illustrations, optional Commons photographs, illustrative 3D models, an embedded verified documentary and global taxonomic discovery through the **GBIF API**.

![Status](https://img.shields.io/badge/status-working%20prototype-0f7767)

## Run locally

Because JavaScript modules require a web server, don't double-click `index.html` from disk. Use:

```bash
cd fish-atlas
python3 -m http.server 8080
# Open http://localhost:8080
```

Or use any static HTTP server or GitHub Pages. No Node/npm/build step is required.

## Included now

- Responsive ocean-inspired interface with Discover, Species catalogue, interactive globe, saved fish, videos and research sources
- Curated, deduplicated fish profiles with biological summaries and links to taxonomic authorities
- Searching local species by scientific/common name + **live** GBIF name lookup and Load More button
- Taxonomic synonyms and alternative vernacular names fetched from GBIF when opening the Taxonomy tab
- Scientific observation points from the GBIF occurrence search API; data is labeled **sample** and not presented as entire species range
- Canvas-rendered interactive **globe** using a locally bundled simplified GSHHG coastline dataset; supports drag, zoom, keyboard, resize and reduced-motion preferences
- 2D SVG study illustrations (explicitly non-diagnostic) for every starter/GBIF result, with morphological archetypes
- Licensed photo discovery via Wikipedia→Wikimedia Commons **when available**, checking public/CC BY/CC BY-SA/CC0 license metadata and displaying source/creator/license
- A procedural, draggable **3D study form** rendered with Three.js via external CDN; wireframe & reset controls; not a verified 3D specimen model
- One verified, publisher-hosted embedded National Geographic great-white-shark video + targeted search links for others
- Local browser bookmarks, in-page filters, mobile layout, citations and transparent limitations

## Important scope and licensing

This is a **starter product**, not all ~37,799 currently recognized valid fish species and not a complete 3D specimen library. Do not publish it claiming complete fish coverage. GBIF's taxonomic backbone differs from Eschmeyer's Catalog of Fishes. In the mature production pipeline, name usage, synonyms, image licenses, ecological sources and record provenance must be versioned and curator-reviewed.

- Curated seed profiles: `data/species.js` (duplicates removed by scientific name at runtime)
- Coastlines: `data/land.json` (GSHHG via Basemap; see `data/README.md`)
- Large-scale collection: implement a license-checked, rate-limited bulk checklist pipeline; do not scrape Catalog of Fishes/FishBase, copy their prose, or bulk mirror WoRMS without permission.
- GBIF returns live network results. Its API can become unavailable, CORS-restricted in some settings, or rate-limited. Static content remains accessible.
- **Photo licensing:** individual photos can be under other rights; the website rejects anything without an approved recognized license string. Verify rights before building a permanent image mirror.
- **Videos:** never rehost copyrighted third-party video. Include other videos only after validating species identity and embed permission.
- **3D:** the generated fish meshes are morphology teaching aids. For anatomically accurate models, ingest reviewed GLB scans/models with explicit asset licenses and creator attribution.

## Publish on GitHub Pages

**Mac one-click publisher:** Double-click `PUBLISH_TO_GITHUB.command` after installing the GitHub CLI (`brew install gh`). Sign in when prompted. The publisher creates a new public `celineasher/pelagic-atlas` repository, pushes the project, and attempts GitHub Pages configuration. It will not overwrite an existing repository.

Manual alternative:

1. Create a new empty public repository, e.g. `pelagic-atlas`.
2. Upload all files from this folder (including `.nojekyll` and `.github/workflows/pages.yml`). Or initialize and push:

```bash
git init
git add .
git commit -m "Launch Pelagic Atlas MVP"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/pelagic-atlas.git
git push -u origin main
```

3. In repository **Settings → Pages**, choose **GitHub Actions** as Build and deployment source.
4. Push to `main` or manually run the `Deploy Pelagic Atlas` workflow.

GitHub Pages is a static deployment for the MVP. At global scale, large 3D media, thumbnails, geospatial tiles and datasets should move to a CDN/object store, with a PostGIS-backed curation pipeline.

## Next engineering milestones

1. Write canonical Darwin Core-compatible schema for accepted names, name usages, synonym provenance and versioned authority snapshots.
2. Establish written permission/usage agreements for bulk checklist and third-party data; run media-license auditing before any mirror.
3. Build PostgreSQL/PostGIS + ETL jobs to index full authorized taxonomy, coordinates and regional tiles; introduce source-specific QC reports.
4. Curate authenticated images/video/3D specimen records with license metadata, editor approval and correction process.
5. Add permanent SEO pages, multilingual common names, conservation/assessment metadata under permitted use, and real expert range polygons distinguishable from occurrences.

## Data & technology references

- [California Academy of Sciences — Catalog of Fishes](https://www.calacademy.org/scientists/projects/catalog-of-fishes/)
- [GBIF Species API](https://techdocs.gbif.org/en/openapi/v1/species)
- [GBIF occurrence/search API](https://techdocs.gbif.org/en/openapi/v1/occurrence)
- [Darwin Core taxonomic vocabulary](https://dwc.tdwg.org/terms/)
- [Wikimedia file licensing](https://commons.wikimedia.org/wiki/Commons:Licensing)
- [GSHHG coastline source](https://www.soest.hawaii.edu/pwessel/gshhg/)
- [Khronos glTF specification](https://www.khronos.org/gltf/)

This project uses open educational source code; it does not relicense remotely linked images, videos or scientific datasets. Always comply with their individual terms.

## Optional: build a wider static GBIF catalogue

Run `python3 scripts/build_gbif_catalog.py` on a machine with Internet access. It produces a JSON snapshot of GBIF fish *candidate* species and a manifest. This is **not** a Catalog-of-Fishes-verified global species checklist. Do not run it too frequently; use GBIF's download facilities for heavier use. The resulting optional snapshot can be incorporated into an indexed backend or further frontend loader after review.

For a Mac, double-click `START_HERE.command` (or use the Python server command above) to start the local preview.
