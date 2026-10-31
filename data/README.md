# Data sources and attribution

This demo contains **hand-curated introductory species summaries**, not a complete master fish checklist. Always cross-check sensitive nomenclature with Eschmeyer's Catalog of Fishes. A species can appear under several common names; duplicate aliases are de-duplicated by scientific name in the demo. Sources can disagree.

## Global geographic geometry

`land.json` was derived from the coarse-resolution GSHHS / GSHHG coastline geometry distributed with Matplotlib Basemap. GSHHG was developed by Paul Wessel and Walter H. F. Smith, used here as a simplified cartographic background. See https://www.soest.hawaii.edu/pwessel/gshhg/ and https://matplotlib.org/basemap/ . The outline is **not species range data**.

## Live data

- GBIF Checklist Bank API: https://techdocs.gbif.org/en/openapi/v1/species
- GBIF occurrence records: https://www.gbif.org/ ; per-dataset rights may be CC0, CC BY or CC BY-NC. Do not redistribute bulk results without license checks.
- Wikimedia Commons image metadata: https://commons.wikimedia.org/ ; **each image has its own license and creator attribution**. The app checks license metadata before displaying a linked image, and shows source/creator/license.
- Eschmeyer's Catalog of Fishes https://www.calacademy.org/scientists/projects/catalog-of-fishes/ (reference only; not mirrored)
- OBIS https://obis.org/ (planned ingestion, not wired into this demo)
- FishBase https://www.fishbase.org/ (reference link; not redistributed)
- IUCN https://www.iucnredlist.org/ (link-out only; not redistributed)

GBIF's taxonomic backbone is **not identical** to Catalog of Fishes. Treat it as a search and enrichment service, not the canonical final fish taxonomy.
