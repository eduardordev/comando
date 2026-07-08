import type { Task } from '@comando/shared';
import { QUADRANT_META } from '@comando/shared';
import { taskChecklistProgress } from '../../lib/backlog';
import styles from './BacklogTaskCard.module.css';

interface Props {
  task: Task;
  onClick: () => void;
}

export function BacklogTaskCard({ task, onClick }: Props) {
  const meta = QUADRANT_META[task.quadrant];
  const progress = task.status === 'completed' ? 100 : taskChecklistProgress(task);
  const hasChecklist = task.checklist.length > 0;

  return (
    <button type="button" className={styles.card} onClick={onClick}>
      <div className={styles.top}>
        <span className={styles.dot} style={{ background: meta.color }} />
        <span className={styles.title}>{task.title}</span>
      </div>
      {task.area && <span className={styles.area}>{task.area}</span>}
      {hasChecklist && (
        <div className={styles.progressRow}>
          <div className={styles.progressTrack}>
            <div
              className={styles.progressFill}
              style={{ width: `${progress}%`, background: meta.color }}
            />
          </div>
          <span className={styles.progressLabel}>{progress}%</span>
        </div>
      )}
      <div className={styles.footer}>
        <span className={styles.quadrant}>{meta.label}</span>
        <span className={styles.points} style={{ color: meta.color }}>
          +{task.points}
        </span>
      </div>
    </button>
  );
}
