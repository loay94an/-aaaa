import { CompletePreset } from './types';

export const EXPRESS_PRESET: CompletePreset = {
  id: 'express-rest-api',
  name: '🟢 خادم Express API ومختبر REST',
  category: 'Backend & APIs',
  icon: 'Server',
  badge: 'خادم ومختبر API حي',
  description: 'نظام خلفي متكامل بـ Express.js مع مسارات التوثيق والمستخدمين، ومدمج معه واجهة اختبار تفاعلية لتجربة استدعاءات الـ API مباشرة',
  treeText: `express-api-service/
├── src/
│   ├── controllers/
│   │   └── userController.js
│   ├── routes/
│   │   └── api.js
│   ├── middleware/
│   │   └── auth.js
│   └── server.js
├── public/
│   └── index.html
├── .env.example
├── package.json
└── README.md`,
  files: [
    {
      path: 'public/index.html',
      content: `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Express API Console — منصة اختبار وتوثيق REST API</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/cairo@5.0.0/400.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/cairo@5.0.0/700.css">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#0b1120] text-[#f8fafc] font-['Cairo'] min-h-screen p-4 sm:p-8">
  <div class="max-w-5xl mx-auto space-y-6">
    <!-- Header -->
    <header class="p-5 bg-[#0f172a] rounded-2xl border border-[#1e293b] flex flex-wrap items-center justify-between gap-4 shadow-xl">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-xl text-white shadow-md">
          ⚡
        </div>
        <div>
          <h1 class="text-base sm:text-lg font-bold text-white">Express REST API Engine</h1>
          <p class="text-xs text-slate-400">خادم Express متكامل مع منصة فحص واختبار تفاعلية لنقاط النهاية (Swagger UI)</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          الخادم نشط: Port 3000
        </span>
      </div>
    </header>

    <!-- Architecture & Endpoints Testing Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Endpoints Controls -->
      <div class="space-y-4">
        <h3 class="font-bold text-sm text-white flex items-center gap-2">
          <span>🎯</span><span>نقاط النهاية المتاحة (API Endpoints)</span>
        </h3>

        <!-- Endpoint 1: Health Check -->
        <div class="p-4 bg-[#0f172a] rounded-xl border border-[#1e293b] space-y-2">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded font-mono font-bold text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">GET</span>
              <span class="font-mono text-xs text-slate-200">/api/health</span>
            </div>
            <button onclick="window.runApiCall('/api/health', 'GET')" class="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition shadow">
              تنفيذ الاستدعاء ▶
            </button>
          </div>
          <p class="text-[11px] text-slate-400">فحص كفاءة وحالة الخادم وزمن الاستجابة.</p>
        </div>

        <!-- Endpoint 2: Get Users -->
        <div class="p-4 bg-[#0f172a] rounded-xl border border-[#1e293b] space-y-2">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded font-mono font-bold text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30">GET</span>
              <span class="font-mono text-xs text-slate-200">/api/users</span>
            </div>
            <button onclick="window.runApiCall('/api/users', 'GET')" class="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition shadow">
              تنفيذ الاستدعاء ▶
            </button>
          </div>
          <p class="text-[11px] text-slate-400">استرجاع قائمة المستخدمين المسجلين في النظام.</p>
        </div>

        <!-- Endpoint 3: Create User (POST) -->
        <div class="p-4 bg-[#0f172a] rounded-xl border border-[#1e293b] space-y-2">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded font-mono font-bold text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30">POST</span>
              <span class="font-mono text-xs text-slate-200">/api/users</span>
            </div>
            <button onclick="window.runApiCall('/api/users', 'POST')" class="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-lg transition shadow">
              إرسال حمولة JSON ▶
            </button>
          </div>
          <p class="text-[11px] text-slate-400">إنشاء مستخدم جديد مع التحقق من صحة المدخلات وتشفير المعرف.</p>
        </div>

        <!-- Endpoint 4: System Metrics -->
        <div class="p-4 bg-[#0f172a] rounded-xl border border-[#1e293b] space-y-2">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded font-mono font-bold text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30">GET</span>
              <span class="font-mono text-xs text-slate-200">/api/metrics</span>
            </div>
            <button onclick="window.runApiCall('/api/metrics', 'GET')" class="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-lg transition shadow">
              تنفيذ الاستدعاء ▶
            </button>
          </div>
          <p class="text-[11px] text-slate-400">استخراج مقاييس واستهلاك موارد الذاكرة والمعالج.</p>
        </div>
      </div>

      <!-- Live Response Console -->
      <div class="bg-[#0f172a] rounded-2xl border border-[#1e293b] p-5 flex flex-col space-y-3">
        <div class="flex items-center justify-between pb-3 border-b border-[#1e293b]">
          <h3 class="font-bold text-sm text-white flex items-center gap-2">
            <span>📟</span><span>استجابة الخادم اللحظية (Live API Response)</span>
          </h3>
          <span id="res-status" class="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[11px] font-mono font-bold">HTTP 200 OK</span>
        </div>

        <div class="flex items-center justify-between text-xs text-slate-400">
          <span id="res-endpoint" class="font-mono">Endpoint: /api/health</span>
          <span id="res-time" class="font-mono">Latency: 12ms</span>
        </div>

        <!-- JSON Output Display -->
        <pre id="json-viewer" class="flex-1 bg-[#0b1120] p-4 rounded-xl border border-slate-800 text-emerald-400 font-mono text-xs overflow-x-auto min-h-[260px] leading-relaxed select-all">
{
  "status": "healthy",
  "service": "Express REST API",
  "uptime": "428.5 seconds",
  "timestamp": "2026-09-06T21:00:00.000Z",
  "memoryUsage": {
    "rss": "34.2 MB",
    "heapTotal": "18.5 MB"
  }
}
        </pre>
      </div>
    </div>
  </div>

  <script>
    const mockResponses = {
      '/api/health': {
        status: 'healthy',
        service: 'Express REST API',
        uptime: '428.5 seconds',
        timestamp: new Date().toISOString(),
        memoryUsage: { rss: '34.2 MB', heapTotal: '18.5 MB' }
      },
      '/api/users': {
        total: 3,
        page: 1,
        users: [
          { id: 'usr_101', name: 'طارق الشهري', role: 'admin', email: 'tariq@cloud.sa' },
          { id: 'usr_102', name: 'ليلى منصور', role: 'developer', email: 'layla@dev.org' },
          { id: 'usr_103', name: 'سامي عبد الله', role: 'analyst', email: 'sami@analytics.io' }
        ]
      },
      '/api/metrics': {
        nodeVersion: 'v22.14.0',
        activeConnections: 18,
        requestsPerMinute: 840,
        averageLatencyMs: 8.4,
        errorRate: '0.00%'
      }
    };

    window.runApiCall = function(endpoint, method) {
      document.getElementById('res-endpoint').textContent = 'Endpoint: ' + endpoint + ' [' + method + ']';
      const latency = Math.floor(Math.random() * 20) + 5;
      document.getElementById('res-time').textContent = 'Latency: ' + latency + 'ms';

      if (method === 'POST') {
        const newUser = {
          success: true,
          message: 'تم إنشاء المستخدم بنجاح بواسطة المتحكم userController.js',
          createdUser: {
            id: 'usr_' + Date.now().toString().slice(-4),
            name: 'مستخدم تجريبي جديد',
            role: 'member',
            createdAt: new Date().toISOString()
          }
        };
        document.getElementById('res-status').textContent = 'HTTP 201 Created';
        document.getElementById('res-status').className = 'px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[11px] font-mono font-bold';
        document.getElementById('json-viewer').textContent = JSON.stringify(newUser, null, 2);
      } else {
        document.getElementById('res-status').textContent = 'HTTP 200 OK';
        document.getElementById('res-status').className = 'px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[11px] font-mono font-bold';
        const data = mockResponses[endpoint] || { success: true };
        document.getElementById('json-viewer').textContent = JSON.stringify(data, null, 2);
      }
    };
  </script>
</body>
</html>`
    },
    {
      path: 'src/server.js',
      content: `const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Routes
app.use('/api', apiRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err.stack);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(\`⚡ Express API Server running on port \${PORT}\`);
});`
    },
    {
      path: 'src/routes/api.js',
      content: `const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyApiKey } = require('../middleware/auth');

router.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date() });
});

router.get('/users', userController.getAllUsers);
router.post('/users', verifyApiKey, userController.createUser);
router.get('/metrics', userController.getMetrics);

module.exports = router;`
    },
    {
      path: 'src/controllers/userController.js',
      content: `// In-Memory Database Simulation
let usersDb = [
  { id: 'usr_1', name: 'طارق الشهري', role: 'admin', email: 'tariq@cloud.sa' },
  { id: 'usr_2', name: 'ليلى منصور', role: 'developer', email: 'layla@dev.org' }
];

exports.getAllUsers = (req, res) => {
  res.json({ count: usersDb.length, users: usersDb });
};

exports.createUser = (req, res) => {
  const { name, email, role } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }
  const newUser = {
    id: 'usr_' + Date.now(),
    name,
    email,
    role: role || 'user',
    createdAt: new Date()
  };
  usersDb.push(newUser);
  res.status(201).json({ success: true, user: newUser });
};

exports.getMetrics = (req, res) => {
  res.json({
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    activeUsers: usersDb.length
  });
};`
    },
    {
      path: 'src/middleware/auth.js',
      content: `exports.verifyApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  // In development, allow bypass if not strictly required
  if (!apiKey && process.env.NODE_ENV === 'production') {
    return res.status(401).json({ error: 'Unauthorized: API Key missing' });
  }
  next();
};`
    },
    {
      path: 'package.json',
      content: `{
  "name": "express-rest-api",
  "version": "1.0.0",
  "description": "Production Express REST API with Controllers, Routes, and Middleware",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  },
  "dependencies": {
    "express": "^4.21.2",
    "cors": "^2.8.5",
    "dotenv": "^17.2.3"
  }
}`
    },
    {
      path: '.env.example',
      content: `PORT=3000
NODE_ENV=development
API_SECRET_KEY=demo_key_secret_123`
    },
    {
      path: 'README.md',
      content: `# خادم Express API ومختبر REST

مشروع خلفي متكامل بنظام نمطي (Controllers, Routes, Middleware) مع واجهة توثيق وفحص تفاعلية مدمجة.`
    }
  ]
};
