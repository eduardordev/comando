import type { ChainDay, StatsResponse, WeekChain } from '@comando/shared';
import { getLevelInfo } from '@comando/shared';
import {
  addDays,
  formatShortDateEs,
  isAfter6PM,
  startOfDay,
  toDateKey,
} from '../lib/dates';
import {
  countCompletedByQuadrant,
  getCompletionDateKeys,
  getTotalCompleted,
  getTotalPoints,
  getWeeklyPoints,
} from './task.service';

function computeStreak(activeDays: Set<string>, today: Date): number {
  const todayKey = toDateKey(today);
  let streak = 0;
  let cursor = activeDays.has(todayKey) ? today : addDays(today, -1);

  while (activeDays.has(toDateKey(cursor))) {
    streak++;
    cursor = addDays(cursor, -1);
  }

  return streak;
}

function computeMaxStreak(activeDays: Set<string>): number {
  if (activeDays.size === 0) return 0;

  const sorted = [...activeDays].sort();
  let max = 1;
  let cur = 1;

  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1] + 'T00:00:00');
    const curr = new Date(sorted[i] + 'T00:00:00');
    const diff = Math.round((curr.getTime() - prev.getTime()) / 86400000);
    if (diff === 1) {
      cur++;
      max = Math.max(max, cur);
    } else {
      cur = 1;
    }
  }

  return max;
}

function buildChainDays(activeDays: Set<string>, today: Date, count: number): ChainDay[] {
  const start = addDays(today, -(count - 1));
  const days: ChainDay[] = [];

  for (let i = 0; i < count; i++) {
    const date = addDays(start, i);
    const key = toDateKey(date);
    days.push({
      date: key,
      completed: activeDays.has(key),
      isToday: key === toDateKey(today),
    });
  }

  return days;
}

function buildWeeksChain(activeDays: Set<string>, today: Date, weeks: number): WeekChain[] {
  const totalDays = weeks * 7;
  const chain = buildChainDays(activeDays, today, totalDays);
  const result: WeekChain[] = [];

  for (let w = 0; w < weeks; w++) {
    const chunk = chain.slice(w * 7, w * 7 + 7);
    result.push({
      label: chunk.length ? formatShortDateEs(new Date(chunk[0].date + 'T00:00:00')) : '',
      days: chunk,
    });
  }

  return result;
}

export async function getStats(): Promise<StatsResponse> {
  const today = startOfDay();
  const activeDays = await getCompletionDateKeys();
  const todayKey = toDateKey(today);
  const todayCompleted = activeDays.has(todayKey);

  const points = await getTotalPoints();
  const { level, pointsToNext, rank } = getLevelInfo(points);
  const streak = computeStreak(activeDays, today);
  const maxStreak = computeMaxStreak(activeDays);
  const streakAtRisk = streak > 0 && !todayCompleted && isAfter6PM();

  const chain14 = buildChainDays(activeDays, today, 14);
  const totalCompleted = await getTotalCompleted();
  const completedByQuadrant = await countCompletedByQuadrant();
  const weeklyPoints = await getWeeklyPoints(6);
  const weeksChain = buildWeeksChain(activeDays, today, 12);

  return {
    points,
    level,
    pointsToNext,
    rank,
    streak,
    maxStreak,
    streakAtRisk,
    todayCompleted,
    chain14,
    totalCompleted,
    completedByQuadrant,
    weeklyPoints,
    weeksChain,
  };
}
