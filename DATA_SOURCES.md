# Data sources and licensing

Accessed 2026-10-24. The first network attempt was denied; subsequent access succeeded after environment settings changed. This project redistributes selected **real English-edition Wiktionary German records**, not invented lexical examples. Selection is in `data/words.txt`; individual download URLs, SHA-256 digests, byte sizes and failures are in `data/download-manifest.json`. The build's source manifest and input digest are in `public/data/manifest.json`.

| Source inspected | License / requirements | Size and suitability |
| --- | --- | --- |
| https://kaikki.org/dictionary/ and https://kaikki.org/dictionary/German/index.html | Underlying English Wiktionary text: CC BY-SA 4.0 (selected license from dual licensing). Credit Wiktionary contributors; link original pages and license; identify adaptations; distribute adapted lexical data under the same license. Verified at https://en.wiktionary.org/wiki/Wiktionary:Copyrights . | Current German page: 353,033 distinct words, 1.0 GB postprocessed JSONL. English glosses, separate senses, grammar, forms, IPA, and some genuinely translated usage examples. Chosen primary source. |
| https://kaikki.org/dewiktionary/ and https://kaikki.org/dewiktionary/rawdata.html | German Wiktionary text requires its applicable attribution/share-alike terms; do not confuse extractor software's MIT license with text licensing. Verify the German edition's current licensing before redistributing its records. Not bundled. | German glosses and explicit sense-indexed translations; raw exports can be very large. Their exact current byte size was not measured. Supported parser edition `de`; use an edition-specific reviewed manifest. |
| https://tatoeba.org/en/downloads | Standard sentence downloads CC BY 2.0 FR; separate subset CC0 1.0. Credit each contributor and Tatoeba with sentence links; preserve licenses and identify changes. Audio licenses differ per recording and may forbid reuse. | Detailed TSV: ID, language, text, username, dates. Links TSV explicitly joins sentence IDs. Whole-corpus size not measured; use German and English detailed language exports plus links. Optional standalone pair importer implemented; no Tatoeba bulk data bundled. |
| https://krumeto.com/data and https://krumeto.com/sources | Compiled dataset CC BY-SA 4.0, but constituent Tatoeba, WordNet, CEFR-J, CMUdict etc retain their terms. Do not relabel every field CC BY-SA. | Data page says download will be available once published. No downloadable database/schema/byte size established. Not integrated; would add extra licensing and mainly English-oriented enrichment. |
| https://en-word.net/ | CC BY 4.0; attribution to Open English WordNet community; underlying Princeton notices must be retained where applicable. | Site lists 153,261 English entries / 120,068 synsets. Optional English semantics; no trustworthy automatic German-sense alignment. Not imported. |

## Chosen combination

Kaikki English-edition German records are the practical foundation. Their English glosses are shown as source definitions, **not relabeled as a separately verified translation list**. Wiktionary examples retain their supplied sense relationship and `english` text only when present. Quotations and examples without explicit `type: example` are excluded from normalized displays; the original source record remains available for audit. Source record URLs lead to the live Wiktionary entry and its history, not an invented immutable revision.

Tatoeba can enrich a separate sentence corpus. Translation links prove sentence-pair relationships, not dictionary-sense relationships: `scripts/tatoeba.py` deliberately outputs null sense IDs. No automatic semantic assignment occurs. Tatoeba corpus search/UI integration is future work; Wiktionary usage examples already supply real paired examples in the application.

Media is not automatically played or redistributed. Raw records may retain source audio references, but these are not a statement of a file's reuse license. Per-file author and license resolution is needed before adding audio playback.

## Attribution displayed with redistributed lexical data

“© Wiktionary contributors. Extracted by Wiktextract, distributed by Kaikki.org. Adapted by normalization and selection; shared under CC BY-SA 4.0.” Every entry links to its original Wiktionary page. License: https://creativecommons.org/licenses/by-sa/4.0/ . Changes: subset selection, field normalization, search indexing, exclusion of quoted examples. Source JSON preserved for audit. Do not remove attribution when redistributing generated entries or indexes.

Requested research citation: Tatu Ylonen (2022), *Wiktextract: Wiktionary as Machine-Readable Structured Data*, LREC, pp. 1317–1325. https://aclanthology.org/2022.lrec-1.140/ . Extraction for the selected pages: enwiktionary dump 2026-10-01, extracted 2026-10-21 (as reported by Kaikki).

## Manual acquisition

The curated downloader requests public per-word JSONL URLs linked by Kaikki's entry pages. These postprocessed downloads are marked deprecated upstream. If removed, download the current German-language JSONL from the German page or use the current raw-data instructions at https://kaikki.org/dictionary/rawdata.html ; verify schema and provenance before import. Do not silently substitute a different upstream snapshot. Locally supplied uncompressed JSONL is fully supported.

Tatoeba: on the downloads page select German and English under **Detailed Sentences**, download/extract each archive, then download/extract **Links**. Feed the resulting six-column detailed TSVs and two-column links TSV to the documented command. Preserve username columns; a simple sentence-pair export without attribution is insufficient. No audio download is required.
