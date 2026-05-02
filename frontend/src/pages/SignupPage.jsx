import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import Button from '../components/Button';
import { useAppContext } from '../context/AppContext';
import './SignupPage.css';

export default function SignupPage() {
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { setUserProfile } = useAppContext();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setLoading(true);
    // Simulate network request
    await new Promise(r => setTimeout(r, 1000));
    
    setUserProfile({
      name: name,
      email: email,
      avatar: name.charAt(0).toUpperCase()
    });
    
    setLoading(false);
    navigate('/dashboard');
  };

  return (
    <div className="signup page-enter">
      <div className="signup__blob" aria-hidden="true" />

      <header className="signup__header">
        <button
          id="btn-back-signup"
          className="signup__back"
          onClick={() => navigate('/login')}
          aria-label="Go back"
        >
          ←
        </button>
      </header>

      <div className="signup__content">
        <div className="signup__title-group">
          <h1 className="signup__title">Create Account</h1>
          <p className="signup__subtitle">Start your journey to better interviews</p>
        </div>

        <form id="signup-form" className="signup__form" onSubmit={handleSubmit} noValidate>
          <div className="signup__field">
            <label className="signup__label" htmlFor="signup-name">Full Name</label>
            <div className="signup__input-wrap">
              <User size={16} className="signup__input-icon" />
              <input
                id="signup-name"
                type="text"
                className="signup__input"
                placeholder="Jane Doe"
                value={name}
                onChange={e => setName(e.target.value)}
                autoComplete="name"
              />
            </div>
          </div>

          <div className="signup__field">
            <label className="signup__label" htmlFor="signup-email">Email</label>
            <div className="signup__input-wrap">
              <Mail size={16} className="signup__input-icon" />
              <input
                id="signup-email"
                type="email"
                className="signup__input"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="signup__field">
            <label className="signup__label" htmlFor="signup-password">Password</label>
            <div className="signup__input-wrap">
              <Lock size={16} className="signup__input-icon" />
              <input
                id="signup-password"
                type={showPass ? 'text' : 'password'}
                className="signup__input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="signup__toggle"
                onClick={() => setShowPass(v => !v)}
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="signup__error" role="alert">{error}</p>
          )}

          <Button
            id="btn-signup-submit"
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
          >
            Create Account
          </Button>
        </form>

        <div className="signup__divider">
          <span>or</span>
        </div>

        <button
          id="btn-google-signup"
          className="signup__google"
          onClick={() => {
            setUserProfile({
              name: 'Google User',
              email: 'google.user@gmail.com',
              avatar: 'G'
            });
            navigate('/dashboard');
          }}
          type="button"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
            <path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
          </svg>
          Sign up with Google
        </button>

        <p className="signup__login">
          Already have an account?{' '}
          <button
            id="btn-goto-login"
            type="button"
            className="signup__login-link"
            onClick={() => navigate('/login')}
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}
