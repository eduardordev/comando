import type { CreateTaskInput, UpdateTaskInput } from '@comando/shared';
import { getPoints, getQuadrant } from '@comando/shared';
import { prisma } from '../db/prisma';
import { newChecklistItems, parseChecklist, serializeChecklist, toTaskDto } from '../lib/task-mapper';

export async function listTasks(status?: string) {
  const where =
    status && status !== 'all'
      ? { status: status === 'completed' ? 'completed' : 'pending' }
      : undefined;

  const rows = await prisma.task.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  return rows.map(toTaskDto);
}

export async function getTask(id: string) {
  const row = await prisma.task.findUnique({ where: { id } });
  return row ? toTaskDto(row) : null;
}

export async function createTask(input: CreateTaskInput) {
  const checklist = newChecklistItems(input.checklist ?? []);
  const row = await prisma.task.create({
    data: {
      title: input.title.trim(),
      area: (input.area ?? '').trim(),
      description: (input.description ?? '').trim(),
      urgent: input.urgent ?? false,
      important: input.important ?? false,
      checklist: serializeChecklist(checklist),
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
    },
  });
  return toTaskDto(row);
}

export async function updateTask(id: string, input: UpdateTaskInput) {
  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing) return null;

  const data: Record<string, unknown> = {};

  if (input.title !== undefined) data.title = input.title.trim();
  if (input.area !== undefined) data.area = input.area.trim();
  if (input.description !== undefined) data.description = input.description.trim();
  if (input.urgent !== undefined) data.urgent = input.urgent;
  if (input.important !== undefined) data.important = input.important;
  if (input.checklist !== undefined) data.checklist = serializeChecklist(input.checklist);
  if (input.dueDate !== undefined) data.dueDate = input.dueDate ? new Date(input.dueDate) : null;

  if (input.status === 'completed' && existing.status !== 'completed') {
    const urgent = (input.urgent ?? existing.urgent) as boolean;
    const important = (input.important ?? existing.important) as boolean;
    const quadrant = getQuadrant(urgent, important);
    data.status = 'completed';
    data.completedAt = new Date();
    data.pointsAwarded = getPoints(urgent, important);
    data.quadrantAtCompletion = quadrant;
  } else if (input.status === 'pending' && existing.status === 'completed') {
    data.status = 'pending';
    data.completedAt = null;
    data.pointsAwarded = null;
    data.quadrantAtCompletion = null;
  } else if (input.status !== undefined) {
    data.status = input.status;
  }

  const row = await prisma.task.update({ where: { id }, data });
  return toTaskDto(row);
}

export async function deleteTask(id: string) {
  try {
    await prisma.task.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

export async function getCompletionDateKeys(): Promise<Set<string>> {
  const completed = await prisma.task.findMany({
    where: { status: 'completed', completedAt: { not: null } },
    select: { completedAt: true },
  });

  const { toDateKey } = await import('../lib/dates');
  const keys = new Set<string>();
  for (const row of completed) {
    if (row.completedAt) keys.add(toDateKey(row.completedAt));
  }
  return keys;
}

export async function countCompletedByQuadrant() {
  const groups = await prisma.task.groupBy({
    by: ['quadrantAtCompletion'],
    where: { status: 'completed', quadrantAtCompletion: { not: null } },
    _count: true,
  });

  const result: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0 };
  for (const g of groups) {
    if (g.quadrantAtCompletion != null) {
      result[String(g.quadrantAtCompletion)] = g._count;
    }
  }
  return result;
}

export async function getTotalPoints() {
  const agg = await prisma.task.aggregate({
    where: { status: 'completed' },
    _sum: { pointsAwarded: true },
  });
  return agg._sum.pointsAwarded ?? 0;
}

export async function getTotalCompleted() {
  return prisma.task.count({ where: { status: 'completed' } });
}

export async function getWeeklyPoints(weeks = 6): Promise<number[]> {
  const { startOfDay, addDays, toDateKey } = await import('../lib/dates');
  const today = startOfDay();
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const thisMonday = addDays(today, mondayOffset);

  const completed = await prisma.task.findMany({
    where: { status: 'completed', completedAt: { not: null } },
    select: { completedAt: true, pointsAwarded: true },
  });

  const result: number[] = [];
  for (let w = weeks - 1; w >= 0; w--) {
    const weekStart = addDays(thisMonday, -w * 7);
    const weekEnd = addDays(weekStart, 7);
    let sum = 0;
    for (const row of completed) {
      if (!row.completedAt || row.pointsAwarded == null) continue;
      const d = row.completedAt;
      if (d >= weekStart && d < weekEnd) sum += row.pointsAwarded;
    }
    result.push(sum);
  }
  return result;
}

export interface DigestData {
  overdue: ReturnType<typeof toTaskDto>[];
  dueToday: ReturnType<typeof toTaskDto>[];
  dueTomorrow: ReturnType<typeof toTaskDto>[];
  byQuadrant: Record<1 | 2 | 3 | 4, ReturnType<typeof toTaskDto>[]>;
  weekAhead: { dateKey: string; tasks: ReturnType<typeof toTaskDto>[] }[];
}

function utcMidnight(date = new Date()): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export async function getDigestData(): Promise<DigestData> {
  // dueDate is always stored as UTC midnight of the chosen calendar day (see
  // client date-input handling), so all boundaries here must be UTC-anchored
  // too — otherwise a server running in a non-UTC timezone miscategorizes
  // tasks by a day.
  const today = utcMidnight();
  const tomorrow = new Date(today.getTime() + 86_400_000);
  const dayAfterTomorrow = new Date(today.getTime() + 2 * 86_400_000);
  const weekEnd = new Date(today.getTime() + 7 * 86_400_000);

  const rows = await prisma.task.findMany({
    where: { status: 'pending' },
    orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
  });
  const tasks = rows.map(toTaskDto);

  const overdue = tasks.filter((t) => t.dueDate && new Date(t.dueDate) < today);
  const dueToday = tasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) >= today && new Date(t.dueDate) < tomorrow,
  );
  const dueTomorrow = tasks.filter(
    (t) =>
      t.dueDate && new Date(t.dueDate) >= tomorrow && new Date(t.dueDate) < dayAfterTomorrow,
  );

  const byQuadrant: DigestData['byQuadrant'] = { 1: [], 2: [], 3: [], 4: [] };
  for (const t of tasks) byQuadrant[t.quadrant].push(t);

  const withinWeek = tasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) >= today && new Date(t.dueDate) < weekEnd,
  );
  const weekMap = new Map<string, ReturnType<typeof toTaskDto>[]>();
  for (const t of withinWeek) {
    const key = (t.dueDate as string).slice(0, 10);
    const list = weekMap.get(key) ?? [];
    list.push(t);
    weekMap.set(key, list);
  }
  const weekAhead = [...weekMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dateKey, dayTasks]) => ({ dateKey, tasks: dayTasks }));

  return { overdue, dueToday, dueTomorrow, byQuadrant, weekAhead };
}

export { parseChecklist };
