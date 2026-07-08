import type { AreaSummary } from '../../lib/backlog';
import styles from './AreaProgress.module.css';

interface Props {
  areas: AreaSummary[];
}

export function AreaProgress({ areas }: Props) {
  if (areas.length === 0) return null;

  return (
    <div className={styles.card}>
      <div className={styles.label}>AVANCE POR PROYECTO / ÁMBITO</div>
      <div className={styles.list}>
        {areas.map((area) => (
          <div key={area.area} className={styles.row}>
            <div className={styles.rowHeader}>
              <span className={styles.name}>{area.area}</span>
              <span className={styles.stats}>
                {area.completed}/{area.total} · {area.pending} pend.
              </span>
            </div>
            <div className={styles.track}>
              <div className={styles.fill} style={{ width: `${area.progress}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
