import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import Button from '../components/Button';
import { useAppContext } from '../context/AppContext';
import './InterviewSetupPage.css';

const DIFFICULTIES = ['Entry Level', 'Mid Level', 'Senior', 'Lead / Principal'];
const DURATIONS    = ['15 min', '30 min', '45 min', '60 min'];
const TOPICS = [
  'Data Structures', 'System Design', 'Behavioral', 'Leadership',
  'Product Sense', 'SQL', 'APIs', 'Communication',
];

export default function InterviewSetupPage() {
  const navigate = useNavigate();
  const [role, setRole]         = useState('');
  const [company, setCompany]   = useState('');
  const [difficulty, setDiff]   = useState('Mid Level');
  const [duration, setDuration] = useState('30 min');
  const [topics, setTopics]     = useState(['Behavioral']);
  const { startInterview } = useAppContext();

  const toggleTopic = (t) =>
    setTopics(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  return (
    <div className="setup page-enter">
      <header className="setup__header">
        <button
          id="btn-back-setup"
          className="setup__back"
          onClick={() => navigate('/dashboard')}
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="setup__title">Interview Setup</h1>
      </header>

      <div className="setup__body">
        <p className="setup__subtitle">Customize your interview to match your target role.</p>

        {/* Role */}
        <div className="setup__field">
          <label className="setup__label" htmlFor="setup-role">Target Role</label>
          <input
            id="setup-role"
            className="setup__input"
            placeholder="e.g. Senior Product Designer"
            value={role}
            onChange={e => setRole(e.target.value)}
          />
        </div>

        {/* Company */}
        <div className="setup__field">
          <label className="setup__label" htmlFor="setup-company">Company (optional)</label>
          <input
            id="setup-company"
            className="setup__input"
            placeholder="e.g. Google, Meta, Stripe"
            value={company}
            onChange={e => setCompany(e.target.value)}
          />
        </div>

        {/* Difficulty */}
        <div className="setup__field">
          <label className="setup__label">Difficulty</label>
          <div className="setup__pills">
            {DIFFICULTIES.map(d => (
              <button
                key={d}
                id={`difficulty-${d.toLowerCase().replace(/\s/g, '-')}`}
                className={`setup__pill ${difficulty === d ? 'setup__pill--active' : ''}`}
                onClick={() => setDiff(d)}
                type="button"
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div className="setup__field">
          <label className="setup__label">Duration</label>
          <div className="setup__pills">
            {DURATIONS.map(d => (
              <button
                key={d}
                id={`duration-${d.replace(' ', '')}`}
                className={`setup__pill ${duration === d ? 'setup__pill--active' : ''}`}
                onClick={() => setDuration(d)}
                type="button"
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Topics */}
        <div className="setup__field">
          <label className="setup__label">Focus Topics</label>
          <div className="setup__chips">
            {TOPICS.map(t => (
              <button
                key={t}
                id={`topic-${t.toLowerCase().replace(/\s/g, '-')}`}
                className={`setup__chip ${topics.includes(t) ? 'setup__chip--active' : ''}`}
                onClick={() => toggleTopic(t)}
                type="button"
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="setup__summary">
          <p className="setup__summary-text">
            🎯 <strong>{difficulty}</strong> · <strong>{duration}</strong> · {topics.length} topic{topics.length !== 1 ? 's' : ''} selected
          </p>
        </div>

        <Button
          id="btn-begin-interview"
          variant="primary"
          size="lg"
          fullWidth
          onClick={() => {
            startInterview({ role, company, difficulty, duration, topics });
            navigate('/interview/session');
          }}
          disabled={!role}
        >
          Begin Interview
        </Button>
      </div>
    </div>
  );
}
