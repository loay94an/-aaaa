import { CompletePreset } from './types';

export const CHAT_PRESET: CompletePreset = {
  id: 'ai-chat-app',
  name: '💬 نظام محادثة وشات ذكي',
  category: 'Communication & AI',
  icon: 'MessageSquare',
  badge: 'محادثة ورسائل فورية',
  description: 'تطبيق محادثة وشات عصري يحاكي برامج المراسلة الحديثة مع ردود ذكية تفاعلية، سجل جهات اتصال، وسرعة استجابة فائقة',
  treeText: `chat-platform/
├── css/
│   └── chat.css
├── js/
│   ├── bot.js
│   └── chat.js
├── index.html
├── contacts.json
└── README.md`,
  files: [
    {
      path: 'index.html',
      content: `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nexus Messenger — تطبيق المراسلة الذكي</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/cairo@5.0.0/400.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/cairo@5.0.0/700.css">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="css/chat.css">
</head>
<body class="bg-[#0b1120] text-[#f8fafc] font-['Cairo'] h-screen flex flex-col overflow-hidden">
  <!-- Main Chat Window Layout -->
  <div class="flex-1 flex overflow-hidden">
    <!-- Contacts Sidebar -->
    <aside class="w-full sm:w-80 bg-[#0f172a] border-l border-[#1e293b] flex flex-col justify-between hidden sm:flex">
      <!-- Search & Header -->
      <div class="p-4 border-b border-[#1e293b] space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <span class="text-2xl">🤖</span>
            <div>
              <h2 class="font-bold text-sm text-white">المحادثات</h2>
              <p class="text-[10px] text-emerald-400 font-bold">متصل الآن 🟢</p>
            </div>
          </div>
          <span class="text-xs bg-[#1e293b] text-slate-300 px-2 py-0.5 rounded-full font-mono">v2.1</span>
        </div>
        <input type="text" placeholder="بحث في جهات الاتصال..." class="w-full bg-[#0b1120] text-xs px-3 py-1.5 rounded-lg border border-slate-700 text-white outline-none focus:border-blue-500">
      </div>

      <!-- Contacts List -->
      <div class="flex-1 overflow-y-auto p-2 space-y-1" id="contacts-list">
        <div class="p-3 bg-[#1e293b] rounded-xl flex items-center gap-3 cursor-pointer border border-blue-500/30">
          <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-lg text-white font-bold">
            🤖
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex justify-between items-center">
              <h4 class="font-bold text-xs text-white truncate">المساعد الذكي Nexus</h4>
              <span class="text-[10px] text-slate-400 font-mono">الآن</span>
            </div>
            <p class="text-[11px] text-slate-400 truncate">مرحباً بك! كيف يمكنني مساعدتك اليوم؟</p>
          </div>
        </div>

        <div class="p-3 hover:bg-[#1e293b]/60 rounded-xl flex items-center gap-3 cursor-pointer transition">
          <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-lg text-white font-bold">
            👨‍💻
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex justify-between items-center">
              <h4 class="font-bold text-xs text-white truncate">فريق الدعم الفني</h4>
              <span class="text-[10px] text-slate-400 font-mono">10:45 ص</span>
            </div>
            <p class="text-[11px] text-slate-400 truncate">تذكرة الصيانة #4092 قيد المراجعة</p>
          </div>
        </div>
      </div>

      <!-- User Profile Card -->
      <div class="p-3 bg-[#0b1120] border-t border-[#1e293b] flex items-center gap-3">
        <div class="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center font-bold text-xs text-white">
          أنت
        </div>
        <div class="flex-1 text-xs">
          <div class="font-bold text-white">المطوّر الضيف</div>
          <span class="text-[10px] text-slate-400">حساب نشط</span>
        </div>
      </div>
    </aside>

    <!-- Active Chat Area -->
    <main class="flex-1 bg-[#0b1120] flex flex-col overflow-hidden">
      <!-- Chat Header -->
      <header class="p-3.5 bg-[#0f172a] border-b border-[#1e293b] flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="relative">
            <div class="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-base text-white">
              🤖
            </div>
            <span class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0f172a]"></span>
          </div>
          <div>
            <h3 class="font-bold text-xs text-white">المساعد الذكي Nexus</h3>
            <span class="text-[10px] text-emerald-400">نشط وجاهز للرد الفوري</span>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="window.clearChatHistory()" class="px-2.5 py-1 bg-[#1e293b] hover:bg-slate-800 text-slate-300 text-[11px] rounded-lg border border-slate-700 transition">
            مسح المحادثة 🗑️
          </button>
        </div>
      </header>

      <!-- Message History Container -->
      <div class="flex-1 p-4 overflow-y-auto space-y-3" id="messages-container">
        <!-- Messages injected via JS -->
      </div>

      <!-- Typing Indicator -->
      <div id="typing-indicator" class="px-5 py-1 text-xs text-slate-400 flex items-center gap-2 hidden">
        <div class="flex gap-1">
          <span class="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce"></span>
          <span class="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce [animation-delay:0.2s]"></span>
          <span class="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce [animation-delay:0.4s]"></span>
        </div>
        <span>المساعد يكتب الآن...</span>
      </div>

      <!-- Message Input Area -->
      <footer class="p-3 sm:p-4 bg-[#0f172a] border-t border-[#1e293b]">
        <!-- Quick Prompts Pills -->
        <div class="flex flex-wrap gap-1.5 mb-2.5">
          <button onclick="window.sendQuickPrompt('ما هي أحدث التقنيات في تطوير الويب؟')" class="px-2.5 py-1 rounded-full bg-[#1e293b] hover:bg-[#334155] text-slate-300 text-[10px] border border-slate-700">
            💡 أحدث تقنيات الويب
          </button>
          <button onclick="window.sendQuickPrompt('اكتب لي دالة جافاسكريبت لحساب المتوسط')" class="px-2.5 py-1 rounded-full bg-[#1e293b] hover:bg-[#334155] text-slate-300 text-[10px] border border-slate-700">
            ⚡ كود دالة جافاسكريبت
          </button>
          <button onclick="window.sendQuickPrompt('كيف يعمل Service Worker في تطبيقات PWA؟')" class="px-2.5 py-1 rounded-full bg-[#1e293b] hover:bg-[#334155] text-slate-300 text-[10px] border border-slate-700">
            📱 شرح PWA
          </button>
        </div>

        <form id="chat-form" class="flex items-center gap-2">
          <input id="message-input" type="text" placeholder="اكتب رسالتك أو سؤالك هنا..." autocomplete="off" class="flex-1 bg-[#0b1120] text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-700 text-white outline-none focus:border-blue-500 transition">
          <button type="submit" class="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5">
            <span>إرسال</span>
            <span>➤</span>
          </button>
        </form>
      </footer>
    </main>
  </div>

  <script src="js/bot.js"></script>
  <script src="js/chat.js"></script>
</body>
</html>`
    },
    {
      path: 'css/chat.css',
      content: `/* Chat Bubble Custom Styling */
.msg-bubble {
  max-width: 80%;
  animation: fadeIn 0.25s ease forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}`
    },
    {
      path: 'js/bot.js',
      content: `// Smart Bot Response Generator
window.SmartBot = {
  getReply(userText) {
    const text = userText.toLowerCase();

    if (text.includes('تقنيات') || text.includes('ويب')) {
      return 'أبرز تقنيات الويب الحديثة تشمل: Next.js 15 مع Server Components، بيئات التشغيل الفائقة مثل Vite و Bun، وتطبيقات PWA التفاعلية بدون إنترنت.';
    }
    if (text.includes('دالة') || text.includes('كود') || text.includes('جافاسكريبت')) {
      return 'إليك دالة حساب المتوسط الحسابي في JavaScript:\\n\\nconst average = arr => arr.reduce((a, b) => a + b, 0) / arr.length;\\n\\nمثال: average([10, 20, 30]) يعطي 20.';
    }
    if (text.includes('pwa') || text.includes('service worker')) {
      return 'يعمل Service Worker كبروكسي شبكة بين المتصفح والخادم، يقوم بالاعتراض على الطلبات وتخزين الملفات في الذاكرة المؤقتة (Cache API) لتمكين العمل دون إنترنت كلياً.';
    }
    if (text.includes('مرحبا') || text.includes('سلام')) {
      return 'أهلاً وسهلاً بك! أنا المساعد الذكي لنظام Nexus. يمكنك سؤالي عن البرمجة، إدارة المشاريع، أو تجربة أوامر سريعة.';
    }

    const genericReplies = [
      'هذه نقطة ممتازة! يمكننا معالجة هذا الأمر من خلال تقسيم المهام وتنظيم الشيفرة البرمجية بشكل نمطي (Modular).',
      'فكرة رائعة ومجدية تقنياً. هل ترغب في إعداد نموذج أولي لها وتطبيقه في بنية المشروع؟',
      'تم تسجيل استفسارك بنجاح. يتميز هذا النهج بمرونة عالية وتقليل معدل استهلاك الذاكرة.'
    ];
    return genericReplies[Math.floor(Math.random() * genericReplies.length)];
  }
};`
    },
    {
      path: 'js/chat.js',
      content: `// Chat View & Message Stream Controller
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('messages-container');
  const form = document.getElementById('chat-form');
  const input = document.getElementById('message-input');
  const typing = document.getElementById('typing-indicator');

  let history = [
    { sender: 'bot', text: 'مرحباً بك في Nexus Messenger! كيف يمكنني مساعدتك في مشروعك اليوم؟', time: '10:00 ص' }
  ];

  function renderMessages() {
    if (!container) return;
    container.innerHTML = history.map(m => {
      const isUser = m.sender === 'user';
      return \`
        <div class="flex \${isUser ? 'justify-start' : 'justify-end'}">
          <div class="msg-bubble p-3 rounded-2xl text-xs space-y-1 \${
            isUser ? 'bg-blue-600 text-white rounded-br-none' : 'bg-[#1e293b] text-slate-200 rounded-bl-none border border-slate-700'
          }">
            <div class="leading-relaxed whitespace-pre-wrap">\${m.text}</div>
            <div class="text-[9px] font-mono text-left opacity-70 \${isUser ? 'text-blue-200' : 'text-slate-400'}">\${m.time}</div>
          </div>
        </div>
      \`;
    }).join('');
    container.scrollTop = container.scrollHeight;
  }

  function appendMessage(sender, text) {
    const time = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
    history.push({ sender, text, time });
    renderMessages();
  }

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = input.value.trim();
    if (!val) return;

    appendMessage('user', val);
    input.value = '';

    // Show typing indicator then reply
    typing?.classList.remove('hidden');
    setTimeout(() => {
      typing?.classList.add('hidden');
      const botReply = window.SmartBot.getReply(val);
      appendMessage('bot', botReply);
    }, 700);
  });

  window.sendQuickPrompt = function(promptText) {
    if (input) {
      input.value = promptText;
      form?.dispatchEvent(new Event('submit'));
    }
  };

  window.clearChatHistory = function() {
    history = [{ sender: 'bot', text: 'تم تنظيف المحادثة. أهلاً بك من جديد!', time: 'الآن' }];
    renderMessages();
  };

  renderMessages();
});`
    },
    {
      path: 'contacts.json',
      content: `{
  "contacts": [
    { "name": "المساعد الذكي Nexus", "type": "ai_agent" },
    { "name": "فريق الدعم الفني", "type": "support" }
  ]
}`
    },
    {
      path: 'README.md',
      content: `# نظام محادثة وشات ذكي (AI Messenger)

تطبيق مراسلة فوري متكامل مع:
- تصميم محادثات أنيق يشبه برامج المراسلة العالمية.
- مولد ردود ذكي لمحاكاة استجابة الذكاء الاصطناعي.
- شريط للمقترحات السريعة (Quick Prompts).`
    }
  ]
};
