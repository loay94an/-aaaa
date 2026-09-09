import { AnalysisReport, FileNode, ProjectPreset, SyntaxIssue } from '../types';
import { getAllFiles } from './treeParser';

export interface PresetRuleConfig {
  name: string;
  required: string[];
  optional: string[];
  description: string;
}

export const PRESET_RULES: Record<ProjectPreset, PresetRuleConfig> = {
  react: {
    name: 'React (Vite/SPA)',
    description: 'مشروع واجهة أمامية مبني باستخدام React ومحزم كـ Vite',
    required: ['package.json', 'index.html', 'src/App.tsx'],
    optional: ['src/main.tsx', 'src/index.css', 'tsconfig.json', 'vite.config.ts', 'README.md']
  },
  node: {
    name: 'Node.js / Express',
    description: 'تطبيق خلفي أو خدمة ويب مع خادم Node.js و Express',
    required: ['package.json'],
    optional: ['src/index.js', 'server.js', 'index.js', '.env.example', 'README.md']
  },
  python: {
    name: 'Python (FastAPI / Flask)',
    description: 'تطبيق بايثون للخدمات الخلفية أو نصوص المعالجة',
    required: ['requirements.txt'],
    optional: ['main.py', 'app.py', 'README.md', 'Dockerfile', '.env']
  },
  docker: {
    name: 'Dockerized Project',
    description: 'مشروع مغلف داخل حاويات Docker مع تكوين الخدمات',
    required: ['Dockerfile'],
    optional: ['docker-compose.yml', '.dockerignore', 'README.md', 'package.json']
  },
  web: {
    name: 'Web / PWA (Vanilla)',
    description: 'موقع ويب قياسي جاهز للتحويل إلى تطبيق ويب تقدمي PWA',
    required: ['index.html'],
    optional: ['style.css', 'main.js', 'manifest.json', 'sw.js', 'README.md']
  }
};

/**
 * Validates project files against standard rules & syntax
 */
export function analyzeProject(nodes: FileNode[], preset: ProjectPreset): AnalysisReport {
  const allFiles = getAllFiles(nodes);
  const normalizedFilePaths = allFiles.map(f => f.path.replace(/^\//, '').toLowerCase());
  const rule = PRESET_RULES[preset] || PRESET_RULES.web;

  const missingRequiredFiles: string[] = [];
  const missingOptionalFiles: string[] = [];
  const presentFiles: string[] = [];

  // Check required
  for (const req of rule.required) {
    const found = normalizedFilePaths.some(p => p === req.toLowerCase() || p.endsWith('/' + req.toLowerCase()));
    if (found) {
      presentFiles.push(req);
    } else {
      missingRequiredFiles.push(req);
    }
  }

  // Check optional
  for (const opt of rule.optional) {
    const found = normalizedFilePaths.some(p => p === opt.toLowerCase() || p.endsWith('/' + opt.toLowerCase()));
    if (found) {
      presentFiles.push(opt);
    } else {
      missingOptionalFiles.push(opt);
    }
  }

  // Check syntax for existing files
  const syntaxIssues: SyntaxIssue[] = [];

  for (const file of allFiles) {
    const content = file.content || '';
    const lowerPath = file.path.toLowerCase();

    // 1. Validate JSON
    if (lowerPath.endsWith('.json')) {
      if (content.trim()) {
        try {
          JSON.parse(content);
        } catch (err: any) {
          const msg = err?.message || 'خطأ تركيبي في تنسيق JSON';
          syntaxIssues.push({
            filePath: file.path,
            severity: 'error',
            message: `JSON غير صالح: ${msg}`
          });
        }
      } else {
        syntaxIssues.push({
          filePath: file.path,
          severity: 'warning',
          message: 'ملف JSON فارغ تماماً'
        });
      }
    }

    // 2. Validate HTML basic tags
    if (lowerPath.endsWith('.html') || lowerPath.endsWith('.htm')) {
      if (!content.includes('<html') && !content.includes('<!DOCTYPE')) {
        syntaxIssues.push({
          filePath: file.path,
          severity: 'warning',
          message: 'الملف يفتقد لوسم <!DOCTYPE html> أو <html>'
        });
      }
      // Check for unclosed script or style tags
      const scriptOpen = (content.match(/<script/gi) || []).length;
      const scriptClose = (content.match(/<\/script>/gi) || []).length;
      if (scriptOpen !== scriptClose) {
        syntaxIssues.push({
          filePath: file.path,
          severity: 'error',
          message: `عدم تطابق في وسوم <script> (${scriptOpen} وسم فتح، ${scriptClose} وسم إغلاق)`
        });
      }

      const styleOpen = (content.match(/<style/gi) || []).length;
      const styleClose = (content.match(/<\/style>/gi) || []).length;
      if (styleOpen !== styleClose) {
        syntaxIssues.push({
          filePath: file.path,
          severity: 'error',
          message: `عدم تطابق في وسوم <style> (${styleOpen} وسم فتح، ${styleClose} وسم إغلاق)`
        });
      }
    }
  }

  // Calculate score
  let score = 100;
  score -= missingRequiredFiles.length * 25;
  score -= syntaxIssues.filter(s => s.severity === 'error').length * 20;
  score -= syntaxIssues.filter(s => s.severity === 'warning').length * 5;
  score = Math.max(0, Math.min(100, score));

  // Determine status
  let status: 'complete' | 'incomplete' | 'has_errors' = 'complete';
  if (syntaxIssues.some(s => s.severity === 'error')) {
    status = 'has_errors';
  } else if (missingRequiredFiles.length > 0) {
    status = 'incomplete';
  }

  // Summary message in Arabic
  let summary = '';
  if (status === 'complete') {
    summary = `مشروعك مكتمل وجاهز بنسبة ${score}%! جميع الملفات الأساسية لقالب (${rule.name}) متوفرة وخالية من الأخطاء.`;
  } else if (status === 'has_errors') {
    summary = `تنبيه: تم رصد أخطاء تركيبية في ${syntaxIssues.length} موضع تحتاج لتصحيح قبل التشغيل أو البناء.`;
  } else {
    summary = `المشروع ناقص: يفتقر إلى ${missingRequiredFiles.length} ملفات أساسية (${missingRequiredFiles.join(', ')}).`;
  }

  return {
    status,
    score,
    preset,
    presentFiles,
    missingRequiredFiles,
    missingOptionalFiles,
    syntaxIssues,
    analyzedAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    summary
  };
}
