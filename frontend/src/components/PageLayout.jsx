import BottomNav from './BottomNav';
import './PageLayout.css';

export default function PageLayout({ children, hideNav = false, className = '' }) {
  return (
    <div className={`page-layout ${className}`}>
      <main className={`page-layout__content ${!hideNav ? 'page-layout__content--with-nav' : ''}`}>
        {children}
      </main>
      {!hideNav && <BottomNav />}
    </div>
  );
}
