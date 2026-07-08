import { useRef, type DragEvent, type KeyboardEvent } from 'react';
import type { Task } from '@comando/shared';
import { QUADRANT_META } from '@comando/shared';
import { taskChecklistProgress } from '../../lib/backlog';
import { formatDueDateShort, getDueStatus } from '../../lib/format';
import styles from './BacklogTaskCard.module.css';

interface Props {
  task: Task;
  isDragging?: boolean;
  onClick: () => void;
  onDragStart: (event: DragEvent, taskId: string) => void;
  onDragEnd: () => void;
}

export function BacklogTaskCard({
  task,
  isDragging = false,
  onClick,
  onDragStart,
  onDragEnd,
}: Props) {
  const draggedRef = useRef(false);
  const meta = QUADRANT_META[task.quadrant];
  const progress = task.status === 'completed' ? 100 : taskChecklistProgress(task);
  const hasChecklist = task.checklist.length > 0;

  const handleClick = () => {
    if (draggedRef.current) return;
    onClick();
  };

  return (
    <div
      draggable
      onDragStart={(event) => {
        draggedRef.current = true;
        onDragStart(event, task.id);
      }}
      onDragEnd={() => {
        onDragEnd();
        setTimeout(() => {
          draggedRef.current = false;
        }, 0);
      }}
      onClick={handleClick}
      onKeyDown={(event: KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleClick();
        }
      }}
      role="button"
      tabIndex={0}
      className={`${styles.card} ${isDragging ? styles.dragging : ''}`}
    >
      <div className={styles.top}>
        <span className={styles.dot} style={{ background: meta.color }} />
        <span className={styles.title}>{task.title}</span>
      </div>
      {task.area && <span className={styles.area}>{task.area}</span>}
      {task.dueDate && task.status === 'pending' && (
        <span
          className={`${styles.due} ${
            getDueStatus(task.dueDate) === 'overdue'
              ? styles.dueOverdue
              : getDueStatus(task.dueDate) !== 'normal'
                ? styles.dueSoon
                : ''
          }`}
        >
          {getDueStatus(task.dueDate) === 'overdue' ? 'VENCIDA · ' : ''}
          {formatDueDateShort(task.dueDate)}
        </span>
      )}
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
    </div>
  );
}
