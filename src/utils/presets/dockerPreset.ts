import { CompletePreset } from './types';

export const DOCKER_PRESET: CompletePreset = {
  id: 'docker-microservices',
  name: '🐳 بيئة Docker وحاويات الميكروسيرفس',
  category: 'DevOps & Containers',
  icon: 'Boxes',
  badge: 'منظومة حاويات سحابية',
  description: 'بيئة تشغيل حاويات متكاملة بـ Docker Compose تتضمن خادم Nginx، قاعدة بيانات PostgreSQL، كاش Redis، ولوحة تحكم حية بالحاويات',
  treeText: `docker-cloud-stack/
├── nginx/
│   └── nginx.conf
├── backend/
│   ├── Dockerfile
│   └── server.js
├── database/
│   └── init.sql
├── public/
│   └── index.html
├── docker-compose.yml
├── .env.example
└── README.md`,
  files: [
    {
      path: 'public/index.html',
      content: `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Docker Swarm & Containers Manager — مراقب الحاويات السحابية</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/cairo@5.0.0/400.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/cairo@5.0.0/700.css">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#0b1120] text-[#f8fafc] font-['Cairo'] min-h-screen p-4 sm:p-8">
  <div class="max-w-5xl mx-auto space-y-6">
    <header class="p-5 bg-[#0f172a] rounded-2xl border border-[#1e293b] flex flex-wrap items-center justify-between gap-4 shadow-xl">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-500 flex items-center justify-center text-xl text-white shadow-md">
          🐳
        </div>
        <div>
          <h1 class="text-base sm:text-lg font-bold text-white">Docker Multi-Container Orchestrator</h1>
          <p class="text-xs text-slate-400">مراقبة طبولوجيا الحاويات، استهلاك الذاكرة، وسلامة خوادم الميكروسيرفس</p>
        </div>
      </div>
      <span class="px-3 py-1 bg-sky-500/10 text-sky-400 border border-sky-500/30 rounded-full text-xs font-mono">
        Compose v2.27 • 4 Services Active
      </span>
    </header>

    <!-- Services Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" id="containers-grid">
      <!-- Container 1: Nginx -->
      <div class="bg-[#0f172a] p-4 rounded-xl border border-[#1e293b] space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-white">nginx-proxy</span>
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        </div>
        <p class="text-[11px] text-slate-400">Reverse Proxy & SSL Termination</p>
        <div class="pt-2 border-t border-slate-800 text-[10px] text-slate-500 font-mono flex justify-between">
          <span>Port: 80, 443</span>
          <span class="text-emerald-400">Up 14d</span>
        </div>
      </div>

      <!-- Container 2: Node Backend -->
      <div class="bg-[#0f172a] p-4 rounded-xl border border-[#1e293b] space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-white">node-backend</span>
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        </div>
        <p class="text-[11px] text-slate-400">Node.js Express API Service</p>
        <div class="pt-2 border-t border-slate-800 text-[10px] text-slate-500 font-mono flex justify-between">
          <span>Port: 3000</span>
          <span class="text-emerald-400">Up 14d</span>
        </div>
      </div>

      <!-- Container 3: Postgres -->
      <div class="bg-[#0f172a] p-4 rounded-xl border border-[#1e293b] space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-white">postgres-db</span>
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        </div>
        <p class="text-[11px] text-slate-400">PostgreSQL 16 Relational Storage</p>
        <div class="pt-2 border-t border-slate-800 text-[10px] text-slate-500 font-mono flex justify-between">
          <span>Port: 5432</span>
          <span class="text-emerald-400">Up 14d</span>
        </div>
      </div>

      <!-- Container 4: Redis -->
      <div class="bg-[#0f172a] p-4 rounded-xl border border-[#1e293b] space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-white">redis-cache</span>
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        </div>
        <p class="text-[11px] text-slate-400">Redis In-Memory Session Store</p>
        <div class="pt-2 border-t border-slate-800 text-[10px] text-slate-500 font-mono flex justify-between">
          <span>Port: 6379</span>
          <span class="text-emerald-400">Up 14d</span>
        </div>
      </div>
    </div>

    <!-- Live Docker Terminal Simulator -->
    <div class="bg-[#0f172a] rounded-2xl border border-[#1e293b] p-5 space-y-3">
      <div class="flex items-center justify-between pb-3 border-b border-[#1e293b]">
        <h3 class="font-bold text-sm text-white flex items-center gap-2">
          <span>💻</span><span>أمر تشغيل الحاويات (Docker Compose CLI)</span>
        </h3>
        <button onclick="window.restartStack()" class="px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-lg transition shadow">
          إعادة تشغيل الحاويات (Restart) 🔄
        </button>
      </div>

      <pre id="docker-logs" class="bg-[#0b1120] p-4 rounded-xl border border-slate-800 text-sky-400 font-mono text-xs overflow-x-auto min-h-[160px] leading-relaxed">
[+] Running 4/4
 ✔ Network docker-cloud-stack_default  Created
 ✔ Container nginx-proxy               Started
 ✔ Container node-backend              Started
 ✔ Container postgres-db               Healthy
 ✔ Container redis-cache               Healthy
Attaching to nginx-proxy, node-backend, postgres-db, redis-cache...
[node-backend] Ready on port 3000
[postgres-db]  database system is ready to accept connections
      </pre>
    </div>
  </div>

  <script>
    window.restartStack = function() {
      const logs = document.getElementById('docker-logs');
      logs.textContent = 'Stopping containers...\n[+] Stopping 4/4\n✔ Stopping nginx-proxy\n✔ Stopping node-backend\nRestarting stack with zero-downtime rolling update...\n✔ All services healthy.';
      setTimeout(() => {
        logs.textContent = \`[+] Running 4/4\\n ✔ Container nginx-proxy   Started\\n ✔ Container node-backend  Started\\n ✔ Container postgres-db   Healthy\\n ✔ Container redis-cache   Healthy\\nReady on port 3000\`;
      }, 1000);
    };
  </script>
</body>
</html>`
    },
    {
      path: 'docker-compose.yml',
      content: `version: '3.8'

services:
  nginx:
    image: nginx:alpine
    container_name: nginx-proxy
    ports:
      - "80:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - backend

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: node-backend
    environment:
      - PORT=3000
      - DATABASE_URL=postgresql://user:secret@database:5432/maindb
      - REDIS_HOST=redis
    depends_on:
      - database
      - redis

  database:
    image: postgres:16-alpine
    container_name: postgres-db
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: maindb
    volumes:
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    container_name: redis-cache
    ports:
      - "6379:6379"

volumes:
  pgdata:`
    },
    {
      path: 'nginx/nginx.conf',
      content: `events { worker_connections 1024; }

http {
  upstream api_servers {
    server backend:3000;
  }

  server {
    listen 80;
    server_name localhost;

    location / {
      proxy_pass http://api_servers;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
    }
  }
}`
    },
    {
      path: 'backend/Dockerfile',
      content: `FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]`
    },
    {
      path: 'backend/server.js',
      content: `const http = require('http');
const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    status: 'online',
    container: process.env.HOSTNAME || 'docker-node',
    uptime: process.uptime()
  }));
});

server.listen(PORT, () => {
  console.log(\`Docker Backend Service running on port \${PORT}\`);
});`
    },
    {
      path: 'database/init.sql',
      content: `CREATE TABLE IF NOT EXISTS system_logs (
  id SERIAL PRIMARY KEY,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO system_logs (message) VALUES ('Container initialized successfully');`
    },
    {
      path: '.env.example',
      content: `POSTGRES_USER=user
POSTGRES_PASSWORD=secret
POSTGRES_DB=maindb
REDIS_PORT=6379`
    },
    {
      path: 'README.md',
      content: `# بيئة Docker وحاويات الميكروسيرفس

منظومة Docker Compose متكاملة تضم خادم ويب Nginx، تطبيق Node.js، قاعدة بيانات PostgreSQL، وكاش Redis.`
    }
  ]
};
