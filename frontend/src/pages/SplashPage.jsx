import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import './SplashPage.css';

export default function SplashPage() {
  const navigate = useNavigate();

  return (
    <div className="splash">
      {/* Background blobs for depth */}
      <div className="splash__blob splash__blob--primary" aria-hidden="true" />
      <div className="splash__blob splash__blob--secondary" aria-hidden="true" />

      <div className="splash__container">
        {/* Left Column: Asymmetrical Typography */}
        <div className="splash__text-content">
          <div className="splash__logo-block">
            <div className="splash__logo-mark" aria-hidden="true">
              <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="100" rx="24" fill="#0A286B" />
                
                {/* The 'I' */}
                <path d="M 12 85 L 24 85 L 44 15 L 32 15 Z" fill="white" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
                
                {/* The 'S' - Top Piece */}
                <path d="M 60 15 H 90 L 81 47 H 60 L 33 74 L 46 28 A 14 14 0 0 1 60 15 Z" fill="white" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
                
                {/* The 'S' - Bottom Piece */}
                <path d="M 87 26 L 60 53 H 39 L 30 85 H 60 A 14 14 0 0 0 74 71 L 87 26 Z" fill="white" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="splash__logo-text" style={{ letterSpacing: '-0.02em', fontWeight: '800' }}>Interview Stimulator</span>
          </div>

          <div className="splash__headline-group">
            <span className="splash__eyebrow">The Intelligent Monolith</span>
            <h1 className="splash__title">
              Precision AI<br />Career Coaching
            </h1>
            <p className="splash__description">
              Step into a digital environment that feels authoritative and calm. Real-time feedback, world-class executive coaching, and role-specific preparation without the template feel.
            </p>
          </div>

          <div className="splash__actions">
            <Button
              id="btn-get-started"
              variant="primary"
              size="lg"
              className="splash__btn-primary"
              onClick={() => navigate('/login')}
            >
              Start Simulation
            </Button>
            <Button
              id="btn-signin"
              variant="tertiary"
              size="lg"
              className="splash__btn-secondary"
              onClick={() => navigate('/login')}
            >
              Sign In
            </Button>
          </div>
        </div>

        {/* Right Column: Glassmorphism AI Feed */}
        <div className="splash__visual-content">
          <div className="splash__glass-card">
            <div className="splash__glass-header">
              <div className="pulse-indicator"></div>
              <span>AI Analysis Active</span>
            </div>

            <div className="splash__feed">
              <div className="splash__feed-item">
                <span className="splash__feed-icon">🎯</span>
                <div className="splash__feed-text">
                  <strong>Role-Specific Persona</strong>
                  <p>Adapting to Senior Product Manager.</p>
                </div>
              </div>
              <div className="splash__feed-item">
                <span className="splash__feed-icon">⚡</span>
                <div className="splash__feed-text">
                  <strong>Micro-Expression Tracking</strong>
                  <p>Confidence levels at optimal 87%.</p>
                </div>
              </div>
              <div className="splash__feed-item">
                <span className="splash__feed-icon">📊</span>
                <div className="splash__feed-text">
                  <strong>Real-Time Delivery</strong>
                  <p>Pacing is strong, reducing filler words.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
