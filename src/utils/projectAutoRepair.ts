import { FileNode } from '../types';
import { getAllFiles, generateUniqueId } from './treeParser';

export interface MissingResource {
  id: string;
  name: string;
  description: string;
  category: 'runtime' | 'cdn' | 'polyfill' | 'file';
  isRecommended: boolean;
  selected?: boolean;
}

export interface RuntimeStrategy {
  id: string;
  name: string;
  description: string;
  badge: string;
  isRecommended: boolean;
}

export interface ProjectArchitectureAnalysis {
  archetype: 'react' | 'fullstack-node' | 'python' | 'vanilla' | 'cli' | 'empty';
  archetypeTitle: string;
  diagnostics: string[];
  missingResources: MissingResource[];
  availableStrategies: RuntimeStrategy[];
  recommendedStrategyId: string;
  detectedDependencies: string[];
  totalFiles: number;
  aiReport: string;
}

export interface RepairResult {
  success: boolean;
  issuesFound: string[];
  fixesApplied: string[];
  repairedNodes: FileNode[];
  summary: string;
  strategyUsed: string;
}

/**
 * تحليل معماري عميق للمشروع من منظور مطور ذكاء اصطناعي وخبير أنظمة تشغيل
 */
export function analyzeProjectArchitecture(nodes: FileNode[]): ProjectArchitectureAnalysis {
  const allFiles = getAllFiles(nodes);
  const diagnostics: string[] = [];
  const detectedDependencies: string[] = [];
  const missingResources: MissingResource[] = [];

  // فحص إذا كان المشروع فارغاً
  if (!allFiles || allFiles.length === 0) {
    return {
      archetype: 'empty',
      archetypeTitle: 'مشروع فارغ (لا توجد ملفات)',
      diagnostics: ['المشروع لا يحتوي على أي ملفات برمجية أو نقاط دخول للمعاينة.'],
      missingResources: [
        {
          id: 'index-html',
          name: 'ملف نقطة الدخول (index.html)',
          description: 'ملف HTML الأساسي لعرض وتشغيل التطبيق في المتصفح',
          category: 'file',
          isRecommended: true,
          selected: true
        },
        {
          id: 'tailwind-cdn',
          name: 'مكتبة Tailwind CSS (CDN)',
          description: 'محرك التنسيقات الحديثة الجاهزة',
          category: 'cdn',
          isRecommended: true,
          selected: true
        }
      ],
      availableStrategies: [
        {
          id: 'vanilla-inline',
          name: 'مشغل HTML5 وتنسيقات الويب الحديثة',
          description: 'إنشاء بيئة HTML5 متكاملة فورية لعرض المشروع',
          badge: 'HTML5 / CSS / JS',
          isRecommended: true
        },
        {
          id: 'react-babel',
          name: 'محرك React 18 مع Babel Standalone',
          description: 'بيئة تشغيل مكونات React التفاعلية',
          badge: 'React 18',
          isRecommended: false
        }
      ],
      recommendedStrategyId: 'vanilla-inline',
      detectedDependencies: [],
      totalFiles: 0,
      aiReport: 'المشروع فارغ تماماً. يوصي خبير الأنظمة بإنشاء نقطة دخول index.html تفاعلية وتجهيز بيئة التشغيل.'
    };
  }

  // تصنيف الملفات
  const htmlFiles = allFiles.filter(f => f.name.toLowerCase().endsWith('.html') || f.name.toLowerCase().endsWith('.htm'));
  const cssFiles = allFiles.filter(f => f.name.toLowerCase().endsWith('.css'));
  const jsTsFiles = allFiles.filter(f => /\.(jsx?|tsx?)$/i.test(f.name) && !f.name.endsWith('.d.ts') && !f.name.endsWith('.config.js') && !f.name.endsWith('.config.ts'));
  const pyFiles = allFiles.filter(f => f.name.toLowerCase().endsWith('.py'));
  const jsonFiles = allFiles.filter(f => f.name.toLowerCase().endsWith('.json'));

  // فحص package.json ومحتوياته
  const pkgFile = allFiles.find(f => f.name.toLowerCase() === 'package.json');
  let hasExpressOrBackend = false;
  let hasReact = false;
  let hasVue = false;

  if (pkgFile && pkgFile.content) {
    try {
      const pkg = JSON.parse(pkgFile.content);
      const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
      Object.keys(deps).forEach(d => detectedDependencies.push(d));

      if (deps['express'] || deps['koa'] || deps['fastify'] || deps['cors'] || deps['body-parser'] || deps['mongoose']) {
        hasExpressOrBackend = true;
      }
      if (deps['react'] || deps['react-dom'] || deps['next']) {
        hasReact = true;
      }
      if (deps['vue'] || deps['nuxt']) {
        hasVue = true;
      }
    } catch {
      // JSON غير صالح
    }
  }

  // فحص كود الملفات لرصد استدعاءات الخوادم والواجهات
  const hasServerCode = allFiles.some(f => {
    const c = f.content || '';
    return (
      c.includes('express()') ||
      c.includes('app.listen(') ||
      c.includes('require("express")') ||
      c.includes("require('express')") ||
      c.includes('from "express"') ||
      c.includes("from 'express'") ||
      c.includes('Flask(') ||
      c.includes('FastAPI(')
    );
  });

  const hasApiFetch = allFiles.some(f => {
    const c = f.content || '';
    return (
      c.includes("fetch('/api") ||
      c.includes('fetch("/api') ||
      c.includes("axios.get('/api") ||
      c.includes('axios.get("/api') ||
      c.includes("axios.post('/api") ||
      c.includes('axios.post("/api')
    );
  });

  const isReactDetected = hasReact || jsTsFiles.some(f => 
    f.name.endsWith('.tsx') || 
    f.name.endsWith('.jsx') || 
    (f.content && (
      f.content.includes('import React') || 
      f.content.includes('from "react"') || 
      f.content.includes('from \'react\'') || 
      f.content.includes('ReactDOM.')
    ))
  );

  const isPythonDetected = pyFiles.length > 0;

  // تشخيص المشاكل المعمارية
  const rootHtml = htmlFiles.find(f => f.name.toLowerCase() === 'index.html') || htmlFiles[0];

  if (!rootHtml) {
    diagnostics.push('غياب ملف نقطة الدخول (index.html): المتصفح يحتاج لملف HTML لتشغيل واجهة المشروع.');
    missingResources.push({
      id: 'index-html',
      name: 'ملف index.html مدمج ونقطة تشغيل',
      description: 'إنشاء ملف index.html وربطه بمكونات وسكربتات المشروع تلقائياً',
      category: 'file',
      isRecommended: true,
      selected: true
    });
  } else {
    if (isReactDetected && !rootHtml.content?.includes('id="root"') && !rootHtml.content?.includes("id='root'")) {
      diagnostics.push('حاوية React مفقودة: ملف index.html لا يحتوي على <div id="root">.');
      missingResources.push({
        id: 'react-root-div',
        name: 'حاوية العرض <div id="root"></div>',
        description: 'العنصر الذي يقوم React برسم وتصيير المكونات بداخله',
        category: 'file',
        isRecommended: true,
        selected: true
      });
    }

    if (isReactDetected && !rootHtml.content?.includes('react.production') && !rootHtml.content?.includes('type="module"')) {
      diagnostics.push('مكتبات React غير محملة في المتصفح: الكود يستخدم JSX دون وجود محول Babel أو بيئة تشغيل.');
      missingResources.push({
        id: 'react-babel-cdn',
        name: 'React 18 & Babel Standalone (CDN)',
        description: 'تشغيل وتحويل كود JSX و TypeScript مباشرة داخل المتصفح',
        category: 'runtime',
        isRecommended: true,
        selected: true
      });
    }
  }

  if (hasServerCode || hasExpressOrBackend || hasApiFetch) {
    diagnostics.push('مشروع Full-Stack / Node.js: يحتوي على خادم Express أو استدعاءات لواجهات برمجة التطبيقات (/api) التي تتطلب بيئة خادم افتراضية.');
    missingResources.push({
      id: 'virtual-express-server',
      name: 'محاكي الخادم الافتراضي (Virtual Node & Express API Engine)',
      description: 'اعتراض طلبات /api/* في المتصفح ومحاكاتها بردود سريعة ناجحة لمنع أخطاء 404',
      category: 'runtime',
      isRecommended: true,
      selected: true
    });
    missingResources.push({
      id: 'node-globals-polyfill',
      name: 'محاكي متغيرات Node.js (process.env & global)',
      description: 'توفير متغيرات process و Buffer داخل نافذة المعاينة لمنع أخطاء التوقف',
      category: 'polyfill',
      isRecommended: true,
      selected: true
    });
  }

  if (isPythonDetected) {
    diagnostics.push('كود بايثون Python: يتطلب نظام تشغيل افتراضي WebAssembly (Pyodide) لتشغيل الكود داخل المتصفح.');
    missingResources.push({
      id: 'pyodide-engine',
      name: 'محرك Pyodide WebAssembly (Python 3.11 Runtime)',
      description: 'نظام تشغيل بايثون افتراضي متكامل داخل المتصفح يدعم المخرجات المباشرة',
      category: 'runtime',
      isRecommended: true,
      selected: true
    });
  }

  // إضافة Tailwind إذا لم يكن موجوداً
  if (!rootHtml?.content?.includes('tailwindcss') && cssFiles.length === 0) {
    missingResources.push({
      id: 'tailwind-cdn',
      name: 'Tailwind CSS CDN',
      description: 'توفير محرك التنسيقات الحديثة لعرض وتنسيق الواجهات بشكل متناسق',
      category: 'cdn',
      isRecommended: true,
      selected: true
    });
  }

  // تحديد النموذج المعماري للمشروع (Archetype)
  let archetype: ProjectArchitectureAnalysis['archetype'] = 'vanilla';
  let archetypeTitle = 'موقع ويب قياسي (HTML5 / CSS / JavaScript)';
  let recommendedStrategyId = 'vanilla-inline';

  if (hasServerCode || hasExpressOrBackend) {
    archetype = 'fullstack-node';
    archetypeTitle = 'مشروع Full-Stack (Node.js & Express / API Server)';
    recommendedStrategyId = 'virtual-fullstack';
  } else if (isReactDetected) {
    archetype = 'react';
    archetypeTitle = 'تطبيق React 18 تفاعلي (TypeScript / JSX)';
    recommendedStrategyId = 'react-babel';
  } else if (isPythonDetected) {
    archetype = 'python';
    archetypeTitle = 'مشروع بايثون (Python Script / Virtual WASM)';
    recommendedStrategyId = 'pyodide-wasm';
  } else if (jsTsFiles.length > 0 && htmlFiles.length === 0) {
    archetype = 'cli';
    archetypeTitle = 'أداة سطر أوامر / سكربت برمجي (CLI / Node Script)';
    recommendedStrategyId = 'terminal-repl';
  }

  const availableStrategies: RuntimeStrategy[] = [
    {
      id: 'react-babel',
      name: 'محرك React 18 مع Babel Standalone و Tailwind',
      description: 'تجميع حي وتشغيل فوري لمكونات React و TypeScript مع محول JSX المدمج',
      badge: 'React 18 / JSX',
      isRecommended: archetype === 'react'
    },
    {
      id: 'virtual-fullstack',
      name: 'محاكي بيئة Full-Stack (Virtual Node & Express API Engine)',
      description: 'تشغيل الواجهة الأمامية مع اعتراض استدعاءات الخادم /api/* وتغذيتها ببيانات تجريبية ذكية',
      badge: 'Node / Express / REST',
      isRecommended: archetype === 'fullstack-node'
    },
    {
      id: 'pyodide-wasm',
      name: 'نظام تشغيل بايثون الافتراضي (Pyodide WebAssembly OS)',
      description: 'تنفيذ كود بايثون 3.11 مباشرة داخل المتصفح مع طباعة مخرجات الكونسول في الوقت الفعلي',
      badge: 'Python 3.11 WASM',
      isRecommended: archetype === 'python'
    },
    {
      id: 'vanilla-inline',
      name: 'مستعرض HTML5 المباشر والربط التلقائي للملفات',
      description: 'دمج كافة ملفات التنسيق CSS وسكربتات JS والصور تلقائياً داخل وثيقة HTML5',
      badge: 'HTML5 / Modern Web',
      isRecommended: archetype === 'vanilla'
    },
    {
      id: 'terminal-repl',
      name: 'مشغل الطرفية التفاعلية وسطر الأوامر (Console REPL)',
      description: 'تنفيذ الكود داخل بيئة محاكاة طرفية وطباعة نتائج الكونسول والأخطاء بوضوح',
      badge: 'Terminal / REPL',
      isRecommended: archetype === 'cli'
    }
  ];

  // تقرير المطور الذكي
  const aiReport = `### 🧠 تقرير مطور الذكاء الاصطناعي وخبير أنظمة التشغيل:
- **تصنيف بنية المشروع:** ${archetypeTitle}
- **إجمالي الملفات:** ${allFiles.length} ملف برمجياً
- **التشخيص:** ${diagnostics.length > 0 ? diagnostics.join(' • ') : 'الهيكل العام للمشروع سليم ويحتاج فقط لتهيئة نقطة التشغيل.'}
- **طريقة التشغيل الموصى بها:** ${availableStrategies.find(s => s.id === recommendedStrategyId)?.name || 'تشغيل قياسي'}
- **الموارد الإضافية المقترحة:** ${missingResources.map(r => r.name).join('، ') || 'كافة الموارد متوفرة'}`;

  return {
    archetype,
    archetypeTitle,
    diagnostics,
    missingResources,
    availableStrategies,
    recommendedStrategyId,
    detectedDependencies,
    totalFiles: allFiles.length,
    aiReport
  };
}

/**
 * تطبيق إصلاحات مطور الذكاء الاصطناعي وخبير الأنظمة وتحديث شجرة الملفات
 */
export function applyAiDeveloperFix(
  nodes: FileNode[],
  strategyId: string,
  selectedResourceIds: string[]
): RepairResult {
  const issuesFound: string[] = [];
  const fixesApplied: string[] = [];
  let updatedNodes = JSON.parse(JSON.stringify(nodes)) as FileNode[];

  // 1. فحص إذا كان المشروع فارغاً تماماً
  if (!updatedNodes || updatedNodes.length === 0) {
    issuesFound.push('المشروع فارغ ولا يحتوي على ملفات.');
    const sampleHtml: FileNode = {
      id: generateUniqueId(),
      name: 'index.html',
      type: 'file',
      path: 'index.html',
      content: `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>مشروع جديد مجهز للتشغيل</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-slate-100 flex items-center justify-center min-h-screen p-6 font-sans">
  <div class="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center shadow-2xl">
    <div class="w-16 h-16 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-2xl mx-auto flex items-center justify-center text-3xl mb-4">
      ⚡
    </div>
    <h1 class="text-xl font-bold text-white mb-2">تم تجهيز وتشغيل بيئة المشروع</h1>
    <p class="text-xs text-slate-400 mb-6 leading-relaxed">
      تم إنشاء نقطة دخول تشغيلية بنجاح عبر خبير أنظمة التشغيل والذكاء الاصطناعي.
    </p>
    <button onclick="alert('المعاينة تعمل بنجاح ⚡')" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold cursor-pointer transition">
      اختبار المعاينة التفاعلية
    </button>
  </div>
</body>
</html>`,
      size: 1200,
      isSaved: true,
      lastModified: Date.now(),
      parentId: null
    };

    updatedNodes = [sampleHtml];
    fixesApplied.push('تم إنشاء ملف index.html تشغيلي جاهز للمعاينة الفورية.');
    return {
      success: true,
      issuesFound,
      fixesApplied,
      repairedNodes: updatedNodes,
      summary: 'تم تزويد المشروع ببيئة تشغيل HTML5 كاملة وجاهزة للمعاينة ⚡',
      strategyUsed: 'vanilla-inline'
    };
  }

  let allFiles = getAllFiles(updatedNodes);

  // 2. إصلاح أي تفريغ نصوص مشوش (JSON Dump) إن وجد
  const dumpedFile = allFiles.find(f => {
    const c = (f.content || '').trim();
    return (
      (c.startsWith('{') && c.endsWith('}') && (c.includes('"index.html"') || c.includes('"package.json"') || c.includes('"src/'))) ||
      (c.includes('\\n \\n\\n"index.html":') || c.includes('"App.tsx":'))
    );
  });

  if (dumpedFile && dumpedFile.content) {
    try {
      let raw = dumpedFile.content.trim();
      if (raw.includes('\\n \\n\\n"')) {
        raw = raw.replace(/\\n\s*\\n\\n/g, '');
      }
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'object' && parsed !== null) {
        issuesFound.push(`تم اكتشاف تفريغ نصوص برمجي مكدس داخل الملف "${dumpedFile.name}".`);
        const extractedNodes: FileNode[] = [];
        for (const [filePath, fileContent] of Object.entries(parsed)) {
          if (typeof fileContent === 'string') {
            const cleanPath = filePath.replace(/^[\\/.]+/, '').replace(/\\/g, '/');
            const fileName = cleanPath.split('/').pop() || cleanPath;
            extractedNodes.push({
              id: generateUniqueId(),
              name: fileName,
              type: 'file',
              path: cleanPath,
              content: fileContent,
              size: fileContent.length,
              isSaved: true,
              lastModified: Date.now(),
              parentId: null
            });
          }
        }
        if (extractedNodes.length > 0) {
          updatedNodes = extractedNodes;
          allFiles = getAllFiles(updatedNodes);
          fixesApplied.push(`تم استخراج ${extractedNodes.length} ملفات برمجية مستقلة من التفريغ المكدس.`);
        }
      }
    } catch {
      // ليس JSON صالحاً
    }
  }

  const htmlFiles = allFiles.filter(f => f.name.toLowerCase().endsWith('.html') || f.name.toLowerCase().endsWith('.htm'));
  const cssFiles = allFiles.filter(f => f.name.toLowerCase().endsWith('.css'));
  const jsTsFiles = allFiles.filter(f => /\.(jsx?|tsx?)$/i.test(f.name) && !f.name.endsWith('.d.ts') && !f.name.endsWith('.config.js') && !f.name.endsWith('.config.ts'));
  const pyFiles = allFiles.filter(f => f.name.toLowerCase().endsWith('.py'));

  let rootHtml = htmlFiles.find(f => f.name.toLowerCase() === 'index.html') || htmlFiles[0];

  // حقن وتجهيز الموارد المحددة
  const injectTailwind = selectedResourceIds.includes('tailwind-cdn');
  const injectReactBabel = selectedResourceIds.includes('react-babel-cdn');
  const injectVirtualExpress = selectedResourceIds.includes('virtual-express-server');
  const injectNodeGlobals = selectedResourceIds.includes('node-globals-polyfill');

  // تحضير كود محاكي خادم Express وطلبات API
  const virtualServerScript = injectVirtualExpress ? `
  <script>
    // [Virtual Express & Mock API Server] محاكي خادم داخلي لاعتراض وتغذية طلبات /api
    (function() {
      const origFetch = window.fetch;
      window.fetch = async function(resource, init) {
        const url = typeof resource === 'string' ? resource : (resource ? resource.url : '');
        if (url && (url.startsWith('/api') || url.includes('/api/'))) {
          console.info('[Virtual Express API Engine] تم اعتراض ومعالجة طلب الخادم:', url, init?.method || 'GET');
          const mockData = {
            success: true,
            status: 'ok',
            message: 'استجابة ناجحة من خادم Node/Express الافتراضي الداخلي',
            timestamp: new Date().toISOString(),
            endpoint: url,
            results: [
              { id: 1, title: 'عنصر اختباري 1', active: true },
              { id: 2, title: 'عنصر اختباري 2', active: false }
            ]
          };
          return new Response(JSON.stringify(mockData), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        return origFetch.apply(window, arguments);
      };
    })();
  </script>
` : '';

  // تحضير محاكي متغيرات Node.js و Buffer
  const nodeGlobalsScript = injectNodeGlobals ? `
  <script>
    // [Node.js Globals & Buffer Polyfill]
    window.process = window.process || { 
      env: { NODE_ENV: 'development', PORT: '3000', GEMINI_API_KEY: 'mock-key' },
      cwd: function() { return '/'; },
      nextTick: function(fn) { setTimeout(fn, 0); }
    };
    window.Buffer = window.Buffer || {
      isBuffer: function(obj) { return !!(obj && obj._isBuffer); },
      from: function(data) {
        if (typeof data === 'string') {
          const arr = new Uint8Array(data.length);
          for (let i = 0; i < data.length; i++) arr[i] = data.charCodeAt(i) & 0xff;
          arr._isBuffer = true;
          arr.toString = function(e) { return e === 'base64' ? btoa(data) : data; };
          return arr;
        }
        const res = new Uint8Array(data || []);
        res._isBuffer = true;
        res.toString = function() { return String.fromCharCode.apply(null, res); };
        return res;
      },
      alloc: function(s) { const r = new Uint8Array(s); r._isBuffer = true; return r; }
    };
    window.global = window.global || window;
    window.global.Buffer = window.Buffer;
    window.global.process = window.process;
  </script>
` : '';

  // 3. بناء أو تحديث ملف index.html بحسب الاستراتيجية المختارة
  if (!rootHtml) {
    issuesFound.push('غياب ملف index.html كنقطة دخول رئيسية.');

    let newHtml = '';

    if (strategyId === 'react-babel' || strategyId === 'virtual-fullstack') {
      const mainComp = jsTsFiles.find(f => f.name === 'App.tsx' || f.name === 'App.jsx' || f.name === 'main.tsx' || f.name === 'index.tsx') || jsTsFiles[0];
      const rawCode = mainComp?.content || 'function App() { return <div className="p-8 text-center text-xl font-bold">تطبيق React 18 مجهز ويعمل بنجاح ⚡</div>; }';
      
      const cleanedCode = rawCode
        .replace(/import\s+.*?from\s+['"].*?['"];?/g, '')
        .replace(/export\s+default\s+/g, '')
        .replace(/export\s+/g, '');

      const cssStyles = cssFiles.map(c => `  <style>/* ${c.name} */\n${c.content || ''}\n</style>`).join('\n');

      newHtml = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>معاينة التطبيق</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/cairo@5.0.0/400.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/cairo@5.0.0/700.css">
  <style>
    body { font-family: 'Cairo', sans-serif; background: #0b1120; color: #f8fafc; margin: 0; padding: 0; }
  </style>
${cssStyles}
${nodeGlobalsScript}
${virtualServerScript}
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    ${cleanedCode}

    try {
      const Component = typeof App !== 'undefined' ? App : (typeof Main !== 'undefined' ? Main : null);
      if (Component) {
        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<Component />);
      } else {
        document.getElementById('root').innerHTML = '<div class="p-8 text-center text-slate-300">تم تجهيز وتشغيل بيئة React بنجاح ⚡</div>';
      }
    } catch(err) {
      document.getElementById('root').innerHTML = '<div class="p-6 m-4 bg-red-950/80 border border-red-800 text-red-200 rounded-xl font-mono text-xs">خطأ تشغيل: ' + err.message + '</div>';
    }
  </script>
</body>
</html>`;

      fixesApplied.push(`تم إنشاء ملف index.html مجهز ببيئة React 18 و Babel Standalone وربطه بالمكون "${mainComp?.name || 'App'}".`);
    } else if (strategyId === 'pyodide-wasm' || pyFiles.length > 0) {
      const pyFile = pyFiles[0] || { name: 'main.py', content: 'print("مرحباً من بيئة بايثون الافتراضية!")' };
      const safePyCode = (pyFile.content || '').replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');

      newHtml = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pyFile.name} - مشغل بايثون الافتراضي</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js"></script>
  <style>body { font-family: sans-serif; background: #090d16; color: #f8fafc; }</style>
</head>
<body class="p-6">
  <div class="max-w-3xl mx-auto space-y-4">
    <div class="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-xl">
      <div class="flex items-center gap-2">
        <span class="w-3 h-3 rounded-full bg-emerald-400"></span>
        <span class="font-bold text-sm text-white">${pyFile.name} (مشغل بايثون WebAssembly)</span>
      </div>
      <button onclick="runPythonCode()" class="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold cursor-pointer">إعادة التشغيل ⚡</button>
    </div>
    <div class="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
      <h3 class="text-xs font-bold text-slate-400 mb-2 font-mono">مخرجات كونسول بايثون:</h3>
      <pre id="output" class="bg-slate-950 p-4 rounded-lg font-mono text-xs text-emerald-400 min-h-[160px] overflow-x-auto whitespace-pre-wrap">جاري تحميل بيئة بايثون الافتراضية...</pre>
    </div>
  </div>
  <script>
    let pyodideInstance = null;
    async function init() {
      const out = document.getElementById('output');
      try {
        pyodideInstance = await loadPyodide();
        out.textContent = 'بيئة Python جاهزة. جاري التنفيذ...\\n';
        await runPythonCode();
      } catch(err) {
        out.textContent = 'خطأ في تحميل بيئة Pyodide: ' + err.message;
      }
    }
    async function runPythonCode() {
      if (!pyodideInstance) return;
      const out = document.getElementById('output');
      try {
        pyodideInstance.setStdout({ batched: (msg) => { out.textContent += msg + '\\n'; } });
        await pyodideInstance.runPythonAsync(\`${safePyCode}\`);
      } catch(err) {
        out.textContent += '\\nخطأ في التنفيذ: ' + err.message;
      }
    }
    init();
  </script>
</body>
</html>`;
      fixesApplied.push(`تم إنشاء ملف index.html مجهز بمحرك Pyodide WebAssembly لتشغيل بايثون مباشرة في المتصفح.`);
    } else {
      const cssStyles = cssFiles.map(c => `  <style>/* ${c.name} */\n${c.content || ''}\n</style>`).join('\n');
      const jsScripts = jsTsFiles.map(j => `  <script>/* ${j.name} */\ntry {\n${j.content || ''}\n} catch(err) { console.error(err); }\n</script>`).join('\n');

      newHtml = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>معاينة وتشغيل المشروع</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/cairo@5.0.0/400.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/cairo@5.0.0/700.css">
  <style>
    body { font-family: 'Cairo', sans-serif; background: #0b1120; color: #f8fafc; }
  </style>
${cssStyles}
${nodeGlobalsScript}
${virtualServerScript}
</head>
<body class="min-h-screen p-6">
  <div class="max-w-3xl mx-auto space-y-4">
    <div class="p-5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
      <div class="flex items-center gap-3">
        <span class="w-3 h-3 rounded-full bg-emerald-400"></span>
        <div>
          <h1 class="text-base font-bold text-white">تم تجهيز وتشغيل واجهة المشروع بنجاح</h1>
          <p class="text-xs text-slate-400">تم تضمين كافة ملفات التنسيق والسكربتات التابعة للمشروع تلقائياً</p>
        </div>
      </div>
      <span class="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs rounded font-mono">نشط</span>
    </div>
    <div id="app" class="p-6 bg-slate-900/60 border border-slate-800 rounded-xl min-h-[140px]">
      <p class="text-xs text-slate-300 mb-3 font-semibold">الملفات المرتبطة والمفعلة:</p>
      <div class="flex flex-wrap gap-2 text-xs font-mono">
        ${allFiles.map(f => `<span class="px-2.5 py-1 bg-slate-800 text-slate-300 rounded border border-slate-700">📄 ${f.name}</span>`).join('')}
      </div>
    </div>
  </div>
${jsScripts}
</body>
</html>`;
      fixesApplied.push('تم إنشاء ملف index.html تشغيلي متكامل وربط كافة ملفات CSS و JavaScript بداخله.');
    }

    const newIndexNode: FileNode = {
      id: generateUniqueId(),
      name: 'index.html',
      type: 'file',
      path: 'index.html',
      content: newHtml,
      size: newHtml.length,
      isSaved: true,
      lastModified: Date.now(),
      parentId: null
    };

    if (updatedNodes.length > 0 && updatedNodes[0].type === 'folder') {
      newIndexNode.parentId = updatedNodes[0].id;
      newIndexNode.path = `${updatedNodes[0].name}/index.html`;
      updatedNodes[0].children = [newIndexNode, ...(updatedNodes[0].children || [])];
    } else {
      updatedNodes = [newIndexNode, ...updatedNodes];
    }
  } else {
    // تحديث وتعديل ملف index.html القائم
    let content = rootHtml.content || '';
    let modified = false;

    // إضافة حاوية root إذا كانت ناقصة لـ React
    if ((strategyId === 'react-babel' || strategyId === 'virtual-fullstack') && !content.includes('id="root"') && !content.includes("id='root'")) {
      issuesFound.push('ملف index.html يفتقد لحاوية React (<div id="root">).');
      if (content.includes('</body>')) {
        content = content.replace('</body>', '  <div id="root"></div>\n</body>');
      } else {
        content += '\n<div id="root"></div>';
      }
      modified = true;
      fixesApplied.push('تمت إضافة حاوية العرض <div id="root"></div> داخل ملف index.html.');
    }

    // حقن React و Babel إذا طلب المستخدم
    if (injectReactBabel && !content.includes('react.production') && !content.includes('type="module"')) {
      const babelTags = `
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
`;
      if (content.includes('<head>')) {
        content = content.replace('<head>', `<head>${babelTags}`);
      } else {
        content = babelTags + content;
      }
      modified = true;
      fixesApplied.push('تم تضمين مكتبات React 18 و Babel Standalone داخل <head>.');
    }

    // حقن محاكي الخادم ومحاكي متغيرات Node
    if (injectVirtualExpress && !content.includes('Virtual Express & Mock API Server')) {
      if (content.includes('</head>')) {
        content = content.replace('</head>', `${virtualServerScript}\n</head>`);
      } else {
        content = virtualServerScript + content;
      }
      modified = true;
      fixesApplied.push('تم حقن محاكي الخادم الافتراضي (Virtual Express Engine) لاعتراض وتغذية طلبات /api.');
    }

    if (injectNodeGlobals && !content.includes('Node.js Globals Polyfill')) {
      if (content.includes('</head>')) {
        content = content.replace('</head>', `${nodeGlobalsScript}\n</head>`);
      } else {
        content = nodeGlobalsScript + content;
      }
      modified = true;
      fixesApplied.push('تم حقن محاكي متغيرات Node.js (process.env & global).');
    }

    // ربط ملفات CSS غير المربوطة
    for (const css of cssFiles) {
      if (css.content && !content.includes(css.name)) {
        const linkTag = `\n  <style>/* ${css.name} */\n${css.content}\n  </style>`;
        if (content.includes('</head>')) {
          content = content.replace('</head>', `${linkTag}\n</head>`);
        } else {
          content = linkTag + content;
        }
        modified = true;
        fixesApplied.push(`تم تفعيل ملف التنسيق "${css.name}" داخل صفحة المعاينة.`);
      }
    }

    if (modified) {
      rootHtml.content = content;
      rootHtml.size = content.length;
      rootHtml.isSaved = true;
      rootHtml.lastModified = Date.now();
    }
  }

  // حفظ جميع الملفات
  allFiles = getAllFiles(updatedNodes);
  allFiles.forEach(f => {
    f.isSaved = true;
  });

  return {
    success: true,
    issuesFound,
    fixesApplied,
    repairedNodes: updatedNodes,
    summary: `تم تطبيق استراتيجية "${strategyId}" وإضافة ${fixesApplied.length} موارد وإصلاحات بنجاح ⚡`,
    strategyUsed: strategyId
  };
}

/**
 * إنشاء تقرير / برومبت منسق ومفصل لمطور الذكاء الاصطناعي وخبير أنظمة التشغيل لنسخه للمحادثة
 */
export function generateAiConsultationPrompt(nodes: FileNode[], analysis: ProjectArchitectureAnalysis): string {
  const allFiles = getAllFiles(nodes);
  const fileTreeSummary = allFiles.slice(0, 15).map(f => `- ${f.path || f.name} (${f.size || 0} بايت)`).join('\n');

  return `عزيزي مطور الذكاء الاصطناعي وخبير أنظمة التشغيل:

أواجه مشكلة في تشغيل ومعاينة هذا المشروع داخل التطبيق، وأرغب في مساعدتك لمراجعته وتعديله وإضافة أي موارد لازمة لتشغيله بسلاسة:

📊 **بيانات التحليل المعماري للمشروع:**
- **تصنيف بنية المشروع:** ${analysis.archetypeTitle}
- **طريقة المعاينة المقترحة:** ${analysis.recommendedStrategyId}
- **إجمالي الملفات:** ${analysis.totalFiles} ملف
- **التبعيات المكتشفة:** ${analysis.detectedDependencies.join(', ') || 'لا توجد حزم في package.json'}

⚠️ **التشخيص والأسباب:**
${analysis.diagnostics.length > 0 ? analysis.diagnostics.map(d => `- ${d}`).join('\n') : '- المشروع يحتاج لربط بيئة المعاينة.'}

📦 **الموارد الناقصة المطلوبة:**
${analysis.missingResources.map(r => `- ${r.name}: ${r.description}`).join('\n')}

📁 **عينة من ملفات المشروع:**
${fileTreeSummary}${allFiles.length > 15 ? `\n... و ${allFiles.length - 15} ملفات أخرى` : ''}

الرجاء مراجعة الكود وإصلاح الخلل أو تزويدي بأفضل حل لتشغيله في المعاينة الفورية.`;
}
