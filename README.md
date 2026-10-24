# Wortbuch · My German–English Dictionary

A React / TypeScript / Vite dictionary using real, attributed Wiktionary records via Kaikki. Calm responsive light/dark reading interface, German and English full-text search, umlaut transliteration fallback, inflection lookup, distinct senses, paired source examples, grammatical forms, IPA, source audit records, and local vocabulary with entry/sense notes, favorites, lists, statuses, recent views and JSON transfer.

## Run

Node 24, npm, Python 3 and curl. No account, secret, paid API, or server database.

```sh
npm ci
npm run dev
```

Vite defaults to the repository base `/my-dictionary/`. For a root deployment use `BASE_PATH=/ npm run build`. The committed generated subset makes lookups usable without downloading source data. Try `gehen`, `ging`, `gegangen`, `Haus`, `Häuser`, `Haeuser`, `Bank`, or `walk`. Notes persist in IndexedDB on this origin; export before moving to a different origin or clearing browser storage. Source updates do not write to the personal database. JSON import merges newer records after validating all records. There is no account synchronization.

## Reproduce data

Read [DATA_SOURCES.md](DATA_SOURCES.md) and [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) first.

```sh
npx tsx scripts/download.ts
npm run import -- data/raw/selected.jsonl data/source.json
npm test
python -m unittest discover -s tests -p 'test_*.py'
npm run build
```

The downloader uses four concurrent TLS-verified curl requests, selects the words in `data/words.txt`, and records individual URLs, bytes, SHA-256 and failures. Inspect `data/download-manifest.json`; upstream URLs are deprecated and can change. Raw sources are ignored by Git. To accept a locally supplied source file:

```sh
npm run import -- /absolute/path/German.jsonl data/source.json public/data en
```

The manifest must describe the **actual supplied source**, reviewed license, source URL and access date. Do not reuse the supplied manifest for another source or edition. For German-edition records, pass `de` after the output directory and supply a separately reviewed manifest; German glosses stay German, translations are associated only by explicit sense indexes. The supported format is one JSON object per line, not a top-level JSON array. Decompress `.gz`/`.bz2` first.

The importer streams lines, checks essential schema, retains original source records, preserves sense and example relationships, exact-deduplicates records, and writes a replacement dataset in a staging directory. Parse rejections fail publication and are logged with line numbers in `public/data.building/manifest.json`; the preceding dataset remains untouched. No unsupported fields are discarded from audit records. Stable lemma/POS/etymology IDs keep personal records independent of routine source metadata updates. In upstream key collisions a content suffix distinguishes records; changes to such ambiguous records may require manual note reassociation. Sense indices can also change upstream. Dataset removal does not delete saved notes; unavailable saved entries produce a visible error.

A rebuild is deterministic apart from timestamps and download snapshot changes. It replaces generated files and keeps a previous directory (ignored by Git); never run simultaneous imports to the same destination. Download cache/incremental import optimization is not yet implemented.

### Optional Tatoeba pair corpus

Follow the manual steps in DATA_SOURCES.md to obtain **detailed** German and English TSVs and the explicit links TSV, then:

```sh
python scripts/tatoeba.py data/raw/deu_sentences_detailed.csv data/raw/eng_sentences_detailed.csv data/raw/links.csv data/raw/pairs.jsonl
```

The disk-backed SQLite join bounds sentence memory, deduplicates reciprocal links and preserves both contributors and IDs under CC BY 2.0 FR. It outputs separate provenance-bearing pairs with `senseId: null` and a coverage report. No guessed sense linkage. Optional corpus integration in the UI is not yet implemented; displayed real examples currently come from Wiktionary.

## Architecture and scale

`src/model.ts`: normalized types and ranking. `src/search.ts`: replaceable static repository. `src/personal.ts`: separate IndexedDB store. `scripts/import.ts`: build pipeline. Search fetches a small manifest, the rarest query substring's posting list, and candidate document shards; full detail/raw records load only on selection. No full raw dump is downloaded at startup. Forms are indexed with grammar retained; English source definitions are searchable and not fabricated as translation lists. Trigram filtering supports substrings of all indexed source fields; very short/common queries can fetch more shards. Results are paginated by 25.

This subset is deliberately limited; it is not the complete German language. The normalized shard/index construction currently retains normalized records and postings in build-time memory, so a full 1 GB source needs a disk-backed indexer or more RAM. Measure before scaling. SQLite WASM is deferred because this subset does not justify its runtime/database download cost. Spelling suggestions are offered on empty matches using edit distance. Audio license resolution, CSV transfer and spaced repetition remain unimplemented. No machine enrichment is supplied.

## Validation

```sh
npm test
python -m unittest discover -s tests -p 'test_*.py'
npx tsx scripts/validate.ts
npm run build
npm run test:browser # requires Chromium; set CHROMIUM_PATH if not /usr/bin/chromium
```

The real fixture is a small attributable subset; Tatoeba structure tests are explicitly synthetic and never shipped as examples. Tests cover sense preservation, real example pairing, normalization, inflections, both search directions, stable IDs, duplicate imports, schema failures, license provenance, personal JSON roundtrips, and interface navigation at two viewport widths. The jsdom viewport checks test navigation semantics, not real browser layout. A generated validation report records counts, missing fields and index lookup measurements; see `VALIDATION_REPORT.md` for executed checks and remaining limits.

## Deploy

Push to `main`, select **GitHub Actions** as the Pages source in repository Settings → Pages, and run the provided workflow. It runs tests and builds with `BASE_PATH=/<repository-name>/`, then uploads and deploys the static site. Entry links use URL fragments so refreshes work on GitHub Pages without rewrite rules. Application source is not pushed or deployed automatically by this development session.
