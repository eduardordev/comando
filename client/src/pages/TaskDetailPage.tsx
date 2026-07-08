import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { QUADRANT_META } from '@comando/shared';
import type { ChecklistItem, UpdateTaskInput } from '@comando/shared';
import { useAppData } from '../hooks/useAppData';
import { useIsMobile } from '../hooks/useIsMobile';
import { QuadrantTag } from '../components/shared/QuadrantTag';
import styles from './TaskDetailPage.module.css';

function checklistChanged(a: ChecklistItem[], b: ChecklistItem[]): boolean {
  return JSON.stringify(a) !== JSON.stringify(b);
}

export function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { tasks, updateTask, completeTask, deleteTask } = useAppData();

  const task = tasks.find((t) => t.id === id);

  const [title, setTitle] = useState('');
  const [area, setArea] = useState('');
  const [description, setDescription] = useState('');
  const [urgent, setUrgent] = useState(false);
  const [important, setImportant] = useState(false);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [subtaskInput, setSubtaskInput] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setArea(task.area);
      setDescription(task.description);
      setUrgent(task.urgent);
      setImportant(task.important);
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

  const handleTitleBlur = () => {
    const trimmed = title.trim();
    if (!trimmed || trimmed === task.title) return;
    saveField({ title: trimmed });
  };

  const handleAreaBlur = () => {
    const trimmed = area.trim();
    if (trimmed === task.area) return;
    saveField({ area: trimmed });
  };

  const handleDescriptionBlur = () => {
    if (description !== task.description) {
      saveField({ description });
    }
  };

  const toggleUrgent = async () => {
    const next = !urgent;
    setUrgent(next);
    await saveField({ urgent: next });
  };

  const toggleImportant = async () => {
    const next = !important;
    setImportant(next);
    await saveField({ important: next });
  };

  const toggleSubtask = async (subId: string) => {
    const next = checklist.map((s) =>
      s.id === subId ? { ...s, completed: !s.completed } : s,
    );
    setChecklist(next);
    await saveField({ checklist: next });
  };

  const updateSubtaskText = (subId: string, text: string) => {
    setChecklist((prev) => prev.map((s) => (s.id === subId ? { ...s, text } : s)));
  };

  const saveChecklist = async () => {
    if (!checklistChanged(checklist, task.checklist)) return;
    await saveField({ checklist });
  };

  const addSubtask = async () => {
    const text = subtaskInput.trim();
    if (!text) return;
    const next: ChecklistItem[] = [
      ...checklist,
      { id: crypto.randomUUID(), text, completed: false },
    ];
    setChecklist(next);
    setSubtaskInput('');
    await saveField({ checklist: next });
  };

  const removeSubtask = async (subId: string) => {
    const next = checklist.filter((s) => s.id !== subId);
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
            {isCompleted ? (
              <h1 className={styles.title}>{task.title}</h1>
            ) : (
              <input
                className={styles.titleInput}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleBlur}
                placeholder="Título de la tarea..."
              />
            )}
          </div>

          <textarea
            className={styles.description}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={handleDescriptionBlur}
            rows={6}
            placeholder="Descripción de la tarea..."
            readOnly={isCompleted}
          />

          <div className={styles.checklistSection}>
            <div className={styles.checklistLabel}>
              CHECKLIST — {doneCount}/{checklist.length}
            </div>
            {!isCompleted && (
              <div className={styles.subtaskRow}>
                <input
                  className={styles.subtaskInput}
                  value={subtaskInput}
                  onChange={(e) => setSubtaskInput(e.target.value)}
                  placeholder="Agregar paso..."
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSubtask())}
                />
                <button type="button" className={styles.addBtn} onClick={addSubtask}>
                  Agregar
                </button>
              </div>
            )}
            {checklist.length === 0 ? (
              <p className={styles.emptyChecklist}>Sin subtareas registradas.</p>
            ) : (
              checklist.map((sub) => (
                <div key={sub.id} className={styles.checkItem}>
                  <button
                    type="button"
                    className={styles.checkboxBtn}
                    onClick={() => !isCompleted && toggleSubtask(sub.id)}
                    disabled={isCompleted}
                    aria-label={sub.completed ? 'Marcar pendiente' : 'Marcar completada'}
                  >
                    <span
                      className={`${styles.checkbox} ${sub.completed ? styles.checkboxDone : ''}`}
                    />
                  </button>
                  {isCompleted ? (
                    <span className={sub.completed ? styles.checkTextDone : styles.checkText}>
                      {sub.text}
                    </span>
                  ) : (
                    <input
                      className={`${styles.checkInput} ${sub.completed ? styles.checkInputDone : ''}`}
                      value={sub.text}
                      onChange={(e) => updateSubtaskText(sub.id, e.target.value)}
                      onBlur={saveChecklist}
                    />
                  )}
                  {!isCompleted && (
                    <button
                      type="button"
                      className={styles.removeBtn}
                      onClick={() => removeSubtask(sub.id)}
                    >
                      Quitar
                    </button>
                  )}
                </div>
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

          {!isCompleted && (
            <div className={`${styles.toggles} ${isMobile ? styles.togglesMobile : ''}`}>
              <div className={styles.field}>
                <div className={styles.fieldLabel}>¿ES URGENTE?</div>
                <button
                  type="button"
                  className={`${styles.toggle} ${urgent ? styles.toggleOn : ''}`}
                  onClick={toggleUrgent}
                >
                  <span className={`${styles.knob} ${urgent ? styles.knobOn : ''}`} />
                  <span>{urgent ? 'SÍ, ES URGENTE' : 'NO ES URGENTE'}</span>
                </button>
              </div>
              <div className={styles.field}>
                <div className={styles.fieldLabel}>¿ES DE ALTO IMPACTO?</div>
                <button
                  type="button"
                  className={`${styles.toggle} ${important ? styles.toggleOn : ''}`}
                  onClick={toggleImportant}
                >
                  <span className={`${styles.knob} ${important ? styles.knobOn : ''}`} />
                  <span>{important ? 'SÍ, ES IMPORTANTE' : 'NO ES CRÍTICO'}</span>
                </button>
              </div>
            </div>
          )}

          <div className={styles.field}>
            <div className={styles.fieldLabel}>PROYECTO / ÁMBITO</div>
            {isCompleted ? (
              <div className={styles.fieldValue}>{task.area || '—'}</div>
            ) : (
              <input
                className={styles.sidebarInput}
                value={area}
                onChange={(e) => setArea(e.target.value)}
                onBlur={handleAreaBlur}
                placeholder="Ej. Trabajo, Finanzas..."
              />
            )}
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
