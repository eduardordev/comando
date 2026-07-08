import { QUADRANT_META } from '@comando/shared';
import type { Quadrant } from '@comando/shared';
import styles from './QuadrantTag.module.css';

export function QuadrantTag({ quadrant }: { quadrant: Quadrant }) {
  const meta = QUADRANT_META[quadrant];
  return (
    <span
      className={styles.tag}
      style={{
        color: meta.color,
        background: meta.dim,
        borderColor: meta.color,
      }}
    >
      {meta.label}
    </span>
  );
}
