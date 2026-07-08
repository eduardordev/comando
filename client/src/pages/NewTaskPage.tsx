import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPoints, getQuadrant, QUADRANT_META } from '@comando/shared';
import { useAppData } from '../hooks/useAppData';
import { useIsMobile } from '../hooks/useIsMobile';
import { QuadrantTag } from '../components/shared/QuadrantTag';
import styles from './NewTaskPage.module.css';

export function NewTaskPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { createTask } = useAppData();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [urgent, setUrgent] = useState(false);
  const [important, setImportant] = useState(false);
  const [subtaskInput, setSubtaskInput] = useState('');
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const quadrant = getQuadrant(urgent, important);
  const points = getPoints(urgent, important);
  const meta = QUADRANT_META[quadrant];
  const canSubmit = title.trim().length > 0;

  const addSubtask = () => {
    const text = subtaskInput.trim();
    if (!text) return;
    setSubtasks((prev) => [...prev, text]);
    setSubtaskInput('');
  };

  const removeSubtask = (index: number) => {
    setSubtasks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await createTask({
        title: title.trim(),
        description: description.trim(),
        urgent,
        important,
        checklist: subtasks.map((text) => ({ text })),
      });
      navigate('/');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Desplegar nuevo objetivo</h1>

      <div className={`${styles.grid} ${isMobile ? styles.gridMobile : ''}`}>
        <div className={styles.form}>
          <label className={styles.field}>
            <span className={styles.label}>TÍTULO</span>
            <input
              className={styles.input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Terminar propuesta del cliente"
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>DESCRIPCIÓN</span>
            <textarea
              className={styles.textarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalles, contexto, criterios de éxito..."
              rows={5}
            />
          </label>

          <div className={`${styles.toggles} ${isMobile ? styles.togglesMobile : ''}`}>
            <div className={styles.field}>
              <span className={styles.label}>¿ES URGENTE?</span>
              <button
                type="button"
                className={`${styles.toggle} ${urgent ? styles.toggleOn : ''}`}
                onClick={() => setUrgent(!urgent)}
              >
                <span className={`${styles.knob} ${urgent ? styles.knobOn : ''}`} />
                <span>{urgent ? 'SÍ, ES URGENTE' : 'NO ES URGENTE'}</span>
              </button>
            </div>
            <div className={styles.field}>
              <span className={styles.label}>¿ES DE ALTO IMPACTO?</span>
              <button
                type="button"
                className={`${styles.toggle} ${important ? styles.toggleOn : ''}`}
                onClick={() => setImportant(!important)}
              >
                <span className={`${styles.knob} ${important ? styles.knobOn : ''}`} />
                <span>{important ? 'SÍ, ES IMPORTANTE' : 'NO ES CRÍTICO'}</span>
              </button>
            </div>
          </div>

          <div className={styles.field}>
            <span className={styles.label}>SUBTAREAS</span>
            <div className={styles.subtaskRow}>
              <input
                className={styles.input}
                value={subtaskInput}
                onChange={(e) => setSubtaskInput(e.target.value)}
                placeholder="Agregar paso..."
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSubtask())}
              />
              <button type="button" className={styles.addBtn} onClick={addSubtask}>
                Agregar
              </button>
            </div>
            <div className={styles.subtaskList}>
              {subtasks.map((text, i) => (
                <div key={i} className={styles.subtaskItem}>
                  <span>{text}</span>
                  <button type="button" className={styles.removeBtn} onClick={() => removeSubtask(i)}>
                    Quitar
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            className={`${styles.submit} ${canSubmit ? styles.submitActive : ''}`}
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
          >
            {submitting ? 'DESPLEGANDO...' : 'DESPLEGAR TAREA'}
          </button>
        </div>

        <aside className={styles.preview}>
          <div className={styles.previewLabel}>CLASIFICACIÓN AUTOMÁTICA</div>
          <QuadrantTag quadrant={quadrant} />
          <p className={styles.explanation}>
            Urgencia: {urgent ? 'sí' : 'no'}. Impacto declarado: {important ? 'alto' : 'normal'}.
            Cuadrante asignado: {meta.label}.
          </p>
          <div className={styles.previewPoints}>
            <div className={styles.previewPointsLabel}>OTORGARÁ</div>
            <div className={styles.previewPointsValue}>+{points} pts</div>
          </div>
        </aside>
      </div>
    </div>
  );
}
