import type { Task, Quadrant } from '@comando/shared';
import { QUADRANT_META } from '@comando/shared';
import { useNavigate } from 'react-router-dom';
import { taskMeta } from '../../lib/format';
import styles from './QuadrantBoard.module.css';

const QUADRANT_ORDER: { q: Quadrant; hint: string }[] = [
  { q: 1, hint: 'urgente + importante' },
  { q: 2, hint: 'importante' },
  { q: 3, hint: 'urgente' },
  { q: 4, hint: 'ni urgente ni importante' },
];

interface Props {
  tasks: Task[];
}

export function QuadrantBoard({ tasks }: Props) {
  const navigate = useNavigate();
  const pending = tasks.filter((t) => t.status === 'pending');

  return (
    <div className={styles.grid}>
      {QUADRANT_ORDER.map(({ q, hint }) => {
        const meta = QUADRANT_META[q];
        const items = pending.filter((t) => t.quadrant === q);

        return (
          <section
            key={q}
            className={styles.column}
            style={{ borderTopColor: meta.color }}
          >
            <header className={styles.header}>
              <span className={styles.title} style={{ color: meta.color }}>
                {meta.label}
              </span>
              <span className={styles.count}>
                {items.length} · {hint}
              </span>
            </header>

            <div className={styles.list}>
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={styles.item}
                  onClick={() => navigate(`/tarea/${item.id}`)}
                >
                  <div className={styles.itemText}>
                    <div className={styles.itemTitle}>{item.title}</div>
                    <div className={styles.itemMeta}>{taskMeta(item) || meta.sub}</div>
                  </div>
                  <span className={styles.points} style={{ color: meta.color }}>
                    +{item.points}
                  </span>
                </button>
              ))}
              {items.length === 0 && (
                <p className={styles.empty}>Sin pendientes en este cuadrante.</p>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
