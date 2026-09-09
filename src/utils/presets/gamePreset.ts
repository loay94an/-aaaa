import { CompletePreset } from './types';

export const GAME_PRESET: CompletePreset = {
  id: 'space-arcade-game',
  name: '🎮 لعبة فضاء ثنائية الأبعاد (Canvas 2D)',
  category: 'Gaming & Interactive Canvas',
  icon: 'Gamepad2',
  badge: 'محرك ألعاب كامل 60FPS',
  description: 'لعبة فضاء كلاسيكية كاملة مبنية بمحرك جافاسكريبت وHTML5 Canvas مع مؤثرات بصرية وجزيئات واصطدام ونقاط فورية',
  treeText: `space-invaders-game/
├── css/
│   └── game.css
├── js/
│   ├── engine.js
│   └── game.js
├── index.html
├── assets.json
└── README.md`,
  files: [
    {
      path: 'index.html',
      content: `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cosmic Defender — لعبة الفضاء والأركيد</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/cairo@5.0.0/400.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/cairo@5.0.0/700.css">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="css/game.css">
</head>
<body class="bg-[#0b1120] text-[#f8fafc] font-['Cairo'] min-h-screen p-4 flex flex-col items-center justify-center select-none">
  <div class="max-w-2xl w-full space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between p-3.5 bg-[#0f172a] rounded-2xl border border-[#1e293b]">
      <div class="flex items-center gap-2.5">
        <span class="text-2xl">🚀</span>
        <div>
          <h1 class="font-bold text-sm text-white">Cosmic Defender 2D</h1>
          <p class="text-[10px] text-slate-400">تحكم بالأسهم أو اللمس لإطلاق النار</p>
        </div>
      </div>
      <div class="flex items-center gap-4 text-xs font-mono">
        <div>النقاط: <span id="score-val" class="font-bold text-amber-400 text-sm">0</span></div>
        <div>الأرواح: <span id="lives-val" class="text-rose-400 text-sm">❤️❤️❤️</span></div>
      </div>
    </div>

    <!-- Game Canvas Container -->
    <div class="relative bg-black rounded-2xl border-2 border-indigo-500/40 overflow-hidden shadow-2xl flex justify-center">
      <canvas id="game-canvas" width="600" height="400" class="w-full h-auto block"></canvas>
      
      <!-- Start / Game Over Overlay -->
      <div id="game-overlay" class="absolute inset-0 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center space-y-4">
        <h2 id="overlay-title" class="text-2xl font-bold text-white">مرحباً بك في Cosmic Defender!</h2>
        <p id="overlay-desc" class="text-xs text-slate-300 max-w-sm">دمّر سفن الأعداء قبل أن تصل إلى أسفل الشاشة وتفادى نيرانهم.</p>
        <button id="start-btn" class="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-rose-500 hover:brightness-110 active:scale-95 text-black font-black text-xs rounded-xl shadow-lg transition">
          ابدأ اللعب الآن 🚀
        </button>
      </div>
    </div>

    <!-- On-screen Mobile Controls -->
    <div class="flex justify-between items-center gap-2 p-2 bg-[#0f172a] rounded-xl border border-[#1e293b] sm:hidden">
      <div class="flex gap-2">
        <button id="btn-left" class="w-12 h-12 bg-[#1e293b] rounded-lg text-white font-bold text-lg active:bg-slate-700">◀</button>
        <button id="btn-right" class="w-12 h-12 bg-[#1e293b] rounded-lg text-white font-bold text-lg active:bg-slate-700">▶</button>
      </div>
      <button id="btn-fire" class="px-6 h-12 bg-rose-600 rounded-lg text-white font-bold text-xs active:bg-rose-500">🔥 إطلاق</button>
    </div>
  </div>

  <script src="js/engine.js"></script>
  <script src="js/game.js"></script>
</body>
</html>`
    },
    {
      path: 'css/game.css',
      content: `/* Retro Canvas Canvas Styling */
canvas {
  image-rendering: pixelated;
}`
    },
    {
      path: 'js/engine.js',
      content: `// Canvas 2D Game Engine Mini
window.GameEngine = class {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.width = this.canvas.width;
    this.height = this.canvas.height;
  }

  clear() {
    this.ctx.fillStyle = '#050510';
    this.ctx.fillRect(0, 0, this.width, this.height);
  }
};`
    },
    {
      path: 'js/game.js',
      content: `// Space Game Loop & Mechanics
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  const overlay = document.getElementById('game-overlay');
  const startBtn = document.getElementById('start-btn');
  const scoreVal = document.getElementById('score-val');
  const livesVal = document.getElementById('lives-val');

  let running = false;
  let score = 0;
  let lives = 3;

  const player = { x: 280, y: 350, w: 40, h: 30, speed: 6 };
  let lasers = [];
  let enemies = [];
  let stars = [];

  for (let i = 0; i < 40; i++) {
    stars.push({ x: Math.random() * 600, y: Math.random() * 400, s: Math.random() * 2 + 1 });
  }

  const keys = {};
  window.addEventListener('keydown', e => {
    keys[e.code] = true;
    if (e.code === 'Space' && running) {
      fireLaser();
    }
  });
  window.addEventListener('keyup', e => keys[e.code] = false);

  function fireLaser() {
    lasers.push({ x: player.x + player.w / 2 - 2, y: player.y, w: 4, h: 10, speed: 8 });
  }

  function spawnEnemy() {
    if (!running) return;
    enemies.push({
      x: Math.random() * (canvas.width - 30),
      y: -20,
      w: 30,
      h: 24,
      speed: Math.random() * 1.5 + 1.2
    });
    setTimeout(spawnEnemy, Math.random() * 1200 + 800);
  }

  function update() {
    if (!running) return;

    // Player Move
    if (keys['ArrowLeft'] && player.x > 0) player.x -= player.speed;
    if (keys['ArrowRight'] && player.x < canvas.width - player.w) player.x += player.speed;

    // Lasers Move
    lasers.forEach(l => l.y -= l.speed);
    lasers = lasers.filter(l => l.y > -10);

    // Enemies Move & Collision
    enemies.forEach((en, eIdx) => {
      en.y += en.speed;

      // Check hit with lasers
      lasers.forEach((l, lIdx) => {
        if (l.x < en.x + en.w && l.x + l.w > en.x && l.y < en.y + en.h && l.y + l.h > en.y) {
          enemies.splice(eIdx, 1);
          lasers.splice(lIdx, 1);
          score += 100;
          scoreVal.textContent = score;
        }
      });

      // Bottom reached
      if (en.y > canvas.height) {
        enemies.splice(eIdx, 1);
        lives -= 1;
        updateLives();
      }
    });

    draw();
    requestAnimationFrame(update);
  }

  function updateLives() {
    livesVal.textContent = '❤️'.repeat(Math.max(0, lives));
    if (lives <= 0) {
      running = false;
      overlay.classList.remove('hidden');
      document.getElementById('overlay-title').textContent = 'انتهت اللعبة! (Game Over)';
      document.getElementById('overlay-desc').textContent = 'لقد حققت ' + score + ' نقطة في هذه الجولة!';
      startBtn.textContent = 'إعادة اللعب 🔄';
    }
  }

  function draw() {
    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Stars
    ctx.fillStyle = '#ffffff';
    stars.forEach(s => {
      ctx.fillRect(s.x, s.y, s.s, s.s);
      s.y += s.s * 0.4;
      if (s.y > canvas.height) s.y = 0;
    });

    // Player Ship
    ctx.fillStyle = '#00d2ff';
    ctx.beginPath();
    ctx.moveTo(player.x + player.w / 2, player.y);
    ctx.lineTo(player.x + player.w, player.y + player.h);
    ctx.lineTo(player.x, player.y + player.h);
    ctx.closePath();
    ctx.fill();

    // Lasers
    ctx.fillStyle = '#ff0055';
    lasers.forEach(l => ctx.fillRect(l.x, l.y, l.w, l.h));

    // Enemies
    ctx.fillStyle = '#ffaa00';
    enemies.forEach(en => {
      ctx.fillRect(en.x, en.y, en.w, en.h);
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(en.x + 5, en.y + 6, 6, 6);
      ctx.fillRect(en.x + en.w - 11, en.y + 6, 6, 6);
      ctx.fillStyle = '#ffaa00';
    });
  }

  startBtn.addEventListener('click', () => {
    overlay.classList.add('hidden');
    score = 0;
    lives = 3;
    scoreVal.textContent = '0';
    updateLives();
    lasers = [];
    enemies = [];
    player.x = 280;
    running = true;
    spawnEnemy();
    update();
  });

  // Mobile Controls
  document.getElementById('btn-left')?.addEventListener('touchstart', () => keys['ArrowLeft'] = true);
  document.getElementById('btn-left')?.addEventListener('touchend', () => keys['ArrowLeft'] = false);
  document.getElementById('btn-right')?.addEventListener('touchstart', () => keys['ArrowRight'] = true);
  document.getElementById('btn-right')?.addEventListener('touchend', () => keys['ArrowRight'] = false);
  document.getElementById('btn-fire')?.addEventListener('touchstart', () => fireLaser());
});`
    },
    {
      path: 'assets.json',
      content: `{
  "game": "Cosmic Defender 2D",
  "fps": 60,
  "engine": "HTML5 Canvas"
}`
    },
    {
      path: 'README.md',
      content: `# لعبة فضاء ثنائية الأبعاد (Space Invaders 2D)

لعبة أركيد كاملة تعتمد على Canvas 2D مع مؤثرات إطلاق واصطدام وتوافق مع الهواتف الذكية.`
    }
  ]
};
