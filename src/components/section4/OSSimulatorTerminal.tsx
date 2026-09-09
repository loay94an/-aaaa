import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Terminal as TerminalIcon, 
  Play, 
  Trash2, 
  Copy, 
  Check, 
  Download, 
  Maximize2, 
  Minimize2, 
  RotateCcw,
  Sparkles,
  Search,
  Monitor,
  HardDrive,
  Cpu,
  Layers,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { FileNode, LogEntry } from '../../types';
import { getAllFiles, findNodeByPath } from '../../utils/treeParser';
import { checkPWACompliance } from '../../utils/pwaGenerator';

export type OperatingSystem = 'linux' | 'windows' | 'macos' | 'node';

interface TerminalLine {
  id: string;
  type: 'command' | 'stdout' | 'stderr' | 'system' | 'success' | 'warn';
  text: string;
  os: OperatingSystem;
  timestamp?: string;
}

interface OSSimulatorTerminalProps {
  nodes: FileNode[];
  logs: LogEntry[];
  onAddLog?: (category: 'build' | 'runtime' | 'analysis' | 'terminal', level: 'info' | 'warn' | 'error' | 'success', msg: string) => void;
  onClearLogs?: () => void;
  onSelectFile?: (file: FileNode) => void;
}

export const OSSimulatorTerminal: React.FC<OSSimulatorTerminalProps> = ({
  nodes,
  logs,
  onAddLog,
  onClearLogs,
  onSelectFile
}) => {
  const [selectedOS, setSelectedOS] = useState<OperatingSystem>('linux');
  const [currentPath, setCurrentPath] = useState<string>('~/project');
  const [inputCommand, setInputCommand] = useState<string>('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([]);
  const [copied, setCopied] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('sm');
  const [isSimulatingBuild, setIsSimulatingBuild] = useState<boolean>(false);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const allFiles = useMemo(() => getAllFiles(nodes), [nodes]);

  // Initial banner when OS changes or on mount
  useEffect(() => {
    let welcomeLines: TerminalLine[] = [];
    const ts = new Date().toLocaleTimeString('en-US', { hour12: false });

    if (selectedOS === 'linux') {
      welcomeLines = [
        { id: `sys-1`, type: 'system', text: 'Welcome to Ubuntu 22.04.4 LTS (GNU/Linux 6.5.0-35-generic x86_64)', os: 'linux', timestamp: ts },
        { id: `sys-2`, type: 'stdout', text: ' * Documentation:  https://help.ubuntu.com', os: 'linux' },
        { id: `sys-3`, type: 'stdout', text: ` * Virtual Environment mounted at ~/project (${allFiles.length} files detected)`, os: 'linux' },
        { id: `sys-4`, type: 'stdout', text: 'Type "help" or "ls -la" to explore project files. Run "npm run dev" to start live server.', os: 'linux' }
      ];
      setCurrentPath('~/project');
    } else if (selectedOS === 'windows') {
      welcomeLines = [
        { id: `sys-1`, type: 'system', text: 'Windows PowerShell v7.4.2 [x64 Edition]', os: 'windows', timestamp: ts },
        { id: `sys-2`, type: 'stdout', text: 'Copyright (C) Microsoft Corporation. All rights reserved.', os: 'windows' },
        { id: `sys-3`, type: 'stdout', text: `Working directory: C:\\Users\\Developer\\project (${allFiles.length} files loaded)`, os: 'windows' },
        { id: `sys-4`, type: 'stdout', text: 'Try "dir", "Get-ChildItem", or "npm start".', os: 'windows' }
      ];
      setCurrentPath('C:\\Users\\Developer\\project');
    } else if (selectedOS === 'macos') {
      welcomeLines = [
        { id: `sys-1`, type: 'system', text: 'Last login: Mon Sep  7 13:00:00 on ttys001', os: 'macos', timestamp: ts },
        { id: `sys-2`, type: 'stdout', text: 'Darwin Kernel Version 23.4.0 (arm64 Apple Silicon M3 Max)', os: 'macos' },
        { id: `sys-3`, type: 'stdout', text: `Project workspace: ~/Sites/project (${allFiles.length} files)`, os: 'macos' },
        { id: `sys-4`, type: 'stdout', text: 'Run "ls -la", "python main.py", or "pwa audit".', os: 'macos' }
      ];
      setCurrentPath('~/Sites/project');
    } else {
      welcomeLines = [
        { id: `sys-1`, type: 'system', text: 'Node.js WebContainer Runtime v20.11.0 LTS (V8 11.3.244.8)', os: 'node', timestamp: ts },
        { id: `sys-2`, type: 'stdout', text: 'Web Worker Sandboxed Micro-Container Active (Fast execution in-browser)', os: 'node' },
        { id: `sys-3`, type: 'stdout', text: `Loaded Virtual File System: ${allFiles.length} files. Type ".help" for instructions.`, os: 'node' }
      ];
      setCurrentPath('/app');
    }

    setTerminalLines(welcomeLines);
  }, [selectedOS]);

  // Sync incoming studio logs into terminal output
  useEffect(() => {
    if (logs.length > 0) {
      const lastLog = logs[logs.length - 1];
      const logLine: TerminalLine = {
        id: `log-${Date.now()}-${Math.random()}`,
        type: lastLog.level === 'error' ? 'stderr' : lastLog.level === 'warn' ? 'warn' : lastLog.level === 'success' ? 'success' : 'stdout',
        text: `[${lastLog.category.toUpperCase()}] ${lastLog.message}`,
        os: selectedOS,
        timestamp: lastLog.timestamp
      };
      setTerminalLines(prev => [...prev.slice(-300), logLine]);
    }
  }, [logs]);

  // Auto-scroll terminal
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLines]);

  // Prompt Prefix based on OS
  const promptPrefix = useMemo(() => {
    if (selectedOS === 'linux') {
      return (
        <span className="shrink-0 flex items-center font-mono">
          <span className="text-emerald-400 font-bold">dev@ubuntu</span>
          <span className="text-slate-400">:</span>
          <span className="text-blue-400 font-bold">{currentPath}</span>
          <span className="text-slate-200 ml-1.5 font-bold">$</span>
        </span>
      );
    } else if (selectedOS === 'windows') {
      return (
        <span className="shrink-0 flex items-center font-mono text-cyan-300 font-bold">
          <span>PS {currentPath}&gt;</span>
        </span>
      );
    } else if (selectedOS === 'macos') {
      return (
        <span className="shrink-0 flex items-center font-mono">
          <span className="text-amber-400 font-bold">dev@macbook</span>
          <span className="text-slate-400 mx-1">in</span>
          <span className="text-sky-400 font-bold">{currentPath}</span>
          <span className="text-emerald-400 ml-1.5 font-bold">%</span>
        </span>
      );
    } else {
      return (
        <span className="shrink-0 flex items-center font-mono text-emerald-400 font-bold">
          <span>node:{currentPath} &gt;</span>
        </span>
      );
    }
  }, [selectedOS, currentPath]);

  // Command Execution Engine
  const executeCommand = (cmdText: string) => {
    const trimmed = cmdText.trim();
    if (!trimmed) return;

    // Add command to history
    setCommandHistory(prev => [...prev, trimmed]);
    setHistoryIndex(-1);

    const cmdLine: TerminalLine = {
      id: `cmd-${Date.now()}`,
      type: 'command',
      text: trimmed,
      os: selectedOS,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false })
    };

    const parts = trimmed.split(' ').filter(Boolean);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    const outputLines: TerminalLine[] = [];

    // Helper to push stdout
    const out = (text: string, type: TerminalLine['type'] = 'stdout') => {
      outputLines.push({
        id: `out-${Date.now()}-${Math.random()}`,
        type,
        text,
        os: selectedOS
      });
    };

    // 1. CLEAR / CLS
    if (cmd === 'clear' || cmd === 'cls') {
      setTerminalLines([]);
      setInputCommand('');
      return;
    }

    // 2. HELP
    if (cmd === 'help' || cmd === '?') {
      out('=== محاكي أوامر النظام والطرفية (Virtual OS Simulator) ===', 'system');
      out('الأوامر المدعومة للتعامل مع ملفات وأنظمة المشروع:');
      out('  ls / dir [-la]        استعراض ملفات ومجلدات المشروع وأحجامها');
      out('  pwd                   عرض المسار النشط الحالي');
      out('  cd <dir>              التنقل بين مجلدات المشروع (مثال: cd src)');
      out('  cat <file> / type     عرض محتويات أي ملف في المشروع');
      out('  node <file.js>        تشغيل كود جافاسكريبت وعرض المخرجات الحقيقية');
      out('  python <file.py>      تشغيل وفحص سكربت بايثون');
      out('  npm run dev / start   محاكاة تشغيل خادم التطوير والبناء الحي');
      out('  pwa audit / check     فحص تقرير توافق المشروع مع معايير PWA');
      out('  neofetch / sysinfo    عرض مواصفات النظام والمعالج ومظهر OS');
      out('  uname -a / ver        إصدار النواة ونظام التشغيل المحدد');
      out('  ps / top              عرض العمليات النشطة');
      out('  git status            فحص حالة مستودع Git للمشروع');
      out('  whoami / date / env   معلومات المستخدم، التاريخ، وبيئة التشغيل');
      out('  clear / cls           مسح شاشة الطرفية');
    }

    // 3. PWD
    else if (cmd === 'pwd') {
      out(currentPath);
    }

    // 4. LS / DIR
    else if (cmd === 'ls' || cmd === 'dir' || cmd === 'get-childitem') {
      if (allFiles.length === 0) {
        out('Directory is empty. No files loaded in project yet.', 'warn');
      } else {
        const isDetailed = args.includes('-l') || args.includes('-la') || args.includes('-al') || cmd === 'dir';
        out(`Total ${allFiles.length} files:`);
        
        allFiles.forEach(file => {
          const sizeKb = ((file.size || (file.content?.length || 0)) / 1024).toFixed(1);
          const ext = file.name.split('.').pop() || '';
          const isExec = ['js', 'ts', 'tsx', 'jsx', 'py', 'sh'].includes(ext);
          const isHtml = ext === 'html' || ext === 'htm';

          if (isDetailed) {
            const perms = isExec ? '-rwxr-xr-x' : '-rw-r--r--';
            out(`${perms}  1 dev dev  ${sizeKb.padStart(6)} KB  ${file.path} ${isExec ? '⚡' : isHtml ? '🌐' : ''}`);
          } else {
            out(`  ${file.path} (${sizeKb} KB)`);
          }
        });
      }
    }

    // 5. CD
    else if (cmd === 'cd') {
      const target = args[0];
      if (!target || target === '~' || target === '/') {
        setCurrentPath(selectedOS === 'windows' ? 'C:\\Users\\Developer\\project' : '~/project');
      } else if (target === '..') {
        const parts = currentPath.split('/');
        if (parts.length > 1) {
          parts.pop();
          setCurrentPath(parts.join('/') || '/');
        }
      } else {
        const clean = target.replace(/^[\\/]+/, '').replace(/[\\/]+$/, '');
        const folderExists = allFiles.some(f => f.path.startsWith(clean + '/'));
        if (folderExists) {
          setCurrentPath(selectedOS === 'windows' ? `C:\\Users\\Developer\\project\\${clean}` : `~/project/${clean}`);
          out(`Switched directory to: ${clean}`);
        } else {
          out(`cd: no such file or directory: ${target}`, 'stderr');
        }
      }
    }

    // 6. CAT / TYPE
    else if (cmd === 'cat' || cmd === 'type' || cmd === 'more') {
      const targetName = args[0];
      if (!targetName) {
        out('Usage: cat <filename>', 'stderr');
      } else {
        const found = allFiles.find(f => 
          f.name.toLowerCase() === targetName.toLowerCase() || 
          f.path.toLowerCase() === targetName.toLowerCase() ||
          f.path.toLowerCase().endsWith('/' + targetName.toLowerCase())
        );

        if (found) {
          out(`--- Content of ${found.path} (${found.content?.length || 0} bytes) ---`, 'system');
          const lines = (found.content || '(empty file)').split('\n').slice(0, 80);
          lines.forEach((l, idx) => {
            out(`${(idx + 1).toString().padStart(3, ' ')} | ${l}`);
          });
          if ((found.content || '').split('\n').length > 80) {
            out(`... [Truncated: showing first 80 lines of file] ...`, 'warn');
          }
        } else {
          out(`cat: ${targetName}: No such file or directory`, 'stderr');
        }
      }
    }

    // 7. NODE.JS RUNNER
    else if (cmd === 'node') {
      if (args.length === 0 || args[0] === '-v' || args[0] === '--version') {
        out('v20.11.0');
      } else if (args[0] === '-e') {
        const evalCode = args.slice(1).join(' ').replace(/^['"]/, '').replace(/['"]$/, '');
        try {
          // Safe eval execution
          const capturedLogs: string[] = [];
          const customConsole = {
            log: (...a: any[]) => capturedLogs.push(a.map(x => typeof x === 'object' ? JSON.stringify(x) : String(x)).join(' ')),
            info: (...a: any[]) => capturedLogs.push(a.map(x => typeof x === 'object' ? JSON.stringify(x) : String(x)).join(' ')),
            error: (...a: any[]) => capturedLogs.push('[ERROR] ' + a.map(x => String(x)).join(' '))
          };
          const fn = new Function('console', evalCode);
          fn(customConsole);
          if (capturedLogs.length > 0) {
            capturedLogs.forEach(l => out(l));
          } else {
            out('(Command executed with no stdout output)');
          }
        } catch (err: any) {
          out(`ReferenceError: ${err.message}`, 'stderr');
        }
      } else {
        const fileName = args[0];
        const targetFile = allFiles.find(f => f.name.toLowerCase() === fileName.toLowerCase() || f.path.toLowerCase().endsWith(fileName.toLowerCase()));
        if (!targetFile) {
          out(`node: Cannot find module '${fileName}'`, 'stderr');
        } else {
          out(`[Node.js v20.11.0] Running ${targetFile.path}...`, 'system');
          try {
            const capturedLogs: string[] = [];
            const customConsole = {
              log: (...a: any[]) => capturedLogs.push(a.map(x => typeof x === 'object' ? JSON.stringify(x) : String(x)).join(' ')),
              warn: (...a: any[]) => capturedLogs.push('[WARN] ' + a.map(x => String(x)).join(' ')),
              error: (...a: any[]) => capturedLogs.push('[ERROR] ' + a.map(x => String(x)).join(' '))
            };
            // Try running simple JS code
            const cleanCode = targetFile.content || '';
            if (!cleanCode.includes('import ') && !cleanCode.includes('export ')) {
              const fn = new Function('console', 'require', cleanCode);
              fn(customConsole, () => ({}));
              if (capturedLogs.length > 0) {
                capturedLogs.forEach(l => out(l));
              } else {
                out(`Execution finished successfully (exit code: 0)`, 'success');
              }
            } else {
              out(`Module has ES imports/exports. Transpiling with virtual Node runner...`);
              out(`[Virtual Runner] Program loaded. Exports detected. ⚡`, 'success');
            }
          } catch (err: any) {
            out(`Runtime Error in ${fileName}: ${err.message}`, 'stderr');
          }
        }
      }
    }

    // 8. PYTHON RUNNER
    else if (cmd === 'python' || cmd === 'python3' || cmd === 'py') {
      if (args.length === 0 || args[0] === '-v' || args[0] === '--version') {
        out('Python 3.11.8 (main, Feb 12 2024, 14:50:00) [Clang 15.0.0]');
      } else {
        const targetPy = args[0];
        const pyFile = allFiles.find(f => f.name.toLowerCase() === targetPy.toLowerCase() || f.path.toLowerCase().endsWith(targetPy.toLowerCase()));
        if (!pyFile) {
          out(`python: can't open file '${targetPy}': [Errno 2] No such file or directory`, 'stderr');
        } else {
          out(`[Python 3.11.8] Executing ${pyFile.path}...`, 'system');
          const code = pyFile.content || '';
          
          // Simulated Python runtime runner
          const printMatches = code.matchAll(/print\s*\(\s*(['"])([\s\S]*?)\1\s*\)/g);
          let matchCount = 0;
          for (const m of printMatches) {
            out(m[2]);
            matchCount++;
          }
          if (matchCount === 0) {
            out(`Script executed cleanly (Process finished with exit code 0).`, 'success');
          }
        }
      }
    }

    // 9. NPM RUN DEV / BUILD / START
    else if (cmd === 'npm') {
      const sub = args[0] || 'help';
      if (sub === 'run' && (args[1] === 'dev' || args[1] === 'start')) {
        setIsSimulatingBuild(true);
        out('> project@0.0.0 dev', 'system');
        out('> vite --host 0.0.0.0 --port 3000', 'system');
        out('');
        out('  VITE v5.2.0  ready in 240 ms', 'success');
        out('  ➜  Local:   http://localhost:3000/', 'success');
        out('  ➜  Network: http://0.0.0.0:3000/', 'success');
        out('  ➜  press h + enter to show help', 'stdout');
        out('  [HMR] Virtual watcher connected to project files.');
        setIsSimulatingBuild(false);
        if (onAddLog) onAddLog('build', 'success', 'خادم التطوير الافتراضي قيد التشغيل على المنفذ 3000');
      } else if (sub === 'run' && args[1] === 'build') {
        out('> project@0.0.0 build', 'system');
        out('> vite build && tsc --noEmit', 'system');
        out('✓ 42 modules transformed.');
        out('dist/index.html                   1.42 kB │ gzip:  0.64 kB', 'stdout');
        out('dist/assets/index-D7h2k9z.css     12.80 kB │ gzip:  3.10 kB', 'stdout');
        out('dist/assets/index-B3a9f1.js      142.15 kB │ gzip: 44.20 kB', 'stdout');
        out('✓ built in 480ms', 'success');
      } else if (sub === 'test') {
        out('Running Vitest test suites...', 'system');
        out('PASS  tests/app.test.ts (2 tests)', 'success');
        out('Tests: 2 passed, 2 total', 'success');
      } else {
        out(`npm v10.2.4\nAvailable commands: run dev, run build, test, install`);
      }
    }

    // 10. PWA AUDIT
    else if (cmd === 'pwa') {
      const sub = args[0] || 'audit';
      if (sub === 'audit' || sub === 'check' || sub === 'status') {
        const report = checkPWACompliance(nodes);
        out('=== تقرير فحص جاهزية PWA الشامل للمشروع ===', 'system');
        out(`درجة الامتثال الكلية: ${report.score}% [${report.status.toUpperCase()}]`, report.score >= 80 ? 'success' : 'warn');
        out(`- manifest.json:             ${report.hasManifest ? 'موجود ومتوافق ✓' : 'غير موجود ✗'}`);
        out(`- Service Worker (sw.js):    ${report.hasServiceWorker ? 'موجود ومتوافق ✓' : 'غير موجود ✗'}`);
        out(`- أيقونات 192px و 512px:      ${report.hasIcons192 && report.hasIcons512 ? 'مكتملة ✓' : 'ناقصة ✗'}`);
        out(`- وسم meta theme-color:      ${report.hasMetaThemeColor ? 'موجود ✓' : 'غير موجود ✗'}`);
        out(`- سكربت تثبيت تفاعلي:        ${report.hasSwRegistration ? 'جاهز ✓' : 'غير مفعل ✗'}`);
        out('يمكنك تحويل المشروع فوراً من القسم 5 لتطبيق كافة معايير PWA بنقرة واحدة.');
      } else {
        out('Usage: pwa audit');
      }
    }

    // 11. NEOFETCH / SYSTEMINFO
    else if (cmd === 'neofetch' || cmd === 'sysinfo') {
      if (selectedOS === 'linux') {
        out(`       _,met$$$$$gg.          dev@ubuntu-studio`, 'system');
        out(`    ,g$$$$$$$$$$$$$$$P.       -----------------`, 'system');
        out(`  ,g$$P"     """Y$$.".        OS: Ubuntu 22.04.4 LTS x86_64`);
        out(` ,$$P'              \`$$$.     Host: Google Cloud Compute Container`);
        out(`',$$P       ,ggs.     \`$$b:   Kernel: 6.5.0-35-generic`);
        out(`\`d$$'     ,$P"'   .    $$$    Uptime: 4 days, 12 hours`);
        out(` $$P      d$'     ,    $$P    Packages: 842 (dpkg), 1 (npm)`);
        out(` $$:      $$.   -    ,d$$'    Shell: bash 5.2.15`);
        out(` $$;      Y$b._   _,d$P'      Terminal: xterm-256color`);
        out(` Y$$.    \`."Y$$$$P"'          CPU: AMD EPYC 7B12 (4) @ 2.249GHz`);
        out(` \`$$b      "-.__              Memory: 2140MiB / 8192MiB (26%)`);
      } else if (selectedOS === 'windows') {
        out(`   .oodMMMMMMMMMMMMoo.       DEVELOPER@WIN11-STUDIO`, 'system');
        out(` ."""M"""MMMMMMMMMMMMM.      ----------------------`, 'system');
        out(`dM  .   MMMMMMMMMMMMMMb      OS: Windows 11 Pro [Version 10.0.22631]`);
        out(`"MMMMMMMMMMMMMMMMMMMMM"      System Model: Cloud Virtual Machine`);
        out(`  'MMMMMMMMMMMMMMMM'         Processor: Intel(R) Core(TM) i9-13900K`);
        out(`    'MMMMMMMMMM'             Total Physical Memory: 16,384 MB`);
        out(`                             Available Memory: 11,240 MB`);
        out(`                             PowerShell: 7.4.2`);
      } else if (selectedOS === 'macos') {
        out(`                    c.'       developer@MacBook-Pro.local`, 'system');
        out(`                 ,xNMM.       ---------------------------`, 'system');
        out(`               .OMMMMo        OS: macOS 14.4.1 Sonoma`);
        out(`               lMM"           Host: MacBook Pro 16" (M3 Max)`);
        out(`     .;loddo:.  .olloddol;.   Kernel: Darwin 23.4.0`);
        out(`   cKMMMMMMMMMMNWMMMMMMMMMM0: Shell: zsh 5.9`);
        out(` .KMMMMMMMMMMMMMMMMMMMMMMMWd. Memory: 36 GB Unified LPDDR5`);
        out(` XMMMMMMMMMMMMMMMMMMMMMMMX.   Resolution: 3456x2234 Retina`);
        out(` :WMMMMMMMMMMMMMMMMMMMMMMK.   Terminal: Apple Terminal`);
      } else {
        out(`   __  _           _          node@webcontainer`, 'system');
        out(`  / / (_)__  __ __(_)         -----------------`, 'system');
        out(` / _\\/ / _ \\/ // /            Runtime: Node.js v20.11.0 LTS`);
        out(`/_/ /_/_//_/\\_,_/_/           Engine: V8 11.3.244.8`);
        out(`                              VFS Files: ${allFiles.length} nodes`);
        out(`                              Sandbox: Web Worker MicroVM`);
      }
    }

    // 12. UNAME / VER
    else if (cmd === 'uname') {
      out(selectedOS === 'linux' ? 'Linux ubuntu 6.5.0-35-generic #36-Ubuntu SMP PREEMPT_DYNAMIC x86_64 GNU/Linux' : 'Darwin MacBook-Pro.local 23.4.0 Darwin Kernel Version 23.4.0: Fri Mar  8 20:47:33 PDT 2024; root:xnu-10063.101.17~1/RELEASE_ARM64_T6030 arm64');
    }

    // 13. PS / TOP
    else if (cmd === 'ps' || cmd === 'top') {
      out('  PID TTY          TIME CMD', 'system');
      out('    1 ?        00:00:02 systemd');
      out('  142 pts/0    00:00:01 bash');
      out('  512 pts/0    00:00:04 node /app/node_modules/.bin/vite');
      out('  890 pts/0    00:00:00 ps');
    }

    // 14. GIT STATUS
    else if (cmd === 'git') {
      const sub = args[0] || 'status';
      if (sub === 'status') {
        out('On branch main', 'system');
        out('Your branch is up to date with "origin/main".');
        out(`Changes not staged for commit: (${allFiles.length} project files active)`, 'warn');
        out('  (use "git add <file>..." to update what will be committed)');
      } else if (sub === 'log') {
        out('commit f8a3b2c (HEAD -> main)', 'system');
        out('Author: Developer <dev@studio.app>');
        out(`Date:   ${new Date().toDateString()}`);
        out('');
        out('    Initial project structure generated with Studio PWA & Virtual Bundler');
      } else {
        out('git version 2.43.0\nCommands: status, log, diff, branch');
      }
    }

    // 15. MISC (WHOAMI, DATE, ECHO)
    else if (cmd === 'whoami') {
      out(selectedOS === 'windows' ? 'WIN11\\Developer' : 'dev');
    } else if (cmd === 'date') {
      out(new Date().toString());
    } else if (cmd === 'echo') {
      out(args.join(' '));
    } else {
      out(`${cmd}: command not found. Type "help" for a list of available commands.`, 'stderr');
    }

    setTerminalLines(prev => [...prev, cmdLine, ...outputLines]);
    setInputCommand('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCommand(inputCommand);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const nextIdx = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(nextIdx);
        setInputCommand(commandHistory[nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const nextIdx = historyIndex + 1;
        if (nextIdx < commandHistory.length) {
          setHistoryIndex(nextIdx);
          setInputCommand(commandHistory[nextIdx]);
        } else {
          setHistoryIndex(-1);
          setInputCommand('');
        }
      }
    }
  };

  const handleCopyTerminal = () => {
    const text = terminalLines.map(l => {
      if (l.type === 'command') return `$ ${l.text}`;
      return l.text;
    }).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportTerminalLog = () => {
    const text = terminalLines.map(l => `[${l.timestamp || 'LOG'}] ${l.text}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `terminal-${selectedOS}-${Date.now()}.log`;
    a.click();
  };

  return (
    <div className="bg-[#0b1120] border border-[#334155] rounded-[8px] overflow-hidden flex flex-col font-mono text-xs shadow-xl">
      {/* OS Selector & Window Chrome */}
      <div className="bg-[#080d1a] px-3.5 py-2.5 border-b border-[#334155] flex flex-wrap items-center justify-between gap-3">
        {/* Window Traffic Lights & Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
          </div>

          <div className="flex items-center gap-2 text-slate-300 font-sans font-bold text-xs sm:text-sm">
            <TerminalIcon className="w-4 h-4 text-emerald-400" />
            <span>محاكي أنظمة التشغيل والطرفية (Virtual OS Environment)</span>
          </div>
        </div>

        {/* Operating System Switcher Pills */}
        <div className="flex items-center bg-[#050811] p-1 rounded-lg border border-slate-700/80 text-[11px] font-sans">
          <button
            type="button"
            onClick={() => setSelectedOS('linux')}
            className={`px-2.5 py-1 rounded transition cursor-pointer flex items-center gap-1.5 ${
              selectedOS === 'linux' ? 'bg-[#e95420] text-white font-bold shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🐧</span>
            <span>Ubuntu Linux</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedOS('windows')}
            className={`px-2.5 py-1 rounded transition cursor-pointer flex items-center gap-1.5 ${
              selectedOS === 'windows' ? 'bg-[#0078d4] text-white font-bold shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🪟</span>
            <span>Windows PowerShell</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedOS('macos')}
            className={`px-2.5 py-1 rounded transition cursor-pointer flex items-center gap-1.5 ${
              selectedOS === 'macos' ? 'bg-slate-700 text-white font-bold shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🍎</span>
            <span>macOS Zsh</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedOS('node')}
            className={`px-2.5 py-1 rounded transition cursor-pointer flex items-center gap-1.5 ${
              selectedOS === 'node' ? 'bg-emerald-600 text-white font-bold shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🟢</span>
            <span>Node.js Container</span>
          </button>
        </div>

        {/* Action Buttons: Copy, Clear, Export, Font */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleCopyTerminal}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            title="نسخ مخرجات الطرفية"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-blue-400" />}
          </button>

          <button
            type="button"
            onClick={handleExportTerminalLog}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            title="تصدير ملف السجل (.log)"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
          </button>

          <button
            type="button"
            onClick={() => {
              setTerminalLines([]);
              if (onClearLogs) onClearLogs();
            }}
            className="p-1.5 rounded bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-300 transition cursor-pointer"
            title="مسح الطرفية والسجلات"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
          </button>
        </div>
      </div>

      {/* Quick Interactive Command Shortcuts */}
      <div className="bg-[#070b16] px-3.5 py-2 border-b border-[#334155]/60 flex flex-wrap items-center gap-2 text-[11px] font-sans">
        <span className="text-slate-400 font-medium">أوامر سريعة:</span>
        <button
          type="button"
          onClick={() => executeCommand('npm run dev')}
          className="px-2 py-0.5 rounded bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 transition cursor-pointer flex items-center gap-1"
        >
          <Play className="w-2.5 h-2.5 fill-current" />
          <span>npm run dev</span>
        </button>

        <button
          type="button"
          onClick={() => executeCommand('ls -la')}
          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
        >
          ls -la (استعراض الملفات)
        </button>

        <button
          type="button"
          onClick={() => executeCommand('neofetch')}
          className="px-2 py-0.5 rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 transition cursor-pointer flex items-center gap-1"
        >
          <Sparkles className="w-2.5 h-2.5" />
          <span>neofetch</span>
        </button>

        <button
          type="button"
          onClick={() => executeCommand('pwa audit')}
          className="px-2 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition cursor-pointer"
        >
          pwa audit
        </button>

        <button
          type="button"
          onClick={() => executeCommand('cat index.html')}
          className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition cursor-pointer"
        >
          cat index.html
        </button>

        <button
          type="button"
          onClick={() => executeCommand('python main.py')}
          className="px-2 py-0.5 rounded bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 transition cursor-pointer"
        >
          python main.py
        </button>

        <button
          type="button"
          onClick={() => executeCommand('clear')}
          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
        >
          clear
        </button>
      </div>

      {/* Main Terminal Screen */}
      <div 
        className={`p-4 h-[440px] overflow-y-auto bg-[#050811] text-slate-200 select-text font-mono transition-all ${
          fontSize === 'lg' ? 'text-sm' : fontSize === 'md' ? 'text-[13px]' : 'text-xs'
        } ${selectedOS === 'linux' ? 'terminal-linux' : selectedOS === 'windows' ? 'terminal-windows' : 'terminal-macos'}`}
        onClick={() => inputRef.current?.focus()}
      >
        {terminalLines.map((line) => (
          <div key={line.id} className="leading-relaxed whitespace-pre-wrap break-all py-0.5">
            {line.type === 'command' ? (
              <div className="flex items-center gap-2 mt-1">
                {promptPrefix}
                <span className="text-white font-bold">{line.text}</span>
              </div>
            ) : line.type === 'system' ? (
              <div className="text-purple-400 font-bold">{line.text}</div>
            ) : line.type === 'stderr' ? (
              <div className="text-rose-400">{line.text}</div>
            ) : line.type === 'warn' ? (
              <div className="text-amber-300">{line.text}</div>
            ) : line.type === 'success' ? (
              <div className="text-emerald-400 font-bold">{line.text}</div>
            ) : (
              <div className="text-slate-300">{line.text}</div>
            )}
          </div>
        ))}

        {/* Active Command Input Line */}
        <div className="flex items-center gap-2 mt-1.5 pt-1">
          {promptPrefix}
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={inputCommand}
              onChange={(e) => setInputCommand(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent text-white font-mono outline-none border-none p-0 focus:ring-0"
              autoFocus
              spellCheck={false}
              placeholder="اكتب أمراً برمجياً (مثال: ls, npm run dev, help, cat)..."
            />
          </div>
        </div>

        <div ref={terminalEndRef} />
      </div>

      {/* Footer Status Bar */}
      <div className="bg-[#080d1a] px-3.5 py-1.5 border-t border-[#334155] flex flex-wrap items-center justify-between text-[11px] text-slate-400 font-sans">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>النظام المحاكي متصل بشجرة ملفات المشروع</span>
          </span>
          <span className="text-slate-600">|</span>
          <span>{allFiles.length} ملف تم تحميله في الذاكرة</span>
        </div>

        <div className="flex items-center gap-2 font-mono text-[10px] text-slate-400">
          <span>OS: {selectedOS.toUpperCase()}</span>
          <span>•</span>
          <span>PORT: 3000 (READY)</span>
        </div>
      </div>
    </div>
  );
};
