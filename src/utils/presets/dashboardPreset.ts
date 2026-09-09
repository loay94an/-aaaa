import { CompletePreset } from './types';

export const DASHBOARD_PRESET: CompletePreset = {
  id: 'admin-dashboard',
  name: '📊 لوحة تحكم وإحصائيات متكاملة',
  category: 'Dashboard & CRM',
  icon: 'BarChart3',
  badge: 'نظام إداري كامل',
  description: 'نظام إدارة ولوحة مؤشرات أداء KPI مع رسوم بيانية تفاعلية، جدول مستخدمين، وسجل تنبيهات مباشر',
  treeText: `analytics-suite/
├── css/
│   └── style.css
├── js/
│   ├── app.js
│   └── data.js
├── index.html
├── data.json
└── README.md`,
  files: [
    {
      path: 'index.html',
      content: `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nexus Analytics — لوحة التحكم والإحصائيات</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/cairo@5.0.0/400.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/cairo@5.0.0/700.css">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="css/style.css">
</head>
<body class="bg-[#0b1120] text-[#f8fafc] font-['Cairo'] min-h-screen">
  <div class="flex flex-col md:flex-row min-h-screen">
    <!-- Sidebar -->
    <aside class="w-full md:w-64 bg-[#0f172a] border-b md:border-b-0 md:border-l border-[#1e293b] p-5 flex flex-col justify-between">
      <div>
        <div class="flex items-center gap-3 pb-6 border-b border-[#1e293b]">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-lg text-white shadow-md">
            ⚡
          </div>
          <div>
            <h1 class="font-bold text-base text-white">Nexus Cloud</h1>
            <p class="text-[11px] text-slate-400">منظومة الإدارة والتحليلات</p>
          </div>
        </div>

        <nav class="mt-6 space-y-1.5 text-xs font-medium">
          <a href="#" class="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg bg-blue-600 text-white font-bold transition">
            <span>📊</span><span>لوحة المؤشرات</span>
          </a>
          <a href="#" class="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1e293b] transition">
            <span>👥</span><span>إدارة المستخدمين</span>
          </a>
          <a href="#" class="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1e293b] transition">
            <span>💳</span><span>المعاملات المالية</span>
          </a>
          <a href="#" class="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1e293b] transition">
            <span>⚙️</span><span>إعدادات النظام</span>
          </a>
        </nav>
      </div>

      <div class="mt-6 pt-4 border-t border-[#1e293b] text-xs text-slate-400 flex items-center justify-between">
        <span>الخادم: <strong class="text-emerald-400">متصل (99.9%)</strong></span>
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 p-4 sm:p-8 overflow-y-auto space-y-6">
      <!-- Top Bar -->
      <header class="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#1e293b]">
        <div>
          <h2 class="text-xl font-bold text-white">نظرة عامة على الأداء</h2>
          <p class="text-xs text-slate-400">تحديث لحظي لبيانات المنظومة والعمليات النشطة</p>
        </div>
        <div class="flex items-center gap-3">
          <button id="btn-refresh" class="px-3 py-1.5 bg-[#1e293b] hover:bg-[#334155] text-xs font-bold rounded-lg border border-slate-700 transition flex items-center gap-1.5">
            <span>🔄</span><span>تحديث الأرقام</span>
          </button>
          <button id="btn-export" class="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-xs font-bold rounded-lg transition shadow">
            تحميل التقرير (CSV)
          </button>
        </div>
      </header>

      <!-- KPI Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="kpi-container">
        <!-- Injected via JS -->
      </div>

      <!-- Charts & Activity Row -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Interactive Revenue Bar Chart -->
        <div class="lg:col-span-2 bg-[#0f172a] p-5 rounded-2xl border border-[#1e293b] space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-sm text-white flex items-center gap-2">
              <span>📈</span><span>الإيرادات الشهرية لعام 2026</span>
            </h3>
            <span class="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              +24.8% نمو
            </span>
          </div>
          <div class="h-48 flex items-end justify-between gap-2 pt-4 px-2" id="bar-chart">
            <!-- Bars injected via JS -->
          </div>
        </div>

        <!-- Live Operations Feed -->
        <div class="bg-[#0f172a] p-5 rounded-2xl border border-[#1e293b] space-y-3">
          <h3 class="font-bold text-sm text-white flex items-center gap-2">
            <span>⚡</span><span>أحدث العمليات اللحظية</span>
          </h3>
          <div class="space-y-2.5 max-h-56 overflow-y-auto" id="feed-container">
            <!-- Live Feed injected via JS -->
          </div>
        </div>
      </div>

      <!-- Users & Orders Table -->
      <div class="bg-[#0f172a] p-5 rounded-2xl border border-[#1e293b] space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <h3 class="font-bold text-sm text-white flex items-center gap-2">
            <span>👥</span><span>قائمة العملاء والمشتركين النشطين</span>
          </h3>
          <input id="search-input" type="text" placeholder="بحث بالاسم أو البريد..." class="bg-[#0b1120] text-xs px-3 py-1.5 rounded-lg border border-slate-700 text-white outline-none w-48 focus:border-blue-500">
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-right text-xs">
            <thead class="text-slate-400 border-b border-[#1e293b]">
              <tr>
                <th class="py-2.5 px-3">المستخدم</th>
                <th class="py-2.5 px-3">الخطة</th>
                <th class="py-2.5 px-3">الإنفاق الإجمالي</th>
                <th class="py-2.5 px-3">الحالة</th>
                <th class="py-2.5 px-3">الإجراء</th>
              </tr>
            </thead>
            <tbody id="table-body" class="divide-y divide-[#1e293b]">
              <!-- Injected via JS -->
            </tbody>
          </table>
        </div>
      </div>
    </main>
  </div>

  <script src="js/data.js"></script>
  <script src="js/app.js"></script>
</body>
</html>`
    },
    {
      path: 'css/style.css',
      content: `/* Nexus Analytics Custom Styling */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: #0b1120;
}
::-webkit-scrollbar-thumb {
  background: #334155;
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #475569;
}

.kpi-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
}

.chart-bar {
  transition: height 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.2s ease;
}
.chart-bar:hover {
  filter: brightness(1.2);
}`
    },
    {
      path: 'js/data.js',
      content: `// Sample Enterprise Analytics Dataset
window.AnalyticsData = {
  kpis: [
    { id: 'rev', title: 'إجمالي الإيرادات', value: '$128,450', change: '+18.2%', positive: true, icon: '💰' },
    { id: 'users', title: 'المستخدمون النشطون', value: '14,290', change: '+12.5%', positive: true, icon: '👥' },
    { id: 'orders', title: 'الطلبات المكتملة', value: '3,842', change: '+6.1%', positive: true, icon: '📦' },
    { id: 'latency', title: 'زمن الاستجابة', value: '42ms', change: '-14.0%', positive: true, icon: '⚡' }
  ],
  monthlyRevenue: [
    { month: 'يناير', amount: 45 },
    { month: 'فبراير', amount: 58 },
    { month: 'مارس', amount: 72 },
    { month: 'أبريل', amount: 65 },
    { month: 'مايو', amount: 84 },
    { month: 'يونيو', amount: 92 },
    { month: 'يوليو', amount: 110 },
    { month: 'أغسطس', amount: 128 }
  ],
  users: [
    { name: 'أحمد محمود', email: 'ahmad@example.com', plan: 'Enterprise VIP', spent: '$4,200', status: 'نشط' },
    { name: 'سارة خالد', email: 'sara.k@techcorp.io', plan: 'Pro Business', spent: '$1,850', status: 'نشط' },
    { name: 'محمد علي', email: 'm.ali@digital.org', plan: 'Starter', spent: '$420', status: 'تجريبي' },
    { name: 'منى إبراهيم', email: 'mona@innovate.sa', plan: 'Enterprise VIP', spent: '$6,100', status: 'نشط' },
    { name: 'يوسف جمال', email: 'yousef@cloud.net', plan: 'Pro Business', spent: '$2,300', status: 'موقوف' }
  ],
  liveFeed: [
    { title: 'اشتراك سنوي جديد', time: 'منذ دقيقة', user: 'شركة أفق السحاب', amount: '+$1,200' },
    { title: 'اكتمال فحص الخادم', time: 'منذ 4 دقائق', user: 'النظام الآلي', amount: 'سليم 100%' },
    { title: 'ترقية باقة VIP', time: 'منذ 9 دقائق', user: 'مؤسسة الرياض', amount: '+$850' }
  ]
};`
    },
    {
      path: 'js/app.js',
      content: `// Nexus Analytics Application Logic
document.addEventListener('DOMContentLoaded', () => {
  const data = window.AnalyticsData;

  // 1. Render KPIs
  const kpiContainer = document.getElementById('kpi-container');
  if (kpiContainer && data.kpis) {
    kpiContainer.innerHTML = data.kpis.map(kpi => \`
      <div class="kpi-card bg-[#0f172a] p-4 sm:p-5 rounded-2xl border border-[#1e293b] flex items-center justify-between">
        <div>
          <span class="text-xs text-slate-400">\${kpi.title}</span>
          <h4 class="text-xl font-bold text-white mt-1 font-mono">\${kpi.value}</h4>
          <span class="text-[11px] font-bold text-emerald-400 mt-1 inline-block">\${kpi.change} عن الشهر السابق</span>
        </div>
        <div class="w-11 h-11 rounded-xl bg-[#1e293b] flex items-center justify-center text-xl shadow-inner">
          \${kpi.icon}
        </div>
      </div>
    \`).join('');
  }

  // 2. Render Bar Chart
  const barChart = document.getElementById('bar-chart');
  if (barChart && data.monthlyRevenue) {
    const max = Math.max(...data.monthlyRevenue.map(m => m.amount));
    barChart.innerHTML = data.monthlyRevenue.map(item => {
      const heightPercent = Math.round((item.amount / max) * 100);
      return \`
        <div class="flex-1 flex flex-col items-center gap-1.5 group cursor-pointer">
          <span class="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition font-mono">\$\${item.amount}k</span>
          <div class="w-full bg-[#1e293b] rounded-t-md h-36 flex items-end p-1">
            <div class="chart-bar w-full bg-gradient-to-t from-blue-600 to-indigo-400 rounded-t-sm" style="height: \${heightPercent}%"></div>
          </div>
          <span class="text-[10px] text-slate-400 font-medium">\${item.month}</span>
        </div>
      \`;
    }).join('');
  }

  // 3. Render Live Feed
  const feedContainer = document.getElementById('feed-container');
  if (feedContainer && data.liveFeed) {
    feedContainer.innerHTML = data.liveFeed.map(item => \`
      <div class="p-2.5 rounded-lg bg-[#0b1120] border border-[#1e293b] flex items-center justify-between text-xs">
        <div>
          <p class="font-bold text-slate-200">\${item.title}</p>
          <span class="text-[10px] text-slate-400">\${item.user} • \${item.time}</span>
        </div>
        <span class="font-mono text-[11px] text-emerald-400 font-bold">\${item.amount}</span>
      </div>
    \`).join('');
  }

  // 4. Render Table
  const tableBody = document.getElementById('table-body');
  function renderTable(list) {
    if (!tableBody) return;
    tableBody.innerHTML = list.map(u => {
      const statusClass = u.status === 'نشط' ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' :
                          u.status === 'تجريبي' ? 'bg-amber-500/10 text-amber-300 border-amber-500/20' :
                          'bg-rose-500/10 text-rose-300 border-rose-500/20';
      return \`
        <tr class="hover:bg-[#1e293b]/40 transition">
          <td class="py-3 px-3">
            <div class="font-bold text-white">\${u.name}</div>
            <div class="text-[11px] text-slate-400 font-mono">\${u.email}</div>
          </td>
          <td class="py-3 px-3 text-slate-300">\${u.plan}</td>
          <td class="py-3 px-3 font-mono font-bold text-slate-200">\${u.spent}</td>
          <td class="py-3 px-3">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold border \${statusClass}">\${u.status}</span>
          </td>
          <td class="py-3 px-3">
            <button onclick="alert('تفاصيل حساب ' + '\${u.name}')" class="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] border border-slate-700">
              تفاصيل
            </button>
          </td>
        </tr>
      \`;
    }).join('');
  }
  renderTable(data.users);

  // Search filter
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      const filtered = data.users.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
      renderTable(filtered);
    });
  }

  // Refresh simulation
  const refreshBtn = document.getElementById('btn-refresh');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      const rev = document.querySelector('#kpi-container h4');
      if (rev) {
        const rand = 128000 + Math.floor(Math.random() * 5000);
        rev.textContent = '$' + rand.toLocaleString();
      }
      alert('تم تحديث أرقام المنظومة لحظياً!');
    });
  }

  // Export simulation
  const exportBtn = document.getElementById('btn-export');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      alert('جاري تجهيز وتنزيل ملف التقرير CSV...');
    });
  }
});`
    },
    {
      path: 'data.json',
      content: `{
  "system": "Nexus Analytics Platform",
  "version": "2.4.0",
  "environment": "production",
  "health": {
    "apiGateway": "healthy",
    "databaseLatencyMs": 14,
    "uptime": "99.98%"
  }
}`
    },
    {
      path: 'README.md',
      content: `# لوحة Nexus Analytics المتكاملة

نظام ولوحة تحكم تفاعلية للمؤشرات والأداء والبيانات المؤسسية.

## المميزات الرئيسية:
- **مؤشرات أداء لحظية (KPIs)** مع نسب التغيير الشهري.
- **رسم بياني تفاعلي للإيرادات** يعتمد على HTML5/CSS مع تفاعل عند التمرير.
- **سجل أحداث حي (Live Activity Feed)**.
- **جدول بيانات مع فلترة وبحث فوري**.
- **تصميم متجاوب بالكامل** متوافق مع الموبايل والتابلت والحواسيب المكتبية.`
    }
  ]
};
