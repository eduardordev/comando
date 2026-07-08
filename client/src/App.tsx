import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { AppDataProvider } from './hooks/useAppData';
import { NewTaskPage } from './pages/NewTaskPage';
import { StatsPage } from './pages/StatsPage';
import { TaskDetailPage } from './pages/TaskDetailPage';
import { TodayPage } from './pages/TodayPage';

export function App() {
  return (
    <BrowserRouter>
      <AppDataProvider>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<TodayPage />} />
            <Route path="nueva" element={<NewTaskPage />} />
            <Route path="stats" element={<StatsPage />} />
            <Route path="tarea/:id" element={<TaskDetailPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AppDataProvider>
    </BrowserRouter>
  );
}
