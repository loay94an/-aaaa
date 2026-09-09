import { FileNode, PWAConfig } from '../types';
import { addNode, findNodeByPath, generateUniqueId, getAllFiles, updateNodeContent } from './treeParser';

export interface InferredProjectMeta {
  inferredName: string;
  inferredShortName: string;
  inferredDescription: string;
  inferredThemeColor: string;
  inferredBackgroundColor: string;
  iconFound: boolean;
  iconSource?: string;
  iconType: 'svg' | 'image' | 'generated';
  iconPreviewContent: string;
}

export interface PWAComplianceReport {
  hasManifest: boolean;
  hasServiceWorker: boolean;
  hasIcons192: boolean;
  hasIcons512: boolean;
  hasMetaThemeColor: boolean;
  hasAppleTouchIcon: boolean;
  hasSwRegistration: boolean;
  score: number; // 0 - 100
  status: 'compliant' | 'partial' | 'unconverted';
}

/**
 * Infers icon and PWA metadata from the loaded project files.
 */
export function inferProjectIconsAndMeta(nodes: FileNode[]): InferredProjectMeta {
  const allFiles = getAllFiles(nodes);

  let inferredName = 'مشروعي PWA';
  let inferredShortName = 'تطبيقي';
  let inferredDescription = 'تطبيق ويب تقدمي قابل للتثبيت ويعمل دون اتصال بالإنترنت';
  let inferredThemeColor = '#3b82f6';
  let inferredBackgroundColor = '#0f172a';
  let iconFound = false;
  let iconSource: string | undefined = undefined;
  let iconType: InferredProjectMeta['iconType'] = 'generated';
  let iconPreviewContent = '';

  // 1. Check index.html for title, theme-color, description, and icons
  const htmlFile = allFiles.find(f => f.name.toLowerCase() === 'index.html') || 
                   allFiles.find(f => f.name.toLowerCase().endsWith('.html'));

  if (htmlFile && htmlFile.content) {
    const titleMatch = htmlFile.content.match(/<title>([^<]+)<\/title>/i);
    if (titleMatch && titleMatch[1].trim()) {
      inferredName = titleMatch[1].trim().split('—')[0].split('-')[0].trim();
      inferredShortName = inferredName.substring(0, 12);
    }

    const descMatch = htmlFile.content.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    if (descMatch && descMatch[1].trim()) {
      inferredDescription = descMatch[1].trim();
    }

    const themeMatch = htmlFile.content.match(/<meta[^>]*name=["']theme-color["'][^>]*content=["']([^"']+)["']/i);
    if (themeMatch && themeMatch[1].trim()) {
      inferredThemeColor = themeMatch[1].trim();
    }
  }

  // 2. Check package.json if available
  const pkgFile = allFiles.find(f => f.name.toLowerCase() === 'package.json');
  if (pkgFile && pkgFile.content) {
    try {
      const parsed = JSON.parse(pkgFile.content);
      if (parsed.name && (!inferredName || inferredName === 'مشروعي PWA')) {
        inferredName = parsed.name.replace(/[-_]/g, ' ');
        inferredShortName = parsed.name.substring(0, 12);
      }
      if (parsed.description) {
        inferredDescription = parsed.description;
      }
    } catch (e) {}
  }

  // 3. Scan for icons in the project
  // Priority: icon.svg, logo.svg, favicon.svg, or any svg file
  const svgIcons = allFiles.filter(f => 
    f.name.toLowerCase().endsWith('.svg') && 
    (f.name.toLowerCase().includes('icon') || f.name.toLowerCase().includes('logo') || f.name.toLowerCase().includes('fav'))
  );

  const anySvg = allFiles.find(f => f.name.toLowerCase().endsWith('.svg'));
  const targetSvg = svgIcons[0] || anySvg;

  if (targetSvg && targetSvg.content) {
    iconFound = true;
    iconSource = targetSvg.path;
    iconType = 'svg';
    iconPreviewContent = targetSvg.content;

    // Try to extract color from SVG
    const fillMatch = targetSvg.content.match(/fill=["'](#[0-9a-fA-F]{3,8}|rgb[^"']+)["']/);
    if (fillMatch && fillMatch[1] && !fillMatch[1].includes('none') && !fillMatch[1].includes('white')) {
      inferredThemeColor = fillMatch[1];
    }
  } else {
    // Check for PNG or ICO
    const imageIcon = allFiles.find(f => 
      (f.name.toLowerCase().includes('icon') || f.name.toLowerCase().includes('logo') || f.name.toLowerCase().includes('fav')) &&
      (f.name.toLowerCase().endsWith('.png') || f.name.toLowerCase().endsWith('.ico') || f.name.toLowerCase().endsWith('.webp'))
    );

    if (imageIcon) {
      iconFound = true;
      iconSource = imageIcon.path;
      iconType = 'image';
      iconPreviewContent = imageIcon.content?.startsWith('data:') ? imageIcon.content : '';
    }
  }

  // If no icon found, generate a brand new SVG icon
  if (!iconFound) {
    iconPreviewContent = generateSvgIcon(inferredName, inferredThemeColor, 192);
  }

  return {
    inferredName,
    inferredShortName,
    inferredDescription,
    inferredThemeColor,
    inferredBackgroundColor,
    iconFound,
    iconSource,
    iconType,
    iconPreviewContent
  };
}

/**
 * Helper to generate a crisp, vector SVG app icon with symbol
 */
export function generateSvgIcon(name: string, themeColor: string, size = 192, symbol = '⚡'): string {
  const initial = name ? name.trim().charAt(0).toUpperCase() : 'P';
  const radius = Math.round(size * 0.22);
  const fontSize = Math.round(size * 0.38);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <defs>
    <linearGradient id="grad-${size}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${themeColor}" stop-opacity="1" />
      <stop offset="100%" stop-color="#1e1b4b" stop-opacity="1" />
    </linearGradient>
    <filter id="shadow-${size}" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="${Math.round(size * 0.03)}" stdDeviation="${Math.round(size * 0.04)}" flood-color="#000" flood-opacity="0.3" />
    </filter>
  </defs>
  <rect width="${size}" height="${size}" rx="${radius}" fill="url(#grad-${size})"/>
  <rect x="${Math.round(size * 0.08)}" y="${Math.round(size * 0.08)}" width="${Math.round(size * 0.84)}" height="${Math.round(size * 0.84)}" rx="${Math.round(radius * 0.8)}" fill="none" stroke="#ffffff" stroke-width="${Math.max(1, Math.round(size * 0.015))}" stroke-opacity="0.25"/>
  <g filter="url(#shadow-${size})">
    <circle cx="${size / 2}" cy="${size / 2}" r="${Math.round(size * 0.28)}" fill="#ffffff" fill-opacity="0.15" />
    <text x="${size / 2}" y="${Math.round(size * 0.6)}" text-anchor="middle" font-family="'Cairo', system-ui, sans-serif" font-weight="bold" font-size="${fontSize}" fill="#ffffff">${symbol || initial}</text>
  </g>
</svg>`;
}

/**
 * Checks PWA compliance of the current project nodes
 */
export function checkPWACompliance(nodes: FileNode[]): PWAComplianceReport {
  const allFiles = getAllFiles(nodes);

  const manifestFile = allFiles.find(f => f.name.toLowerCase() === 'manifest.json' || f.name.toLowerCase() === 'manifest.webmanifest');
  const swFile = allFiles.find(f => f.name.toLowerCase() === 'sw.js' || f.name.toLowerCase() === 'service-worker.js');
  const icon192 = allFiles.find(f => f.name.toLowerCase().includes('192'));
  const icon512 = allFiles.find(f => f.name.toLowerCase().includes('512'));

  const htmlFiles = allFiles.filter(f => f.name.toLowerCase().endsWith('.html'));
  let hasMetaThemeColor = false;
  let hasAppleTouchIcon = false;
  let hasSwRegistration = false;

  htmlFiles.forEach(h => {
    if (h.content) {
      if (h.content.includes('name="theme-color"')) hasMetaThemeColor = true;
      if (h.content.includes('rel="apple-touch-icon"')) hasAppleTouchIcon = true;
      if (h.content.includes('serviceWorker.register')) hasSwRegistration = true;
    }
  });

  const hasManifest = !!manifestFile;
  const hasServiceWorker = !!swFile;
  const hasIcons192 = !!icon192;
  const hasIcons512 = !!icon512;

  let points = 0;
  if (hasManifest) points += 25;
  if (hasServiceWorker) points += 25;
  if (hasIcons192 && hasIcons512) points += 20;
  else if (hasIcons192 || hasIcons512) points += 10;
  if (hasMetaThemeColor) points += 10;
  if (hasAppleTouchIcon) points += 10;
  if (hasSwRegistration) points += 10;

  const score = Math.min(100, points);
  let status: PWAComplianceReport['status'] = 'unconverted';
  if (score >= 90) status = 'compliant';
  else if (score >= 40) status = 'partial';

  return {
    hasManifest,
    hasServiceWorker,
    hasIcons192,
    hasIcons512,
    hasMetaThemeColor,
    hasAppleTouchIcon,
    hasSwRegistration,
    score,
    status
  };
}

/**
 * Modifies the loaded project directly to transform it into a 100% compliant, real PWA:
 * 1. manifest.json
 * 2. sw.js
 * 3. icons (192x192 & 512x512)
 * 4. Updates all HTML files with meta tags, links, SW registration, and In-App Install Prompt banner
 */
export function convertProjectToPWA(
  nodes: FileNode[],
  config: PWAConfig,
  customIconSvg?: string
): {
  updatedNodes: FileNode[];
  createdFiles: string[];
  updatedFiles: string[];
} {
  let currentNodes = [...nodes];
  const createdFiles: string[] = [];
  const updatedFiles: string[] = [];

  // 1. Manifest JSON
  const manifestData = {
    id: config.id || '/',
    name: config.name,
    short_name: config.shortName.substring(0, 12),
    description: config.description,
    start_url: config.startUrl || '/',
    scope: config.scope || '/',
    display: config.display || 'standalone',
    background_color: config.backgroundColor || '#0f172a',
    theme_color: config.themeColor || '#3b82f6',
    icons: [
      {
        src: '/icons/icon-192x192.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
        purpose: 'any'
      },
      {
        src: '/icons/icon-512x512.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'any'
      },
      {
        src: '/icons/icon-512x512.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'maskable'
      }
    ]
  };

  const manifestContent = JSON.stringify(manifestData, null, 2);
  const existingManifest = findNodeByPath(currentNodes, 'manifest.json');
  if (existingManifest) {
    currentNodes = updateNodeContent(currentNodes, existingManifest.id, manifestContent, true);
    updatedFiles.push('manifest.json');
  } else {
    const manifestNode: FileNode = {
      id: generateUniqueId(),
      name: 'manifest.json',
      type: 'file',
      path: 'manifest.json',
      content: manifestContent,
      size: manifestContent.length,
      isSaved: true,
      lastModified: Date.now(),
      parentId: null
    };
    currentNodes = addNode(currentNodes, null, manifestNode);
    createdFiles.push('manifest.json');
  }

  // 2. Service Worker (sw.js)
  const cacheKey = `${config.shortName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-pwa-v1`;
  const swContent = `// Service Worker المُنشأ تلقائياً عبر استوديو المشاريع
const CACHE_NAME = '${cacheKey}';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.svg',
  '/icons/icon-512x512.svg'
];

// مرحلة التثبيت وحفظ الملفات الأساسية
self.addEventListener('install', (event) => {
  console.log('[PWA SW] جاري تثبيت وحفظ ملفات الكاش الأساسية');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[PWA SW] تحذير كاش التثبيت:', err);
      });
    })
  );
  self.skipWaiting();
});

// مرحلة التنشيط وتطهير الكاشات القديمة
self.addEventListener('activate', (event) => {
  console.log('[PWA SW] تم تنشيط Service Worker وتطهير الكاش القديم');
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[PWA SW] إزالة كاش قديم:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// استراتيجية الشبكة أولاً مع بديل الكاش (Network-First with Cache Fallback)
self.addEventListener('fetch', (event) => {
  // تجاهل الطلبات غير الـ GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
      })
  );
});`;

  const existingSW = findNodeByPath(currentNodes, 'sw.js');
  if (existingSW) {
    currentNodes = updateNodeContent(currentNodes, existingSW.id, swContent, true);
    updatedFiles.push('sw.js');
  } else {
    const swNode: FileNode = {
      id: generateUniqueId(),
      name: 'sw.js',
      type: 'file',
      path: 'sw.js',
      content: swContent,
      size: swContent.length,
      isSaved: true,
      lastModified: Date.now(),
      parentId: null
    };
    currentNodes = addNode(currentNodes, null, swNode);
    createdFiles.push('sw.js');
  }

  // 3. Icons Folder and Files
  const icon192Svg = customIconSvg || generateSvgIcon(config.name, config.themeColor, 192);
  const icon512Svg = customIconSvg || generateSvgIcon(config.name, config.themeColor, 512);

  let iconsFolder = findNodeByPath(currentNodes, 'icons');
  if (!iconsFolder) {
    iconsFolder = {
      id: generateUniqueId(),
      name: 'icons',
      type: 'folder',
      path: 'icons',
      isOpen: true,
      children: [],
      parentId: null
    };
    currentNodes = addNode(currentNodes, null, iconsFolder);
    createdFiles.push('icons/');
  }

  const existingIcon192 = findNodeByPath(currentNodes, 'icons/icon-192x192.svg');
  if (existingIcon192) {
    currentNodes = updateNodeContent(currentNodes, existingIcon192.id, icon192Svg, true);
    updatedFiles.push('icons/icon-192x192.svg');
  } else {
    const icon192Node: FileNode = {
      id: generateUniqueId(),
      name: 'icon-192x192.svg',
      type: 'file',
      path: 'icons/icon-192x192.svg',
      content: icon192Svg,
      size: icon192Svg.length,
      isSaved: true,
      lastModified: Date.now(),
      parentId: iconsFolder.id
    };
    currentNodes = addNode(currentNodes, iconsFolder.id, icon192Node);
    createdFiles.push('icons/icon-192x192.svg');
  }

  const existingIcon512 = findNodeByPath(currentNodes, 'icons/icon-512x512.svg');
  if (existingIcon512) {
    currentNodes = updateNodeContent(currentNodes, existingIcon512.id, icon512Svg, true);
    updatedFiles.push('icons/icon-512x512.svg');
  } else {
    const icon512Node: FileNode = {
      id: generateUniqueId(),
      name: 'icon-512x512.svg',
      type: 'file',
      path: 'icons/icon-512x512.svg',
      content: icon512Svg,
      size: icon512Svg.length,
      isSaved: true,
      lastModified: Date.now(),
      parentId: iconsFolder.id
    };
    currentNodes = addNode(currentNodes, iconsFolder.id, icon512Node);
    createdFiles.push('icons/icon-512x512.svg');
  }

  // 4. Update HTML files with PWA headers, Service Worker registration, and In-App Install Prompt UI
  const pwaHeadSnippet = `  <!-- PWA Headers & Meta Configuration -->
  <link rel="manifest" href="/manifest.json">
  <meta name="theme-color" content="${config.themeColor}">
  <link rel="apple-touch-icon" href="/icons/icon-192x192.svg">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="default">
  <meta name="apple-mobile-web-app-title" content="${config.shortName}">`;

  const pwaInstallBannerScript = `
  <!-- PWA In-App Install Prompt Banner & Service Worker Registration -->
  <div id="pwa-install-banner" style="display:none; position:fixed; bottom:20px; right:20px; left:20px; max-width:420px; margin:0 auto; z-index:99999; background:#0f172a; color:#f8fafc; border:1px solid #334155; border-radius:12px; padding:14px 18px; box-shadow:0 20px 25px -5px rgba(0,0,0,0.5); font-family:system-ui,sans-serif;" dir="rtl">
    <div style="display:flex; align-items:center; justify-content:space-between; gap:12px;">
      <div style="display:flex; align-items:center; gap:10px;">
        <div style="width:36px; height:36px; border-radius:8px; background:${config.themeColor}; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:bold; font-size:18px;">📱</div>
        <div>
          <div style="font-weight:bold; font-size:13px; color:#fff;">تثبيت ${config.shortName}</div>
          <div style="font-size:11px; color:#94a3b8;">يعمل كتطبيق مستقل بدون اتصال</div>
        </div>
      </div>
      <div style="display:flex; align-items:center; gap:8px;">
        <button id="pwa-install-btn" style="background:#3b82f6; color:#fff; border:none; border-radius:6px; padding:6px 12px; font-size:12px; font-weight:bold; cursor:pointer;">تثبيت</button>
        <button id="pwa-dismiss-btn" style="background:transparent; color:#94a3b8; border:none; font-size:16px; cursor:pointer; padding:4px;">✕</button>
      </div>
    </div>
  </div>
  <script>
    // تسجيل خدمة Service Worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js').then(function(reg) {
          console.log('[PWA] Service Worker مسجل بنجاح:', reg.scope);
        }).catch(function(err) {
          console.error('[PWA] فشل تسجيل Service Worker:', err);
        });
      });
    }

    // إدارة زر تثبيت PWA التفاعلي داخل التطبيق
    var deferredPrompt = null;
    window.addEventListener('beforeinstallprompt', function(e) {
      e.preventDefault();
      deferredPrompt = e;
      var banner = document.getElementById('pwa-install-banner');
      if (banner) banner.style.display = 'block';
    });

    document.addEventListener('DOMContentLoaded', function() {
      var installBtn = document.getElementById('pwa-install-btn');
      var dismissBtn = document.getElementById('pwa-dismiss-btn');
      var banner = document.getElementById('pwa-install-banner');

      if (installBtn) {
        installBtn.addEventListener('click', function() {
          if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then(function(choiceResult) {
              if (choiceResult.outcome === 'accepted') {
                console.log('[PWA] وافق المستخدم على التثبيت');
              }
              deferredPrompt = null;
              if (banner) banner.style.display = 'none';
            });
          }
        });
      }

      if (dismissBtn) {
        dismissBtn.addEventListener('click', function() {
          if (banner) banner.style.display = 'none';
        });
      }
    });
  </script>`;

  const allFiles = getAllFiles(currentNodes);
  const htmlFiles = allFiles.filter(f => f.name.toLowerCase().endsWith('.html'));

  if (htmlFiles.length > 0) {
    htmlFiles.forEach(htmlFile => {
      let content = htmlFile.content || '';
      let modified = false;

      if (!content.includes('rel="manifest"')) {
        if (content.includes('</head>')) {
          content = content.replace('</head>', `${pwaHeadSnippet}\n</head>`);
        } else {
          content = `${pwaHeadSnippet}\n${content}`;
        }
        modified = true;
      }

      if (!content.includes('pwa-install-banner')) {
        if (content.includes('</body>')) {
          content = content.replace('</body>', `${pwaInstallBannerScript}\n</body>`);
        } else {
          content = `${content}\n${pwaInstallBannerScript}`;
        }
        modified = true;
      }

      if (modified) {
        currentNodes = updateNodeContent(currentNodes, htmlFile.id, content, true);
        updatedFiles.push(htmlFile.name);
      }
    });
  } else {
    // If no HTML file existed at all, create an index.html with PWA
    const newHtml = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${config.name}</title>
${pwaHeadSnippet}
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#0f172a] text-[#f8fafc] font-sans min-h-screen flex items-center justify-center p-6">
  <div class="max-w-md w-full bg-[#1e293b] border border-[#334155] rounded-2xl p-6 text-center space-y-4 shadow-xl">
    <div class="w-16 h-16 mx-auto rounded-2xl bg-[${config.themeColor}] flex items-center justify-center text-3xl shadow-lg">📱</div>
    <h1 class="text-xl font-bold text-white">${config.name}</h1>
    <p class="text-xs text-[#94a3b8] leading-relaxed">${config.description}</p>
    <div class="inline-block px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-semibold">
      جاهز للتثبيت ويعمل دون اتصال
    </div>
  </div>
${pwaInstallBannerScript}
</body>
</html>`;

    const newHtmlNode: FileNode = {
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
    currentNodes = addNode(currentNodes, null, newHtmlNode);
    createdFiles.push('index.html');
  }

  return {
    updatedNodes: currentNodes,
    createdFiles,
    updatedFiles
  };
}
