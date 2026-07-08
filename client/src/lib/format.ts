const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

export function formatLongDateEs(date = new Date()): string {
  return `${DIAS[date.getDay()]}, ${date.getDate()} de ${MESES[date.getMonth()]} de ${date.getFullYear()}`;
}

export function taskMeta(task: { area?: string; checklist: { completed: boolean }[] }): string {
  const parts: string[] = [];
  if (task.area?.trim()) parts.push(task.area.trim());
  const total = task.checklist.length;
  if (total) {
    const done = task.checklist.filter((s) => s.completed).length;
    parts.push(`${done}/${total} subtareas`);
  }
  return parts.join(' · ');
}

const MESES_SHORT = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

export type DueStatus = 'overdue' | 'today' | 'soon' | 'normal';

// dueDate is always stored as UTC midnight of the chosen calendar day (see
// NewTaskPage/TaskDetailPage), so the calendar day is just the first 10
// characters — reading it via local Date getters would shift it by a day
// for any user west of UTC.
function dueDateKey(dueDate: string): string {
  return dueDate.slice(0, 10);
}

function localTodayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function addDaysToKey(key: string, days: number): string {
  const [y, m, d] = key.split('-').map(Number);
  const date = new Date(y, m - 1, d + days);
  const yy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

export function formatDueDateShort(dueDate: string): string {
  const [, m, d] = dueDateKey(dueDate).split('-').map(Number);
  return `${d} ${MESES_SHORT[m - 1]}`;
}

export function getDueStatus(dueDate: string): DueStatus {
  const dueKey = dueDateKey(dueDate);
  const todayKey = localTodayKey();
  const tomorrowKey = addDaysToKey(todayKey, 1);
  const dayAfterKey = addDaysToKey(todayKey, 2);

  if (dueKey < todayKey) return 'overdue';
  if (dueKey < tomorrowKey) return 'today';
  if (dueKey < dayAfterKey) return 'soon';
  return 'normal';
}
