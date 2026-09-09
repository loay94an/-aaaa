import { CompletePreset } from './types';

export const REACT_PRESET: CompletePreset = {
  id: 'react-saas-platform',
  name: '⚛️ تطبيق React 18 + Vite SaaS',
  category: 'Frontend Frameworks',
  icon: 'Atom',
  badge: 'تطبيق React تفاعلي كامل',
  description: 'تطبيق ويب متكامل بتقنية React 18 و Vite يحتوي على مكونات مستقلة، إدارة حالة تفاعلية، شريط جانبي، وتبديل الصفحات',
  treeText: `react-saas-app/
├── public/
│   ├── favicon.svg
│   └── logo.svg
├── src/
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── StatsCard.tsx
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md`,
  files: [
    {
      path: 'index.html',
      content: `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SaaSify Cloud — منصة React 18 التفاعلية</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/cairo@5.0.0/400.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/cairo@5.0.0/700.css">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#0b1120] text-[#f8fafc] font-['Cairo'] min-h-screen">
  <div id="root">
    <!-- Standalone React Simulation Shell for preview and bundling -->
    <div class="p-6 max-w-5xl mx-auto space-y-6">
      <header class="flex items-center justify-between p-4 bg-[#0f172a] rounded-2xl border border-[#1e293b]">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-xl text-white">
            ⚛️
          </div>
          <div>
            <h1 class="font-bold text-base text-white">SaaSify React 18</h1>
            <p class="text-xs text-slate-400">تطبيق تفاعلي مبني بالمكونات المنفصلة</p>
          </div>
        </div>
        <span class="px-3 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full text-xs font-mono">React v18.3</span>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4" id="react-stats">
        <div class="bg-[#0f172a] p-4 rounded-xl border border-[#1e293b]">
          <span class="text-xs text-slate-400">المستخدمين المسجلين</span>
          <h3 class="text-xl font-bold font-mono text-white mt-1">28,490</h3>
        </div>
        <div class="bg-[#0f172a] p-4 rounded-xl border border-[#1e293b]">
          <span class="text-xs text-slate-400">زمن استجابة الواجهة</span>
          <h3 class="text-xl font-bold font-mono text-emerald-400 mt-1">16ms (60 FPS)</h3>
        </div>
        <div class="bg-[#0f172a] p-4 rounded-xl border border-[#1e293b]">
          <span class="text-xs text-slate-400">المكونات الفعالة</span>
          <h3 class="text-xl font-bold font-mono text-cyan-400 mt-1">12 Component</h3>
        </div>
      </div>

      <div class="p-5 bg-[#0f172a] rounded-2xl border border-[#1e293b] space-y-3">
        <h3 class="font-bold text-sm text-white">تفاعل مباشر بالحالة (State Management):</h3>
        <div class="flex items-center gap-3">
          <button id="counter-btn" class="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow transition">
            زيادة العداد (useState)
          </button>
          <span id="counter-val" class="font-mono text-lg font-bold text-cyan-300">العداد: 0</span>
        </div>
      </div>
    </div>
  </div>

  <script>
    let count = 0;
    document.getElementById('counter-btn')?.addEventListener('click', () => {
      count++;
      document.getElementById('counter-val').textContent = 'العداد: ' + count;
    });
  </script>
</body>
</html>`
    },
    {
      path: 'src/App.tsx',
      content: `import React, { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { StatsCard } from './components/StatsCard';

export function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'settings'>('overview');
  const [counter, setCounter] = useState<number>(0);

  return (
    <div className="flex min-h-screen bg-[#0b1120] text-slate-100 font-sans">
      <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} />
      
      <div className="flex-1 flex flex-col">
        <Header />

        <main className="p-6 space-y-6 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">منصة SaaSify السحابية</h2>
            <button 
              onClick={() => setCounter(c => c + 1)} 
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition"
            >
              نقرات الحالة: {counter}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatsCard title="إجمالي الزيارات" value="1.4M" change="+12.4%" />
            <StatsCard title="معدل التحويل" value="4.8%" change="+1.2%" />
            <StatsCard title="رضا المستخدمين" value="98.2%" change="+0.5%" />
          </div>
        </main>
      </div>
    </div>
  );
}`
    },
    {
      path: 'src/components/Header.tsx',
      content: `import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="h-16 px-6 bg-[#0f172a] border-b border-[#1e293b] flex items-center justify-between">
      <div className="text-sm font-bold text-white">لوحة تحكم SaaSify</div>
      <div className="flex items-center gap-3">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
        <span className="text-xs text-slate-400">متصل بالخادم</span>
      </div>
    </header>
  );
};`
    },
    {
      path: 'src/components/Sidebar.tsx',
      content: `import React from 'react';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: any) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab }) => {
  return (
    <aside className="w-60 bg-[#0f172a] border-l border-[#1e293b] p-4 flex flex-col justify-between">
      <div className="space-y-4">
        <div className="font-bold text-base text-cyan-400 flex items-center gap-2">
          <span>⚛️</span><span>SaaSify App</span>
        </div>
        <nav className="space-y-1 text-xs">
          <button 
            onClick={() => onSelectTab('overview')}
            className={\`w-full text-right px-3 py-2 rounded-lg font-medium \${activeTab === 'overview' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:bg-[#1e293b]'}\`}
          >
            📊 النظرة العامة
          </button>
          <button 
            onClick={() => onSelectTab('analytics')}
            className={\`w-full text-right px-3 py-2 rounded-lg font-medium \${activeTab === 'analytics' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:bg-[#1e293b]'}\`}
          >
            📈 التحليلات المتقدمة
          </button>
          <button 
            onClick={() => onSelectTab('settings')}
            className={\`w-full text-right px-3 py-2 rounded-lg font-medium \${activeTab === 'settings' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:bg-[#1e293b]'}\`}
          >
            ⚙️ إعدادات النظام
          </button>
        </nav>
      </div>
      <div className="text-[11px] text-slate-500 font-mono">v18.3 Production</div>
    </aside>
  );
};`
    },
    {
      path: 'src/components/StatsCard.tsx',
      content: `import React from 'react';

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, change }) => {
  return (
    <div className="bg-[#0f172a] p-4 rounded-xl border border-[#1e293b]">
      <span className="text-xs text-slate-400">{title}</span>
      <h3 className="text-xl font-bold text-white mt-1 font-mono">{value}</h3>
      <span className="text-[10px] text-emerald-400 font-bold mt-1 inline-block">{change}</span>
    </div>
  );
};`
    },
    {
      path: 'src/main.tsx',
      content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`
    },
    {
      path: 'src/index.css',
      content: `@tailwind base;
@tailwind components;
@tailwind utilities;`
    },
    {
      path: 'package.json',
      content: `{
  "name": "react-saas-app",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "lucide-react": "^0.344.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "typescript": "^5.2.2",
    "vite": "^5.3.1"
  }
}`
    },
    {
      path: 'vite.config.ts',
      content: `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});`
    },
    {
      path: 'README.md',
      content: `# تطبيق React 18 + Vite SaaS

مشروع كامل مبني بـ React مع تقسيم احترافي للمكونات والمسارات.`
    }
  ]
};
