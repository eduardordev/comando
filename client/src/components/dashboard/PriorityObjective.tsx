import type { Task } from '@comando/shared';
import { QUADRANT_META } from '@comando/shared';
import { useNavigate } from 'react-router-dom';
import { QuadrantTag } from '../shared/QuadrantTag';
import { taskMeta } from '../../lib/format';
import styles from './PriorityObjective.module.css';

interface Props {
  task: Task;
  onComplete: (id: string) => void;
}

export function PriorityObjective({ task, onComplete }: Props) {
  const navigate = useNavigate();
  const meta = taskMeta(task);

  return (
    <div className={styles.card}>
      <span className={styles.cornerTL} />
      <span className={styles.cornerTR} />
      <span className={styles.cornerBL} />
      <span className={styles.cornerBR} />

      <div className={styles.inner}>
        <div className={styles.content}>
          <div className={styles.labelRow}>
            <span className={styles.label}>OBJETIVO PRIORITARIO</span>
            <QuadrantTag quadrant={task.quadrant} />
          </div>
          <h2 className={styles.title}>{task.title}</h2>
          <p className={styles.meta}>
            {QUADRANT_META[task.quadrant].sub}
            {meta ? ` · ${meta}` : ''} · otorga +{task.points} pts
          </p>
        </div>
        <div className={styles.actions}>
          <button type="button" className={styles.secondary} onClick={() => navigate(`/tarea/${task.id}`)}>
            Ver ticket
          </button>
          <button type="button" className={styles.primary} onClick={() => onComplete(task.id)}>
            Marcar cumplido
          </button>
        </div>
      </div>
    </div>
  );
}
