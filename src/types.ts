export type NodeType = 'file' | 'folder';

export interface FileNode {
  id: string;
  name: string;
  type: NodeType;
  path: string; // e.g., 'src/components/Button.tsx'
  content?: string;
  isSaved?: boolean; // true if saved, false if modified since save
  size?: number; // bytes
  lastModified?: number; // epoch ms
  children?: FileNode[];
  isOpen?: boolean;
  parentId?: string | null;
}

export type ProjectPreset = 'react' | 'node' | 'python' | 'docker' | 'web';

export interface ProjectAnalysisRule {
  id: string;
  name: string;
  description: string;
  requiredFiles: string[];
  optionalFiles: string[];
  checkSyntax: boolean;
}

export interface SyntaxIssue {
  filePath: string;
  line?: number;
  column?: number;
  message: string;
  severity: 'error' | 'warning';
}

export interface AnalysisReport {
  status: 'complete' | 'incomplete' | 'has_errors';
  score: number; // 0 - 100
  preset: ProjectPreset;
  presentFiles: string[];
  missingRequiredFiles: string[];
  missingOptionalFiles: string[];
  syntaxIssues: SyntaxIssue[];
  analyzedAt: string;
  summary: string;
}

export type LogCategory = 'build' | 'runtime' | 'analysis' | 'terminal';
export type LogLevel = 'info' | 'warn' | 'error' | 'success';

export interface LogEntry {
  id: string;
  timestamp: string;
  category: LogCategory;
  level: LogLevel;
  message: string;
}

export interface ClipboardState {
  nodeId: string;
  operation: 'copy' | 'cut';
  sourcePath: string;
}

export interface SearchMatch {
  fileId: string;
  filePath: string;
  line: number;
  content: string;
  matchStart: number;
  matchLength: number;
}

export interface ExportOptions {
  fileName: string;
  excludeNodeModules: boolean;
  excludeGit: boolean;
  compressionLevel: number; // 1 - 9
}

export interface PWAConfig {
  id?: string;
  name: string;
  shortName: string;
  description: string;
  themeColor: string;
  backgroundColor: string;
  display: 'standalone' | 'minimal-ui' | 'fullscreen' | 'browser';
  startUrl: string;
  scope: string;
}

export type ServiceStatus = 'running' | 'stopped' | 'starting' | 'error';

export interface ServiceInfo {
  id: string;
  name: string;
  type: 'frontend' | 'backend' | 'database';
  port: number;
  status: ServiceStatus;
  uptimeSec: number;
  memoryMb: number;
  cpuPercent: number;
  containerImage: string;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  type: 'info' | 'success' | 'warn' | 'error';
  detail?: string;
  serviceId?: string;
}

export interface ResourceUsage {
  cpuPercent: number;
  ramUsedMb: number;
  ramTotalMb: number;
  diskUsedMb: number;
  diskTotalMb: number;
  networkInKb: number;
  networkOutKb: number;
}

export interface PreflightConfig {
  runtimeImage: string;
  customEnvVars: string;
  excludePatterns: string[];
  networkPolicy: 'isolated' | 'whitelist' | 'full';
  whitelistDomains: string[];
  portBindings: { host: number; container: number }[];
  sessionTimeoutMinutes: number;
  cpuQuota: number; // e.g. 1.0 cores
  ramQuotaMb: number; // e.g. 1024 MB
}

export interface SessionSnapshot {
  id: string;
  name: string;
  createdAt: string;
  servicesState: Record<string, ServiceStatus>;
  filesCount: number;
  note?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  resource: string;
  status: 'success' | 'warning' | 'blocked';
  ip: string;
}
