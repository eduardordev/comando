import { useAppData } from '../hooks/useAppData';
import { useIsMobile } from '../hooks/useIsMobile';
import { chainLinkStyle } from '../lib/chainStyles';
import styles from './StatsPage.module.css';

const QUADRANT_COLORS = ['#FF4527', '#3ED598', '#F5B93F', '#5B6472'];
const QUADRANT_NAMES = ['Crítico', 'Estratégico', 'Táctico', 'En espera'];

export function StatsPage() {
  const { stats, loading, error } = useAppData();
  const isMobile = useIsMobile();

  if (loading) return <p className={styles.loading}>Cargando...</p>;
  if (error) return <p className={styles.error}>{error}</p>;
  if (!stats) return null;

  const weeklyMax = Math.max(...stats.weeklyPoints, 1);
  const weekLabels = ['S-5', 'S-4', 'S-3', 'S-2', 'S-1', 'ESTA'];

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Estadísticas de operación</h1>

      <div className={`${styles.topGrid} ${isMobile ? styles.topGridMobile : ''}`}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>RACHA ACTUAL</div>
          <div className={styles.statValueAccent}>{stats.streak} días</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>RACHA MÁXIMA</div>
          <div className={styles.statValue}>{stats.maxStreak} días</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>PUNTOS TOTALES</div>
          <div className={styles.statValue}>{stats.points}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>TAREAS COMPLETADAS</div>
          <div className={styles.statValue}>{stats.totalCompleted}</div>
        </div>
      </div>

      <div className={styles.chainCard}>
        <div className={styles.sectionLabel}>REGISTRO DE CADENA — ÚLTIMAS 12 SEMANAS</div>
        <div className={styles.weeks}>
          {stats.weeksChain.map((week) => (
            <div key={week.label} className={styles.weekRow}>
              <span className={styles.weekLabel}>{week.label}</span>
              <div className={styles.weekDays}>
                {week.days.map((day, i) => (
                  <div key={day.date} style={chainLinkStyle(day, i)} title={day.date} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={`${styles.bottomGrid} ${isMobile ? styles.bottomGridMobile : ''}`}>
        <div className={styles.chartCard}>
          <div className={styles.sectionLabel}>PUNTOS POR SEMANA</div>
          <div className={styles.bars}>
            {stats.weeklyPoints.map((value, idx) => (
              <div key={idx} className={styles.barCol}>
                <span className={styles.barValue}>{value}</span>
                <div
                  className={styles.bar}
                  style={{
                    height: Math.max(6, Math.round((value / weeklyMax) * 130)),
                    background: idx === stats.weeklyPoints.length - 1 ? '#FF4527' : '#333A44',
                  }}
                />
                <span className={styles.barLabel}>{weekLabels[idx]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.quadrantCard}>
          <div className={styles.sectionLabel}>COMPLETADAS POR CUADRANTE</div>
          {[1, 2, 3, 4].map((q, i) => (
            <div key={q} className={styles.quadrantRow}>
              <div className={styles.quadrantName}>
                <span className={styles.dot} style={{ background: QUADRANT_COLORS[i] }} />
                {QUADRANT_NAMES[i]}
              </div>
              <span className={styles.quadrantCount}>
                {stats.completedByQuadrant[String(q)] ?? 0}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
