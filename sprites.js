// Mepo's pixel-art sprites, copied from the sprites block of main.html (plus disc/puff from its world block).
// Re-copy from main.html when the sprites change there; do not edit by hand.
const GROUND = 104;
/* ---------- sprites ---------- */
// Each stage is its own full sprite with its own silhouette. `face` places the shared 16px face grid on it;
// `float` makes it hover with a shadow; `crown` is extra height above the sprite (for bubbles).
const PAL = { o: '#2b1d3d', g: '#5fd38a', r: '#ff5470', k: '#ffe7a8' };
const SPR = {
  baby: { face: [0, 0], pal: { w: '#fff4e6', s: '#d9c8f0', g: '#6fdc8c', G: '#2f9a62' }, rows: [
    '.....gg.GG......',
    '......gGG.......',
    '.......G........',
    '...oooooooooo...',
    '..owwwwwwwwwwo..',
    '.owwwwwwwwwwwwo.',
    '.owwwwwwwwwwwwo.',
    '.owwwwwwwwwwwwo.',
    '.owwwwwwwwwwwwo.',
    '.owwwwwwwwwwwwo.',
    '.owwwwwwwwwwwso.',
    '..owwwwwwwwsso..',
    '...oooooooooo...',
    '....oo....oo....'] }
};
// Adds a 1px 'o' outline around every filled pixel, growing the sprite by one pixel on each side.
function outlined(rows) {
  const h = rows.length + 2, w = rows[0].length + 2;
  const g = Array.from({ length: h }, (_, y) => Array.from({ length: w }, (_, x) => (rows[y - 1] || '')[x - 1] || '.'));
  return g.map((r, y) => r.map((ch, x) => ch !== '.' ? ch
    : [[0, 1], [0, -1], [1, 0], [-1, 0]].some(([dx, dy]) => (g[y + dy] || [])[x + dx] && g[y + dy][x + dx] !== '.') ? 'o' : '.').join(''));
}
// Builds a sprite from ellipses and rects (painted in order), shaded light top-left and dark bottom-right.
// A shape with `maxY` is cut off from that row down (e.g. the top half of an ellipse for a cap).
function blobSprite(w, h, shapes) {
  const g = Array.from({ length: h }, () => Array(w).fill('.'));
  for (const s of shapes) for (let y = 0; y < (s.maxY ?? h); y++) for (let x = 0; x < w; x++) {
    if (s.rect) { const [rx, ry, rw, rh] = s.rect; if (x >= rx && x < rx + rw && y >= ry && y < ry + rh) g[y][x] = s.fill; continue; }
    if (s.box) {
      // Rounded rectangle [x, y, w, h] with corner radius r, shaded like the ellipses.
      const [bx, by, bw, bh] = s.box, r = s.r || 0, px = x + 0.5, py = y + 0.5;
      if (px < bx || px > bx + bw || py < by || py > by + bh) continue;
      const qx = Math.max(bx + r - px, px - (bx + bw - r), 0), qy = Math.max(by + r - py, py - (by + bh - r), 0);
      if (qx * qx + qy * qy > r * r) continue;
      const lit = ((px - bx - bw / 2) + (py - by - bh / 2)) / (Math.max(bw, bh) / 2);
      g[y][x] = s.shade && lit > 0.95 ? s.shade : s.light && lit < -1.0 ? s.light : s.fill;
      continue;
    }
    const dx = x + 0.5 - s.cx, dy = y + 0.5 - s.cy, a = s.a || 0;
    const u = dx * Math.cos(a) + dy * Math.sin(a), v = -dx * Math.sin(a) + dy * Math.cos(a);
    if ((u * u) / (s.rx * s.rx) + (v * v) / (s.ry * s.ry) > 1) continue;
    const r = Math.max(s.rx, s.ry), lit = (dx + dy) / r;
    let ch = s.fill;
    if (s.shade && lit > 0.95) ch = s.shade;
    if (s.light && lit < -1.0) ch = s.light;
    if (s.vein && Math.abs(s.rx >= s.ry ? v : u) < 0.55 && Math.abs(s.rx >= s.ry ? u : v) < r * 0.62) ch = s.vein;
    g[y][x] = ch;
  }
  const rows = outlined(g.map(r => r.join('')));
  while (rows.length && !/[^.]/.test(rows[rows.length - 1])) rows.pop();
  return rows;
}
const LEAF_SHAPE = { fill: 'g', shade: 'G', light: 'l', vein: 'G' };
// Rana: starts as a little frog-gadget whose screen cycles pictures, then grows into a real frog.
const RANA_PAL = { w: '#8fd96a', s: '#62b34e', h: '#c8f2a8', W: '#ffffff', d: '#4e9a3e', k: '#2d5e3a', c: '#e4f8ea', r: '#ff5c7a', y: '#ffd45c', b: '#5aa8ff', v: '#e2f5c4', e: '#4f9e3c' };
// After Ranabit it grows into a little frog with a scarf, and finally a crowned frog king.
const FROG_PAL = { w: '#8fe06a', s: '#66bf4c', h: '#c4f5a4', k: '#2d5e3a', v: '#f3fbe6', y: '#ffd45c', Y: '#e0a526', r: '#ff6b6b', R: '#d64552' };
// Coach Bolo, the neutral visitor: a soft marshmallow in a red cap worn forward, with a whistle on a lanyard.
const COACH_PAL = { w: '#fffaf6', s: '#efe2ea', h: '#ffffff', c: '#ff5a5f', C: '#d23c4a', q: '#ffffff', S: '#e6d6df', l: '#5b7fe0', g: '#c3cbe0', G: '#6f7a98' };
// Oso: a caramel cub that grows into a teddy with a bandana, then a big bear in a starry cape.
const PANDA_PAL = { w: '#f6f5fb', s: '#d6d4e4', h: '#ffffff', k: '#3a3548', K: '#2b2738', e: '#57516e', n: '#2b1d3d', g: '#5fd38a', G: '#3fa86a', l: '#ffc2dc', L: '#ff8fbd', y: '#ffd45c' };
const pandaEar = (cx, cy, r) => [{ cx, cy, rx: r, ry: r, fill: 'k', shade: 'K' }];
const BEAR_PAL = { w: '#d9a066', s: '#b47c47', h: '#f0c99a', m: '#fbe8cf', n: '#4a2f2a', p: '#f2a9a0', b: '#7ec3e6', B: '#5a9fc8', v: '#34407f', V: '#262f66', y: '#ffd45c' };
const bearEar = (cx, cy, r) => [{ cx, cy, rx: r, ry: r, fill: 'w', shade: 's' }, { cx, cy: cy + 0.2, rx: r * 0.48, ry: r * 0.48, fill: 'p' }];
// Pictures for a sprite's `screen`: it cycles through the happy ones, and shows its mood when sad or asleep.
const SCREEN_ICONS = {
  heart: ['rr.rr', 'rrrrr', '.rrr.'], bars: ['....b', '..y.b', 'b.y.b'], star: ['..y..', 'yyyyy', '.y.y.'],
  smile: ['.k.k.', 'k...k', '.kkk.'], sad: ['.k.k.', '.kkk.', 'k...k'], sleep: ['kk.kk', '.....', '.kkk.']
};
function drawScreen(c, x, y, w, h, st, f, pal) {
  const icon = st === 'cry' || st === 'sad' ? 'sad' : st === 'sleep' ? 'sleep' : ['heart', 'bars', 'star', 'smile'][Math.floor(f / 75) % 4];
  const rows = SCREEN_ICONS[icon];
  spr(c, rows, x + Math.floor((w - rows[0].length) / 2), y + Math.floor((h - rows.length) / 2), null, pal);
}

// Animal-like companions. `beak` draws a bill over the mouth. `beak` draws a bill over the mouth.
const KIT_HEAD = [
  '.oo..........oo.',
  '.ofo........ofo.',
  '.offo......offo.',
  '.offfoooooofffo.',
  '.offffffffffffo.',
  'offffffffffffffo',
  'offffffffffffffo',
  'offffffffffffffo',
  'occccccnncccccco',
  '.occcccccccccco.',
  '..occcccccccco..'];
const FOX_PAL = { f: '#ff9a3c', F: '#c8621c', c: '#fff4e6', n: '#2b1d3d', r: '#e8465a' };
const TAIL_L = ['.....', '.....', '.....', '.....', '..oo.', '.okko', 'okklo', 'olwwo', 'owwwo', 'owwwo', 'owwlo', '.owwo', '..owo', '...oo', '.....', '.....'];
const KITSUNE_HEAD = [
  '.oo..........oo.',
  '.olo........olo.',
  '.ollo......ollo.',
  '.ollloooooolllo.',
  '.owwwwwmmwwwwwo.',
  'owwwwwwmmwwwwwwo',
  'owwwwwwwwwwwwwwo',
  'owwwwwwwwwwwwwwo',
  'owwwwwwnnwwwwwwo',
  '.owwwwwwwwwwwwo.',
  '..owwwwwwwwwwo..',
  '..okkkkkkkkkko..',
  '..owwwwwwwwwwo..',
  '..owwwwwwwwwwo..',
  '..owwwwwwwwwso..',
  '...oooooooooo...'];
Object.assign(SPR, {
  plumi: [
    { face: [0, -2], beak: [6, 7], pal: { w: '#ffe066', s: '#f0b830', b: '#ff9a3c' }, rows: [
      '......oo.o......',
      '...oooooooooo...',
      '..owwwwwwwwwwo..',
      '.owwwwwwwwwwwwo.',
      '.owwwwwwwwwwwwo.',
      '.owwwwwwwwwwwwo.',
      'oowwwwwwwwwwwwoo',
      'owswwwwwwwwwwswo',
      'owswwwwwwwwwwswo',
      '.owwwwwwwwwwwso.',
      '..owwwwwwwwsso..',
      '...oooooooooo...',
      '....bb....bb....'] },
    { face: [1, -1], beak: [7, 8], hat: 1, pal: { w: '#fbf6ee', s: '#d8d0e8', b: '#ff9a3c' }, rows: [
      '.......oooo.......',
      '......owwwwo......',
      '.....owwwwwwo.....',
      '....owwwwwwwwo....',
      '...owwwwwwwwwwo...',
      '..owwwwwwwwwwwwo..',
      '..owwwwwwwwwwwwo..',
      '..owwwwwwwwwwwwo..',
      '..owwwwwwwwwwwwo..',
      '.owwwwwwwwwwwwwwo.',
      'owwwwwwwwwwwwwwwwo',
      'owssswwwwwwwwssswo',
      'owssswwwwwwwwssswo',
      'owwssswwwwwwssswwo',
      'owwwwwwwwwwwwwwwso',
      '.owwwwwwwwwwwwwso.',
      '..owwwwwwwwwwsso..',
      '...oooooooooooo...',
      '.....bb....bb.....'] },
    { face: [3, 1], beak: [9, 10], crown: 0, hat: 3, pal: { w: '#fbf8ff', s: '#d6cdf0', a: '#c9b8ff', A: '#9a84e8', y: '#ffd45c', b: '#ff9a3c' }, rows: [
      '.........y..y.........',
      '........yyyyyy........',
      '........oooooo........',
      '.......owwwwwwo.......',
      '......owwwwwwwwo......',
      '.....owwwwwwwwwwo.....',
      '....owwwwwwwwwwwwo....',
      '....owwwwwwwwwwwwo....',
      '....owwwwwwwwwwwwo....',
      '....owwwwwwwwwwwwo....',
      '.aa.owwwwwwwwwwwwo.aa.',
      'aaaaowwwwwwwwwwwwoaaaa',
      'aAAaowwwwwwwwwwwwoaAAa',
      '.aAAowwwwwwwwwwwwoAAa.',
      '..aAowwwwwwwwwwwwoAa..',
      '...aowwwwwwwwwwwwoa...',
      '....owwwwwwwwwwwso....',
      '....owwwwwwwwwwsso....',
      '.....owwwwwwwssso.....',
      '......oooooooooo......',
      '.......bb....bb.......'] }],
  rana: [
    { face: [2, -1], hat: 3, screen: [6, 11, 8, 3], pal: RANA_PAL, rows: blobSprite(18, 17, [
      { cx: 5, cy: 15.4, rx: 2.2, ry: 1, fill: 'd' },
      { cx: 13, cy: 15.4, rx: 2.2, ry: 1, fill: 'd' },
      { box: [2, 5, 14, 10], r: 3, fill: 'w', shade: 's', light: 'h' },
      { box: [4, 9, 10, 5], r: 1.2, fill: 'k' },
      { box: [4.6, 9.6, 8.8, 3.8], r: 0.8, fill: 'c' },
      { cx: 6, cy: 5, rx: 2.8, ry: 2.6, fill: 'w', shade: 's', light: 'h' },
      { cx: 12, cy: 5, rx: 2.8, ry: 2.6, fill: 'w', shade: 's', light: 'h' },
      { cx: 6, cy: 5, rx: 1.6, ry: 1.6, fill: 'W' },
      { cx: 12, cy: 5, rx: 1.6, ry: 1.6, fill: 'W' }]) },
    // `eyeGap` spreads the face's eyes and cheeks apart so they sit on the two eye bumps.
    { face: [2, 0], eyeGap: 2, hat: 3, pal: FROG_PAL, rows: blobSprite(18, 18, [
      { cx: 3.4, cy: 14.5, rx: 2.6, ry: 2.3, fill: 'w', shade: 's', light: 'h' },
      { cx: 14.6, cy: 14.5, rx: 2.6, ry: 2.3, fill: 'w', shade: 's', light: 'h' },
      { cx: 2.6, cy: 16.9, rx: 2.4, ry: 0.9, fill: 'w', shade: 's' },
      { cx: 15.4, cy: 16.9, rx: 2.4, ry: 0.9, fill: 'w', shade: 's' },
      { cx: 9, cy: 13.6, rx: 5.3, ry: 4.2, fill: 'k' },
      { cx: 9, cy: 13.6, rx: 4.7, ry: 4, fill: 'w', shade: 's', light: 'h' },
      { cx: 9, cy: 14.6, rx: 2.2, ry: 2.3, fill: 'v' },
      { cx: 6.2, cy: 14.8, rx: 1.5, ry: 2.6, fill: 'k' },
      { cx: 11.8, cy: 14.8, rx: 1.5, ry: 2.6, fill: 'k' },
      { cx: 6.2, cy: 14.6, rx: 0.8, ry: 2.2, fill: 'w' },
      { cx: 11.8, cy: 14.6, rx: 0.8, ry: 2.2, fill: 'w' },
      { cx: 6.2, cy: 17, rx: 1.6, ry: 0.8, fill: 'w', shade: 's' },
      { cx: 11.8, cy: 17, rx: 1.6, ry: 0.8, fill: 'w', shade: 's' },
      { cx: 9, cy: 8.6, rx: 8.2, ry: 4.6, fill: 'k' },
      { cx: 9, cy: 8, rx: 8.6, ry: 4.8, fill: 'w', shade: 's', light: 'h' },
      { cx: 3.5, cy: 5.2, rx: 3.3, ry: 3, fill: 'w', light: 'h' },
      { cx: 14.5, cy: 5.2, rx: 3.3, ry: 3, fill: 'w', light: 'h' },
      { box: [3.5, 11.4, 11, 1.8], r: 0.9, fill: 'r', shade: 'R' },
      { cx: 13.2, cy: 13.9, rx: 1, ry: 1.3, a: 0.4, fill: 'r', shade: 'R' }]) },
    { face: [3, 1], eyeGap: 2, hat: 5, pal: FROG_PAL, rows: blobSprite(20, 21, [
      { cx: 3.8, cy: 17.6, rx: 2.7, ry: 2.3, fill: 'w', shade: 's', light: 'h' },
      { cx: 16.2, cy: 17.6, rx: 2.7, ry: 2.3, fill: 'w', shade: 's', light: 'h' },
      { cx: 2.9, cy: 20, rx: 2.7, ry: 0.9, fill: 'w', shade: 's' },
      { cx: 17.1, cy: 20, rx: 2.7, ry: 0.9, fill: 'w', shade: 's' },
      { cx: 10, cy: 16.4, rx: 5.8, ry: 4.3, fill: 'k' },
      { cx: 10, cy: 16.4, rx: 5.2, ry: 4.1, fill: 'w', shade: 's', light: 'h' },
      { cx: 10, cy: 17.4, rx: 2.3, ry: 2.5, fill: 'v' },
      { cx: 7, cy: 17.8, rx: 1.6, ry: 2.8, fill: 'k' },
      { cx: 13, cy: 17.8, rx: 1.6, ry: 2.8, fill: 'k' },
      { cx: 7, cy: 17.6, rx: 0.9, ry: 2.4, fill: 'w' },
      { cx: 13, cy: 17.6, rx: 0.9, ry: 2.4, fill: 'w' },
      { cx: 7, cy: 20.1, rx: 1.7, ry: 0.8, fill: 'w', shade: 's' },
      { cx: 13, cy: 20.1, rx: 1.7, ry: 0.8, fill: 'w', shade: 's' },
      { cx: 10, cy: 10.2, rx: 9.2, ry: 5.2, fill: 'k' },
      { cx: 10, cy: 9.6, rx: 9.6, ry: 5.2, fill: 'w', shade: 's', light: 'h' },
      { cx: 4.5, cy: 6.2, rx: 3.5, ry: 3.2, fill: 'w', light: 'h' },
      { cx: 15.5, cy: 6.2, rx: 3.5, ry: 3.2, fill: 'w', light: 'h' },
      { rect: [7, 1, 6, 2], fill: 'y' }, { rect: [7, 3, 6, 1], fill: 'Y' },
      { rect: [7, 0, 1, 1], fill: 'y' }, { rect: [9, 0, 2, 1], fill: 'y' }, { rect: [12, 0, 1, 1], fill: 'y' }]) }],
  coach: [
    { face: [0, 1], hat: 3, pal: COACH_PAL, rows: blobSprite(14, 14, [
      { cx: 4.5, cy: 13.4, rx: 1.5, ry: 0.7, fill: 'S' }, { cx: 9.5, cy: 13.4, rx: 1.5, ry: 0.7, fill: 'S' },
      { box: [1.5, 3.2, 11, 10.2], r: 3.4, fill: 'w', shade: 's', light: 'h' },
      { cx: 7, cy: 4.4, rx: 4.2, ry: 4, maxY: 4, fill: 'c', shade: 'C' },
      { rect: [6, 0, 2, 1], fill: 'C' }, { rect: [6, 2, 2, 1], fill: 'q' },
      { cx: 7, cy: 4.4, rx: 3.4, ry: 0.8, fill: 'c' }, { rect: [5, 5, 4, 1], fill: 'C' },
      { rect: [3, 9, 1, 1], fill: 'l' }, { rect: [4, 10, 1, 1], fill: 'l' }, { rect: [5, 11, 1, 1], fill: 'l' },
      { rect: [10, 9, 1, 1], fill: 'l' }, { rect: [9, 10, 1, 1], fill: 'l' }, { rect: [8, 11, 1, 1], fill: 'l' },
      { rect: [6, 11, 3, 1], fill: 'g' }, { rect: [6, 12, 3, 1], fill: 'G' }, { rect: [9, 12, 1, 1], fill: 'G' }]) }],
  oso: [
    { face: [1, 2], hat: 2, pal: BEAR_PAL, rows: blobSprite(16, 15, [
      ...bearEar(3.2, 3, 2.2), ...bearEar(12.8, 3, 2.2),
      { cx: 4.6, cy: 14.3, rx: 1.8, ry: 0.9, fill: 's' }, { cx: 11.4, cy: 14.3, rx: 1.8, ry: 0.9, fill: 's' },
      { cx: 8, cy: 8.4, rx: 7.2, ry: 6, fill: 'w', shade: 's', light: 'h' },
      { cx: 8, cy: 9.9, rx: 2.4, ry: 1.6, fill: 'm' },
      { rect: [7, 9, 2, 1], fill: 'n' }]) },
    { face: [2, 1], hat: 2, pal: BEAR_PAL, rows: blobSprite(18, 18, [
      ...bearEar(3.6, 2.6, 2.3), ...bearEar(14.4, 2.6, 2.3),
      { cx: 4, cy: 13.4, rx: 1.6, ry: 2.4, fill: 'w', shade: 's' }, { cx: 14, cy: 13.4, rx: 1.6, ry: 2.4, fill: 'w', shade: 's' },
      { cx: 9, cy: 14, rx: 5.4, ry: 3.8, fill: 'w', shade: 's', light: 'h' },
      { cx: 9, cy: 14.8, rx: 2.8, ry: 2.4, fill: 'm' },
      { cx: 5.4, cy: 16.6, rx: 2.4, ry: 1.3, fill: 'w', shade: 's' }, { cx: 12.6, cy: 16.6, rx: 2.4, ry: 1.3, fill: 'w', shade: 's' },
      { cx: 5.4, cy: 16.7, rx: 1, ry: 0.6, fill: 'p' }, { cx: 12.6, cy: 16.7, rx: 1, ry: 0.6, fill: 'p' },
      { cx: 9, cy: 7.2, rx: 6.6, ry: 5.4, fill: 'w', shade: 's', light: 'h' },
      { cx: 9, cy: 8.8, rx: 2.5, ry: 1.7, fill: 'm' },
      { rect: [8, 8, 2, 1], fill: 'n' },
      { box: [4.5, 11.4, 9, 1.6], r: 0.8, fill: 'b', shade: 'B' }]) },
    { face: [3, 2], hat: 2, pal: BEAR_PAL, rows: blobSprite(20, 21, [
      ...bearEar(3.8, 2.8, 2.6), ...bearEar(16.2, 2.8, 2.6),
      { cx: 10, cy: 15.6, rx: 9.2, ry: 5.2, fill: 'v', shade: 'V' },
      { rect: [2, 14, 1, 1], fill: 'y' }, { rect: [17, 16, 1, 1], fill: 'y' }, { rect: [3, 18, 1, 1], fill: 'y' }, { rect: [16, 12, 1, 1], fill: 'y' },
      { cx: 5.2, cy: 15.2, rx: 1.7, ry: 2.6, fill: 'w', shade: 's' }, { cx: 14.8, cy: 15.2, rx: 1.7, ry: 2.6, fill: 'w', shade: 's' },
      { cx: 10, cy: 16, rx: 5.6, ry: 4.4, fill: 'w', shade: 's', light: 'h' },
      { cx: 10, cy: 17, rx: 3, ry: 2.8, fill: 'm' },
      { cx: 6.4, cy: 19.6, rx: 2.6, ry: 1.3, fill: 'w', shade: 's' }, { cx: 13.6, cy: 19.6, rx: 2.6, ry: 1.3, fill: 'w', shade: 's' },
      { cx: 6.4, cy: 19.7, rx: 1.1, ry: 0.6, fill: 'p' }, { cx: 13.6, cy: 19.7, rx: 1.1, ry: 0.6, fill: 'p' },
      { cx: 10, cy: 8, rx: 7.2, ry: 6, fill: 'w', shade: 's', light: 'h' },
      { cx: 10, cy: 9.9, rx: 2.7, ry: 1.8, fill: 'm' },
      { rect: [9, 9, 2, 1], fill: 'n' },
      { rect: [9, 13, 2, 1], fill: 'y' },
      { rect: [16, 0, 1, 3], fill: 'y' }, { rect: [15, 1, 3, 1], fill: 'y' }]) }],
  // Panda: a bear's shape in black and white, with eye patches around the face's eyes; it grows into a floating
  // Zen Panda on a lotus.
  panda: [
    { face: [1, 2], hat: 2, pal: PANDA_PAL, rows: blobSprite(16, 15, [
      ...pandaEar(3.2, 3, 2.2), ...pandaEar(12.8, 3, 2.2),
      { cx: 4.6, cy: 14.3, rx: 1.8, ry: 0.9, fill: 'k' }, { cx: 11.4, cy: 14.3, rx: 1.8, ry: 0.9, fill: 'k' },
      { cx: 8, cy: 8.4, rx: 7.2, ry: 6, fill: 'w', shade: 's', light: 'h' },
      { cx: 5.5, cy: 8.6, rx: 1.9, ry: 1.7, fill: 'e' }, { cx: 11.5, cy: 8.6, rx: 1.9, ry: 1.7, fill: 'e' },
      { rect: [7, 10, 2, 1], fill: 'n' }]) },
    { face: [2, 1], hat: 2, pal: PANDA_PAL, rows: blobSprite(18, 18, [
      ...pandaEar(3.6, 2.6, 2.3), ...pandaEar(14.4, 2.6, 2.3),
      { rect: [15, 6, 1, 11], fill: 'g', shade: 'G' }, { rect: [16, 5, 1, 2], fill: 'g' }, { rect: [15, 10, 1, 1], fill: 'G' },
      { cx: 9, cy: 14, rx: 5.4, ry: 3.8, fill: 'w', shade: 's', light: 'h' },
      { cx: 4, cy: 13.4, rx: 1.6, ry: 2.4, fill: 'k' }, { cx: 14, cy: 13.4, rx: 1.6, ry: 2.4, fill: 'k' },
      { cx: 5.4, cy: 16.6, rx: 2.4, ry: 1.3, fill: 'k', shade: 'K' }, { cx: 12.6, cy: 16.6, rx: 2.4, ry: 1.3, fill: 'k', shade: 'K' },
      { cx: 9, cy: 7.2, rx: 6.6, ry: 5.4, fill: 'w', shade: 's', light: 'h' },
      { cx: 6.5, cy: 7.6, rx: 1.9, ry: 1.7, fill: 'e' }, { cx: 12.5, cy: 7.6, rx: 1.9, ry: 1.7, fill: 'e' },
      { rect: [8, 9, 2, 1], fill: 'n' }]) },
    { face: [3, 2], hat: 2, float: true, pal: PANDA_PAL, rows: blobSprite(20, 21, [
      ...pandaEar(3.8, 2.8, 2.6), ...pandaEar(16.2, 2.8, 2.6),
      { cx: 10, cy: 19.4, rx: 9.6, ry: 1.6, fill: 'l', shade: 'L' },
      { cx: 3.2, cy: 17.8, rx: 2.4, ry: 1.8, fill: 'l', shade: 'L' }, { cx: 16.8, cy: 17.8, rx: 2.4, ry: 1.8, fill: 'l', shade: 'L' },
      { cx: 10, cy: 16, rx: 5.6, ry: 4.4, fill: 'w', shade: 's', light: 'h' },
      { cx: 5.2, cy: 15.2, rx: 1.7, ry: 2.6, fill: 'k' }, { cx: 14.8, cy: 15.2, rx: 1.7, ry: 2.6, fill: 'k' },
      { cx: 7.4, cy: 18.6, rx: 2.8, ry: 1.2, fill: 'k', shade: 'K' }, { cx: 12.6, cy: 18.6, rx: 2.8, ry: 1.2, fill: 'k', shade: 'K' },
      { cx: 10, cy: 8, rx: 7.2, ry: 6, fill: 'w', shade: 's', light: 'h' },
      { cx: 7.5, cy: 8.6, rx: 2, ry: 1.8, fill: 'e' }, { cx: 13.5, cy: 8.6, rx: 2, ry: 1.8, fill: 'e' },
      { rect: [9, 10, 2, 1], fill: 'n' }, { rect: [10, 3, 1, 1], fill: 'y' },
      { rect: [1, 7, 1, 1], fill: 'y' }, { rect: [18, 10, 1, 1], fill: 'y' }, { rect: [2, 12, 1, 1], fill: 'y' }]) }],
  zorro: [
    { face: [0, 0], pal: FOX_PAL, rows: KIT_HEAD.concat(['...oooooooooo...', '....oo....oo....']) },
    { face: [0, 0], pal: FOX_PAL, rows: [
      KIT_HEAD[0] + '......', KIT_HEAD[1] + '......', KIT_HEAD[2] + '......', KIT_HEAD[3] + '......',
      KIT_HEAD[4] + '......', KIT_HEAD[5] + '......', KIT_HEAD[6] + '......', KIT_HEAD[7] + '..oo..',
      KIT_HEAD[8] + '.occo.', KIT_HEAD[9] + 'offffo', KIT_HEAD[10] + 'offffo',
      '..orrrrrrrrrro..offffo',
      '..offffffffffo..offFFo',
      '..offccccccffooooFFo..',
      '..offccccccffo..oo....',
      '..offffffffffo........',
      '...oooooooooo.........',
      '...oFo....oFo.........'] },
    { face: [5, 0], float: true, pal: { w: '#f6f2ff', s: '#d8d0f0', l: '#c9b8ff', m: '#ff6fa8', k: '#8ff0ff', n: '#2b1d3d' },
      rows: KITSUNE_HEAD.map((r, i) => TAIL_L[i] + r + TAIL_L[i].split('').reverse().join('')) }]
});
// Hats won as prizes. Each sits centered on the face, with its brim on the sprite's `hat` row.
const HATS = {
  party: { pal: { p: '#ff7aa8', y: '#ffd45c' }, rows: ['...y...', '...p...', '..pyp..', '..ypy..', '.pypyp.', '.ypypy.'] },
  flower: { pal: { f: '#ff9cc4', F: '#e8649a', y: '#ffd45c' }, rows: ['.f.f.', 'ffyff', '.fFf.'] },
  cap: { pal: { b: '#3d6ef0', w: '#ffffff' }, rows: ['..bbbb....', '.bbbbbb...', '.bwbbbbbbb'] },
  bow: { pal: { p: '#ff7aa8', P: '#e8465a' }, rows: ['pp.pp', 'ppPpp', 'pp.pp'] },
  beanie: { pal: { r: '#e8465a', w: '#ffffff', W: '#f0eef8' }, rows: ['...ww...', '..rrrr..', '.rrrrrr.', 'rrrrrrrr', 'WWWWWWWW'] },
  crown: { pal: { y: '#ffd45c', r: '#ff5470' }, rows: ['y..y..y', 'yy.y.yy', 'yyyyyyy', 'yryyyry'] },
  wizard: { pal: { P: '#6a4ab8', y: '#ffd45c' }, rows: ['....P....', '...PPy...', '...PPP...', '..PPPPP..', '..PyPPP..', 'PPPPPPPPP'] },
  goldstar: { pal: { y: '#ffd45c', Y: '#e0a526' }, rows: ['..y..', '.yyy.', 'yyyyy', '.yYy.', 'y...y'] },
  teamcap: { pal: { p: '#7c5aa4', P: '#5c3e86', y: '#ffd45c' }, rows: ['..pppp....', '.ppyypp...', '.pppppppPP'] },
  lotus: { pal: { p: '#ffc2dc', P: '#ff7aa8', y: '#ffd45c', g: '#5fd38a' }, rows: ['...p...', '..pyp..', 'p.pPp.p', 'pPpPpPp', '.ggggg.'] },
  leafcrown: { pal: { g: '#5fd38a', G: '#3fa86a', y: '#ffd45c' }, rows: ['g.g.g.g', 'GgGyGgG'] },
  halo: { pal: { y: '#ffe27a', Y: '#e0a526' }, rows: ['.yyyyy.', 'y.....y', '.YYYYY.', '.......', '.......'] },
  origami: { pal: { w: '#ffffff', W: '#d8def2', r: '#ff5470' }, rows: ['....r...', '...ww...', 'w..ww..w', 'wwwwwwww', '.WWWWWW.'] }
};
for (const id in HATS) HATS[id].rows = outlined(HATS[id].rows);
function drawHat(c, id, cx, brim) {
  const hat = HATS[id]; if (!hat) return;
  spr(c, hat.rows, Math.round(cx - hat.rows[0].length / 2), brim - hat.rows.length + 2, null, Object.assign({ o: '#2b1d3d' }, hat.pal));
}
const WING_S = ['cc.', 'ccc', '.Cc'];
const WING_B = ['cc..', 'ccc.', 'cccc', '.cCC', '..Cc'];
const BERRY = ['..g..', '.ggg.', 'rrkrr', 'rrrrr', '.rkr.', '..r..'];
const HEART = ['xx.xx', 'xxxxx', '.xxx.', '..x..'];
const ZED = ['zzzz', '..z.', '.z..', 'zzzz'];

function spr(c, rows, ox, oy, color, pal, mirror) {
  pal = pal || PAL;
  for (let y = 0; y < rows.length; y++) {
    const r = rows[y], n = r.length;
    for (let x = 0; x < n; x++) {
      const ch = r[mirror ? n - 1 - x : x]; if (ch === '.') continue;
      c.fillStyle = color || pal[ch]; c.fillRect(ox + x, oy + y, 1, 1);
    }
  }
}

// gap: pixels to move the eyes, cheeks and tears outward on each side; the mouth stays centered.
function drawFace(c, ox, oy, st, f, blink, gap = 0) {
  const E = '#2b1d3d', HI = '#ffffff', CK = '#ff9cba', TG = '#ff6f91', TR = '#6cc8ff', TR2 = '#c6efff';
  const p = (x, y, col) => {
    if (y <= 8 || x <= 4 || x >= 11) x += x < 8 ? -gap : gap;
    c.fillStyle = col; c.fillRect(ox + x, oy + y, 1, 1);
  };
  const many = (pts, col) => pts.forEach(([x, y]) => p(x, y, col));
  // Wide-set eyes (gap > 0) are drawn a size bigger when open.
  const open = () => gap
    ? (many([[3,5],[4,5],[5,5],[3,6],[4,6],[5,6],[3,7],[4,7],[5,7],[10,5],[11,5],[12,5],[10,6],[11,6],[12,6],[10,7],[11,7],[12,7]], E), p(3, 5, HI), p(10, 5, HI))
    : (many([[4,6],[5,6],[4,7],[5,7],[10,6],[11,6],[10,7],[11,7]], E), p(4, 6, HI), p(10, 6, HI));
  const closed = () => many([[4,7],[5,7],[10,7],[11,7]], E);
  const happy = () => many([[3,7],[4,6],[5,6],[6,7],[9,7],[10,6],[11,6],[12,7]], E);
  const cheeks = () => many([[2,8],[3,8],[12,8],[13,8]], CK);
  const bigMouth = () => { many([[6,9],[7,9],[8,9],[9,9]], E); many([[7,10],[8,10]], TG); };
  const smallMouth = () => many([[7,9],[8,9]], E);
  switch (st) {
    case 'happy': case 'excited': happy(); cheeks(); bigMouth(); break;
    case 'love': happy(); cheeks(); smallMouth(); break;
    case 'eat': happy(); cheeks();
      if (Math.floor(f / 7) % 2) { many([[6,9],[7,9],[8,9],[9,9],[6,10],[9,10]], E); many([[7,10],[8,10]], TG); } else smallMouth();
      break;
    case 'worried':
      blink ? closed() : open();
      many([[6,10],[7,9],[8,10],[9,9]], E);
      many([[14,2],[14,3],[15,3],[14,4],[15,4]], TR); p(14, 2, TR2);
      break;
    case 'sad':
      many([[4,7],[5,7],[4,8],[5,8],[10,7],[11,7],[10,8],[11,8]], E);
      many([[4,5],[5,4],[11,5],[10,4]], E);
      many([[6,10],[7,9],[8,9],[9,10]], E);
      break;
    case 'cry':
      many([[4,6],[5,7],[4,8],[11,6],[10,7],[11,8]], E);
      many([[6,9],[7,9],[8,9],[9,9],[6,10],[9,10]], E); many([[7,10],[8,10]], TG);
      for (let y = 8; y <= 11; y++) { const col = (y + Math.floor(f / 4)) % 2 ? TR : TR2; p(3, y, col); p(12, y, col); }
      break;
    case 'sleep': closed(); p(7, 9, E); cheeks(); break;
    case 'meditate': closed(); cheeks(); smallMouth(); break;
    case 'angry':
      open();
      many([[3,4],[4,4],[5,5],[6,5],[9,5],[10,5],[11,4],[12,4]], E);
      many([[6,10],[7,9],[8,9],[9,10]], E);
      many([[2,8],[3,8],[12,8],[13,8]], '#ff6f6f');
      break;
    case 'dizzy':
      many([[3,5],[5,5],[4,6],[3,7],[5,7],[10,5],[12,5],[11,6],[10,7],[12,7]], E);
      many([[6,10],[7,9],[8,10],[9,9]], E);
      break;
    default: blink ? closed() : open(); cheeks(); smallMouth();
  }
}

function orbit(c, ox, oy, w, h, n, f, layer, flash) {
  for (let k = 0; k < n; k++) {
    const a = f * 0.04 + k * Math.PI, s = Math.sin(a);
    if ((layer === 'back') !== (s < 0)) continue;
    const x = Math.round(ox + w / 2 + Math.cos(a) * (w / 2 + 3)) - 1, y = Math.round(oy + h * 0.4 + s * 3) - 1;
    c.fillStyle = flash || '#ffd45c'; c.fillRect(x, y, 3, 3);
    if (!flash) { c.fillStyle = '#fff3b8'; c.fillRect(x, y, 3, 1); c.fillStyle = '#e0a526'; c.fillRect(x + 2, y + 1, 1, 2); }
  }
}
function rainbow(c, ox, oy, w, flash) {
  const cx = ox + w / 2 - 0.5, base = oy + 4, R = Math.floor(w / 2) - 1;
  ['#ff7aa8', '#ffd45c', '#5fe0c8', '#8fd3ff'].forEach((col, i) => {
    const r = R - i; c.fillStyle = flash || col;
    for (let x = -r; x <= r; x++) c.fillRect(Math.round(cx + x), base - Math.round(Math.sqrt(r * r - x * x) * 0.55), 1, 1);
  });
}
function wings(c, ox, oy, w, h, size, f, flash) {
  const wing = size === 2 ? WING_B : WING_S, ww = wing[0].length, pal = { c: '#ffffff', C: '#c4cff2' };
  const wy = oy + Math.round(h * 0.3) + (Math.floor(f / 10) % 2);
  spr(c, wing, ox - ww + 1, wy, flash, pal); spr(c, wing, ox + w - 1, wy, flash, pal, true);
}

const spriteOf = look => look.char ? SPR[look.char][look.stage - 1] : SPR.baby;
const hoverOf = (sp, f) => sp.float ? 3 + Math.round(Math.sin(f * 0.06) * 1.5) : 0;
// Highest point of the pet above the ground, including anything it wears above its head.
const petTop = (look, f) => { const sp = spriteOf(look); return GROUND - sp.rows.length - hoverOf(sp, f) - (sp.crown || 0); };

// cx: center x; ground: y of the ground line; o: { fx (face nudge), lift (bob), blink, flash }
function drawPet(c, cx, ground, st, f, look, o = {}) {
  const sp = spriteOf(look), w = sp.rows[0].length, h = sp.rows.length;
  // Meditating, it rises a little and drifts up and down with slow breaths.
  const zen = st === 'meditate' ? 4 + Math.round(Math.sin(f * 0.04) * 1.5) : 0;
  const ox = Math.round(cx - w / 2), oy = ground - h - hoverOf(sp, f) - (o.lift || 0) - zen, flash = o.flash || null;
  if (sp.float || zen) { c.fillStyle = 'rgba(20,10,48,.28)'; c.fillRect(Math.round(cx - w * 0.3), ground, Math.round(w * 0.6), 1); }
  if (zen && !flash) openArms(c, sp, ox, oy);
  if (sp.rainbow) rainbow(c, ox, oy, w, flash);
  if (sp.wings) wings(c, ox, oy, w, h, sp.wings, f, flash);
  if (sp.orbit) orbit(c, ox, oy, w, h, sp.orbit, f, 'back', flash);
  spr(c, sp.rows, ox, oy, flash, Object.assign({ o: '#2b1d3d' }, sp.pal));
  if (o.dirty && !flash) mud(c, sp, ox, oy);
  if (sp.screen && !flash) drawScreen(c, ox + sp.screen[0], oy + sp.screen[1], sp.screen[2], sp.screen[3], st, f, sp.pal);
  if (!flash) drawFace(c, ox + sp.face[0] + (o.fx || 0), oy + sp.face[1], st, f, o.blink, sp.eyeGap);
  if (sp.beak) {
    const bx = ox + sp.beak[0] + (o.fx || 0), by = oy + sp.beak[1], open = st === 'cry' || st === 'eat' && Math.floor(f / 7) % 2;
    c.fillStyle = flash || '#ff9a3c'; c.fillRect(bx, by, 4, 1); c.fillStyle = flash || '#e0702a'; c.fillRect(bx + 1, by + 1, 2, 1);
    if (open && !flash) { c.fillStyle = '#2b1d3d'; c.fillRect(bx + 1, by + 1, 2, 1); c.fillRect(bx + 1, by + 2, 2, 1); }
  }
  if (look.hat && !flash) drawHat(c, look.hat, ox + sp.face[0] + 8 + (o.fx || 0), oy + (sp.hat ?? sp.face[1] + 3));
  if (sp.orbit) orbit(c, ox, oy, w, h, sp.orbit, f, 'front', flash);
}

// The color most of a sprite is made of (its body), for arms and mud spots.
function bodyOf(sp) {
  if (sp._body) return sp._body;
  const n = {};
  for (const r of sp.rows) for (const ch of r) if (ch !== '.' && ch !== 'o') n[ch] = (n[ch] || 0) + 1;
  const ch = Object.keys(n).sort((a, b) => n[b] - n[a])[0];
  return (sp._body = { ch, col: (sp.pal && sp.pal[ch]) || PAL[ch] || '#fff4e6' });
}
// The body's edges on one row: [first, last] filled column.
const edgesAt = (sp, row) => { const r = sp.rows[Math.max(0, Math.min(sp.rows.length - 1, row))]; return [r.search(/[^.]/), r.length - 1 - [...r].reverse().join('').search(/[^.]/)]; };
// Arms open wide and a little up, palms out, like a calm Buddha.
function openArms(c, sp, ox, oy) {
  const row = Math.round(sp.rows.length * 0.55), [l, r] = edgesAt(sp, row), y = oy + row, body = bodyOf(sp).col;
  for (const [x0, d] of [[ox + l, -1], [ox + r, 1]]) {
    for (let i = 1; i <= 4; i++) {
      const x = x0 + d * i, yy = y - Math.floor((i - 1) / 2);
      c.fillStyle = '#2b1d3d'; c.fillRect(x, yy - 1, 1, 3);
      if (i < 4) { c.fillStyle = body; c.fillRect(x, yy, 1, 1); }
    }
    c.fillStyle = '#2b1d3d'; c.fillRect(x0 + d * 5, y - 3, 1, 2);
  }
}
// A few mud spots on the body when it's been a day without a bath.
function mud(c, sp, ox, oy) {
  if (!sp._mud) {
    // Spots where the body is at least 2 wide and 2 tall, in the lower half and away from tails, spread out.
    const body = bodyOf(sp).ch, h = sp.rows.length, w = sp.rows[0].length, at = (x, y) => (sp.rows[y] || '')[x] === body, cells = [];
    for (let y = Math.floor(h / 2); y < h - 1; y++) for (let x = Math.floor(w * 0.12); x < w * 0.72; x++)
      if (at(x, y) && at(x + 1, y) && at(x, y + 1) && at(x + 1, y + 1)) cells.push([x, y]);
    sp._mud = cells.length ? [0.15, 0.55, 0.9].map(k => cells[Math.floor(k * (cells.length - 1))]) : [];
  }
  sp._mud.forEach(([x, y], i) => {
    c.fillStyle = '#6b4426'; c.fillRect(ox + x, oy + y, 2, 1);
    c.fillStyle = '#4e3220'; c.fillRect(ox + x + (i % 2), oy + y + 1, 1, 1);
  });
}
// A little bathtub in front of the pet (which sits up in it, so its face shows), with bubbles at both ends.
function drawTub(c, cx, ground, sp, f) {
  const w = sp.rows[0].length + 8, x = Math.round(cx - w / 2), y = ground - 5;
  c.fillStyle = '#2b1d3d'; c.fillRect(x, y, w, 5); c.fillRect(x + 2, ground, 2, 2); c.fillRect(x + w - 4, ground, 2, 2);
  c.fillStyle = '#eef3ff'; c.fillRect(x + 1, y + 1, w - 2, 3);
  c.fillStyle = '#c9d3f5'; c.fillRect(x + 1, y + 3, w - 2, 1);
  c.fillStyle = '#7fd3ff'; c.fillRect(x + 1, y + 1, w - 2, 1);
  for (const [bx, k] of [[x + 1, 0], [x + 4, 1], [x + w - 7, 2], [x + w - 4, 3]]) {
    const by = y - 3 - (Math.floor(f / 12 + k) % 2);
    c.fillStyle = '#2b1d3d'; c.fillRect(bx, by - 1, 2, 1); c.fillRect(bx - 1, by, 1, 2); c.fillRect(bx + 2, by, 1, 2); c.fillRect(bx, by + 2, 2, 1);
    c.fillStyle = '#ffffff'; c.fillRect(bx, by, 2, 2);
    c.fillStyle = '#bfe9ff'; c.fillRect(bx + 1, by + 1, 1, 1);
  }
}
// A small red anger mark that pulses beside the head (instead of puffs that could look like a smell).
function drawAnger(c, x, y, f) {
  if (Math.floor(f / 18) % 3 === 2) return;
  const big = Math.floor(f / 6) % 2;
  c.fillStyle = '#2b1d3d'; c.fillRect(x - 1, y - 1, 7, 7);
  c.fillStyle = '#ff4f6d';
  for (const [dx, dy] of [[1, 0], [0, 1], [3, 0], [4, 1], [0, 3], [1, 4], [4, 3], [3, 4]]) c.fillRect(x + dx, y + dy, 1, 1);
  if (big) { c.fillRect(x + 1, y + 1, 1, 1); c.fillRect(x + 3, y + 1, 1, 1); c.fillRect(x + 1, y + 3, 1, 1); c.fillRect(x + 3, y + 3, 1, 1); }
}

function drawCube(c, x, y, t, bad) {
  const a = t * 0.004;
  const A = Math.max(1, Math.round(Math.abs(Math.cos(a)) * 6)), B = Math.round(Math.abs(Math.sin(a)) * 6);
  const flip = Math.floor(a / (Math.PI / 2)) % 2;
  const first = flip ? B : A, second = flip ? A : B;
  const lx = Math.round(x - (first + second) / 2), ty = Math.round(y - 3);
  c.fillStyle = bad ? '#5b3fa0' : '#ffd45c'; c.fillRect(lx, ty, first, 6);
  c.fillStyle = bad ? '#34205f' : '#e0a526'; c.fillRect(lx + first, ty, second, 6);
  c.fillStyle = bad ? '#9a7ae0' : '#fff3b8'; c.fillRect(lx, ty, first + second, 1);
  if (!bad && Math.sin(t * 0.006) > 0.85) { c.fillStyle = '#ffffff'; c.fillRect(Math.round(x) + 4, ty - 3, 1, 1); }
}

// 36x36 preview canvas used by the gallery, the chooser, the team list and the logo
// silhouette: a color to draw the pet as a flat shape (for characters still locked).
function drawPreview(canvas, look, st, silhouette) {
  const c = canvas.getContext('2d'); c.clearRect(0, 0, 36, 36);
  drawPet(c, 18, 34, st || 'happy', 20, look, { flash: silhouette });
}


function disc(c, cx, cy, r, col) {
  c.fillStyle = col;
  for (let y = -r; y <= r; y++) { const half = Math.round(Math.sqrt(r * r - y * y)); c.fillRect(cx - half, cy + y, half * 2 + 1, 1); }
}
function puff(c, x, y, s, light, shade) {
  disc(c, x, y + 2, 6 * s, shade); disc(c, x + 9 * s, y - 3 * s, 8 * s, shade); disc(c, x + 19 * s, y + 1, 6 * s, shade);
  disc(c, x, y, 6 * s, light); disc(c, x + 9 * s, y - 5 * s, 8 * s, light); disc(c, x + 19 * s, y - 1, 6 * s, light);
}

// Island decorations won as prizes (from the rewards block of main.html).
function drawPrize(c, id, x, y) {
  const r = (col, rx, ry, w, h) => { c.fillStyle = col; c.fillRect(x + rx, y + ry, w, h); };
  switch (id) {
    case 'sign': r('#7a4a34', -1, -14, 2, 14); r('#7a4a34', -8, -14, 16, 8); r('#d9a878', -7, -13, 14, 6); r('#7a4a34', -5, -11, 10, 1); r('#7a4a34', -5, -9, 7, 1); break;
    case 'teamflag': r('#5a3820', -1, -24, 2, 24); r('#2b1d3d', 1, -24, 13, 10); r('#7c5aa4', 2, -23, 11, 8); r('#9a78c4', 2, -23, 11, 2);
      r('#ffd45c', 6, -20, 3, 3); r('#ffd45c', 7, -21, 1, 5); r('#ffd45c', 5, -19, 5, 1); r('#ffd45c', 0, -26, 2, 2); break;
    case 'mailbox': r('#5b4636', -1, -8, 2, 8); r('#2b1d3d', -5, -15, 10, 8); r('#e2566f', -4, -14, 8, 6); r('#b83c56', -4, -9, 8, 1); r('#2b1d3d', 4, -18, 1, 6); r('#ffd45c', 5, -18, 3, 2); break;
    case 'bench': r('#5a3820', -8, -4, 2, 4); r('#5a3820', 6, -4, 2, 4); r('#c8956a', -9, -6, 18, 2); r('#a06a48', -9, -11, 18, 2); r('#5a3820', -8, -9, 1, 3); r('#5a3820', 7, -9, 1, 3); break;
    case 'trophy': r('#8a6834', -4, -3, 8, 3); r('#e0a526', -2, -6, 4, 3); r('#ffd45c', -5, -13, 10, 7); r('#ffd45c', -7, -12, 2, 4); r('#ffd45c', 5, -12, 2, 4); r('#fff3b8', -3, -12, 2, 4); break;
    case 'mushrooms':
      r('#fff1dc', -6, -4, 3, 4); r('#ff5a5a', -8, -7, 7, 3); r('#ffffff', -6, -7, 1, 1);
      r('#fff1dc', 3, -3, 2, 3); r('#ff5a5a', 1, -5, 6, 2); r('#ffffff', 4, -5, 1, 1); break;
    case 'bonsai':
      r('#2b1d3d', -6, -5, 12, 5); r('#b8644a', -5, -4, 10, 3); r('#8a4a36', -5, -2, 10, 1);
      r('#6b4426', -1, -10, 2, 5); r('#6b4426', 1, -12, 3, 2); r('#6b4426', -3, -11, 2, 2);
      r('#2f9a6a', -9, -15, 8, 4); r('#3fb26a', -8, -16, 6, 2); r('#2f9a6a', 1, -19, 8, 5); r('#3fb26a', 2, -20, 6, 2); r('#7cd38a', 3, -20, 2, 1); r('#7cd38a', -7, -16, 2, 1); break;
    case 'zengarden':
      r('#2b1d3d', -12, -3, 24, 3); r('#e8dcc0', -11, -3, 22, 2); r('#c8b896', -10, -2, 3, 1); r('#c8b896', -4, -2, 3, 1); r('#c8b896', 2, -2, 3, 1);
      r('#2b1d3d', -9, -8, 7, 5); r('#8a92b4', -8, -7, 5, 4); r('#c4cae0', -8, -7, 2, 1);
      r('#2b1d3d', 4, -6, 6, 3); r('#6a7294', 5, -5, 4, 2); r('#5fd38a', 0, -5, 1, 2); r('#5fd38a', -1, -6, 1, 1); r('#5fd38a', 1, -6, 1, 1); break;
    case 'fishbowl':
      r('#2b1d3d', -7, -13, 14, 13); r('#cfeeff', -6, -12, 12, 11); r('#7ec8f0', -6, -8, 12, 7); r('#ffffff', -5, -11, 2, 2);
      r('#ffb020', -2, -6, 4, 2); r('#ff7a3a', 2, -6, 1, 2); r('#ffffff', -1, -6, 1, 1); r('#5fd38a', 3, -3, 1, 2); r('#8a6834', -6, -2, 12, 1); break;
    case 'paperlamp':
      r('#5a3820', -1, -22, 2, 22); r('#5a3820', -1, -22, 8, 2); r('#5a3820', 5, -20, 1, 2);
      r('#2b1d3d', 2, -18, 7, 10); r('#e8465a', 3, -17, 5, 8); r('#ff9aa0', 4, -16, 2, 6); r('#ffd45c', 3, -18, 5, 1); r('#ffd45c', 3, -9, 5, 1); break;
    case 'torii':
      r('#2b1d3d', -12, -22, 24, 3); r('#c8322a', -11, -21, 22, 1); r('#c8322a', -10, -18, 20, 2); r('#c8322a', -9, -14, 18, 1);
      r('#c8322a', -8, -16, 3, 16); r('#c8322a', 5, -16, 3, 16); r('#2b1d3d', -8, -2, 3, 2); r('#2b1d3d', 5, -2, 3, 2); break;
    case 'koi':
      r('#2b1d3d', -14, -7, 28, 7); r('#8a92b4', -13, -6, 26, 1); r('#c4cae0', -12, -6, 6, 1); r('#6a7294', -13, -1, 26, 1);
      r('#2a7ab0', -12, -5, 24, 4); r('#4ab4dc', -12, -5, 24, 2); r('#8fd8f0', -9, -5, 4, 1);
      r('#ff7a3a', -7, -3, 4, 2); r('#ffffff', -4, -3, 1, 1); r('#ffffff', -7, -3, 1, 1);
      r('#ffd45c', 3, -4, 4, 2); r('#ff7a3a', 6, -4, 1, 1); r('#5fd38a', 8, -3, 3, 1); r('#5fd38a', 9, -4, 1, 1); break;
    case 'flag': r('#5b4636', 0, -22, 1, 22); r('#ff7aa8', 1, -22, 9, 3); r('#ff7aa8', 1, -19, 6, 2); r('#ff7aa8', 1, -17, 3, 1); r('#ffd45c', -1, -24, 3, 2); break;
  }
}

