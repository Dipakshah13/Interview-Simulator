import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Button from '../components/Button';
import { useAppContext } from '../context/AppContext';
import './LoginPage.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { setUserProfile } = useAppContext();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    
    // Auto-generate a name from email if simulating login
    const namePart = email.split('@')[0];
    const generatedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    
    setUserProfile({
      name: generatedName,
      email: email,
      avatar: generatedName.charAt(0).toUpperCase()
    });
    
    setLoading(false);
    navigate('/dashboard');
  };

  return (
    <div className="login page-enter">
      <div className="login__blob" aria-hidden="true" />

      <header className="login__header">
        <button
          id="btn-back-login"
          className="login__back"
          onClick={() => navigate('/')}
          aria-label="Go back"
        >
          ←
        </button>
      </header>

      <div className="login__content">
        <div className="login__title-group">
          <h1 className="login__title">Welcome back</h1>
          <p className="login__subtitle">Sign in to continue your journey</p>
        </div>

        <form id="login-form" className="login__form" onSubmit={handleSubmit} noValidate>
          <div className="login__field">
            <label className="login__label" htmlFor="login-email">Email</label>
            <div className="login__input-wrap">
              <Mail size={16} className="login__input-icon" />
              <input
                id="login-email"
                type="email"
                className="login__input"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="login__field">
            <label className="login__label" htmlFor="login-password">Password</label>
            <div className="login__input-wrap">
              <Lock size={16} className="login__input-icon" />
              <input
                id="login-password"
                type={showPass ? 'text' : 'password'}
                className="login__input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="login__toggle"
                onClick={() => setShowPass(v => !v)}
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="login__error" role="alert">{error}</p>
          )}

          <a href="#forgot" className="login__forgot">Forgot password?</a>

          <Button
            id="btn-login-submit"
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
          >
            Sign In
          </Button>
        </form>

        <div className="login__divider">
          <span>or</span>
        </div>

        <button
          id="btn-google-signin"
          className="login__google"
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
          Continue with Google
        </button>

        <p className="login__signup">
          Don't have an account?{' '}
          <button
            id="btn-goto-signup"
            type="button"
            className="login__signup-link"
            onClick={() => navigate('/signup')}
          >
            Create one free
          </button>
        </p>
      </div>
    </div>
  );
}
