import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { StatsResponse, Task } from '@comando/shared';
import { api } from '../api/client';

interface AppData {
  tasks: Task[];
  stats: StatsResponse | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  completeTask: (id: string) => Promise<void>;
  updateTask: (id: string, data: Parameters<typeof api.updateTask>[1]) => Promise<Task>;
  createTask: (data: Parameters<typeof api.createTask>[0]) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
}

const AppDataContext = createContext<AppData | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const [t, s] = await Promise.all([api.getTasks(), api.getStats()]);
      setTasks(t);
      setStats(s);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const completeTask = async (id: string) => {
    const updated = await api.updateTask(id, { status: 'completed' });
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    const s = await api.getStats();
    setStats(s);
  };

  const updateTask = async (id: string, data: Parameters<typeof api.updateTask>[1]) => {
    const updated = await api.updateTask(id, data);
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    const s = await api.getStats();
    setStats(s);
    return updated;
  };

  const createTask = async (data: Parameters<typeof api.createTask>[0]) => {
    const created = await api.createTask(data);
    setTasks((prev) => [created, ...prev]);
    return created;
  };

  const deleteTask = async (id: string) => {
    await api.deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    const s = await api.getStats();
    setStats(s);
  };

  return (
    <AppDataContext.Provider
      value={{ tasks, stats, loading, error, refresh, completeTask, updateTask, createTask, deleteTask }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData debe usarse dentro de AppDataProvider');
  return ctx;
}
