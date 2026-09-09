/**
 * قالب صفحة HTML المتكاملة والمستقلة
 * تطبيق ويب تفاعلي كامل يمكن تشغيله ومعاينته بمفرده داخل إطار المعاينة
 */
export const DEFAULT_HTML_APP_TEMPLATE = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<meta name="theme-color" content="#0A0E1A">
<title>ProjectBuilder Nucleus — منصة التطوير المتكاملة</title>

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/cairo@5.0.0/400.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/cairo@5.0.0/600.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/cairo@5.0.0/700.css">
<script src="https://cdn.tailwindcss.com"></script>

<style>
:root {
  --bg-base: #0A0E1A;
  --bg-elevated: #111827;
  --primary: #6366F1;
  --primary-light: #818CF8;
  --emerald: #10B981;
  --amber: #F59E0B;
  --rose: #F43F5E;
}
body {
  font-family: 'Cairo', system-ui, sans-serif;
  background: var(--bg-base);
  color: #F1F5F9;
  min-height: 100vh;
}
</style>
</head>
<body class="p-4 sm:p-6 antialiased">
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Header -->
    <header class="flex flex-wrap items-center justify-between gap-4 p-4 bg-[#111827]/80 backdrop-blur rounded-2xl border border-white/10 shadow-xl">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-pink-500 flex items-center justify-center text-xl shadow-lg">
          ⚡
        </div>
        <div>
          <h1 class="text-lg font-bold text-white">ProjectBuilder Nucleus</h1>
          <p class="text-xs text-slate-400">تطبيق HTML مستقل — جاهز للمعاينة والتشغيل الفوري</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          نشط ويعمل
        </span>
      </div>
    </header>

    <!-- Interactive Dashboard Card -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="p-5 bg-[#111827] rounded-xl border border-white/10 shadow-md flex flex-col justify-between">
        <div>
          <span class="text-xs font-semibold text-indigo-400 uppercase tracking-wider">الواجهة الأمامية</span>
          <h2 class="text-xl font-bold text-white mt-1">تطبيق HTML5 متكامل</h2>
          <p class="text-xs text-slate-400 mt-2 leading-relaxed">
            ملف قائم بذاته يحتوي على البنية، التنسيقات Tailwind، وسكربتات تفاعلية فورية.
          </p>
        </div>
        <div class="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
          <span>الحالة:</span>
          <span class="text-emerald-400 font-mono">جاهز للمعاينة 100%</span>
        </div>
      </div>

      <div class="p-5 bg-[#111827] rounded-xl border border-white/10 shadow-md flex flex-col justify-between">
        <div>
          <span class="text-xs font-semibold text-pink-400 uppercase tracking-wider">التفاعل والذاكرة</span>
          <h2 class="text-xl font-bold text-white mt-1">عداد التفاعل المباشر</h2>
          <div class="mt-3 flex items-center gap-3">
            <button id="btn-click" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-bold rounded-lg transition shadow">
              اضغط للتفاعل
            </button>
            <span id="click-count" class="text-sm font-mono font-bold text-indigo-300">0 نقرات</span>
          </div>
        </div>
        <div class="mt-4 pt-3 border-t border-white/10 text-[11px] text-slate-400">
          يستجيب للأحداث بدون أي خادم خارجي
        </div>
      </div>

      <div class="p-5 bg-[#111827] rounded-xl border border-white/10 shadow-md flex flex-col justify-between">
        <div>
          <span class="text-xs font-semibold text-amber-400 uppercase tracking-wider">سجل الأحداث</span>
          <h2 class="text-xl font-bold text-white mt-1">Live Console</h2>
          <div id="mini-log" class="mt-2 p-2 bg-[#0A0E1A] rounded text-[11px] font-mono text-slate-300 max-h-24 overflow-y-auto space-y-1">
            <div class="text-emerald-400">● تم إقلاع الصفحة بنجاح</div>
          </div>
        </div>
        <button id="btn-add-log" class="mt-3 w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded border border-white/10 transition">
          تسجيل حدث تجريبي
        </button>
      </div>
    </div>

    <!-- Live Preview Sandbox Display -->
    <div class="p-6 bg-[#111827] rounded-2xl border border-white/10 shadow-xl space-y-4">
      <div class="flex items-center justify-between border-b border-white/10 pb-3">
        <h3 class="text-base font-bold text-white flex items-center gap-2">
          <span>🚀</span>
          <span>منطقة العمل التفاعلية</span>
        </h3>
        <span class="text-xs text-slate-400 font-mono">index.html standalone</span>
      </div>
      
      <div class="space-y-3">
        <label class="block text-xs font-medium text-slate-300">جرّب كتابة نص فوري للمعاينة:</label>
        <div class="flex gap-2">
          <input id="live-input" type="text" placeholder="اكتب أي نص هنا..." class="flex-1 bg-[#0A0E1A] border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-indigo-500">
          <button id="btn-show-alert" class="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold rounded-lg transition">
            عرض تنبيه
          </button>
        </div>
        <div id="live-output" class="p-4 bg-[#0A0E1A] rounded-lg border border-dashed border-white/20 text-xs text-slate-300 min-h-[60px] flex items-center justify-center text-center">
          النص المكتوب سيظهر هنا بتحديث فوري...
        </div>
      </div>
    </div>
  </div>

  <script>
    let clicks = 0;
    const clickBtn = document.getElementById('btn-click');
    const clickCount = document.getElementById('click-count');
    const miniLog = document.getElementById('mini-log');
    const addLogBtn = document.getElementById('btn-add-log');
    const liveInput = document.getElementById('live-input');
    const liveOutput = document.getElementById('live-output');
    const showAlertBtn = document.getElementById('btn-show-alert');

    function appendLog(msg, color = 'text-slate-300') {
      const time = new Date().toLocaleTimeString('ar-SA');
      const div = document.createElement('div');
      div.className = color;
      div.textContent = \`[\${time}] \${msg}\`;
      miniLog.appendChild(div);
      miniLog.scrollTop = miniLog.scrollHeight;
    }

    if (clickBtn && clickCount) {
      clickBtn.addEventListener('click', () => {
        clicks++;
        clickCount.textContent = clicks + ' نقرات';
        appendLog('تم النقر على زر العداد: ' + clicks, 'text-indigo-300');
      });
    }

    if (addLogBtn) {
      addLogBtn.addEventListener('click', () => {
        appendLog('حدث تجريبي جديد تم إطلاقه!', 'text-amber-300');
      });
    }

    if (liveInput && liveOutput) {
      liveInput.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        liveOutput.textContent = val ? 'المعاينة المباشرة: ' + val : 'النص المكتوب سيظهر هنا بتحديث فوري...';
      });
    }

    if (showAlertBtn) {
      showAlertBtn.addEventListener('click', () => {
        const text = liveInput?.value || 'مرحباً بك! تطبيق الـ HTML يعمل بنجاح وبشكل مستقل.';
        appendLog('إطلاق تنبيه للمستخدم: ' + text, 'text-pink-300');
        alert(text);
      });
    }

    console.log('ProjectBuilder Nucleus HTML App Initialized.');
  </script>
</body>
</html>`;
