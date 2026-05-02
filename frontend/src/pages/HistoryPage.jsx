import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import PageLayout from '../components/PageLayout';
import Card from '../components/Card';
import StatusChip from '../components/StatusChip';
import { useAppContext } from '../context/AppContext';
import './HistoryPage.css';

export default function HistoryPage() {
  const navigate = useNavigate();
  const { interviewHistory } = useAppContext();

  const hasHistory = interviewHistory.length > 0;
  const avgScore = hasHistory
    ? Math.round(interviewHistory.reduce((s, i) => s + i.score, 0) / interviewHistory.length)
    : 0;
  const bestScore = hasHistory
    ? Math.max(...interviewHistory.map(i => i.score))
    : 0;

  return (
    <PageLayout>
      <div className="history page-enter">
        <header className="history__header">
          <h1 className="history__title">Interview History</h1>
          <span className="history__count">{interviewHistory.length} sessions</span>
        </header>

        {/* Summary strip */}
        <div className="history__summary">
          {[
            { label: 'Total Sessions', value: interviewHistory.length },
            { label: 'Avg Score',      value: hasHistory ? `${avgScore}%` : '--' },
            { label: 'Best Score',     value: hasHistory ? `${bestScore}%` : '--' },
          ].map(s => (
            <div key={s.label} className="history__summary-item">
              <p className="history__summary-value">{s.value}</p>
              <p className="history__summary-label">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Session list */}
        <div className="history__list">
          {!hasHistory ? (
            <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '14px', textAlign: 'center', padding: 'var(--space-8) 0' }}>
              No interview sessions recorded yet.
            </p>
          ) : (
            interviewHistory.map(item => (
              <Card
                key={item.id}
                id={`history-item-${item.id}`}
                className="history__item"
                onClick={() => navigate('/report')}
              >
                <div className="history__item-main">
                  <div className="history__item-info">
                    <p className="history__item-role">{item.role}</p>
                    <p className="history__item-meta">{item.company} · {item.date} · {item.duration}</p>
                    <div className="history__item-topics">
                      {item.topics && item.topics.map(t => (
                        <span key={t} className="history__item-topic">{t}</span>
                      ))}
                    </div>
                  </div>
                  <div className="history__item-right">
                    <StatusChip status="score" score={item.score} />
                    <ChevronRight size={16} className="history__item-arrow" />
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </PageLayout>
  );
}
