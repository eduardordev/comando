import type { Task } from '@comando/shared';
import { getBacklogStage } from '../../lib/backlog';
import { BacklogTaskCard } from './BacklogTaskCard';
import styles from './BacklogBoard.module.css';

const COLUMNS = [
  { id: 'backlog' as const, label: 'BACKLOG', hint: 'sin empezar' },
  { id: 'in_progress' as const, label: 'EN CURSO', hint: 'con avance' },
  { id: 'completed' as const, label: 'COMPLETADAS', hint: 'cerradas' },
];

interface Props {
  tasks: Task[];
  onTaskClick: (id: string) => void;
}

export function BacklogBoard({ tasks, onTaskClick }: Props) {
  const grouped = {
    backlog: tasks.filter((t) => getBacklogStage(t) === 'backlog'),
    in_progress: tasks.filter((t) => getBacklogStage(t) === 'in_progress'),
    completed: tasks
      .filter((t) => getBacklogStage(t) === 'completed')
      .sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? '')),
  };

  return (
    <div className={styles.board}>
      {COLUMNS.map((col) => {
        const items = grouped[col.id];
        return (
          <section key={col.id} className={styles.column}>
            <header className={styles.header}>
              <span className={styles.label}>{col.label}</span>
              <span className={styles.count}>
                {items.length} · {col.hint}
              </span>
            </header>
            <div className={styles.list}>
              {items.map((task) => (
                <BacklogTaskCard key={task.id} task={task} onClick={() => onTaskClick(task.id)} />
              ))}
              {items.length === 0 && (
                <p className={styles.empty}>Sin tareas en esta columna.</p>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
