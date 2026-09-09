import React, { useState, useRef, useEffect } from 'react';
import { 
  Terminal, 
  Play, 
  Code, 
  Send, 
  Trash2, 
  RotateCcw, 
  CheckCircle2, 
  XCircle,
  HelpCircle,
  Cpu
} from 'lucide-react';
import { LogEntry } from '../../types';

interface LanguageRunnersProps {
  logs: LogEntry[];
  onAddLog: (category: 'runtime' | 'build' | 'analysis' | 'terminal', level: 'info' | 'warn' | 'error' | 'success', msg: string) => void;
  onClearTerminalLogs: () => void;
}

type SupportedLang = 'node' | 'python' | 'go' | 'rust' | 'java' | 'dotnet' | 'bash';

export const LanguageRunners: React.FC<LanguageRunnersProps> = ({
  logs,
  onAddLog,
  onClearTerminalLogs
}) => {
  const [selectedLang, setSelectedLang] = useState<SupportedLang>('node');
  const [terminalInput, setTerminalInput] = useState<string>('node server.js');
  const [stdinInput, setStdinInput] = useState<string>('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const terminalLogs = logs.filter(l => l.category === 'terminal');

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLogs]);

  const handleSelectLang = (lang: SupportedLang) => {
    setSelectedLang(lang);
    let defaultCmd = 'node server.js';
    if (lang === 'python') defaultCmd = 'pytest -v tests/ && python3 main.py';
    if (lang === 'go') defaultCmd = 'go run main.go';
    if (lang === 'rust') defaultCmd = 'cargo run --release';
    if (lang === 'java') defaultCmd = 'mvn clean package && java -jar target/app.jar';
    if (lang === 'dotnet') defaultCmd = 'dotnet run';
    if (lang === 'bash') defaultCmd = 'bash scripts/deploy.sh';
    setTerminalInput(defaultCmd);
  };

  const handleExecuteCommand = (cmdToRun?: string) => {
    const cmd = cmdToRun || terminalInput.trim();
    if (!cmd) return;

    setCommandHistory(prev => [cmd, ...prev.slice(0, 10)]);
    onAddLog('terminal', 'info', `$ ${cmd}${stdinInput ? ` < [stdin: "${stdinInput}"]` : ''}`);

    setTimeout(() => {
      if (cmd.includes('test') || cmd.includes('pytest')) {
        onAddLog('terminal', 'success', `PASS tests/unit/api.test.ts (4 passed, 0 failed, 1.24s)`);
        onAddLog('terminal', 'info', `Test Suites: 1 passed, 1 total\nTests: 4 passed, 4 total\nSnapshots: 0 total\nTime: 1.24s`);
      } else if (cmd.includes('mvn') || cmd.includes('gradle')) {
        onAddLog('terminal', 'info', `[INFO] Scanning for projects...\n[INFO] Building jar: target/app.jar`);
        onAddLog('terminal', 'success', `[INFO] BUILD SUCCESS (Total time: 2.150 s)`);
      } else if (cmd.includes('cargo') || cmd.includes('rust')) {
        onAddLog('terminal', 'info', `Compiling core-runtime v0.1.0 (/app)\nFinished release [optimized] target(s) in 3.42s`);
        onAddLog('terminal', 'success', `Running target/release/app\n[Rust] High-performance HTTP server listening on :8080`);
      } else if (cmd.includes('go')) {
        onAddLog('terminal', 'info', `go: finding module for package github.com/gin-gonic/gin`);
        onAddLog('terminal', 'success', `[GIN-debug] GET /api/v1/ping --> 200 OK (0.42ms)`);
      } else if (cmd.includes('dotnet')) {
        onAddLog('terminal', 'info', `Building project...\ninfo: Microsoft.Hosting.Lifetime[14]\nNow listening on: http://0.0.0.0:5000`);
        onAddLog('terminal', 'success', `Application started. Press Ctrl+C to shut down.`);
      } else {
        onAddLog('terminal', 'success', `[Runtime: ${selectedLang.toUpperCase()}] Process finished with exit code 0.`);
      }
    }, 350);
  };

  return (
    <div className="bg-[#0b1120] border border-[#334155] rounded-[8px] p-4 space-y-4">
      {/* Top Bar: Language Selectors & Stdin */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#080d1a] p-3 rounded-[6px] border border-[#334155] text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[#94a3b8] flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5 text-[#a855f7]" />
            <span>بيئة التشغيل:</span>
          </span>
          <div className="flex flex-wrap items-center bg-[#0f172a] p-0.5 rounded-[4px] border border-[#334155] text-[11px]">
            {(['node', 'python', 'go', 'rust', 'java', 'dotnet', 'bash'] as SupportedLang[]).map(lang => (
              <button
                key={lang}
                type="button"
                onClick={() => handleSelectLang(lang)}
                className={`px-2 py-1 rounded transition cursor-pointer font-mono ${
                  selectedLang === lang ? 'bg-[#3b82f6] text-white font-bold' : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Stdin (Standard Input) */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-[#94a3b8]">مدخل (stdin):</span>
          <input
            type="text"
            value={stdinInput}
            onChange={(e) => setStdinInput(e.target.value)}
            placeholder="e.g. y, token, 42..."
            className="bg-[#0b1120] text-white text-xs px-2 py-1 rounded border border-[#334155] font-mono outline-none w-28"
            dir="ltr"
          />
        </div>
      </div>

      {/* Language Quick Snippet Buttons */}
      <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
        <span className="text-[#94a3b8]">أوامر سريعة:</span>
        {selectedLang === 'node' && (
          <>
            <button type="button" onClick={() => { setTerminalInput('npm test'); handleExecuteCommand('npm test'); }} className="px-2 py-0.5 bg-[#080d1a] hover:bg-[#1e293b] text-[#38bdf8] rounded border border-[#334155] font-mono cursor-pointer">npm test</button>
            <button type="button" onClick={() => { setTerminalInput('npm run build'); handleExecuteCommand('npm run build'); }} className="px-2 py-0.5 bg-[#080d1a] hover:bg-[#1e293b] text-[#10b981] rounded border border-[#334155] font-mono cursor-pointer">npm run build</button>
            <button type="button" onClick={() => { setTerminalInput('node --watch server.js'); handleExecuteCommand('node --watch server.js'); }} className="px-2 py-0.5 bg-[#080d1a] hover:bg-[#1e293b] text-amber-300 rounded border border-[#334155] font-mono cursor-pointer">node --watch server.js</button>
          </>
        )}
        {selectedLang === 'python' && (
          <>
            <button type="button" onClick={() => { setTerminalInput('pytest -v'); handleExecuteCommand('pytest -v'); }} className="px-2 py-0.5 bg-[#080d1a] hover:bg-[#1e293b] text-[#38bdf8] rounded border border-[#334155] font-mono cursor-pointer">pytest -v</button>
            <button type="button" onClick={() => { setTerminalInput('python3 -m venv venv'); handleExecuteCommand('python3 -m venv venv'); }} className="px-2 py-0.5 bg-[#080d1a] hover:bg-[#1e293b] text-[#10b981] rounded border border-[#334155] font-mono cursor-pointer">venv create</button>
            <button type="button" onClick={() => { setTerminalInput('uvicorn main:app --reload'); handleExecuteCommand('uvicorn main:app --reload'); }} className="px-2 py-0.5 bg-[#080d1a] hover:bg-[#1e293b] text-amber-300 rounded border border-[#334155] font-mono cursor-pointer">uvicorn main:app</button>
          </>
        )}
        {selectedLang === 'go' && (
          <>
            <button type="button" onClick={() => { setTerminalInput('go test ./...'); handleExecuteCommand('go test ./...'); }} className="px-2 py-0.5 bg-[#080d1a] hover:bg-[#1e293b] text-[#38bdf8] rounded border border-[#334155] font-mono cursor-pointer">go test ./...</button>
            <button type="button" onClick={() => { setTerminalInput('go build -o bin/server'); handleExecuteCommand('go build -o bin/server'); }} className="px-2 py-0.5 bg-[#080d1a] hover:bg-[#1e293b] text-[#10b981] rounded border border-[#334155] font-mono cursor-pointer">go build</button>
          </>
        )}
        {selectedLang === 'rust' && (
          <>
            <button type="button" onClick={() => { setTerminalInput('cargo test'); handleExecuteCommand('cargo test'); }} className="px-2 py-0.5 bg-[#080d1a] hover:bg-[#1e293b] text-[#38bdf8] rounded border border-[#334155] font-mono cursor-pointer">cargo test</button>
            <button type="button" onClick={() => { setTerminalInput('cargo check'); handleExecuteCommand('cargo check'); }} className="px-2 py-0.5 bg-[#080d1a] hover:bg-[#1e293b] text-[#10b981] rounded border border-[#334155] font-mono cursor-pointer">cargo check</button>
          </>
        )}
        {selectedLang === 'java' && (
          <>
            <button type="button" onClick={() => { setTerminalInput('mvn clean package'); handleExecuteCommand('mvn clean package'); }} className="px-2 py-0.5 bg-[#080d1a] hover:bg-[#1e293b] text-[#38bdf8] rounded border border-[#334155] font-mono cursor-pointer">mvn package</button>
            <button type="button" onClick={() => { setTerminalInput('gradle test'); handleExecuteCommand('gradle test'); }} className="px-2 py-0.5 bg-[#080d1a] hover:bg-[#1e293b] text-[#10b981] rounded border border-[#334155] font-mono cursor-pointer">gradle test</button>
          </>
        )}
        {selectedLang === 'dotnet' && (
          <>
            <button type="button" onClick={() => { setTerminalInput('dotnet test'); handleExecuteCommand('dotnet test'); }} className="px-2 py-0.5 bg-[#080d1a] hover:bg-[#1e293b] text-[#38bdf8] rounded border border-[#334155] font-mono cursor-pointer">dotnet test</button>
            <button type="button" onClick={() => { setTerminalInput('dotnet build'); handleExecuteCommand('dotnet build'); }} className="px-2 py-0.5 bg-[#080d1a] hover:bg-[#1e293b] text-[#10b981] rounded border border-[#334155] font-mono cursor-pointer">dotnet build</button>
          </>
        )}
        {selectedLang === 'bash' && (
          <>
            <button type="button" onClick={() => { setTerminalInput('chmod +x run.sh && ./run.sh'); handleExecuteCommand('chmod +x run.sh && ./run.sh'); }} className="px-2 py-0.5 bg-[#080d1a] hover:bg-[#1e293b] text-[#38bdf8] rounded border border-[#334155] font-mono cursor-pointer">./run.sh</button>
            <button type="button" onClick={() => { setTerminalInput('uname -a && docker -v'); handleExecuteCommand('uname -a && docker -v'); }} className="px-2 py-0.5 bg-[#080d1a] hover:bg-[#1e293b] text-[#10b981] rounded border border-[#334155] font-mono cursor-pointer">system info</button>
          </>
        )}
      </div>

      {/* Terminal Output Screen */}
      <div className="bg-[#050811] p-3 rounded-[6px] border border-[#334155] font-mono text-xs text-[#f8fafc] overflow-y-auto max-h-[280px] min-h-[190px] space-y-1.5" dir="ltr">
        <div className="flex items-center justify-between pb-1 border-b border-[#334155]/40 text-[#94a3b8]/50 text-[10px]">
          <span>// Container Runner Session [PID: 4012] — Interactive PTY</span>
          <button
            type="button"
            onClick={onClearTerminalLogs}
            className="hover:text-rose-400 p-1 flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            <span>مسح</span>
          </button>
        </div>

        {terminalLogs.length === 0 ? (
          <div className="text-slate-500 py-6 text-center font-sans text-xs">
            الطرفية جاهزة لتنفيذ الأوامر والسكربتات. اكتب أمرك أدناه واضغط Enter.
          </div>
        ) : (
          terminalLogs.map(log => (
            <div key={log.id} className={`leading-relaxed whitespace-pre-wrap ${
              log.level === 'error' ? 'text-rose-400' :
              log.level === 'warn' ? 'text-[#f59e0b]' :
              log.level === 'success' ? 'text-[#10b981]' : 'text-slate-300'
            }`}>
              {log.message}
            </div>
          ))
        )}
        <div ref={terminalEndRef} />
      </div>

      {/* Command Input Bar */}
      <div className="bg-[#080d1a] p-2.5 rounded-[6px] border border-[#334155] flex items-center gap-2">
        <span className="font-mono text-[#10b981] font-bold text-xs pl-1">$</span>
        <input
          type="text"
          value={terminalInput}
          onChange={(e) => setTerminalInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleExecuteCommand(); }}
          placeholder={`اكتب أمر ${selectedLang} (مثال: npm test, python main.py)...`}
          className="flex-1 bg-transparent text-[#f8fafc] font-mono text-xs outline-none"
          dir="ltr"
        />
        <button
          type="button"
          onClick={() => handleExecuteCommand()}
          className="px-3 py-1.5 bg-[#3b82f6] hover:bg-blue-600 text-white rounded text-xs font-mono transition cursor-pointer flex items-center gap-1 active:scale-95"
        >
          <Play className="w-3 h-3 fill-white" />
          <span>تشغيل</span>
        </button>
      </div>
    </div>
  );
};
