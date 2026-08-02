// v2 visual system: "dot field" motif — backgrounds, dividers, arcs
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const OUT = path.resolve(__dirname, '../assets');
const GREEN = '#095242', GREEN_DK = '#04352B', GREEN_LT = '#0C6553', TEAL = '#0089A1', GOLD = '#C9A45C';

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// staggered dot grid fading along one direction (MOE emblem language)
function dotGrid({ x0, y0, cols, rows, pitch, r, color, maxOp, seed = 7, dir = 'tl' }) {
  const rnd = mulberry32(seed);
  let s = '';
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const cx = x0 + i * pitch + (j % 2) * (pitch / 2);
      const cy = y0 + j * pitch * 0.88;
      const fi = i / cols, fj = j / rows;
      let t;
      if (dir === 'tl') t = 1 - Math.max(fi, fj) * 0.95;
      else if (dir === 'br') t = 1 - Math.max(1 - fi, 1 - fj) * 0.95;
      else if (dir === 'r') t = 1 - fi * 0.95;
      else t = 1 - fj * 0.95;
      if (rnd() > t * 0.9) continue;
      const rr = r * (0.5 + rnd() * 0.65);
      const op = (maxOp * (0.3 + 0.7 * t) * (0.5 + rnd() * 0.5)).toFixed(3);
      s += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${rr.toFixed(1)}" fill="${color}" fill-opacity="${op}"/>`;
    }
  }
  return s;
}

// concentric dotted arcs — the repeating geometric system
function dotArcs({ cx, cy, radii, color, maxOp, dotR, seed = 3, a0 = 0, a1 = Math.PI * 2 }) {
  const rnd = mulberry32(seed);
  let s = '';
  radii.forEach((R, k) => {
    const n = Math.max(24, Math.round((R * (a1 - a0)) / 26));
    for (let i = 0; i <= n; i++) {
      const a = a0 + ((a1 - a0) * i) / n;
      const x = cx + R * Math.cos(a), y = cy + R * Math.sin(a);
      const op = (maxOp * (0.35 + 0.65 * rnd())).toFixed(3);
      const rr = dotR * (0.6 + 0.6 * rnd()) * (1 - k * 0.06);
      s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${rr.toFixed(1)}" fill="${color}" fill-opacity="${op}"/>`;
    }
  });
  return s;
}

async function svgPng(svg, file) {
  const p = path.join(OUT, file);
  let img = sharp(Buffer.from(svg), { density: 96 });
  if (file.endsWith('.jpg')) {
    await img.resize(2600, null, { withoutEnlargement: true }).jpeg({ quality: 88, mozjpeg: true }).toFile(p);
  } else {
    await img.png({ compressionLevel: 9, palette: false }).toFile(p);
  }
  console.log('wrote', file);
}

const W = 4000, H = 2250;

async function main() {
  // ---------- COVER: deep green, gold hairline frame, dot arcs bottom-right ----------
  const cover = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="g" x1="0.05" y1="0" x2="0.85" y2="1">
      <stop offset="0" stop-color="${GREEN_LT}"/><stop offset="0.5" stop-color="${GREEN}"/><stop offset="1" stop-color="${GREEN_DK}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.34" r="0.6">
      <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.10"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/><rect width="${W}" height="${H}" fill="url(#glow)"/>
  ${dotArcs({ cx: W * 0.5, cy: H * 0.46, radii: [700, 800, 900, 1010, 1130], color: '#FFFFFF', maxOp: 0.10, dotR: 5.5, seed: 9 })}
  ${dotGrid({ x0: 120, y0: 110, cols: 13, rows: 9, pitch: 62, r: 11, color: '#FFFFFF', maxOp: 0.15, seed: 11, dir: 'tl' })}
  ${dotGrid({ x0: W - 920, y0: H - 660, cols: 13, rows: 9, pitch: 62, r: 11, color: '#FFFFFF', maxOp: 0.13, seed: 23, dir: 'br' })}
  <rect x="64" y="64" width="${W - 128}" height="${H - 128}" fill="none" stroke="${GOLD}" stroke-opacity="0.30" stroke-width="2.2"/>
  <rect x="86" y="86" width="${W - 172}" height="${H - 172}" fill="none" stroke="#FFFFFF" stroke-opacity="0.09" stroke-width="2"/>
  </svg>`;
  await svgPng(cover, 'bg_cover.jpg');

  // ---------- CONTENT: paper white, whisper-soft corner dots ----------
  const content = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <radialGradient id="a" cx="0.02" cy="0.02" r="0.75"><stop offset="0" stop-color="${GREEN}" stop-opacity="0.040"/><stop offset="1" stop-color="${GREEN}" stop-opacity="0"/></radialGradient>
    <radialGradient id="b" cx="0.98" cy="0.98" r="0.75"><stop offset="0" stop-color="${TEAL}" stop-opacity="0.038"/><stop offset="1" stop-color="${TEAL}" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="#FFFFFF"/>
  <rect width="${W}" height="${H}" fill="url(#a)"/><rect width="${W}" height="${H}" fill="url(#b)"/>
  ${dotGrid({ x0: 70, y0: H - 360, cols: 8, rows: 5, pitch: 50, r: 8, color: GREEN, maxOp: 0.085, seed: 5, dir: 'tl' })}
  </svg>`;
  await svgPng(content, 'bg_content.jpg');

  // ---------- PART DIVIDER: dark, huge arcs on the left ----------
  const divider = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs><linearGradient id="d" x1="1" y1="0" x2="0.1" y2="1">
    <stop offset="0" stop-color="${GREEN_LT}"/><stop offset="0.55" stop-color="${GREEN}"/><stop offset="1" stop-color="${GREEN_DK}"/></linearGradient></defs>
  <rect width="${W}" height="${H}" fill="url(#d)"/>
  ${dotArcs({ cx: 380, cy: H * 0.5, radii: [520, 640, 770, 910, 1060, 1220], color: '#FFFFFF', maxOp: 0.13, dotR: 6, seed: 17, a0: -1.35, a1: 1.35 })}
  ${dotGrid({ x0: W - 780, y0: 130, cols: 11, rows: 7, pitch: 58, r: 10, color: '#FFFFFF', maxOp: 0.14, seed: 31, dir: 'br' })}
  <rect x="64" y="64" width="${W - 128}" height="${H - 128}" fill="none" stroke="${GOLD}" stroke-opacity="0.26" stroke-width="2.2"/>
  </svg>`;
  await svgPng(divider, 'bg_divider.jpg');

  // ---------- GOAL HERO BAND (rounded, for goal summary slides) ----------
  const BW = 3560, BH = 500;
  const band = `<svg xmlns="http://www.w3.org/2000/svg" width="${BW}" height="${BH}">
  <defs><linearGradient id="b2" x1="1" y1="0" x2="0" y2="0.6">
    <stop offset="0" stop-color="${GREEN_LT}"/><stop offset="0.55" stop-color="${GREEN}"/><stop offset="1" stop-color="#053A2F"/></linearGradient></defs>
  <rect width="${BW}" height="${BH}" rx="30" fill="url(#b2)"/>
  ${dotArcs({ cx: BW - 300, cy: BH / 2, radii: [230, 300, 375, 455], color: '#FFFFFF', maxOp: 0.13, dotR: 5, seed: 13 })}
  ${dotGrid({ x0: 50, y0: 40, cols: 10, rows: 6, pitch: 52, r: 9, color: '#FFFFFF', maxOp: 0.13, seed: 29, dir: 'tl' })}
  </svg>`;
  await svgPng(band, 'band_goal.jpg');

  // ---------- WHITE DOT PATCH (transparent, for dark panels) ----------
  const dots = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800">
  ${dotGrid({ x0: 30, y0: 30, cols: 13, rows: 9, pitch: 78, r: 13, color: '#FFFFFF', maxOp: 0.5, seed: 17, dir: 'tl' })}</svg>`;
  await svgPng(dots, 'dots_white.png');

  // ---------- ARC PATCH (transparent white, for dark cards) ----------
  const arc = `<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="1400">
  ${dotArcs({ cx: 700, cy: 700, radii: [300, 400, 500, 610], color: '#FFFFFF', maxOp: 0.42, dotR: 8, seed: 21 })}</svg>`;
  await svgPng(arc, 'arc_white.png');

  // ---------- CLOSING slide bg ----------
  const closing = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs><linearGradient id="c" x1="0.5" y1="0" x2="0.5" y2="1">
    <stop offset="0" stop-color="${GREEN}"/><stop offset="1" stop-color="${GREEN_DK}"/></linearGradient></defs>
  <rect width="${W}" height="${H}" fill="url(#c)"/>
  ${dotArcs({ cx: W / 2, cy: H / 2, radii: [430, 540, 660, 790, 930], color: '#FFFFFF', maxOp: 0.11, dotR: 6, seed: 41 })}
  <rect x="64" y="64" width="${W - 128}" height="${H - 128}" fill="none" stroke="${GOLD}" stroke-opacity="0.28" stroke-width="2.2"/>
  </svg>`;
  await svgPng(closing, 'bg_closing.jpg');
}

main();
