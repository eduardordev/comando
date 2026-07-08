import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { QUADRANT_META } from '@comando/shared';
import { useAppData } from '../hooks/useAppData';
import { useIsMobile } from '../hooks/useIsMobile';
import { buildWeekDays, getOverdueTasks } from '../lib/week';
import { formatDueDateShort } from '../lib/format';
import styles from './WeekPage.module.css';

export function WeekPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { tasks, loading, error } = useAppData();

  const weekDays = useMemo(() => buildWeekDays(tasks), [tasks]);
  const overdue = useMemo(() => getOverdueTasks(tasks), [tasks]);

  if (loading) return <p className={styles.loading}>Cargando...</p>;
  if (error) return <p className={styles.error}>{error}</p>;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <div className={styles.subtitle}>PLANIFICACIÓN</div>
          <h1 className={styles.title}>Esta semana</h1>
        </div>
        <p className={styles.description}>
          Tareas con fecha límite dentro de la semana actual, organizadas por día.
        </p>
      </header>

      {overdue.length > 0 && (
        <section className={styles.overdueSection}>
          <div className={styles.overdueLabel}>VENCIDAS ({overdue.length})</div>
          <div className={styles.overdueList}>
            {overdue.map((task) => {
              const meta = QUADRANT_META[task.quadrant];
              return (
                <button
                  key={task.id}
                  type="button"
                  className={styles.overdueItem}
                  onClick={() => navigate(`/tarea/${task.id}`)}
                >
                  <span className={styles.dot} style={{ background: meta.color }} />
                  <span className={styles.overdueTitle}>{task.title}</span>
                  <span className={styles.overdueDate}>
                    {task.dueDate && formatDueDateShort(task.dueDate)}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      <div className={`${styles.grid} ${isMobile ? styles.gridMobile : ''}`}>
        {weekDays.map((day) => (
          <section
            key={day.dateKey}
            className={`${styles.day} ${day.isToday ? styles.dayToday : ''}`}
          >
            <header className={styles.dayHeader}>
              <span className={styles.dayLabel}>{day.label}</span>
              <span className={styles.dayNumber}>{day.dayNumber}</span>
            </header>
            <div className={styles.dayList}>
              {day.tasks.length === 0 ? (
                <p className={styles.empty}>—</p>
              ) : (
                day.tasks.map((task) => {
                  const meta = QUADRANT_META[task.quadrant];
                  return (
                    <button
                      key={task.id}
                      type="button"
                      className={styles.dayItem}
                      onClick={() => navigate(`/tarea/${task.id}`)}
                    >
                      <span className={styles.dot} style={{ background: meta.color }} />
                      <span className={styles.dayItemTitle}>{task.title}</span>
                    </button>
                  );
                })
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
