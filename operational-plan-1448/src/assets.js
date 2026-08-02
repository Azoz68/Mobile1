// Generate visual assets: backgrounds + icon set
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const lu = require('react-icons/lu');

const OUT = path.resolve(__dirname, '../assets');
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

// ---------- Brand ----------
const GREEN = '#095242';
const GREEN_DK = '#04352B';
const GREEN_LT = '#0B5E4C';
const TEAL = '#0089A1';
const GOLD = '#C9A45C';

// deterministic pseudo-random
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// MOE-emblem-inspired staggered dot field, fading out along a direction
function dotField({ x0, y0, cols, rows, pitch, r, color, maxOp, seed = 7, fade = 'tl' }) {
  const rnd = mulberry32(seed);
  let s = '';
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const cx = x0 + i * pitch + (j % 2) * (pitch / 2);
      const cy = y0 + j * pitch * 0.9;
      let t;
      const fi = i / cols, fj = j / rows;
      if (fade === 'tl') t = 1 - Math.max(fi, fj) * 0.95;
      else if (fade === 'br') t = 1 - Math.max(1 - fi, 1 - fj) * 0.95;
      else t = 1 - Math.abs(fi - 0.5) * 1.6;
      const keep = rnd();
      if (keep > t * 0.92) continue;
      const rr = r * (0.55 + rnd() * 0.6);
      const op = (maxOp * (0.35 + 0.65 * t) * (0.5 + rnd() * 0.5)).toFixed(3);
      s += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${rr.toFixed(1)}" fill="${color}" fill-opacity="${op}"/>`;
    }
  }
  return s;
}

async function svgPng(svg, file, opts = {}) {
  await sharp(Buffer.from(svg), { density: 96 }).png(opts).toFile(path.join(OUT, file));
  console.log('wrote', file);
}

async function backgrounds() {
  const W = 4000, H = 2250;

  // ----- cover -----
  const cover = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0.25" y2="1">
      <stop offset="0" stop-color="${GREEN_LT}"/>
      <stop offset="0.55" stop-color="${GREEN}"/>
      <stop offset="1" stop-color="${GREEN_DK}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.30" r="0.62">
      <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.085"/>
      <stop offset="0.55" stop-color="#FFFFFF" stop-opacity="0.02"/>
      <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  ${dotField({ x0: 90, y0: 80, cols: 16, rows: 12, pitch: 64, r: 12, color: '#FFFFFF', maxOp: 0.16, seed: 11, fade: 'tl' })}
  ${dotField({ x0: W - 1150, y0: H - 780, cols: 16, rows: 11, pitch: 66, r: 12, color: '#FFFFFF', maxOp: 0.14, seed: 23, fade: 'br' })}
  <circle cx="${W - 260}" cy="330" r="520" fill="none" stroke="${GOLD}" stroke-opacity="0.16" stroke-width="2.5"/>
  <circle cx="${W - 260}" cy="330" r="452" fill="none" stroke="#FFFFFF" stroke-opacity="0.06" stroke-width="2"/>
  <circle cx="240" cy="${H - 190}" r="420" fill="none" stroke="${GOLD}" stroke-opacity="0.12" stroke-width="2.5"/>
  <rect x="70" y="70" width="${W - 140}" height="${H - 140}" rx="38" fill="none" stroke="#FFFFFF" stroke-opacity="0.10" stroke-width="3"/>
  <rect x="92" y="92" width="${W - 184}" height="${H - 184}" rx="30" fill="none" stroke="${GOLD}" stroke-opacity="0.22" stroke-width="2"/>
  </svg>`;
  await svgPng(cover, 'bg_cover.png');

  // ----- content (light) -----
  const content = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="#FFFFFF"/>
  <radialGradient id="c1" cx="0" cy="0" r="1">
    <stop offset="0" stop-color="${GREEN}" stop-opacity="0.05"/>
    <stop offset="1" stop-color="${GREEN}" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="c2" cx="1" cy="1" r="1">
    <stop offset="0" stop-color="${TEAL}" stop-opacity="0.045"/>
    <stop offset="1" stop-color="${TEAL}" stop-opacity="0"/>
  </radialGradient>
  <rect width="1500" height="1100" fill="url(#c1)"/>
  <rect x="${W - 1500}" y="${H - 1100}" width="1500" height="1100" fill="url(#c2)"/>
  ${dotField({ x0: 60, y0: H - 420, cols: 9, rows: 6, pitch: 52, r: 9, color: GREEN, maxOp: 0.10, seed: 5, fade: 'tl' })}
  </svg>`;
  await svgPng(content, 'bg_content.png');

  // ----- dark band texture for goal headers (rendered as full rounded band image) -----
  const BW = 3560, BH = 420;
  const band = `<svg xmlns="http://www.w3.org/2000/svg" width="${BW}" height="${BH}" viewBox="0 0 ${BW} ${BH}">
  <defs>
    <linearGradient id="b" x1="0" y1="0" x2="1" y2="0.2">
      <stop offset="0" stop-color="${GREEN_LT}"/>
      <stop offset="0.6" stop-color="${GREEN}"/>
      <stop offset="1" stop-color="#063E33"/>
    </linearGradient>
  </defs>
  <rect width="${BW}" height="${BH}" rx="34" fill="url(#b)"/>
  ${dotField({ x0: 60, y0: 40, cols: 12, rows: 6, pitch: 56, r: 10, color: '#FFFFFF', maxOp: 0.15, seed: 31, fade: 'tl' })}
  <circle cx="${BW - 130}" cy="${BH + 60}" r="300" fill="none" stroke="#FFFFFF" stroke-opacity="0.08" stroke-width="2.5"/>
  <circle cx="${BW - 340}" cy="-40" r="220" fill="none" stroke="${GOLD}" stroke-opacity="0.15" stroke-width="2"/>
  </svg>`;
  await svgPng(band, 'band_goal.png');

  // ----- white dots patch (transparent) for dark shapes -----
  const dots = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
  ${dotField({ x0: 30, y0: 30, cols: 14, rows: 10, pitch: 74, r: 13, color: '#FFFFFF', maxOp: 0.55, seed: 17, fade: 'tl' })}
  </svg>`;
  await svgPng(dots, 'dots_white.png');
}

// ---------- Icons ----------
const wanted = {
  compass: ['LuCompass'],
  users: ['LuUsers'],
  chart: ['LuChartColumnBig', 'LuBarChart3', 'LuChartColumn'],
  gradcap: ['LuGraduationCap'],
  eye: ['LuEye'],
  layers: ['LuLayers'],
  listchecks: ['LuListChecks'],
  grid: ['LuLayoutGrid'],
  alert: ['LuTriangleAlert', 'LuAlertTriangle'],
  target: ['LuTarget'],
  pie: ['LuChartPie', 'LuPieChart'],
  boxes: ['LuBoxes'],
  heart: ['LuHeart'],
  handshake: ['LuHandshake', 'LuHeartHandshake', 'LuUsers'],
  flag: ['LuFlag'],
  lightbulb: ['LuLightbulb'],
  star: ['LuStar'],
  check: ['LuCircleCheckBig', 'LuCheckCircle2', 'LuCircleCheck'],
  calendar: ['LuCalendarDays'],
  file: ['LuFileText'],
  shield: ['LuShieldCheck'],
  school: ['LuSchool'],
  book: ['LuBookOpen'],
  sparkles: ['LuSparkles'],
  trending: ['LuTrendingUp'],
  clipboard: ['LuClipboardList'],
  quote: ['LuQuote'],
  database: ['LuDatabase'],
  award: ['LuAward'],
  puzzle: ['LuPuzzle'],
  laptop: ['LuLaptop'],
  info: ['LuInfo'],
  scale: ['LuScale'],
  building: ['LuBuilding2'],
  arrowl: ['LuArrowLeft'],
  monitor: ['LuMonitorSmartphone', 'LuMonitor'],
  bookmark: ['LuBookMarked', 'LuBookmark'],
  refresh: ['LuRefreshCw'],
  penline: ['LuPenLine', 'LuPencilLine'],
  crown: ['LuCrown'],
  globe: ['LuGlobe'],
  medal: ['LuMedal'],
  rocket: ['LuRocket'],
  crosshair: ['LuCrosshair'],
  activity: ['LuActivity'],
};

const colors = {
  white: '#FFFFFF',
  green: '#095242',
  teal: '#0089A1',
  gold: '#C9A45C',
  olive: '#55652E',
  mid: '#3E5A50',
};

async function icons() {
  const dir = path.join(OUT, 'icons');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  for (const [name, candidates] of Object.entries(wanted)) {
    const compName = candidates.find((c) => lu[c]);
    if (!compName) { console.log('MISSING icon:', name, candidates.join(',')); continue; }
    const Comp = lu[compName];
    for (const [cname, hex] of Object.entries(colors)) {
      const svg = ReactDOMServer.renderToStaticMarkup(
        React.createElement(Comp, { color: hex, size: 512, strokeWidth: 1.9 })
      );
      const buf = await sharp(Buffer.from(svg), { density: 300 }).resize(512, 512).png().toBuffer();
      fs.writeFileSync(path.join(dir, `${name}_${cname}.png`), buf);
    }
  }
  console.log('icons done');
}

(async () => {
  await backgrounds();
  await icons();
})();
