import type { Quadrant } from './types';

export const QUADRANT_META: Record<
  Quadrant,
  { label: string; sub: string; color: string; dim: string }
> = {
  1: { label: 'CRÍTICO', sub: 'Urgente + Importante', color: '#FF4527', dim: '#3A1712' },
  2: { label: 'ESTRATÉGICO', sub: 'Importante, no urgente', color: '#3ED598', dim: '#12302A' },
  3: { label: 'TÁCTICO', sub: 'Urgente, no importante', color: '#F5B93F', dim: '#3A2F12' },
  4: { label: 'EN ESPERA', sub: 'Ni urgente ni importante', color: '#5B6472', dim: '#1B2026' },
};

export const POINTS_FOR: Record<Quadrant, number> = {
  1: 20,
  2: 15,
  3: 8,
  4: 3,
};

export const RANKS = [
  'RECLUTA',
  'CABO',
  'SARGENTO',
  'TENIENTE',
  'CAPITÁN',
  'COMANDANTE',
  'GENERAL',
] as const;

export function getQuadrant(urgent: boolean, important: boolean): Quadrant {
  if (urgent && important) return 1;
  if (important) return 2;
  if (urgent) return 3;
  return 4;
}

export function getPoints(urgent: boolean, important: boolean): number {
  return POINTS_FOR[getQuadrant(urgent, important)];
}

export function getRank(level: number): string {
  return RANKS[Math.min(Math.max(level - 1, 0), RANKS.length - 1)];
}

export function getLevelInfo(points: number) {
  const level = Math.floor(points / 100) + 1;
  const pointsToNext = level * 100 - points;
  const progress = ((points - (level - 1) * 100) / 100) * 100;
  return { level, pointsToNext, progress, rank: getRank(level) };
}
