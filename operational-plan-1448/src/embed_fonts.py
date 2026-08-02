#!/usr/bin/env python3
"""Embed TTF fonts into a .pptx (PowerPoint embedded-font parts)."""
import shutil, sys, zipfile, os, re

SRC = sys.argv[1]
DST = sys.argv[2]
FONTS_DIR = os.path.join(os.path.dirname(__file__), '..', 'fonts')

# typeface -> slots {regular, bold}
FONTS = [
    ('Tajawal', {'regular': 'Tajawal-Regular.ttf', 'bold': 'Tajawal-Bold.ttf'}),
    ('Tajawal ExtraBold', {'regular': 'Tajawal-ExtraBold.ttf'}),
]

work = DST + '.tmpdir'
if os.path.exists(work):
    shutil.rmtree(work)
with zipfile.ZipFile(SRC) as z:
    z.extractall(work)

# 1) copy font parts
os.makedirs(os.path.join(work, 'ppt', 'fonts'), exist_ok=True)
font_parts = []  # (rid, partname, typeface, slot)
rid_base = 500
i = 0
for typeface, slots in FONTS:
    entry = {'typeface': typeface}
    for slot, fname in slots.items():
        i += 1
        part = f'font{i}.fntdata'
        shutil.copyfile(os.path.join(FONTS_DIR, fname), os.path.join(work, 'ppt', 'fonts', part))
        entry[slot] = f'rId{rid_base + i}'
        font_parts.append((f'rId{rid_base + i}', f'fonts/{part}'))
    FONTS_RESOLVED = entry
    entry_list = globals().setdefault('_entries', [])
    entry_list.append(entry)
entries = globals()['_entries']

# 2) content types
ct_path = os.path.join(work, '[Content_Types].xml')
ct = open(ct_path, encoding='utf-8').read()
if 'fntdata' not in ct:
    ct = ct.replace('<Default Extension="xml"', '<Default Extension="fntdata" ContentType="application/x-fontdata"/><Default Extension="xml"', 1)
open(ct_path, 'w', encoding='utf-8').write(ct)

# 3) presentation rels
rels_path = os.path.join(work, 'ppt', '_rels', 'presentation.xml.rels')
rels = open(rels_path, encoding='utf-8').read()
add = ''.join(
    f'<Relationship Id="{rid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/font" Target="{tgt}"/>'
    for rid, tgt in font_parts)
rels = rels.replace('</Relationships>', add + '</Relationships>')
open(rels_path, 'w', encoding='utf-8').write(rels)

# 4) presentation.xml: attribute + embeddedFontLst after </p:notesSz>
pres_path = os.path.join(work, 'ppt', 'presentation.xml')
pres = open(pres_path, encoding='utf-8').read()
if 'embedTrueTypeFonts' not in pres:
    pres = pres.replace('<p:presentation ', '<p:presentation embedTrueTypeFonts="1" ', 1)
lst = '<p:embeddedFontLst>'
for e in entries:
    lst += f'<p:embeddedFont><p:font typeface="{e["typeface"]}"/>'
    if 'regular' in e:
        lst += f'<p:regular r:id="{e["regular"]}"/>'
    if 'bold' in e:
        lst += f'<p:bold r:id="{e["bold"]}"/>'
    lst += '</p:embeddedFont>'
lst += '</p:embeddedFontLst>'
m = re.search(r'(<p:notesSz[^>]*/>)', pres)
assert m, 'notesSz not found'
pres = pres.replace(m.group(1), m.group(1) + lst, 1)
open(pres_path, 'w', encoding='utf-8').write(pres)

# 5) rezip
if os.path.exists(DST):
    os.remove(DST)
zf = zipfile.ZipFile(DST, 'w', zipfile.ZIP_DEFLATED)
for root, _, files in os.walk(work):
    for f in files:
        full = os.path.join(root, f)
        rel = os.path.relpath(full, work)
        zf.write(full, rel)
zf.close()
shutil.rmtree(work)
print('embedded fonts ->', DST)
