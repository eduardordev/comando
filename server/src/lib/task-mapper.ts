import type { ChecklistItem, Task as TaskDto } from '@comando/shared';
import { getPoints, getQuadrant } from '@comando/shared';
import type { Task as PrismaTask } from '@prisma/client';
import { randomUUID } from 'crypto';

export function parseChecklist(raw: string): ChecklistItem[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function serializeChecklist(items: ChecklistItem[]): string {
  return JSON.stringify(items);
}

export function toTaskDto(row: PrismaTask): TaskDto {
  const urgent = row.urgent;
  const important = row.important;
  const quadrant =
    row.status === 'completed' && row.quadrantAtCompletion
      ? (row.quadrantAtCompletion as 1 | 2 | 3 | 4)
      : getQuadrant(urgent, important);

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    checklist: parseChecklist(row.checklist),
    urgent,
    important,
    status: row.status as 'pending' | 'completed',
    createdAt: row.createdAt.toISOString(),
    completedAt: row.completedAt?.toISOString() ?? null,
    pointsAwarded: row.pointsAwarded,
    quadrantAtCompletion: row.quadrantAtCompletion as 1 | 2 | 3 | 4 | null,
    quadrant,
    points: row.pointsAwarded ?? getPoints(urgent, important),
  };
}

export function newChecklistItems(texts: { text: string }[]): ChecklistItem[] {
  return texts.map((item) => ({
    id: randomUUID(),
    text: item.text,
    completed: false,
  }));
}
