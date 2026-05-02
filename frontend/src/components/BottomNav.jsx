import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, History, User } from 'lucide-react';
import './BottomNav.css';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: FileText,        label: 'Resume',    path: '/resume-analyzer' },
  { icon: History,         label: 'History',   path: '/history' },
  { icon: User,            label: 'Profile',   path: '/profile' },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="bottom-nav" role="navigation" aria-label="Main navigation">
      <div className="bottom-nav__inner">
        {navItems.map(({ icon: Icon, label, path }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              id={`nav-${label.toLowerCase()}`}
              className={`bottom-nav__item ${active ? 'bottom-nav__item--active' : ''}`}
              onClick={() => navigate(path)}
              aria-label={label}
              aria-current={active ? 'page' : undefined}
            >
              <span className="bottom-nav__icon-wrap">
                <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
                {active && <span className="bottom-nav__indicator" />}
              </span>
              <span className="bottom-nav__label">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
