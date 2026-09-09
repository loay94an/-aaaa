import { CompletePreset } from './types';

export const PWA_PRESET: CompletePreset = {
  id: 'pwa-offline-app',
  name: '📱 تطبيق PWA وملاحظات أوفلاين',
  category: 'Progressive Web App',
  icon: 'Smartphone',
  badge: 'تطبيق ويب تقدمي كامل',
  description: 'تطبيق ويب تقدمي (PWA) حقيقي وقابل للتثبيت مع كاشينج أوفلاين، Service Worker نشط، ملف Manifest، وإدارة ملاحظات سريعة',
  treeText: `pwa-notes-app/
├── icons/
│   ├── icon.svg
│   └── icon-192x192.png
├── css/
│   └── style.css
├── js/
│   └── app.js
├── index.html
├── manifest.json
├── sw.js
└── README.md`,
  files: [
    {
      path: 'index.html',
      content: `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <meta name="theme-color" content="#4f46e5">
  <title>دفتر الملاحظات — PWA Offline Notes</title>
  <link rel="manifest" href="manifest.json">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/cairo@5.0.0/400.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/cairo@5.0.0/700.css">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="css/style.css">
</head>
<body class="bg-[#0b1120] text-[#f8fafc] font-['Cairo'] min-h-screen pb-16">
  <!-- PWA Header -->
  <header class="sticky top-0 z-30 bg-[#0f172a]/95 backdrop-blur border-b border-[#1e293b] px-4 sm:px-6 py-3.5 flex items-center justify-between">
    <div class="flex items-center gap-3">
      <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-pink-500 flex items-center justify-center text-lg text-white shadow-md">
        📝
      </div>
      <div>
        <h1 class="font-bold text-sm sm:text-base text-white">مفكرة PWA الذكية</h1>
        <div class="flex items-center gap-2">
          <span id="network-status" class="text-[10px] text-emerald-400 flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>متصل بالشبكة</span>
          </span>
          <span class="text-slate-600">•</span>
          <span class="text-[10px] text-indigo-400 font-mono">Offline-Ready</span>
        </div>
      </div>
    </div>

    <button id="btn-install" class="hidden px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg shadow transition">
      تثبيت التطبيق 📲
    </button>
  </header>

  <!-- Main Notes Container -->
  <main class="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
    <!-- PWA Compliance Banner -->
    <div class="p-4 rounded-xl bg-[#0f172a] border border-[#1e293b] flex items-center justify-between gap-3 text-xs">
      <div class="flex items-center gap-2.5">
        <span class="text-xl">⚡</span>
        <div>
          <h4 class="font-bold text-white">دعم كامل لبيئة العمل دون اتصال (Offline-First)</h4>
          <p class="text-[11px] text-slate-400">ملفات Manifest و Service Worker مفعلة وتعمل بكفاءة.</p>
        </div>
      </div>
      <span class="px-2.5 py-1 rounded bg-indigo-950 text-indigo-300 font-mono text-[11px] border border-indigo-800">
        Service Worker: Active
      </span>
    </div>

    <!-- Add Note Card -->
    <div class="p-4 sm:p-5 rounded-2xl bg-[#0f172a] border border-[#1e293b] space-y-3 shadow-lg">
      <input id="note-title" type="text" placeholder="عنوان الملاحظة..." class="w-full bg-[#0b1120] text-sm px-3.5 py-2 rounded-xl border border-slate-700 text-white outline-none focus:border-indigo-500">
      <textarea id="note-body" rows="3" placeholder="محتوى الملاحظة أو الأفكار..." class="w-full bg-[#0b1120] text-xs px-3.5 py-2 rounded-xl border border-slate-700 text-white outline-none focus:border-indigo-500"></textarea>
      
      <div class="flex flex-wrap items-center justify-between gap-3 pt-1">
        <!-- Color Tag Selector -->
        <div class="flex items-center gap-2">
          <span class="text-xs text-slate-400">اللون:</span>
          <div class="flex gap-1.5" id="color-picker">
            <button data-color="indigo" class="w-6 h-6 rounded-full bg-indigo-600 ring-2 ring-white"></button>
            <button data-color="emerald" class="w-6 h-6 rounded-full bg-emerald-600"></button>
            <button data-color="amber" class="w-6 h-6 rounded-full bg-amber-600"></button>
            <button data-color="rose" class="w-6 h-6 rounded-full bg-rose-600"></button>
          </div>
        </div>

        <button id="add-note-btn" class="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:brightness-110 active:scale-95 text-white font-bold text-xs rounded-xl shadow transition">
          + إضافة الملاحظة
        </button>
      </div>
    </div>

    <!-- Notes List -->
    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <h3 class="font-bold text-sm text-white">الملاحظات المحفوظة (<span id="notes-count">0</span>)</h3>
        <input id="search-notes" type="text" placeholder="بحث في الملاحظات..." class="bg-[#0f172a] text-xs px-3 py-1 rounded-lg border border-slate-700 text-white outline-none w-40">
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4" id="notes-grid">
        <!-- Notes injected via JS -->
      </div>
    </div>
  </main>

  <script src="js/app.js"></script>
</body>
</html>`
    },
    {
      path: 'css/style.css',
      content: `/* PWA Specific Styling */
body {
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}
.note-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.note-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.3);
}`
    },
    {
      path: 'js/app.js',
      content: `// PWA Notes Controller & Offline Service Worker Registration
document.addEventListener('DOMContentLoaded', () => {
  // 1. Register Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js')
        .then(reg => console.log('SW Registered successfully:', reg.scope))
        .catch(err => console.log('SW registration failed:', err));
    });
  }

  // 2. Network Status Monitor
  function updateNetworkStatus() {
    const status = document.getElementById('network-status');
    if (!status) return;
    if (navigator.onLine) {
      status.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span><span>متصل بالشبكة</span>';
      status.className = 'text-[10px] text-emerald-400 flex items-center gap-1';
    } else {
      status.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></span><span>وضع غير متصل (أوفلاين)</span>';
      status.className = 'text-[10px] text-rose-400 flex items-center gap-1 font-bold';
    }
  }
  window.addEventListener('online', updateNetworkStatus);
  window.addEventListener('offline', updateNetworkStatus);
  updateNetworkStatus();

  // 3. Notes Database in LocalStorage
  let selectedColor = 'indigo';
  let notes = [];
  try {
    const stored = localStorage.getItem('pwa_notes_data');
    if (stored) notes = JSON.parse(stored);
  } catch (e) {}

  if (notes.length === 0) {
    notes = [
      { id: '1', title: 'مرحباً بك في تطبيق PWA!', body: 'هذا التطبيق يعمل بدون إنترنت ويدعم التثبيت المباشر على الشاشة الرئيسية.', color: 'indigo', time: 'اليوم' },
      { id: '2', title: 'ملاحظة سريعة تجريبية', body: 'جميع الملاحظات يتم تخزينها محلياً وبشكل آمن في ذاكرة المتصفح.', color: 'emerald', time: 'أمس' }
    ];
  }

  function saveAndRender(filter = '') {
    localStorage.setItem('pwa_notes_data', JSON.stringify(notes));
    const grid = document.getElementById('notes-grid');
    const count = document.getElementById('notes-count');
    if (count) count.textContent = notes.length;
    if (!grid) return;

    const filtered = filter ? notes.filter(n => n.title.includes(filter) || n.body.includes(filter)) : notes;

    if (filtered.length === 0) {
      grid.innerHTML = '<div class="col-span-full py-12 text-center text-slate-400 text-xs">لا توجد ملاحظات تطابق البحث.</div>';
      return;
    }

    grid.innerHTML = filtered.map(n => {
      const borderClass = n.color === 'emerald' ? 'border-emerald-500/40 bg-emerald-950/20' :
                          n.color === 'amber' ? 'border-amber-500/40 bg-amber-950/20' :
                          n.color === 'rose' ? 'border-rose-500/40 bg-rose-950/20' :
                          'border-indigo-500/40 bg-indigo-950/20';

      return \`
        <div class="note-card p-4 rounded-2xl border \${borderClass} space-y-2 text-xs flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between">
              <h4 class="font-bold text-white text-sm">\${n.title}</h4>
              <button onclick="window.deleteNote('\${n.id}')" class="text-slate-500 hover:text-rose-400">✕</button>
            </div>
            <p class="text-slate-300 text-xs mt-1.5 leading-relaxed whitespace-pre-wrap">\${n.body}</p>
          </div>
          <div class="pt-2 border-t border-white/5 text-[10px] text-slate-400 flex items-center justify-between font-mono">
            <span>\${n.time}</span>
            <span class="text-slate-500">PWA Local</span>
          </div>
        </div>
      \`;
    }).join('');
  }

  window.deleteNote = function(id) {
    notes = notes.filter(n => n.id !== id);
    saveAndRender();
  };

  // Color picker
  document.querySelectorAll('#color-picker button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#color-picker button').forEach(b => b.classList.remove('ring-2', 'ring-white'));
      btn.classList.add('ring-2', 'ring-white');
      selectedColor = btn.dataset.color || 'indigo';
    });
  });

  // Add Note
  document.getElementById('add-note-btn')?.addEventListener('click', () => {
    const title = document.getElementById('note-title').value.trim();
    const body = document.getElementById('note-body').value.trim();
    if (!title && !body) {
      alert('يرجى كتابة عنوان أو محتوى للملاحظة');
      return;
    }

    const newNote = {
      id: Date.now().toString(),
      title: title || 'ملاحظة بدون عنوان',
      body: body || '',
      color: selectedColor,
      time: new Date().toLocaleDateString('ar-SA')
    };

    notes.unshift(newNote);
    document.getElementById('note-title').value = '';
    document.getElementById('note-body').value = '';
    saveAndRender();
  });

  // Search
  document.getElementById('search-notes')?.addEventListener('input', (e) => {
    saveAndRender(e.target.value.trim());
  });

  saveAndRender();
});`
    },
    {
      path: 'manifest.json',
      content: `{
  "name": "مفكرة PWA الذكية",
  "short_name": "المفكرة",
  "start_url": "index.html",
  "display": "standalone",
  "background_color": "#0b1120",
  "theme_color": "#4f46e5",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "icons/icon.svg",
      "sizes": "192x192 512x512",
      "type": "image/svg+xml",
      "purpose": "any maskable"
    }
  ]
}`
    },
    {
      path: 'sw.js',
      content: `// Service Worker with Cache-First & Network Fallback Strategy
const CACHE_NAME = 'pwa-notes-cache-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './manifest.json',
  './icons/icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request).then((networkResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      });
    }).catch(() => caches.match('./index.html'))
  );
});`
    },
    {
      path: 'icons/icon.svg',
      content: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="128" fill="#4f46e5"/>
  <path d="M160 128h192a32 32 0 0 1 32 32v192a32 32 0 0 1-32 32H160a32 32 0 0 1-32-32V160a32 32 0 0 1 32-32z" fill="#ffffff" opacity="0.9"/>
  <rect x="176" y="192" width="160" height="20" rx="10" fill="#4f46e5"/>
  <rect x="176" y="240" width="120" height="20" rx="10" fill="#4f46e5"/>
  <rect x="176" y="288" width="80" height="20" rx="10" fill="#4f46e5"/>
</svg>`
    },
    {
      path: 'README.md',
      content: `# تطبيق ويب تقدمي ومفكرة أوفلاين (PWA Offline Notes)

تطبيق ويب تقدمي متكامل يدعم العمل دون إنترنت كلياً ويحتوي على كل شروط ومعايير PWA (Manifest, Service Worker, Responsive Design).`
    }
  ]
};
