import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../hooks/useAppData';
import { useIsMobile } from '../hooks/useIsMobile';
import {
  computeBacklogStats,
  filterTasksByArea,
  getAreaLabel,
  getUniqueAreas,
  groupTasksByArea,
} from '../lib/backlog';
import { AreaProgress } from '../components/backlog/AreaProgress';
import { BacklogBoard } from '../components/backlog/BacklogBoard';
import styles from './BacklogPage.module.css';

export function BacklogPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { tasks, loading, error } = useAppData();
  const [areaFilter, setAreaFilter] = useState<string | null>(null);

  const areas = useMemo(() => getUniqueAreas(tasks), [tasks]);
  const filtered = useMemo(
    () => filterTasksByArea(tasks, areaFilter),
    [tasks, areaFilter],
  );
  const stats = useMemo(() => computeBacklogStats(filtered), [filtered]);
  const areaSummaries = useMemo(() => groupTasksByArea(tasks), [tasks]);

  if (loading) return <p className={styles.loading}>Cargando...</p>;
  if (error) return <p className={styles.error}>{error}</p>;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <div className={styles.subtitle}>VISTA OPERATIVA</div>
          <h1 className={styles.title}>Backlog</h1>
        </div>
        <p className={styles.description}>
          Seguimiento de tareas por estado y avance en cada proyecto o ámbito.
        </p>
      </header>

      <div className={`${styles.statsGrid} ${isMobile ? styles.statsGridMobile : ''}`}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>PENDIENTES</div>
          <div className={styles.statValue}>{stats.pending}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>EN CURSO</div>
          <div className={styles.statValueAccent}>{stats.inProgress}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>COMPLETADAS</div>
          <div className={styles.statValue}>{stats.completed}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>AVANCE GLOBAL</div>
          <div className={styles.statValue}>{stats.overallProgress}%</div>
        </div>
      </div>

      <AreaProgress areas={areaSummaries} />

      {areas.length > 0 && (
        <div className={styles.filters}>
          <span className={styles.filterLabel}>FILTRAR POR ÁMBITO</span>
          <div className={styles.chips}>
            <button
              type="button"
              className={`${styles.chip} ${areaFilter === null ? styles.chipActive : ''}`}
              onClick={() => setAreaFilter(null)}
            >
              Todos ({tasks.length})
            </button>
            {areas.map((area) => {
              const count = tasks.filter((t) => getAreaLabel(t.area) === area).length;
              return (
                <button
                  key={area}
                  type="button"
                  className={`${styles.chip} ${areaFilter === area ? styles.chipActive : ''}`}
                  onClick={() => setAreaFilter(area)}
                >
                  {area} ({count})
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className={styles.boardSection}>
        <div className={styles.boardHeader}>
          <span className={styles.boardLabel}>TABLERO DE ESTADO</span>
          {stats.checklistProgress > 0 && (
            <span className={styles.checklistHint}>
              Subtareas: {stats.checklistProgress}% completadas
            </span>
          )}
        </div>
        <BacklogBoard tasks={filtered} onTaskClick={(id) => navigate(`/tarea/${id}`)} />
      </div>
    </div>
  );
}
