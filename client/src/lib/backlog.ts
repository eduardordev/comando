import type { Task } from '@comando/shared';

export type BacklogStage = 'backlog' | 'in_progress' | 'completed';

export interface AreaSummary {
  area: string;
  total: number;
  completed: number;
  pending: number;
  progress: number;
}

export function taskChecklistProgress(task: Pick<Task, 'checklist'>): number {
  const total = task.checklist.length;
  if (total === 0) return 0;
  const done = task.checklist.filter((s) => s.completed).length;
  return Math.round((done / total) * 100);
}

export function getBacklogStage(task: Task): BacklogStage {
  if (task.status === 'completed') return 'completed';
  return taskChecklistProgress(task) > 0 ? 'in_progress' : 'backlog';
}

export function getAreaLabel(area: string): string {
  return area.trim() || 'Sin categoría';
}

export function groupTasksByArea(tasks: Task[]): AreaSummary[] {
  const map = new Map<string, Task[]>();

  for (const task of tasks) {
    const key = getAreaLabel(task.area);
    const list = map.get(key) ?? [];
    list.push(task);
    map.set(key, list);
  }

  return [...map.entries()]
    .map(([area, items]) => {
      const completed = items.filter((t) => t.status === 'completed').length;
      const total = items.length;
      return {
        area,
        total,
        completed,
        pending: total - completed,
        progress: total ? Math.round((completed / total) * 100) : 0,
      };
    })
    .sort((a, b) => b.pending - a.pending || a.area.localeCompare(b.area, 'es'));
}

export function getUniqueAreas(tasks: Task[]): string[] {
  const areas = new Set(tasks.map((t) => getAreaLabel(t.area)));
  return [...areas].sort((a, b) => a.localeCompare(b, 'es'));
}

export function filterTasksByArea(tasks: Task[], areaFilter: string | null): Task[] {
  if (!areaFilter) return tasks;
  return tasks.filter((t) => getAreaLabel(t.area) === areaFilter);
}

export function computeBacklogStats(tasks: Task[]) {
  const pending = tasks.filter((t) => t.status === 'pending');
  const completed = tasks.filter((t) => t.status === 'completed');
  const inProgress = pending.filter((t) => getBacklogStage(t) === 'in_progress');
  const backlog = pending.filter((t) => getBacklogStage(t) === 'backlog');

  const checklistTotal = tasks.reduce((sum, t) => sum + t.checklist.length, 0);
  const checklistDone = tasks.reduce(
    (sum, t) => sum + t.checklist.filter((s) => s.completed).length,
    0,
  );

  return {
    total: tasks.length,
    pending: pending.length,
    inProgress: inProgress.length,
    backlog: backlog.length,
    completed: completed.length,
    overallProgress: tasks.length
      ? Math.round((completed.length / tasks.length) * 100)
      : 0,
    checklistProgress: checklistTotal
      ? Math.round((checklistDone / checklistTotal) * 100)
      : 0,
    areas: getUniqueAreas(tasks).length,
  };
}
