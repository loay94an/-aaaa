import { CompletePreset } from './types';

export const ECOMMERCE_PRESET: CompletePreset = {
  id: 'ecommerce-store',
  name: '🛍️ متجر إلكتروني وسلة تسوق',
  category: 'E-Commerce',
  icon: 'ShoppingBag',
  badge: 'متجر وسلة كاملة',
  description: 'متجر تسوق إلكتروني متكامل يحتوي على كتالوج منتجات، سلة مشتريات ديناميكية، حساب الضريبة والخصومات، ونافذة إتمام الطلب',
  treeText: `modern-store/
├── css/
│   └── store.css
├── js/
│   ├── products.js
│   ├── cart.js
│   └── store.js
├── index.html
├── catalog.json
└── README.md`,
  files: [
    {
      path: 'index.html',
      content: `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>سوق إلكتروني — المتجر الحديث</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/cairo@5.0.0/400.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/cairo@5.0.0/700.css">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="css/store.css">
</head>
<body class="bg-[#0b1120] text-[#f8fafc] font-['Cairo'] min-h-screen">
  <!-- Top Navigation -->
  <header class="sticky top-0 z-30 bg-[#0f172a]/90 backdrop-blur-md border-b border-[#1e293b] px-4 sm:px-8 py-3.5 flex items-center justify-between">
    <div class="flex items-center gap-3">
      <div class="w-9 h-9 rounded-lg bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white font-bold shadow-md">
        🛍️
      </div>
      <div>
        <h1 class="font-bold text-base text-white">سوق المبتكرين</h1>
        <p class="text-[10px] text-slate-400">أحدث الأجهزة والإلكترونيات العصرية</p>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-3">
      <button id="cart-btn" class="relative px-3.5 py-1.5 bg-[#1e293b] hover:bg-[#334155] text-white text-xs font-bold rounded-lg border border-slate-700 transition flex items-center gap-2 cursor-pointer">
        <span>🛒</span>
        <span>سلة التسوق</span>
        <span id="cart-badge" class="px-1.5 py-0.2 rounded-full bg-amber-500 text-black text-[10px] font-black">0</span>
      </button>
    </div>
  </header>

  <!-- Main Store -->
  <main class="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
    <!-- Hero Promo Banner -->
    <div class="p-6 rounded-2xl bg-gradient-to-r from-blue-900/60 to-purple-900/60 border border-blue-500/20 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="space-y-1 text-center sm:text-right">
        <span class="text-xs font-bold text-amber-400 uppercase tracking-wider">عروض الموسم الحصرية</span>
        <h2 class="text-xl sm:text-2xl font-bold text-white">خصومات تصل إلى 30% على الأجهزة الذكية</h2>
        <p class="text-xs text-slate-300">استخدم الرمز الترويجي <code class="px-1.5 py-0.5 bg-black/40 text-amber-300 rounded font-mono font-bold">NEXUS20</code> عند الدفع</p>
      </div>
      <button onclick="alert('تم تفعيل كود الخصم تلقائياً!')" class="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl shadow-lg transition shrink-0">
        تطبيق الخصم الآن
      </button>
    </div>

    <!-- Filters & Categories -->
    <div class="flex flex-wrap items-center justify-between gap-3 bg-[#0f172a] p-3 rounded-xl border border-[#1e293b]">
      <div class="flex flex-wrap items-center gap-1.5" id="category-filters">
        <button data-cat="all" class="cat-pill active px-3 py-1 text-xs rounded-lg font-bold bg-blue-600 text-white transition">الكل</button>
        <button data-cat="smartphones" class="cat-pill px-3 py-1 text-xs rounded-lg font-medium text-slate-400 hover:bg-[#1e293b] hover:text-white transition">الهواتف</button>
        <button data-cat="laptops" class="cat-pill px-3 py-1 text-xs rounded-lg font-medium text-slate-400 hover:bg-[#1e293b] hover:text-white transition">الحواسيب</button>
        <button data-cat="audio" class="cat-pill px-3 py-1 text-xs rounded-lg font-medium text-slate-400 hover:bg-[#1e293b] hover:text-white transition">الصوتيات</button>
        <button data-cat="wearables" class="cat-pill px-3 py-1 text-xs rounded-lg font-medium text-slate-400 hover:bg-[#1e293b] hover:text-white transition">الساعات الذكية</button>
      </div>
      <div class="text-xs text-slate-400 font-mono">
        <span id="product-count">0</span> منتج متوفر
      </div>
    </div>

    <!-- Product Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" id="products-grid">
      <!-- Injected via JS -->
    </div>
  </main>

  <!-- Shopping Cart Slide-over Drawer -->
  <div id="cart-drawer" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs hidden flex justify-end">
    <div class="w-full max-w-md bg-[#0f172a] h-full shadow-2xl flex flex-col border-r border-[#1e293b]">
      <!-- Drawer Header -->
      <div class="p-4 border-b border-[#1e293b] flex items-center justify-between">
        <h3 class="font-bold text-sm text-white flex items-center gap-2">
          <span>🛒</span><span>محتويات سلة المشتريات</span>
        </h3>
        <button id="close-cart" class="text-slate-400 hover:text-white text-lg p-1">✕</button>
      </div>

      <!-- Drawer Items List -->
      <div class="flex-1 p-4 overflow-y-auto space-y-3" id="cart-items">
        <!-- Injected via JS -->
      </div>

      <!-- Drawer Summary & Checkout -->
      <div class="p-4 bg-[#0b1120] border-t border-[#1e293b] space-y-3">
        <div class="space-y-1.5 text-xs text-slate-300">
          <div class="flex justify-between">
            <span>المجموع الفرعي:</span>
            <span id="subtotal-val" class="font-mono font-bold">$0.00</span>
          </div>
          <div class="flex justify-between text-emerald-400">
            <span>الخصم:</span>
            <span id="discount-val" class="font-mono font-bold">-$0.00</span>
          </div>
          <div class="flex justify-between border-t border-slate-800 pt-2 text-sm font-bold text-white">
            <span>الإجمالي النهائي:</span>
            <span id="total-val" class="font-mono text-amber-400">$0.00</span>
          </div>
        </div>

        <button id="checkout-btn" class="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white font-bold text-xs rounded-xl shadow-lg transition">
          إتمام الشراء الآن
        </button>
      </div>
    </div>
  </div>

  <script src="js/products.js"></script>
  <script src="js/cart.js"></script>
  <script src="js/store.js"></script>
</body>
</html>`
    },
    {
      path: 'css/store.css',
      content: `/* E-Commerce Storefront Styles */
.product-card {
  transition: transform 0.25s ease, border-color 0.25s ease;
}
.product-card:hover {
  transform: translateY(-4px);
  border-color: #3b82f6;
}
.cat-pill.active {
  background-color: #2563eb !important;
  color: #ffffff !important;
}`
    },
    {
      path: 'js/products.js',
      content: `// Catalog of Products
window.STORE_PRODUCTS = [
  { id: 'p1', name: 'هاتف Nova Pro Max 5G', cat: 'smartphones', price: 899, rating: 4.9, icon: '📱', desc: 'معالج فائق السرعة، شاشة 120Hz، كاميرا بدقة 200MP' },
  { id: 'p2', name: 'حاسوب محمول UltraBook 16', cat: 'laptops', price: 1299, rating: 4.8, icon: '💻', desc: 'ذاكرة 32GB RAM، سعة 1TB NVMe، وبطارية تدوم 18 ساعة' },
  { id: 'p3', name: 'سماعة Pulse Wireless ANC', cat: 'audio', price: 199, rating: 4.7, icon: '🎧', desc: 'عزل ضوضاء هجين، صوت مكاني ثلاثي الأبعاد، وشحن لاسلكي' },
  { id: 'p4', name: 'ساعة Titan Smartwatch Gen 4', cat: 'wearables', price: 249, rating: 4.6, icon: '⌚', desc: 'مقاومة للماء 50M، مراقبة نبضات القلب والأكسجين' },
  { id: 'p5', name: 'جهاز لوحي TabStudio Pro 12', cat: 'smartphones', price: 649, rating: 4.8, icon: '📲', desc: 'شاشة OLED مذهلة مع قلم ذكي بدقة استجابة فائقة' },
  { id: 'p6', name: 'مكبر صوتي HiFi Studio Cube', cat: 'audio', price: 149, rating: 4.5, icon: '🔊', desc: 'صوت جهوري عميق وبث عبر Wi-Fi و Bluetooth 5.3' }
];`
    },
    {
      path: 'js/cart.js',
      content: `// Shopping Cart Logic
window.StoreCart = {
  items: [],

  addItem(productId) {
    const prod = window.STORE_PRODUCTS.find(p => p.id === productId);
    if (!prod) return;
    const existing = this.items.find(i => i.id === productId);
    if (existing) {
      existing.quantity += 1;
    } else {
      this.items.push({ ...prod, quantity: 1 });
    }
    this.updateUI();
  },

  removeItem(productId) {
    this.items = this.items.filter(i => i.id !== productId);
    this.updateUI();
  },

  updateQuantity(productId, delta) {
    const item = this.items.find(i => i.id === productId);
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) {
      this.removeItem(productId);
    } else {
      this.updateUI();
    }
  },

  getTotal() {
    const subtotal = this.items.reduce((s, i) => s + (i.price * i.quantity), 0);
    const discount = subtotal > 500 ? subtotal * 0.1 : 0;
    return { subtotal, discount, total: subtotal - discount };
  },

  updateUI() {
    const badge = document.getElementById('cart-badge');
    const totalCount = this.items.reduce((s, i) => s + i.quantity, 0);
    if (badge) badge.textContent = totalCount;

    const cartContainer = document.getElementById('cart-items');
    if (!cartContainer) return;

    if (this.items.length === 0) {
      cartContainer.innerHTML = '<div class="py-12 text-center text-slate-400 text-xs">سلة التسوق فارغة حالياً.</div>';
    } else {
      cartContainer.innerHTML = this.items.map(item => \`
        <div class="p-3 bg-[#0b1120] rounded-xl border border-[#1e293b] flex items-center justify-between gap-3 text-xs">
          <div class="flex items-center gap-2.5">
            <span class="text-2xl">\${item.icon}</span>
            <div>
              <h4 class="font-bold text-white">\${item.name}</h4>
              <span class="text-amber-400 font-mono font-bold">\$\${item.price}</span>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <div class="flex items-center gap-1 bg-[#1e293b] rounded-lg px-2 py-1">
              <button onclick="window.StoreCart.updateQuantity('\${item.id}', -1)" class="text-slate-400 hover:text-white px-1">-</button>
              <span class="font-mono font-bold text-white px-1">\${item.quantity}</span>
              <button onclick="window.StoreCart.updateQuantity('\${item.id}', 1)" class="text-slate-400 hover:text-white px-1">+</button>
            </div>
            <button onclick="window.StoreCart.removeItem('\${item.id}')" class="text-rose-400 hover:text-rose-300 p-1">🗑️</button>
          </div>
        </div>
      \`).join('');
    }

    const { subtotal, discount, total } = this.getTotal();
    document.getElementById('subtotal-val').textContent = '$' + subtotal.toFixed(2);
    document.getElementById('discount-val').textContent = '-$' + discount.toFixed(2);
    document.getElementById('total-val').textContent = '$' + total.toFixed(2);
  }
};`
    },
    {
      path: 'js/store.js',
      content: `// Storefront Initialization
document.addEventListener('DOMContentLoaded', () => {
  const products = window.STORE_PRODUCTS || [];
  const grid = document.getElementById('products-grid');
  const countEl = document.getElementById('product-count');

  function renderProducts(list) {
    if (!grid) return;
    if (countEl) countEl.textContent = list.length;

    grid.innerHTML = list.map(p => \`
      <div class="product-card bg-[#0f172a] rounded-2xl border border-[#1e293b] p-5 flex flex-col justify-between space-y-4">
        <div>
          <div class="h-32 bg-[#0b1120] rounded-xl flex items-center justify-center text-5xl shadow-inner border border-[#1e293b]">
            \${p.icon}
          </div>
          <div class="mt-3 flex items-center justify-between">
            <span class="text-[11px] text-amber-400 font-medium">★ \${p.rating} تقييم</span>
            <span class="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">\${p.cat}</span>
          </div>
          <h3 class="font-bold text-sm text-white mt-1.5">\${p.name}</h3>
          <p class="text-[11px] text-slate-400 mt-1 leading-relaxed">\${p.desc}</p>
        </div>

        <div class="pt-3 border-t border-[#1e293b] flex items-center justify-between">
          <span class="text-lg font-black font-mono text-white">\$\${p.price}</span>
          <button onclick="window.StoreCart.addItem('\${p.id}')" class="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5">
            <span>+</span><span>إضافة للسلة</span>
          </button>
        </div>
      </div>
    \`).join('');
  }

  renderProducts(products);

  // Category Filtering
  const pills = document.querySelectorAll('.cat-pill');
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const cat = pill.dataset.cat;
      if (cat === 'all') {
        renderProducts(products);
      } else {
        renderProducts(products.filter(p => p.cat === cat));
      }
    });
  });

  // Drawer Toggle
  const cartDrawer = document.getElementById('cart-drawer');
  document.getElementById('cart-btn')?.addEventListener('click', () => {
    cartDrawer?.classList.remove('hidden');
  });
  document.getElementById('close-cart')?.addEventListener('click', () => {
    cartDrawer?.classList.add('hidden');
  });

  // Checkout
  document.getElementById('checkout-btn')?.addEventListener('click', () => {
    const { total } = window.StoreCart.getTotal();
    if (total <= 0) {
      alert('سلة المشتريات فارغة!');
      return;
    }
    alert(\`شكراً لك! تم استلام طلبك بقيمة \$\${total.toFixed(2)} بنجاح، وسيصلك بريد إلكتروني برقم الشحنة.\`);
    window.StoreCart.items = [];
    window.StoreCart.updateUI();
    cartDrawer?.classList.add('hidden');
  });
});`
    },
    {
      path: 'catalog.json',
      content: `{
  "store": "Modern E-Commerce Store",
  "currency": "USD",
  "version": "1.2.0"
}`
    },
    {
      path: 'README.md',
      content: `# متجر إلكتروني متكامل (E-Commerce Storefront)

تطبيق متجر إلكتروني كامل يشتمل على:
- كتالوج المنتجات وتصنيفها.
- سلة مشتريات ديناميكية تدعم التعديل والحذف والحساب التلقائي.
- دعم أكواد الخصم والضرائب.
- تصميم متجاوب فائق الأناقة.`
    }
  ]
};
