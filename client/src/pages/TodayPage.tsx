import { useAppData } from '../hooks/useAppData';
import { useIsMobile } from '../hooks/useIsMobile';
import { formatLongDateEs } from '../lib/format';
import { ChainLinks } from '../components/shared/ChainLinks';
import { PriorityObjective } from '../components/dashboard/PriorityObjective';
import { QuadrantBoard } from '../components/dashboard/QuadrantBoard';
import styles from './TodayPage.module.css';

export function TodayPage() {
  const { tasks, stats, loading, error, completeTask } = useAppData();
  const isMobile = useIsMobile();

  if (loading) return <p className={styles.loading}>Cargando...</p>;
  if (error) return <p className={styles.error}>{error}</p>;
  if (!stats) return null;

  const pending = tasks.filter((t) => t.status === 'pending');
  const priority = pending.find((t) => t.urgent && t.important) ?? null;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <div className={styles.dateLabel}>{formatLongDateEs().toUpperCase()}</div>
          <h1 className={styles.title}>Informe de hoy</h1>
        </div>
      </header>

      {stats.streakAtRisk && (
        <div className={styles.alert}>
          <span className={styles.alertBadge}>ALERTA</span>
          <p className={styles.alertText}>
            Racha en riesgo. Completa al menos una tarea hoy antes de medianoche o la cadena se rompe.
          </p>
        </div>
      )}

      <div className={`${styles.statsGrid} ${isMobile ? styles.statsGridMobile : ''}`}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>RACHA ACTIVA</div>
          <div className={styles.streakRow}>
            <span className={styles.streakValue}>{stats.streak}</span>
            <span className={styles.streakUnit}>días</span>
          </div>
          <ChainLinks days={stats.chain14} />
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>PUNTOS TOTALES</div>
          <div className={styles.pointsValue}>{stats.points}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>RANGO ACTUAL</div>
          <div className={styles.rankValue}>{stats.rank}</div>
        </div>
      </div>

      {priority ? (
        <PriorityObjective task={priority} onComplete={completeTask} />
      ) : (
        <div className={styles.clear}>
          <div className={styles.clearTitle}>Terreno despejado, soldado.</div>
          <div className={styles.clearSub}>No hay objetivos pendientes ahora mismo.</div>
        </div>
      )}

      <QuadrantBoard tasks={tasks} />
    </div>
  );
}
