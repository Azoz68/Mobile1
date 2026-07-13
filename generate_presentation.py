# -*- coding: utf-8 -*-
"""
مولّد عرض تقديمي — الفجوات البحثية | Research Gaps  (النسخة 2)
تصميم عصري متقدم: تدرجات لونية، ظلال ناعمة، أرقام شبحية، بطاقات حديثة.
الخط: Segoe UI (نفس خط واجهة شات Claude؛ يتحول تلقائياً إلى SF Arabic على أجهزة Apple).
المحتوى: الشرائح + التفريغ الصوتي الكامل لشرح الورشة.
المحتوى العلمي الأصلي: د. هناء حسين الأهيمر (Dr. Hana Hossen Elahemer).
"""

from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from pptx.oxml.ns import qn, nsdecls
from pptx.oxml import parse_xml

# ================================================================ palette
INK    = RGBColor(0x22, 0x1C, 0x57)
MUTED  = RGBColor(0x6E, 0x6A, 0x8F)
FAINT  = RGBColor(0xEC, 0xE9, 0xFA)
BG     = RGBColor(0xF8, 0xF7, 0xFD)
CARD   = RGBColor(0xFF, 0xFF, 0xFF)
BORDER = RGBColor(0xEA, 0xE7, 0xF7)
WHITE  = RGBColor(0xFF, 0xFF, 0xFF)
AMBER  = RGBColor(0xFB, 0xBF, 0x24)

G_HERO    = ("17123B", "6D28D9")
G_VIOLET  = ("6D28D9", "A855F7")
G_FUCHSIA = ("A21CAF", "E879F9")
G_TEAL    = ("0D9488", "2DD4BF")
G_BLUE    = ("1D4ED8", "60A5FA")
G_AMBER   = ("D97706", "FBBF24")
G_ROSE    = ("BE123C", "FB7185")
G_EMERALD = ("047857", "34D399")
G_NAVY    = ("17123B", "3B3486")

VIOLET  = RGBColor(0x6D, 0x28, 0xD9)
FUCHSIA = RGBColor(0xA2, 0x1C, 0xAF)
TEAL    = RGBColor(0x0D, 0x94, 0x88)
BLUE    = RGBColor(0x1D, 0x4E, 0xD8)
ORANGE  = RGBColor(0xD9, 0x77, 0x06)
ROSE    = RGBColor(0xBE, 0x12, 0x3C)
EMERALD = RGBColor(0x04, 0x78, 0x57)
NAVY    = RGBColor(0x17, 0x12, 0x3B)

FONT = "Noto Sans Arabic"   # نفس خط شات Claude للنص العربي — ومضمّن داخل الملف
AR_DIGITS = "٠١٢٣٤٥٦٧٨٩"

ACC6  = [FUCHSIA, ORANGE, TEAL, VIOLET, ROSE, EMERALD]
GRAD6 = [G_FUCHSIA, G_AMBER, G_TEAL, G_VIOLET, G_ROSE, G_EMERALD]


def tint(color: RGBColor, factor: float) -> RGBColor:
    return RGBColor(int(color[0] + (255 - color[0]) * factor),
                    int(color[1] + (255 - color[1]) * factor),
                    int(color[2] + (255 - color[2]) * factor))


def ar_num(n: int) -> str:
    return "".join(AR_DIGITS[int(d)] for d in str(n))


# ================================================================ helpers
def set_rtl(paragraph):
    paragraph._p.get_or_add_pPr().set("rtl", "1")


def style_run(run, size, color, bold=False, italic=False, font=FONT, spacing=None):
    f = run.font
    f.size = Pt(size)
    f.bold = bold
    f.italic = italic
    f.color.rgb = color
    f.name = font
    rPr = run._r.get_or_add_rPr()
    if spacing is not None:
        rPr.set("spc", str(spacing))
    for tag in ("a:cs", "a:ea"):
        el = rPr.find(qn(tag))
        if el is None:
            el = rPr.makeelement(qn(tag), {})
            rPr.append(el)
        el.set("typeface", font)


def no_shadow(shape):
    try:
        shape.shadow.inherit = False
    except Exception:
        pass


def gradient_fill(shape, pair, angle_deg=45):
    c1, c2 = pair
    spPr = shape._element.spPr
    for tag in ("a:noFill", "a:solidFill", "a:gradFill", "a:blipFill",
                "a:pattFill", "a:grpFill"):
        for el in spPr.findall(qn(tag)):
            spPr.remove(el)
    grad = parse_xml(
        f'<a:gradFill {nsdecls("a")} rotWithShape="1"><a:gsLst>'
        f'<a:gs pos="0"><a:srgbClr val="{c1}"/></a:gs>'
        f'<a:gs pos="100000"><a:srgbClr val="{c2}"/></a:gs>'
        f'</a:gsLst><a:lin ang="{int(angle_deg * 60000)}" scaled="1"/></a:gradFill>')
    ln = spPr.find(qn("a:ln"))
    if ln is not None:
        ln.addprevious(grad)
    else:
        spPr.append(grad)


def soft_shadow(shape, blur_pt=10, dist_pt=3.2, alpha=20, color="221C57"):
    spPr = shape._element.spPr
    for el in spPr.findall(qn("a:effectLst")):
        spPr.remove(el)
    ef = parse_xml(
        f'<a:effectLst {nsdecls("a")}>'
        f'<a:outerShdw blurRad="{Pt(blur_pt)}" dist="{Pt(dist_pt)}" '
        f'dir="5400000" rotWithShape="0">'
        f'<a:srgbClr val="{color}"><a:alpha val="{alpha * 1000}"/></a:srgbClr>'
        f'</a:outerShdw></a:effectLst>')
    spPr.append(ef)


def set_alpha(shape, pct):
    sp = shape.fill._xPr.find(qn("a:solidFill"))
    clr = sp.find(qn("a:srgbClr"))
    clr.append(clr.makeelement(qn("a:alpha"), {"val": str(int(pct * 1000))}))


def rect(slide, x, y, w, h, fill=None, line=None, line_w=0.75,
         shape=MSO_SHAPE.RECTANGLE, radius=None, grad=None, angle=45,
         shadow=False):
    s = slide.shapes.add_shape(shape, Inches(x), Inches(y), Inches(w), Inches(h))
    no_shadow(s)
    if grad is not None:
        gradient_fill(s, grad, angle)
    elif fill is None:
        s.fill.background()
    else:
        s.fill.solid()
        s.fill.fore_color.rgb = fill
    if line is None:
        s.line.fill.background()
    else:
        s.line.color.rgb = line
        s.line.width = Pt(line_w)
    if radius is not None and shape == MSO_SHAPE.ROUNDED_RECTANGLE:
        try:
            s.adjustments[0] = radius
        except Exception:
            pass
    if shadow:
        soft_shadow(s)
    return s


def circle(slide, x, y, d, color=None, opacity=100, grad=None, line=None,
           line_w=1, shadow=False):
    s = rect(slide, x, y, d, d, fill=color, grad=grad, line=line,
             line_w=line_w, shape=MSO_SHAPE.OVAL, shadow=shadow)
    if color is not None and opacity < 100:
        set_alpha(s, opacity)
    return s


def textbox(slide, x, y, w, h, paras, anchor=MSO_ANCHOR.TOP, wrap=True):
    tb = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = tb.text_frame
    tf.word_wrap = wrap
    tf.vertical_anchor = anchor
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    for i, pa in enumerate(paras):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = pa.get("align", PP_ALIGN.RIGHT)
        if pa.get("rtl", True):
            set_rtl(p)
        p.space_after = Pt(pa.get("space_after", 4))
        p.space_before = Pt(pa.get("space_before", 0))
        p.line_spacing = pa.get("line", 1.05)
        for (t, size, color, *rest) in pa["runs"]:
            bold = rest[0] if len(rest) > 0 else False
            italic = rest[1] if len(rest) > 1 else False
            r = p.add_run()
            r.text = t
            style_run(r, size, color, bold=bold, italic=italic,
                      spacing=pa.get("spacing"))
    return tb


def P(runs, **kw):
    kw["runs"] = runs
    return kw


def chip_text(shape, text, size, color, bold=True, rtl=True):
    tf = shape.text_frame
    tf.word_wrap = False
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    if rtl:
        set_rtl(p)
    r = p.add_run()
    r.text = text
    style_run(r, size, color, bold=bold)


def add_notes(slide, text):
    slide.notes_slide.notes_text_frame.text = text


# ================================================================ deck
prs = Presentation()
prs.slide_width, prs.slide_height = Inches(13.333), Inches(7.5)
BLANK = prs.slide_layouts[6]

M = 0.6
CW = 13.333 - 2 * M
PAGE = [0]


def new_slide(hero=False):
    s = prs.slides.add_slide(BLANK)
    if hero:
        rect(s, 0, 0, 13.333, 7.5, grad=G_HERO, angle=35)
    else:
        rect(s, 0, 0, 13.333, 7.5, fill=BG)
    PAGE[0] += 1
    return s


def footer(slide, grad):
    rect(slide, 0, 7.42, 13.333, 0.08, grad=grad, angle=0)
    pill = rect(slide, M, 7.04, 0.62, 0.3, grad=grad,
                shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.5)
    chip_text(pill, f"{PAGE[0]:02d}", 10.5, WHITE, rtl=False)
    textbox(slide, 13.333 - M - 5.5, 7.05, 5.5, 0.3,
            [P([("الفجوات البحثية  •  د. هناء حسين الأهيمر", 11, MUTED)],
               align=PP_ALIGN.RIGHT)])


def header(slide, icon, kicker, title_ar, grad, accent):
    textbox(slide, 0.22, -0.30, 2.8, 1.8,
            [P([(f"{PAGE[0]:02d}", 88, FAINT, True)],
               align=PP_ALIGN.LEFT, rtl=False)])
    chip = rect(slide, 13.333 - M - 1.0, 0.40, 1.0, 1.0, grad=grad,
                shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.3, shadow=True)
    chip_text(chip, icon, 30, WHITE, rtl=False)
    tw = CW - 1.25
    textbox(slide, M, 0.36, tw, 0.32,
            [P([(kicker.upper(), 11, accent, True)],
               align=PP_ALIGN.RIGHT, rtl=False, spacing=300)])
    textbox(slide, M, 0.58, tw, 0.8,
            [P([(title_ar, 31, INK, True)], align=PP_ALIGN.RIGHT)])
    rect(slide, 13.333 - M - 1.25 - 2.2, 1.5, 2.2, 0.075, grad=grad, angle=0,
         shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=1.0)
    footer(slide, grad)


# ================================================================ 01 — hero
s = new_slide(hero=True)
circle(s, 9.4, -2.3, 5.6, WHITE, 7)
circle(s, -1.9, 4.6, 5.2, WHITE, 6)
circle(s, 11.9, 5.7, 2.4, WHITE, 8)
circle(s, 1.35, 1.15, 0.3, AMBER, 90)
circle(s, 11.6, 1.7, 0.16, WHITE, 70)
circle(s, 2.3, 6.3, 0.16, WHITE, 60)

pill = rect(s, 4.62, 0.78, 4.1, 0.5, fill=WHITE,
            shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.5)
set_alpha(pill, 14)
chip_text(pill, "ورشة عمل أكاديمية متخصصة  •  ACADEMIC WORKSHOP", 11.5, WHITE)

textbox(s, 1.5, 1.55, 10.333, 1.5,
        [P([("الفجوات البحثية", 60, WHITE, True)], align=PP_ALIGN.CENTER)])
textbox(s, 1.5, 3.0, 10.333, 0.55,
        [P([("R E S E A R C H   G A P S", 20, AMBER, True)],
           align=PP_ALIGN.CENTER, rtl=False, spacing=600)])
rect(s, 5.97, 3.66, 1.4, 0.05, grad=G_AMBER, angle=0)
textbox(s, 1.8, 3.9, 9.733, 0.55,
        [P([("دليلك الشامل لاكتشاف الفجوات البحثية بذكاء واحترافية — نسخة موسّعة من الشرح الكامل للورشة",
             16, tint(WHITE, 0.05))], align=PP_ALIGN.CENTER)])

hook = rect(s, 2.87, 4.68, 7.6, 1.05, fill=WHITE,
            shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.16)
set_alpha(hook, 12)
textbox(s, 3.15, 4.82, 7.04, 0.45,
        [P([("السؤال الأكثر تكراراً: هل يمكن استخدام الذكاء الاصطناعي لإيجاد الفجوة البحثية؟",
             13.5, WHITE, True)], align=PP_ALIGN.CENTER)])
textbox(s, 3.15, 5.26, 7.04, 0.4,
        [P([("الجواب: نعم — وفي هذا العرض ستتعلم كيف، خطوة بخطوة", 13, AMBER, True)],
           align=PP_ALIGN.CENTER)])

textbox(s, 1.5, 6.1, 10.333, 0.45,
        [P([("المحتوى العلمي:  ", 13.5, tint(WHITE, 0.1)),
            ("الدكتورة هناء حسين الأهيمر", 13.5, AMBER, True),
            ("   Dr. Hana Hossen Elahemer", 12, tint(WHITE, 0.25))],
           align=PP_ALIGN.CENTER)])
textbox(s, 1.5, 6.6, 10.333, 0.4,
        [P([("نسخة موسّعة بشرح تفصيلي أكبر وتصميم جديد", 11, tint(WHITE, 0.35))],
           align=PP_ALIGN.CENTER)])
add_notes(s, "افتتاحية الورشة كما وردت في الشرح: أكثر الأسئلة التي تصل "
             "للمقدمة على الخاص هو: هل يمكن استخدام الذكاء الاصطناعي لإيجاد "
             "الفجوة البحثية؟ والجواب: نعم — والورشة تشرح كيف. الموضوع من أهم "
             "مواضيع البحث العلمي: الفجوة البحثية تعني ببساطة الشيء الذي لم "
             "تتم دراسته بشكل كافٍ بعد، أو النقطة التي لم يركّز عليها "
             "الباحثون بوضوح. سنتعلم في هذا العرض: ما هي الفجوة البحثية، "
             "لماذا تعتبر مهمة، أنواعها المختلفة، والأهم: كيف نكتشفها "
             "باستخدام أدوات الذكاء الاصطناعي. والهدف النهائي: أن يتمكن أي "
             "طالب أو باحث بعد هذا العرض من تحديد فجوة بحثية قوية بطريقة "
             "احترافية.")

# ================================================================ 02 — agenda
s = new_slide()
header(s, "🗂", "Agenda & Goal", "خطة العرض وهدفه", G_AMBER, ORANGE)
goal = rect(s, M, 1.78, CW, 0.85, grad=G_NAVY, angle=0,
            shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.2, shadow=True)
textbox(s, M + 0.35, 1.9, CW - 0.7, 0.6,
        [P([("🎯 هدف الورشة:  ", 14, AMBER, True),
            ("أن يتمكّن أي طالب أو باحث — بعد هذا العرض — من تحديد فجوة بحثية قوية بطريقة احترافية",
             14, WHITE, True)], align=PP_ALIGN.CENTER)])
agenda = [
    ("مفهوم الفجوة البحثية", "التعريف الدقيق وصورها الأربع كما شرحتها الورشة", FUCHSIA, G_FUCHSIA),
    ("لماذا تهمّنا الفجوات؟", "ستة أسباب تجعلها حجر الأساس في أي بحث ناجح", ORANGE, G_AMBER),
    ("الأنواع الستة بالتفصيل", "شرح موسّع لكل نوع مع سؤاله المفتاحي ومثاله", TEAL, G_TEAL),
    ("أمثلة تطبيقية واقعية", "مثال ملموس على كل نوع ولماذا يُعد فجوة", VIOLET, G_VIOLET),
    ("أدوات الذكاء الاصطناعي", "ثماني أدوات + سير العمل الذكي مع الأداة الأقوى", ROSE, G_ROSE),
    ("استراتيجيات المحترفين", "أربع استراتيجيات ميدانية + إطار التفكير النقدي", EMERALD, G_EMERALD),
    ("من الفجوة إلى الصياغة", "تمييز الفجوة القوية، خارطة طريق، وقالب صياغة جاهز", BLUE, G_BLUE),
]
cw2, gap2 = (CW - 0.45) / 2, 0.45
for i, (t, d, ac, gr) in enumerate(agenda):
    col = 0 if i < 4 else 1              # 0 = right column
    row = i if i < 4 else i - 4
    x = 13.333 - M - cw2 if col == 0 else M
    y = 2.85 + row * 1.04
    rect(s, x, y, cw2, 0.9, fill=CARD, line=BORDER, line_w=1,
         shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.2, shadow=True)
    nc = rect(s, x + cw2 - 0.72, y + 0.16, 0.58, 0.58, grad=gr,
              shape=MSO_SHAPE.OVAL)
    chip_text(nc, ar_num(i + 1), 15, WHITE)
    textbox(s, x + 0.25, y + 0.07, cw2 - 1.05, 0.4,
            [P([(t, 14.5, INK, True)], align=PP_ALIGN.RIGHT)])
    textbox(s, x + 0.25, y + 0.47, cw2 - 1.05, 0.38,
            [P([(d, 11, MUTED)], align=PP_ALIGN.RIGHT)])
# quote fills the empty 8th cell
x, y = M, 2.85 + 3 * 1.04
qc = rect(s, x, y, cw2, 0.9, fill=tint(VIOLET, 0.92), line=VIOLET, line_w=1,
          shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.2)
textbox(s, x + 0.25, y + 0.12, cw2 - 0.5, 0.7,
        [P([("«الفجوة البحثية هي أساس أي بحث علمي ناجح»", 13, VIOLET, True)],
           align=PP_ALIGN.CENTER, space_after=2),
         P([("— من خلاصة الورشة", 10, MUTED)], align=PP_ALIGN.CENTER)])
add_notes(s, "خطة العرض في سبعة محاور تتدرج منطقياً: نبدأ بالمفهوم (ما هي "
             "الفجوة وما صورها؟)، ثم الأهمية (لماذا نهتم؟)، ثم الأنواع الستة "
             "بشرح موسّع لكل نوع، ثم أمثلة تطبيقية واقعية، ثم ننتقل للجانب "
             "العملي: أدوات الذكاء الاصطناعي الثماني وسير العمل الذكي الذي "
             "أوصت به الورشة، فاستراتيجيات الباحثين المحترفين وإطار التفكير "
             "النقدي، ونختم بالتمييز بين الفجوة القوية والضعيفة وقالب صياغة "
             "جاهز للاستخدام. الهدف المعلن في الورشة: أن يخرج كل طالب وباحث "
             "قادراً على تحديد فجوة بحثية قوية باحترافية.")

# ================================================================ 03 — definition
s = new_slide()
header(s, "🧠", "What is a Research Gap?", "ما هي الفجوة البحثية؟", G_FUCHSIA, FUCHSIA)
d = rect(s, M, 1.75, CW, 1.6, fill=CARD, line=BORDER, line_w=1,
         shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.1, shadow=True)
rect(s, 13.333 - M - 0.14, 1.75, 0.14, 1.6, grad=G_FUCHSIA, angle=90,
     shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=1.0)
textbox(s, M + 0.35, 1.92, CW - 0.85, 1.3,
        [P([("التعريف كما ورد في الشرح:  ", 14.5, FUCHSIA, True),
            ("الفجوة البحثية ببساطة هي منطقة أو مشكلة في مجال معيّن: إما لم "
             "يدرسها أحد من قبل، أو تمت دراستها بشكل ناقص، أو تحتاج مزيداً من "
             "التحليل والاستكشاف.", 14, INK)],
           align=PP_ALIGN.RIGHT, space_after=6, line=1.18),
         P([("بعبارة أخرى:  ", 13, VIOLET, True),
            ("هي شيء لم تتم دراسته بشكل كافٍ بعد، أو نقطة لم يركّز عليها "
             "الباحثون بوضوح — وسدّها هو ما يمنح بحثك قيمته.", 13, INK)],
           align=PP_ALIGN.RIGHT, line=1.18)])
textbox(s, M, 3.5, CW, 0.4,
        [P([("للفجوة البحثية أكثر من صورة — هذه أشهر أربع صور تظهر بها:",
             13.5, MUTED, True)], align=PP_ALIGN.RIGHT)])
forms = [
    ("موضوع جديد كلياً", "🔍",
     "لم يتناوله أي باحث من قبل — أندر الصور وأثمنها متى كان الموضوع مهماً وملحّاً",
     FUCHSIA, G_FUCHSIA),
    ("دراسة من زاوية واحدة", "⚡",
     "الموضوع دُرس جزئياً من منظور واحد فقط، وبقيت زواياه الأخرى مجهولة تماماً",
     ORANGE, G_AMBER),
    ("نتائج متضاربة", "🔄",
     "دراسات وصلت إلى نتائج متناقضة — والحسم بينها يحتاج بحثاً جديداً محكماً",
     TEAL, G_TEAL),
    ("سياق جغرافي مختلف", "🌍",
     "دراسة نجحت في دولة ما، وليس شرطاً أن تنجح بالطريقة نفسها في مجتمع آخر",
     EMERALD, G_EMERALD),
]
cw4 = (CW - 3 * 0.26) / 4
for i, (t, ic, dsc, ac, gr) in enumerate(forms):
    x = 13.333 - M - cw4 - i * (cw4 + 0.26)
    y = 4.0
    rect(s, x, y, cw4, 2.85, fill=CARD, line=BORDER, line_w=1,
         shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.1, shadow=True)
    rect(s, x, y, cw4, 0.12, grad=gr, angle=0,
         shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=1.0)
    ico = circle(s, x + cw4 / 2 - 0.33, y + 0.35, 0.66, grad=gr, shadow=True)
    chip_text(ico, ic, 20, WHITE, rtl=False)
    textbox(s, x + 0.12, y + 1.12, cw4 - 0.24, 0.45,
            [P([(t, 14.5, ac, True)], align=PP_ALIGN.CENTER)])
    textbox(s, x + 0.18, y + 1.6, cw4 - 0.36, 1.15,
            [P([(dsc, 11.5, INK)], align=PP_ALIGN.CENTER, line=1.15)])
add_notes(s, "من شرح الورشة: ماذا نقصد بالفجوة البحثية؟ ببساطة: منطقة أو "
             "مشكلة في مجال معين، إما أن أحداً لم يدرسها من قبل، أو دُرست "
             "بشكل ناقص، أو تحتاج مزيداً من التحليل والاستكشاف. وللفجوة "
             "أكثر من صورة: (1) موضوع جديد بالكامل لم يبحثه أحد — أقرب لفجوة "
             "المعرفة. (2) دراسة جزئية: الموضوع تناوله الباحثون من زاوية "
             "واحدة فقط. (3) نتائج متضاربة بين الدراسات تحتاج بحثاً يحسمها. "
             "(4) اختلاف السياق الجغرافي — وأكدت الشارحة هذه النقطة بمثال "
             "واضح: الدراسة التي تنجح في دولة معينة ليس شرطاً أن تنجح بنفس "
             "الطريقة في مجتمع آخر، لاختلاف الثقافة والظروف والبيئة. لذلك "
             "إعادة اختبار النتائج في سياقك المحلي فجوة مشروعة وقيّمة.")

# ================================================================ 04 — why
s = new_slide()
header(s, "⚙️", "Why Research Gaps Matter", "لماذا تهمّنا الفجوات البحثية؟", G_AMBER, ORANGE)
why = [
    ("اتجاه واضح لبحثك", "🧭", "Research Direction",
     "تمنحك بوصلة واضحة لرسالتك أو أطروحتك بدلاً من التخبط بين مواضيع مكررة",
     FUCHSIA, G_FUCHSIA),
    ("الأصالة العلمية", "🏆", "Scientific Originality",
     "تضمن أن بحثك فيه إضافة جديدة حقيقية للمعرفة ولا يعيد ما هو موجود",
     ORANGE, G_AMBER),
    ("تبرير الدراسة", "⚖️", "Justifying the Study",
     "حجّتك الأقوى لإقناع اللجنة العلمية بقيمة بحثك وجدوى إجرائه",
     VIOLET, G_VIOLET),
    ("ربط الدراسات السابقة", "🔗", "Linking the Literature",
     "تصل بين ما قالته الأدبيات وبين الشيء الجديد الذي ستضيفه أنت",
     TEAL, G_TEAL),
    ("النشر في المجلات", "📰", "Academic Publishing",
     "المجلات العلمية المحكّمة تفضّل الأبحاث التي تعالج فجوات واضحة",
     EMERALD, G_EMERALD),
    ("التمويل البحثي", "💰", "Research Funding",
     "الجهات الممولة تبحث دائماً عن مشاكل حقيقية تحتاج إلى حلول",
     ROSE, G_ROSE),
]
cw3, gap3 = (CW - 2 * 0.28) / 3, 0.28
for i, (t, ic, en, dsc, ac, gr) in enumerate(why):
    col, row = i % 3, i // 3
    x = 13.333 - M - cw3 - col * (cw3 + gap3)
    y = 1.78 + row * 2.58
    rect(s, x, y, cw3, 2.36, fill=CARD, line=BORDER, line_w=1,
         shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.1, shadow=True)
    ico = rect(s, x + cw3 - 0.85, y + 0.22, 0.62, 0.62, grad=gr,
               shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.3)
    chip_text(ico, ic, 17, WHITE, rtl=False)
    textbox(s, x + 0.25, y + 0.18, cw3 - 1.15, 0.42,
            [P([(t, 14.5, ac, True)], align=PP_ALIGN.RIGHT)])
    textbox(s, x + 0.25, y + 0.58, cw3 - 1.15, 0.32,
            [P([(en, 10, MUTED, False, True)], align=PP_ALIGN.RIGHT, rtl=False)])
    textbox(s, x + 0.25, y + 1.0, cw3 - 0.5, 1.25,
            [P([(dsc, 12.5, INK)], align=PP_ALIGN.RIGHT, line=1.22)])
add_notes(s, "لماذا الفجوات البحثية مهمة جداً في البحث العلمي؟ كما عدّدتها "
             "الورشة: (1) تعطيك Research Direction — اتجاهاً واضحاً لبحثك. "
             "(2) تحقق Scientific Originality — الأصالة العلمية، أي أن بحثك "
             "فيه إضافة جديدة. (3) تساعدك في Justifying the Study — تبرير "
             "دراستك أمام اللجنة العلمية عندما تُسأل: لماذا هذا البحث؟ "
             "(4) تربط بين الـ Literature Review (الدراسات السابقة) وبين "
             "الشيء الجديد الذي ستضيفه — فيظهر بحثك امتداداً منطقياً "
             "للمعرفة. (5) حتى المجلات العلمية المحكّمة تفضّل الأبحاث التي "
             "تعالج فجوات واضحة — ذكر الفجوة في المقدمة يرفع حظوظ القبول. "
             "(6) والجهات الممولة للبحوث تبحث دائماً عن مشاكل حقيقية تحتاج "
             "حلولاً — الفجوة الموثقة هي ما يقنعها بالاستثمار في مقترحك.")

# ================================================================ 05 — types 1-3
TYPES = [
    ("فجوة المعرفة", "Knowledge Gap", "💡",
     "معلومة أو ظاهرة لا يعرفها العلم حتى الآن في مجال معيّن.",
     "تظهر عندما يكون الموضوع جديداً بالكامل — تقنية ناشئة أو ظاهرة مستجدة "
     "لم تلحق بها الأبحاث بعد، فيكون أي بحث جاد فيها إضافة صافية للمعرفة.",
     "ماذا لا نعرف بعد؟", FUCHSIA, G_FUCHSIA),
    ("فجوة الممارسة", "Practice Gap", "⚙️",
     "الفرق بين ما تقوله النظرية وما يحدث فعلاً في التطبيق الواقعي.",
     "المعرفة موجودة والإرشادات منشورة، لكن الميدان يعمل بطريقة مختلفة. "
     "بحثك هنا يجيب: لماذا لا يُطبَّق ما نعرفه؟ وكيف نغلق الفرق بين الاثنين؟",
     "لماذا لا يُطبَّق ما نعرفه؟", ORANGE, G_AMBER),
    ("فجوة الأدلة", "Evidence Gap", "🧪",
     "الأدلة العلمية المتوفرة غير كافية لدعم فرضية أو توصية معيّنة.",
     "توصيات شائعة ومقبولة على نطاق واسع، لكن دون تجارب مضبوطة تثبتها. "
     "البحث هنا يبني الدليل الغائب ويحوّل الرأي الشائع إلى علم موثق.",
     "أين الدليل العلمي؟", TEAL, G_TEAL),
    ("فجوة السكان", "Population Gap", "👥",
     "فئة معيّنة لم تتم دراستها بشكل كافٍ: جنس، عمر، ثقافة، أو مهنة.",
     "النتائج المبنية على عينات لا تشبه مجتمعك لا يمكن تعميمها عليه ببساطة. "
     "دراسة الفئة المهملة في سياقك تسدّ فجوة حقيقية وتخدم مجتمعك مباشرة.",
     "مَن الذي أُهمل من الدراسة؟", VIOLET, G_VIOLET),
    ("فجوة المنهجية", "Methodological Gap", "🧩",
     "الباحثون استخدموا منهجاً واحداً فقط لدراسة الظاهرة.",
     "تغيير المنهج — من كمي إلى نوعي أو مختلط — قد يكشف نتائج جديدة كلياً "
     "عن الظاهرة نفسها، ويضيف عمقاً لم تصل إليه الدراسات السابقة.",
     "ماذا لو بحثنا بطريقة أخرى؟", ROSE, G_ROSE),
    ("فجوة الزمن", "Temporal Gap", "⏳",
     "الدراسات المتاحة قديمة ولا تعكس الوضع الحالي.",
     "بعد كل تحول كبير — كالجائحة أو ثورة الذكاء الاصطناعي — تصبح النتائج "
     "القديمة بحاجة إلى إعادة اختبار، فالواقع تغيّر والأرقام لم تعد تمثله.",
     "هل ما زالت النتائج صحيحة اليوم؟", EMERALD, G_EMERALD),
]


def type_card(slide, x, y, w, h, idx, data):
    t, en, ic, definition, detail, q, ac, gr = data
    rect(slide, x, y, w, h, fill=CARD, line=BORDER, line_w=1,
         shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.07, shadow=True)
    band = rect(slide, x, y, w, 1.0, grad=gr, angle=0,
                shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.07)
    nc = circle(slide, x + w - 0.82, y + 0.21, 0.58, WHITE)
    set_alpha(nc, 25)
    chip_text(nc, ar_num(idx), 16, WHITE)
    textbox(slide, x + 0.25, y + 0.12, w - 1.05, 0.45,
            [P([(t, 16.5, WHITE, True)], align=PP_ALIGN.RIGHT)])
    textbox(slide, x + 0.25, y + 0.56, w - 1.05, 0.35,
            [P([(ic + "  " + en, 11, tint(WHITE, 0.12), False, True)],
               align=PP_ALIGN.RIGHT, rtl=False)])
    textbox(slide, x + 0.22, y + 1.15, w - 0.44, 1.0,
            [P([("التعريف:  ", 12, ac, True), (definition, 12, INK)],
               align=PP_ALIGN.RIGHT, line=1.15)])
    textbox(slide, x + 0.22, y + 2.15, w - 0.44, 1.75,
            [P([("من شرح الورشة:  ", 12, ac, True), (detail, 12, INK)],
               align=PP_ALIGN.RIGHT, line=1.15)])
    qp = rect(slide, x + 0.2, y + h - 0.62, w - 0.4, 0.46, fill=tint(ac, 0.9),
              line=ac, line_w=1, shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.5)
    chip_text(qp, "السؤال المفتاحي: " + q, 11.5, ac)


s = new_slide()
header(s, "🔎", "Types of Research Gaps — 1/2",
       "الأنواع الستة بالتفصيل (١–٣)", G_TEAL, TEAL)
textbox(s, M, 1.62, CW, 0.35,
        [P([("لكل نوع استخدامه الخاص — اعرفها جيداً لتعرف أي باب تطرقه في بحثك:",
             12.5, MUTED, True)], align=PP_ALIGN.RIGHT)])
cwT = (CW - 2 * 0.3) / 3
for i in range(3):
    x = 13.333 - M - cwT - i * (cwT + 0.3)
    type_card(s, x, 2.05, cwT, 4.75, i + 1, TYPES[i])
add_notes(s, "الأنواع الثلاثة الأولى كما شرحتها الورشة: (1) فجوة المعرفة "
             "Knowledge Gap: معلومة لا يعرفها العلم إلى الآن — يكون الموضوع "
             "جديداً بالكامل. مثالها النموذجي: الظواهر والتقنيات المستجدة. "
             "(2) فجوة الممارسة Practice Gap: الفرق بين النظرية وتطبيق "
             "الواقع — الإرشادات موجودة لكن الميدان لا يلتزم بها، والبحث "
             "يدرس الأسباب وسبل العلاج. هذا النوع مثالي للتخصصات المهنية "
             "كالتمريض والتعليم والإدارة. (3) فجوة الأدلة Evidence Gap: "
             "الأدلة العلمية غير كافية لدعم فرضية أو توصية — البحث هنا "
             "يصمم التجارب التي تبني الدليل الغائب. احفظ السؤال المفتاحي "
             "أسفل كل بطاقة؛ فهو أسرع وسيلة لاستدعاء النوع أثناء قراءتك "
             "للأدبيات.")

s = new_slide()
header(s, "🔎", "Types of Research Gaps — 2/2",
       "الأنواع الستة بالتفصيل (٤–٦)", G_TEAL, TEAL)
textbox(s, M, 1.62, CW, 0.35,
        [P([("ثلاثة أنواع أخرى شائعة جداً — وغالباً أسهل تناولاً للباحث المبتدئ:",
             12.5, MUTED, True)], align=PP_ALIGN.RIGHT)])
for i in range(3):
    x = 13.333 - M - cwT - i * (cwT + 0.3)
    type_card(s, x, 2.05, cwT, 4.75, i + 4, TYPES[i + 3])
add_notes(s, "الأنواع الثلاثة الأخيرة: (4) فجوة السكان Population Gap: فئة "
             "معينة لم تُدرس بشكل كافٍ — جنس، عمر، ثقافة، مهنة. انتبه: نتائج "
             "العينات الغربية لا تُعمَّم تلقائياً على مجتمعك. (5) الفجوة "
             "المنهجية Methodological Gap: الباحثون استخدموا منهجاً واحداً "
             "فقط (غالباً الكمي)، وتغيير المنهج أو الدمج بين الكمي والنوعي "
             "قد يكشف صورة مختلفة تماماً. (6) الفجوة الزمنية Temporal Gap: "
             "الدراسات قديمة ولا تعكس الوضع الحالي — خاصة بعد التحولات "
             "الكبرى كجائحة كورونا وثورة الذكاء الاصطناعي. هذان النوعان "
             "الأخيران (المنهجية والزمنية) من أسهل المداخل لباحث الماجستير: "
             "خذ موضوعاً مدروساً وأعد بحثه بمنهج جديد أو بيانات حديثة في "
             "سياقك المحلي.")

# ================================================================ 07 — examples
s = new_slide()
header(s, "📚", "Practical Examples", "أمثلة عملية على الفجوات", G_VIOLET, VIOLET)
examples = [
    ("معرفة", "تأثير الذكاء الاصطناعي على القرارات الأخلاقية في القطاع الصحي العربي لم تتم دراسته بشكل كافٍ",
     "موضوع حديث وحسّاس بلا دراسات كافية — إضافة صافية للمعرفة", FUCHSIA, G_FUCHSIA),
    ("ممارسة", "البروتوكولات الطبية الدولية موجودة وموثقة، لكن التطبيق الواقعي في المستشفيات مختلف تماماً",
     "المعرفة متوفرة والتطبيق غائب — البحث يدرس لماذا وكيف نصلحه", ORANGE, G_AMBER),
    ("أدلة", "توصيات كثيرة بدمج التعلم المصغّر في التدريب، دون تجارب مضبوطة تثبت فاعليته",
     "ادعاء شائع ينقصه الدليل التجريبي — بحثك يبني هذا الدليل", TEAL, G_TEAL),
    ("سكان", "معظم دراسات القلق الاجتماعي أُجريت على طلاب غربيين، والشباب العربي ما زال ناقصاً في الدراسات",
     "العينة لا تمثل مجتمعك — إعادة الدراسة محلياً تسد الفجوة", VIOLET, G_VIOLET),
    ("منهجية", "كل الدراسات استخدمت المنهج الكمي فقط، بينما المنهج النوعي يمكن أن يعطي تفاصيل أعمق",
     "تغيير أسلوب البحث يفتح نافذة جديدة على الظاهرة نفسها", ROSE, G_ROSE),
    ("زمنية", "الدراسات القديمة قبل 2020 لا تعكس التغيرات التي حدثت بعد الجائحة",
     "الواقع تغيّر جذرياً والأرقام القديمة لم تعد تمثله", EMERALD, G_EMERALD),
]
for i, (tag, ex, why_g, ac, gr) in enumerate(examples):
    y = 1.78 + i * 0.875
    rect(s, M, y, CW, 0.77, fill=CARD, line=BORDER, line_w=1,
         shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.18, shadow=True)
    tg = rect(s, 13.333 - M - 1.42, y + 0.14, 1.24, 0.49, grad=gr,
              shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.5)
    chip_text(tg, tag, 12, WHITE)
    textbox(s, M + 0.3, y + 0.06, CW - 2.05, 0.38,
            [P([(ex, 12.5, INK, True)], align=PP_ALIGN.RIGHT)])
    textbox(s, M + 0.3, y + 0.44, CW - 2.05, 0.3,
            [P([("لماذا هي فجوة؟  ", 10.5, ac, True), (why_g, 10.5, MUTED)],
               align=PP_ALIGN.RIGHT)])
add_notes(s, "أمثلة عملية كما وردت في الورشة: في فجوة المعرفة — تأثير "
             "الذكاء الاصطناعي على القرارات الأخلاقية في القطاع الصحي "
             "العربي لم يُدرس بشكل كافٍ. في فجوة الممارسة — البروتوكولات "
             "الطبية موجودة لكن التطبيق الواقعي مختلف. في فجوة السكان — "
             "معظم الدراسات على طلاب غربيين والشباب العربي ما زال ناقصاً في "
             "الدراسات. في الفجوة المنهجية — كل الدراسات استخدمت المنهج "
             "الكمي فقط بينما النوعي يعطي تفاصيل أعمق. في الفجوة الزمنية — "
             "الدراسات قبل 2020 لا تعكس تغيرات ما بعد الجائحة. وأضفنا مثالاً "
             "لفجوة الأدلة: التوصية الشائعة بالتعلم المصغّر دون تجارب مضبوطة. "
             "لاحظ البنية المشتركة في كل مثال: موضوع + سياق + سبب اعتباره "
             "فجوة — استخدم البنية نفسها عند صياغة فجوتك.")

# ================================================================ 08 — AI tools
s = new_slide()
header(s, "🤖", "AI Tools for Gap Discovery", "أدوات الذكاء الاصطناعي الثمانية", G_ROSE, ROSE)
tools = [
    ("Elicit", "🔍", "يلخّص الدراسات ويستخرج النتائج بسؤال مباشر بلغة طبيعية", FUCHSIA, G_FUCHSIA, False),
    ("Consensus", "🤝", "يعطيك إجماع الأبحاث حول سؤال علمي معيّن واتجاه الأدلة", TEAL, G_TEAL, False),
    ("Research Rabbit", "🐇", "يرسم خريطة للعلاقات بين الأبحاث — الأقوى بحسب الورشة", ORANGE, G_AMBER, True),
    ("Connected Papers", "🕸", "يوضح الدراسات المرتبطة ببحثك في شبكة بصرية واحدة", VIOLET, G_VIOLET, False),
    ("Scite.ai", "📊", "يقيّم قوة المراجع ويميز الاقتباسات الداعمة من المعارضة", ROSE, G_ROSE, False),
    ("Semantic Scholar", "🧠", "محرك بحث أكاديمي دلالي يفهم المعنى لا الكلمات فقط", EMERALD, G_EMERALD, False),
    ("Claude", "⭐", "يحلل الأدبيات بعمق ويقترح فجوات عبر حوار نقدي متدرج", NAVY, G_NAVY, False),
    ("ChatGPT", "💬", "يساعد في الفهم العام وصياغة أسئلة البحث الأولية", BLUE, G_BLUE, False),
]
cw4b, gap4 = (CW - 3 * 0.24) / 4, 0.24
for i, (name, ic, dsc, ac, gr, star) in enumerate(tools):
    col, row = i % 4, i // 4
    x = 13.333 - M - cw4b - col * (cw4b + gap4)
    y = 1.78 + row * 2.14
    rect(s, x, y, cw4b, 1.98,
         fill=(tint(ORANGE, 0.92) if star else CARD),
         line=(ORANGE if star else BORDER), line_w=(1.5 if star else 1),
         shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.1, shadow=True)
    ico = circle(s, x + cw4b / 2 - 0.3, y + 0.2, 0.6, grad=gr, shadow=True)
    chip_text(ico, ic, 17, WHITE, rtl=False)
    textbox(s, x + 0.12, y + 0.88, cw4b - 0.24, 0.38,
            [P([(name, 13.5, ac, True)], align=PP_ALIGN.CENTER, rtl=False)])
    textbox(s, x + 0.16, y + 1.26, cw4b - 0.32, 0.68,
            [P([(dsc, 10.5, INK)], align=PP_ALIGN.CENTER, line=1.1)])
    if star:
        st = rect(s, x + 0.12, y - 0.17, 1.05, 0.36, grad=G_AMBER,
                  shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.5, shadow=True)
        chip_text(st, "⭐ الأقوى", 10.5, WHITE)
tip = rect(s, M, 6.12, CW, 0.6, grad=G_NAVY, angle=0,
           shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.3, shadow=True)
textbox(s, M + 0.3, 6.23, CW - 0.6, 0.4,
        [P([("💡 من الشرح: ", 12.5, AMBER, True),
            ("الأدوات كثيرة، لكن الأقوى هو Research Rabbit لأنه يرسم خريطة واضحة للعلاقات بين الأبحاث — وسير العمل معه في الشريحة التالية",
             12, WHITE)], align=PP_ALIGN.CENTER)])
add_notes(s, "مع تطور التكنولوجيا صارت لدينا أدوات ذكاء اصطناعي قوية تساعد "
             "الباحث على اكتشاف الفجوات بسرعة. كما عرضتها الورشة بالترتيب: "
             "Elicit يلخص الدراسات، Consensus يعطي إجماع الأبحاث حول سؤال "
             "معين، Research Rabbit يرسم خريطة للعلاقات بين الأبحاث، "
             "Connected Papers يوضح الدراسات المرتبطة، Scite.ai يقيّم قوة "
             "المراجع، Semantic Scholar محرك بحث أكاديمي ذكي، Claude يقدم "
             "تحليلاً وحواراً نقدياً معمقاً، وChatGPT يساعد في الفهم العام. "
             "وشددت الورشة على أن الأقوى بينها هو Research Rabbit لقدرته على "
             "رسم خريطة واضحة للعلاقات — وخصصنا الشريحة التالية لسير العمل "
             "الموصى به معه خطوة بخطوة.")

# ================================================================ 09 — workflow
s = new_slide()
header(s, "🐇", "The Recommended Workflow", "سير العمل الذكي مع Research Rabbit", G_AMBER, ORANGE)
textbox(s, M, 1.68, CW, 0.4,
        [P([("الطريقة العملية التي أوصت بها الورشة لاستخراج الفجوة بالذكاء الاصطناعي — أربع خطوات:",
             13.5, MUTED, True)], align=PP_ALIGN.RIGHT)])
flow = [
    ("ارفع ملفات الدراسات", "📤",
     "حمّل الأوراق العلمية المرتبطة بموضوعك إلى المنصة — كلما كانت أحدث وأشمل كانت الخريطة أدق",
     FUCHSIA, G_FUCHSIA),
    ("اطرح سؤالاً دقيقاً", "🎯",
     "اكتب طلباً محدداً: «حلّل هذه الملفات واستخرج الفجوة البحثية» — دقة السؤال تصنع دقة الإجابة",
     ORANGE, G_AMBER),
    ("راجع التحليل بنفسك", "🧐",
     "افحص ما قدّمه الذكاء الاصطناعي بعقلك النقدي — لا تعتمد المخرجات كما هي أبداً",
     TEAL, G_TEAL),
    ("اعتمد القرار الأكاديمي", "✅",
     "بعد التحقق من المصادر تصبح الفجوة موثوقة وجاهزة لتتصدر مقترحك البحثي",
     EMERALD, G_EMERALD),
]
cwF = (CW - 3 * 0.55) / 4
for i, (t, ic, dsc, ac, gr) in enumerate(flow):
    x = 13.333 - M - cwF - i * (cwF + 0.55)
    y = 2.3
    rect(s, x, y, cwF, 3.35, fill=CARD, line=BORDER, line_w=1,
         shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.1, shadow=True)
    rect(s, x, y, cwF, 0.12, grad=gr, angle=0,
         shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=1.0)
    nc = circle(s, x + cwF / 2 - 0.38, y + 0.35, 0.76, grad=gr, shadow=True)
    chip_text(nc, ic, 22, WHITE, rtl=False)
    st = rect(s, x + cwF / 2 - 0.55, y + 1.25, 1.1, 0.36, fill=tint(ac, 0.88),
              shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.5)
    chip_text(st, "الخطوة " + ar_num(i + 1), 11, ac)
    textbox(s, x + 0.12, y + 1.72, cwF - 0.24, 0.45,
            [P([(t, 14.5, ac, True)], align=PP_ALIGN.CENTER)])
    textbox(s, x + 0.18, y + 2.2, cwF - 0.36, 1.05,
            [P([(dsc, 11, INK)], align=PP_ALIGN.CENTER, line=1.15)])
    if i < 3:
        ar = rect(s, x - 0.47, y + 1.45, 0.4, 0.4, fill=None)
        chip_text(ar, "⬅", 20, MUTED, rtl=False)
warn = rect(s, M, 6.0, CW, 0.72, grad=G_NAVY, angle=0,
            shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.22, shadow=True)
textbox(s, M + 0.3, 6.12, CW - 0.6, 0.5,
        [P([("⚠️ القاعدة الذهبية: ", 13, AMBER, True),
            ("الذكاء الاصطناعي يقترح والباحث يقرر — المراجعة البشرية للتحليل شرط أساسي لضمان دقة القرار الأكاديمي",
             12.5, WHITE)], align=PP_ALIGN.CENTER)])
add_notes(s, "هذه الشريحة تلخص أهم إضافة عملية في شرح الورشة — سير العمل "
             "الموصى به مع Research Rabbit: (1) يرفع الباحث ملفات الدراسات "
             "المرتبطة بموضوعه إلى المنصة. (2) يسأل سؤالاً دقيقاً: «حلّل هذه "
             "الملفات واستخرج الفجوة البحثية». (3) ثم — وهذه النقطة التي "
             "شددت عليها الورشة — يراجع الباحث التحليل الذي قدمه الذكاء "
             "الاصطناعي بنفسه، لضمان دقة القرار الأكاديمي. (4) بعد التحقق "
             "يعتمد الفجوة ويبني عليها مقترحه. الرسالة الجوهرية: الأدوات "
             "الذكية تسرّع الاكتشاف لكنها لا تلغي دور الباحث — الحكم النهائي "
             "دائماً للعقل النقدي البشري وللمصادر الأصلية.")

# ================================================================ 10 — strategies
s = new_slide()
header(s, "🗞", "Expert Researcher Strategies", "استراتيجيات الباحثين المحترفين", G_EMERALD, EMERALD)
strats = [
    ("اقرأ خاتمة الدراسات", "📄", "Conclusion Section",
     "الباحثون غالباً يذكرون اقتراحات مستقبلية وفجوات صريحة في نهاية أبحاثهم — فجوات جاهزة وموثقة فاستثمرها!",
     VIOLET, G_VIOLET),
    ("اعمل خريطة للأدبيات", "🗺", "Literature Mapping",
     "صنّف الدراسات حسب: السكان، المنهج، الدولة، الزمن — الخانات الفارغة في الخريطة هي فجواتك المحتملة",
     TEAL, G_TEAL),
    ("ابحث عن التناقضات", "⚖️", "Contradictions",
     "التضارب بين نتائج الدراسات فجوة قوية وفرصة ذهبية — دراستك قد تكون الحكم الذي يحسم الخلاف",
     FUCHSIA, G_FUCHSIA),
    ("اسأل: ماذا لو؟", "❓", "What if?",
     "ماذا لو طبّقنا الدراسة نفسها على فئة عمرية مختلفة أو في دولة مختلفة؟ هنا غالباً تجد فجوة بحثية ممتازة",
     ORANGE, G_AMBER),
]
for i, (t, ic, en, dsc, ac, gr) in enumerate(strats):
    y = 1.78 + i * 1.08
    rect(s, M, y, CW, 0.95, fill=CARD, line=BORDER, line_w=1,
         shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.15, shadow=True)
    ico = circle(s, 13.333 - M - 0.88, y + 0.15, 0.65, grad=gr, shadow=True)
    chip_text(ico, ic, 18, WHITE, rtl=False)
    textbox(s, M + 0.3, y + 0.08, CW - 1.4, 0.42,
            [P([(t + "   ", 14.5, ac, True),
                (en, 10.5, MUTED, False, True)], align=PP_ALIGN.RIGHT)])
    textbox(s, M + 0.3, y + 0.5, CW - 1.4, 0.42,
            [P([(dsc, 12, INK)], align=PP_ALIGN.RIGHT, line=1.1)])
tip2 = rect(s, M, 6.18, CW, 0.62, grad=G_NAVY, angle=0,
            shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.3, shadow=True)
textbox(s, M + 0.3, 6.3, CW - 0.6, 0.4,
        [P([("💡 نصيحة ذهبية: ", 13, AMBER, True),
            ("اقرأ آخر ٢٠ ورقة في مجلتك المستهدفة — الأنماط المتكررة ستكشف لك الفراغات بوضوح تام",
             12.5, WHITE)], align=PP_ALIGN.CENTER)])
add_notes(s, "الباحثون المحترفون لديهم استراتيجيات ذكية لاكتشاف الفجوات، "
             "كما عرضتها الورشة: (1) قراءة خاتمة الدراسات (Conclusion "
             "Section): الباحثون غالباً يذكرون اقتراحات مستقبلية صريحة — "
             "هذه فجوات جاهزة أوصى بها أصحاب الدراسات أنفسهم. (2) عمل "
             "Literature Mapping أو خريطة للأدبيات العلمية حسب السكان "
             "والمنهج والدولة والزمن — الفراغ في الخريطة يظهر بصرياً بدل "
             "التخمين. (3) البحث عن التناقضات بين النتائج — التضارب فرصة "
             "لبحث يحسم الخلاف. (4) ومن أفضل الأسئلة: What if — ماذا لو "
             "طبقنا الدراسة نفسها على فئة عمرية مختلفة أو دولة مختلفة؟ "
             "قالت الورشة نصاً: هنا غالباً نجد فجوة بحثية ممتازة.")

# ================================================================ 11 — critical thinking
s = new_slide()
header(s, "💡", "Critical Thinking Framework", "التفكير النقدي عند تحليل الدراسات", G_BLUE, BLUE)
pw = (CW - 0.35) / 2
px_r = 13.333 - M - pw
px_l = M
rect(s, px_r, 1.75, pw, 4.3, fill=CARD, line=BORDER, line_w=1,
     shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.08, shadow=True)
rect(s, px_r, 1.75, pw, 0.12, grad=G_VIOLET, angle=0,
     shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=1.0)
textbox(s, px_r + 0.3, 1.98, pw - 0.6, 0.45,
        [P([("❓ الأسئلة الستة الذهبية", 16, VIOLET, True)], align=PP_ALIGN.RIGHT)])
qs = [
    ("Who — مَن", "الذي تمت دراسته؟ (السكان والعينة)", FUCHSIA),
    ("What — ماذا", "قِيس بالضبط؟ (المتغيرات والأدوات)", ORANGE),
    ("Where — أين", "أُجري البحث؟ (السياق الجغرافي والثقافي)", TEAL),
    ("When — متى", "نُشرت الدراسة؟ (الزمن ومدى الحداثة)", VIOLET),
    ("How — كيف", "تمت الدراسة؟ (المنهجية والتصميم)", EMERALD),
    ("Why — لماذا", "توقفت الدراسة؟ (حدودها المعلنة)", ROSE),
]
qparas = []
for w, restq, ac in qs:
    qparas.append(P([("●  ", 12, ac), (w + ":  ", 13, ac, True),
                     (restq, 12.5, INK)],
                    align=PP_ALIGN.RIGHT, space_after=10, line=1.1))
textbox(s, px_r + 0.35, 2.6, pw - 0.7, 3.4, qparas)

rect(s, px_l, 1.75, pw, 4.3, fill=CARD, line=BORDER, line_w=1,
     shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.08, shadow=True)
rect(s, px_l, 1.75, pw, 0.12, grad=G_TEAL, angle=0,
     shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=1.0)
textbox(s, px_l + 0.3, 1.98, pw - 0.6, 0.45,
        [P([("🔎 عبارات تدل على فجوة قابلة للبحث", 16, TEAL, True)],
           align=PP_ALIGN.RIGHT)])
inds = [
    ("This area has not been studied…", "هذه المنطقة لم تُدرس بعد — غياب صريح"),
    ("Results are conflicting…", "النتائج متضاربة — تناقض يستدعي الحسم"),
    ("The sample does not represent…", "العينة لا تمثّل — قصور في التعميم"),
    ("Further research is needed…", "هناك حاجة لمزيد من البحث — دعوة مباشرة"),
    ("Only quantitative methods were used…", "اقتصار على منهج واحد — فجوة منهجية"),
    ("Before 2020…", "بيانات قديمة — فجوة زمنية محتملة"),
]
iparas = []
for en, arx in inds:
    iparas.append(P([("✔  ", 12, TEAL, True), ('"' + en + '"', 11.5, BLUE, True, True),
                     ("  " + arx, 11, MUTED)],
                    align=PP_ALIGN.RIGHT, space_after=9, line=1.1))
textbox(s, px_l + 0.35, 2.6, pw - 0.7, 3.4, iparas)

rect(s, M, 6.25, CW, 0.58, fill=tint(FUCHSIA, 0.92), line=FUCHSIA, line_w=1,
     shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.3)
textbox(s, M + 0.3, 6.36, CW - 0.6, 0.38,
        [P([("«التفكير النقدي لا يعني أن ننتقد الدراسات السابقة — بل أن نبني عليها ونطوّرها»  ",
             13, FUCHSIA, True),
            ("— من شرح الورشة", 11, MUTED)], align=PP_ALIGN.CENTER)])
add_notes(s, "أي باحث ناجح لا بد أن يستخدم التفكير النقدي، وفي الورشة إطار "
             "من ستة أسئلة: Who — من الذي تمت دراسته؟ What — ما المتغيرات؟ "
             "Where — أين صار البحث؟ When — متى نُشرت الدراسة؟ How — كيف "
             "تمت الدراسة؟ Why — لماذا توقفت وما حدودها؟ اطرح هذه الأسئلة "
             "على كل دراسة تقرؤها وستتكشف الفجوات تلقائياً. ومن المؤشرات "
             "المهمة أثناء القراءة عبارات مثل: This area has not been "
             "studied، وResults are conflicting، وThe sample does not "
             "represent — التقاط هذه العبارات في الأدبيات يقودك مباشرة إلى "
             "فجوات قابلة للبحث. وتختم الورشة بقاعدة مهمة: التفكير النقدي "
             "ليس معناه أن ننتقد الدراسات السابقة، بل أن نبني عليها ونطورها.")

# ================================================================ 12 — strong vs weak
s = new_slide()
header(s, "⚖️", "Strong Gap vs. Weak Gap", "الفجوة القوية والفجوة الضعيفة", G_TEAL, TEAL)
rect(s, px_r, 1.75, pw, 3.85, fill=CARD, line=BORDER, line_w=1,
     shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.08, shadow=True)
rect(s, px_r, 1.75, pw, 0.12, grad=G_EMERALD, angle=0,
     shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=1.0)
textbox(s, px_r + 0.3, 1.96, pw - 0.6, 0.45,
        [P([("💪 الفجوة القوية — Strong Gap", 16, EMERALD, True)],
           align=PP_ALIGN.RIGHT)])
strong = [
    ("مدعومة بالأدلة", "تستند إلى مراجعة أدبيات حقيقية تثبت الغياب"),
    ("محددة وقابلة للقياس", "موضوع + فئة + سياق + إطار زمني واضح"),
    ("لها قيمة علمية وعملية", "سدّها يغيّر فهماً علمياً أو ممارسة واقعية"),
    ("قابلة للمعالجة", "يمكن تصميم دراسة واقعية وقابلة للتنفيذ لسدّها"),
    ("مرتبطة بسياق محدد", "بيئة أو مجتمع أو قطاع معيّن — لا عموميات"),
]
sparas = []
for t, dsc in strong:
    sparas.append(P([("✔  ", 13, EMERALD, True), (t, 13, INK, True),
                     ("  —  " + dsc, 11.5, MUTED)],
                    align=PP_ALIGN.RIGHT, space_after=9, line=1.1))
textbox(s, px_r + 0.35, 2.55, pw - 0.7, 3.0, sparas)

rect(s, px_l, 1.75, pw, 3.85, fill=CARD, line=BORDER, line_w=1,
     shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.08, shadow=True)
rect(s, px_l, 1.75, pw, 0.12, grad=G_ROSE, angle=0,
     shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=1.0)
textbox(s, px_l + 0.3, 1.96, pw - 0.6, 0.45,
        [P([("⚠️ الفجوة الضعيفة — Weak Gap", 16, ROSE, True)],
           align=PP_ALIGN.RIGHT)])
weak = [
    ("عامة جداً وغير واضحة", "بلا موضوع محدد أو سياق أو حدود"),
    ("غير مدعومة بمراجعة كافية", "انطباع شخصي وليس مسحاً منهجياً"),
    ("«لم يدرسها أحد» بلا دليل", "ادعاء يسهل دحضه بدراسة واحدة مضادة"),
    ("لا تضيف قيمة للمعرفة", "سدّها لا يغيّر شيئاً يُذكر علمياً أو عملياً"),
    ("تكرار لدراسات سابقة", "إعادة إنتاج مقنَّعة وليست بحثاً جديداً"),
]
wparas = []
for t, dsc in weak:
    wparas.append(P([("✘  ", 13, ROSE, True), (t, 13, INK, True),
                     ("  —  " + dsc, 11.5, MUTED)],
                    align=PP_ALIGN.RIGHT, space_after=9, line=1.1))
textbox(s, px_l + 0.35, 2.55, pw - 0.7, 3.0, wparas)

rect(s, M, 5.8, CW, 1.0, fill=CARD, line=ORANGE, line_w=1.2,
     shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.15, shadow=True)
textbox(s, M + 0.3, 5.9, CW - 0.6, 0.85,
        [P([("🧪 المثال المقارن من الورشة —  ", 12.5, ORANGE, True),
            ("ضعيفة: ", 12.5, ROSE, True),
            ("«الصحة النفسية لم تُدرس بشكل كافٍ»  —  عامة، بلا فئة ولا سياق ولا زمن",
             12, INK)], align=PP_ALIGN.RIGHT, space_after=4),
         P([("قوية: ", 12.5, EMERALD, True),
            ("«لا توجد دراسة حول تأثير الدراسة عن بُعد على القلق عند طلاب الجامعات العربية بعد 2020»  —  واضحة وقابلة للبحث",
             12, INK, True)], align=PP_ALIGN.RIGHT)])
add_notes(s, "ليست كل فجوة تعتبر قوية — كما نبهت الورشة. الفجوة القوية "
             "(Strong Research Gap) تكون: مدعومة بالأدلة من مراجعة حقيقية "
             "للأدبيات، محددة وقابلة للقياس، ولها قيمة علمية وعملية، إضافة "
             "إلى قابليتها للمعالجة بمنهجية واقعية وارتباطها بسياق محدد. أما "
             "الفجوة الضعيفة (Weak Gap) فتكون عامة جداً وغير واضحة. والمثال "
             "الذي ضربته الورشة يوضح الفرق تماماً: قولنا «الصحة النفسية لم "
             "تُدرس بشكل كافٍ» فجوة ضعيفة — عامة بلا حدود ويسهل دحضها. لكن "
             "قولنا «لا توجد دراسة حول تأثير الدراسة عن بعد على القلق عند "
             "طلاب الجامعات العربية بعد 2020» فجوة قوية واضحة وقابلة للبحث: "
             "فيها المتغير والفئة والسياق والزمن. احرص أن تكون صياغتك دائماً "
             "من النوع الثاني.")

# ================================================================ 13 — roadmap
s = new_slide()
header(s, "🚀", "A 7-Step Practical Roadmap", "خارطة طريق عملية: من الصفر إلى الفجوة", G_ROSE, ROSE)
steps = [
    ("حدّد مجالك بدقة", "تخصص فرعي ضيق — «التعليم الإلكتروني للمرحلة الابتدائية» لا «التعليم» عموماً", FUCHSIA, G_FUCHSIA),
    ("اجمع أحدث الدراسات", "20–30 دراسة من آخر 5 سنوات عبر Semantic Scholar وGoogle Scholar", ORANGE, G_AMBER),
    ("اقرأ الخاتمات أولاً", "أقسام حدود الدراسة والاقتراحات المستقبلية — أسرع مصدر للفجوات الموثقة", TEAL, G_TEAL),
    ("اعمل خريطة الأدبيات", "جدول يقارن: السكان، المنهج، الدولة، الزمن، أبرز النتائج لكل دراسة", VIOLET, G_VIOLET),
    ("علّم الفراغات والتناقضات", "ظلّل الخانات الفارغة والنتائج المتضاربة — هذه مواضع فجواتك المحتملة", ROSE, G_ROSE),
    ("تحقق بأدوات الذكاء الاصطناعي", "Research Rabbit وConsensus للتأكد أن الفجوة لم تُسد بدراسة حديثة", EMERALD, G_EMERALD),
    ("صُغ فجوتك بدقة", "جملة محددة قابلة للقياس: الموضوع + الفئة + السياق + الزمن", BLUE, G_BLUE),
]
col_w = (CW - 0.4) / 2
for i, (t, dsc, ac, gr) in enumerate(steps):
    col = 0 if i < 4 else 1
    row = i if i < 4 else i - 4
    x = 13.333 - M - col_w if col == 0 else M
    y = 1.78 + row * 1.26
    rect(s, x, y, col_w, 1.1, fill=CARD, line=BORDER, line_w=1,
         shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.15, shadow=True)
    nc = circle(s, x + col_w - 0.85, y + 0.21, 0.68, grad=gr, shadow=True)
    chip_text(nc, ar_num(i + 1), 18, WHITE)
    textbox(s, x + 0.25, y + 0.1, col_w - 1.25, 0.42,
            [P([(t, 14, ac, True)], align=PP_ALIGN.RIGHT)])
    textbox(s, x + 0.25, y + 0.52, col_w - 1.25, 0.52,
            [P([(dsc, 11, INK)], align=PP_ALIGN.RIGHT, line=1.1)])
x, y = M, 1.78 + 3 * 1.26
hint = rect(s, x, y, col_w, 1.1, grad=G_NAVY, angle=0,
            shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.15, shadow=True)
textbox(s, x + 0.28, y + 0.12, col_w - 0.56, 0.88,
        [P([("⏱ الزمن الواقعي: ", 12.5, AMBER, True),
            ("أسبوعان إلى أربعة أسابيع من العمل المنظّم تكفي غالباً للوصول إلى فجوة موثقة تصمد أمام أي لجنة علمية",
             11.5, WHITE)], align=PP_ALIGN.RIGHT, line=1.15)])
add_notes(s, "خارطة طريق تنفيذية تجمع كل ما سبق في مسار عملي واحد من سبع "
             "خطوات: (1) تضييق المجال إلى تخصص فرعي — يسهل حصر الأدبيات. "
             "(2) جمع 20–30 دراسة حديثة من آخر خمس سنوات. (3) البدء بقراءة "
             "الخاتمات وأقسام حدود الدراسة — كما أوصت الورشة، فهي منجم "
             "الفجوات الجاهزة. (4) بناء خريطة الأدبيات (Literature Mapping) "
             "حسب السكان والمنهج والدولة والزمن. (5) تظليل الفراغات "
             "والتناقضات — الفجوة تظهر بصرياً في الخريطة. (6) التحقق عبر "
             "أدوات الذكاء الاصطناعي (سير عمل Research Rabbit من الشريحة "
             "التاسعة) من أن الفجوة لم تُسد بدراسة أحدث. (7) الصياغة "
             "النهائية بجملة محددة قابلة للقياس. الزمن الواقعي للمسار "
             "كاملاً: من أسبوعين إلى أربعة أسابيع من العمل المنتظم.")

# ================================================================ 14 — formulation
s = new_slide()
header(s, "✍️", "Writing Your Gap Statement", "صياغة الفجوة البحثية باحترافية", G_BLUE, BLUE)
rect(s, M, 1.78, CW, 2.0, grad=G_NAVY, angle=25,
     shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.1, shadow=True)
textbox(s, M + 0.4, 1.95, CW - 0.8, 0.4,
        [P([("القالب الجاهز:  ", 13.5, AMBER, True),
            ("انسخه واملأ الفراغات الملونة", 13, tint(WHITE, 0.1))],
           align=PP_ALIGN.RIGHT)])
textbox(s, M + 0.4, 2.42, CW - 0.8, 1.25,
        [P([("«على الرغم من أن الدراسات السابقة تناولت ", 15.5, WHITE),
            ("[الموضوع X]", 15.5, AMBER, True),
            ("، إلا أن ", 15.5, WHITE),
            ("[الجانب Y]", 15.5, RGBColor(0x5E, 0xEA, 0xD4), True),
            (" لم يُدرس بعد في ", 15.5, WHITE),
            ("[السياق Z]", 15.5, RGBColor(0xFD, 0xA4, 0xAF), True),
            ("، مما يستدعي إجراء ", 15.5, WHITE),
            ("[نوع الدراسة المقترحة]", 15.5, RGBColor(0xC4, 0xB5, 0xFD), True),
            (".»", 15.5, WHITE)],
           align=PP_ALIGN.RIGHT, line=1.4)])
rect(s, M, 3.98, CW, 1.05, fill=CARD, line=TEAL, line_w=1.2,
     shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.12, shadow=True)
textbox(s, M + 0.35, 4.1, CW - 0.7, 0.85,
        [P([("✅ مثال مطبَّق بأسلوب الورشة:  ", 12.5, TEAL, True),
            ("«على الرغم من أن الدراسات السابقة تناولت التعلم الإلكتروني في الجامعات، إلا أن تأثيره على "
             "القلق عند طلاب الجامعات العربية بعد 2020 لم يُدرس بعد، مما يستدعي إجراء دراسة مختلطة "
             "(كمية ونوعية) لسدّ هذه الفجوة.»", 12.5, INK)],
           align=PP_ALIGN.RIGHT, line=1.25)])
textbox(s, M, 5.25, CW, 0.42,
        [P([("قائمة الفحص الخماسية قبل اعتماد الفجوة نهائياً:", 14, INK, True)],
           align=PP_ALIGN.RIGHT)])
checks = [
    ("موثّقة؟", "تستند لمراجعة فعلية", FUCHSIA, G_FUCHSIA),
    ("محددة؟", "موضوع وفئة وسياق وزمن", ORANGE, G_AMBER),
    ("مهمة؟", "سدّها يُحدث فرقاً", TEAL, G_TEAL),
    ("قابلة للمعالجة؟", "منهجية واقعية متاحة", VIOLET, G_VIOLET),
    ("جديدة؟", "لم تُسد بدراسة أحدث", ROSE, G_ROSE),
]
chw = (CW - 4 * 0.22) / 5
for i, (c, dsc, ac, gr) in enumerate(checks):
    x = 13.333 - M - chw - i * (chw + 0.22)
    y = 5.75
    rect(s, x, y, chw, 1.0, fill=CARD, line=BORDER, line_w=1,
         shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.18, shadow=True)
    rect(s, x, y, chw, 0.1, grad=gr, angle=0,
         shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=1.0)
    textbox(s, x + 0.1, y + 0.18, chw - 0.2, 0.4,
            [P([("✔ " + c, 13, ac, True)], align=PP_ALIGN.CENTER)])
    textbox(s, x + 0.1, y + 0.58, chw - 0.2, 0.36,
            [P([(dsc, 10, MUTED)], align=PP_ALIGN.CENTER)])
add_notes(s, "المرحلة الأخيرة: تحويل الملاحظة إلى فجوة علمية مصاغة "
             "باحترافية. القالب المعياري أربعة عناصر: (X) ما تناولته "
             "الدراسات فعلاً — يثبت اطلاعك على الأدبيات، (Y) الجانب الغائب "
             "— جوهر الفجوة، (Z) السياق المحدد — يمنحها حدوداً واقعية، ثم "
             "نوع الدراسة المقترحة — يحولها إلى خطة عمل. المثال المطبق "
             "مبني على المثال القوي الذي ذكرته الورشة (الدراسة عن بعد "
             "والقلق عند طلاب الجامعات العربية بعد 2020). وقبل الاعتماد "
             "النهائي مرر فجوتك على قائمة الفحص الخماسية: موثقة، محددة، "
             "مهمة، قابلة للمعالجة، وجديدة. إن اجتازت الخمسة فهي جاهزة "
             "لتتصدر مقدمة مقترحك البحثي وتصمد أمام المناقشة.")

# ================================================================ 15 — summary
s = new_slide(hero=True)
circle(s, -1.7, 4.3, 4.6, WHITE, 6)
circle(s, 10.8, -2.0, 4.8, WHITE, 7)
circle(s, 12.2, 5.8, 1.8, WHITE, 8)
circle(s, 1.15, 1.0, 0.26, AMBER, 90)
textbox(s, 1.5, 0.7, 10.333, 0.85,
        [P([("الخلاصة: رسائل تأخذها معك", 34, WHITE, True)], align=PP_ALIGN.CENTER)])
textbox(s, 1.5, 1.55, 10.333, 0.4,
        [P([("K E Y   T A K E A W A Y S", 12, AMBER, True)],
           align=PP_ALIGN.CENTER, rtl=False, spacing=500)])
keys = [
    ("الفجوة البحثية أساس أي بحث علمي ناجح", "هي جواز مرورك إلى الأصالة والقبول والنشر والتمويل", G_TEAL),
    ("اعرف الأنواع الستة وسؤال كل نوع", "معرفة، ممارسة، أدلة، سكان، منهجية، زمن — ولكل نوع بابه", G_AMBER),
    ("استخدم الذكاء الاصطناعي بذكاء", "ارفع، اسأل بدقة، راجع بنفسك — الأداة تقترح والباحث يقرر", G_VIOLET),
    ("اصنع فجوة قوية لا ضعيفة", "محددة، موثقة، مهمة — استخدم القالب وقائمة الفحص الخماسية", G_ROSE),
]
for i, (t, dsc, gr) in enumerate(keys):
    y = 2.15 + i * 0.98
    card = rect(s, 1.8, y, 9.73, 0.85, fill=WHITE,
                shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.2)
    set_alpha(card, 10)
    nc = circle(s, 1.8 + 9.73 - 0.75, y + 0.14, 0.57, grad=gr, shadow=True)
    chip_text(nc, ar_num(i + 1), 15, WHITE)
    textbox(s, 2.1, y + 0.05, 8.6, 0.4,
            [P([(t, 14.5, WHITE, True)], align=PP_ALIGN.RIGHT)])
    textbox(s, 2.1, y + 0.45, 8.6, 0.36,
            [P([(dsc, 11.5, tint(WHITE, 0.2))], align=PP_ALIGN.RIGHT)])
rect(s, 4.42, 6.18, 4.5, 0.045, grad=G_AMBER, angle=0)
textbox(s, 1.3, 6.35, 10.733, 0.55,
        [P([("«الباحث المتميّز ليس من يجد الإجابات فقط… بل من يطرح أسئلة لم يفكر فيها أحد من قبل»",
             15, AMBER, True)], align=PP_ALIGN.CENTER)])
textbox(s, 1.5, 6.92, 10.333, 0.4,
        [P([("شكراً لحسن استماعكم — ", 12, tint(WHITE, 0.15)),
            ("الدكتورة هناء حسين الأهيمر", 12, WHITE, True),
            ("  •  نسخة موسّعة بتصميم جديد", 11, tint(WHITE, 0.35))],
           align=PP_ALIGN.CENTER)])
add_notes(s, "الخلاصة كما وردت في ختام الورشة: الفجوة البحثية "
             "(Research Gap) هي أساس أي بحث علمي ناجح. تذكّر الرسائل "
             "الأربع: (1) الفجوة أساس البحث وجواز مرورك للأصالة والنشر "
             "والتمويل. (2) الأنواع الستة إطارك العملي — لكل نوع سؤاله "
             "المفتاحي وبابه الخاص. (3) استخدم أدوات الذكاء الاصطناعي "
             "بالطريقة الصحيحة: ارفع الملفات، اسأل بدقة، ثم راجع التحليل "
             "بنفسك قبل اعتماده. (4) اجعل فجوتك قوية: محددة وموثقة ومهمة "
             "وقابلة للمعالجة. وتختم الورشة بالرسالة الأجمل: الباحث "
             "المتميز ليس الشخص الذي يجد الإجابات فقط، لكنه الشخص الذي "
             "يطرح أسئلة لم يفكر فيها أحد من قبل. بالتوفيق في رحلتك "
             "البحثية!")

# ================================================================ save
core = prs.core_properties
core.title = "الفجوات البحثية — Research Gaps (نسخة موسّعة)"
core.author = "Dr. Hana Hossen Elahemer (original content)"
core.subject = "دليل شامل لاكتشاف الفجوات البحثية — من الشرح الكامل للورشة"
core.comments = "Rebuilt & expanded from the workshop video + full narration transcript"

OUT = "Research-Gaps-الفجوات-البحثية.pptx"
prs.save(OUT)
print(f"Saved: {OUT} — {PAGE[0]} slides")
