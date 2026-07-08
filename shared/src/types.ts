export type TaskStatus = 'pending' | 'completed';

export type Quadrant = 1 | 2 | 3 | 4;

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  area: string;
  description: string;
  checklist: ChecklistItem[];
  urgent: boolean;
  important: boolean;
  status: TaskStatus;
  createdAt: string;
  completedAt: string | null;
  pointsAwarded: number | null;
  quadrantAtCompletion: Quadrant | null;
  quadrant: Quadrant;
  points: number;
}

export interface ChainDay {
  date: string;
  completed: boolean;
  isToday: boolean;
}

export interface WeekChain {
  label: string;
  days: ChainDay[];
}

export interface StatsResponse {
  points: number;
  level: number;
  pointsToNext: number;
  rank: string;
  streak: number;
  maxStreak: number;
  streakAtRisk: boolean;
  todayCompleted: boolean;
  chain14: ChainDay[];
  totalCompleted: number;
  completedByQuadrant: Record<string, number>;
  weeklyPoints: number[];
  weeksChain: WeekChain[];
}

export interface CreateTaskInput {
  title: string;
  area?: string;
  description?: string;
  urgent?: boolean;
  important?: boolean;
  checklist?: { text: string }[];
}

export interface UpdateTaskInput {
  title?: string;
  area?: string;
  description?: string;
  urgent?: boolean;
  important?: boolean;
  checklist?: ChecklistItem[];
  status?: TaskStatus;
}
