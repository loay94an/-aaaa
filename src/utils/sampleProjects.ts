import { CompletePreset } from './presets/types';
import { DASHBOARD_PRESET } from './presets/dashboardPreset';
import { ECOMMERCE_PRESET } from './presets/ecommercePreset';
import { KANBAN_PRESET } from './presets/kanbanPreset';
import { CHAT_PRESET } from './presets/chatPreset';
import { PWA_PRESET } from './presets/pwaPreset';
import { EXPRESS_PRESET } from './presets/expressPreset';
import { REACT_PRESET } from './presets/reactPreset';
import { PYTHON_PRESET } from './presets/pythonPreset';
import { DOCKER_PRESET } from './presets/dockerPreset';
import { GAME_PRESET } from './presets/gamePreset';
import { ATTENDANCE_PRESET } from './presets/attendancePreset';

export { ATTENDANCE_PRESET };
export type { CompletePreset, PresetFile } from './presets/types';
export { buildNodesFromPreset } from './presets/types';

export interface SampleProjectPreset {
  id: string;
  name: string;
  category: string;
  icon: string;
  badge?: string;
  description: string;
  treeText: string;
}

export const COMPLETE_PRESETS: CompletePreset[] = [
  ATTENDANCE_PRESET,
  DASHBOARD_PRESET,
  ECOMMERCE_PRESET,
  KANBAN_PRESET,
  CHAT_PRESET,
  PWA_PRESET,
  EXPRESS_PRESET,
  REACT_PRESET,
  PYTHON_PRESET,
  DOCKER_PRESET,
  GAME_PRESET
];

// Backwards-compatible alias
export const SAMPLE_PROJECTS: SampleProjectPreset[] = COMPLETE_PRESETS;

export function getPresetById(id: string): CompletePreset | undefined {
  return COMPLETE_PRESETS.find(p => p.id === id);
}

/**
 * Searches across all presets to find the realistic file content for a given path or fileName.
 */
export function findRealisticContentForFile(filePath: string): string | null {
  const normalized = filePath.toLowerCase().replace(/\\/g, '/');
  const fileName = normalized.split('/').pop() || '';

  // 1. Exact path match in any preset
  for (const preset of COMPLETE_PRESETS) {
    for (const f of preset.files) {
      if (f.path.toLowerCase() === normalized || f.path.toLowerCase().endsWith('/' + normalized)) {
        return f.content;
      }
    }
  }

  // 2. Exact filename match in any preset
  for (const preset of COMPLETE_PRESETS) {
    for (const f of preset.files) {
      const fName = f.path.split('/').pop()?.toLowerCase();
      if (fName === fileName) {
        return f.content;
      }
    }
  }

  return null;
}
