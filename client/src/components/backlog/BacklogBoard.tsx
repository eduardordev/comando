import { useMemo, useState, type DragEvent } from 'react';
import type { UpdateTaskInput } from '@comando/shared';
import type { Task } from '@comando/shared';
import { buildStageTransitionPatch, getBacklogStage, type BacklogStage } from '../../lib/backlog';
import { BacklogTaskCard } from './BacklogTaskCard';
import styles from './BacklogBoard.module.css';

const COLUMNS: { id: BacklogStage; label: string; hint: string }[] = [
  { id: 'backlog', label: 'BACKLOG', hint: 'sin empezar' },
  { id: 'in_progress', label: 'EN CURSO', hint: 'con avance' },
  { id: 'completed', label: 'COMPLETADAS', hint: 'cerradas' },
];

const DRAG_MIME = 'application/x-comando-task-id';

interface Props {
  tasks: Task[];
  onTaskClick: (id: string) => void;
  onStageChange: (taskId: string, patch: UpdateTaskInput) => Promise<unknown>;
}

export function BacklogBoard({ tasks, onTaskClick, onStageChange }: Props) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<BacklogStage | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);

  const grouped = useMemo(
    () => ({
      backlog: tasks.filter((t) => getBacklogStage(t) === 'backlog'),
      in_progress: tasks.filter((t) => getBacklogStage(t) === 'in_progress'),
      completed: tasks
        .filter((t) => getBacklogStage(t) === 'completed')
        .sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? '')),
    }),
    [tasks],
  );

  const handleDragStart = (event: DragEvent, taskId: string) => {
    event.dataTransfer.setData(DRAG_MIME, taskId);
    event.dataTransfer.effectAllowed = 'move';
    setDraggingId(taskId);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDropTarget(null);
  };

  const handleDragOver = (event: DragEvent, stage: BacklogStage) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setDropTarget(stage);
  };

  const handleDrop = async (event: DragEvent, targetStage: BacklogStage) => {
    event.preventDefault();
    const taskId = event.dataTransfer.getData(DRAG_MIME);
    const task = tasks.find((t) => t.id === taskId);
    if (!task) {
      handleDragEnd();
      return;
    }

    const patch = buildStageTransitionPatch(task, targetStage);
    handleDragEnd();

    if (!patch) return;

    setMovingId(taskId);
    try {
      await onStageChange(taskId, patch);
    } finally {
      setMovingId(null);
    }
  };

  return (
    <div className={styles.board}>
      {COLUMNS.map((col) => {
        const items = grouped[col.id];
        const isDropTarget = dropTarget === col.id && draggingId !== null;

        return (
          <section
            key={col.id}
            className={`${styles.column} ${isDropTarget ? styles.columnDropTarget : ''}`}
            onDragOver={(event) => handleDragOver(event, col.id)}
            onDragLeave={() => setDropTarget((prev) => (prev === col.id ? null : prev))}
            onDrop={(event) => void handleDrop(event, col.id)}
          >
            <header className={styles.header}>
              <span className={styles.label}>{col.label}</span>
              <span className={styles.count}>
                {items.length} · {col.hint}
              </span>
            </header>
            <div className={styles.list}>
              {items.map((task) => (
                <BacklogTaskCard
                  key={task.id}
                  task={task}
                  isDragging={draggingId === task.id || movingId === task.id}
                  onClick={() => onTaskClick(task.id)}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                />
              ))}
              {items.length === 0 && (
                <p className={styles.empty}>
                  {isDropTarget ? 'Soltar aquí' : 'Sin tareas en esta columna.'}
                </p>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
