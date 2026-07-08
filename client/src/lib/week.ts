import type { Task } from '@comando/shared';

export interface WeekDay {
  dateKey: string;
  label: string;
  dayNumber: number;
  isToday: boolean;
  tasks: Task[];
}

const DIAS_SHORT = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];

function startOfDay(date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// dueDate is stored as UTC midnight of the chosen calendar day, so its key
// is just the ISO date portion — reading it via local Date getters would
// shift it by a day for any user west of UTC.
function dueDateKey(dueDate: string): string {
  return dueDate.slice(0, 10);
}

export function getCurrentWeekRange(): { start: Date; end: Date } {
  const today = startOfDay();
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const start = addDays(today, mondayOffset);
  const end = addDays(start, 7);
  return { start, end };
}

export function buildWeekDays(tasks: Task[]): WeekDay[] {
  const { start } = getCurrentWeekRange();
  const today = startOfDay();
  const pending = tasks.filter((t) => t.status === 'pending' && t.dueDate);

  const days: WeekDay[] = [];
  for (let i = 0; i < 7; i++) {
    const date = addDays(start, i);
    const dateKey = toDateKey(date);
    const dayTasks = pending.filter((t) => dueDateKey(t.dueDate as string) === dateKey);
    days.push({
      dateKey,
      label: DIAS_SHORT[date.getDay()],
      dayNumber: date.getDate(),
      isToday: dateKey === toDateKey(today),
      tasks: dayTasks,
    });
  }
  return days;
}

export function getOverdueTasks(tasks: Task[]): Task[] {
  const todayKey = toDateKey(startOfDay());
  return tasks.filter(
    (t) => t.status === 'pending' && t.dueDate && dueDateKey(t.dueDate) < todayKey,
  );
}
