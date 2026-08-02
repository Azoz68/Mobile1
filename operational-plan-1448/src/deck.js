/* الخطة التشغيلية ١٤٤٨هـ — نظام بصري واحد: "حقل النقاط" المستوحى من شعار وزارة التعليم
   التخطيط: شبكة bento، طباعة ضخمة، أرقام شبحية، إيقاع داكن/فاتح. */
const pptxgen = require('pptxgenjs');
const path = require('path');
const D = require('./data');
const D2 = require('./data2');
const D3 = require('./data3');

const A = (f) => path.resolve(__dirname, '../assets', f);
const ICON = (n, c) => path.resolve(__dirname, '../assets/icons', `${n}_${c}.png`);

/* ---------------- tokens ---------------- */
const GREEN = '095242', GREEN_DK = '04352B', GREEN_LT = '0C6553';
const TEAL = '0089A1', GOLD = 'C9A45C';
const INK = '0A1F19', BODY = '34473F', MUTED = '8A9A93';
const LINE = 'E3EDE8', MINT = 'F2F8F5', ICE = 'EAF5F8';
const OLIVE = 'D7E4BD', OLIVE_TX = '46551F';
const GHOST = 'F0F6F2';
const GHOST_D = '0C6553';
const W_ = 'FFFFFF';

const FONT = 'Tajawal';
const XB = 'Tajawal ExtraBold';

const PW = 13.333, PH = 7.5, M = 0.5;
const CW = PW - 2 * M;
const GUT = 0.22;

const pptx = new pptxgen();
pptx.defineLayout({ name: 'W', width: PW, height: PH });
pptx.layout = 'W';
pptx.rtlMode = true;
pptx.author = 'وزارة التعليم';
pptx.title = D.meta.docTitle;

/* ---------------- helpers ---------------- */
const AD = '٠١٢٣٤٥٦٧٨٩';
const arNum = (n) => String(n).split('').map((d) => AD[+d] ?? d).join('');
const pad2 = (n) => arNum(String(n).padStart(2, '0'));

function AR(o = {}) {
  return Object.assign(
    { fontFace: FONT, lang: 'ar-SA', rtlMode: true, align: 'right', valign: 'top', margin: 0, color: BODY, fontSize: 11 },
    o
  );
}
const T = (s, str, o) => s.addText(str, AR(o));

function card(s, x, y, w, h, o = {}) {
  s.addShape('roundRect', Object.assign({ x, y, w, h, fill: { color: W_ }, line: { color: LINE, width: 0.75 }, rectRadius: 0.09 }, o));
}
const soft = (op = 0.07) => ({ type: 'outer', color: '0C3A2E', opacity: op, blur: 6, offset: 1.5, angle: 90 });
const deep = (op = 0.24) => ({ type: 'outer', color: '062A21', opacity: op, blur: 10, offset: 2.5, angle: 90 });

function icon(s, name, color, x, y, size) {
  s.addImage({ path: ICON(name, color), x, y, w: size, h: size });
}
function iconDisc(s, name, x, y, d, { bg = MINT, fg = 'green', border = LINE } = {}) {
  s.addShape('ellipse', { x, y, w: d, h: d, fill: { color: bg }, line: border ? { color: border, width: 0.75 } : { type: 'none' } });
  icon(s, name, fg, x + d * 0.26, y + d * 0.26, d * 0.48);
}
function chip(s, x, y, w, h, txt, o = {}) {
  s.addShape('roundRect', { x, y, w, h, fill: { color: o.fill || GREEN }, line: o.line || { type: 'none' }, rectRadius: o.r ?? 0.07 });
  T(s, txt, { x, y: y - 0.01, w, h, align: 'center', valign: 'middle', color: o.color || W_, bold: true, fontSize: o.fontSize || 10 });
}
function ghost(s, txt, x, y, w, h, { size = 150, color = GHOST, align = 'right' } = {}) {
  T(s, txt, { x, y, w, h, align, valign: 'middle', fontSize: size, fontFace: XB, color });
}

let pageNo = 0;
function slide(bg) {
  const s = pptx.addSlide();
  pageNo++;
  if (bg !== 'none') s.addImage({ path: A(bg || 'bg_content.jpg'), x: 0, y: 0, w: PW, h: PH });
  return s;
}
function footer(s, label) {
  T(s, label || D.meta.footer, { x: PW - M - 5.2, y: 7.09, w: 5.2, h: 0.3, fontSize: 8, color: MUTED, align: 'right' });
  T(s, pad2(pageNo), { x: M, y: 7.09, w: 0.9, h: 0.3, fontSize: 9, color: MUTED, align: 'left', bold: true, fontFace: XB });
}
function head(s, kicker, title) {
  s.addImage({ path: A('moe_green.png'), x: M, y: 0.3, w: 0.88, h: 0.68 });
  T(s, kicker, { x: PW - M - 7.6, y: 0.34, w: 7.6, h: 0.26, fontSize: 9.5, bold: true, color: TEAL, charSpacing: 1 });
  T(s, title, { x: PW - M - 9.4, y: 0.6, w: 9.4, h: 0.46, fontSize: 23, bold: true, color: INK, fontFace: XB });
}
function label(s, x, y, w, str, o = {}) {
  s.addShape('rect', { x: x + w - 0.09, y: y + 0.1, w: 0.09, h: 0.09, fill: { color: o.dot || TEAL }, line: { type: 'none' } });
  T(s, str, { x, y, w: w - 0.2, h: 0.3, fontSize: o.fontSize || 12.5, bold: true, color: o.color || GREEN, valign: 'middle' });
}
function rtable(s, { x, y, w, colW, rows, opts = {} }) {
  s.addTable(rows.map((r) => r.slice().reverse()), Object.assign({
    x, y, w, colW: colW.slice().reverse(),
    border: { pt: 0.5, color: LINE }, margin: 0.045,
    valign: 'middle', align: 'center', fontFace: FONT, autoPage: false,
  }, opts));
}
const hc = (t, o = {}) => ({ text: t, options: Object.assign({ fill: { color: GREEN }, color: W_, bold: true, fontSize: 9.4, align: 'center', valign: 'middle', fontFace: FONT, rtlMode: true, lang: 'ar-SA' }, o) });
const c_ = (t, o = {}) => ({ text: t, options: Object.assign({ color: BODY, fontSize: 9, align: 'center', valign: 'middle', fontFace: FONT, rtlMode: true, lang: 'ar-SA' }, o) });
const zebra = (i) => ({ color: i % 2 ? MINT : W_ });

/* ============================================================ 01 — COVER */
(function () {
  const s = slide('bg_cover.jpg');
  s.addImage({ path: A('moe_white.png'), x: PW / 2 - 0.82, y: 0.66, w: 1.64, h: 1.268 });
  const dy = 2.2;
  s.addShape('line', { x: PW / 2 - 1.55, y: dy, w: 1.3, h: 0, line: { color: GOLD, width: 1 } });
  s.addShape('line', { x: PW / 2 + 0.25, y: dy, w: 1.3, h: 0, line: { color: GOLD, width: 1 } });
  s.addShape('diamond', { x: PW / 2 - 0.06, y: dy - 0.06, w: 0.12, h: 0.12, fill: { color: GOLD }, line: { type: 'none' } });
  T(s, 'الخطة التشغيلية', { x: 1.2, y: 2.4, w: PW - 2.4, h: 1.2, align: 'center', valign: 'middle', fontSize: 56, color: W_, fontFace: XB });
  T(s, 'للعام الدراسي ١٤٤٨هـ', { x: 1.2, y: 3.6, w: PW - 2.4, h: 0.56, align: 'center', valign: 'middle', fontSize: 24, color: GOLD, bold: true });
  const pw = 2.15;
  s.addShape('roundRect', { x: PW / 2 - pw / 2, y: 4.36, w: pw, h: 0.5, fill: { color: W_, transparency: 88 }, line: { color: GOLD, width: 1 }, rectRadius: 0.25 });
  T(s, 'جميع المراحل', { x: PW / 2 - pw / 2, y: 4.34, w: pw, h: 0.5, align: 'center', valign: 'middle', fontSize: 15, bold: true, color: W_ });
  const fw = 7.7, fx = PW / 2 - fw / 2, fy = 5.26;
  s.addShape('roundRect', { x: fx, y: fy, w: fw, h: 1.16, fill: { color: W_, transparency: 91 }, line: { color: W_, width: 0.75, transparency: 55 }, rectRadius: 0.1 });
  [[D.meta.schoolField, 0.14], [D.meta.principalField, 0.6]].forEach(([lbl, dyy]) => {
    T(s, [
      { text: lbl + '  ', options: { bold: true, color: W_, fontSize: 14 } },
      { text: '……………………………………', options: { color: 'D6E6E0', fontSize: 13 } },
    ], { x: fx + 0.45, y: fy + dyy, w: fw - 0.9, h: 0.44, valign: 'middle' });
  });
  T(s, D.meta.file, { x: 1.2, y: 6.76, w: PW - 2.4, h: 0.38, align: 'center', fontSize: 11.5, color: 'BCD4CC' });
})();

/* ============================================================ 02 — TOC */
(function () {
  const s = slide();
  head(s, 'دليل العرض', 'فهرس المحتويات');
  footer(s);
  const cols = 3, cw = (CW - GUT * 2) / cols, rh = 0.98, y0 = 1.5;
  D.toc.forEach((t, i) => {
    const r = Math.floor(i / cols), c = i % cols;
    const x = PW - M - cw - c * (cw + GUT), y = y0 + r * rh;
    ghost(s, String(i + 1).padStart(2, '0'), x + cw - 1.62, y - 0.02, 1.5, rh, { size: 30, color: GHOST, align: 'right' });
    T(s, pad2(i + 1), { x: x + cw - 0.74, y, w: 0.64, h: rh, align: 'right', valign: 'middle', fontSize: 12, bold: true, color: TEAL, fontFace: XB });
    T(s, t, { x, y, w: cw - 0.88, h: rh, valign: 'middle', fontSize: 13.5, bold: true, color: INK });
    s.addShape('line', { x, y: y + rh - 0.08, w: cw - 0.1, h: 0, line: { color: LINE, width: 0.75 } });
  });
})();

/* ============================================================ PART DIVIDERS */
function divider(kicker, num, title, items) {
  const s = slide('bg_divider.jpg');
  pageNo--;
  s.addImage({ path: A('moe_white.png'), x: PW - M - 1.15, y: 0.5, w: 1.15, h: 0.889 });
  ghost(s, num, M + 0.15, 1.35, 4.4, 3.6, { size: 165, color: GHOST_D, align: 'left' });
  T(s, kicker, { x: PW - M - 7.4, y: 2.28, w: 7.4, h: 0.32, fontSize: 12, bold: true, color: GOLD, charSpacing: 1.5 });
  T(s, title, { x: PW - M - 8.8, y: 2.62, w: 8.8, h: 1.0, fontSize: 38, color: W_, fontFace: XB, valign: 'middle' });
  s.addShape('line', { x: PW - M - 1.9, y: 3.8, w: 1.9, h: 0, line: { color: GOLD, width: 1.25 } });
  const per = Math.ceil(items.length / 2);
  items.forEach((it, i) => {
    const c = Math.floor(i / per), r = i % per;
    const x = PW - M - 3.9 - c * 4.15, y = 4.1 + r * 0.44;
    s.addShape('rect', { x: x + 3.9 - 0.1, y: y + 0.13, w: 0.1, h: 0.1, fill: { color: GOLD }, line: { type: 'none' } });
    T(s, it, { x, y, w: 3.7, h: 0.38, fontSize: 11.5, color: 'D5E7E1', valign: 'middle' });
  });
}

divider('الجزء الأول', '01', 'قراءة الواقع المدرسي', [
  'المقدمة', 'فريق إعداد الخطة', 'البيانات الإحصائية', 'بيانات الطلاب والمعلمين',
  'الرؤية والرسالة والقيم', 'مرتكزات ومصادر الخطة', 'أولويات التقويم وتحليل SWOT', 'القضايا الملحة للمدرسة',
]);

/* ============================================================ 03 — INTRO */
(function () {
  const s = slide();
  head(s, 'الجزء الأول · قراءة الواقع', 'المقدمة');
  footer(s, 'المقدمة');
  const rx = 5.5, rw = PW - M - rx;
  ghost(s, '٠١', M, 1.12, 2.2, 1.5, { size: 88, color: GHOST, align: 'left' });
  card(s, rx, 1.22, rw, 1.42, { fill: { color: ICE }, line: { color: 'CFE6EC', width: 0.75 } });
  icon(s, 'quote', 'teal', rx + rw - 0.68, 1.42, 0.36);
  T(s, D.intro.quote, { x: rx + 0.36, y: 1.22, w: rw - 1.2, h: 1.42, valign: 'middle', fontSize: 13, bold: true, color: '0B4A56', lineSpacingMultiple: 1.28 });
  T(s, D.intro.paras.map((p) => ({ text: p, options: { paraSpaceAfter: 13, breakLine: true } })),
    { x: rx, y: 2.86, w: rw, h: 3.85, fontSize: 12, color: BODY, lineSpacingMultiple: 1.34 });
  const lw = 4.6, lx = M;
  D.intro.cards.forEach((c, i) => {
    const y = 1.86 + i * 1.72, hero = i === 2;
    card(s, lx, y, lw, 1.5, hero ? { fill: { color: GREEN }, line: { type: 'none' }, shadow: deep() } : { shadow: soft() });
    if (hero) s.addImage({ path: A('dots_white.png'), x: lx + 0.12, y: y + 0.72, w: 1.5, h: 1.0, transparency: 64 });
    T(s, c.n, { x: lx + lw - 0.95, y: y + 0.14, w: 0.7, h: 0.46, align: 'center', fontSize: 20, fontFace: XB, color: hero ? GOLD : TEAL });
    T(s, c.t, { x: lx + 0.32, y: y + 0.16, w: lw - 1.3, h: 0.42, fontSize: 15, bold: true, color: hero ? W_ : INK, valign: 'middle' });
    T(s, c.d, { x: lx + 0.32, y: y + 0.66, w: lw - 0.64, h: 0.72, fontSize: 11, color: hero ? 'D2E4DD' : BODY, lineSpacingMultiple: 1.22 });
  });
})();

/* ============================================================ TEAM (used twice) */
function teamSlide() {
  const s = slide();
  head(s, 'الجزء الأول · قراءة الواقع', 'فريق إعداد الخطة');
  footer(s, 'فريق إعداد الخطة');
  card(s, 1.6, 0.42, 2.65, 0.44, { fill: { color: MINT }, rectRadius: 0.22 });
  T(s, D.team.badge, { x: 1.6, y: 0.41, w: 2.65, h: 0.44, align: 'center', valign: 'middle', fontSize: 9.5, bold: true, color: GREEN });
  T(s, D.team.intro, { x: 3.75, y: 1.13, w: CW - 3.25, h: 0.6, fontSize: 10.5, color: BODY, lineSpacingMultiple: 1.22 });
  const tx = 3.75, tw = PW - M - tx;
  const rows = [[hc('م'), hc('الدور'), hc('المهام والمسؤوليات')]];
  D.team.roles.forEach((r, i) => rows.push([
    c_(r[0], { fontSize: 9, fill: zebra(i) }),
    c_(r[1], { bold: true, color: GREEN_DK, fontSize: 9, align: 'right', fill: zebra(i) }),
    c_(r[2], { fontSize: 8.7, align: 'right', fill: zebra(i) }),
  ]));
  rtable(s, { x: tx, y: 1.8, w: tw, colW: [0.42, 2.1, tw - 2.52], rows, opts: { rowH: [0.34, 0.55, 0.55, 0.62, 0.55, 0.62, 0.62, 0.62, 0.62] } });
  const lw = 3.0;
  label(s, M, 1.13, lw, 'مهام الفريق الرئيسية');
  const di = ['chart', 'target', 'users', 'refresh'];
  D.team.duties.forEach((d, i) => {
    const y = 1.62 + i * 1.34;
    card(s, M, y, lw, 1.18, { shadow: soft(0.055) });
    icon(s, di[i], 'green', M + lw - 0.5, y + 0.15, 0.28);
    T(s, d.t, { x: M + 0.2, y: y + 0.11, w: lw - 0.78, h: 0.36, fontSize: 10.5, bold: true, color: GREEN_DK, valign: 'middle' });
    T(s, d.d, { x: M + 0.2, y: y + 0.5, w: lw - 0.4, h: 0.62, fontSize: 8.6, color: MUTED, lineSpacingMultiple: 1.14 });
  });
}
teamSlide();

/* ============================================================ 05 — STAFF PARTICIPATION */
(function () {
  const s = slide();
  head(s, 'الجزء الأول · قراءة الواقع', 'مشاركة الكادر في إعداد الخطة');
  footer(s, 'فريق إعداد الخطة');
  card(s, M, 1.18, CW, 0.76, { fill: { color: ICE }, line: { color: 'CFE6EC', width: 0.75 } });
  icon(s, 'info', 'teal', PW - M - 0.56, 1.4, 0.3);
  T(s, D.staffTasks.note, { x: M + 0.26, y: 1.18, w: CW - 1.02, h: 0.76, valign: 'middle', fontSize: 9.8, color: '0B4A56', lineSpacingMultiple: 1.2 });
  const tw = (CW - 0.28) / 2;
  const mk = (from, x) => {
    const rows = [[hc('م', { fontSize: 8.5 }), hc('المهمة في الخطة التشغيلية', { fontSize: 8.5 }), hc('اسم المعلم', { fontSize: 8.5 }), hc('التوقيع', { fontSize: 8.5 })]];
    for (let i = from; i < from + 10; i++) {
      rows.push([c_(arNum(i + 1), { fontSize: 8, fill: zebra(i) }), c_(D.staffTasks.tasks[i], { fontSize: 7.9, align: 'right', fill: zebra(i) }), c_('', { fill: zebra(i) }), c_('', { fill: zebra(i) })]);
    }
    rtable(s, { x, y: 2.14, w: tw, colW: [0.36, tw - 2.26, 1.05, 0.85], rows, opts: { rowH: [0.3, ...Array(10).fill(0.44)] } });
  };
  mk(0, PW - M - tw); mk(10, M);
})();

/* ============================================================ 06 — SCHOOL STATS */
(function () {
  const s = slide();
  head(s, 'الجزء الأول · قراءة الواقع', 'البيانات الإحصائية');
  footer(s, 'البيانات الإحصائية');
  label(s, PW - M - 3.3, 1.14, 3.3, 'البيانات الأساسية للمدرسة');
  rtable(s, {
    x: M, y: 1.54, w: CW, colW: Array(9).fill(CW / 9),
    rows: [D.stats.basicHead.map((h) => hc(h, { fontSize: 8.7 })), D.stats.basicHead.map(() => c_('…………', { color: MUTED }))],
    opts: { rowH: [0.34, 0.48] },
  });
  label(s, PW - M - 3.3, 2.62, 3.3, 'الهيئة الإدارية');
  const admin = [D.stats.adminHead.map((h) => hc(h, { fontSize: 8.7 }))];
  D.stats.adminRows.forEach((r, i) => admin.push([c_(r, { bold: true, color: GREEN_DK }), ...Array(5).fill(0).map(() => c_(''))].map((c) => { c.options.fill = zebra(i); return c; })));
  rtable(s, { x: M, y: 3.02, w: CW, colW: [1.15, 2.6, 2.2, 2.1, 2.2, CW - 10.25], rows: admin, opts: { rowH: [0.5, 0.4, 0.4, 0.4] } });
  const heroW = 4.1, gap = 0.24, restW = (CW - heroW - gap * 3) / 3, y = 5.2, h = 1.5;
  const items = D.stats.cards;
  const hx = PW - M - heroW;
  card(s, hx, y, heroW, h, { fill: { color: GREEN }, line: { type: 'none' }, shadow: deep(0.22) });
  s.addImage({ path: A('arc_white.png'), x: hx + heroW - 1.35, y: y - 0.15, w: 1.7, h: 1.7, transparency: 70 });
  T(s, '…………', { x: hx + 0.35, y: y + 0.26, w: heroW - 1.4, h: 0.55, fontSize: 26, color: W_, fontFace: XB });
  T(s, items[0], { x: hx + 0.35, y: y + 0.9, w: heroW - 1.4, h: 0.4, fontSize: 13, bold: true, color: 'CFE2DB' });
  items.slice(1).forEach((t, i) => {
    const cx = hx - gap - restW - i * (restW + gap);
    card(s, cx, y, restW, h, { shadow: soft() });
    T(s, '…………', { x: cx + 0.28, y: y + 0.3, w: restW - 0.56, h: 0.5, fontSize: 19, color: GREEN, fontFace: XB });
    T(s, t, { x: cx + 0.28, y: y + 0.9, w: restW - 0.56, h: 0.4, fontSize: 12, bold: true, color: BODY });
  });
})();

/* ============================================================ 07 — STUDENTS & TEACHERS */
(function () {
  const s = slide();
  head(s, 'الجزء الأول · قراءة الواقع', 'بيانات الطلاب والمعلمين');
  footer(s, 'بيانات الطلاب والمعلمين');
  const S = D.students;
  label(s, PW - M - 3.5, 1.1, 3.5, 'أعداد الطلاب حسب الصف');
  const g = [S.gradesHead.map((h) => hc(h, { fontSize: 8.7 }))];
  S.gradesRows.forEach((r, i) => g.push([c_(r, { bold: true, color: GREEN_DK }), ...Array(7).fill(0).map(() => c_(''))].map((c) => { c.options.fill = zebra(i); return c; })));
  rtable(s, { x: M, y: 1.48, w: CW, colW: [1.6, ...Array(6).fill((CW - 2.95) / 6), 1.35], rows: g, opts: { rowH: [0.32, 0.38, 0.38] } });
  label(s, PW - M - 3.5, 2.74, 3.5, 'معلمو المدرسة حسب التخصص');
  const sp = [S.specHead.map((h) => hc(h, { fontSize: 8.1 }))];
  S.specRows.forEach((r, i) => sp.push([c_(r, { bold: true, color: GREEN_DK, fontSize: 8.4 }), ...Array(9).fill(0).map(() => c_(''))].map((c) => { c.options.fill = zebra(i); return c; })));
  rtable(s, { x: M, y: 3.12, w: CW, colW: [1.5, ...Array(8).fill((CW - 2.65) / 8), 1.15], rows: sp, opts: { rowH: [0.36, 0.38, 0.38] } });
  label(s, PW - M - 3.5, 4.42, 3.5, 'شاغلو الوظائف الفنية والإدارية');
  rtable(s, {
    x: M, y: 4.8, w: CW, colW: [1.25, ...Array(11).fill((CW - 2.25) / 11), 1.0],
    rows: [S.jobsHead.map((h) => hc(h, { fontSize: 7.5 })), [c_(S.jobsRow, { bold: true, color: GREEN_DK, fontSize: 8.4 }), ...Array(12).fill(0).map(() => c_(''))]],
    opts: { rowH: [0.5, 0.38] },
  });
  const nw = (CW - 0.28) / 2, ny = 5.94;
  card(s, PW - M - nw, ny, nw, 1.0, { fill: { color: GREEN }, line: { type: 'none' }, shadow: deep(0.2) });
  icon(s, 'check', 'white', PW - M - 0.6, ny + 0.16, 0.3);
  T(s, S.noteA.t, { x: PW - M - nw + 0.26, y: ny + 0.08, w: nw - 0.95, h: 0.32, fontSize: 11, bold: true, color: W_ });
  T(s, S.noteA.d, { x: PW - M - nw + 0.26, y: ny + 0.4, w: nw - 0.95, h: 0.56, fontSize: 8.6, color: 'CFE2DB', lineSpacingMultiple: 1.12 });
  card(s, M, ny, nw, 1.0, { shadow: soft() });
  icon(s, 'info', 'green', M + nw - 0.6, ny + 0.16, 0.3);
  T(s, S.noteB.t, { x: M + 0.26, y: ny + 0.08, w: nw - 0.95, h: 0.32, fontSize: 11, bold: true, color: GREEN_DK });
  T(s, S.noteB.d, { x: M + 0.26, y: ny + 0.4, w: nw - 0.95, h: 0.56, fontSize: 8.6, color: MUTED, lineSpacingMultiple: 1.12 });
})();

/* ============================================================ 08 — VISION / MISSION / VALUES */
(function () {
  const s = slide();
  head(s, 'الجزء الأول · قراءة الواقع', 'الرؤية والرسالة والقيم');
  footer(s, 'الرؤية · الرسالة · القيم');
  const cw = (CW - 0.3) / 2, y0 = 1.28, hh = 2.5;
  card(s, PW - M - cw, y0, cw, hh, { fill: { color: GREEN }, line: { type: 'none' }, shadow: deep(0.26) });
  s.addImage({ path: A('arc_white.png'), x: PW - M - cw - 0.35, y: y0 + hh - 1.75, w: 2.1, h: 2.1, transparency: 74 });
  iconDisc(s, 'eye', PW - M - 0.98, y0 + 0.3, 0.64, { bg: W_, fg: 'green', border: null });
  T(s, 'الرؤية', { x: PW - M - cw + 0.42, y: y0 + 0.32, w: cw - 1.6, h: 0.58, fontSize: 22, color: W_, fontFace: XB, valign: 'middle' });
  T(s, '«' + D.vmv.vision + '»', { x: PW - M - cw + 0.46, y: y0 + 1.06, w: cw - 0.95, h: hh - 1.3, fontSize: 13.5, color: 'E4F0EC', lineSpacingMultiple: 1.36 });
  card(s, M, y0, cw, hh, { line: { color: GREEN, width: 1 }, shadow: soft() });
  iconDisc(s, 'target', M + cw - 0.98, y0 + 0.3, 0.64);
  T(s, 'الرسالة', { x: M + 0.42, y: y0 + 0.32, w: cw - 1.6, h: 0.58, fontSize: 22, color: GREEN_DK, fontFace: XB, valign: 'middle' });
  T(s, '«' + D.vmv.mission + '»', { x: M + 0.46, y: y0 + 1.06, w: cw - 0.95, h: hh - 1.3, fontSize: 13, color: BODY, lineSpacingMultiple: 1.34 });
  label(s, PW - M - 2.0, 4.14, 2.0, 'القيم', { fontSize: 14 });
  const vw = (CW - 5 * 0.24) / 6;
  D.vmv.values.forEach((v, i) => {
    const x = PW - M - vw - i * (vw + 0.24), y = 4.64;
    card(s, x, y, vw, 1.82, { shadow: soft(0.06) });
    iconDisc(s, v.icon, x + vw / 2 - 0.32, y + 0.3, 0.64);
    T(s, v.t, { x: x + 0.05, y: y + 1.1, w: vw - 0.1, h: 0.52, align: 'center', valign: 'middle', fontSize: 13, bold: true, color: INK });
  });
})();

/* ============================================================ 09 — PILLARS & SOURCES */
(function () {
  const s = slide();
  head(s, 'الجزء الأول · قراءة الواقع', 'مرتكزات ومصادر بناء الخطة');
  footer(s, 'مرتكزات ومصادر الخطة');
  const rx = 5.65, rw = PW - M - rx;
  label(s, PW - M - 3.0, 1.1, 3.0, 'مرتكزات بناء الخطة');
  T(s, D.pillars.introA, { x: rx, y: 1.46, w: rw, h: 0.32, fontSize: 9.6, color: MUTED });
  const pw = (rw - 0.24) / 2, ph = 1.1;
  D.pillars.items.forEach((p, i) => {
    const r = Math.floor(i / 2), c = i % 2;
    const x = PW - M - pw - c * (pw + 0.24), y = 1.88 + r * (ph + 0.2);
    card(s, x, y, pw, ph, { shadow: soft(0.055) });
    T(s, '٠' + arNum(i + 1), { x: x + pw - 0.74, y: y + 0.15, w: 0.58, h: 0.36, align: 'center', valign: 'middle', fontSize: 13, color: TEAL, fontFace: XB });
    T(s, p.t, { x: x + 0.2, y: y + 0.14, w: pw - 0.94, h: 0.4, fontSize: 10.6, bold: true, color: GREEN_DK, valign: 'middle' });
    T(s, p.d, { x: x + 0.2, y: y + 0.58, w: pw - 0.4, h: 0.44, fontSize: 8.8, color: MUTED });
  });
  const lw = 4.75;
  label(s, M + lw - 3.0, 1.1, 3.0, 'مصادر بناء الخطة');
  T(s, D.pillars.introB, { x: M, y: 1.46, w: lw, h: 0.32, fontSize: 9.6, color: MUTED });
  const rows = [[hc('م', { fontSize: 8.7 }), hc('المصدر', { fontSize: 8.7 })]];
  D.pillars.sources.forEach((src, i) => rows.push([c_(arNum(i + 1), { fontSize: 8.6, fill: zebra(i) }), c_(src, { fontSize: 8.8, align: 'right', fill: zebra(i) })]));
  rtable(s, { x: M, y: 1.88, w: lw, colW: [0.42, lw - 0.42], rows, opts: { rowH: [0.32, ...Array(8).fill(0.55)] } });
})();

/* ============================================================ 10 — PRIORITIES */
(function () {
  const s = slide();
  head(s, 'الجزء الأول · قراءة الواقع', 'ترتيب أولويات الخطة حسب مجالات التقويم');
  footer(s, 'أولويات مجالات التقويم');
  const cw = (CW - 0.28) / 2;
  const pos = [[PW - M - cw, 1.2, 1.78], [M, 1.2, 1.78], [PW - M - cw, 3.14, 1.44], [M, 3.14, 1.44]];
  D.priorities.domains.forEach((d, i) => {
    const [x, y, hh] = pos[i];
    card(s, x, y, cw, hh, { shadow: soft(0.055) });
    s.addShape('roundRect', { x: x + 0.13, y: y + 0.12, w: cw - 0.26, h: 0.4, fill: { color: GREEN }, line: { type: 'none' }, rectRadius: 0.07 });
    s.addShape('ellipse', { x: x + cw - 0.49, y: y + 0.17, w: 0.3, h: 0.3, fill: { color: W_ }, line: { type: 'none' } });
    T(s, d.n, { x: x + cw - 0.49, y: y + 0.155, w: 0.3, h: 0.3, align: 'center', valign: 'middle', fontSize: 11, bold: true, color: GREEN });
    T(s, d.t, { x: x + 0.3, y: y + 0.12, w: cw - 0.85, h: 0.4, valign: 'middle', fontSize: 12, bold: true, color: W_ });
    d.rows.forEach((r, j) => {
      const ry = y + 0.62 + j * 0.4;
      T(s, r.d, { x: x + 1.72, y: ry, w: cw - 1.95, h: 0.4, fontSize: 8.2, color: BODY, valign: 'middle', lineSpacingMultiple: 1.02 });
      chip(s, x + 0.86, ry + 0.055, 0.78, 0.29, r.c, { fill: MINT, color: GREEN_DK, fontSize: 8, r: 0.06, line: { color: LINE, width: 0.5 } });
      T(s, r.v, { x: x + 0.13, y: ry + 0.05, w: 0.66, h: 0.29, align: 'center', valign: 'middle', fontSize: 9, bold: true, color: r.v === '……' ? MUTED : TEAL });
    });
  });
  const my = 4.84;
  card(s, PW - M - cw, my, cw, 2.02, { fill: { color: GREEN }, line: { type: 'none' }, shadow: deep(0.2) });
  s.addImage({ path: A('dots_white.png'), x: PW - M - cw + 0.12, y: my + 0.9, w: 1.5, h: 1.0, transparency: 68 });
  icon(s, 'listchecks', 'white', PW - M - 0.6, my + 0.18, 0.3);
  T(s, D.priorities.method.t, { x: PW - M - cw + 0.3, y: my + 0.14, w: cw - 1.0, h: 0.4, fontSize: 12.5, bold: true, color: W_, valign: 'middle' });
  T(s, D.priorities.method.d, { x: PW - M - cw + 0.3, y: my + 0.6, w: cw - 0.6, h: 1.28, fontSize: 9.8, color: 'D2E4DD', lineSpacingMultiple: 1.26 });
  label(s, M + cw - 2.2, my - 0.02, 2.2, 'منحنى الأولويات');
  const bw = (cw - 3 * 0.18) / 4;
  D.priorities.curve.forEach((cv, i) => {
    const bh = 0.55 + i * 0.32, x = M + cw - bw - i * (bw + 0.18), yb = my + 2.02 - 0.42 - bh;
    s.addShape('roundRect', { x, y: yb, w: bw, h: bh, fill: { color: i === 0 ? TEAL : GREEN }, line: { type: 'none' }, rectRadius: 0.05 });
    T(s, arNum(i + 1), { x, y: yb + 0.03, w: bw, h: 0.32, align: 'center', fontSize: 12, bold: true, color: W_ });
    T(s, cv, { x: x - 0.09, y: my + 2.02 - 0.38, w: bw + 0.18, h: 0.38, align: 'center', fontSize: 8.6, bold: true, color: BODY });
  });
})();

/* ============================================================ 11 — SWOT */
(function () {
  const s = slide();
  head(s, 'الجزء الأول · قراءة الواقع', 'تحليل واقع المدرسة (SWOT)');
  footer(s, 'تحليل SWOT');
  const cw = (CW - 0.28) / 2, chh = 2.1;
  T(s, 'عوامل داخلية', { x: PW - M - cw, y: 1.06, w: cw, h: 0.26, align: 'center', fontSize: 10, bold: true, color: GREEN });
  T(s, 'عوامل خارجية', { x: M, y: 1.06, w: cw, h: 0.26, align: 'center', fontSize: 10, bold: true, color: OLIVE_TX });
  [
    { d: D.swot.S, k: 'S', x: PW - M - cw, y: 1.36, dark: true },
    { d: D.swot.O, k: 'O', x: M, y: 1.36, dark: false },
    { d: D.swot.W, k: 'W', x: PW - M - cw, y: 3.62, dark: true },
    { d: D.swot.T, k: 'T', x: M, y: 3.62, dark: false },
  ].forEach((q) => {
    card(s, q.x, q.y, cw, chh, { shadow: soft(0.055) });
    s.addShape('roundRect', { x: q.x + 0.13, y: q.y + 0.12, w: cw - 0.26, h: 0.42, fill: { color: q.dark ? GREEN : OLIVE }, line: { type: 'none' }, rectRadius: 0.07 });
    s.addShape('ellipse', { x: q.x + cw - 0.51, y: q.y + 0.18, w: 0.3, h: 0.3, fill: { color: W_ }, line: { type: 'none' } });
    T(s, q.k, { x: q.x + cw - 0.51, y: q.y + 0.165, w: 0.3, h: 0.3, align: 'center', valign: 'middle', fontSize: 11, bold: true, color: q.dark ? GREEN : OLIVE_TX, fontFace: 'Arial' });
    T(s, q.d.t, { x: q.x + 0.3, y: q.y + 0.12, w: cw - 0.9, h: 0.42, valign: 'middle', fontSize: 12.5, bold: true, color: q.dark ? W_ : OLIVE_TX });
    T(s, q.d.items.map((it) => ({ text: it, options: { breakLine: true, paraSpaceAfter: 5, bullet: { code: '25AA', indent: 10 }, color: BODY, fontSize: 9.3 } })),
      { x: q.x + 0.3, y: q.y + 0.66, w: cw - 0.6, h: chh - 0.8, fontSize: 9.3, lineSpacingMultiple: 1.1 });
  });
  T(s, 'الاستراتيجيات المُستنبَطة (SO، WO، ST، WT)', { x: PW - M - 6.0, y: 5.86, w: 6.0, h: 0.3, fontSize: 11, bold: true, color: INK });
  const sw = (CW - 3 * 0.24) / 4;
  D.swot.strategies.forEach((st, i) => {
    const x = PW - M - sw - i * (sw + 0.24), y = 6.2;
    card(s, x, y, sw, 0.78, { fill: { color: MINT } });
    chip(s, x + sw - 0.64, y + 0.18, 0.5, 0.3, st.k, { fill: i < 2 ? GREEN : TEAL, fontSize: 9.5, r: 0.06 });
    T(s, st.t, { x: x + 0.15, y: y + 0.09, w: sw - 0.84, h: 0.3, fontSize: 9.6, bold: true, color: GREEN_DK, valign: 'middle' });
    T(s, st.d, { x: x + 0.15, y: y + 0.41, w: sw - 0.84, h: 0.3, fontSize: 7.8, color: MUTED, valign: 'middle' });
  });
})();

/* ============================================================ 12 — URGENT ISSUES */
(function () {
  const s = slide();
  head(s, 'الجزء الأول · قراءة الواقع', 'القضايا الملحة للمدرسة وفق تحليل SWOT');
  footer(s, 'القضايا الملحة للمدرسة');
  T(s, D.issues.intro, { x: M, y: 1.1, w: CW, h: 0.38, fontSize: 10.5, color: BODY });
  const cw = (CW - 0.28) / 2, chh = 1.3;
  D.issues.list.slice(0, 6).forEach((it, i) => {
    const r = Math.floor(i / 2), c = i % 2;
    const x = PW - M - cw - c * (cw + 0.28), y = 1.54 + r * (chh + 0.18);
    card(s, x, y, cw, chh, { shadow: soft(0.055) });
    ghost(s, arNum(i + 1), x + cw - 1.1, y + 0.05, 0.85, chh - 0.1, { size: 44, color: GHOST, align: 'right' });
    T(s, arNum(i + 1), { x: x + cw - 0.64, y: y + 0.16, w: 0.44, h: 0.36, align: 'center', valign: 'middle', fontSize: 13, color: TEAL, fontFace: XB });
    T(s, it.t, { x: x + 0.24, y: y + 0.14, w: cw - 1.02, h: 0.56, fontSize: 11, bold: true, color: GREEN_DK, valign: 'middle', lineSpacingMultiple: 1.06 });
    T(s, it.d, { x: x + 0.24, y: y + 0.74, w: cw - 1.02, h: 0.5, fontSize: 8.8, color: MUTED, lineSpacingMultiple: 1.12 });
  });
  const it7 = D.issues.list[6], y7 = 1.54 + 3 * (chh + 0.18) + 0.04;
  card(s, M, y7, CW, 0.95, { fill: { color: GREEN }, line: { type: 'none' }, shadow: deep(0.2) });
  s.addImage({ path: A('dots_white.png'), x: M + 0.1, y: y7 + 0.06, w: 1.3, h: 0.85, transparency: 70 });
  s.addShape('ellipse', { x: PW - M - 0.68, y: y7 + 0.275, w: 0.4, h: 0.4, fill: { color: W_ }, line: { type: 'none' } });
  T(s, '٧', { x: PW - M - 0.68, y: y7 + 0.26, w: 0.4, h: 0.4, align: 'center', valign: 'middle', fontSize: 13, bold: true, color: GREEN });
  T(s, it7.t, { x: M + 0.35, y: y7 + 0.13, w: CW - 1.25, h: 0.4, fontSize: 12.5, bold: true, color: W_, valign: 'middle' });
  T(s, it7.d, { x: M + 0.35, y: y7 + 0.54, w: CW - 1.25, h: 0.35, fontSize: 9.5, color: 'CFE2DB' });
})();

/* ============================================================ DIVIDER 2 */
divider('الجزء الثاني', '02', 'الأهداف والبرامج التشغيلية', [
  'الأهداف الاستراتيجية العشرة للوزارة', 'التوزيع الكمي للأهداف والبرامج',
  'الأهداف ١ إلى ٥ وبرامجها التفصيلية', 'الأهداف ٦ إلى ١٠ وبرامجها التفصيلية',
  '١١٢ برنامجًا تشغيليًا', '٦٢ مؤشر اعتماد مدرسي',
]);

/* ============================================================ 13 — TEN GOALS */
(function () {
  const s = slide();
  head(s, 'الجزء الثاني · الأهداف والبرامج', 'الأهداف الاستراتيجية لوزارة التعليم');
  footer(s, 'الأهداف الاستراتيجية للوزارة');
  T(s, D.goals10.intro, { x: M, y: 1.1, w: CW, h: 0.4, fontSize: 10.8, color: BODY });
  const cw = (CW - 4 * 0.22) / 5, chh = 1.52;
  D.goals10.items.forEach((g, i) => {
    const r = Math.floor(i / 5), c = i % 5;
    const x = PW - M - cw - c * (cw + 0.22), y = 1.66 + r * (chh + 0.24);
    card(s, x, y, cw, chh, { shadow: soft(0.055) });
    ghost(s, arNum(i + 1), x + 0.14, y + 0.04, cw - 0.28, 0.72, { size: 38, color: GHOST, align: 'left' });
    chip(s, x + cw / 2 - 0.19, y + 0.16, 0.38, 0.38, arNum(i + 1), { fontSize: 11.5, r: 0.08 });
    T(s, g, { x: x + 0.1, y: y + 0.62, w: cw - 0.2, h: chh - 0.7, align: 'center', valign: 'middle', fontSize: 9.3, bold: true, color: GREEN_DK, lineSpacingMultiple: 1.06 });
  });
  const by = 1.66 + 2 * (chh + 0.24) + 0.06, bh = PH - by - 0.42;
  card(s, M, by, CW, bh, { fill: { color: GREEN }, line: { type: 'none' }, shadow: deep(0.2) });
  s.addImage({ path: A('arc_white.png'), x: M + 0.1, y: by - 0.35, w: 2.1, h: 2.1, transparency: 76 });
  T(s, D.goals10.band.t, { x: M + 0.36, y: by + 0.13, w: CW - 0.75, h: 0.36, fontSize: 12.5, bold: true, color: W_ });
  T(s, D.goals10.band.d, { x: 5.5, y: by + 0.52, w: PW - M - 0.36 - 5.5, h: 0.95, fontSize: 9.2, color: 'D2E4DD', lineSpacingMultiple: 1.2 });
  D.goals10.band.stats.forEach((st, i) => {
    const pw = 1.36, x = M + 0.36 + (2 - i) * (pw + 0.16), y = by + 0.52;
    s.addShape('roundRect', { x, y, w: pw, h: 0.68, fill: { color: W_, transparency: 88 }, line: { color: W_, width: 0.75, transparency: 60 }, rectRadius: 0.08 });
    const [num, ...rest] = st.split(' ');
    T(s, num, { x, y: y + 0.05, w: pw, h: 0.3, align: 'center', fontSize: 13, color: W_, fontFace: XB });
    T(s, rest.join(' '), { x, y: y + 0.37, w: pw, h: 0.26, align: 'center', fontSize: 8, color: 'CFE2DB' });
  });
})();

/* ============================================================ 14 — QUANT DISTRIBUTION */
(function () {
  const s = slide();
  head(s, 'الجزء الثاني · الأهداف والبرامج', 'التوزيع الكمي للأهداف');
  footer(s, 'التوزيع الكمي للأهداف');
  const tw = (CW - 3 * 0.28) / 4;
  D.quant.tiles.forEach((t, i) => {
    const x = PW - M - tw - i * (tw + 0.28), y = 1.14, hero = i % 2 === 0;
    card(s, x, y, tw, 0.94, hero ? { fill: { color: GREEN }, line: { type: 'none' }, shadow: deep(0.18) } : { line: { color: GREEN, width: 1 } });
    T(s, t.v, { x: x + 0.2, y, w: tw * 0.4, h: 0.94, fontSize: 25, fontFace: XB, color: hero ? W_ : GREEN, valign: 'middle', align: 'center' });
    T(s, t.t, { x: x + tw * 0.4, y, w: tw * 0.6 - 0.16, h: 0.94, fontSize: 11, bold: true, color: hero ? 'CFE2DB' : BODY, valign: 'middle' });
  });
  const tbw = 7.6, tx = PW - M - tbw;
  const rows = [D.quant.head.map((h) => hc(h, { fontSize: 8.4 }))];
  D.quant.rows.forEach((r, i) => rows.push(r.map((v, j) => c_(v, {
    fontSize: 8.2, align: j === 1 ? 'right' : 'center', bold: j === 0 || j === 5,
    color: j === 5 ? GREEN : (j === 1 ? GREEN_DK : BODY), fill: zebra(i),
  }))));
  rows.push([
    { text: 'الإجمالي الكلي', options: Object.assign({}, hc('').options, { colspan: 3, fontSize: 8.6 }) },
    hc('٦٢', { fontSize: 8.6 }), hc('١١٢', { fontSize: 8.6 }), hc('١٠٠٪', { fontSize: 8.6 }),
  ]);
  rtable(s, { x: tx, y: 2.3, w: tbw, colW: [0.36, 2.9, 1.45, 0.95, 0.95, 0.99], rows, opts: { rowH: [0.34, ...Array(10).fill(0.36), 0.34] } });
  label(s, M + 4.4 - 2.4, 2.26, 2.4, 'التوزيع البصري للبرامج');
  s.addChart(pptx.charts.BAR, [{ name: 'البرامج', labels: D.quant.rows.map((r) => 'هـ' + r[0]).reverse(), values: D.quant.chartVals.slice().reverse() }], {
    x: M, y: 2.64, w: 4.4, h: 2.5, barDir: 'col', barGapWidthPct: 30,
    chartColors: [GOLD, GREEN, GREEN, GREEN, GREEN, GREEN, GREEN, GREEN, GREEN, GREEN],
    showValue: true, dataLabelPosition: 'outEnd', dataLabelColor: INK, dataLabelFontSize: 8, dataLabelFontFace: FONT,
    catAxisLabelColor: MUTED, catAxisLabelFontSize: 8, catAxisLabelFontFace: FONT,
    valAxisHidden: true, valGridLine: { style: 'none' }, catGridLine: { style: 'none' },
    valAxisMaxVal: 17, showLegend: false, showTitle: false,
  });
  card(s, M, 5.36, 4.4, 1.6, { fill: { color: GREEN }, line: { type: 'none' }, shadow: deep(0.18) });
  icon(s, 'trending', 'white', M + 4.4 - 0.55, 5.54, 0.28);
  T(s, D.quant.note.t, { x: M + 0.26, y: 5.49, w: 3.5, h: 0.34, fontSize: 11.5, bold: true, color: W_ });
  T(s, D.quant.note.d, { x: M + 0.26, y: 5.87, w: 4.4 - 0.55, h: 1.0, fontSize: 9, color: 'D2E4DD', lineSpacingMultiple: 1.2 });
})();

/* ============================================================ GOALS 1..10 */
const ALL_GOALS = D.goals.concat(D2.goals);
ALL_GOALS.forEach((G) => {
  /* summary */
  {
    const s = slide();
    footer(s, 'الهدف الاستراتيجي ' + G.n);
    s.addImage({ path: A('band_goal.jpg'), x: M, y: 0.3, w: CW, h: 1.5 });
    s.addImage({ path: A('moe_white.png'), x: M + 0.44, y: 0.55, w: 1.28, h: 0.99 });
    ghost(s, G.lat, PW - M - 2.15, 0.3, 1.95, 1.5, { size: 66, color: GHOST_D, align: 'left' });
    T(s, 'الهدف الاستراتيجي رقم ' + G.n, { x: 2.7, y: 0.52, w: PW - M - 3.1, h: 0.34, fontSize: 12, bold: true, color: GOLD });
    T(s, G.title, { x: 2.7, y: 0.88, w: PW - M - 3.1, h: 0.68, fontSize: 22, color: W_, fontFace: XB, valign: 'middle' });
    const heroW = 4.9, gap = 0.28, rw2 = (CW - heroW - gap * 2) / 2, sy = 2.02, sh = 1.06;
    card(s, PW - M - heroW, sy, heroW, sh, { fill: { color: GREEN }, line: { type: 'none' }, shadow: deep(0.2) });
    s.addImage({ path: A('arc_white.png'), x: PW - M - 1.3, y: sy - 0.28, w: 1.6, h: 1.6, transparency: 72 });
    T(s, G.programsCount, { x: PW - M - heroW + 0.3, y: sy, w: 1.5, h: sh, fontSize: 30, fontFace: XB, color: W_, valign: 'middle', align: 'center' });
    T(s, 'عدد البرامج التشغيلية', { x: PW - M - heroW + 1.85, y: sy, w: heroW - 3.1, h: sh, fontSize: 12.5, bold: true, color: 'CFE2DB', valign: 'middle' });
    [[G.indicatorsCount, 'عدد مؤشرات الاعتماد المرتبطة'], [G.targetPct, 'نسبة التحقّق المستهدفة']].forEach((it, i) => {
      const x = PW - M - heroW - gap - rw2 - i * (rw2 + gap);
      card(s, x, sy, rw2, sh, { line: { color: GREEN, width: 1 }, shadow: soft(0.05) });
      T(s, it[0], { x: x + 0.18, y: sy, w: 1.15, h: sh, fontSize: 22, fontFace: XB, color: GREEN, valign: 'middle', align: 'center' });
      T(s, it[1], { x: x + 1.38, y: sy, w: rw2 - 1.56, h: sh, fontSize: 10.5, bold: true, color: BODY, valign: 'middle' });
    });
    label(s, PW - M - 3.7, 3.32, 3.7, 'البرامج التشغيلية ضمن هذا الهدف');
    const per = 4, gp = 0.2, pw = (CW - (per - 1) * gp) / per;
    G.programs.forEach((p, i) => {
      const r = Math.floor(i / per), c = i % per;
      const x = PW - M - pw - c * (pw + gp), y = 3.74 + r * 0.58;
      card(s, x, y, pw, 0.46, { fill: { color: MINT }, rectRadius: 0.09 });
      s.addShape('ellipse', { x: x + pw - 0.3, y: y + 0.185, w: 0.09, h: 0.09, fill: { color: TEAL }, line: { type: 'none' } });
      T(s, p, { x: x + 0.14, y, w: pw - 0.5, h: 0.46, fontSize: 9.8, bold: true, color: GREEN_DK, valign: 'middle' });
    });
    const used = Math.ceil(G.programs.length / per);
    const by = 3.74 + used * 0.58 + 0.14, bh = PH - by - 0.44;
    const iw = 4.4;
    card(s, PW - M - iw, by, iw, bh, {});
    T(s, 'مؤشرات الاعتماد المدرسي', { x: PW - M - iw + 0.26, y: by + 0.1, w: iw - 0.5, h: 0.3, fontSize: 10.5, bold: true, color: GREEN_DK });
    const cW = 0.72, cG = 0.12;
    G.indicators.forEach((cd, i) => {
      const perR = 5, r = Math.floor(i / perR), c = i % perR;
      chip(s, PW - M - 0.26 - cW - c * (cW + cG), by + 0.46 + r * 0.38, cW, 0.3, cd,
        { fill: W_, color: GREEN_DK, fontSize: 8, r: 0.06, line: { color: GREEN, width: 0.75 } });
    });
    const ow = CW - iw - 0.28;
    card(s, M, by, ow, bh, { fill: { color: GREEN }, line: { type: 'none' }, shadow: deep(0.2) });
    icon(s, 'sparkles', 'white', M + ow - 0.5, by + 0.12, 0.28);
    T(s, 'المخرجات المتوقّعة', { x: M + 0.3, y: by + 0.1, w: ow - 0.95, h: 0.3, fontSize: 11.5, bold: true, color: W_ });
    T(s, G.outputs, { x: M + 0.3, y: by + 0.45, w: ow - 0.6, h: bh - 0.55, fontSize: 9.6, color: 'D7E8E2', lineSpacingMultiple: 1.2 });
  }
  /* detail */
  {
    const s = slide();
    footer(s, 'الهدف ' + G.n + ' · البرامج التفصيلية');
    s.addShape('roundRect', { x: M, y: 0.3, w: CW, h: 0.6, fill: { color: GREEN }, line: { type: 'none' }, rectRadius: 0.09 });
    s.addShape('roundRect', { x: M + 0.18, y: 0.415, w: 1.55, h: 0.37, fill: { color: W_, transparency: 86 }, line: { color: W_, width: 0.5, transparency: 55 }, rectRadius: 0.07 });
    T(s, 'البرامج التفصيلية', { x: M + 0.18, y: 0.405, w: 1.55, h: 0.37, align: 'center', valign: 'middle', fontSize: 9.5, bold: true, color: W_ });
    T(s, `الهدف الاستراتيجي العام ${G.n}: ${G.title}`, { x: 2.45, y: 0.3, w: PW - M - 2.75, h: 0.6, fontSize: 15.5, bold: true, color: W_, valign: 'middle' });
    rtable(s, {
      x: M, y: 1.02, w: CW, colW: [1.95, CW - 1.95],
      rows: [
        [c_('المحور الاستراتيجي', { bold: true, color: W_, fill: { color: GREEN_LT }, fontSize: 9 }), c_(G.axis, { align: 'right', fontSize: 9.4, bold: true, color: GREEN_DK })],
        [c_(G.detailGoal, { bold: true, color: W_, fill: { color: GREEN_LT }, fontSize: 9 }), c_(G.detailDesc, { align: 'right', fontSize: 8.2 })],
        [c_('مؤشر قياس الأداء (المستهدف)', { bold: true, color: W_, fill: { color: GREEN_LT }, fontSize: 9 }), c_(G.kpi, { align: 'right', fontSize: 8.4, bold: true, color: '0B4A56' })],
      ],
      opts: { rowH: [0.3, 0.6, 0.46] },
    });
    const widths = [0.32, 0.88, 1.5, 1.0, 0.4, 0.6, 1.2, 1.15, 1.0, 1.05, 1.03, 1.36, 0.94];
    const hdrTop = [
      hc('م', { rowspan: 2, fontSize: 8 }), hc('المجال', { rowspan: 2, fontSize: 8 }),
      hc('اسم المشروع / البرنامج', { rowspan: 2, fontSize: 8 }), hc('مصدر البرنامج', { rowspan: 2, fontSize: 8 }),
      hc('زمن التنفيذ', { colspan: 2, fontSize: 8, fill: { color: GREEN_DK } }),
      hc('المتطلبات', { rowspan: 2, fontSize: 8 }),
      hc('جهة التنفيذ', { colspan: 3, fontSize: 8, fill: { color: GREEN_DK } }),
      hc('الفئة المستهدفة', { rowspan: 2, fontSize: 8 }), hc('أسلوب التنفيذ', { rowspan: 2, fontSize: 8 }),
      hc('مؤشر تحقق الهدف', { rowspan: 2, fontSize: 8 }),
    ];
    const hdrSub = [hc('ف', { fontSize: 7.6 }), hc('الأسبوع', { fontSize: 7.6 }), hc('الرئيسة وفريق العمل', { fontSize: 7.6 }), hc('المساندة', { fontSize: 7.6 }), hc('الدعم الخارجي', { fontSize: 7.6 })];
    const n = G.table.length;
    const fs = n > 13 ? 6.9 : (n > 11 ? 7.2 : 7.5);
    const body = G.table.map((r, i) => {
      const f = zebra(i);
      return [
        c_(r[0], { fontSize: fs - 0.2, fill: f }), c_(r[1], { fontSize: fs - 0.2, fill: f }),
        c_(r[2], { fontSize: fs, bold: true, color: GREEN_DK, align: 'right', fill: f }),
        ...r.slice(3).map((v) => c_(v, { fontSize: fs - 0.1, fill: f })),
        c_('', { fill: f }),
      ];
    });
    const rh = Math.min(0.4, (7.06 - 2.5 - 0.62) / n);
    rtable(s, { x: M, y: 2.5, w: CW, colW: widths, rows: [hdrTop, hdrSub, ...body], opts: { rowH: [0.3, 0.32, ...Array(n).fill(rh)] } });
  }
});

/* ============================================================ DIVIDER 3 */
divider('الجزء الثالث', '03', 'المتابعة والحوكمة والاعتماد', [
  'نظام متابعة وتحسين الخطة', 'أربع جولات متابعة على مدار العام',
  'نظام المتابعة والمساءلة', 'نموذج المساءلة',
  'دورة التحسين المستمر', 'اعتماد الخطة التشغيلية',
]);

/* ============================================================ MONITORING */
(function () {
  const s = slide();
  head(s, 'الجزء الثالث · المتابعة والحوكمة', 'نظام متابعة وتحسين الخطة');
  footer(s, 'نظام المتابعة');
  const Mo = D2.monitoring;
  T(s, Mo.intro, { x: M, y: 1.1, w: CW, h: 0.38, fontSize: 10.5, color: BODY });
  const cw = [1.15, 2.3, 0.95, CW - 1.15 - 2.3 - 0.95 - 2.1, 2.1];
  const rows = [Mo.head.map((h) => hc(h, { fontSize: 9 }))];
  Mo.rows.forEach((r, i) => rows.push([
    c_(r[0], { bold: true, color: GREEN_DK, fill: zebra(i) }),
    c_(r[1], { fontSize: 8.8, fill: zebra(i) }),
    c_(r[2], { bold: true, color: TEAL, fill: zebra(i) }),
    c_(r[3], { fontSize: 8.6, align: 'right', fill: zebra(i) }),
    c_(Mo.levels, { fontSize: 8.4, color: MUTED, fill: zebra(i) }),
  ]));
  rtable(s, { x: M, y: 1.56, w: CW, colW: cw, rows, opts: { rowH: [0.36, 0.46, 0.46, 0.46, 0.46] } });
  label(s, PW - M - 3.2, 3.68, 3.2, 'أدوات المتابعة والتحسين');
  const tw = (CW - 3 * 0.24) / 4;
  Mo.tools.forEach((t, i) => {
    const x = PW - M - tw - i * (tw + 0.24), y = 4.12;
    card(s, x, y, tw, 1.42, { shadow: soft(0.055) });
    iconDisc(s, t.icon, x + tw - 0.72, y + 0.16, 0.5);
    T(s, t.t, { x: x + 0.22, y: y + 0.16, w: tw - 1.02, h: 0.5, fontSize: 11, bold: true, color: GREEN_DK, valign: 'middle', lineSpacingMultiple: 1.02 });
    T(s, t.d, { x: x + 0.22, y: y + 0.72, w: tw - 0.44, h: 0.6, fontSize: 8.6, color: MUTED, lineSpacingMultiple: 1.14 });
  });
  const cy = 5.82;
  card(s, M, cy, CW, 1.06, { fill: { color: GREEN }, line: { type: 'none' }, shadow: deep(0.2) });
  T(s, 'دورة التحسين المستمر', { x: PW - M - 2.9, y: cy, w: 2.6, h: 1.06, fontSize: 12.5, bold: true, color: W_, valign: 'middle' });
  const sw = 1.72, sx0 = PW - M - 3.15;
  Mo.cycle.forEach((st, i) => {
    const x = sx0 - sw - i * (sw + 0.34);
    s.addShape('roundRect', { x, y: cy + 0.28, w: sw, h: 0.5, fill: { color: W_, transparency: 87 }, line: { color: W_, width: 0.75, transparency: 62 }, rectRadius: 0.25 });
    T(s, arNum(i + 1) + '.  ' + st, { x, y: cy + 0.27, w: sw, h: 0.5, align: 'center', valign: 'middle', fontSize: 9.5, bold: true, color: W_ });
    if (i < Mo.cycle.length - 1) T(s, '‹', { x: x - 0.32, y: cy + 0.28, w: 0.3, h: 0.5, align: 'center', valign: 'middle', fontSize: 15, color: GOLD, bold: true });
  });
})();

/* ============================================================ ACCOUNTABILITY SYSTEM */
(function () {
  const s = slide();
  head(s, 'الجزء الثالث · المتابعة والحوكمة', 'نظام المتابعة والمساءلة');
  footer(s, 'نظام المساءلة');
  const Ac = D2.accountability;
  T(s, Ac.intro, { x: M, y: 1.1, w: CW, h: 0.38, fontSize: 10.5, color: BODY });
  rtable(s, {
    x: M, y: 1.56, w: CW, colW: Array(4).fill(CW / 4),
    rows: [Ac.topHead.map((h) => hc(h, { fontSize: 9 })), Ac.topHead.map(() => c_('', {}))],
    opts: { rowH: [0.36, 0.4] },
  });
  const cw2 = [0.95, 1.0, 0.62, 0.72, 0.86, 1.5, 0.62, 0.78, 0.72, CW - 10.07, 1.85];
  const grp = [
    hc('الفصل الدراسي', { rowspan: 2, fontSize: 8.6 }),
    hc(Ac.groups[0], { colspan: 4, fontSize: 8.6, fill: { color: GREEN_DK } }),
    hc('أسباب عدم التنفيذ', { rowspan: 2, fontSize: 8.6 }),
    hc(Ac.groups[1], { colspan: 5, fontSize: 8.6, fill: { color: GREEN_DK } }),
  ];
  const sub = ['تاريخ المتابعة', 'نفذ', 'لم ينفذ', 'جاري التنفيذ', 'عالٍ', 'متوسط', 'ضعيف', 'ملاحظات', 'أداة التقويم المستخدمة'].map((t) => hc(t, { fontSize: 7.8 }));
  const bodyRows = [];
  Ac.semesters.forEach((sem, si) => {
    for (let k = 0; k < 2; k++) {
      const r = [];
      if (k === 0) r.push(c_(sem, { rowspan: 2, bold: true, color: W_, fill: { color: si ? GREEN : TEAL }, fontSize: 11 }));
      for (let j = 0; j < 10; j++) r.push(c_('', { fill: zebra(si * 2 + k) }));
      bodyRows.push(r);
    }
  });
  rtable(s, { x: M, y: 2.54, w: CW, colW: cw2, rows: [grp, sub, ...bodyRows], opts: { rowH: [0.3, 0.34, 0.42, 0.42, 0.42, 0.42] } });
  const ey = 5.06;
  card(s, PW - M - 6.05, ey, 6.05, 1.9, { fill: { color: GREEN }, line: { type: 'none' }, shadow: deep(0.2) });
  s.addImage({ path: A('dots_white.png'), x: PW - M - 1.75, y: ey + 0.75, w: 1.6, h: 1.1, transparency: 72 });
  T(s, 'مستويات التصعيد', { x: PW - M - 5.75, y: ey + 0.16, w: 5.45, h: 0.34, fontSize: 12.5, bold: true, color: W_ });
  Ac.escalation.forEach((e, i) => {
    const r = Math.floor(i / 3), c = i % 3;
    const bw = 1.78, x = PW - M - 0.3 - bw - c * (bw + 0.16), y = ey + 0.6 + r * 0.56;
    s.addShape('roundRect', { x, y, w: bw, h: 0.44, fill: { color: W_, transparency: 87 }, line: { color: W_, width: 0.75, transparency: 62 }, rectRadius: 0.22 });
    T(s, arNum(i + 1) + '.  ' + e, { x, y: y - 0.01, w: bw, h: 0.44, align: 'center', valign: 'middle', fontSize: 8.6, bold: true, color: W_ });
  });
  const pw3 = (CW - 6.05 - 0.28 - 2 * 0.2) / 3;
  Ac.principles.forEach((p, i) => {
    const x = PW - M - 6.05 - 0.28 - pw3 - i * (pw3 + 0.2);
    card(s, x, ey, pw3, 1.9, { fill: { color: MINT } });
    T(s, p.t, { x: x + 0.2, y: ey + 0.18, w: pw3 - 0.4, h: 0.34, fontSize: 11.5, bold: true, color: GREEN_DK });
    T(s, p.d, { x: x + 0.2, y: ey + 0.6, w: pw3 - 0.4, h: 1.1, fontSize: 9, color: BODY, lineSpacingMultiple: 1.2 });
  });
})();

/* ============================================================ ACCOUNTABILITY FORM */
(function () {
  const s = slide();
  head(s, 'الجزء الثالث · المتابعة والحوكمة', 'نموذج المساءلة');
  footer(s, 'نموذج المساءلة');
  const F = D2.accForm;
  s.addShape('roundRect', { x: M, y: 1.2, w: CW, h: 0.5, fill: { color: GREEN }, line: { type: 'none' }, rectRadius: 0.08 });
  T(s, F.title, { x: M, y: 1.2, w: CW, h: 0.5, align: 'center', valign: 'middle', fontSize: 14, bold: true, color: W_ });
  const cw = [2.3, 2.05, 1.0, 2.35, 1.0, 1.55, 0.95, CW - 11.2];
  const top = [
    hc('اسم المشروع / البرنامج', { rowspan: 2, fontSize: 9 }),
    hc(F.group, { colspan: 4, fontSize: 9, fill: { color: GREEN_DK } }),
    hc('اسم مسؤول تنفيذ البرنامج', { rowspan: 2, fontSize: 9 }),
    hc('التوقيع', { rowspan: 2, fontSize: 9 }),
    hc('اسم مسؤول المساءلة', { rowspan: 2, fontSize: 9 }),
  ];
  const sub = [
    hc('شفوي (عند التأخير في التنفيذ)', { fontSize: 8.2 }), hc('التاريخ', { fontSize: 8.2 }),
    hc('كتابي (عند عدم الالتزام بالموعد الجديد)', { fontSize: 8.2 }), hc('التاريخ', { fontSize: 8.2 }),
  ];
  const body = [];
  for (let i = 0; i < F.rowCount; i++) body.push(Array(8).fill(0).map(() => c_('', { fill: zebra(i) })));
  rtable(s, { x: M, y: 1.82, w: CW, colW: cw, rows: [top, sub, ...body], opts: { rowH: [0.34, 0.44, ...Array(F.rowCount).fill(0.5)] } });
  T(s, 'يُستخدم هذا النموذج عند وجود تأخّر في تنفيذ أحد برامج الخطة، ويُرفق ضمن ملف المتابعة الدورية.',
    { x: M, y: 6.6, w: CW, h: 0.3, fontSize: 9, color: MUTED });
})();

/* ============================================================ APPROVAL */
(function () {
  const s = slide();
  head(s, 'الجزء الثالث · المتابعة والحوكمة', 'اعتماد الخطة التشغيلية');
  footer(s, 'اعتماد الخطة التشغيلية');
  const Ap = D2.approval;
  card(s, 1.6, 0.36, 2.7, 0.5, { fill: { color: MINT }, rectRadius: 0.1 });
  T(s, Ap.badge, { x: 1.6, y: 0.4, w: 2.7, h: 0.26, align: 'center', fontSize: 9.5, bold: true, color: GREEN });
  T(s, Ap.badgeSub, { x: 1.6, y: 0.63, w: 2.7, h: 0.22, align: 'center', fontSize: 7.6, color: MUTED });
  card(s, M, 1.24, CW, 0.92, { fill: { color: GREEN }, line: { type: 'none' }, shadow: deep(0.2) });
  s.addImage({ path: A('dots_white.png'), x: M + 0.12, y: 1.3, w: 1.3, h: 0.8, transparency: 72 });
  T(s, Ap.banner, { x: M + 0.4, y: 1.24, w: CW - 0.8, h: 0.92, valign: 'middle', fontSize: 12.5, bold: true, color: W_, lineSpacingMultiple: 1.2 });
  const tw = 6.4, tx = PW - M - tw;
  const rows = [Ap.head.map((h) => hc(h, { fontSize: 10 }))];
  for (let i = 0; i < Ap.rowCount; i++) rows.push([c_(arNum(i + 1), { bold: true, color: GREEN_DK, fill: zebra(i) }), c_('', { fill: zebra(i) }), c_('', { fill: zebra(i) })]);
  rtable(s, { x: tx, y: 2.6, w: tw, colW: [0.7, 3.7, tw - 4.4], rows, opts: { rowH: [0.36, ...Array(Ap.rowCount).fill(0.44)] } });
  const qw = CW - tw - 0.4, qx = M;
  card(s, qx, 2.9, qw, 1.9, { line: { color: GREEN, width: 1 }, shadow: soft() });
  s.addImage({ path: A('arc_white.png'), x: qx + qw - 1.6, y: 2.75, w: 1.6, h: 1.6, transparency: 93 });
  T(s, Ap.quote.map((l, i) => ({ text: l, options: { breakLine: i === 0, paraSpaceAfter: 6 } })),
    { x: qx + 0.4, y: 2.9, w: qw - 0.8, h: 1.9, align: 'center', valign: 'middle', fontSize: 15, bold: true, color: GREEN_DK, lineSpacingMultiple: 1.3 });
  T(s, Ap.dateLabel + '  ……………………………', { x: qx, y: 5.1, w: qw, h: 0.4, fontSize: 12, bold: true, color: GREEN });
  T(s, 'يعتمد / مدير المدرسة:  ……………………………', { x: qx, y: 5.62, w: qw, h: 0.4, fontSize: 12, bold: true, color: GREEN });
})();

/* ============================================================ REGISTER COVER */
(function () {
  const s = slide('bg_closing.jpg');
  const R = D2.registerCover;
  s.addImage({ path: A('moe_white.png'), x: PW / 2 - 0.72, y: 0.72, w: 1.44, h: 1.113 });
  T(s, R.admin, { x: 1.2, y: 2.0, w: PW - 2.4, h: 0.32, align: 'center', fontSize: 12, color: 'CBDED7' });
  T(s, R.title, { x: 1.0, y: 2.44, w: PW - 2.0, h: 1.5, align: 'center', valign: 'middle', fontSize: 40, color: W_, fontFace: XB, lineSpacingMultiple: 1.12 });
  const dy = 4.06;
  s.addShape('line', { x: PW / 2 - 1.4, y: dy, w: 1.15, h: 0, line: { color: GOLD, width: 1 } });
  s.addShape('line', { x: PW / 2 + 0.25, y: dy, w: 1.15, h: 0, line: { color: GOLD, width: 1 } });
  s.addShape('diamond', { x: PW / 2 - 0.06, y: dy - 0.06, w: 0.12, h: 0.12, fill: { color: GOLD }, line: { type: 'none' } });
  T(s, R.sub, { x: 1.2, y: 4.22, w: PW - 2.4, h: 0.5, align: 'center', fontSize: 22, bold: true, color: GOLD });
  const pw = 3.3;
  s.addShape('roundRect', { x: PW / 2 - pw / 2, y: 4.94, w: pw, h: 0.54, fill: { color: W_, transparency: 88 }, line: { color: GOLD, width: 1 }, rectRadius: 0.1 });
  T(s, R.year, { x: PW / 2 - pw / 2, y: 4.92, w: pw, h: 0.54, align: 'center', valign: 'middle', fontSize: 14, bold: true, color: W_ });
  T(s, R.quote, { x: 1.6, y: 5.9, w: PW - 3.2, h: 0.6, align: 'center', fontSize: 11.5, color: 'C7DCD5', lineSpacingMultiple: 1.2 });
})();

/* ============================================================ STAFF NAMES LIST */
(function () {
  const s = slide();
  head(s, 'سجل الاجتماعات', 'كشف بأسماء منسوبات المدرسة');
  footer(s, 'فريق إعداد الخطة');
  const L = D2.staffList;
  const rows = [L.head.map((h) => hc(h, { fontSize: 9.4 }))];
  for (let i = 0; i < L.rowCount; i++) {
    rows.push([c_(arNum(i + 1), { bold: true, color: W_, fill: { color: GREEN }, fontSize: 8.6 }), ...Array(5).fill(0).map(() => c_('', { fill: zebra(i) }))]);
  }
  rtable(s, { x: M, y: 1.2, w: CW, colW: [0.75, 3.3, 2.5, 2.3, 2.3, CW - 11.15], rows, opts: { rowH: [0.36, ...Array(L.rowCount).fill(0.35)] } });
})();

/* ============================================================ TEAM (repeat) */
teamSlide();

/* ============================================================ MEETING MINUTES */
function meetingSlide(Mt) {
  const s = slide();
  head(s, 'سجل الاجتماعات', Mt.title);
  footer(s, Mt.title);
  label(s, PW - M - 6.8, 1.12, 6.8, Mt.header);
  rtable(s, {
    x: M, y: 1.5, w: CW, colW: [1.5, 2.3, 3.6, 3.0, CW - 10.4],
    rows: [
      ['اليوم', 'التاريخ', 'الفئة المستهدفة', 'مقر الاجتماع', 'عدد الحضور'].map((h) => hc(h, { fontSize: 9 })),
      [c_('………'), c_('……/……/١٤٤٨هـ'), c_(Mt.target, { bold: true, color: GREEN_DK }), c_(Mt.place), c_('………')],
    ],
    opts: { rowH: [0.34, 0.4] },
  });
  card(s, M, 2.36, CW, 0.44, { fill: { color: ICE }, line: { color: 'CFE6EC', width: 0.75 } });
  T(s, [
    { text: 'الهدف من الاجتماع:   ', options: { bold: true, color: GREEN } },
    { text: Mt.objective || '……………………………………………………………………………………', options: { color: '0B4A56' } },
  ], { x: M + 0.24, y: 2.36, w: CW - 0.48, h: 0.44, valign: 'middle', fontSize: 9.8 });
  const c1 = 3.5, rest = CW - c1, c2 = rest / 2 + 0.6;
  const rows = [[Mt.agendaLabel, 'محضر الأعمال', 'التوصيات'].map((h) => hc(h, { fontSize: 9.6 }))];
  Mt.rows.forEach((r, i) => rows.push([
    c_(r[0], { align: 'right', fontSize: 8.6, bold: true, color: GREEN_DK, fill: zebra(i) }),
    c_(r[1], { align: 'right', fontSize: 8.4, fill: zebra(i) }),
    c_(r[2], { align: 'right', fontSize: 8.4, fill: zebra(i) }),
  ]));
  rtable(s, { x: M, y: 2.94, w: CW, colW: [c1, c2, rest - c2], rows, opts: { rowH: [0.32, ...Array(Mt.rows.length).fill(0.44)] } });
  const sy = 5.42, sw = 6.3;
  const sig = [['م', 'الاسم', 'التوقيع'].map((h) => hc(h, { fontSize: 9 }))];
  for (let i = 0; i < Mt.sigRows; i++) sig.push([c_(arNum(i + 1), { bold: true, color: W_, fill: { color: GREEN }, fontSize: 8.4 }), c_('', { fill: zebra(i) }), c_('', { fill: zebra(i) })]);
  const rh = Math.min(0.24, (7.0 - sy - 0.3) / Mt.sigRows);
  rtable(s, { x: PW - M - sw, y: sy, w: sw, colW: [0.6, 3.4, sw - 4.0], rows: sig, opts: { rowH: [0.28, ...Array(Mt.sigRows).fill(rh)] } });
  const qx = M, qw = CW - sw - 0.4;
  card(s, qx, sy + 0.3, qw, 1.0, { fill: { color: MINT } });
  T(s, 'يعتمد / مديرة المدرسة', { x: qx + 0.3, y: sy + 0.42, w: qw - 0.6, h: 0.32, fontSize: 12, bold: true, color: GREEN_DK });
  T(s, '……………………………………………', { x: qx + 0.3, y: sy + 0.78, w: qw - 0.6, h: 0.32, fontSize: 12, color: MUTED });
}
meetingSlide(D2.meetings[0]);

/* ============================================================ ROLE TASKS */
D2.roleTasks.forEach((RT) => {
  const s = slide();
  head(s, 'سجل الاجتماعات', 'مهام فريق العمل');
  footer(s, 'فريق إعداد الخطة');
  RT.blocks.forEach((b, bi) => {
    const y0 = 1.12 + bi * 2.98;
    card(s, M, y0, CW, 0.58, { fill: { color: GREEN }, line: { type: 'none' } });
    iconDisc(s, b.icon, PW - M - 0.64, y0 + 0.09, 0.4, { bg: W_, fg: 'green', border: null });
    T(s, b.job, { x: PW - M - 6.8, y: y0, w: 6.0, h: 0.58, valign: 'middle', fontSize: 12.5, bold: true, color: W_ });
    T(s, [
      { text: 'الاسم:  ………………………………          ', options: { color: 'CFE2DB' } },
      { text: 'المهمة في فريق التخطيط:  ', options: { color: 'CFE2DB' } },
      { text: b.role, options: { color: GOLD, bold: true } },
    ], { x: M + 0.28, y: y0, w: 5.8, h: 0.58, valign: 'middle', fontSize: 9.4, align: 'left' });
    const rows = [[hc('م', { fontSize: 8.8 }), hc('البيان', { fontSize: 8.8 }), hc('نفذ', { fontSize: 8.8 }), hc('لم ينفذ', { fontSize: 8.8 }), hc('ملاحظات', { fontSize: 8.8 })]];
    b.items.forEach((it, i) => rows.push([
      c_(arNum(i + 1), { bold: true, color: GREEN_DK, fontSize: 8.4, fill: zebra(i) }),
      c_(it, { align: 'right', fontSize: 8.5, fill: zebra(i) }),
      c_('☐', { fontSize: 11, fill: zebra(i) }), c_('☐', { fontSize: 11, fill: zebra(i) }), c_('', { fill: zebra(i) }),
    ]));
    const n = b.items.length;
    const rh = Math.min(0.31, 1.86 / n);
    rtable(s, { x: M, y: y0 + 0.66, w: CW, colW: [0.5, CW - 4.8, 0.8, 0.9, 2.6], rows, opts: { rowH: [0.28, ...Array(n).fill(rh)] } });
  });
});

/* ============================================================ COMMITTEE MEETINGS */
D2.meetings.slice(1).forEach(meetingSlide);

/* ============================================================ DIVIDER 4 — ENHANCEMENTS */
divider('الجزء الرابع', '04', 'أدوات تطوير الخطة', [
  'خط الأساس والمستهدفات الرقمية', 'سجل مخاطر تنفيذ الخطة',
  'الميزانية التشغيلية التقديرية', 'المخطط الزمني للبرامج',
  'لوحة المتابعة الفصلية', 'مواءمة الخطة مع رؤية ٢٠٣٠',
  'مصفوفة المسؤوليات وخطة التواصل', '',
].filter(Boolean));

const KICK4 = 'الجزء الرابع · أدوات تطوير الخطة';

/* ---------------- 4.1 BASELINE & TARGETS ---------------- */
(function () {
  const s = slide();
  head(s, KICK4, 'خط الأساس والمستهدفات الرقمية');
  footer(s, 'خط الأساس والمستهدفات');
  const B = D3.baseline;
  T(s, B.intro, { x: M, y: 1.1, w: CW, h: 0.52, fontSize: 10.4, color: BODY, lineSpacingMultiple: 1.2 });
  const cw = [0.45, 4.0, 1.05, 1.15, 1.05, 1.15, 2.15, CW - 11.0];
  const rows = [B.head.map((h) => hc(h, { fontSize: 8.8 }))];
  B.rows.forEach((r, i) => rows.push([
    c_(r[0], { fontSize: 8.4, fill: zebra(i) }),
    c_(r[1], { align: 'right', fontSize: 8.6, bold: true, color: GREEN_DK, fill: zebra(i) }),
    c_(r[2], { fontSize: 8, color: MUTED, fill: zebra(i) }),
    c_(r[3], { fontSize: 9, bold: true, color: i === 0 ? TEAL : MUTED, fill: zebra(i) }),
    c_(r[4], { fontSize: 9, bold: true, color: GREEN, fill: zebra(i) }),
    c_(r[5], { fontSize: 8.4, color: MUTED, fill: zebra(i) }),
    c_(r[6], { fontSize: 8.2, fill: zebra(i) }),
    c_(r[7], { fontSize: 8.2, fill: zebra(i) }),
  ]));
  rtable(s, { x: M, y: 1.74, w: CW, colW: cw, rows, opts: { rowH: [0.36, ...Array(B.rows.length).fill(0.36)] } });
  const nw = (CW - 2 * 0.24) / 3, ny = 5.62;
  B.notes.forEach((n, i) => {
    const x = PW - M - nw - i * (nw + 0.24), hero = i === 0;
    card(s, x, ny, nw, 1.32, hero ? { fill: { color: GREEN }, line: { type: 'none' }, shadow: deep(0.2) } : { fill: { color: MINT } });
    T(s, n.t, { x: x + 0.22, y: ny + 0.16, w: nw - 0.44, h: 0.32, fontSize: 11.5, bold: true, color: hero ? W_ : GREEN_DK });
    T(s, n.d, { x: x + 0.22, y: ny + 0.54, w: nw - 0.44, h: 0.68, fontSize: 8.8, color: hero ? 'D2E4DD' : BODY, lineSpacingMultiple: 1.18 });
  });
})();

/* ---------------- 4.2 RISK REGISTER ---------------- */
(function () {
  const s = slide();
  head(s, KICK4, 'سجل مخاطر تنفيذ الخطة');
  footer(s, 'سجل المخاطر');
  const R = D3.risks;
  T(s, R.intro, { x: M, y: 1.1, w: CW, h: 0.5, fontSize: 10.4, color: BODY, lineSpacingMultiple: 1.2 });
  const sev = { 'مرتفعة': 'B3261E', 'متوسطة': 'C9A45C', 'منخفضة': TEAL };
  const cw = [0.45, 3.9, 1.15, 0.95, 1.35, CW - 11.05, 1.85];
  const rows = [R.head.map((h) => hc(h, { fontSize: 8.8 }))];
  R.rows.forEach((r, i) => rows.push([
    c_(r[0], { fontSize: 8.4, fill: zebra(i) }),
    c_(r[1], { align: 'right', fontSize: 8.6, bold: true, color: GREEN_DK, fill: zebra(i) }),
    c_(r[2], { fontSize: 8.4, fill: zebra(i) }),
    c_(r[3], { fontSize: 8.4, fill: zebra(i) }),
    c_(r[4], { fontSize: 8.6, bold: true, color: sev[r[4]] || BODY, fill: zebra(i) }),
    c_(r[5], { align: 'right', fontSize: 8.2, fill: zebra(i) }),
    c_(r[6], { fontSize: 8.2, fill: zebra(i) }),
  ]));
  rtable(s, { x: M, y: 1.72, w: CW, colW: cw, rows, opts: { rowH: [0.36, ...Array(R.rows.length).fill(0.45)] } });
  const ly = 5.5, lw = (CW - 2 * 0.24) / 3;
  R.legend.forEach((l, i) => {
    const x = PW - M - lw - i * (lw + 0.24);
    card(s, x, ly, lw, 0.72, { fill: { color: MINT } });
    s.addShape('roundRect', { x: x + lw - 0.52, y: ly + 0.21, w: 0.3, h: 0.3, fill: { color: l.c }, line: { type: 'none' }, rectRadius: 0.06 });
    T(s, l.t, { x: x + 0.2, y: ly + 0.08, w: lw - 0.8, h: 0.3, fontSize: 10.5, bold: true, color: GREEN_DK, valign: 'middle' });
    T(s, l.d, { x: x + 0.2, y: ly + 0.38, w: lw - 0.8, h: 0.28, fontSize: 8.4, color: MUTED, valign: 'middle' });
  });
  card(s, M, 6.42, CW, 0.56, { fill: { color: GREEN }, line: { type: 'none' } });
  T(s, 'يُحدَّث هذا السجل في كل جولة متابعة، وتُرفع المخاطر المرتفعة إلى اجتماع اللجنة الإدارية مع إجراء تصحيحي موثّق.',
    { x: M + 0.3, y: 6.42, w: CW - 0.6, h: 0.56, valign: 'middle', fontSize: 10, bold: true, color: W_ });
})();

/* ---------------- 4.3 BUDGET ---------------- */
(function () {
  const s = slide();
  head(s, KICK4, 'الميزانية التشغيلية التقديرية');
  footer(s, 'الميزانية التشغيلية');
  const B = D3.budget;
  T(s, B.intro, { x: M, y: 1.1, w: CW, h: 0.5, fontSize: 10.4, color: BODY, lineSpacingMultiple: 1.2 });
  const tw = (CW - 3 * 0.26) / 4;
  B.tiles.forEach((t, i) => {
    const x = PW - M - tw - i * (tw + 0.26), y = 1.7, hero = i === 0;
    card(s, x, y, tw, 0.86, hero ? { fill: { color: GREEN }, line: { type: 'none' }, shadow: deep(0.18) } : { line: { color: GREEN, width: 1 } });
    T(s, t.v, { x: x + 0.18, y, w: tw * 0.42, h: 0.86, fontSize: hero ? 15 : 22, fontFace: XB, color: hero ? W_ : GREEN, valign: 'middle', align: 'center' });
    T(s, t.t, { x: x + tw * 0.42, y, w: tw * 0.58 - 0.16, h: 0.86, fontSize: 9.6, bold: true, color: hero ? 'CFE2DB' : BODY, valign: 'middle', lineSpacingMultiple: 1.05 });
  });
  const prio = { 'أساسية': GREEN, 'تعزيزية': TEAL, 'اختيارية': MUTED };
  const cw = [0.45, 4.4, 1.7, 2.3, 2.2, CW - 11.05];
  const rows = [B.head.map((h) => hc(h, { fontSize: 8.8 }))];
  B.rows.forEach((r, i) => rows.push([
    c_(r[0], { fontSize: 8.4, fill: zebra(i) }),
    c_(r[1], { align: 'right', fontSize: 8.8, bold: true, color: GREEN_DK, fill: zebra(i) }),
    c_(r[2], { fontSize: 8.4, fill: zebra(i) }),
    c_(r[3], { fontSize: 8.8, color: MUTED, fill: zebra(i) }),
    c_(r[4], { fontSize: 8.4, fill: zebra(i) }),
    c_(r[5], { fontSize: 8.6, bold: true, color: prio[r[5]], fill: zebra(i) }),
  ]));
  rtable(s, { x: M, y: 2.72, w: CW, colW: cw, rows, opts: { rowH: [0.34, ...Array(B.rows.length).fill(0.35)] } });
  card(s, M, 6.02, CW, 0.9, { fill: { color: GREEN }, line: { type: 'none' }, shadow: deep(0.2) });
  s.addImage({ path: A('dots_white.png'), x: M + 0.12, y: 6.08, w: 1.2, h: 0.78, transparency: 74 });
  T(s, B.note.t, { x: PW - M - 3.3, y: 6.02, w: 3.0, h: 0.9, fontSize: 12, bold: true, color: W_, valign: 'middle' });
  T(s, B.note.d, { x: M + 1.5, y: 6.02, w: CW - 5.1, h: 0.9, fontSize: 9.2, color: 'D2E4DD', valign: 'middle', lineSpacingMultiple: 1.16 });
})();

/* ---------------- 4.4 GANTT ---------------- */
(function () {
  const s = slide();
  head(s, KICK4, 'المخطط الزمني لبرامج الخطة');
  footer(s, 'المخطط الزمني');
  const Ga = D3.gantt;
  T(s, Ga.intro, { x: M, y: 1.1, w: CW, h: 0.46, fontSize: 10.4, color: BODY, lineSpacingMultiple: 1.2 });
  const LBL = 3.9, TX0 = M, TW = CW - LBL;          // timeline area on the left
  const XR = PW - M - LBL;                           // right edge of timeline (week 1)
  const xOf = (w) => XR - (w / 36) * TW;
  const y0 = 2.24, rh = 0.4;
  // semester bands
  s.addShape('rect', { x: xOf(18), y: y0 - 0.42, w: XR - xOf(18), h: 0.3, fill: { color: MINT }, line: { type: 'none' } });
  s.addShape('rect', { x: xOf(36), y: y0 - 0.42, w: xOf(18) - xOf(36), h: 0.3, fill: { color: ICE }, line: { type: 'none' } });
  T(s, 'الفصل الأول', { x: xOf(18), y: y0 - 0.43, w: XR - xOf(18), h: 0.3, align: 'center', valign: 'middle', fontSize: 9, bold: true, color: GREEN });
  T(s, 'الفصل الثاني', { x: xOf(36), y: y0 - 0.43, w: xOf(18) - xOf(36), h: 0.3, align: 'center', valign: 'middle', fontSize: 9, bold: true, color: '0B4A56' });
  // week ticks
  Ga.ticks.forEach((w) => {
    s.addShape('line', { x: xOf(w), y: y0 - 0.08, w: 0, h: 10 * rh + 0.1, line: { color: LINE, width: 0.75 } });
    T(s, arNum(w), { x: xOf(w) - 0.3, y: y0 - 0.3, w: 0.6, h: 0.22, align: 'center', fontSize: 7.6, color: MUTED });
  });
  // milestones
  Ga.milestones.forEach((m) => {
    s.addShape('line', { x: xOf(m.w), y: y0 - 0.08, w: 0, h: 10 * rh + 0.1, line: { color: GOLD, width: 1.25, dashType: 'dash' } });
    s.addShape('diamond', { x: xOf(m.w) - 0.07, y: y0 + 10 * rh + 0.04, w: 0.14, h: 0.14, fill: { color: GOLD }, line: { type: 'none' } });
    T(s, m.t, { x: xOf(m.w) - 0.72, y: y0 + 10 * rh + 0.2, w: 1.44, h: 0.24, align: 'center', fontSize: 7.4, bold: true, color: GOLD });
  });
  Ga.goals.forEach((g, i) => {
    const y = y0 + i * rh;
    if (i % 2) s.addShape('rect', { x: TX0, y, w: CW, h: rh, fill: { color: MINT }, line: { type: 'none' } });
    T(s, arNum(i + 1) + '.  ' + g.t, { x: PW - M - LBL + 0.12, y, w: LBL - 0.2, h: rh, valign: 'middle', fontSize: 8.8, bold: true, color: GREEN_DK });
    const bx = xOf(g.b), bw = xOf(g.a) - xOf(g.b);
    s.addShape('roundRect', { x: bx, y: y + 0.09, w: bw, h: rh - 0.18, fill: { color: i === 9 ? GOLD : GREEN }, line: { type: 'none' }, rectRadius: 0.05 });
    T(s, 'أسبوع ' + arNum(g.a) + ' إلى ' + arNum(g.b), { x: bx, y: y + 0.08, w: bw, h: rh - 0.16, align: 'center', valign: 'middle', fontSize: 7.4, color: i === 9 ? '3B2C0C' : 'D8EAE4' });
  });
})();

/* ---------------- 4.5 MONITORING DASHBOARD ---------------- */
(function () {
  const s = slide();
  head(s, KICK4, 'لوحة المتابعة الفصلية');
  footer(s, 'لوحة المتابعة');
  const Db = D3.dashboard;
  T(s, Db.intro, { x: M, y: 1.1, w: CW, h: 0.46, fontSize: 10.4, color: BODY, lineSpacingMultiple: 1.2 });
  const tw = (CW - 3 * 0.26) / 4;
  Db.tiles.forEach((t, i) => {
    const x = PW - M - tw - i * (tw + 0.26), y = 1.68, hero = i % 2 === 0;
    card(s, x, y, tw, 0.8, hero ? { fill: { color: GREEN }, line: { type: 'none' }, shadow: deep(0.18) } : { line: { color: GREEN, width: 1 } });
    T(s, t.v, { x: x + 0.18, y, w: tw * 0.34, h: 0.8, fontSize: 20, fontFace: XB, color: hero ? W_ : GREEN, valign: 'middle', align: 'center' });
    T(s, t.t, { x: x + tw * 0.34, y, w: tw * 0.66 - 0.16, h: 0.8, fontSize: 9.6, bold: true, color: hero ? 'CFE2DB' : BODY, valign: 'middle', lineSpacingMultiple: 1.05 });
  });
  const cw = [4.6, ...Array(4).fill((CW - 4.6) / 4)];
  const rows = [[hc('الهدف الاستراتيجي', { fontSize: 9 }), ...Db.rounds.map((r) => hc(r, { fontSize: 8 }))]];
  D3.gantt.goals.forEach((g, i) => rows.push([
    c_(arNum(i + 1) + '.  ' + g.t, { align: 'right', fontSize: 8.6, bold: true, color: GREEN_DK, fill: zebra(i) }),
    ...Array(4).fill(0).map(() => c_('☐  ☐  ☐', { fontSize: 10, color: MUTED, fill: zebra(i) })),
  ]));
  rtable(s, { x: M, y: 2.68, w: CW, colW: cw, rows, opts: { rowH: [0.42, ...Array(10).fill(0.33)] } });
  const lw = (CW - 2 * 0.24) / 3, ly = 6.42;
  Db.legend.forEach((l, i) => {
    const x = PW - M - lw - i * (lw + 0.24);
    card(s, x, ly, lw, 0.6, { fill: { color: MINT } });
    s.addShape('roundRect', { x: x + lw - 0.46, y: ly + 0.16, w: 0.28, h: 0.28, fill: { color: l.c }, line: { type: 'none' }, rectRadius: 0.05 });
    T(s, l.t, { x: x + 0.18, y: ly + 0.04, w: lw - 0.72, h: 0.28, fontSize: 10, bold: true, color: GREEN_DK, valign: 'middle' });
    T(s, l.d, { x: x + 0.18, y: ly + 0.3, w: lw - 0.72, h: 0.26, fontSize: 8, color: MUTED, valign: 'middle' });
  });
})();

/* ---------------- 4.6 VISION 2030 ALIGNMENT ---------------- */
(function () {
  const s = slide();
  head(s, KICK4, 'مواءمة الخطة مع رؤية المملكة ٢٠٣٠');
  footer(s, 'مواءمة رؤية ٢٠٣٠');
  const V = D3.vision;
  T(s, V.intro, { x: M, y: 1.1, w: CW, h: 0.5, fontSize: 10.4, color: BODY, lineSpacingMultiple: 1.2 });
  const pw = (CW - 2 * 0.26) / 3, py = 1.72;
  V.pillars.forEach((p, i) => {
    const x = PW - M - pw - i * (pw + 0.26);
    card(s, x, py, pw, 1.16, { fill: { color: i === 0 ? GREEN : W_ }, line: i === 0 ? { type: 'none' } : { color: GREEN, width: 1 }, shadow: i === 0 ? deep(0.18) : soft(0.05) });
    iconDisc(s, p.icon, x + pw - 0.78, py + 0.18, 0.5, i === 0 ? { bg: W_, fg: 'green', border: null } : {});
    T(s, p.t, { x: x + 0.22, y: py + 0.18, w: pw - 1.08, h: 0.36, fontSize: 12.5, bold: true, color: i === 0 ? W_ : GREEN_DK, valign: 'middle' });
    T(s, p.d, { x: x + 0.22, y: py + 0.6, w: pw - 0.5, h: 0.48, fontSize: 8.8, color: i === 0 ? 'D2E4DD' : MUTED, lineSpacingMultiple: 1.14 });
  });
  const cw = [4.5, 4.0, 2.7, CW - 11.2];
  const rows = [V.head.map((h) => hc(h, { fontSize: 9.2 }))];
  V.rows.forEach((r, i) => rows.push([
    c_(r[0], { align: 'right', fontSize: 9, bold: true, color: GREEN_DK, fill: zebra(i) }),
    c_(r[1], { align: 'right', fontSize: 8.6, fill: zebra(i) }),
    c_(r[2], { align: 'right', fontSize: 8.6, color: '0B4A56', fill: zebra(i) }),
    c_(r[3], { fontSize: 8.2, color: MUTED, fill: zebra(i) }),
  ]));
  rtable(s, { x: M, y: 3.12, w: CW, colW: cw, rows, opts: { rowH: [0.36, ...Array(V.rows.length).fill(0.42)] } });
  T(s, 'ملاحظة: الجدول يعرض أبرز الارتباطات، ويُستكمل لبقية الأهداف عند اعتماد الخطة.',
    { x: M, y: 6.62, w: CW, h: 0.3, fontSize: 9, color: MUTED });
})();

/* ---------------- 4.7 RACI + COMMUNICATION ---------------- */
(function () {
  const s = slide();
  head(s, KICK4, 'مصفوفة المسؤوليات وخطة التواصل');
  footer(s, 'مصفوفة المسؤوليات');
  const Ra = D3.raci;
  T(s, Ra.intro, { x: M, y: 1.08, w: CW, h: 0.42, fontSize: 10.4, color: BODY, lineSpacingMultiple: 1.2 });
  // RACI matrix, full width
  const rcol = [3.0, ...Array(8).fill((CW - 3.0) / 8)];
  const kc = {}; Ra.keys.forEach((k) => { kc[k.k] = k.c; });
  const rows = [[hc('نوع العمل', { fontSize: 8.8 }), ...Ra.roles.map((r) => hc(r, { fontSize: 7.6 }))]];
  Ra.tasks.forEach((t, i) => rows.push([
    c_(t.t, { align: 'right', fontSize: 8.6, bold: true, color: GREEN_DK, fill: zebra(i) }),
    ...t.v.map((v) => c_(v, { fontSize: 9.5, bold: true, color: kc[v], fill: zebra(i), fontFace: 'Arial' })),
  ]));
  rtable(s, { x: M, y: 1.56, w: CW, colW: rcol, rows, opts: { rowH: [0.46, ...Array(8).fill(0.28)] } });
  // legend keys
  const ky = 4.4, kw = (CW - 3 * 0.2) / 4;
  Ra.keys.forEach((k, i) => {
    const x = PW - M - kw - i * (kw + 0.2);
    card(s, x, ky, kw, 0.62, { fill: { color: MINT } });
    chip(s, x + kw - 0.5, ky + 0.16, 0.32, 0.32, k.k, { fill: k.c, fontSize: 9.5, r: 0.06 });
    T(s, k.t, { x: x + 0.18, y: ky + 0.04, w: kw - 0.74, h: 0.28, fontSize: 9.8, bold: true, color: GREEN_DK, valign: 'middle' });
    T(s, k.d, { x: x + 0.18, y: ky + 0.3, w: kw - 0.74, h: 0.28, fontSize: 7.8, color: MUTED, valign: 'middle' });
  });
  // communication plan (right) + student voice (left)
  const cwid = 7.3, cx = PW - M - cwid, cy = 5.5;
  label(s, PW - M - 2.6, cy - 0.34, 2.6, Ra.comm.title);
  const crows = [Ra.comm.head.map((h) => hc(h, { fontSize: 8.4 }))];
  Ra.comm.rows.forEach((r, i) => crows.push([
    c_(r[0], { fontSize: 8.2, bold: true, color: GREEN_DK, fill: zebra(i) }),
    c_(r[1], { align: 'right', fontSize: 8, fill: zebra(i) }),
    c_(r[2], { fontSize: 8, color: TEAL, bold: true, fill: zebra(i) }),
    c_(r[3], { fontSize: 8, fill: zebra(i) }),
  ]));
  rtable(s, { x: cx, y: cy, w: cwid, colW: [1.5, 2.6, 0.9, cwid - 5.0], rows: crows, opts: { rowH: [0.28, ...Array(4).fill(0.28)] } });
  const vw = CW - cwid - 0.3;
  card(s, M, cy - 0.34, vw, 1.74, { fill: { color: GREEN }, line: { type: 'none' }, shadow: deep(0.2) });
  s.addImage({ path: A('arc_white.png'), x: M + vw - 1.4, y: cy - 0.42, w: 1.5, h: 1.5, transparency: 78 });
  T(s, 'صوت الطالب', { x: M + 0.28, y: cy - 0.2, w: vw - 0.9, h: 0.34, fontSize: 12.5, bold: true, color: W_ });
  T(s, 'الاستبانات في الخطة الأصلية موجّهة للأولياء والكادر. إضافة قناة قياس لرأي الطالب في الأنشطة وبيئة الصف تجعل التحسين مبنيًا على المستفيد الأول منه.',
    { x: M + 0.28, y: cy + 0.2, w: vw - 0.56, h: 1.14, fontSize: 9.2, color: 'D2E4DD', lineSpacingMultiple: 1.22 });
})();

/* ============================================================ CLOSING */
(function () {
  const s = slide('bg_closing.jpg');
  pageNo--;
  s.addImage({ path: A('moe_white.png'), x: PW / 2 - 0.78, y: 1.5, w: 1.56, h: 1.206 });
  const dy = 3.16;
  s.addShape('line', { x: PW / 2 - 1.4, y: dy, w: 1.15, h: 0, line: { color: GOLD, width: 1 } });
  s.addShape('line', { x: PW / 2 + 0.25, y: dy, w: 1.15, h: 0, line: { color: GOLD, width: 1 } });
  s.addShape('diamond', { x: PW / 2 - 0.06, y: dy - 0.06, w: 0.12, h: 0.12, fill: { color: GOLD }, line: { type: 'none' } });
  T(s, 'بالتخطيط نصنع التميّز', { x: 1.2, y: 3.44, w: PW - 2.4, h: 0.8, align: 'center', valign: 'middle', fontSize: 36, color: W_, fontFace: XB });
  T(s, 'وبالعمل المشترك نحقّق الأهداف', { x: 1.2, y: 4.3, w: PW - 2.4, h: 0.5, align: 'center', fontSize: 17, color: GOLD, bold: true });
  T(s, D.meta.docTitle, { x: 1.2, y: 5.5, w: PW - 2.4, h: 0.36, align: 'center', fontSize: 12, color: 'C7DCD5' });
})();

pptx.writeFile({ fileName: path.resolve(__dirname, '../out/plan_1448.pptx') })
  .then(() => console.log('WROTE plan_1448.pptx'));
