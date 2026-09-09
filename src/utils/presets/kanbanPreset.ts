import { CompletePreset } from './types';

export const KANBAN_PRESET: CompletePreset = {
  id: 'kanban-project',
  name: '📋 لوحة كانبان وإدارة المشاريع',
  category: 'Productivity',
  icon: 'Trello',
  badge: 'إدارة مهام وتخطيط',
  description: 'نظام إدارة مهام وكانبان متكامل مع إمكانية إضافة وتعديل ونقل المهام بين الحالات وحفظ البيانات محلياً',
  treeText: `kanban-suite/
├── css/
│   └── kanban.css
├── js/
│   ├── storage.js
│   └── kanban.js
├── index.html
├── tasks.json
└── README.md`,
  files: [
    {
      path: 'index.html',
      content: `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>لوحة كانبان — إدارة المشاريع والمهام</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/cairo@5.0.0/400.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/cairo@5.0.0/700.css">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="css/kanban.css">
</head>
<body class="bg-[#0b1120] text-[#f8fafc] font-['Cairo'] min-h-screen p-4 sm:p-6">
  <div class="max-w-6xl mx-auto space-y-6">
    <!-- Header -->
    <header class="bg-[#0f172a] p-4 sm:p-5 rounded-2xl border border-[#1e293b] flex flex-wrap items-center justify-between gap-4 shadow-xl">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-cyan-500 flex items-center justify-center text-xl text-white shadow-md">
          📋
        </div>
        <div>
          <h1 class="font-bold text-base sm:text-lg text-white">إدارة المهام والمشاريع (Kanban)</h1>
          <p class="text-xs text-slate-400">تتبع تقدم سير العمل وتوزيع المهام بمرونة فائقة</p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <button id="btn-add-task" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition shadow flex items-center gap-1.5 cursor-pointer">
          <span>+</span><span>مهمة جديدة</span>
        </button>
      </div>
    </header>

    <!-- Stats Bar -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="bg-[#0f172a] p-3.5 rounded-xl border border-[#1e293b] flex items-center justify-between">
        <span class="text-xs text-slate-400">قيد الانتظار (To Do)</span>
        <span id="stat-todo" class="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">0</span>
      </div>
      <div class="bg-[#0f172a] p-3.5 rounded-xl border border-[#1e293b] flex items-center justify-between">
        <span class="text-xs text-slate-400">جاري العمل (In Progress)</span>
        <span id="stat-progress" class="font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">0</span>
      </div>
      <div class="bg-[#0f172a] p-3.5 rounded-xl border border-[#1e293b] flex items-center justify-between">
        <span class="text-xs text-slate-400">المكتملة (Completed)</span>
        <span id="stat-done" class="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">0</span>
      </div>
    </div>

    <!-- Kanban Board Columns -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
      <!-- Column: To Do -->
      <div class="kanban-col bg-[#0f172a] rounded-2xl border border-[#1e293b] p-4 space-y-3 flex flex-col">
        <div class="flex items-center justify-between pb-2 border-b border-[#1e293b]">
          <h3 class="font-bold text-xs text-amber-400 flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>قيد الانتظار</span>
          </h3>
          <span class="text-[10px] text-slate-400 font-mono" id="count-todo">0</span>
        </div>
        <div class="space-y-2.5 flex-1 min-h-[300px]" id="col-todo"></div>
      </div>

      <!-- Column: In Progress -->
      <div class="kanban-col bg-[#0f172a] rounded-2xl border border-[#1e293b] p-4 space-y-3 flex flex-col">
        <div class="flex items-center justify-between pb-2 border-b border-[#1e293b]">
          <h3 class="font-bold text-xs text-blue-400 flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-blue-400"></span>
            <span>جاري التنفيذ</span>
          </h3>
          <span class="text-[10px] text-slate-400 font-mono" id="count-progress">0</span>
        </div>
        <div class="space-y-2.5 flex-1 min-h-[300px]" id="col-progress"></div>
      </div>

      <!-- Column: Completed -->
      <div class="kanban-col bg-[#0f172a] rounded-2xl border border-[#1e293b] p-4 space-y-3 flex flex-col">
        <div class="flex items-center justify-between pb-2 border-b border-[#1e293b]">
          <h3 class="font-bold text-xs text-emerald-400 flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>تم الإنجاز</span>
          </h3>
          <span class="text-[10px] text-slate-400 font-mono" id="count-done">0</span>
        </div>
        <div class="space-y-2.5 flex-1 min-h-[300px]" id="col-done"></div>
      </div>
    </div>
  </div>

  <!-- New Task Modal -->
  <div id="task-modal" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs hidden flex items-center justify-center p-4">
    <div class="bg-[#0f172a] w-full max-w-md rounded-2xl border border-[#1e293b] p-5 space-y-4 shadow-2xl">
      <div class="flex items-center justify-between border-b border-[#1e293b] pb-3">
        <h3 class="font-bold text-sm text-white">إضافة مهمة جديدة</h3>
        <button id="close-modal" class="text-slate-400 hover:text-white">✕</button>
      </div>
      <div class="space-y-3 text-xs">
        <div>
          <label class="block text-slate-400 mb-1">عنوان المهمة:</label>
          <input id="input-title" type="text" placeholder="مثال: تطوير واجهة المستخدم..." class="w-full bg-[#0b1120] border border-slate-700 rounded-lg p-2 text-white outline-none focus:border-emerald-500">
        </div>
        <div>
          <label class="block text-slate-400 mb-1">الوصف المختصر:</label>
          <textarea id="input-desc" rows="3" placeholder="تفاصيل ومتطلبات المهمة..." class="w-full bg-[#0b1120] border border-slate-700 rounded-lg p-2 text-white outline-none focus:border-emerald-500"></textarea>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-slate-400 mb-1">الأولوية:</label>
            <select id="input-priority" class="w-full bg-[#0b1120] border border-slate-700 rounded-lg p-2 text-white outline-none">
              <option value="عالية">عالية 🔴</option>
              <option value="متوسطة" selected>متوسطة 🟡</option>
              <option value="منخفضة">منخفضة 🟢</option>
            </select>
          </div>
          <div>
            <label class="block text-slate-400 mb-1">الحالة البدائية:</label>
            <select id="input-status" class="w-full bg-[#0b1120] border border-slate-700 rounded-lg p-2 text-white outline-none">
              <option value="todo">قيد الانتظار</option>
              <option value="progress">جاري العمل</option>
              <option value="done">مكتملة</option>
            </select>
          </div>
        </div>
      </div>
      <div class="flex justify-end gap-2 pt-2 border-t border-[#1e293b]">
        <button id="cancel-task-btn" class="px-3 py-1.5 bg-[#1e293b] hover:bg-[#334155] text-slate-300 text-xs rounded-lg">إلغاء</button>
        <button id="save-task-btn" class="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow">حفظ المهمة</button>
      </div>
    </div>
  </div>

  <script src="js/storage.js"></script>
  <script src="js/kanban.js"></script>
</body>
</html>`
    },
    {
      path: 'css/kanban.css',
      content: `/* Kanban Board Styling */
.task-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.task-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}`
    },
    {
      path: 'js/storage.js',
      content: `// LocalStorage Persistence Layer
window.KanbanStorage = {
  KEY: 'kanban_tasks_db',
  getTasks() {
    try {
      const val = localStorage.getItem(this.KEY);
      if (val) return JSON.parse(val);
    } catch (e) {}
    // Initial fallback tasks
    return [
      { id: '1', title: 'تصميم هيكل قاعدة البيانات', desc: 'إنشاء جداول المستخدمين والطلبات ومفاتيح الربط', priority: 'عالية', status: 'done' },
      { id: '2', title: 'بناء واجهة REST API', desc: 'برمجة نقاط النهاية مع التوثيق والمصادقة', priority: 'متوسطة', status: 'progress' },
      { id: '3', title: 'اختبار الأداء والضغط', desc: 'إجراء فحص كفاءة السيرفر تحت 10k مستخدم', priority: 'منخفضة', status: 'todo' },
      { id: '4', title: 'إعداد شهادات SSL و PWA', desc: 'توليد ملفات manifest وكاشينج للتطبيق', priority: 'عالية', status: 'todo' }
    ];
  },
  saveTasks(tasks) {
    try {
      localStorage.setItem(this.KEY, JSON.stringify(tasks));
    } catch (e) {}
  }
};`
    },
    {
      path: 'js/kanban.js',
      content: `// Kanban Board Controller
document.addEventListener('DOMContentLoaded', () => {
  let tasks = window.KanbanStorage.getTasks();

  function renderBoard() {
    const colTodo = document.getElementById('col-todo');
    const colProgress = document.getElementById('col-progress');
    const colDone = document.getElementById('col-done');

    if (!colTodo || !colProgress || !colDone) return;

    colTodo.innerHTML = '';
    colProgress.innerHTML = '';
    colDone.innerHTML = '';

    let todoCount = 0, progressCount = 0, doneCount = 0;

    tasks.forEach(t => {
      const priorityClass = t.priority === 'عالية' ? 'bg-rose-500/15 text-rose-300 border-rose-500/30' :
                            t.priority === 'متوسطة' ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' :
                            'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';

      const card = document.createElement('div');
      card.className = 'task-card bg-[#0b1120] p-3.5 rounded-xl border border-[#1e293b] space-y-2 text-xs';
      card.innerHTML = \`
        <div class="flex items-center justify-between">
          <span class="text-[10px] font-bold px-2 py-0.5 rounded border \${priorityClass}">\${t.priority}</span>
          <button onclick="window.deleteTask('\${t.id}')" class="text-slate-500 hover:text-rose-400 transition">✕</button>
        </div>
        <h4 class="font-bold text-white text-sm">\${t.title}</h4>
        <p class="text-slate-400 text-[11px] leading-relaxed">\${t.desc}</p>
        <div class="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px]">
          <span class="text-slate-500 font-mono">ID: #\${t.id.slice(-4)}</span>
          <div class="flex items-center gap-1">
            \${t.status !== 'todo' ? \`<button onclick="window.moveTask('\${t.id}', 'todo')" class="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300">⬅ انتظار</button>\` : ''}
            \${t.status !== 'progress' ? \`<button onclick="window.moveTask('\${t.id}', 'progress')" class="px-1.5 py-0.5 bg-blue-900/60 hover:bg-blue-800 rounded text-blue-200">تنفيذ 🔄</button>\` : ''}
            \${t.status !== 'done' ? \`<button onclick="window.moveTask('\${t.id}', 'done')" class="px-1.5 py-0.5 bg-emerald-900/60 hover:bg-emerald-800 rounded text-emerald-200">إنجاز ✓</button>\` : ''}
          </div>
        </div>
      \`;

      if (t.status === 'todo') {
        colTodo.appendChild(card);
        todoCount++;
      } else if (t.status === 'progress') {
        colProgress.appendChild(card);
        progressCount++;
      } else if (t.status === 'done') {
        colDone.appendChild(card);
        doneCount++;
      }
    });

    // Update counts
    document.getElementById('stat-todo').textContent = todoCount;
    document.getElementById('count-todo').textContent = todoCount + ' مهام';
    document.getElementById('stat-progress').textContent = progressCount;
    document.getElementById('count-progress').textContent = progressCount + ' مهام';
    document.getElementById('stat-done').textContent = doneCount;
    document.getElementById('count-done').textContent = doneCount + ' مهام';

    window.KanbanStorage.saveTasks(tasks);
  }

  // Global functions for inline onclick handlers
  window.moveTask = function(id, newStatus) {
    const t = tasks.find(x => x.id === id);
    if (t) {
      t.status = newStatus;
      renderBoard();
    }
  };

  window.deleteTask = function(id) {
    if (confirm('هل أنت متأكد من حذف هذه المهمة؟')) {
      tasks = tasks.filter(x => x.id !== id);
      renderBoard();
    }
  };

  // Modal logic
  const modal = document.getElementById('task-modal');
  document.getElementById('btn-add-task')?.addEventListener('click', () => modal?.classList.remove('hidden'));
  document.getElementById('close-modal')?.addEventListener('click', () => modal?.classList.add('hidden'));
  document.getElementById('cancel-task-btn')?.addEventListener('click', () => modal?.classList.add('hidden'));

  document.getElementById('save-task-btn')?.addEventListener('click', () => {
    const title = document.getElementById('input-title').value.trim();
    const desc = document.getElementById('input-desc').value.trim();
    const priority = document.getElementById('input-priority').value;
    const status = document.getElementById('input-status').value;

    if (!title) {
      alert('يرجى كتابة عنوان للمهمة');
      return;
    }

    const newTask = {
      id: Date.now().toString(),
      title,
      desc: desc || 'لا يوجد وصف إضافي',
      priority,
      status
    };

    tasks.unshift(newTask);
    renderBoard();

    // Reset inputs
    document.getElementById('input-title').value = '';
    document.getElementById('input-desc').value = '';
    modal?.classList.add('hidden');
  });

  renderBoard();
});`
    },
    {
      path: 'tasks.json',
      content: `{
  "projectName": "Kanban Sprint Manager",
  "version": "1.0.0"
}`
    },
    {
      path: 'README.md',
      content: `# نظام إدارة المشاريع وكانبان

نظام إدارة ومتابعة مهام تفاعلي وسهل الاستخدام مع حفظ تلقائي للمهام في المتصفح.`
    }
  ]
};
