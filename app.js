(() => {
// Formspree form id (the part after formspree.io/f/). While it is empty the waitlist runs in test mode:
// sign-ups are only kept in this browser and the form says so.
const FORMSPREE_ID = 'xzeepnkr';

const $ = id => document.getElementById(id);

/* ---------- language ---------- */
// Spanish first. ?lang=en (or the toggle, which is remembered) switches to English; the page reloads to apply it.
const LANG_KEY = 'mepo-landing-lang';
const LANG = (() => {
  const q = new URLSearchParams(location.search).get('lang');
  if (q === 'es' || q === 'en') return q;
  try { const saved = localStorage.getItem(LANG_KEY); if (saved === 'es' || saved === 'en') return saved; } catch (e) {}
  return 'es';
})();
const tr = (es, en) => LANG === 'en' ? en : es;

if (LANG === 'en') {
  document.documentElement.lang = 'en';
  document.title = 'Mepo · breathe, play and get things done';
  document.querySelector('meta[name="description"]').content = 'Mepo is a pixel pet for Mac and Windows that keeps you company while you work: it meditates with you, cheers you on with your to-dos, plays, evolves and visits your team. Free.';
  document.querySelectorAll('[data-en]').forEach(el => { el.innerHTML = el.dataset.en; });
  document.querySelectorAll('[data-en-ph]').forEach(el => { el.placeholder = el.dataset.enPh; });
  document.querySelectorAll('[data-en-label]').forEach(el => { el.setAttribute('aria-label', el.dataset.enLabel); });
  $('lang').textContent = 'ES';
}
$('lang').addEventListener('click', () => {
  try { localStorage.setItem(LANG_KEY, LANG === 'en' ? 'es' : 'en'); } catch (e) {}
  const u = new URL(location.href); u.searchParams.delete('lang'); location.replace(u.href);
});

/* ---------- animation loop ---------- */
// Every pixel canvas registers a tick; offscreen ones pause. Logic runs at a fixed 60 steps per second.
const anims = [];
const seen = new IntersectionObserver(es => es.forEach(e => { e.target._on = e.isIntersecting; }));
function animate(canvas, tick) {
  const c = canvas.getContext('2d'); c.imageSmoothingEnabled = false;
  canvas._on = true; seen.observe(canvas);
  anims.push({ canvas, c, tick });
}
let last = performance.now(), acc = 0;
function loop(t) {
  acc = Math.min(acc + (t - last), 250); last = t;
  const steps = Math.floor(acc / (1000 / 60)); acc -= steps * (1000 / 60);
  for (const a of anims) if (a.canvas._on) a.tick(a.c, steps, t);
  requestAnimationFrame(loop);
}

const BABY = { char: null, stage: 0 };
function stageOn(canvas, look, x) { const s = makeStage(look); s.x = x ?? canvas.width / 2; return s; }
// A pet that only cycles one mood; `extra` draws props behind or around it.
function mini(canvas, look, stateAt, o = {}) {
  const s = stageOn(canvas, look), ground = o.ground ?? canvas.height - 4;
  animate(canvas, (c, steps, t) => {
    const st = stateAt(s, t);
    for (let i = 0; i < steps; i++) stepStage(s, st, ground);
    c.clearRect(0, 0, canvas.width, canvas.height);
    if (o.behind) o.behind(c, s, ground);
    drawStage(c, s, ground, st);
    if (o.front) o.front(c, s, ground);
  });
  return s;
}

/* ---------- downloads ---------- */
// The download for this computer goes first and stays gold; the other one steps back. On phones both stay equal.
// The Mac version comes from the installer's latest.json; the Windows one is written by hand in index.html
// (GitHub doesn't let other sites read its latest.yml).
{
  const isWin = /Windows/.test(navigator.userAgent), isMac = /Mac/.test(navigator.platform || navigator.userAgent) && !('ontouchend' in document);
  if (isWin || isMac) {
    const mine = $(isWin ? 'dl-win' : 'dl-mac'), other = $(isWin ? 'dl-mac' : 'dl-win');
    mine.parentNode.prepend(mine); other.querySelector('.btn').classList.add('alt');
  }
  fetch('https://wnhtyhhyigvgjqnblvve.supabase.co/storage/v1/object/public/mepo/latest.json', { cache: 'no-store' }).then(r => r.json()).then(j => {
    if (j && /^[\d.]+$/.test(j.version)) $('ver-mac').textContent = tr(`VERSIÓN ${j.version} · MACOS 13 O MÁS NUEVO`, `VERSION ${j.version} · MACOS 13 OR NEWER`);
  }).catch(() => {});
}

/* ---------- logo ---------- */
{ const c = $('logo').getContext('2d'); drawPet(c, 18, 34, 'happy', 20, BABY); }

/* ---------- hero ---------- */
// The sky behind the little desktop: the island's spring bands with drifting clouds.
const SKY = ['#2a82a4', '#2e92ae', '#33a2b6', '#38b2be', '#3fc0c4', '#48cac8'];
const skyClouds = [{ x: 14, y: 46, s: 1 }, { x: 120, y: 34, s: 1.2 }, { x: 70, y: 128, s: 0.8 }, { x: 168, y: 112, s: 0.9 }];
animate($('sky'), (c, steps) => {
  const w = 200, h = 160;
  SKY.forEach((col, i) => { c.fillStyle = col; c.fillRect(0, Math.floor(i * h / SKY.length), w, Math.ceil(h / SKY.length)); });
  c.fillStyle = 'rgba(255,255,255,.12)';
  for (let y = 6; y < h; y += 3) for (let x = (y % 2) * 2; x < w; x += 4) if ((x * 7 + y * 13) % 11 === 0) c.fillRect(x, y, 1, 1);
  for (const cl of skyClouds) { cl.x += 0.02 * cl.s * steps; if (cl.x > 215) cl.x = -40; puff(c, Math.round(cl.x), cl.y, cl.s, '#f6fbf6', '#cdeeee'); }
});

// The story it loops: a heads-up, the deadline passes and Mepo cries, the task gets checked off and it eats,
// then it invites you to a breather before the meeting.
const LOOP = 17;
const PHASES = [
  { at: 0, st: 'normal', clock: '10:24', a: ['', '11:00'], b: ['', '12:30'], say: tr('Hola, soy Mepo. Hoy vamos juntos.', 'Hi, I’m Mepo. We’ve got today together.') },
  { at: 3, st: 'worried', clock: '10:55', a: ['warn', tr('en 5 min', 'in 5 min')], b: ['', '12:30'], say: tr('¡Ojo! La factura vence en 5 min.', 'Heads up! The invoice is due in 5 min.') },
  { at: 5.5, st: 'cry', clock: '12:02', a: ['late', tr('hace 1 h', '1 h ago')], b: ['', '12:30'], badge: 1, say: tr('Snif… la factura venció hace una hora.', 'Sniff… the invoice went overdue an hour ago.') },
  { at: 9.5, st: 'feed', clock: '12:05', done: true, a: ['ok', tr('hecha', 'done')], b: ['', '12:30'], say: tr('¡Una fresa! Gracias por terminarla.', 'A strawberry! Thanks for finishing it.') },
  { at: 13.5, st: 'meditate', clock: '12:10', done: true, a: ['ok', tr('hecha', 'done')], b: ['', '12:30'], say: tr('¿Un respiro antes de la junta? Inhala… exhala…', 'A breather before the meeting? Breathe in… breathe out…') }];
const hero = stageOn($('hero-pet'), BABY), HG = 45;
let phase = -1, biteAt = 0;
function setWhen(id, [cls, text]) { const el = $(id); el.className = 'when' + (cls ? ' ' + cls : ''); el.textContent = text; }
function enterPhase(p) {
  $('row-a').classList.toggle('done', !!p.done);
  setWhen('when-a', p.a); setWhen('when-b', p.b);
  $('clock').textContent = p.clock;
  const say = $('say'); say.textContent = p.say; say.classList.remove('pop'); void say.offsetWidth; say.classList.add('pop');
  if (p.st === 'feed') { biteAt = Infinity; dropBerry(hero, -8, () => { biteAt = performance.now(); }); }
  if (p.st === 'normal') hero.parts = [];
}
const heroState = (p, t) => p.st !== 'feed' ? p.st : t < biteAt ? 'normal' : t < biteAt + 1400 ? 'eat' : 'love';
let heroT0 = performance.now();
animate($('hero-pet'), (c, steps, t) => {
  const sec = ((t - heroT0) / 1000) % LOOP;
  let i = PHASES.length - 1; while (PHASES[i].at > sec) i--;
  if (i !== phase) { phase = i; enterPhase(PHASES[i]); }
  const p = PHASES[i], st = heroState(p, t);
  for (let k = 0; k < steps; k++) stepStage(hero, st, HG);
  c.clearRect(0, 0, 48, 48);
  drawStage(c, hero, HG, st);
  if (p.badge) drawBadge(c, hero.x + 7, stageTop(hero, HG) + 1, p.badge);
});

/* ---------- how it works ---------- */
// Small props drawn next to the pets in the cards.
const calendar = (c, x, y) => {
  c.fillStyle = '#2b1d3d'; c.fillRect(x - 1, y - 1, 11, 11);
  c.fillStyle = '#fbf8ff'; c.fillRect(x, y, 9, 9); c.fillStyle = '#ff5470'; c.fillRect(x, y, 9, 3);
  c.fillStyle = '#2b1d3d'; c.fillRect(x + 3, y + 4, 3, 1); c.fillRect(x + 5, y + 5, 1, 1); c.fillRect(x + 4, y + 6, 1, 1); c.fillRect(x + 3, y + 7, 3, 1);
};
const HOW = [
  { st: () => 'meditate', title: tr('Respira con Mepo', 'Breathe with Mepo'),
    text: tr('Cuando lo necesites, medita unos minutos en su isla: inhala, sostén y exhala con él, con el clima de la temporada y una melodía tranquila. Cada meditación te da perlas de calma.', 'Whenever you need it, meditate for a few minutes on its island: breathe in, hold and breathe out with it, with the season’s weather and a calm tune. Every meditation earns calm pearls.') },
  { st: () => 'worried', props: { front: c => calendar(c, 2, 8) }, title: tr('Te avisa con calma', 'Gives you a calm heads-up'),
    text: tr('Lee tu calendario, tus recordatorios, Notion, Gmail, Slack y más. Te avisa 10 minutos antes de cada junta y se duerme mientras estás en ella.', 'It reads your calendar, reminders, Notion, Gmail, Slack and more. It warns you 10 minutes before each meeting and naps while you’re in it.') },
  { st: () => 'cry', title: tr('Se pone triste si algo se vence', 'Gets sad when something’s overdue'),
    text: tr('Si algo lleva más de una hora vencido, le sale una nube de lluvia. No te regaña: solo te espera.', 'When something is over an hour overdue, a rain cloud appears. It doesn’t nag: it just waits for you.') },
  { feed: true, title: tr('Come cuando terminas', 'Eats when you finish'),
    text: tr('Cada pendiente que terminas es una fresa: Mepo come, gana cubos y crece hasta evolucionar.', 'Every task you finish is a strawberry: Mepo eats, earns cubes and grows until it evolves.') },
  { st: () => 'happy', props: { front: (c, s) => { drawCube(c, 6, 9, performance.now()); drawCube(c, 34, 14, performance.now() + 900); } }, title: tr('Juega en su isla', 'Plays on its island'),
    text: tr('Atrapa cubos dorados, corre y brinca con Mepo, riega su árbol o sal a pescar. Ratitos cortos para despejarte, que te dan cubos para premios.', 'Catch golden cubes, run and jump with Mepo, water its tree or go fishing. Short breaks to clear your head that earn cubes for prizes.') },
  { st: () => 'love', x: 13, props: { front: (c, s, g) => drawPet(c, 30, g, 'happy', s.f, { char: 'coach', stage: 1 }, { fx: -1, lift: Math.floor(s.f / 32) % 2 }) }, title: tr('Tu equipo te visita', 'Your team visits'),
    text: tr('Invita a quien quieras: sus mascotas se visitan, se echan porras y juntan estrellas para la meta de la semana. Solo se comparte la mascota, nunca tus pendientes.', 'Invite anyone you like: your pets visit each other, cheer each other on and collect stars for the week’s goal. Only the pet is shared, never your to-dos.') }];
const how = $('how');
for (const h of HOW) {
  const card = document.createElement('article'); card.className = 'card px';
  const cv = document.createElement('canvas'); cv.width = 40; cv.height = 34;
  card.append(cv);
  card.insertAdjacentHTML('beforeend', `<h3>${h.title}</h3><p>${h.text}</p>`);
  how.append(card);
  if (h.feed) {
    // Drops a strawberry every 4 s; Mepo eats it and is happy for a moment.
    let next = 0, bite = -1e9;
    mini(cv, BABY, (s, t) => {
      if (!s.berry && t > next) { next = t + 4000; dropBerry(s, -6, () => { bite = performance.now(); }); }
      return t < bite + 1200 ? 'eat' : t < bite + 2600 ? 'love' : 'normal';
    }, { ground: 31 });
  } else { const s = mini(cv, BABY, h.st, Object.assign({ ground: 31 }, h.props)); if (h.x) s.x = h.x; }
}

/* ---------- evolutions ---------- */
const CHARS = {
  plumi: { name: 'Plumi', kind: tr('Ave', 'Bird'), stages: tr(['Pollito', 'Ganso', 'Cisne real'], ['Chick', 'Goose', 'Royal swan']),
    perk: tr('Madrugador. Las tareas que terminas antes de las 12:00 le dan crecimiento extra.', 'Early bird. Tasks you finish before noon give it extra growth.') },
  oso: { name: tr('Oso', 'Bear'), kind: tr('Oso', 'Bear'), stages: tr(['Osezno', 'Osito', 'Oso Estelar'], ['Cub', 'Teddy', 'Star Bear']),
    perk: tr('Tranquilo y constante. Su panza baja más lento, ideal para hábitos diarios.', 'Calm and steady. Its tummy empties slower, great for daily habits.') },
  zorro: { name: tr('Zorro', 'Fox'), kind: tr('Zorro', 'Fox'), stages: tr(['Cachorro', 'Zorro', 'Kitsune'], ['Kit', 'Fox', 'Kitsune']),
    perk: tr('Astuto. Encuentra cubos dorados en la isla el doble de seguido.', 'Clever. Finds golden cubes on the island twice as often.') }
};
const evos = $('evos');
for (const key of ['plumi', 'oso', 'zorro']) {
  const ch = CHARS[key], el = document.createElement('article'); el.className = 'evo px';
  el.innerHTML = `<span class="kind">${ch.kind.toUpperCase()}</span><h3>${ch.name}</h3><div class="line"></div><p>${ch.perk}</p>`;
  const line = el.querySelector('.line');
  ch.stages.forEach((name, i) => {
    if (i) line.insertAdjacentHTML('beforeend', '<span class="arrow" aria-hidden="true">›</span>');
    const fig = document.createElement('figure'), cv = document.createElement('canvas'); cv.width = 28; cv.height = 28;
    fig.append(cv); fig.insertAdjacentHTML('beforeend', `<figcaption>${name}<small>${tr('NIVEL', 'LEVEL')} ${[3, 5, 7][i]}</small></figcaption>`);
    line.append(fig);
    const s = mini(cv, { char: key, stage: i + 1 }, () => 'happy', { ground: 27 });
    s.f = i * 11;
  });
  evos.append(el);
}
// The secret characters: only their silhouettes, no names, until you unlock them in the app.
const SECRETS = [
  ['rana', tr('Hay un camino escondido. Se desbloquea terminando 15 tareas a tiempo.', 'There’s a hidden path. It unlocks when you finish 15 tasks on time.')],
  ['panda', tr('Otro se esconde en la calma: se desbloquea con 60 perlas de calma.', 'Another hides in calm: it unlocks with 60 calm pearls.')]];
for (const [char, text] of SECRETS) {
  const el = document.createElement('article'); el.className = 'evo secret px';
  el.innerHTML = `<div><span class="kind">${tr('PERSONAJE SECRETO', 'SECRET CHARACTER')}</span><h3>???</h3><p>${text}</p></div><div class="line"></div>`;
  const line = el.querySelector('.line');
  [1, 2, 3].forEach(stage => {
    if (stage > 1) line.insertAdjacentHTML('beforeend', '<span class="arrow" aria-hidden="true">›</span>');
    const fig = document.createElement('figure'), cv = document.createElement('canvas'); cv.width = 28; cv.height = 28;
    cv.setAttribute('role', 'img'); cv.setAttribute('aria-label', tr('Silueta de un personaje secreto', 'Silhouette of a secret character'));
    fig.append(cv); fig.insertAdjacentHTML('beforeend', `<figcaption>?<small>${tr('NIVEL', 'LEVEL')} ${[3, 5, 7][stage - 1]}</small></figcaption>`);
    line.append(fig);
    animate(cv, (c, steps, t) => { c.clearRect(0, 0, 28, 28); drawPet(c, 14, 27, 'normal', Math.floor(t / 16) + stage * 11, { char, stage }, { flash: '#4a3d85', lift: Math.floor(t / 530) % 2 }); });
  });
  evos.append(el);
}

/* ---------- prizes ---------- */
const HAT_LIST = [
  ['party', tr('Gorrito de fiesta', 'Party hat'), tr('Tu primera tarea', 'Your first task')],
  ['flower', tr('Florecita', 'Little flower'), tr('3 tareas a tiempo', '3 tasks on time')],
  ['cap', tr('Gorra azul', 'Blue cap'), tr('Juega 3 veces en la isla', 'Play 3 times on the island')],
  ['bow', tr('Moño', 'Bow'), tr('Evoluciona por primera vez', 'Evolve for the first time')],
  ['beanie', tr('Gorro de invierno', 'Winter beanie'), tr('5 días de racha', '5-day streak')],
  ['crown', tr('Corona', 'Crown'), tr('10 tareas a tiempo', '10 tasks on time')],
  ['wizard', tr('Sombrero de mago', 'Wizard hat'), tr('25 tareas completadas', '25 tasks done')],
  ['lotus', tr('Flor de loto', 'Lotus flower'), tr('Medita 3 veces', 'Meditate 3 times')],
  ['goldstar', tr('Estrella dorada', 'Gold star'), tr('Recibe una estrella de tu equipo', 'Get a star from your team')],
  ['leafcrown', tr('Corona de hojas', 'Leaf crown'), tr('Riega el árbol 7 días distintos', 'Water the tree on 7 different days')]];
const DECOR_LIST = [
  ['sign', tr('Letrero con su nombre', 'Sign with its name'), tr('Ponle nombre', 'Give it a name')],
  ['mailbox', tr('Buzón', 'Mailbox'), tr('Recibe 3 visitas', 'Get 3 visits')],
  ['bench', tr('Banca', 'Bench'), tr('10 tareas completadas', '10 tasks done')],
  ['trophy', tr('Trofeo', 'Trophy'), tr('Un día perfecto, sin vencidas', 'A perfect day, nothing overdue')],
  ['mushrooms', tr('Hongos', 'Mushrooms'), tr('15 cubos', '15 cubes')],
  ['flag', tr('Banderín', 'Pennant'), tr('25 cubos', '25 cubes')],
  ['bonsai', tr('Bonsái', 'Bonsai'), tr('Medita en la isla 5 días distintos', 'Meditate on the island on 5 different days')],
  ['teamflag', tr('Bandera del equipo', 'Team flag'), tr('Abran su primer cofre del equipo', 'Open your first team chest')],
  ['fishbowl', tr('Pecera', 'Fishbowl'), tr('Pesca 3 peces dorados', 'Catch 3 golden fish')]];
// Elite prizes cost calm pearls, which only meditating gives. [id, kind, name, pearls]
const ELITE_LIST = [
  ['halo', 'hat', tr('Halo dorado', 'Golden halo'), 4], ['paperlamp', 'decor', tr('Farol de papel', 'Paper lantern'), 4],
  ['origami', 'hat', tr('Grulla de papel', 'Paper crane'), 6], ['torii', 'decor', tr('Arco torii', 'Torii gate'), 8],
  ['koi', 'decor', tr('Estanque koi', 'Koi pond'), 12]];
function shelf(id, list, paint) {
  const box = $(id);
  for (const [key, name, how] of list) {
    const el = document.createElement('div'); el.className = 'prize px';
    const cv = document.createElement('canvas'); cv.width = 28; cv.height = 28;
    el.append(cv); el.insertAdjacentHTML('beforeend', `<b>${name}</b><span>${how}</span>`);
    box.append(el);
    paint(cv, key);
  }
}
const paintHat = (cv, hat) => { cv.width = cv.height = 22; const s = mini(cv, Object.assign({ hat }, BABY), () => 'happy', { ground: 21 }); s.f = hat.length * 9; };
const paintDecor = (cv, id) => {
  cv.width = cv.height = 30; const c = cv.getContext('2d');
  c.fillStyle = '#52c95c'; c.fillRect(0, 26, 30, 2); c.fillStyle = '#2f9a6a'; c.fillRect(0, 28, 30, 2);
  drawPrize(c, id, 15, 26);
};
shelf('hats', HAT_LIST, paintHat);
shelf('decor', DECOR_LIST, paintDecor);
shelf('elite', ELITE_LIST.map(([id, kind, name, n]) => [id, name, tr(`${n} perlas de calma`, `${n} calm pearls`), kind]),
  (cv, id) => (ELITE_LIST.find(e => e[0] === id)[1] === 'hat' ? paintHat : paintDecor)(cv, id));
document.querySelectorAll('#elite .prize').forEach(el => el.classList.add('elite'));
mini($('coach'), { char: 'coach', stage: 1 }, () => 'happy', { ground: 22 });

/* ---------- platforms and FAQ ---------- */
const NOW = [
  [tr('Calendario y Recordatorios de Apple', 'Apple Calendar and Reminders'), tr('en Mac; palomeas en Mepo y se completa allá', 'on Mac; check off in Mepo, done there too')],
  ['Notion', tr('tus tareas, en ambos sentidos', 'your tasks, both ways')],
  ['Gmail', tr('correos por contestar', 'emails to answer')],
  ['Slack', tr('menciones', 'mentions')],
  ['Telegram', tr('escríbele tareas a Mepo y recibe avisos en tu celular (con Mepo en Mac o Windows)', 'write tasks to Mepo and get reminders on your phone (with Mepo on Mac or Windows)')],
  ['ClickUp · Todoist · HubSpot', tr('tus tareas, con una clave', 'your tasks, with a key')]];
const SOON = [
  ['Google Calendar', tr('sin pasar por tu Mac', 'without your Mac')],
  ['Outlook', tr('calendario y correo', 'calendar and email')]];
const chips = (id, list) => { $(id).innerHTML = list.map(([n, w]) => `<li><b>${n}</b><span>${w}</span></li>`).join(''); };
chips('plats-now', NOW); chips('plats-soon', SOON);

const FAQ = [
  [tr('¿Dónde lo puedo usar?', 'Where can I use it?'),
    tr('Ya puedes bajarlo gratis para Mac (macOS 13 o más nuevo) y Windows (10 u 11). En iPhone y iPad llega muy pronto a la App Store; déjanos tu correo y te avisamos.', 'You can download it free for Mac (macOS 13 or newer) and Windows (10 or 11) today. iPhone and iPad are coming very soon to the App Store; leave your email and we’ll let you know.')],
  [tr('¿Es un juego o una app de pendientes?', 'Is it a game or a to-do app?'),
    tr('Las dos cosas. Tus pendientes mandan y el juego te premia: Mepo te echa porras para avanzar, celebra cuando terminas y te invita a respirar o a jugar un ratito cuando lo necesitas. Cuidarlo toma menos de un minuto al día.', 'Both. Your to-dos lead and the game rewards you: Mepo cheers you on, celebrates when you finish and invites you to breathe or play for a bit when you need it. Looking after it takes less than a minute a day.')],
  [tr('¿Cómo es eso de meditar con Mepo?', 'What’s meditating with Mepo like?'),
    tr('Eliges 3, 5 o 10 minutos y Mepo flota en medio de su isla mientras respiras con él: inhala 4 segundos, sostén 2 y exhala 6, con el clima de la temporada y una melodía tranquila. Al terminar gana ánimo y perlas de calma (el doble si meditas en la isla a pantalla completa), que solo se ganan así y sirven para los premios élite.', 'Pick 3, 5 or 10 minutes and Mepo floats in the middle of its island while you breathe with it: in for 4 seconds, hold for 2, out for 6, with the season’s weather and a calm tune. When you finish it earns mood and calm pearls (double if you meditate on the full-screen island), which you can only get this way and which unlock elite prizes.')],
  [tr('¿Cuánto cuesta?', 'How much does it cost?'),
    tr('Hoy es gratis. Más adelante habrá un Mepo Pro opcional, de unos 3 a 5 USD al mes, con más conexiones, personajes y gorritos.', 'It’s free today. Later there will be an optional Mepo Pro, about 3–5 USD a month, with more connections, characters and hats.')],
  [tr('¿Me va a regañar o llenar de notificaciones?', 'Will it nag me or flood me with notifications?'),
    tr('No. Mepo no manda alarmas insistentes: reacciona. Se pone triste si algo se vence y feliz cuando lo terminas. Solo muestra un aviso a la vez y no interrumpe en juntas, en No molestar ni mientras meditas.', 'No. Mepo doesn’t fire nagging alarms: it reacts. It gets sad when something is overdue and happy when you finish it. It shows one notice at a time and never interrupts meetings, Do not disturb or meditation.')],
  [tr('¿Me sirve si tengo TDAH?', 'Does it help if I have ADHD?'),
    tr('Mepo no es una herramienta médica, pero lo pensamos para quien tiene TDAH: tus pendientes quedan a la vista, en un compañero que da gusto cuidar, en vez de en una lista olvidada en otra pestaña.', 'Mepo isn’t a medical tool, but we designed it with ADHD in mind: your to-dos stay in sight, on a buddy you enjoy looking after, instead of in a list forgotten in another tab.')],
  [tr('¿Cómo funcionan los equipos?', 'How do teams work?'),
    tr('Crea un equipo en Mepo y manda la invitación por WhatsApp o donde quieras. Sus mascotas se visitan, se echan porras y juntan estrellas para una meta semanal. Solo se comparte la mascota, su ánimo y cuántas tareas terminaste; nunca cuáles.', 'Create a team in Mepo and send the invite by WhatsApp or wherever you like. Your pets visit each other, cheer each other on and collect stars for a weekly goal. Only the pet, its mood and how many tasks you finished are shared; never which ones.')],
  [tr('¿Qué pasa con mis datos?', 'What about my data?'),
    tr('Tus tareas, correos, juntas y claves se quedan en tu aparato; Mepo no los sube a servidores propios (salvo lo que le escribas a Mepo por Telegram, si lo conectas). Más detalles en la <a href="/privacidad/">política de privacidad</a>.', 'Your tasks, emails, meetings and keys stay on your device; Mepo doesn’t upload them to servers of its own (except what you write to Mepo on Telegram, if you connect it). More in the <a href="/privacidad/">privacy policy</a>.')]];
$('faq-list').innerHTML = FAQ.map(([q, a]) => `<details class="px"><summary>${q}</summary><p>${a}</p></details>`).join('');

/* ---------- waitlist ---------- */
const CONNECT = [['mac_calendar', tr('Calendario de Mac', 'Mac Calendar')], ['mac_reminders', tr('Recordatorios de Mac', 'Mac Reminders')], ['notion', 'Notion'],
  ['clickup', 'ClickUp'], ['todoist', 'Todoist'], ['slack', 'Slack'], ['gmail', 'Gmail'], ['google_calendar', 'Google Calendar'], ['outlook', 'Outlook'], ['other', tr('Otra', 'Other')]];
$('pick').innerHTML = CONNECT.map(([v, n]) => `<label><input type="radio" name="connect_first" value="${v}"><span>${n}</span></label>`).join('');
$('pick').addEventListener('change', e => { const other = e.target.value === 'other'; $('other').hidden = !other; if (other) $('other').focus(); });

const TEST_KEY = 'mepo-waitlist-test';
// Sends one sign-up. Returns 'ok', 'test' (no Formspree id yet, kept in this browser) or an error message.
async function signUp(form, source) {
  const fd = new FormData(form);
  if (fd.get('_gotcha')) return 'ok';
  fd.set('email', String(fd.get('email') || '').trim());
  fd.set('source', source); fd.set('lang', LANG); fd.set('page', location.href.split('#')[0]);
  fd.set('_subject', 'Mepo · nuevo registro (aviso de iPhone y iPad)');
  if (!FORMSPREE_ID) {
    try { const all = JSON.parse(localStorage.getItem(TEST_KEY) || '[]'); all.push(Object.fromEntries(fd)); localStorage.setItem(TEST_KEY, JSON.stringify(all)); } catch (e) {}
    console.info('[Mepo] Waitlist in test mode (no FORMSPREE_ID):', Object.fromEntries(fd));
    return 'test';
  }
  try {
    const res = await fetch('https://formspree.io/f/' + FORMSPREE_ID, { method: 'POST', body: fd, headers: { Accept: 'application/json' } });
    if (res.ok) return 'ok';
    const data = await res.json().catch(() => ({}));
    return (data.errors && data.errors.map(e => e.message).join(' ')) || tr('No se pudo enviar. Intenta de nuevo.', 'Couldn’t send it. Please try again.');
  } catch (e) { return tr('Sin conexión. Intenta de nuevo en un momento.', 'You’re offline. Try again in a moment.'); }
}
const validEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
const TEST_NOTE = () => `<br><span class="test">${tr('Modo de prueba: el formulario aún no está conectado a Formspree.', 'Test mode: the form isn’t connected to Formspree yet.')}</span>`;
function wire(form, msg, source, onDone) {
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const email = form.elements.email, btn = form.querySelector('button[type="submit"]');
    if (!validEmail(email.value)) {
      msg.className = 'msg err'; msg.textContent = tr('Escribe un correo válido, por ejemplo ana@correo.com.', 'Enter a valid email, like ana@email.com.');
      email.focus(); return;
    }
    btn.disabled = true; msg.className = 'msg'; msg.textContent = tr('Enviando…', 'Sending…');
    const r = await signUp(form, source);
    btn.disabled = false;
    if (r === 'ok' || r === 'test') { onDone(r); return; }
    msg.className = 'msg err'; msg.textContent = r;
  });
}
wire($('hero-form'), $('hero-msg'), 'hero', r => {
  $('hero-form').reset();
  $('hero-msg').className = 'msg ok';
  $('hero-msg').innerHTML = tr('¡Listo! Te avisamos cuando llegue a iPhone y iPad.', 'Done! We’ll let you know when it arrives on iPhone and iPad.') + (r === 'test' ? TEST_NOTE() : '');
});
let joined = false;
wire($('join-form'), $('join-msg'), 'waitlist', r => {
  joined = true; $('join-body').hidden = true; $('thanks').hidden = false;
  if (r === 'test') $('thanks').insertAdjacentHTML('beforeend', `<p>${TEST_NOTE().slice(4)}</p>`);
  dropBerry(joinPet, -8, () => { joinBite = performance.now(); });
});
$('share').addEventListener('click', async () => {
  const data = { title: 'Mepo', text: tr('Una mascota pixelada que no te deja olvidar tus pendientes, sin regañarte.', 'A pixel pet that won’t let you forget your to-dos, without nagging.'), url: 'https://getmepo.com' };
  try { if (navigator.share) { await navigator.share(data); return; } } catch (e) { return; }
  try { await navigator.clipboard.writeText(data.url); $('share').textContent = tr('¡Link copiado!', 'Link copied!'); } catch (e) {}
});

// The pet beside the form waits, then eats a strawberry and stays happy once you join.
let joinBite = -1e9;
const joinPet = mini($('join-pet'), BABY, (s, t) => !joined ? 'normal' : t < joinBite + 1400 ? 'eat' : s.berry ? 'normal' : 'love', { ground: 33 });

requestAnimationFrame(loop);
})();
