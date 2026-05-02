import { useNavigate } from 'react-router-dom';
import { TrendingUp, ChevronRight, Plus, Mic, Target, FileText, Sparkles } from 'lucide-react';
import PageLayout from '../components/PageLayout';
import Card from '../components/Card';
import StatusChip from '../components/StatusChip';
import Button from '../components/Button';
import { useAppContext } from '../context/AppContext';
import './DashboardPage.css';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { userProfile, interviewHistory } = useAppContext();

  // If we have history, get the average score. Otherwise default to a placeholder.
  const hasHistory = interviewHistory.length > 0;
  const avgScore = hasHistory
    ? Math.round(interviewHistory.reduce((s, i) => s + i.score, 0) / interviewHistory.length)
    : '--';

  return (
    <PageLayout>
      <div className="dashboard page-enter">
        {/* Header */}
        <header className="dashboard__header">
          <div className="dashboard__header-text">
            <p className="dashboard__greeting">Good morning 👋</p>
            <h1 className="dashboard__name">Welcome back, {userProfile?.name || 'Guest'}!</h1>
          </div>
          <button
            id="btn-profile-avatar"
            className="dashboard__avatar"
            onClick={() => navigate('/profile')}
            aria-label="Open profile"
          >
            {userProfile?.avatar || 'G'}
          </button>
        </header>

        {/* Progress card */}
        <div className="dashboard__progress-card">
          <div className="dashboard__progress-inner">
            <div className="dashboard__progress-icon">
              <TrendingUp size={20} />
            </div>
            <div className="dashboard__progress-text">
              <p className="dashboard__progress-label">Weekly Progress</p>
              <p className="dashboard__progress-value">You're 15% closer to your dream job than last week!</p>
            </div>
          </div>
          <div className="dashboard__progress-bar-wrap">
            <div className="dashboard__progress-bar">
              <div className="dashboard__progress-fill" style={{ width: '65%' }} />
            </div>
            <span className="dashboard__progress-pct">65%</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="dashboard__stats">
          {[
            { label: 'Interviews', value: hasHistory ? interviewHistory.length.toString() : '0', icon: Mic },
            { label: 'Avg Score', value: hasHistory ? `${avgScore}%` : '--', icon: Target },
            { label: 'Total Focus', value: hasHistory ? `${(interviewHistory.length * 0.25).toFixed(1)}h` : '0h', icon: TrendingUp },
          ].map(({ label, value, icon: Icon }) => (
            <Card key={label} className="dashboard__stat-card">
              <Icon size={18} className="dashboard__stat-icon" />
              <p className="dashboard__stat-value">{value}</p>
              <p className="dashboard__stat-label">{label}</p>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <Button
          id="btn-start-interview"
          variant="primary"
          size="lg"
          fullWidth
          icon={Plus}
          onClick={() => navigate('/interview/setup')}
        >
          Start New Interview
        </Button>

        {/* Resume Analyzer promo card */}
        <Card
          id="card-resume-analyzer"
          className="dashboard__resume-card"
          onClick={() => navigate('/resume-analyzer')}
        >
          <div className="dashboard__resume-icon">
            <FileText size={22} />
          </div>
          <div className="dashboard__resume-text">
            <p className="dashboard__resume-title">AI Resume Analyzer</p>
            <p className="dashboard__resume-sub">Get scored, get hired — 2026 trend-aligned feedback</p>
          </div>
          <div className="dashboard__resume-badge">
            <Sparkles size={12} />
            New
          </div>
        </Card>

        {/* Recent Activity */}
        <section className="dashboard__section">
          <div className="dashboard__section-header">
            <h2 className="dashboard__section-title">Recent Activity</h2>
            <button
              id="btn-view-history"
              className="dashboard__see-all"
              onClick={() => navigate('/history')}
            >
              See all
            </button>
          </div>

          <div className="dashboard__activity-list">
            {!hasHistory ? (
              <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '14px', textAlign: 'center', padding: 'var(--space-4) 0' }}>
                No recent activity. Start your first interview!
              </p>
            ) : (
              interviewHistory.slice(0, 3).map(item => (
                <Card
                  key={item.id}
                  id={`activity-card-${item.id}`}
                  className="dashboard__activity-card"
                  onClick={() => navigate('/report')}
                >
                  <div className="dashboard__activity-info">
                    <p className="dashboard__activity-role">{item.role}</p>
                    <p className="dashboard__activity-meta">{item.company} · {item.date}</p>
                  </div>
                  <div className="dashboard__activity-right">
                    <StatusChip status="score" score={item.score} />
                    <ChevronRight size={16} className="dashboard__activity-arrow" />
                  </div>
                </Card>
              ))
            )}
          </div>
        </section>

        {/* Tips card */}
        <Card glass className="dashboard__tip-card">
          <p className="dashboard__tip-label">💡 AI Tip of the Day</p>
          <p className="dashboard__tip-text">
            Use the STAR method (Situation, Task, Action, Result) when answering behavioral questions.
            It keeps your answers concise and impactful.
          </p>
        </Card>
      </div>
    </PageLayout>
  );
}
