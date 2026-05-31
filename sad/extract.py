#!/usr/bin/env python3
"""Scan the DDRS backend to extract entities, columns, controllers and routes.
Outputs sad/facts.json used by the SAD builder."""
import json, os, re, glob

ROOT = os.path.join(os.path.dirname(__file__), '..', 'backend', 'src')
ROOT = os.path.abspath(ROOT)

def read(p):
    with open(p, encoding='utf-8') as f:
        return f.read()

def rel_module(path):
    parts = os.path.relpath(path, ROOT).split(os.sep)
    if 'modules' in parts:
        i = parts.index('modules')
        if i + 1 < len(parts):
            return parts[i + 1]
    return parts[0] if parts else 'core'

# ---------------- Entities ----------------
entities = []
for path in glob.glob(os.path.join(ROOT, '**', '*.entity.ts'), recursive=True):
    src = read(path)
    # split into class blocks
    for m in re.finditer(r"@Entity\(\s*'([^']+)'\s*\)\s*export class (\w+)", src):
        table, cls = m.group(1), m.group(2)
        start = m.end()
        # body until next @Entity or EOF
        nxt = src.find('@Entity(', start)
        body = src[start: nxt if nxt != -1 else len(src)]
        cols = [
            {'name': 'id', 'type': 'uuid', 'note': 'PK'},
            {'name': 'createdAt', 'type': 'Date', 'note': 'audit'},
            {'name': 'updatedAt', 'type': 'Date', 'note': 'audit'},
        ]
        lines = body.splitlines()
        pending = []
        for ln in lines:
            s = ln.strip()
            if s.startswith('@'):
                pending.append(s)
                continue
            pm = re.match(r"(\w+)\??\s*:\s*([^;]+);", s)
            if pm and pending:
                name, typ = pm.group(1), pm.group(2).strip()
                deco = ' '.join(pending)
                nullable = 'nullable: true' in deco
                unique = 'unique: true' in deco
                indexed = '@Index' in deco
                default = None
                dm = re.search(r"default:\s*([^,}]+)", deco)
                if dm:
                    default = dm.group(1).strip().strip("'")
                cols.append({'name': name, 'type': typ, 'nullable': nullable,
                             'unique': unique, 'indexed': indexed, 'default': default})
                pending = []
            elif pm:
                pending = []
            else:
                if s and not s.startswith('//'):
                    pending = []
        # capture a doc comment just before the class (best effort)
        pre = src[:m.start()]
        doc = ''
        cm = list(re.finditer(r"/\*\*(.*?)\*/", pre, re.S))
        if cm:
            doc = re.sub(r"\s*\*\s?", ' ', cm[-1].group(1)).strip()
        entities.append({'table': table, 'class': cls, 'doc': doc,
                         'columns': cols, 'module': rel_module(path)})

# ---------------- Controllers / routes ----------------
routes = []
for path in glob.glob(os.path.join(ROOT, '**', '*.controller.ts'), recursive=True):
    src = read(path)
    base_m = re.search(r"@Controller\(\s*'?([^')]*)'?\s*\)", src)
    base = base_m.group(1) if base_m else ''
    tag_m = re.search(r"@ApiTags\('([^']+)'\)", src)
    tag = tag_m.group(1) if tag_m else rel_module(path)
    lines = src.splitlines()
    pending = []
    for ln in lines:
        s = ln.strip()
        dm = re.match(r"@(Get|Post|Patch|Put|Delete)\(\s*'?([^')]*)'?\s*\)", s)
        if dm:
            pending.append((dm.group(1).upper(), dm.group(2)))
            continue
        if pending and re.match(r"[A-Za-z_]\w*\s*\(", s):
            method_name = re.match(r"([A-Za-z_]\w*)\s*\(", s).group(1)
            for verb, p in pending:
                full = '/' + '/'.join([x for x in [('api'), base, p] if x])
                full = re.sub(r'/+', '/', full)
                routes.append({'method': verb, 'path': full, 'handler': method_name, 'tag': tag})
            pending = []
        elif s.startswith('@') or s == '' or s.startswith('//'):
            pass
        else:
            if not s.startswith('@'):
                pending = pending  # keep across decorator lines

facts = {'entities': sorted(entities, key=lambda e: e['table']),
         'routes': routes,
         'entity_count': len(entities),
         'route_count': len(routes)}

OUT = os.path.join(os.path.dirname(__file__), 'facts.json')
with open(OUT, 'w') as f:
    json.dump(facts, f, indent=2)
print(f"entities={len(entities)} columns={sum(len(e['columns']) for e in entities)} routes={len(routes)}")
print('wrote', OUT)
