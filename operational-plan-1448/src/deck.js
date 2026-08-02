// Modern MOE operational-plan deck (Arabic RTL, green identity)
const pptxgen = require('pptxgenjs');
const path = require('path');
const D = require('./data');

const A = (f) => path.resolve(__dirname, '../assets', f);
const ICON = (n, c) => path.resolve(__dirname, '../assets/icons', `${n}_${c}.png`);

// ---------- tokens ----------
const GREEN = '095242';
const GREEN_DK = '063E33';
const GREEN_LT = '0B5E4C';
const TEAL = '0089A1';
const GOLD = 'C9A45C';
const INK = '0F2A21';
const BODY = '33473F';
const MUTED = '7C8F87';
const LINE = 'DCE8E2';
const MINT = 'F1F7F4';
const ICE = 'EBF6F8';
const OLIVE = 'D7E4BD';
const OLIVE_TX = '46551F';
const WHITE = 'FFFFFF';

const FONT = 'Tajawal';
const FONT_XB = 'Tajawal ExtraBold';

const PW = 13.333, PH = 7.5, M = 0.45;
const CW = PW - 2 * M; // 12.433

const pptx = new pptxgen();
pptx.defineLayout({ name: 'W', width: PW, height: PH });
pptx.layout = 'W';
pptx.rtlMode = true;
pptx.author = 'وزارة التعليم';
pptx.title = D.meta.docTitle;

// ---------- helpers ----------
function AR(o = {}) {
  return Object.assign({ fontFace: FONT, lang: 'ar-SA', rtlMode: true, align: 'right', valign: 'top', margin: 0, color: BODY, fontSize: 11 }, o);
}
function text(s, str, o) { s.addText(str, AR(o)); }
function rect(s, x, y, w, h, o = {}) {
  const base = { x, y, w, h, fill: { color: WHITE }, line: { color: LINE, width: 0.75 }, rectRadius: 0.075 };
  s.addShape('roundRect', Object.assign(base, o));
}
function bar(s, x, y, w, h, o = {}) {
  s.addShape('rect', Object.assign({ x, y, w, h, fill: { color: GREEN }, line: { type: 'none' } }, o));
}
function icon(s, name, color, x, y, size) {
  s.addImage({ path: ICON(name, color), x, y, w: size, h: size });
}
function chipNum(s, x, y, size, num, o = {}) {
  const fill = o.fill || GREEN, col = o.color || WHITE, fs = o.fontSize || 12;
  s.addShape('roundRect', { x, y, w: size, h: size, fill: { color: fill }, line: { type: 'none' }, rectRadius: Math.min(0.09, size * 0.22) });
  text(s, num, { x, y: y - 0.015, w: size, h: size, align: 'center', valign: 'middle', color: col, bold: true, fontSize: fs });
}
let pageNo = 0;
function newSlide(bg) {
  const s = pptx.addSlide();
  pageNo++;
  if (bg !== null) s.addImage({ path: A(bg || 'bg_content.png'), x: 0, y: 0, w: PW, h: PH });
  return s;
}
const AD = '٠١٢٣٤٥٦٧٨٩';
const arNum = (n) => String(n).split('').map((d) => AD[+d] ?? d).join('');
function footer(s) {
  text(s, D.meta.footer, { x: PW - M - 4.5, y: 7.13, w: 4.5, h: 0.3, fontSize: 8, color: MUTED, align: 'right' });
  text(s, arNum(String(pageNo).padStart(2, '0')), { x: M, y: 7.13, w: 1.0, h: 0.3, fontSize: 8.5, color: MUTED, align: 'left', bold: true });
}
function header(s, title, iconName) {
  s.addImage({ path: A('moe_green.png'), x: M, y: 0.24, w: 0.86, h: 0.665 });
  const chip = 0.56;
  s.addShape('roundRect', { x: PW - M - chip, y: 0.3, w: chip, h: chip, fill: { color: GREEN }, line: { type: 'none' }, rectRadius: 0.12 });
  icon(s, iconName, 'white', PW - M - chip + 0.13, 0.3 + 0.13, 0.3);
  text(s, title, { x: 3.2, y: 0.3, w: PW - M - chip - 0.18 - 3.2, h: chip, fontSize: 20, bold: true, color: INK, valign: 'middle' });
}
function sectionLabel(s, x, y, w, str, o = {}) {
  bar(s, x + w - 0.055, y + 0.05, 0.055, 0.22, { fill: { color: TEAL } });
  text(s, str, { x, y, w: w - 0.14, h: 0.32, fontSize: o.fontSize || 12.5, bold: true, color: o.color || GREEN, valign: 'middle' });
}
// RTL table: rows given rightmost-first; reversed for pptxgenjs LTR grid
function rtable(s, { x, y, w, colW, rows, opts = {} }) {
  const rev = rows.map((r) => r.slice().reverse());
  s.addTable(rev, Object.assign({
    x, y, w, colW: colW.slice().reverse(),
    border: { pt: 0.5, color: LINE }, margin: 0.04,
    valign: 'middle', align: 'center', fontFace: FONT, autoPage: false,
  }, opts));
}
function hcell(t, o = {}) {
  return { text: t, options: Object.assign({ fill: { color: GREEN }, color: WHITE, bold: true, fontSize: 9.5, align: 'center', valign: 'middle', fontFace: FONT, rtlMode: true, lang: 'ar-SA' }, o) };
}
function cell(t, o = {}) {
  return { text: t, options: Object.assign({ color: BODY, fontSize: 9, align: 'center', valign: 'middle', fontFace: FONT, rtlMode: true, lang: 'ar-SA' }, o) };
}

/* ============================================================ 1 — COVER */
(function cover() {
  const s = newSlide('bg_cover.png');
  s.addImage({ path: A('moe_white.png'), x: PW / 2 - 0.83, y: 0.62, w: 1.66, h: 1.284 });
  // gold divider with diamond
  const dy = 2.18;
  s.addShape('line', { x: PW / 2 - 1.5, y: dy, w: 1.28, h: 0, line: { color: GOLD, width: 1 } });
  s.addShape('line', { x: PW / 2 + 0.22, y: dy, w: 1.28, h: 0, line: { color: GOLD, width: 1 } });
  s.addShape('diamond', { x: PW / 2 - 0.055, y: dy - 0.055, w: 0.11, h: 0.11, fill: { color: GOLD }, line: { type: 'none' } });
  text(s, 'الخطة التشغيلية', { x: 1.5, y: 2.42, w: PW - 3, h: 1.15, align: 'center', fontSize: 54, color: WHITE, fontFace: FONT_XB, valign: 'middle' });
  text(s, 'للعام الدراسي ١٤٤٨هـ', { x: 1.5, y: 3.62, w: PW - 3, h: 0.55, align: 'center', fontSize: 24, color: GOLD, bold: true, valign: 'middle' });
  // stage pill
  const pw2 = 2.1;
  s.addShape('roundRect', { x: PW / 2 - pw2 / 2, y: 4.38, w: pw2, h: 0.5, fill: { color: WHITE, transparency: 88 }, line: { color: GOLD, width: 1 }, rectRadius: 0.25 });
  text(s, 'جميع المراحل', { x: PW / 2 - pw2 / 2, y: 4.36, w: pw2, h: 0.5, align: 'center', valign: 'middle', fontSize: 15, bold: true, color: WHITE });
  // school / principal fields
  const fw = 7.6, fx = PW / 2 - fw / 2, fy = 5.28;
  s.addShape('roundRect', { x: fx, y: fy, w: fw, h: 1.12, fill: { color: WHITE, transparency: 90 }, line: { color: 'FFFFFF', width: 0.75, transparency: 55 }, rectRadius: 0.1 });
  text(s, [
    { text: D.meta.schoolField + '  ', options: { bold: true, color: WHITE, fontSize: 14 } },
    { text: '……………………………………', options: { color: 'D8E6E1', fontSize: 13 } },
  ], { x: fx + 0.45, y: fy + 0.12, w: fw - 0.9, h: 0.44, valign: 'middle' });
  text(s, [
    { text: D.meta.principalField + '  ', options: { bold: true, color: WHITE, fontSize: 14 } },
    { text: '……………………………………', options: { color: 'D8E6E1', fontSize: 13 } },
  ], { x: fx + 0.45, y: fy + 0.58, w: fw - 0.9, h: 0.44, valign: 'middle' });
  text(s, D.meta.file, { x: 1.5, y: 6.78, w: PW - 3, h: 0.4, align: 'center', fontSize: 11.5, color: 'BFD6CE' });
})();

/* ============================================================ 2 — TOC */
(function toc() {
  const s = newSlide();
  header(s, 'فهرس المحتويات', 'listchecks');
  footer(s);
  const cols = 3, rows = 5, gx = 0.24, gy = 0.22;
  const cw = (CW - gx * (cols - 1)) / cols, ch = 0.86;
  const y0 = 1.42;
  D.toc.forEach((t, i) => {
    const r = Math.floor(i / cols), c = i % cols; // c=0 rightmost
    const x = PW - M - cw - c * (cw + gx);
    const y = y0 + r * (ch + gy);
    rect(s, x, y, cw, ch, { shadow: { type: 'outer', color: '0E3B30', opacity: 0.07, blur: 5, offset: 1, angle: 90 } });
    chipNum(s, x + cw - 0.62, y + (ch - 0.4) / 2, 0.4, arNum(String(i + 1).padStart(2, '0')), { fontSize: 10.5 });
    text(s, t, { x: x + 0.25, y, w: cw - 1.02, h: ch, valign: 'middle', fontSize: 13, bold: true, color: INK });
  });
})();

/* ============================================================ 3 — INTRO */
(function intro() {
  const s = newSlide();
  header(s, 'المقدمة', 'compass');
  footer(s);
  const rx = 5.35, rw = PW - M - rx; // right column
  // quote card
  rect(s, rx, 1.32, rw, 1.28, { fill: { color: ICE }, line: { color: 'CBE4EA', width: 0.75 } });
  icon(s, 'quote', 'teal', rx + rw - 0.62, 1.52, 0.34);
  text(s, D.intro.quote, { x: rx + 0.35, y: 1.32, w: rw - 1.1, h: 1.28, valign: 'middle', fontSize: 12.5, bold: true, color: '0B4A56', lineSpacingMultiple: 1.25 });
  // paragraphs
  const paras = [];
  D.intro.paras.forEach((p, i) => paras.push({ text: p, options: { paraSpaceAfter: 12, breakLine: true } }));
  text(s, paras, { x: rx, y: 2.85, w: rw, h: 3.9, fontSize: 12, color: BODY, lineSpacingMultiple: 1.32, valign: 'top' });
  // left cards
  const lw = 4.45, lx = M;
  D.intro.cards.forEach((c, i) => {
    const y = 1.32 + i * 1.85;
    const filled = i === 2;
    rect(s, lx, y, lw, 1.62, filled
      ? { fill: { color: GREEN }, line: { type: 'none' }, shadow: { type: 'outer', color: '083528', opacity: 0.28, blur: 8, offset: 2, angle: 90 } }
      : { shadow: { type: 'outer', color: '0E3B30', opacity: 0.07, blur: 5, offset: 1, angle: 90 } });
    text(s, c.n, { x: lx + lw - 0.85, y: y + 0.16, w: 0.6, h: 0.5, align: 'center', fontSize: 20, fontFace: FONT_XB, color: filled ? GOLD : TEAL });
    text(s, c.t, { x: lx + 0.3, y: y + 0.18, w: lw - 1.2, h: 0.42, fontSize: 15, bold: true, color: filled ? WHITE : INK, valign: 'middle' });
    text(s, c.d, { x: lx + 0.3, y: y + 0.68, w: lw - 0.62, h: 0.8, fontSize: 11, color: filled ? 'D3E5DE' : BODY, lineSpacingMultiple: 1.2 });
  });
})();

/* ============================================================ 4 — TEAM */
(function team() {
  const s = newSlide();
  header(s, 'فريق إعداد الخطة', 'users');
  footer(s);
  // badge
  rect(s, 1.55, 0.37, 2.6, 0.42, { fill: { color: MINT }, line: { color: LINE, width: 0.75 }, rectRadius: 0.21 });
  text(s, D.team.badge, { x: 1.55, y: 0.36, w: 2.6, h: 0.42, align: 'center', valign: 'middle', fontSize: 9.5, bold: true, color: GREEN });
  text(s, D.team.intro, { x: 3.65, y: 1.08, w: CW - 3.2, h: 0.62, fontSize: 10.5, color: BODY, lineSpacingMultiple: 1.2 });
  // roles table (right)
  const tx = 3.65, tw = PW - M - tx;
  const rows = [[hcell('م'), hcell('الدور'), hcell('المهام والمسؤوليات')]];
  D.team.roles.forEach((r, i) => rows.push([
    cell(r[0], { fontSize: 9 }),
    cell(r[1], { bold: true, color: GREEN_DK, fontSize: 9, align: 'right' }),
    cell(r[2], { fontSize: 8.8, align: 'right', color: BODY, fill: { color: i % 2 ? MINT : WHITE } }),
  ]));
  rows.forEach((r, i) => { if (i > 0) { r[0].options.fill = r[1].options.fill = { color: i % 2 === 0 ? MINT : WHITE }; } });
  rtable(s, { x: tx, y: 1.78, w: tw, colW: [0.42, 2.05, tw - 2.47], rows, opts: { rowH: [0.34, 0.56, 0.56, 0.62, 0.56, 0.62, 0.62, 0.62, 0.62] } });
  // duties sidebar (left)
  const lw = 2.95;
  sectionLabel(s, M, 1.08, lw, 'مهام الفريق الرئيسية');
  const dIcons = ['chart', 'target', 'users', 'refresh'];
  D.team.duties.forEach((d2, i) => {
    const y = 1.55 + i * 1.36;
    rect(s, M, y, lw, 1.2, { shadow: { type: 'outer', color: '0E3B30', opacity: 0.06, blur: 4, offset: 1, angle: 90 } });
    icon(s, dIcons[i], 'green', M + lw - 0.52, y + 0.16, 0.3);
    text(s, d2.t, { x: M + 0.2, y: y + 0.12, w: lw - 0.78, h: 0.36, fontSize: 10.5, bold: true, color: GREEN_DK, valign: 'middle' });
    text(s, d2.d, { x: M + 0.2, y: y + 0.5, w: lw - 0.42, h: 0.64, fontSize: 8.6, color: MUTED, lineSpacingMultiple: 1.12 });
  });
})();

/* ============================================================ 5 — STAFF PARTICIPATION */
(function staff() {
  const s = newSlide();
  header(s, 'فريق إعداد الخطة — مشاركة الكادر', 'penline');
  footer(s);
  rect(s, M, 1.16, CW, 0.78, { fill: { color: ICE }, line: { color: 'CBE4EA', width: 0.75 } });
  icon(s, 'info', 'teal', PW - M - 0.55, 1.4, 0.3);
  text(s, D.staffTasks.note, { x: M + 0.25, y: 1.16, w: CW - 1.0, h: 0.78, valign: 'middle', fontSize: 9.8, color: '0B4A56', lineSpacingMultiple: 1.18 });
  const tw = (CW - 0.3) / 2;
  const mk = (from, x) => {
    const rows = [[hcell('م', { fontSize: 8.6 }), hcell('المهمة في الخطة التشغيلية', { fontSize: 8.6 }), hcell('اسم المعلم', { fontSize: 8.6 }), hcell('التوقيع', { fontSize: 8.6 })]];
    for (let i = from; i < from + 10; i++) {
      rows.push([
        cell(arNum(i + 1), { fontSize: 8 }),
        cell(D.staffTasks.tasks[i], { fontSize: 7.9, align: 'right', fill: { color: i % 2 ? MINT : WHITE } }),
        cell('', {}), cell('', {}),
      ]);
      const r = rows[rows.length - 1];
      r[0].options.fill = r[2].options.fill = r[3].options.fill = { color: i % 2 ? MINT : WHITE };
    }
    rtable(s, { x, y: 2.14, w: tw, colW: [0.36, tw - 0.36 - 1.05 - 0.85, 1.05, 0.85], rows, opts: { rowH: [0.3, ...Array(10).fill(0.44)] } });
  };
  mk(0, PW - M - tw);
  mk(10, M);
})();

/* ============================================================ 6 — SCHOOL STATS */
(function stats() {
  const s = newSlide();
  header(s, 'البيانات الإحصائية', 'database');
  footer(s);
  sectionLabel(s, PW - M - 3.2, 1.1, 3.2, 'البيانات الأساسية للمدرسة');
  const bw = CW / D.stats.basicHead.length;
  const basic = [D.stats.basicHead.map((h) => hcell(h, { fontSize: 8.8 })), D.stats.basicHead.map(() => cell('…………', { color: MUTED }))];
  rtable(s, { x: M, y: 1.5, w: CW, colW: Array(9).fill(bw), rows: basic, opts: { rowH: [0.34, 0.5] } });
  sectionLabel(s, PW - M - 3.2, 2.62, 3.2, 'الهيئة الإدارية');
  const aw = [1.15, 2.6, 2.2, 2.1, 2.2, CW - 1.15 - 2.6 - 2.2 - 2.1 - 2.2];
  const admin = [D.stats.adminHead.map((h) => hcell(h, { fontSize: 8.8 }))];
  D.stats.adminRows.forEach((r, i) => admin.push([cell(r, { bold: true, color: GREEN_DK }), cell(''), cell(''), cell(''), cell(''), cell('')].map((c) => { c.options.fill = { color: i % 2 ? MINT : WHITE }; return c; })));
  rtable(s, { x: M, y: 3.02, w: CW, colW: aw, rows: admin, opts: { rowH: [0.5, 0.42, 0.42, 0.42] } });
  // stat cards
  const cw = (CW - 3 * 0.3) / 4;
  D.stats.cards.forEach((c, i) => {
    const x = PW - M - cw - i * (cw + 0.3), y = 5.15, filled = i % 2 === 0;
    rect(s, x, y, cw, 1.5, filled
      ? { fill: { color: GREEN }, line: { type: 'none' }, shadow: { type: 'outer', color: '083528', opacity: 0.25, blur: 8, offset: 2, angle: 90 } }
      : { line: { color: GREEN, width: 1 }, shadow: { type: 'outer', color: '0E3B30', opacity: 0.06, blur: 5, offset: 1, angle: 90 } });
    text(s, '…………', { x, y: y + 0.28, w: cw, h: 0.5, align: 'center', fontSize: 16, bold: true, color: filled ? WHITE : GREEN });
    text(s, c, { x, y: y + 0.88, w: cw, h: 0.4, align: 'center', fontSize: 12.5, bold: true, color: filled ? 'CFE2DB' : BODY });
  });
})();

/* ============================================================ 7 — STUDENTS & TEACHERS */
(function students() {
  const s = newSlide();
  header(s, 'بيانات الطلاب والمعلمين', 'gradcap');
  footer(s);
  const D7 = D.students;
  sectionLabel(s, PW - M - 3.4, 1.06, 3.4, 'بيانات أعداد الطلاب حسب الصف');
  const g = [D7.gradesHead.map((h) => hcell(h, { fontSize: 8.8 }))];
  D7.gradesRows.forEach((r, i) => g.push([cell(r, { bold: true, color: GREEN_DK }), ...Array(7).fill(0).map(() => cell(''))].map((c) => { c.options.fill = { color: i % 2 ? MINT : WHITE }; return c; })));
  rtable(s, { x: M, y: 1.44, w: CW, colW: [1.6, ...Array(6).fill((CW - 1.6 - 1.35) / 6), 1.35], rows: g, opts: { rowH: [0.32, 0.38, 0.38] } });
  sectionLabel(s, PW - M - 3.4, 2.72, 3.4, 'معلمو المدرسة حسب التخصص');
  const sp = [D7.specHead.map((h) => hcell(h, { fontSize: 8.2 }))];
  D7.specRows.forEach((r, i) => sp.push([cell(r, { bold: true, color: GREEN_DK, fontSize: 8.4 }), ...Array(9).fill(0).map(() => cell(''))].map((c) => { c.options.fill = { color: i % 2 ? MINT : WHITE }; return c; })));
  rtable(s, { x: M, y: 3.1, w: CW, colW: [1.5, ...Array(8).fill((CW - 1.5 - 1.15) / 8), 1.15], rows: sp, opts: { rowH: [0.36, 0.38, 0.38] } });
  sectionLabel(s, PW - M - 3.4, 4.42, 3.4, 'شاغلو الوظائف الفنية والإدارية');
  const jb = [D7.jobsHead.map((h) => hcell(h, { fontSize: 7.6 }))];
  jb.push([cell(D7.jobsRow, { bold: true, color: GREEN_DK, fontSize: 8.4 }), ...Array(12).fill(0).map(() => cell(''))]);
  rtable(s, { x: M, y: 4.8, w: CW, colW: [1.25, ...Array(11).fill((CW - 1.25 - 1.0) / 11), 1.0], rows: jb, opts: { rowH: [0.5, 0.38] } });
  // notes
  const nw = (CW - 0.3) / 2;
  rect(s, PW - M - nw, 5.95, nw, 0.98, { fill: { color: GREEN }, line: { type: 'none' } });
  icon(s, 'check', 'white', PW - M - 0.62, 6.12, 0.3);
  text(s, D7.noteA.t, { x: PW - M - nw + 0.25, y: 6.02, w: nw - 0.95, h: 0.32, fontSize: 11, bold: true, color: WHITE });
  text(s, D7.noteA.d, { x: PW - M - nw + 0.25, y: 6.34, w: nw - 0.95, h: 0.55, fontSize: 8.6, color: 'CFE2DB', lineSpacingMultiple: 1.1 });
  rect(s, M, 5.95, nw, 0.98, {});
  icon(s, 'info', 'green', M + nw - 0.62, 6.12, 0.3);
  text(s, D7.noteB.t, { x: M + 0.25, y: 6.02, w: nw - 0.95, h: 0.32, fontSize: 11, bold: true, color: GREEN_DK });
  text(s, D7.noteB.d, { x: M + 0.25, y: 6.34, w: nw - 0.95, h: 0.55, fontSize: 8.6, color: MUTED, lineSpacingMultiple: 1.1 });
})();

/* ============================================================ 8 — VISION MISSION VALUES */
(function vmv() {
  const s = newSlide();
  header(s, 'الرؤية والرسالة والقيم', 'eye');
  footer(s);
  const cw = (CW - 0.35) / 2, y0 = 1.3, hh = 2.45;
  // vision (right, filled)
  rect(s, PW - M - cw, y0, cw, hh, { fill: { color: GREEN }, line: { type: 'none' }, shadow: { type: 'outer', color: '083528', opacity: 0.28, blur: 9, offset: 2, angle: 90 } });
  s.addImage({ path: A('dots_white.png'), x: PW - M - cw + 0.15, y: y0 + hh - 1.3, w: 1.9, h: 1.25, transparency: 55 });
  s.addShape('ellipse', { x: PW - M - 0.95, y: y0 + 0.3, w: 0.62, h: 0.62, fill: { color: WHITE }, line: { type: 'none' } });
  icon(s, 'eye', 'green', PW - M - 0.95 + 0.155, y0 + 0.3 + 0.155, 0.31);
  text(s, 'الرؤية', { x: PW - M - cw + 0.4, y: y0 + 0.32, w: cw - 1.6, h: 0.55, fontSize: 21, bold: true, color: WHITE, valign: 'middle' });
  text(s, '«' + D.vmv.vision + '»', { x: PW - M - cw + 0.45, y: y0 + 1.05, w: cw - 0.95, h: hh - 1.3, fontSize: 13.5, color: 'E6F1ED', lineSpacingMultiple: 1.35 });
  // mission (left, outline)
  rect(s, M, y0, cw, hh, { line: { color: GREEN, width: 1 }, shadow: { type: 'outer', color: '0E3B30', opacity: 0.07, blur: 6, offset: 1, angle: 90 } });
  s.addShape('ellipse', { x: M + cw - 0.95, y: y0 + 0.3, w: 0.62, h: 0.62, fill: { color: MINT }, line: { color: LINE, width: 0.75 } });
  icon(s, 'target', 'green', M + cw - 0.95 + 0.155, y0 + 0.3 + 0.155, 0.31);
  text(s, 'الرسالة', { x: M + 0.4, y: y0 + 0.32, w: cw - 1.6, h: 0.55, fontSize: 21, bold: true, color: GREEN_DK, valign: 'middle' });
  text(s, '«' + D.vmv.mission + '»', { x: M + 0.45, y: y0 + 1.05, w: cw - 0.95, h: hh - 1.3, fontSize: 13, color: BODY, lineSpacingMultiple: 1.32 });
  // values
  sectionLabel(s, PW - M - 2.0, 4.12, 2.0, 'القيم', { fontSize: 14 });
  const vw = (CW - 5 * 0.25) / 6;
  D.vmv.values.forEach((v, i) => {
    const x = PW - M - vw - i * (vw + 0.25), y = 4.62;
    rect(s, x, y, vw, 1.85, { shadow: { type: 'outer', color: '0E3B30', opacity: 0.07, blur: 5, offset: 1, angle: 90 } });
    s.addShape('ellipse', { x: x + vw / 2 - 0.31, y: y + 0.28, w: 0.62, h: 0.62, fill: { color: MINT }, line: { color: LINE, width: 0.75 } });
    icon(s, v.icon, 'green', x + vw / 2 - 0.155, y + 0.28 + 0.155, 0.31);
    text(s, v.t, { x: x + 0.05, y: y + 1.08, w: vw - 0.1, h: 0.55, align: 'center', fontSize: 13, bold: true, color: INK, valign: 'middle' });
  });
})();

/* ============================================================ 9 — PILLARS & SOURCES */
(function pillars() {
  const s = newSlide();
  header(s, 'مرتكزات ومصادر بناء الخطة', 'layers');
  footer(s);
  // right: pillars 2 cols
  const rx = 5.6, rw2 = PW - M - rx;
  sectionLabel(s, PW - M - 3.0, 1.06, 3.0, 'مرتكزات بناء الخطة');
  text(s, D.pillars.introA, { x: rx, y: 1.42, w: rw2, h: 0.34, fontSize: 9.6, color: MUTED });
  const pw2 = (rw2 - 0.24) / 2, ph2 = 1.12;
  D.pillars.items.forEach((p, i) => {
    const r = Math.floor(i / 2), c = i % 2;
    const x = PW - M - pw2 - c * (pw2 + 0.24), y = 1.86 + r * (ph2 + 0.2);
    rect(s, x, y, pw2, ph2, { shadow: { type: 'outer', color: '0E3B30', opacity: 0.06, blur: 4, offset: 1, angle: 90 } });
    chipNum(s, x + pw2 - 0.56, y + 0.18, 0.36, '٠' + arNum(i + 1), { fontSize: 9.5 });
    text(s, p.t, { x: x + 0.2, y: y + 0.14, w: pw2 - 0.85, h: 0.42, fontSize: 10.6, bold: true, color: GREEN_DK, valign: 'middle' });
    text(s, p.d, { x: x + 0.2, y: y + 0.6, w: pw2 - 0.45, h: 0.44, fontSize: 8.8, color: MUTED });
  });
  // left: sources table
  const lw = 4.7;
  sectionLabel(s, M + lw - 3.0, 1.06, 3.0, 'مصادر بناء الخطة');
  text(s, D.pillars.introB, { x: M, y: 1.42, w: lw, h: 0.34, fontSize: 9.6, color: MUTED });
  const rows = [[hcell('م', { fontSize: 8.8 }), hcell('المصدر', { fontSize: 8.8 })]];
  D.pillars.sources.forEach((src, i) => rows.push([
    cell(arNum(i + 1), { fontSize: 8.6, fill: { color: i % 2 ? MINT : WHITE } }),
    cell(src, { fontSize: 8.8, align: 'right', fill: { color: i % 2 ? MINT : WHITE } }),
  ]));
  rtable(s, { x: M, y: 1.86, w: lw, colW: [0.42, lw - 0.42], rows, opts: { rowH: [0.32, ...Array(8).fill(0.56)] } });
})();

/* ============================================================ 10 — PRIORITIES */
(function priorities() {
  const s = newSlide();
  header(s, 'ترتيب أولويات الخطة حسب مجالات التقويم', 'listchecks');
  footer(s);
  const cw = (CW - 0.3) / 2;
  const hts = [1.78, 1.46];
  const pos = [
    [PW - M - cw, 1.18], [M, 1.18],
    [PW - M - cw, 3.14], [M, 3.14],
  ];
  D.priorities.domains.forEach((d2, i) => {
    const [x, y] = pos[i];
    const hh = i < 2 ? hts[0] : hts[1];
    rect(s, x, y, cw, hh, { shadow: { type: 'outer', color: '0E3B30', opacity: 0.06, blur: 5, offset: 1, angle: 90 } });
    // header strip
    s.addShape('roundRect', { x: x + 0.14, y: y + 0.12, w: cw - 0.28, h: 0.4, fill: { color: GREEN }, line: { type: 'none' }, rectRadius: 0.07 });
    s.addShape('ellipse', { x: x + cw - 0.5, y: y + 0.17, w: 0.3, h: 0.3, fill: { color: WHITE }, line: { type: 'none' } });
    text(s, d2.n, { x: x + cw - 0.5, y: y + 0.155, w: 0.3, h: 0.3, align: 'center', valign: 'middle', fontSize: 11, bold: true, color: GREEN });
    text(s, d2.t, { x: x + 0.3, y: y + 0.12, w: cw - 0.85, h: 0.4, valign: 'middle', fontSize: 12, bold: true, color: WHITE });
    d2.rows.forEach((r, j) => {
      const ry = y + 0.62 + j * 0.4;
      text(s, r.d, { x: x + 1.72, y: ry, w: cw - 1.95, h: 0.4, fontSize: 8.2, color: BODY, valign: 'middle', lineSpacingMultiple: 1.02 });
      s.addShape('roundRect', { x: x + 0.86, y: ry + 0.055, w: 0.78, h: 0.29, fill: { color: MINT }, line: { color: LINE, width: 0.5 }, rectRadius: 0.06 });
      text(s, r.c, { x: x + 0.86, y: ry + 0.05, w: 0.78, h: 0.29, align: 'center', valign: 'middle', fontSize: 8, color: GREEN_DK, bold: true });
      text(s, r.v, { x: x + 0.14, y: ry + 0.05, w: 0.66, h: 0.29, align: 'center', valign: 'middle', fontSize: 9, bold: true, color: r.v === '—' ? MUTED : TEAL });
    });
  });
  // methodology (right) + curve (left)
  const my = 4.82;
  rect(s, PW - M - cw, my, cw, 2.05, { fill: { color: GREEN }, line: { type: 'none' } });
  icon(s, 'listchecks', 'white', PW - M - 0.6, my + 0.2, 0.3);
  text(s, D.priorities.method.t, { x: PW - M - cw + 0.3, y: my + 0.16, w: cw - 1.0, h: 0.4, fontSize: 12.5, bold: true, color: WHITE, valign: 'middle' });
  text(s, D.priorities.method.d, { x: PW - M - cw + 0.3, y: my + 0.62, w: cw - 0.62, h: 1.3, fontSize: 9.8, color: 'D3E5DE', lineSpacingMultiple: 1.25 });
  sectionLabel(s, M + cw - 2.2, my - 0.02, 2.2, 'منحنى الأولويات');
  const bw = (cw - 3 * 0.18) / 4;
  D.priorities.curve.forEach((cv, i) => {
    const bh = 0.55 + i * 0.32;
    const x = M + cw - bw - i * (bw + 0.18);
    const yb = my + 2.05 - 0.42 - bh;
    s.addShape('roundRect', { x, y: yb, w: bw, h: bh, fill: { color: i === 0 ? TEAL : GREEN }, line: { type: 'none' }, rectRadius: 0.05 });
    text(s, arNum(i + 1), { x, y: yb + 0.03, w: bw, h: 0.32, align: 'center', fontSize: 12, bold: true, color: WHITE });
    text(s, cv, { x: x - 0.09, y: my + 2.05 - 0.38, w: bw + 0.18, h: 0.38, align: 'center', fontSize: 8.6, bold: true, color: BODY });
  });
})();

/* ============================================================ 11 — SWOT */
(function swot() {
  const s = newSlide();
  header(s, 'تحليل واقع المدرسة (SWOT)', 'grid');
  footer(s);
  const cw = (CW - 0.3) / 2, chh = 2.12;
  const quads = [
    { d: D.swot.S, k: 'S', x: PW - M - cw, y: 1.14, dark: true },
    { d: D.swot.O, k: 'O', x: M, y: 1.14, dark: false },
    { d: D.swot.W, k: 'W', x: PW - M - cw, y: 3.42, dark: true },
    { d: D.swot.T, k: 'T', x: M, y: 3.42, dark: false },
  ];
  text(s, 'عوامل داخلية', { x: PW - M - cw, y: 0.86, w: cw, h: 0.26, align: 'center', fontSize: 10, bold: true, color: GREEN });
  text(s, 'عوامل خارجية', { x: M, y: 0.86, w: cw, h: 0.26, align: 'center', fontSize: 10, bold: true, color: OLIVE_TX });
  quads.forEach((q) => {
    rect(s, q.x, q.y, cw, chh, { shadow: { type: 'outer', color: '0E3B30', opacity: 0.06, blur: 5, offset: 1, angle: 90 } });
    s.addShape('roundRect', { x: q.x + 0.14, y: q.y + 0.12, w: cw - 0.28, h: 0.42, fill: { color: q.dark ? GREEN : OLIVE }, line: { type: 'none' }, rectRadius: 0.07 });
    s.addShape('ellipse', { x: q.x + cw - 0.52, y: q.y + 0.18, w: 0.3, h: 0.3, fill: { color: WHITE }, line: { type: 'none' } });
    text(s, q.k, { x: q.x + cw - 0.52, y: q.y + 0.165, w: 0.3, h: 0.3, align: 'center', valign: 'middle', fontSize: 11, bold: true, color: q.dark ? GREEN : OLIVE_TX, fontFace: 'Arial' });
    text(s, q.d.t, { x: q.x + 0.3, y: q.y + 0.12, w: cw - 0.9, h: 0.42, valign: 'middle', fontSize: 12.5, bold: true, color: q.dark ? WHITE : OLIVE_TX });
    const items = q.d.items.map((it, i) => ({ text: it, options: { breakLine: true, paraSpaceAfter: 5, bullet: { code: '25AA', indent: 10 }, color: BODY, fontSize: 9.3 } }));
    text(s, items, { x: q.x + 0.3, y: q.y + 0.66, w: cw - 0.6, h: chh - 0.8, fontSize: 9.3, lineSpacingMultiple: 1.1 });
  });
  // strategies
  text(s, 'الاستراتيجيات المُستنبَطة (SO · WO · ST · WT)', { x: PW - M - 6.0, y: 5.74, w: 6.0, h: 0.3, fontSize: 11, bold: true, color: INK });
  const sw = (CW - 3 * 0.24) / 4;
  D.swot.strategies.forEach((st, i) => {
    const x = PW - M - sw - i * (sw + 0.24), y = 6.12;
    rect(s, x, y, sw, 0.8, { fill: { color: MINT }, line: { color: LINE, width: 0.75 } });
    s.addShape('roundRect', { x: x + sw - 0.62, y: y + 0.19, w: 0.48, h: 0.3, fill: { color: i < 2 ? GREEN : TEAL }, line: { type: 'none' }, rectRadius: 0.06 });
    text(s, st.k, { x: x + sw - 0.62, y: y + 0.18, w: 0.48, h: 0.3, align: 'center', valign: 'middle', fontSize: 9.5, bold: true, color: WHITE, fontFace: 'Arial' });
    text(s, st.t, { x: x + 0.14, y: y + 0.1, w: sw - 0.82, h: 0.3, fontSize: 9.6, bold: true, color: GREEN_DK, valign: 'middle' });
    text(s, st.d, { x: x + 0.14, y: y + 0.42, w: sw - 0.82, h: 0.32, fontSize: 7.8, color: MUTED, valign: 'middle', lineSpacingMultiple: 1.0 });
  });
})();

/* ============================================================ 12 — URGENT ISSUES */
(function issues() {
  const s = newSlide();
  header(s, 'القضايا الملحة للمدرسة وفق تحليل SWOT', 'alert');
  footer(s);
  text(s, D.issues.intro, { x: M, y: 1.06, w: CW, h: 0.38, fontSize: 10.5, color: BODY });
  const cw = (CW - 0.3) / 2, chh = 1.3;
  D.issues.list.slice(0, 6).forEach((it, i) => {
    const r = Math.floor(i / 2), c = i % 2;
    const x = PW - M - cw - c * (cw + 0.3), y = 1.5 + r * (chh + 0.18);
    rect(s, x, y, cw, chh, { shadow: { type: 'outer', color: '0E3B30', opacity: 0.06, blur: 5, offset: 1, angle: 90 } });
    chipNum(s, x + cw - 0.62, y + 0.2, 0.4, arNum(i + 1), { fontSize: 12 });
    text(s, it.t, { x: x + 0.25, y: y + 0.14, w: cw - 1.05, h: 0.58, fontSize: 11, bold: true, color: GREEN_DK, valign: 'middle', lineSpacingMultiple: 1.05 });
    text(s, it.d, { x: x + 0.25, y: y + 0.76, w: cw - 1.05, h: 0.5, fontSize: 8.8, color: MUTED, lineSpacingMultiple: 1.1 });
  });
  const it7 = D.issues.list[6], y7 = 1.5 + 3 * (chh + 0.18) + 0.02;
  rect(s, M, y7, CW, 0.95, { fill: { color: GREEN }, line: { type: 'none' }, shadow: { type: 'outer', color: '083528', opacity: 0.25, blur: 8, offset: 2, angle: 90 } });
  s.addShape('ellipse', { x: PW - M - 0.66, y: y7 + 0.275, w: 0.4, h: 0.4, fill: { color: WHITE }, line: { type: 'none' } });
  text(s, '٧', { x: PW - M - 0.66, y: y7 + 0.26, w: 0.4, h: 0.4, align: 'center', valign: 'middle', fontSize: 13, bold: true, color: GREEN });
  text(s, it7.t, { x: M + 0.35, y: y7 + 0.14, w: CW - 1.25, h: 0.4, fontSize: 12.5, bold: true, color: WHITE, valign: 'middle' });
  text(s, it7.d, { x: M + 0.35, y: y7 + 0.55, w: CW - 1.25, h: 0.35, fontSize: 9.5, color: 'CFE2DB' });
})();

/* ============================================================ 13 — TEN GOALS */
(function goals10() {
  const s = newSlide();
  header(s, 'الأهداف الاستراتيجية لوزارة التعليم', 'target');
  footer(s);
  text(s, D.goals10.intro, { x: M, y: 1.1, w: CW, h: 0.42, fontSize: 10.8, color: BODY });
  const cw = (CW - 4 * 0.22) / 5, chh = 1.5;
  D.goals10.items.forEach((g, i) => {
    const r = Math.floor(i / 5), c = i % 5;
    const x = PW - M - cw - c * (cw + 0.22), y = 1.68 + r * (chh + 0.24);
    rect(s, x, y, cw, chh, { shadow: { type: 'outer', color: '0E3B30', opacity: 0.06, blur: 5, offset: 1, angle: 90 } });
    chipNum(s, x + cw / 2 - 0.19, y + 0.16, 0.38, arNum(i + 1), { fontSize: 11.5 });
    text(s, g, { x: x + 0.09, y: y + 0.6, w: cw - 0.18, h: chh - 0.68, align: 'center', fontSize: 9.3, bold: true, color: GREEN_DK, valign: 'middle', lineSpacingMultiple: 1.05 });
  });
  const by = 1.68 + 2 * (chh + 0.24) + 0.06;
  rect(s, M, by, CW, PH - by - 0.42, { fill: { color: GREEN }, line: { type: 'none' } });
  s.addImage({ path: A('dots_white.png'), x: M + 0.1, y: by + 0.12, w: 1.65, h: 1.1, transparency: 60 });
  text(s, D.goals10.band.t, { x: M + 0.35, y: by + 0.12, w: CW - 0.75, h: 0.36, fontSize: 12.5, bold: true, color: WHITE });
  text(s, D.goals10.band.d, { x: 5.45, y: by + 0.52, w: PW - M - 0.35 - 5.45, h: 0.95, fontSize: 9.2, color: 'D3E5DE', lineSpacingMultiple: 1.18 });
  D.goals10.band.stats.forEach((st, i) => {
    const pw3 = 1.32, x = M + 0.35 + (2 - i) * (pw3 + 0.16), y = by + 0.52;
    s.addShape('roundRect', { x, y, w: pw3, h: 0.66, fill: { color: WHITE, transparency: 88 }, line: { color: 'FFFFFF', width: 0.75, transparency: 60 }, rectRadius: 0.08 });
    const [num, ...rest] = st.split(' ');
    text(s, num, { x, y: y + 0.05, w: pw3, h: 0.3, align: 'center', fontSize: 13, color: WHITE, fontFace: FONT_XB });
    text(s, rest.join(' '), { x, y: y + 0.36, w: pw3, h: 0.26, align: 'center', fontSize: 8, color: 'CFE2DB' });
  });
})();

/* ============================================================ 14 — QUANTITATIVE DISTRIBUTION */
(function quant() {
  const s = newSlide();
  header(s, 'التوزيع الكمي للأهداف', 'pie');
  footer(s);
  // tiles
  const tw = (CW - 3 * 0.3) / 4;
  D.quant.tiles.forEach((t, i) => {
    const x = PW - M - tw - i * (tw + 0.3), y = 1.12, filled = i % 2 === 0;
    rect(s, x, y, tw, 0.92, filled
      ? { fill: { color: GREEN }, line: { type: 'none' } }
      : { line: { color: GREEN, width: 1 } });
    text(s, t.v, { x: x + 0.2, y, w: tw * 0.42, h: 0.92, fontSize: 24, fontFace: FONT_XB, color: filled ? WHITE : GREEN, valign: 'middle', align: 'center' });
    text(s, t.t, { x: x + tw * 0.42, y, w: tw * 0.58 - 0.15, h: 0.92, fontSize: 11, bold: true, color: filled ? 'CFE2DB' : BODY, valign: 'middle' });
  });
  // table (right)
  const tbw = 7.61, tx = PW - M - tbw;
  const rows = [D.quant.head.map((h) => hcell(h, { fontSize: 8.4 }))];
  D.quant.rows.forEach((r, i) => rows.push(r.map((v, j) => cell(v, {
    fontSize: 8.2, align: j === 1 ? 'right' : 'center', bold: j === 0 || j === 5,
    color: j === 5 ? GREEN : (j === 1 ? GREEN_DK : BODY),
    fill: { color: i % 2 ? MINT : WHITE },
  }))));
  rows.push([
    { text: 'الإجمالي الكلي', options: Object.assign({}, hcell('').options, { colspan: 3, fontSize: 8.6 }) },
    hcell('٦٢', { fontSize: 8.6 }), hcell('١١٢', { fontSize: 8.6 }), hcell('١٠٠٪', { fontSize: 8.6 }),
  ]);
  rtable(s, { x: tx, y: 2.28, w: tbw, colW: [0.36, 2.9, 1.45, 0.95, 0.95, 1.0], rows, opts: { rowH: [0.34, ...Array(10).fill(0.36), 0.34] } });
  // chart (left)
  sectionLabel(s, M + 4.4 - 2.4, 2.24, 2.4, 'التوزيع البصري للبرامج');
  const labels = D.quant.rows.map((r) => 'هـ' + r[0]).reverse();
  const values = D.quant.chartVals.slice().reverse();
  s.addChart(pptx.charts.BAR, [{ name: 'البرامج', labels, values }], {
    x: M, y: 2.62, w: 4.4, h: 2.5,
    barDir: 'col', barGapWidthPct: 28,
    chartColors: [GOLD, GREEN, GREEN, GREEN, GREEN, GREEN, GREEN, GREEN, GREEN, GREEN],
    showValue: true, dataLabelPosition: 'outEnd', dataLabelColor: INK, dataLabelFontSize: 8, dataLabelFontFace: FONT,
    catAxisLabelColor: MUTED, catAxisLabelFontSize: 8, catAxisLabelFontFace: FONT,
    valAxisHidden: true, valGridLine: { style: 'none' }, catGridLine: { style: 'none' },
    valAxisMaxVal: 17, showLegend: false, showTitle: false,
  });
  // note
  rect(s, M, 5.35, 4.4, 1.6, { fill: { color: GREEN }, line: { type: 'none' } });
  icon(s, 'trending', 'white', M + 4.4 - 0.55, 5.53, 0.28);
  text(s, D.quant.note.t, { x: M + 0.25, y: 5.48, w: 4.4 - 0.9, h: 0.34, fontSize: 11.5, bold: true, color: WHITE });
  text(s, D.quant.note.d, { x: M + 0.25, y: 5.86, w: 4.4 - 0.55, h: 1.0, fontSize: 9, color: 'D3E5DE', lineSpacingMultiple: 1.2 });
})();

/* ============================================================ GOAL SUMMARY + DETAIL (x5) */
D.goals.forEach((G) => {
  // ---- summary ----
  {
    const s = newSlide();
    footer(s);
    s.addImage({ path: A('band_goal.png'), x: M, y: 0.32, w: CW, h: 1.47 });
    s.addImage({ path: A('moe_white.png'), x: M + 0.42, y: 0.55, w: 1.28, h: 0.99 });
    text(s, 'الهدف الاستراتيجي رقم ' + G.n, { x: 2.6, y: 0.52, w: PW - M - 2.9, h: 0.36, fontSize: 12, bold: true, color: GOLD });
    text(s, G.title, { x: 2.6, y: 0.9, w: PW - M - 2.9, h: 0.66, fontSize: 23, bold: true, color: WHITE, valign: 'middle' });
    // stat cards
    const sw = (CW - 2 * 0.3) / 3, sy = 2.0;
    const statDefs = [
      { v: G.programsCount, t: 'عدد البرامج التشغيلية', filled: false },
      { v: G.indicatorsCount, t: 'عدد مؤشرات الاعتماد المرتبطة', filled: true },
      { v: G.targetPct, t: 'نسبة التحقّق المستهدفة', filled: false },
    ];
    statDefs.forEach((st, i) => {
      const x = PW - M - sw - i * (sw + 0.3);
      rect(s, x, sy, sw, 1.0, st.filled
        ? { fill: { color: GREEN }, line: { type: 'none' }, shadow: { type: 'outer', color: '083528', opacity: 0.22, blur: 7, offset: 2, angle: 90 } }
        : { line: { color: GREEN, width: 1 } });
      text(s, st.v, { x: x + 0.15, y: sy, w: 1.35, h: 1.0, fontSize: 26, fontFace: FONT_XB, color: st.filled ? WHITE : GREEN, valign: 'middle', align: 'center' });
      text(s, st.t, { x: x + 1.5, y: sy, w: sw - 1.7, h: 1.0, fontSize: 11.5, bold: true, color: st.filled ? 'CFE2DB' : BODY, valign: 'middle' });
    });
    // programs
    sectionLabel(s, PW - M - 3.6, 3.28, 3.6, 'البرامج التشغيلية ضمن هذا الهدف');
    const perRow = 4, gp = 0.2;
    const pw3 = (CW - (perRow - 1) * gp) / perRow;
    G.programs.forEach((p, i) => {
      const r = Math.floor(i / perRow), c = i % perRow;
      const x = PW - M - pw3 - c * (pw3 + gp), y = 3.7 + r * 0.62;
      rect(s, x, y, pw3, 0.48, { fill: { color: MINT }, line: { color: LINE, width: 0.75 }, rectRadius: 0.09 });
      s.addShape('roundRect', { x: x + pw3 - 0.3, y: y + 0.19, w: 0.11, h: 0.11, fill: { color: TEAL }, line: { type: 'none' }, rectRadius: 0.02 });
      text(s, p, { x: x + 0.14, y, w: pw3 - 0.52, h: 0.48, fontSize: 10, bold: true, color: GREEN_DK, valign: 'middle' });
    });
    const rowsUsed = Math.ceil(G.programs.length / perRow);
    const by = 3.7 + rowsUsed * 0.62 + 0.12;
    const bh = PH - by - 0.44;
    // indicators (right)
    const iw = 4.35;
    rect(s, PW - M - iw, by, iw, bh, {});
    text(s, 'مؤشرات الاعتماد المدرسي', { x: PW - M - iw + 0.25, y: by + 0.1, w: iw - 0.5, h: 0.32, fontSize: 10.5, bold: true, color: GREEN_DK });
    const chW = 0.72, chG = 0.12;
    G.indicators.forEach((cd, i) => {
      const perR = 5, r = Math.floor(i / perR), c = i % perR;
      const x = PW - M - 0.25 - chW - c * (chW + chG), y = by + 0.48 + r * 0.4;
      s.addShape('roundRect', { x, y, w: chW, h: 0.3, fill: { color: WHITE }, line: { color: GREEN, width: 0.75 }, rectRadius: 0.06 });
      text(s, cd, { x, y: y - 0.01, w: chW, h: 0.3, align: 'center', valign: 'middle', fontSize: 8, bold: true, color: GREEN_DK });
    });
    // outputs (left)
    const ow = CW - iw - 0.3;
    rect(s, M, by, ow, bh, { fill: { color: GREEN }, line: { type: 'none' }, shadow: { type: 'outer', color: '083528', opacity: 0.22, blur: 7, offset: 2, angle: 90 } });
    icon(s, 'sparkles', 'white', M + ow - 0.52, by + 0.12, 0.28);
    text(s, 'المخرجات المتوقّعة', { x: M + 0.3, y: by + 0.1, w: ow - 0.95, h: 0.32, fontSize: 11.5, bold: true, color: WHITE });
    text(s, G.outputs, { x: M + 0.3, y: by + 0.46, w: ow - 0.62, h: bh - 0.56, fontSize: 9.6, color: 'D9E9E3', lineSpacingMultiple: 1.2, valign: 'top' });
  }
  // ---- detail table ----
  {
    const s = newSlide();
    footer(s);
    // title row
    s.addShape('roundRect', { x: M, y: 0.3, w: CW, h: 0.6, fill: { color: GREEN }, line: { type: 'none' }, rectRadius: 0.09 });
    s.addShape('roundRect', { x: M + 0.18, y: 0.415, w: 1.5, h: 0.37, fill: { color: WHITE, transparency: 86 }, line: { color: 'FFFFFF', width: 0.5, transparency: 55 }, rectRadius: 0.07 });
    text(s, 'البرامج التفصيلية', { x: M + 0.18, y: 0.405, w: 1.5, h: 0.37, align: 'center', valign: 'middle', fontSize: 9.5, bold: true, color: WHITE });
    text(s, `الهدف الاستراتيجي العام ${G.n} — ${G.title}`, { x: 2.4, y: 0.3, w: PW - M - 2.7, h: 0.6, fontSize: 15.5, bold: true, color: WHITE, valign: 'middle' });
    // meta card
    const metaRows = [
      [cell('المحور الاستراتيجي', { bold: true, color: WHITE, fill: { color: GREEN_LT }, fontSize: 9 }), cell(G.axis, { align: 'right', fontSize: 9.4, bold: true, color: GREEN_DK })],
      [cell(G.detailGoal, { bold: true, color: WHITE, fill: { color: GREEN_LT }, fontSize: 9 }), cell(G.detailDesc, { align: 'right', fontSize: 8.2 })],
      [cell('مؤشر قياس الأداء (المستهدف)', { bold: true, color: WHITE, fill: { color: GREEN_LT }, fontSize: 9 }), cell(G.kpi, { align: 'right', fontSize: 8.4, bold: true, color: '0B4A56' })],
    ];
    rtable(s, { x: M, y: 1.02, w: CW, colW: [1.9, CW - 1.9], rows: metaRows, opts: { rowH: [0.3, 0.6, 0.46] } });
    // main table
    const widths = [0.32, 0.88, 1.5, 1.0, 0.4, 0.6, 1.2, 1.15, 1.0, 1.05, 1.03, 1.36, 0.94];
    const hdrTop = [
      hcell('م', { rowspan: 2, fontSize: 8 }),
      hcell('المجال', { rowspan: 2, fontSize: 8 }),
      hcell('اسم المشروع / البرنامج', { rowspan: 2, fontSize: 8 }),
      hcell('مصدر البرنامج', { rowspan: 2, fontSize: 8 }),
      hcell('زمن التنفيذ', { colspan: 2, fontSize: 8, fill: { color: GREEN_DK } }),
      hcell('المتطلبات', { rowspan: 2, fontSize: 8 }),
      hcell('جهة التنفيذ', { colspan: 3, fontSize: 8, fill: { color: GREEN_DK } }),
      hcell('الفئة المستهدفة', { rowspan: 2, fontSize: 8 }),
      hcell('أسلوب التنفيذ', { rowspan: 2, fontSize: 8 }),
      hcell('مؤشر تحقق الهدف', { rowspan: 2, fontSize: 8 }),
    ];
    const hdrSub = [
      hcell('ف', { fontSize: 7.6 }), hcell('الأسبوع', { fontSize: 7.6 }),
      hcell('الرئيسة وفريق العمل', { fontSize: 7.6 }), hcell('المساندة', { fontSize: 7.6 }), hcell('الدعم الخارجي', { fontSize: 7.6 }),
    ];
    const bodyRows = G.table.map((r, i) => {
      const f = { color: i % 2 ? MINT : WHITE };
      const cs = [
        cell(r[0], { fontSize: 7.6, fill: f }),
        cell(r[1], { fontSize: 7.4, fill: f }),
        cell(r[2], { fontSize: 7.6, bold: true, color: GREEN_DK, align: 'right', fill: f }),
        cell(r[3], { fontSize: 7.4, fill: f }),
        cell(r[4], { fontSize: 7.4, fill: f }),
        cell(r[5], { fontSize: 7.4, fill: f }),
        cell(r[6], { fontSize: 7.4, fill: f }),
        cell(r[7], { fontSize: 7.4, fill: f }),
        cell(r[8], { fontSize: 7.4, fill: f }),
        cell(r[9], { fontSize: 7.4, fill: f }),
        cell(r[10], { fontSize: 7.4, fill: f }),
        cell(r[11], { fontSize: 7.4, fill: f }),
        cell('', { fill: f }),
      ];
      return cs;
    });
    const nRows = G.table.length;
    const avail = 7.06 - 2.5 - 0.62;
    const rh = Math.min(0.4, avail / nRows);
    rtable(s, {
      x: M, y: 2.5, w: CW, colW: widths,
      rows: [hdrTop, hdrSub, ...bodyRows],
      opts: { rowH: [0.3, 0.32, ...Array(nRows).fill(rh)], border: { pt: 0.5, color: LINE } },
    });
  }
});

pptx.writeFile({ fileName: path.resolve(__dirname, '../out/plan_1448.pptx') }).then(() => console.log('WROTE plan_1448.pptx'));
