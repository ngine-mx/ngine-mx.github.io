// Mepo on a little stage, shared by the landing hero and the demo clip: one pet, its moods and the effects
// around it (rain cloud, tears, falling strawberry, crumbs, hearts, Zs), drawn in pixels with sprites.js.
// Random numbers come from a seeded generator so the clip renders the same every time.
let SEED = 7;
const rnd = (a, b) => { SEED = (SEED * 1664525 + 1013904223) >>> 0; return a + (SEED / 4294967296) * (b - a); };

function makeStage(look) { return { look, parts: [], berry: null, f: 0, x: 0 }; }

// Top of the sprite (where the cloud sits) and the mouth's y, for a pet standing on `ground`.
function stageTop(s, ground) { const sp = spriteOf(s.look); return ground - sp.rows.length - hoverOf(sp, s.f) - (sp.crown || 0); }
function stageMouth(s, ground) { const sp = spriteOf(s.look); return stageTop(s, ground) + (sp.crown || 0) + sp.face[1] + 9; }

function stageEmit(s, type, x, y, n = 1) {
  for (let i = 0; i < n; i++) {
    const p = { type, x, y, vx: 0, vy: 0, life: 60 };
    if (type === 'heart') { p.vx = rnd(-0.35, 0.35); p.vy = rnd(-0.6, -0.35); p.life = 70; p.x += rnd(-6, 6); }
    else if (type === 'tear') { p.vx = rnd(0.4, 0.9) * (x < s.x ? -1 : 1); p.vy = rnd(-0.9, -0.4); p.life = 40; }
    else if (type === 'z') { p.vx = 0.15; p.vy = -0.22; p.life = 110; }
    else if (type === 'spark') { p.vx = rnd(-1.1, 1.1); p.vy = rnd(-1.3, -0.2); p.life = rnd(25, 45); }
    else if (type === 'crumb') { p.vx = rnd(-0.8, 0.8); p.vy = rnd(-1, -0.3); p.life = 30; }
    else if (type === 'rain') { p.vy = 1.4; p.life = 13; }
    s.parts.push(p);
  }
}

// A strawberry that falls from `fromY` into the pet's mouth; `onBite` runs when it gets there.
function dropBerry(s, fromY, onBite) { s.berry = { y: fromY, v: 0, onBite }; }

// Advances one frame (60 per second): particles, the falling strawberry, and what the mood emits.
function stepStage(s, st, ground) {
  s.f++;
  const f = s.f, sp = spriteOf(s.look), top = stageTop(s, ground);
  if (st === 'cry') {
    if (f % 7 === 0) stageEmit(s, 'tear', s.x + (f % 14 ? -4 : 4), top + (sp.crown || 0) + sp.face[1] + 9);
    if (f % 4 === 0) stageEmit(s, 'rain', s.x + rnd(-7, 7), top - 2);
  }
  if (st === 'love' && f % 14 === 0) stageEmit(s, 'heart', s.x, top - 2);
  if (st === 'sleep' && f % 70 === 0) stageEmit(s, 'z', s.x + 6, top - 4);
  if (s.berry) {
    s.berry.v = Math.min(s.berry.v + 0.12, 2.6); s.berry.y += s.berry.v;
    if (s.berry.y >= stageMouth(s, ground) - 4) {
      stageEmit(s, 'crumb', s.x, stageMouth(s, ground), 6);
      const bite = s.berry.onBite; s.berry = null; if (bite) bite();
    }
  }
  for (const p of s.parts) {
    p.x += p.vx; p.y += p.vy; p.life--;
    if (p.type === 'tear' || p.type === 'spark' || p.type === 'crumb') p.vy += 0.06;
    if (p.type === 'z') p.x += Math.sin(p.life * 0.1) * 0.2;
  }
  s.parts = s.parts.filter(p => p.life > 0);
}

function drawStage(c, s, ground, st, o = {}) {
  const f = s.f, top = stageTop(s, ground);
  if (st === 'cry') {
    const cx = Math.round(s.x), cy = top - 5 + Math.round(Math.sin(f * 0.07));
    c.fillStyle = '#8d93bd'; c.fillRect(cx - 4, cy - 3, 7, 1); c.fillRect(cx - 6, cy - 2, 12, 2); c.fillRect(cx - 8, cy, 16, 3);
    c.fillStyle = '#6c7199'; c.fillRect(cx - 8, cy + 2, 16, 1);
  }
  let cx = s.x, lift = 0;
  if (st === 'cry' && f % 120 < 30) cx += Math.floor(f / 3) % 2 ? 1 : -1;
  if (st === 'sleep') lift = Math.floor(f / 50) % 2;
  else if (['normal', 'happy', 'worried', 'love'].includes(st)) lift = Math.floor(f / 32) % 2;
  const blink = st === 'normal' && f % 200 < 8;
  drawPet(c, cx, ground, st, f, s.look, { lift, blink, fx: o.fx || 0 });
  if (s.berry) spr(c, BERRY, Math.round(s.x) - 2, Math.round(s.berry.y));
  for (const p of s.parts) {
    const x = Math.round(p.x), y = Math.round(p.y);
    switch (p.type) {
      case 'heart': spr(c, HEART, x - 2, y - 2, '#ff7aa8'); break;
      case 'z': spr(c, ZED, x, y, '#ece8ff'); break;
      case 'tear': c.fillStyle = '#6cc8ff'; c.fillRect(x, y, 1, 2); break;
      case 'rain': c.fillStyle = '#9fd8ff'; c.fillRect(x, y, 1, 2); break;
      case 'spark': c.fillStyle = p.life % 6 < 3 ? '#ffffff' : '#ffd45c'; c.fillRect(x, y, 1, 1); break;
      case 'crumb': c.fillStyle = '#ff5470'; c.fillRect(x, y, 1, 1); break;
    }
  }
}

// The red badge on Mepo's head that folds notifications (a 7x7 pixel dot with a number).
function drawBadge(c, x, y, n) {
  c.fillStyle = '#2b1d3d'; c.fillRect(x - 1, y, 9, 7); c.fillRect(x, y - 1, 7, 9);
  c.fillStyle = '#ff5470'; c.fillRect(x, y, 7, 7);
  c.fillStyle = '#ffffff';
  const d = { 1: ['.x.', 'xx.', '.x.', '.x.', 'xxx'], 2: ['xx.', '..x', '.x.', 'x..', 'xxx'], 3: ['xx.', '..x', '.x.', '..x', 'xx.'] }[Math.min(n, 3)];
  spr(c, d, x + 2, y + 1, '#ffffff');
}
