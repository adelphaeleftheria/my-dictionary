# Validation report — 2026-10-24

## Executed successfully

- `npm test`: 12 tests in 4 suites. Real Kaikki fixtures, importer rerun/deduplication, separate senses, genuine translated example, source licenses, Unicode, inflections, both search directions, actual generated index queries, stable entry identity, IndexedDB/export roundtrip, and navigation at 390/1280 viewport settings.
- `python -m unittest discover -s tests -p 'test_*.py'`: 1 passing Tatoeba pair/provenance/deduplication test. Synthetic test records, not represented as real corpus data.
- `npm run build`: TypeScript and Vite production build with repository base `/my-dictionary/`.
- `node scripts/browser.mjs`: Chromium at 1280×900 and 390×900 against the production preview. Passed inflection search (`gegangen` → `gehen`), source-linked English example display, favorite persistence, note persistence across full fragment-route reload, theme toggle, no horizontal overflow, no browser page errors.
- Rebuilt the curated source repeatedly without record multiplication; final import accepted 393 records, rejected 0, reported 0 exact duplicates.
- `npm run validate`: generated `data/validation.json` with coverage counts and measured query candidate bytes. Measurements are local file/index checks, **not internet latency benchmarks**.

## Data coverage

295 selected words; 393 lexical entries; 1,281 distinct senses. 1,172 normalized source usage examples, of which 1,168 include an English pair. 145 entries have no usage examples; 6 have no IPA; 59 have no imported forms. All entries have English source glosses. The manifest's `missingTranslation` statistic means no English gloss/translation is available for the selected edition; English glosses are definitions, not separately asserted translation lists.

The first data manifest is about 112 KB; application JavaScript is about 247 KB (77 KB gzip). Generated data assets total about 16 MB before server compression. Candidate shard bytes measured for sample lookups are in `data/validation.json`; the initial data manifest and selected postings are fetched before candidate search shards, and full original source records load only with detail pages. Broad short queries can fetch many shards. There is no claim of full-dictionary performance from this small subset.

## Remaining scope and limits

- Curated subset, not a complete German dictionary. Reproducible acquisition supports extending the word selection or importing a locally supplied JSONL dump.
- Full-scale index building currently keeps normalized records and postings in memory; a disk-backed builder should precede full-dump deployment. No browser SQLite or measured full-corpus benchmark.
- Tatoeba pair corpus importer is usable separately; corpus UI/search integration is not implemented. Source-linked examples in the UI are real Wiktionary usage examples with supplied sense relationships.
- Audio playback and per-file license resolution are not implemented. Krumeto downloads are not published; WordNet enrichment is not imported.
- JSON vocabulary transfer is implemented. CSV transfer and optional spaced repetition are not implemented.
- Automated browser checks cover core flows, not a full screen-reader or accessibility audit.
- GitHub Pages configuration is included and base paths tested locally; no remote deployment, push, or publication was performed.
