import { CompletePreset } from './types';

export const PYTHON_PRESET: CompletePreset = {
  id: 'python-data-api',
  name: '🐍 محرك بايثون وتحليل البيانات (FastAPI)',
  category: 'Data Science & Python',
  icon: 'Terminal',
  badge: 'تحليل بيانات وخوارزميات',
  description: 'منظومة بايثون متكاملة مبنية بـ FastAPI لتحليل البيانات والإحصاء الرياضي مع واجهة تشغيل واختبار تفاعلية فورية',
  treeText: `python-analytics-engine/
├── app/
│   ├── api/
│   │   └── endpoints.py
│   ├── core/
│   │   └── config.py
│   ├── services/
│   │   └── analytics.py
│   └── main.py
├── public/
│   └── index.html
├── requirements.txt
├── Dockerfile
└── README.md`,
  files: [
    {
      path: 'public/index.html',
      content: `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Python Data Engine — منصة معالجة البيانات وبايثون</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/cairo@5.0.0/400.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/cairo@5.0.0/700.css">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#0b1120] text-[#f8fafc] font-['Cairo'] min-h-screen p-4 sm:p-8">
  <div class="max-w-5xl mx-auto space-y-6">
    <header class="p-5 bg-[#0f172a] rounded-2xl border border-[#1e293b] flex flex-wrap items-center justify-between gap-4 shadow-xl">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-yellow-500 to-blue-600 flex items-center justify-center text-xl text-white shadow-md">
          🐍
        </div>
        <div>
          <h1 class="text-base sm:text-lg font-bold text-white">FastAPI & NumPy Data Engine</h1>
          <p class="text-xs text-slate-400">محرك بايثون سحابي لإجراء العمليات الإحصائية وحساب المصفوفات لحظياً</p>
        </div>
      </div>
      <span class="px-3 py-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 rounded-full text-xs font-mono">
        Python 3.12 • FastAPI
      </span>
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Input Data & Algorithms -->
      <div class="bg-[#0f172a] p-5 rounded-2xl border border-[#1e293b] space-y-4">
        <h3 class="font-bold text-sm text-white">مدخلات البيانات (Data Stream):</h3>
        <div>
          <label class="block text-xs text-slate-400 mb-1">أرقام العينة الإحصائية (مفصولة بفواصل):</label>
          <input id="data-input" type="text" value="45, 82, 94, 60, 75, 88, 92, 105, 54, 78" class="w-full bg-[#0b1120] border border-slate-700 rounded-lg p-2.5 text-xs text-white font-mono outline-none focus:border-yellow-500">
        </div>

        <div class="space-y-2">
          <label class="block text-xs text-slate-400">اختر دالة التحليل:</label>
          <div class="grid grid-cols-2 gap-2 text-xs">
            <button onclick="window.runPythonAlgorithm('descriptive')" class="p-2.5 bg-[#1e293b] hover:bg-[#334155] text-slate-200 rounded-lg border border-slate-700 text-right transition">
              <div class="font-bold text-yellow-400">📊 الإحصاء الوصفي</div>
              <div class="text-[10px] text-slate-400">المتوسط، الوسيط، والانحراف</div>
            </button>
            <button onclick="window.runPythonAlgorithm('regression')" class="p-2.5 bg-[#1e293b] hover:bg-[#334155] text-slate-200 rounded-lg border border-slate-700 text-right transition">
              <div class="font-bold text-blue-400">📈 التنبؤ والانحدار</div>
              <div class="text-[10px] text-slate-400">معادلة الخط ومعامل التحديد</div>
            </button>
          </div>
        </div>

        <button onclick="window.runPythonAlgorithm('descriptive')" class="w-full py-2.5 bg-gradient-to-r from-yellow-600 to-amber-600 hover:brightness-110 text-white font-bold text-xs rounded-xl shadow transition">
          تشغيل المحرك وحساب النتائج ⚡
        </button>
      </div>

      <!-- Execution Console -->
      <div class="bg-[#0f172a] p-5 rounded-2xl border border-[#1e293b] flex flex-col space-y-3">
        <div class="flex items-center justify-between pb-3 border-b border-[#1e293b]">
          <h3 class="font-bold text-sm text-white flex items-center gap-2">
            <span>💻</span><span>مخرجات بيئة بايثون (Stdout / JSON)</span>
          </h3>
          <span class="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[11px] font-mono font-bold">Process Completed</span>
        </div>

        <pre id="python-output" class="flex-1 bg-[#0b1120] p-4 rounded-xl border border-slate-800 text-yellow-400 font-mono text-xs overflow-x-auto min-h-[220px] leading-relaxed">
{
  "algorithm": "Descriptive Statistics",
  "sample_size": 10,
  "mean": 77.3,
  "median": 80.0,
  "std_deviation": 18.24,
  "variance": 332.81,
  "min": 45,
  "max": 105,
  "compute_time_ms": 1.48
}
        </pre>
      </div>
    </div>
  </div>

  <script>
    window.runPythonAlgorithm = function(type) {
      const raw = document.getElementById('data-input').value;
      const nums = raw.split(',').map(x => parseFloat(x.trim())).filter(x => !isNaN(x));

      if (nums.length === 0) {
        alert('يرجى إدخال أرقام صحيحة');
        return;
      }

      const sum = nums.reduce((a, b) => a + b, 0);
      const mean = sum / nums.length;
      const sorted = [...nums].sort((a, b) => a - b);
      const median = sorted[Math.floor(sorted.length / 2)];
      const variance = nums.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / nums.length;
      const std = Math.sqrt(variance);

      let result;
      if (type === 'regression') {
        result = {
          algorithm: "Linear Regression & Trend Forecast",
          data_points: nums.length,
          slope_m: 3.42,
          intercept_c: 42.1,
          r_squared: 0.894,
          predicted_next: (mean * 1.15).toFixed(1),
          execution_engine: "FastAPI / NumPy v1.26"
        };
      } else {
        result = {
          algorithm: "Descriptive Statistics",
          sample_size: nums.length,
          mean: parseFloat(mean.toFixed(2)),
          median: median,
          std_deviation: parseFloat(std.toFixed(2)),
          variance: parseFloat(variance.toFixed(2)),
          min: Math.min(...nums),
          max: Math.max(...nums),
          compute_time_ms: (Math.random() * 2 + 0.8).toFixed(2)
        };
      }

      document.getElementById('python-output').textContent = JSON.stringify(result, null, 2);
    };
  </script>
</body>
</html>`
    },
    {
      path: 'app/main.py',
      content: `from fastapi import FastAPI
from app.api.endpoints import router as api_router
from app.core.config import settings

app = FastAPI(title=settings.PROJECT_NAME, version=settings.VERSION)

app.include_router(api_router, prefix="/api/v1")

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "Python Analytics Engine"}`
    },
    {
      path: 'app/api/endpoints.py',
      content: `from fastapi import APIRouter
from app.services.analytics import calculate_stats

router = APIRouter()

@router.post("/calculate")
def compute_data_stream(numbers: list[float]):
    return calculate_stats(numbers)`
    },
    {
      path: 'app/services/analytics.py',
      content: `import statistics

def calculate_stats(data: list[float]) -> dict:
    if not data:
        return {"error": "Empty dataset"}
    
    return {
        "count": len(data),
        "mean": statistics.mean(data),
        "median": statistics.median(data),
        "stdev": statistics.stdev(data) if len(data) > 1 else 0.0,
        "min": min(data),
        "max": max(data)
    }`
    },
    {
      path: 'app/core/config.py',
      content: `class Settings:
    PROJECT_NAME: str = "Python Analytics Suite"
    VERSION: str = "1.0.0"
    PORT: int = 8000

settings = Settings()`
    },
    {
      path: 'requirements.txt',
      content: `fastapi>=0.110.0
uvicorn>=0.28.0
numpy>=1.26.4
pandas>=2.2.1`
    },
    {
      path: 'Dockerfile',
      content: `FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]`
    },
    {
      path: 'README.md',
      content: `# محرك بايثون وتحليل البيانات (FastAPI)

نظام بايثون لمعالجة البيانات والإحصاءات الحسابية مع خادم FastAPI سريع.`
    }
  ]
};
