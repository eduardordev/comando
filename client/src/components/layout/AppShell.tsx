import { NavLink, Outlet } from 'react-router-dom';
import { getLevelInfo } from '@comando/shared';
import { useAppData } from '../../hooks/useAppData';
import { useIsMobile } from '../../hooks/useIsMobile';
import { BrandLogo } from './BrandLogo';
import styles from './AppShell.module.css';

export function AppShell() {
  const isMobile = useIsMobile();
  const { stats } = useAppData();
  const levelInfo = stats ? getLevelInfo(stats.points) : null;

  return (
    <div className={styles.container}>
      {isMobile ? (
        <header className={styles.mobileTop}>
          <div className={styles.brand}>
            <BrandLogo size="sm" />
            <span className={styles.brandName}>COMANDO DEL DÍA</span>
          </div>
          <div className={styles.mobileStats}>
            <span className={styles.streak}>{stats?.streak ?? 0}d</span>
            <span className={styles.points}>{stats?.points ?? 0}pt</span>
          </div>
        </header>
      ) : (
        <aside className={styles.sidebar}>
          <div>
            <div className={styles.brandBlock}>
              <BrandLogo />
              <div>
                <div className={styles.brandName}>COMANDO DEL DÍA</div>
                <div className={styles.brandSub}>CENTRO DE MANDO PERSONAL</div>
              </div>
            </div>

            <nav className={styles.nav}>
              <NavLink to="/" end className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
                {({ isActive }) => (
                  <>
                    <span className={`${styles.navBar} ${isActive ? styles.navBarActive : ''}`} />
                    HOY
                  </>
                )}
              </NavLink>
              <NavLink to="/semana" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
                {({ isActive }) => (
                  <>
                    <span className={`${styles.navBar} ${isActive ? styles.navBarActive : ''}`} />
                    SEMANA
                  </>
                )}
              </NavLink>
              <NavLink to="/backlog" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
                {({ isActive }) => (
                  <>
                    <span className={`${styles.navBar} ${isActive ? styles.navBarActive : ''}`} />
                    BACKLOG
                  </>
                )}
              </NavLink>
              <NavLink to="/nueva" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
                {({ isActive }) => (
                  <>
                    <span className={`${styles.navBar} ${isActive ? styles.navBarActive : ''}`} />
                    NUEVA TAREA
                  </>
                )}
              </NavLink>
              <NavLink to="/stats" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
                {({ isActive }) => (
                  <>
                    <span className={`${styles.navBar} ${isActive ? styles.navBarActive : ''}`} />
                    ESTADÍSTICAS
                  </>
                )}
              </NavLink>
            </nav>
          </div>

          {levelInfo && stats && (
            <div className={styles.rankCard}>
              <div className={styles.rankHeader}>
                <span>RANGO</span>
                <span>NIVEL {levelInfo.level}</span>
              </div>
              <div className={styles.rankName}>{levelInfo.rank}</div>
              <div className={styles.levelBar}>
                <div className={styles.levelFill} style={{ width: `${levelInfo.progress}%` }} />
              </div>
              <div className={styles.rankFooter}>
                <span>{stats.points} PTS</span>
                <span>+{levelInfo.pointsToNext} sig.</span>
              </div>
            </div>
          )}
        </aside>
      )}

      <main className={`${styles.main} ${isMobile ? styles.mainMobile : ''}`}>
        <Outlet />
      </main>

      {isMobile && (
        <nav className={styles.mobileNav}>
          <NavLink to="/" end className={styles.mobileNavItem}>
            {({ isActive }) => (
              <>
                <span className={`${styles.mobileIndicator} ${isActive ? styles.mobileIndicatorActive : ''}`} />
                HOY
              </>
            )}
          </NavLink>
          <NavLink to="/semana" className={styles.mobileNavItem}>
            {({ isActive }) => (
              <>
                <span className={`${styles.mobileIndicator} ${isActive ? styles.mobileIndicatorActive : ''}`} />
                SEMANA
              </>
            )}
          </NavLink>
          <NavLink to="/backlog" className={styles.mobileNavItem}>
            {({ isActive }) => (
              <>
                <span className={`${styles.mobileIndicator} ${isActive ? styles.mobileIndicatorActive : ''}`} />
                BACKLOG
              </>
            )}
          </NavLink>
          <NavLink to="/nueva" className={styles.mobileNavItem}>
            {({ isActive }) => (
              <>
                <span className={`${styles.mobileIndicator} ${isActive ? styles.mobileIndicatorActive : ''}`} />
                NUEVA
              </>
            )}
          </NavLink>
          <NavLink to="/stats" className={styles.mobileNavItem}>
            {({ isActive }) => (
              <>
                <span className={`${styles.mobileIndicator} ${isActive ? styles.mobileIndicatorActive : ''}`} />
                STATS
              </>
            )}
          </NavLink>
        </nav>
      )}
    </div>
  );
}
