# DDRS Software Architecture Document (SAD) — Generator

This folder generates the **DDRS Software Architecture Document** (`.docx`) used for
knowledge transfer. The document is derived directly from the codebase so it stays
accurate.

## Output
- `DDRS_Software_Architecture_Document.docx` (also published to `docs/SAD/`)
- ~355 estimated pages · 20+ professional diagrams · full data dictionary,
  API reference, module deep-dives, use cases, integration specs and appendices.

## Regenerate

```bash
pip3 install python-docx matplotlib
python3 sad/extract.py     # scans backend/src -> facts.json (entities, columns, routes)
python3 sad/diagrams.py    # renders branded diagrams -> sad/images/*.png
python3 sad/build_sad.py   # assembles the .docx
```

## Contents
- `extract.py` — parses TypeORM entities and NestJS controllers into `facts.json`.
- `diagrams.py` — renders context, layered, component, deployment, ER, DFD,
  workflow, RBAC, integration, sequence and other diagrams (matplotlib, CDSCO-branded).
- `build_sad.py` — builds the Word document (front matter, 4+1 views, data &
  API architecture, 22 module deep-dives, workflows, security, integrations,
  NFRs, deployment, testing, runbooks, glossary and appendices).

> Open the `.docx` in Microsoft Word and choose **Update Field** on the Table of
> Contents to populate page numbers.
