import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Share2, GitBranch, Sparkles, Target, ClipboardList } from 'lucide-react';
import PageLayout from '../components/PageLayout';
import Card from '../components/Card';
import Button from '../components/Button';
import { useAppContext } from '../context/AppContext';
import './ReportPage.css';

export default function ReportPage() {
  const navigate = useNavigate();
  const { interviewHistory } = useAppContext();

  const recentSession = interviewHistory.length > 0 ? interviewHistory[0] : null;
  const recentQA = recentSession?.qa || [];

  const qaData = recentQA.map((item) => ({
    q: item.q,
    a: item.a,
    feedback:
      item.a.length < 50
        ? 'Your answer is quite brief. Try adding more specific examples using the STAR method.'
        : 'Strong answer with good context. Focus on highlighting your direct impact more clearly.',
    score: Math.min(Math.floor(item.a.length / 5) + 60, 95),
    mindMap: {
      hook: 'Connect your experience directly to the core challenge implied by the question.',
      pillars: [
        "Focus on the 'Action' part of the STAR method.",
        'Highlight collaborative problem-solving skills.',
        'Ensure your tone is professional yet enthusiastic.',
      ],
      metric: 'Link your result to a business KPI like efficiency, cost, or time.',
    },
  }));

  const handleShare = async () => {
    if (!recentSession) return;
    const shareData = {
      title: 'Interview Stimulator Performance',
      text: `I just scored ${recentSession.score}% on my ${recentSession.role} interview simulation!`,
      url: window.location.href,
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch (err) { console.log('Share failed', err); }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareData.text} Check it out: ${shareData.url}`);
        alert('Report summary copied to clipboard!');
      } catch { alert('Could not share report.'); }
    }
  };

  const handleDownload = () => {
    if (!recentSession) return;
    const html = `<!DOCTYPE html><html><head><title>Interview Report - ${recentSession.role}</title>
<style>body{font-family:sans-serif;padding:40px;color:#1f2937;max-width:800px;margin:0 auto}
.header{background:#0d47a1;color:white;padding:30px;border-radius:12px;margin-bottom:30px}
.score{font-size:48px;font-weight:bold}
.card{border:1px solid #e5e7eb;padding:20px;border-radius:8px;margin-bottom:15px}
.q{font-weight:bold;color:#111827}.a{margin-top:10px;color:#4b5563;font-style:italic}
.f{margin-top:10px;color:#0d47a1;background:#eff6ff;padding:10px;border-radius:6px}
</style></head><body>
<div class="header"><h1>Interview Performance Report</h1>
<p>${recentSession.role} @ ${recentSession.company}</p>
<div class="score">${recentSession.score}%</div></div>
<h2>Question Breakdown</h2>
${qaData.map((d, i) => `<div class="card">
  <p class="q">Q${i + 1}: ${d.q}</p>
  <p class="a">Your Answer: ${d.a || '(no answer)'}</p>
  <div class="f">AI Feedback: ${d.feedback}</div>
</div>`).join('')}
</body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Interview_Report_${recentSession.role.replace(/\s+/g, '_')}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ── Empty state ── */
  if (!recentSession) {
    return (
      <PageLayout>
        <div className="report page-enter">
          <header className="report__header">
            <button
              id="btn-back-report"
              className="report__back"
              onClick={() => navigate('/dashboard')}
              aria-label="Back"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="report__title">Full Report</h1>
          </header>

          <div className="report__empty">
            <ClipboardList size={48} className="report__empty-icon" />
            <h2 className="report__empty-title">No Report Yet</h2>
            <p className="report__empty-sub">
              Complete an interview session to see your full performance report here.
            </p>
            <Button
              id="btn-start-interview-from-report"
              variant="primary"
              size="lg"
              onClick={() => navigate('/interview/setup')}
            >
              Start an Interview
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  /* ── Full report ── */
  return (
    <PageLayout>
      <div className="report page-enter">
        <header className="report__header">
          <button
            id="btn-back-report"
            className="report__back"
            onClick={() => navigate('/insights')}
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="report__title">Full Report</h1>
          <div className="report__header-actions">
            <button id="btn-share-report" className="report__icon-btn" aria-label="Share" onClick={handleShare}>
              <Share2 size={18} />
            </button>
            <button id="btn-download-report" className="report__icon-btn" aria-label="Download" onClick={handleDownload}>
              <Download size={18} />
            </button>
          </div>
        </header>

        {/* Summary hero */}
        <div className="report__hero">
          <div className="report__hero-left">
            <p className="report__hero-label">Final Score</p>
            <p className="report__hero-score">{recentSession.score}</p>
            <p className="report__hero-sub">/ 100 · {qaData.length} Questions</p>
          </div>
          <div className="report__hero-right">
            <p className="report__hero-role">{recentSession.role}</p>
            <p className="report__hero-company">
              {recentSession.company} · {recentSession.duration}
            </p>
            <div className="report__hero-chips">
              {recentSession?.topics?.map((t) => (
                <span key={t} className="report__hero-chip">{t}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Q&A breakdown */}
        <section className="report__section">
          <h2 className="report__section-title">Question Breakdown</h2>

          {qaData.length === 0 ? (
            <Card className="report__qa-card">
              <p style={{ textAlign: 'center', color: 'var(--color-on-surface-variant)', padding: '16px 0' }}>
                No answers were recorded for this session.
              </p>
            </Card>
          ) : (
            <div className="report__qa-list">
              {qaData.map((item, i) => (
                <Card key={i} id={`report-qa-${i + 1}`} className="report__qa-card">
                  <div className="report__qa-header">
                    <p className="report__qa-num">Q{i + 1}</p>
                    <span
                      className={`report__qa-score report__qa-score--${
                        item.score >= 85 ? 'high' : item.score >= 75 ? 'mid' : 'low'
                      }`}
                    >
                      {item.score}%
                    </span>
                  </div>
                  <p className="report__qa-question">{item.q}</p>

                  <div className="report__qa-answer-wrap">
                    <p className="report__qa-label">YOUR ANSWER</p>
                    <p className="report__qa-answer">
                      {item.a || <em style={{ color: 'var(--color-on-surface-variant)' }}>No answer recorded</em>}
                    </p>
                  </div>

                  <div className="report__qa-feedback-wrap">
                    <p className="report__qa-label">AI FEEDBACK</p>
                    <p className="report__qa-feedback">{item.feedback}</p>
                  </div>

                  {item.mindMap && (
                    <div className="report__mindmap">
                      <div className="report__mindmap-header">
                        <GitBranch size={16} className="report__mindmap-icon" />
                        <p className="report__qa-label">AI SUGGESTED ANSWER (MIND MAP)</p>
                      </div>
                      <div className="report__mindmap-content">
                        <div className="report__mindmap-node report__mindmap-node--hook">
                          <Sparkles size={12} />
                          <p><strong>The Hook:</strong> {item.mindMap.hook}</p>
                        </div>
                        <div className="report__mindmap-grid">
                          {item.mindMap.pillars.map((p, idx) => (
                            <div key={idx} className="report__mindmap-node">
                              <div className="report__mindmap-dot" />
                              <p>{p}</p>
                            </div>
                          ))}
                        </div>
                        <div className="report__mindmap-node report__mindmap-node--metric">
                          <Target size={12} />
                          <p><strong>Golden Metric:</strong> {item.mindMap.metric}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </section>

        <Button
          id="btn-practice-from-report"
          variant="primary"
          size="lg"
          fullWidth
          onClick={() => navigate('/interview/setup')}
        >
          Practice Again
        </Button>
      </div>
    </PageLayout>
  );
}
