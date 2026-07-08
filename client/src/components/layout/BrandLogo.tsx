import styles from './AppShell.module.css';

interface BrandLogoProps {
  size?: 'sm' | 'md';
}

export function BrandLogo({ size = 'md' }: BrandLogoProps) {
  return (
    <img
      src="/logo.ico"
      alt="Comando del Día"
      className={size === 'sm' ? styles.logoSm : styles.logo}
      draggable={false}
    />
  );
}
