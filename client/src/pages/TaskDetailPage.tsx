import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { QUADRANT_META } from '@comando/shared';
import type { ChecklistItem, UpdateTaskInput } from '@comando/shared';
import { useAppData } from '../hooks/useAppData';
import { useIsMobile } from '../hooks/useIsMobile';
import { QuadrantTag } from '../components/shared/QuadrantTag';
import styles from './TaskDetailPage.module.css';

export function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { tasks, updateTask, completeTask, deleteTask } = useAppData();

  const task = tasks.find((t) => t.id === id);

  const [description, setDescription] = useState('');
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (task) {
      setDescription(task.description);
      setChecklist(task.checklist);
    }
  }, [task]);

  if (!task) {
    return (
      <div className={styles.page}>
        <p>Tarea no encontrada.</p>
        <Link to="/">← Volver</Link>
      </div>
    );
  }

  const doneCount = checklist.filter((s) => s.completed).length;
  const isCompleted = task.status === 'completed';

  const saveField = async (patch: UpdateTaskInput) => {
    if (!id) return;
    setSaving(true);
    try {
      await updateTask(id, patch);
    } finally {
      setSaving(false);
    }
  };

  const handleDescriptionBlur = () => {
    if (description !== task.description) {
      saveField({ description });
    }
  };

  const toggleSubtask = async (subId: string) => {
    const next = checklist.map((s) =>
      s.id === subId ? { ...s, completed: !s.completed } : s,
    );
    setChecklist(next);
    await saveField({ checklist: next });
  };

  const handleComplete = async () => {
    if (isCompleted) return;
    await completeTask(task.id);
    navigate('/');
  };

  const handleDelete = async () => {
    if (!confirm('¿Eliminar esta tarea?')) return;
    await deleteTask(task.id);
    navigate('/');
  };

  return (
    <div className={styles.page}>
      <div className={styles.top}>
        <Link to="/" className={styles.back}>
          ← VOLVER
        </Link>
        <span className={styles.breadcrumb}>HOY / TICKET-{task.id.slice(0, 8).toUpperCase()}</span>
      </div>

      <div className={`${styles.grid} ${isMobile ? styles.gridMobile : ''}`}>
        <div className={styles.main}>
          <div>
            <QuadrantTag quadrant={task.quadrant} />
            <h1 className={styles.title}>{task.title}</h1>
          </div>

          <textarea
            className={styles.description}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={handleDescriptionBlur}
            rows={6}
            placeholder="Descripción de la tarea..."
          />

          <div className={styles.checklistSection}>
            <div className={styles.checklistLabel}>
              CHECKLIST — {doneCount}/{checklist.length}
            </div>
            {checklist.length === 0 ? (
              <p className={styles.emptyChecklist}>Sin subtareas registradas.</p>
            ) : (
              checklist.map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  className={styles.checkItem}
                  onClick={() => toggleSubtask(sub.id)}
                >
                  <span
                    className={`${styles.checkbox} ${sub.completed ? styles.checkboxDone : ''}`}
                  />
                  <span className={sub.completed ? styles.checkTextDone : styles.checkText}>
                    {sub.text}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        <aside className={styles.sidebar}>
          <div className={styles.field}>
            <div className={styles.fieldLabel}>ESTADO</div>
            <span className={isCompleted ? styles.statusDone : styles.statusPending}>
              {isCompleted ? 'COMPLETADA' : 'PENDIENTE'}
            </span>
          </div>

          <div className={styles.field}>
            <div className={styles.fieldLabel}>CUADRANTE</div>
            <div className={styles.fieldValue}>{QUADRANT_META[task.quadrant].sub}</div>
          </div>

          <div className={styles.field}>
            <div className={styles.fieldLabel}>PUNTOS QUE OTORGA</div>
            <div className={styles.points}>+{task.points}</div>
          </div>

          <button
            type="button"
            className={isCompleted ? styles.btnDone : styles.btnComplete}
            onClick={handleComplete}
            disabled={isCompleted}
          >
            {isCompleted ? 'COMPLETADA ✓' : 'MARCAR COMO COMPLETADA'}
          </button>

          <button type="button" className={styles.btnDelete} onClick={handleDelete}>
            Eliminar tarea
          </button>

          {saving && <p className={styles.saving}>Guardando...</p>}
        </aside>
      </div>
    </div>
  );
}
