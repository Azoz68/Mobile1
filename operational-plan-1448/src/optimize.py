#!/usr/bin/env python3
"""Deduplicate identical media parts inside a .pptx and rewrite all relationships."""
import hashlib, os, re, shutil, sys, zipfile

SRC, DST = sys.argv[1], sys.argv[2]
work = DST + '.dedup'
if os.path.exists(work):
    shutil.rmtree(work)
with zipfile.ZipFile(SRC) as z:
    z.extractall(work)

media_dir = os.path.join(work, 'ppt', 'media')
canon = {}          # hash -> canonical basename
remap = {}          # duplicate basename -> canonical basename
if os.path.isdir(media_dir):
    for name in sorted(os.listdir(media_dir)):
        p = os.path.join(media_dir, name)
        h = hashlib.sha256(open(p, 'rb').read()).hexdigest()
        if h in canon:
            remap[name] = canon[h]
            os.remove(p)
        else:
            canon[h] = name

# rewrite every .rels reference that points at a removed part
if remap:
    for root, _, files in os.walk(work):
        for f in files:
            if not f.endswith('.rels'):
                continue
            path = os.path.join(root, f)
            txt = open(path, encoding='utf-8').read()
            orig = txt
            for dup, keep in remap.items():
                txt = re.sub(r'(Target="[^"]*media/)' + re.escape(dup) + r'"', r'\g<1>' + keep + '"', txt)
            if txt != orig:
                open(path, 'w', encoding='utf-8').write(txt)

if os.path.exists(DST):
    os.remove(DST)
zf = zipfile.ZipFile(DST, 'w', zipfile.ZIP_DEFLATED, compresslevel=9)
for root, _, files in os.walk(work):
    for f in files:
        full = os.path.join(root, f)
        zf.write(full, os.path.relpath(full, work))
zf.close()
shutil.rmtree(work)
print(f'deduped {len(remap)} media parts -> {len(canon)} unique | {os.path.getsize(DST)/1e6:.1f} MB')
