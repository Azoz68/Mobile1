# -*- coding: utf-8 -*-
"""
تضمين خط Noto Sans Arabic داخل ملف البوربوينت (OOXML embedded fonts)
حتى يظهر العرض بالخط نفسه على أي جهاز حتى لو لم يكن الخط مثبتاً عليه.
"""

import shutil
import sys
import zipfile
from lxml import etree

NS = {
    "p": "http://schemas.openxmlformats.org/presentationml/2006/main",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
    "ct": "http://schemas.openxmlformats.org/package/2006/content-types",
    "rel": "http://schemas.openxmlformats.org/package/2006/relationships",
}
FONT_REL_TYPE = ("http://schemas.openxmlformats.org/officeDocument/2006/"
                 "relationships/font")


def embed(pptx_path, typeface, regular_ttf, bold_ttf):
    src = zipfile.ZipFile(pptx_path, "r")
    items = {i.filename: src.read(i.filename) for i in src.infolist()}
    src.close()

    # ---- 1. content types: register fntdata extension
    ct = etree.fromstring(items["[Content_Types].xml"])
    if not ct.findall(f'{{{NS["ct"]}}}Default[@Extension="fntdata"]'):
        d = etree.SubElement(ct, f'{{{NS["ct"]}}}Default')
        d.set("Extension", "fntdata")
        d.set("ContentType", "application/x-fontdata")
    items["[Content_Types].xml"] = etree.tostring(
        ct, xml_declaration=True, encoding="UTF-8", standalone=True)

    # ---- 2. relationships: point at the font parts
    rels = etree.fromstring(items["ppt/_rels/presentation.xml.rels"])
    existing = {r.get("Id") for r in rels}
    rid_reg, rid_bold = "rIdFont1", "rIdFont2"
    for rid, target in ((rid_reg, "fonts/font1.fntdata"),
                        (rid_bold, "fonts/font2.fntdata")):
        if rid not in existing:
            rel = etree.SubElement(rels, f'{{{NS["rel"]}}}Relationship')
            rel.set("Id", rid)
            rel.set("Type", FONT_REL_TYPE)
            rel.set("Target", target)
    items["ppt/_rels/presentation.xml.rels"] = etree.tostring(
        rels, xml_declaration=True, encoding="UTF-8", standalone=True)

    # ---- 3. presentation.xml: embedTrueTypeFonts + embeddedFontLst
    pres = etree.fromstring(items["ppt/presentation.xml"])
    pres.set("embedTrueTypeFonts", "1")
    if pres.find(f'{{{NS["p"]}}}embeddedFontLst') is None:
        lst = etree.Element(f'{{{NS["p"]}}}embeddedFontLst')
        ef = etree.SubElement(lst, f'{{{NS["p"]}}}embeddedFont')
        fnt = etree.SubElement(ef, f'{{{NS["p"]}}}font')
        fnt.set("typeface", typeface)
        reg = etree.SubElement(ef, f'{{{NS["p"]}}}regular')
        reg.set(f'{{{NS["r"]}}}id', rid_reg)
        bold = etree.SubElement(ef, f'{{{NS["p"]}}}bold')
        bold.set(f'{{{NS["r"]}}}id', rid_bold)
        # schema order: embeddedFontLst comes right after notesSz
        anchor = pres.find(f'{{{NS["p"]}}}notesSz')
        anchor.addnext(lst)
    items["ppt/presentation.xml"] = etree.tostring(
        pres, xml_declaration=True, encoding="UTF-8", standalone=True)

    # ---- 4. font binary parts (pptx fntdata = raw ttf)
    with open(regular_ttf, "rb") as f:
        items["ppt/fonts/font1.fntdata"] = f.read()
    with open(bold_ttf, "rb") as f:
        items["ppt/fonts/font2.fntdata"] = f.read()

    # ---- 5. rewrite the package
    tmp = pptx_path + ".tmp"
    with zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as out:
        for name, data in items.items():
            out.writestr(name, data)
    shutil.move(tmp, pptx_path)
    print(f"embedded '{typeface}' into {pptx_path}")


if __name__ == "__main__":
    base = ("/tmp/claude-0/-home-user-Mobile1/"
            "fe07be14-4223-582c-92a6-23b00b5692aa/scratchpad/fonts")
    embed(sys.argv[1] if len(sys.argv) > 1
          else "Research-Gaps-الفجوات-البحثية.pptx",
          "Noto Sans Arabic",
          f"{base}/NotoSansArabic-Regular.ttf",
          f"{base}/NotoSansArabic-Bold.ttf")
