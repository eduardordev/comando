import type { ChainDay } from '@comando/shared';
import { chainLinkStyle } from '../../lib/chainStyles';
import styles from './ChainLinks.module.css';

export function ChainLinks({ days }: { days: ChainDay[] }) {
  return (
    <div className={styles.row}>
      {days.map((day, i) => (
        <div key={day.date} style={chainLinkStyle(day, i)} title={day.date} />
      ))}
    </div>
  );
}
