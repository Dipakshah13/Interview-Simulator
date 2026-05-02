import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import Button from '../components/Button';
import { useAppContext } from '../context/AppContext';
import './InterviewSessionPage.css';

const QUESTIONS = [
  "Tell me about yourself and what drew you to this role.",
  "Describe a time when you had to lead a team through a significant challenge. What was your approach?",
  "How do you prioritize competing deadlines when working on multiple projects simultaneously?",
  "Walk me through a product decision you made that you're particularly proud of. What was the outcome?",
  "What's your approach to handling disagreements with stakeholders or team members?",
];

export default function InterviewSessionPage() {
  const navigate = useNavigate();
  const [qIdx, setQIdx]       = useState(0);
  const [answer, setAnswer]   = useState('');
  const [seconds, setSeconds] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [showEnd, setShowEnd]         = useState(false);
  const [qaHistory, setQaHistory]     = useState([]);
  const { finishInterview } = useAppContext();

  useEffect(() => {
    const timer = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const next = () => {
    const updatedHistory = [...qaHistory, { q: QUESTIONS[qIdx], a: answer }];
    setQaHistory(updatedHistory);

    if (qIdx < QUESTIONS.length - 1) {
      setQIdx(q => q + 1);
      setAnswer('');
    } else {
      handleComplete(updatedHistory);
    }
  };

  const handleComplete = (history = qaHistory) => {
    const finalHistory = Array.isArray(history) ? history : qaHistory;
    // Guard: if no answers yet, use a default score of 60
    const avgLen = finalHistory.length > 0
      ? finalHistory.reduce((acc, curr) => acc + (curr.a?.length || 0), 0) / finalHistory.length
      : 0;
    const baseScore = Math.min(Math.floor(avgLen / 10) + 65, 95);
    const finalScore = Math.max(50, Math.floor(Math.random() * 10) + baseScore - 5);

    finishInterview(Math.min(finalScore, 100), finalHistory);
    navigate('/insights');
  };

  return (
    <div className="session page-enter">
      {/* Top bar */}
      <header className="session__header">
        <div className="session__progress-wrap">
          <p className="session__q-count">Q{qIdx + 1} of {QUESTIONS.length}</p>
          <div className="session__progress-bar">
            <div
              className="session__progress-fill"
              style={{ width: `${((qIdx + 1) / QUESTIONS.length) * 100}%` }}
            />
          </div>
        </div>
        <div className="session__timer">{formatTime(seconds)}</div>
        <button
          id="btn-end-session"
          className="session__close"
          onClick={() => setShowEnd(true)}
          aria-label="End session"
        >
          <X size={18} />
        </button>
      </header>

      {/* AI orb */}
      <div className="session__orb-wrap" aria-hidden="true">
        <div className={`session__orb ${isListening ? 'session__orb--active' : ''}`}>
          <div className="session__orb-inner" />
        </div>
        <p className="session__orb-label">{isListening ? 'AI Listening…' : 'AI Ready'}</p>
      </div>

      {/* Question */}
      <div className="session__question-wrap">
        <p className="session__q-tag">QUESTION {qIdx + 1}</p>
        <h2 className="session__question">{QUESTIONS[qIdx]}</h2>
      </div>

      {/* Answer */}
      <div className="session__answer-wrap">
        <label className="session__answer-label" htmlFor="session-answer">Your Answer</label>
        <textarea
          id="session-answer"
          className="session__textarea"
          placeholder="Type your answer here, or use the mic to speak…"
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          rows={5}
        />
        <p className="session__char-count">{answer.length} characters</p>
      </div>

      {/* Controls */}
      <div className="session__controls">
        <button
          id="btn-toggle-mic"
          className={`session__mic ${isListening ? 'session__mic--active' : ''}`}
          onClick={() => setIsListening(v => !v)}
          aria-label={isListening ? 'Stop mic' : 'Start mic'}
          type="button"
        >
          🎤
        </button>
        <Button
          id="btn-next-question"
          variant="primary"
          size="lg"
          onClick={next}
          disabled={!answer.trim()}
        >
          {qIdx < QUESTIONS.length - 1 ? 'Next Question →' : 'Complete Interview'}
        </Button>
      </div>

      {/* End session modal */}
      {showEnd && (
        <div className="session__modal-overlay" role="dialog" aria-modal="true">
          <div className="session__modal">
            <h3 className="session__modal-title">End Interview?</h3>
            <p className="session__modal-text">
              You've answered {qIdx} of {QUESTIONS.length} questions. Your progress will be saved.
            </p>
            <div className="session__modal-actions">
              <Button id="btn-cancel-end" variant="ghost" onClick={() => setShowEnd(false)}>
                Continue
              </Button>
              <Button id="btn-confirm-end" variant="primary" onClick={() => handleComplete()}>
                End & See Results
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
