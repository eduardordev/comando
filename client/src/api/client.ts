import type {
  CreateTaskInput,
  StatsResponse,
  Task,
  UpdateTaskInput,
} from '@comando/shared';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Error ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  getTasks: (status?: string) =>
    request<Task[]>(`/api/tasks${status ? `?status=${status}` : ''}`),

  getTask: (id: string) => request<Task>(`/api/tasks/${id}`),

  createTask: (data: CreateTaskInput) =>
    request<Task>('/api/tasks', { method: 'POST', body: JSON.stringify(data) }),

  updateTask: (id: string, data: UpdateTaskInput) =>
    request<Task>(`/api/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  deleteTask: (id: string) =>
    request<void>(`/api/tasks/${id}`, { method: 'DELETE' }),

  getStats: () => request<StatsResponse>('/api/stats'),
};
