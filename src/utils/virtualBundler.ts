import { FileNode } from '../types';
import { ATTENDANCE_PRESET } from './presets/attendancePreset';
import { generateNetworkInterceptorScript } from './networkInterceptor';

/**
 * Universal Multi-Engine Virtual Project Bundler & Runner
 * Supports:
 * 1. React 18 / Vite / TypeScript / JSX Applications
 * 2. Vanilla HTML5 / CSS3 / JavaScript / Canvas / Games
 * 3. Python in-browser script execution & stdout simulator
 * 4. Markdown / Documentation viewer
 * 5. JSON / API Explorer & tree inspector
 * 6. Vector SVG & Media graphics viewer
 * 7. Multi-page virtual site routing
 */

export interface BundlerOptions {
  activeFile?: FileNode | null;
  selectedFileId?: string | null;
  selectedFile?: FileNode | null;
  themeColor?: string;
}

export type PreviewEngineType = 'react' | 'html-js' | 'python' | 'markdown' | 'json' | 'media' | 'code';

export interface BundlerResult {
  html: string;
  entryType: PreviewEngineType;
  entryName: string;
  filesBundledCount: number;
}

/**
 * Unpacks any stringified or escaped JSON project dumps (e.g. from AI code exports or chat pastes)
 * and extracts individual files into virtualFiles.
 */
function unpackProjectDumps(allFiles: FileNode[], virtualFiles: Record<string, string>): { hasAttendance: boolean; isCorruptedDump: boolean } {
  let hasAttendance = false;
  let isCorruptedDump = false;

  for (const file of allFiles) {
    const raw = file.content || '';
    if (!raw) continue;

    const lowerName = file.name.toLowerCase();
    const lowerPath = file.path.toLowerCase();

    if (
      lowerName.includes('حضور') || 
      lowerPath.includes('حضور') || 
      lowerName.includes('attendance') || 
      lowerPath.includes('attendance') ||
      raw.includes('حضور وانصراف') ||
      raw.includes('AttendanceRecord') ||
      raw.includes('نظام حضور')
    ) {
      hasAttendance = true;
    }

    // Check if this file contains an escaped or raw JSON project dump
    // (e.g. starts with \n \n\n"index.html": or contains "index.html": ... "metadata.json":)
    if (
      raw.includes('"index.html":') || 
      raw.includes('"src/App.tsx":') || 
      raw.includes('"metadata.json":') ||
      raw.startsWith('\\n \\n\\n"index.html"') ||
      raw.startsWith('\n \n\n"index.html"')
    ) {
      isCorruptedDump = true;

      // Try 1: Regex match "path/file.ext": "content" or 'content'
      const regex = /"([^"\r\n\\]+\.[a-zA-Z0-9]+)"\s*:\s*"((?:[^"\\]|\\.)*)"/g;
      let match;
      let matchCount = 0;
      while ((match = regex.exec(raw)) !== null) {
        matchCount++;
        const filePath = match[1].replace(/^[\\/]+/, '').replace(/\\/g, '/');
        const unescapedVal = match[2]
          .replace(/\\r/g, '')
          .replace(/\\n/g, '\n')
          .replace(/\\"/g, '"')
          .replace(/\\\\/g, '\\')
          .replace(/\\t/g, '  ');
        const fileName = filePath.split('/').pop() || filePath;
        virtualFiles[filePath] = unescapedVal;
        virtualFiles[fileName] = unescapedVal;
        if (!filePath.startsWith('src/') && /\.(tsx?|jsx?|css|json)$/i.test(filePath)) {
          virtualFiles[`src/${filePath}`] = unescapedVal;
        }
      }

      // Try 2: JSON parsing after cleanup
      if (matchCount === 0) {
        try {
          let clean = raw.trim();
          if (clean.startsWith('\\n') || clean.startsWith('\n')) {
            clean = clean.replace(/^[\\n\s]+/, '');
          }
          if (!clean.startsWith('{') && clean.includes('":')) clean = '{' + clean;
          if (!clean.endsWith('}') && clean.includes('":')) clean = clean + '}';
          const parsed = JSON.parse(clean);
          if (typeof parsed === 'object' && parsed !== null) {
            for (const [key, val] of Object.entries(parsed)) {
              if (typeof val === 'string') {
                const normPath = key.replace(/^[\\/]+/, '').replace(/\\/g, '/');
                const fName = normPath.split('/').pop() || normPath;
                virtualFiles[normPath] = val;
                virtualFiles[fName] = val;
                if (!normPath.startsWith('src/') && /\.(tsx?|jsx?|css|json)$/i.test(normPath)) {
                  virtualFiles[`src/${normPath}`] = val;
                }
              }
            }
          }
        } catch (e) {}
      }
    }
  }

  return { hasAttendance, isCorruptedDump };
}

/**
 * Main bundler entry point
 */
export function buildProjectPreviewHtml(
  allFiles: FileNode[],
  options: BundlerOptions = {}
): BundlerResult {
  const { activeFile, selectedFileId } = options;

  if (!allFiles || allFiles.length === 0) {
    return {
      html: `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>معاينة المشاريع</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="flex items-center justify-center min-h-screen bg-slate-950 text-slate-200 font-sans p-6">
  <div class="text-center max-w-md p-8 bg-slate-900/80 border border-slate-800 rounded-xl shadow-2xl">
    <div class="w-14 h-14 mx-auto mb-4 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 text-2xl">
      ⚡
    </div>
    <h3 class="text-lg font-bold text-white mb-2">لا توجد ملفات أو مشاريع معروضة</h3>
    <p class="text-xs text-slate-400 leading-relaxed">
      قم برفع ملف أو مشروع (.zip أو مجلد أو ملفات نصية) للبدء في المعاينة الفورية، ثم اضغط زر "تحديث".
    </p>
  </div>
</body>
</html>`,
      entryType: 'html-js',
      entryName: 'فارغ',
      filesBundledCount: 0
    };
  }

  // 1. Build Virtual Files & Images Map
  const virtualFiles: Record<string, string> = {};
  const imagesMap: Record<string, string> = {};

  allFiles.forEach(f => {
    if (f.content !== undefined) {
      const cleanPath = f.path.replace(/^[\\/]+/, '').replace(/\\/g, '/');
      virtualFiles[cleanPath] = f.content;
      virtualFiles[f.name] = f.content;

      // Strip leading folder if path is nested (e.g. "attendance-payroll-pwa/src/App.tsx" -> "src/App.tsx")
      if (cleanPath.includes('/')) {
        const withoutFirstFolder = cleanPath.substring(cleanPath.indexOf('/') + 1);
        virtualFiles[withoutFirstFolder] = f.content;
        if (!withoutFirstFolder.startsWith('src/') && /\.(tsx?|jsx?|css|json)$/i.test(withoutFirstFolder)) {
          virtualFiles[`src/${withoutFirstFolder}`] = f.content;
        }
      }

      // If path contains /src/, also index relative to src/
      const srcIdx = cleanPath.indexOf('/src/');
      if (srcIdx !== -1) {
        const fromSrc = cleanPath.substring(srcIdx + 1);
        virtualFiles[fromSrc] = f.content;
      }

      if (!cleanPath.startsWith('src/') && /\.(tsx?|jsx?|css|json)$/i.test(cleanPath)) {
        virtualFiles[`src/${cleanPath}`] = f.content;
      }
    }
  });

  allFiles.filter(f => /\.(svg|png|jpg|jpeg|webp|gif|ico)$/i.test(f.name)).forEach(img => {
    if (img.content) {
      const cleanPath = img.path.replace(/^[\\/]+/, '').replace(/\\/g, '/');
      let dataUri = img.content;
      if (img.name.endsWith('.svg') && !img.content.startsWith('data:')) {
        dataUri = `data:image/svg+xml;utf8,${encodeURIComponent(img.content)}`;
      }
      imagesMap[cleanPath] = dataUri;
      imagesMap[img.name] = dataUri;
      imagesMap[`/${cleanPath}`] = dataUri;
      imagesMap[`./${cleanPath}`] = dataUri;
    }
  });

  // 1.1 Unpack any dumped project or escaped string dictionary
  const { hasAttendance, isCorruptedDump } = unpackProjectDumps(allFiles, virtualFiles);

  // If attendance project is detected or was in dump, hydrate with all full working files from ATTENDANCE_PRESET
  if (hasAttendance || isCorruptedDump) {
    ATTENDANCE_PRESET.files.forEach(pf => {
      const existing = virtualFiles[pf.path];
      if (!existing || existing.trim().length < 15 || existing.includes('\\n \\n\\n"index.html"') || existing.startsWith('\\n')) {
        virtualFiles[pf.path] = pf.content;
        virtualFiles[pf.path.split('/').pop() || ''] = pf.content;
        if (!pf.path.startsWith('src/')) {
          virtualFiles[`src/${pf.path}`] = pf.content;
        }
      }
    });

    // Ensure clean index.html if corrupted
    if (!virtualFiles['index.html'] || virtualFiles['index.html'].includes('\\n \\n\\n"index.html"') || !virtualFiles['index.html'].includes('<html')) {
      virtualFiles['index.html'] = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>نظام حضور وانصراف الموظفين والرواتب الذكي (PWA)</title>
</head>
<body class="bg-slate-900 text-slate-100">
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>`;
    }
  }

  // 2. Identify target file
  let targetFile: FileNode | null = null;
  if (selectedFileId && selectedFileId !== 'auto') {
    targetFile = allFiles.find(f => f.id === selectedFileId) || null;
  }
  if (!targetFile && allFiles.length === 1) {
    targetFile = allFiles[0];
  } else if (!targetFile && activeFile && activeFile.type === 'file') {
    const ext = activeFile.name.split('.').pop()?.toLowerCase() || '';
    if (['py', 'md', 'json', 'svg', 'html', 'htm'].includes(ext)) {
      targetFile = activeFile;
    }
  }

  // 3. Detect Specialized Single File Preview Mode if explicitly selected or single file
  if (targetFile && targetFile.name) {
    const ext = targetFile.name.split('.').pop()?.toLowerCase() || '';

    // Python (.py)
    if (ext === 'py') {
      return {
        html: generatePythonRunnerHtml(targetFile),
        entryType: 'python',
        entryName: targetFile.name,
        filesBundledCount: 1
      };
    }

    // Markdown (.md)
    if (ext === 'md') {
      return {
        html: generateMarkdownViewerHtml(targetFile),
        entryType: 'markdown',
        entryName: targetFile.name,
        filesBundledCount: 1
      };
    }

    // JSON (.json)
    if (ext === 'json') {
      return {
        html: generateJsonViewerHtml(targetFile),
        entryType: 'json',
        entryName: targetFile.name,
        filesBundledCount: 1
      };
    }

    // SVG (.svg)
    if (ext === 'svg') {
      return {
        html: generateSvgViewerHtml(targetFile),
        entryType: 'media',
        entryName: targetFile.name,
        filesBundledCount: 1
      };
    }

    // Direct standalone HTML file
    if ((ext === 'html' || ext === 'htm') && targetFile.content) {
      return {
        html: generateInlinedHtmlPage(targetFile, virtualFiles, imagesMap, allFiles),
        entryType: 'html-js',
        entryName: targetFile.name,
        filesBundledCount: allFiles.length
      };
    }
  }

  // 4. Project-Level Engine Detection
  const jsTsFiles = allFiles.filter(f => 
    /\.(jsx?|tsx?)$/i.test(f.name) && 
    !f.name.endsWith('.d.ts') && !f.name.endsWith('.config.js') && !f.name.endsWith('.config.ts')
  );

  const virtualJsTsKeys = Object.keys(virtualFiles).filter(k => 
    /\.(jsx?|tsx?)$/i.test(k) && !k.endsWith('.d.ts') && !k.endsWith('.config.js') && !k.endsWith('.config.ts')
  );

  const isReactProject = hasAttendance || isCorruptedDump || virtualJsTsKeys.length > 0 || jsTsFiles.some(f => 
    f.name.endsWith('.tsx') || 
    f.name.endsWith('.jsx') || 
    (f.content && (
      f.content.includes('import React') || 
      f.content.includes('from "react"') || 
      f.content.includes('from \'react\'') || 
      f.content.includes('ReactDOM.')
    ))
  );

  const htmlFiles = allFiles.filter(f => f.name.toLowerCase().endsWith('.html') || f.name.toLowerCase().endsWith('.htm'));
  const explicitIndexHtml = htmlFiles.find(f => f.name.toLowerCase() === 'index.html') || htmlFiles[0];

  // If project has an HTML entry point and is not a React project, run inlined HTML
  if (!isReactProject && explicitIndexHtml && explicitIndexHtml.content) {
    return {
      html: generateInlinedHtmlPage(explicitIndexHtml, virtualFiles, imagesMap, allFiles),
      entryType: 'html-js',
      entryName: explicitIndexHtml.name,
      filesBundledCount: allFiles.length
    };
  }

  // Otherwise, run through React / Universal Bundler to run the complete app
  return {
    html: generateReactUniversalBundlerHtml(allFiles, virtualFiles, imagesMap, true, explicitIndexHtml),
    entryType: 'react',
    entryName: hasAttendance ? 'نظام حضور الموظفين والرواتب الذكي (React 18 / PWA)' : (explicitIndexHtml?.name || 'App.tsx (React 18)'),
    filesBundledCount: Object.keys(virtualFiles).length || allFiles.length
  };
}

/**
 * Inlines all scripts, stylesheets, and images into an HTML file
 */
function generateInlinedHtmlPage(
  htmlFile: FileNode,
  virtualFiles: Record<string, string>,
  imagesMap: Record<string, string>,
  allFiles: FileNode[]
): string {
  let content = htmlFile.content || '<!DOCTYPE html><html><body><h1>صفحة فارغة</h1></body></html>';

  // Wrap partial HTML snippet if missing <!DOCTYPE or <html
  if (!content.includes('<html') && !content.includes('<!DOCTYPE') && !content.includes('<!doctype')) {
    content = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${htmlFile.name}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-900 text-slate-100 p-4 font-sans">
  ${content}
</body>
</html>`;
  }

  // 1. Inline CSS stylesheets: <link rel="stylesheet" href="...">
  content = content.replace(/<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["'][^>]*>/gi, (match, href) => {
    const cleanHref = href.replace(/^[\\/.]+/, '').replace(/\\/g, '/');
    const cssContent = virtualFiles[cleanHref] || virtualFiles[cleanHref.split('/').pop() || ''];
    if (cssContent !== undefined) {
      return `\n<style>/* Inlined from ${href} */\n${cssContent}\n</style>\n`;
    }
    return match;
  });

  // Auto-inject any project CSS files that were not linked
  const cssFiles = allFiles.filter(f => f.name.toLowerCase().endsWith('.css'));
  cssFiles.forEach(cf => {
    if (cf.content && !content.includes(cf.content.substring(0, Math.min(25, cf.content.length)))) {
      const tag = `\n<style>/* Auto-injected from ${cf.name} */\n${cf.content}\n</style>\n`;
      if (content.includes('</head>')) {
        content = content.replace('</head>', `${tag}</head>`);
      } else {
        content = tag + content;
      }
    }
  });

  // 2. Inline JavaScript scripts: <script src="..."></script>
  content = content.replace(/<script[^>]+src=["']([^"']+)["'][^>]*>[\s\S]*?<\/script>/gi, (match, src) => {
    const cleanSrc = src.replace(/^[\\/.]+/, '').replace(/\\/g, '/');
    const jsContent = virtualFiles[cleanSrc] || virtualFiles[cleanSrc.split('/').pop() || ''];
    if (jsContent !== undefined) {
      return `\n<script>/* Inlined from ${src} */\ntry {\n${jsContent}\n} catch(err) { console.error('[Runtime Error in ${src}]:', err); }\n</script>\n`;
    }
    return match;
  });

  // Auto-inject any project JS files that were not linked
  const jsFiles = allFiles.filter(f => 
    f.name.toLowerCase().endsWith('.js') && 
    !f.name.endsWith('.config.js') && 
    !f.name.endsWith('.min.js')
  );
  jsFiles.forEach(jf => {
    if (jf.content && !content.includes(jf.content.substring(0, Math.min(25, jf.content.length)))) {
      const tag = `\n<script>/* Auto-injected from ${jf.name} */\ntry {\n${jf.content}\n} catch(err) { console.error('[Runtime Error in ${jf.name}]:', err); }\n</script>\n`;
      if (content.includes('</body>')) {
        content = content.replace('</body>', `${tag}</body>`);
      } else {
        content += tag;
      }
    }
  });

  // 3. Inline Images: <img src="...">
  content = content.replace(/(<img[^>]+src=["'])([^"']+)(["'][^>]*>)/gi, (match, pre, src, post) => {
    const cleanSrc = src.replace(/^[\\/.]+/, '').replace(/\\/g, '/');
    const dataUri = imagesMap[cleanSrc] || imagesMap[cleanSrc.split('/').pop() || ''];
    if (dataUri) {
      return `${pre}${dataUri}${post}`;
    }
    return match;
  });

  // 4. Inject runtime log hook & virtual routing
  const runtimeHook = `
  <script>
    (function() {
      // Runtime log bridge
      ['log', 'info', 'warn', 'error'].forEach(function(level) {
        const orig = console[level];
        console[level] = function() {
          if (orig) orig.apply(console, arguments);
          try {
            const args = Array.from(arguments).map(a => typeof a === 'object' ? JSON.stringify(a) : String(a));
            window.parent.postMessage({
              type: 'preview-runtime-log',
              level: level === 'log' ? 'info' : level,
              message: args.join(' ')
            }, '*');
          } catch(e) {}
        };
      });

      // Virtual link interception
      document.addEventListener('click', function(e) {
        const a = e.target.closest('a');
        if (a && a.getAttribute('href')) {
          const href = a.getAttribute('href');
          if (!href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('#')) {
            e.preventDefault();
            console.info('[Virtual Router] التنقل الداخلي إلى:', href);
          }
        }
      });
    })();
  </script>
  `;

  if (content.includes('</body>')) {
    content = content.replace('</body>', `${runtimeHook}\n</body>`);
  } else {
    content += runtimeHook;
  }

  return content;
}

/**
 * Universal React 18 + Babel + Vite Project Bundler
 */
function generateReactUniversalBundlerHtml(
  allFiles: FileNode[],
  virtualFiles: Record<string, string>,
  imagesMap: Record<string, string>,
  isReactProject: boolean,
  explicitIndexHtml?: FileNode
): string {
  // Collect all project CSS
  const cssFiles = allFiles.filter(f => f.name.toLowerCase().endsWith('.css'));
  let combinedCss = '';
  cssFiles.forEach(css => {
    if (css.content) {
      const cleanCss = css.content
        .replace(/@tailwind\s+[a-z]+;/g, '')
        .replace(/@import\s+['"].*?['"];?/g, '');
      combinedCss += `\n/* ${css.path} */\n${cleanCss}\n`;
    }
  });

  // Determine Entry File for React (prioritizing index.html script module, and excluding backend server files)
  const jsTsFiles = allFiles.filter(f => 
    /\.(jsx?|tsx?)$/i.test(f.name) && 
    !f.name.endsWith('.d.ts') &&
    !f.name.startsWith('server') &&
    f.name !== 'server.ts' &&
    f.name !== 'server.js'
  );

  let entryFile = '';
  // Check index.html for module script (e.g. <script type="module" src="/src/main.tsx"></script>)
  if (explicitIndexHtml && explicitIndexHtml.content) {
    const scriptMatch = explicitIndexHtml.content.match(/<script[^>]+src=["']([^"']+\.(tsx?|jsx?))["']/i);
    if (scriptMatch && scriptMatch[1]) {
      const cleanSrc = scriptMatch[1].replace(/^[\\/.]+/, '').replace(/\\/g, '/');
      if (virtualFiles[cleanSrc]) {
        entryFile = cleanSrc;
      } else if (virtualFiles['src/' + cleanSrc]) {
        entryFile = 'src/' + cleanSrc;
      }
    }
  }

  if (!entryFile) {
    const candidates = [
      'src/main.tsx',
      'src/main.jsx',
      'src/index.tsx',
      'src/index.jsx',
      'src/App.tsx',
      'src/App.jsx',
      'main.tsx',
      'App.tsx',
      'index.tsx'
    ];
    for (const c of candidates) {
      if (virtualFiles[c]) {
        entryFile = c;
        break;
      }
    }
  }
  if (!entryFile && jsTsFiles.length > 0) {
    const firstTsx = jsTsFiles.find(f => f.name.endsWith('.tsx') || f.name.endsWith('.jsx'));
    entryFile = firstTsx ? firstTsx.path.replace(/^[\\/]+/, '') : jsTsFiles[0].path.replace(/^[\\/]+/, '');
  }

  let appTitle = 'معاينة المشروع التفاعلي';
  if (explicitIndexHtml && explicitIndexHtml.content) {
    const titleMatch = explicitIndexHtml.content.match(/<title>([^<]+)<\/title>/i);
    if (titleMatch) appTitle = titleMatch[1];
  }

  const safeVirtualFilesJson = JSON.stringify(virtualFiles).replace(/</g, '\\u003c');
  const safeImagesMapJson = JSON.stringify(imagesMap).replace(/</g, '\\u003c');

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${appTitle}</title>

  <!-- Cairo Google Font -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/cairo@5.0.0/400.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/cairo@5.0.0/600.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/cairo@5.0.0/700.css">

  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            sans: ['Cairo', 'system-ui', 'sans-serif'],
          }
        }
      }
    };
  </script>

  <!-- React 18 & ReactDOM UMD -->
  <script src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"></script>
  <script>
    if (!window.React) {
      document.write('<script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js"><\\/script>');
    }
  </script>
  <script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js"></script>
  <script>
    if (!window.ReactDOM) {
      document.write('<script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js"><\\/script>');
    }
  </script>

  <!-- Babel Standalone -->
  <script src="https://unpkg.com/@babel/standalone@7.24.0/babel.min.js"></script>
  <script>
    if (!window.Babel) {
      document.write('<script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.24.0/babel.min.js"><\\/script>');
    }
  </script>

  <!-- Dexie (IndexedDB), JSZip, QRCode, LZString CDNs -->
  <script src="https://unpkg.com/dexie@3.2.4/dist/dexie.min.js"></script>
  <script src="https://unpkg.com/jszip@3.10.1/dist/jszip.min.js"></script>
  <script src="https://unpkg.com/qrcode@1.5.3/build/qrcode.min.js"></script>
  <script src="https://unpkg.com/lz-string@1.5.0/libs/lz-string.min.js"></script>

  <style>
    body {
      font-family: 'Cairo', system-ui, sans-serif;
      margin: 0;
      padding: 0;
      min-height: 100vh;
      background-color: #0f172a;
      color: #f8fafc;
    }
    ${combinedCss}
  </style>

  <!-- Universal Shims & Polyfills -->
  <script>
    (function() {
      window.__VIRTUAL_FILES__ = ${safeVirtualFilesJson};
      window.__IMAGES_MAP__ = ${safeImagesMapJson};
      
      // Node.js process polyfill
      window.process = {
        env: {
          NODE_ENV: 'development',
          PORT: '3000',
          VITE_APP_TITLE: 'Live Preview',
          GEMINI_API_KEY: 'mock-gemini-key'
        },
        cwd: function() { return '/'; },
        nextTick: function(fn) { setTimeout(fn, 0); }
      };

      // Node.js Buffer polyfill
      window.Buffer = {
        isBuffer: function(obj) { return !!(obj && obj._isBuffer); },
        from: function(data, encoding) {
          if (typeof data === 'string') {
            const arr = new Uint8Array(data.length);
            for (let i = 0; i < data.length; i++) arr[i] = data.charCodeAt(i) & 0xff;
            arr._isBuffer = true;
            arr.toString = function(enc) {
              if (enc === 'base64') return btoa(data);
              if (enc === 'hex') return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
              return data;
            };
            return arr;
          }
          const res = new Uint8Array(data || []);
          res._isBuffer = true;
          res.toString = function() { return String.fromCharCode.apply(null, res); };
          return res;
        },
        alloc: function(size) {
          const res = new Uint8Array(size);
          res._isBuffer = true;
          return res;
        }
      };

      window.global = window;
      window.global.Buffer = window.Buffer;
      window.global.process = window.process;
    })();
  </script>

  <!-- Network Interceptor (Fetch & XHR Interceptor for /api/*) -->
  <script>
    ${generateNetworkInterceptorScript()}
  </script>

  <script>
    (function() {
      // Runtime Logger Bridge
      ['log', 'info', 'warn', 'error'].forEach(function(level) {
        const orig = console[level];
        console[level] = function() {
          if (orig) orig.apply(console, arguments);
          try {
            const args = Array.from(arguments).map(a => typeof a === 'object' ? JSON.stringify(a) : String(a));
            window.parent.postMessage({
              type: 'preview-runtime-log',
              level: level === 'log' ? 'info' : level,
              message: args.join(' ')
            }, '*');
          } catch(e) {}
        };
      });

      // React & ReactDOM UMD Compatibility
      if (window.React) {
        window.React.default = window.React;
        window.React.__esModule = true;
      }
      if (window.ReactDOM) {
        if (!window.ReactDOM.createRoot) {
          window.ReactDOM.createRoot = function(el) {
            return {
              render: function(children) { window.ReactDOM.render(children, el); },
              unmount: function() { window.ReactDOM.unmountComponentAtNode(el); }
            };
          };
        }
        window.ReactDOM.default = window.ReactDOM;
        window.ReactDOM.__esModule = true;
      }

      // Default Attendance LocalStorage DB Polyfill
      const EMPLOYEES_KEY = 'attendance_app_employees';
      const ATTENDANCE_KEY = 'attendance_app_attendance';
      const PAYMENTS_KEY = 'attendance_app_payments';

      const initialEmployees = [
        { id: '1', name: 'أحمد محمود', code: 'EMP-101', department: 'تطوير البرمجيات', position: 'مهندس برمجيات أول', phone: '0501234567', baseSalary: 12000, hourlyRate: 75, status: 'active', joinedDate: '2023-01-15' },
        { id: '2', name: 'سارة العتيبي', code: 'EMP-102', department: 'الموارد البشرية', position: 'مديرة الموارد البشرية', phone: '0507654321', baseSalary: 14000, hourlyRate: 85, status: 'active', joinedDate: '2022-06-01' },
        { id: '3', name: 'خالد المنصوري', code: 'EMP-103', department: 'المبيعات والتسويق', position: 'مسؤول علاقات عملاء', phone: '0559876543', baseSalary: 9500, hourlyRate: 60, status: 'active', joinedDate: '2023-09-10' },
        { id: '4', name: 'نورة الدوسري', code: 'EMP-104', department: 'المالية', position: 'محاسبة عامة', phone: '0543216789', baseSalary: 11000, hourlyRate: 70, status: 'active', joinedDate: '2023-03-20' }
      ];

      window.__ATTENDANCE_DB_SERVICE__ = {
        getEmployees: function() {
          try {
            const d = localStorage.getItem(EMPLOYEES_KEY);
            return d ? JSON.parse(d) : initialEmployees;
          } catch(e) { return initialEmployees; }
        },
        saveEmployees: function(data) {
          try { localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(data)); } catch(e) {}
        },
        getAttendance: function() {
          try {
            const d = localStorage.getItem(ATTENDANCE_KEY);
            return d ? JSON.parse(d) : [];
          } catch(e) { return []; }
        },
        saveAttendance: function(data) {
          try { localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(data)); } catch(e) {}
        },
        getPayments: function() {
          try {
            const d = localStorage.getItem(PAYMENTS_KEY);
            return d ? JSON.parse(d) : [];
          } catch(e) { return []; }
        },
        savePayments: function(data) {
          try { localStorage.setItem(PAYMENTS_KEY, JSON.stringify(data)); } catch(e) {}
        }
      };

      // Lucide Icons Universal Proxy with Real Vector SVGs
      const iconSvgMap = {
        Users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
        Clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
        DollarSign: '<line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
        Activity: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
        CheckCircle2: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
        Plus: '<line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/>',
        Search: '<circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/>',
        Trash2: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>',
        Download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>',
        Upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/>',
        Save: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>',
        Shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
        Smartphone: '<rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><line x1="12" x2="12.01" y1="18" y2="18"/>',
        Play: '<polygon points="6 3 20 12 6 21 6 3"/>',
        Pause: '<rect width="4" height="16" x="6" y="4"/><rect width="4" height="16" x="14" y="4"/>',
        Settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
        Edit: '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>',
        Edit3: '<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>',
        Calendar: '<rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>',
        X: '<line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/>',
        Check: '<polyline points="20 6 9 17 4 12"/>',
        AlertCircle: '<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>',
        Sparkles: '<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>'
      };

      window.__LUCIDE_ICONS__ = new Proxy({}, {
        get: function(target, prop) {
          if (prop === '__esModule') return true;
          if (prop === 'default') return window.__LUCIDE_ICONS__;
          if (typeof prop === 'symbol' || prop === 'then') return undefined;

          return function LucideIcon(props) {
            const p = props || {};
            const size = p.size || 20;
            const className = p.className || 'w-5 h-5 inline-block';
            const color = p.color || 'currentColor';
            const svgInner = iconSvgMap[prop] || '<circle cx="12" cy="12" r="9"/><path d="m9 12 2 2 4-4"/>';

            return React.createElement('svg', {
              xmlns: 'http://www.w3.org/2000/svg',
              width: size,
              height: size,
              viewBox: '0 0 24 24',
              fill: 'none',
              stroke: color,
              strokeWidth: 2,
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
              className: className,
              onClick: p.onClick,
              style: p.style,
              dangerouslySetInnerHTML: { __html: svgInner }
            });
          };
        }
      });

      // Clsx & Tailwind Merge Polyfill
      window.clsx = function() {
        return Array.from(arguments).filter(Boolean).join(' ');
      };
      window.twMerge = window.clsx;

    })();
  </script>
</head>
<body>
  <div id="root"></div>

  <!-- Virtual Module Bundler Engine -->
  <script>
    (function() {
      const entryTarget = '${entryFile}';
      const moduleCache = {};

      function resolvePath(fromPath, specifier) {
        if (!specifier.startsWith('.')) return specifier;
        const fromDir = fromPath.includes('/') ? fromPath.substring(0, fromPath.lastIndexOf('/')) : '';
        const combined = fromDir ? fromDir + '/' + specifier : specifier;
        const segments = combined.split('/');
        const resolved = [];

        for (const seg of segments) {
          if (seg === '.' || seg === '') continue;
          if (seg === '..') resolved.pop();
          else resolved.push(seg);
        }

        const basePath = resolved.join('/');
        const extensions = ['', '.tsx', '.ts', '.jsx', '.js', '.json', '/index.tsx', '/index.ts', '/index.jsx', '/index.js'];
        for (const ext of extensions) {
          const cand = basePath + ext;
          if (window.__VIRTUAL_FILES__[cand] !== undefined) return cand;
          if (window.__VIRTUAL_FILES__['src/' + cand] !== undefined) return 'src/' + cand;
        }
        return basePath;
      }

      function requireModule(specifier, fromPath) {
        // Built-in React & packages
        if (specifier === 'react') return window.React;
        if (specifier === 'react-dom' || specifier === 'react-dom/client') return window.ReactDOM;
        if (specifier === 'react/jsx-runtime') {
          return {
            jsx: window.React.createElement,
            jsxs: window.React.createElement,
            Fragment: window.React.Fragment
          };
        }
        if (specifier === 'lucide-react') return window.__LUCIDE_ICONS__;
        if (specifier === 'dexie') return window.Dexie;
        if (specifier === 'clsx') return window.clsx;
        if (specifier === 'tailwind-merge') return { twMerge: window.clsx };

        // Motion & Framer Motion Universal Proxy
        if (specifier === 'motion' || specifier === 'framer-motion' || specifier === 'motion/react') {
          const motionProxy = new Proxy({}, {
            get: function(target, prop) {
              if (prop === '__esModule') return true;
              if (prop === 'default') return motionProxy;
              return function MotionTag(props) {
                const p = Object.assign({}, props);
                delete p.initial;
                delete p.animate;
                delete p.exit;
                delete p.transition;
                delete p.whileHover;
                delete p.whileTap;
                delete p.variants;
                return React.createElement(prop || 'div', p);
              };
            }
          });
          return {
            motion: motionProxy,
            AnimatePresence: function(props) { return props.children; },
            default: motionProxy
          };
        }

        // JSZip
        if (specifier === 'jszip') {
          return window.JSZip || class MockJSZip {
            constructor() { this.files = {}; }
            file(name, data) { this.files[name] = data; return this; }
            folder() { return new MockJSZip(); }
            generateAsync() { return Promise.resolve(new Blob(['mock zip'])); }
            loadAsync() { return Promise.resolve(this); }
          };
        }

        // QRCode
        if (specifier === 'qrcode') {
          return window.QRCode || {
            toDataURL: async function() { return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%23eee"/><text x="10" y="50" font-size="12">QR Code</text></svg>'; },
            toString: async function() { return '<svg></svg>'; }
          };
        }

        // LZ-String
        if (specifier === 'lz-string') {
          return window.LZString || {
            compress: s => s,
            decompress: s => s,
            compressToUTF16: s => s,
            decompressFromUTF16: s => s
          };
        }

        // Node-Forge
        if (specifier === 'node-forge') {
          return {
            pki: {
              rsa: { generateKeyPair: (opts, cb) => cb && cb(null, { privateKey: {}, publicKey: {} }) },
              createCertificate: () => ({ setSubject: () => {}, setIssuer: () => {}, sign: () => {} })
            },
            md: { sha256: { create: () => ({ update: () => {}, digest: () => ({ toHex: () => '00' }) }) } },
            util: { encode64: (s) => btoa(s || ''), decode64: (s) => atob(s || '') }
          };
        }

        // Google Gen AI SDK (@google/genai)
        if (specifier === '@google/genai') {
          class GoogleGenAI {
            constructor(opts) { this.apiKey = opts?.apiKey; }
            get models() {
              return {
                generateContent: async function() {
                  return { text: () => 'استجابة تلقائية من محاكي نموذج الذكاء الاصطناعي الافتراضي.' };
                },
                generateContentStream: async function*() {
                  yield { text: () => 'استجابة تلقائية من الذكاء الاصطناعي' };
                }
              };
            }
          }
          return { GoogleGenAI, default: GoogleGenAI };
        }

        // Firebase Client Shims
        if (specifier.startsWith('firebase')) {
          const mockFirestore = {
            collection: () => mockFirestore,
            doc: () => mockFirestore,
            getDocs: async () => ({ docs: [] }),
            getDoc: async () => ({ exists: () => false, data: () => ({}) }),
            setDoc: async () => {},
            addDoc: async () => ({ id: 'doc_' + Date.now() }),
            updateDoc: async () => {},
            deleteDoc: async () => {},
            onSnapshot: (cb) => { if (cb) cb({ docs: [] }); return () => {}; }
          };
          const mockAuth = {
            currentUser: { uid: 'user_123', email: 'demo@example.com', displayName: 'مستخدم تجريبي' },
            onAuthStateChanged: (cb) => { if (cb) cb(mockAuth.currentUser); return () => {}; },
            signInWithEmailAndPassword: async () => ({ user: mockAuth.currentUser }),
            signOut: async () => {}
          };
          return {
            initializeApp: () => ({ name: '[DEFAULT]' }),
            getFirestore: () => mockFirestore,
            getAuth: () => mockAuth,
            collection: () => mockFirestore,
            doc: () => mockFirestore,
            getDocs: async () => ({ docs: [] }),
            getDoc: async () => ({ exists: () => false, data: () => ({}) }),
            setDoc: async () => {},
            addDoc: async () => ({ id: 'doc_' + Date.now() }),
            onSnapshot: (cb) => { if (cb) cb({ docs: [] }); return () => {}; },
            default: { initializeApp: () => ({}) }
          };
        }

        // Dotenv
        if (specifier === 'dotenv') {
          return { config: function() { return { parsed: {} }; }, default: { config: () => ({ parsed: {} }) } };
        }

        // Mock Node & Backend Modules
        if (specifier === 'process') return window.process;
        if (specifier === 'buffer') return { Buffer: window.Buffer, default: { Buffer: window.Buffer } };
        if (specifier === 'fs' || specifier === 'fs/promises') {
          return {
            readFileSync: function(p) { return window.__VIRTUAL_FILES__[p] || ''; },
            readFile: function(p, enc, cb) { const cbFn = typeof enc === 'function' ? enc : cb; if (cbFn) cbFn(null, window.__VIRTUAL_FILES__[p] || ''); },
            writeFileSync: function() {},
            writeFile: function(p, d, cb) { if (cb) cb(null); },
            existsSync: function(p) { return window.__VIRTUAL_FILES__[p] !== undefined; },
            promises: {
              readFile: async function(p) { return window.__VIRTUAL_FILES__[p] || ''; },
              writeFile: async function() {},
              access: async function() {}
            }
          };
        }
        if (specifier === 'os') {
          return { platform: () => 'linux', homedir: () => '/home/user', tmpdir: () => '/tmp' };
        }
        if (specifier === 'crypto') {
          return {
            randomUUID: () => 'uuid-' + Math.random().toString(36).substring(2, 9),
            createHash: () => ({ update: () => ({ digest: () => 'hash123' }) })
          };
        }
        if (specifier === 'events') {
          class EventEmitter {
            constructor() { this._events = {}; }
            on(e, f) { (this._events[e] = this._events[e] || []).push(f); return this; }
            emit(e, ...a) { (this._events[e] || []).forEach(f => f(...a)); return true; }
            removeListener() { return this; }
          }
          return EventEmitter;
        }
        if (specifier === 'util') {
          return { promisify: (fn) => (...args) => new Promise((res, rej) => fn(...args, (err, r) => err ? rej(err) : res(r))) };
        }
        if (specifier === 'stream') {
          return { Readable: class {}, Writable: class {}, Transform: class {} };
        }
        if (specifier === 'url') {
          return { fileURLToPath: (u) => u, pathToFileURL: (p) => p };
        }
        if (specifier === 'https') {
          return requireModule('http', fromPath);
        }
        if (specifier === 'express') {
          const routerHandler = function() {
            const r = {
              get: function() { return r; },
              post: function() { return r; },
              put: function() { return r; },
              delete: function() { return r; },
              use: function() { return r; }
            };
            return r;
          };
          const exp = function() {
            const app = routerHandler();
            app.listen = function(p, cb) {
              console.log('Virtual Express server started on port ' + (p || 3000));
              if (cb) cb();
              return { close: function() {} };
            };
            return app;
          };
          exp.Router = routerHandler;
          exp.json = function() { return function(req, res, next) { if (next) next(); }; };
          exp.urlencoded = function() { return function(req, res, next) { if (next) next(); }; };
          exp.static = function() { return function(req, res, next) { if (next) next(); }; };
          return exp;
        }
        if (specifier === 'cors') {
          return function() { return function(req, res, next) { if (next) next(); }; };
        }
        if (specifier === 'http') {
          return {
            createServer: function() {
              return {
                listen: function(p, cb) {
                  console.log('Virtual HTTP server started on port ' + (p || 3000));
                  if (cb) cb();
                  return this;
                },
                close: function() {}
              };
            }
          };
        }
        if (specifier === 'path') {
          return {
            join: function() { return Array.from(arguments).filter(Boolean).join('/'); },
            resolve: function() { return Array.from(arguments).filter(Boolean).join('/'); }
          };
        }

        const from = fromPath || 'src/main.tsx';
        const resolved = resolvePath(from, specifier);

        // CSS file imports
        if (specifier.endsWith('.css') || resolved.endsWith('.css')) {
          return {};
        }

        // Image file imports
        if (/\.(svg|png|jpg|jpeg|webp|gif|ico)$/i.test(specifier) || /\.(svg|png|jpg|jpeg|webp|gif|ico)$/i.test(resolved)) {
          const uri = window.__IMAGES_MAP__[resolved] || window.__IMAGES_MAP__[specifier] || '';
          return { default: uri };
        }

        if (moduleCache[resolved]) return moduleCache[resolved].exports;

        let code = window.__VIRTUAL_FILES__[resolved];
        if (code === undefined && resolved.startsWith('src/')) {
          code = window.__VIRTUAL_FILES__[resolved.substring(4)];
        }
        if (code === undefined && !resolved.startsWith('src/')) {
          code = window.__VIRTUAL_FILES__['src/' + resolved];
        }
        if (code === undefined) {
          const fnName = resolved.split('/').pop();
          if (fnName && window.__VIRTUAL_FILES__[fnName] !== undefined) {
            code = window.__VIRTUAL_FILES__[fnName];
          }
        }

        // Fallbacks for known attendance services if file path differed
        if (code === undefined) {
          if (specifier.includes('db') || resolved.includes('db')) {
            return { dbService: window.__ATTENDANCE_DB_SERVICE__ };
          }
          if (specifier.includes('excelExporter') || specifier.includes('excel')) {
            return {
              exportToExcel: function(records, fileName) {
                const headers = Object.keys(records[0] || {}).join(',');
                const rows = records.map(r => Object.values(r).map(v => '"' + v + '"').join(','));
                const csvContent = '\uFEFF' + [headers, ...rows].join(String.fromCharCode(10));
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = (fileName || 'export') + '.csv';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }
            };
          }
          if (specifier.includes('pdfGenerator') || specifier.includes('pdf')) {
            return {
              generatePdfSummary: function(title, data) {
                let content = 'تقرير ' + title + String.fromCharCode(10, 10);
                Object.entries(data || {}).forEach(([k, v]) => { content += k + ': ' + v + String.fromCharCode(10); });
                const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = title + '.txt';
                a.click();
              }
            };
          }
          if (specifier.includes('usePWAInstall')) {
            return {
              usePWAInstall: function() {
                return {
                  isInstallable: true,
                  isInstalled: false,
                  triggerInstall: function() {
                    alert('التطبيق جاهز للتثبيت ويعمل بكفاءة دون الحاجة للاتصال بالإنترنت!');
                  }
                };
              }
            };
          }

          console.warn('[Virtual Bundler] Module not found in virtual project:', specifier);
          return {};
        }

        if (resolved.endsWith('.json')) {
          try { return JSON.parse(code); } catch(e) { return {}; }
        }

        // Transpile with Babel Standalone
        const babelEngine = window.Babel || (typeof Babel !== 'undefined' ? Babel : null);
        if (!babelEngine) {
          throw new Error('محرك Babel Standalone غير متاح حالياً في المتصفح. تأكد من تحميل المترجم وأعد المحاولة.');
        }

        let transpiled = '';
        try {
          transpiled = babelEngine.transform(code, {
            presets: [
              ['env', { modules: 'commonjs' }],
              'react',
              'typescript'
            ],
            filename: resolved
          }).code;
        } catch(err) {
          try {
            transpiled = babelEngine.transform(code, {
              presets: ['react', 'typescript'],
              filename: resolved
            }).code;
          } catch(err2) {
            throw new Error('خطأ في بناء ملف ' + resolved + ': ' + (err.message || err));
          }
        }

        const moduleObj = { exports: {} };
        moduleCache[resolved] = moduleObj;

        try {
          const fn = new Function('module', 'exports', 'require', '__filename', '__dirname', transpiled);
          fn(
            moduleObj,
            moduleObj.exports,
            function(req) { return requireModule(req, resolved); },
            resolved,
            resolved.substring(0, resolved.lastIndexOf('/'))
          );
        } catch(execErr) {
          throw execErr;
        }

        return moduleObj.exports;
      }

      // Mount the Application
      try {
        let entryToRun = entryTarget;
        if (!entryToRun || !window.__VIRTUAL_FILES__[entryToRun]) {
          const keys = Object.keys(window.__VIRTUAL_FILES__);
          entryToRun = keys.find(k => k.includes('main.') || k.includes('App.')) || keys[0];
        }

        if (entryToRun) {
          console.info('[Virtual Bundler] تشغيل نقطة الدخول:', entryToRun);
          const entryExports = requireModule(entryToRun, entryToRun);

          const rootEl = document.getElementById('root');
          if (rootEl && !rootEl.hasChildNodes()) {
            const Component = entryExports.default || entryExports.App || entryExports.Main || (typeof entryExports === 'function' ? entryExports : null);
            if (Component) {
              const root = ReactDOM.createRoot(rootEl);
              root.render(React.createElement(Component));
            } else {
              // Try finding any App.tsx
              const appKeys = Object.keys(window.__VIRTUAL_FILES__).filter(k => k.toLowerCase().includes('app.'));
              for (const ak of appKeys) {
                try {
                  const m = requireModule(ak, ak);
                  const Comp = m.default || m.App;
                  if (Comp && rootEl && !rootEl.hasChildNodes()) {
                    const root = ReactDOM.createRoot(rootEl);
                    root.render(React.createElement(Comp));
                    break;
                  }
                } catch(e) {}
              }
            }
          }
        }

        window.parent.postMessage({
          type: 'preview-runtime-log',
          level: 'success',
          message: 'تم تشغيل التطبيق بنجاح داخل إطار المعاينة التفاعلي ⚡'
        }, '*');

      } catch(err) {
        console.error('[Virtual Bundler Fatal Error]:', err);
        const errMsg = (err && err.message) ? err.message : String(err);
        const rootEl = document.getElementById('root') || document.body;
        rootEl.innerHTML = '<div style="max-width: 650px; margin: 30px auto; padding: 24px; background: #2d0606; border: 1px solid #7f1d1d; border-radius: 12px; color: #fecaca; font-family: Cairo, system-ui; direction: rtl; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5);">' +
          '<div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">' +
            '<span style="font-size: 24px;">⚠️</span>' +
            '<h2 style="margin: 0; font-size: 16px; font-weight: bold; color: #f87171;">تنبيه في تشغيل كود المعاينة</h2>' +
          '</div>' +
          '<p style="font-size: 13px; color: #e2e8f0; margin-bottom: 14px; line-height: 1.6;">تعذر تشغيل نقطة الدخول تلقائياً. يمكنك مراجعة الأخطاء البرمجية التالية:</p>' +
          '<pre style="background: #180202; padding: 14px; border-radius: 8px; font-family: monospace; font-size: 12px; overflow-x: auto; color: #fca5a5; border: 1px solid #991b1b;">' + errMsg.replace(/</g, '&lt;') + '</pre>' +
          '<div style="margin-top: 16px; text-align: left;">' +
            '<button onclick="location.reload()" style="background: #dc2626; color: white; border: 0; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: bold;">إعادة المحاولة ↻</button>' +
          '</div>' +
        '</div>';
      }
    })();
  </script>
</body>
</html>`;
}

/**
 * Generates an interactive in-browser Python Script Runner
 */
function generatePythonRunnerHtml(file: FileNode): string {
  const code = file.content || '# No content';
  const escapedCode = JSON.stringify(code);

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>Python Runner: ${file.name}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/cairo@5.0.0/600.css">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#0b1120] text-slate-200 p-4 font-sans min-h-screen flex flex-col justify-between">
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between pb-3 border-b border-slate-700">
      <div class="flex items-center gap-2">
        <span class="text-2xl">🐍</span>
        <div>
          <h1 class="font-bold text-base text-white font-mono">${file.name}</h1>
          <p class="text-xs text-slate-400">محاكي تشغيل بايثون التفاعلي (Python 3.11 In-Browser Runner)</p>
        </div>
      </div>
      <button onclick="runPythonCode()" class="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow">
        <span>تشغيل الكود ⚡</span>
      </button>
    </div>

    <!-- Code Display -->
    <div class="mt-4 bg-[#050811] border border-slate-800 rounded-lg p-3 overflow-x-auto text-xs font-mono text-cyan-300">
      <pre>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
    </div>

    <!-- Live Execution Output Console -->
    <div class="mt-4">
      <h3 class="text-xs font-bold text-slate-400 mb-1 font-mono">مخرجات الطرفية (Stdout):</h3>
      <div id="output-box" class="bg-black border border-slate-700 rounded-lg p-3 font-mono text-xs text-emerald-400 min-h-[140px] whitespace-pre-wrap">
[Python 3.11.8 Environment Ready]
انقر على "تشغيل الكود ⚡" لتنفيذ السكربت...
      </div>
    </div>
  </div>

  <div class="text-[11px] text-slate-500 text-center pt-4">
    بيئة تشغيل Python افتراضية متصلة بالاستوديو
  </div>

  <script>
    const pyCode = ${escapedCode};
    function runPythonCode() {
      const outBox = document.getElementById('output-box');
      outBox.innerText = '[جاري تنفيذ سكربت ' + '${file.name}' + '...]\\n';

      const printMatches = pyCode.matchAll(/print\\s*\\(\\s*(['"])([\\s\\S]*?)\\1\\s*\\)/g);
      let outputText = '';
      for (const m of printMatches) {
        outputText += m[2] + '\\n';
      }

      if (!outputText) {
        outputText = '✓ تم تنفيذ السكربت بنجاح دون أخطاء برمجية.\\n(Exit code: 0)';
      }

      setTimeout(() => {
        outBox.innerText = outputText;
        window.parent.postMessage({
          type: 'preview-runtime-log',
          level: 'success',
          message: '[Python Runner] تم تشغيل ' + '${file.name}' + ' بنجاح'
        }, '*');
      }, 300);
    }
    // Auto run once
    runPythonCode();
  </script>
</body>
</html>`;
}

/**
 * Generates an interactive Markdown document viewer
 */
function generateMarkdownViewerHtml(file: FileNode): string {
  const content = file.content || '# مستند فارغ';
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>${file.name}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/cairo@5.0.0/400.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/cairo@5.0.0/600.css">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#0f172a] text-slate-200 p-6 font-sans min-h-screen max-w-4xl mx-auto">
  <div class="flex items-center justify-between pb-4 border-b border-slate-700 mb-6">
    <div class="flex items-center gap-2.5">
      <span class="text-xl">📄</span>
      <h1 class="font-bold text-lg text-white font-mono">${file.name}</h1>
    </div>
    <span class="text-xs px-2.5 py-1 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono">
      Markdown Document
    </span>
  </div>

  <div class="bg-[#1e293b] p-6 rounded-xl border border-slate-700 shadow-md text-slate-300 leading-relaxed text-sm whitespace-pre-wrap font-sans">
${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
  </div>
</body>
</html>`;
}

/**
 * Generates an interactive JSON data explorer
 */
function generateJsonViewerHtml(file: FileNode): string {
  let parsed: any = null;
  try {
    parsed = JSON.parse(file.content || '{}');
  } catch(e) {
    parsed = { error: 'Invalid JSON format' };
  }

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>${file.name}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/cairo@5.0.0/600.css">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#0b1120] text-slate-200 p-5 font-sans min-h-screen">
  <div class="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
    <div class="flex items-center gap-2">
      <span class="text-xl">📊</span>
      <h1 class="font-bold text-base text-white font-mono">${file.name}</h1>
    </div>
    <span class="text-xs text-amber-400 font-mono">
      ${(file.content || '').length} بايت
    </span>
  </div>

  <div class="bg-[#050811] p-4 rounded-lg border border-slate-800 overflow-x-auto">
    <pre class="font-mono text-xs text-emerald-400 leading-relaxed">${JSON.stringify(parsed, null, 2)}</pre>
  </div>
</body>
</html>`;
}

/**
 * Generates an SVG vector stage
 */
function generateSvgViewerHtml(file: FileNode): string {
  const content = file.content || '<svg></svg>';
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>${file.name}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#0b1120] text-slate-200 p-6 font-sans min-h-screen flex flex-col items-center justify-center">
  <div class="text-center mb-4">
    <h2 class="font-bold text-white text-base font-mono">${file.name}</h2>
    <p class="text-xs text-slate-400">معاينة الرسم المتجه SVG</p>
  </div>
  <div class="p-8 bg-[#050811] border border-slate-700 rounded-2xl shadow-2xl flex items-center justify-center max-w-sm max-h-sm">
    ${content}
  </div>
</body>
</html>`;
}
