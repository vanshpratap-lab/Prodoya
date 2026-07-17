import { useState, useRef, useEffect, type FormEvent, type CSSProperties } from 'react';
import { Loader2, Eye, EyeOff, ArrowRight, ArrowLeft, Mail, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';

const COLLEGE_OPTIONS = [
  'MIT', 'Stanford University', 'IIT Delhi', 'IIT Madras', 'IIT Bombay',
  'UC Berkeley', 'Carnegie Mellon University', 'University of Toronto',
  'Oxford Engineering', 'ETH Zurich', 'Other',
];

type Mode = 'login' | 'signup';
type Step = 'start' | 'password' | 'confirm';
type OAuthProvider = 'google' | 'github';

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="18" height="18">
    <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z" />
    <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z" />
    <path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z" />
    <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z" />
  </svg>
);

const GitHubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="18" height="18">
    <path
      fill="currentColor"
      d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"
    />
  </svg>
);

export default function Auth() {
  const [mode, setMode] = useState<Mode>('login');
  const [step, setStep] = useState<Step>('start');
  const [fullName, setFullName] = useState('');
  const [college, setCollege] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<OAuthProvider | null>(null);

  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);

  const isEmailValid = validateEmail(email.trim());
  const isPasswordValid = password.length >= 8;
  const isConfirmValid = confirmPassword.length >= 8;

  useEffect(() => {
    if (step === 'password') setTimeout(() => passwordRef.current?.focus(), 260);
    if (step === 'confirm') setTimeout(() => confirmRef.current?.focus(), 260);
  }, [step]);

  const resetMessages = () => {
    setError(null);
    setInfo(null);
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setStep('start');
    resetMessages();
  };

  const goNext = () => {
    resetMessages();
    if (step === 'start') {
      if (!isEmailValid) {
        setError('Enter a valid email address.');
        return;
      }
      if (mode === 'signup' && fullName.trim().length < 2) {
        setError('Enter your full name.');
        return;
      }
      setStep('password');
    } else if (step === 'password') {
      if (!isPasswordValid) {
        setError('Password must be at least 8 characters.');
        return;
      }
      if (mode === 'login') {
        submitLogin();
      } else {
        setStep('confirm');
      }
    }
  };

  const goBack = () => {
    resetMessages();
    if (step === 'confirm') setStep('password');
    else if (step === 'password') setStep('start');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      goNext();
    }
  };

  const submitLogin = async () => {
    setSubmitting(true);
    resetMessages();
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (signInError) throw signInError;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinalSubmit = async (e: FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (!isConfirmValid) {
      setError('Confirm your password.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            college: college.trim(),
            role: 'Engineering Student',
          },
        },
      });
      if (signUpError) throw signUpError;
      setInfo('Account created! Check your email to confirm, then log in.');
      switchMode('login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOAuth = async (provider: OAuthProvider) => {
    resetMessages();
    setOauthLoading(provider);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin },
    });
    if (oauthError) {
      setError(oauthError.message);
      setOauthLoading(null);
    }
    // On success the browser navigates away to the provider, so no further state change needed here.
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: 'var(--color-bg-home)',
        padding: '24px',
      }}
    >
      {/* Animated gradient backdrop */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div className="auth-blob auth-blob-1" />
        <div className="auth-blob auth-blob-2" />
        <div className="auth-blob auth-blob-3" />
      </div>

      <div
        key={mode}
        className="auth-card-enter"
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: '420px',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-dark-border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          padding: '40px 36px',
        }}
      >
        <fieldset disabled={submitting} style={{ border: 'none', padding: 0, margin: 0 }}>
          <div className="auth-fade" style={{ marginBottom: '6px' }}>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '2.1rem',
                lineHeight: 1.15,
                color: 'var(--color-text-strong)',
                margin: 0,
              }}
            >
              {step === 'start' && (mode === 'login' ? 'Welcome back' : 'Join the network')}
              {step === 'password' && (mode === 'login' ? 'Enter your password' : 'Create a password')}
              {step === 'confirm' && 'One last step'}
            </h1>
            <p style={{ color: 'var(--color-text-muted-light)', fontSize: '0.92rem', marginTop: '8px' }}>
              {step === 'start' && 'Proof-of-work portfolios for engineering students.'}
              {step === 'password' && mode === 'login' && `Signing in as ${email}`}
              {step === 'password' && mode === 'signup' && 'At least 8 characters.'}
              {step === 'confirm' && 'Confirm your password to finish creating your account.'}
            </p>
          </div>

          {step === 'start' && (
            <div className="auth-fade" style={{ marginTop: '22px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => handleOAuth('google')}
                  disabled={oauthLoading !== null}
                  className="auth-oauth-btn"
                >
                  {oauthLoading === 'google' ? <Loader2 size={17} className="animate-spin" /> : <GoogleIcon />}
                  Google
                </button>
                <button
                  type="button"
                  onClick={() => handleOAuth('github')}
                  disabled={oauthLoading !== null}
                  className="auth-oauth-btn"
                >
                  {oauthLoading === 'github' ? <Loader2 size={17} className="animate-spin" /> : <GitHubIcon />}
                  GitHub
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
                <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--color-dark-border)' }} />
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text-muted-light)', letterSpacing: '0.5px' }}>OR</span>
                <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--color-dark-border)' }} />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {step === 'start' && mode === 'signup' && (
              <div className="auth-fade">
                <label style={labelStyle}>Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ada Lovelace"
                  maxLength={80}
                  style={inputStyle}
                  className="auth-input"
                />
              </div>
            )}

            {step === 'start' && mode === 'signup' && (
              <div className="auth-fade">
                <label style={labelStyle}>College / University</label>
                <input
                  type="text"
                  list="college-options"
                  value={college}
                  onChange={e => setCollege(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="MIT - Computer Science"
                  maxLength={120}
                  style={inputStyle}
                  className="auth-input"
                />
                <datalist id="college-options">
                  {COLLEGE_OPTIONS.map(c => <option key={c} value={c} />)}
                </datalist>
              </div>
            )}

            {step === 'start' && (
              <div className="auth-fade">
                <label style={labelStyle}>Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={iconLeftStyle} />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="you@university.edu"
                    autoComplete="email"
                    autoFocus
                    style={{ ...inputStyle, paddingLeft: '38px', paddingRight: '44px' }}
                    className="auth-input"
                  />
                  {isEmailValid && (
                    <button
                      type="button"
                      onClick={goNext}
                      aria-label="Continue"
                      className="auth-inline-arrow"
                    >
                      <ArrowRight size={16} />
                    </button>
                  )}
                </div>
              </div>
            )}

            {step === 'password' && (
              <div className="auth-fade">
                <label style={labelStyle}>Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={iconLeftStyle} />
                  <input
                    ref={passwordRef}
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="At least 8 characters"
                    minLength={8}
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                    style={{ ...inputStyle, paddingLeft: '38px', paddingRight: '76px' }}
                    className="auth-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(s => !s)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="auth-eye-btn"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  {isPasswordValid && (
                    <button type="button" onClick={goNext} aria-label="Continue" className="auth-inline-arrow" style={{ right: '38px' }}>
                      <ArrowRight size={16} />
                    </button>
                  )}
                </div>
                <button type="button" onClick={goBack} className="auth-back-link">
                  <ArrowLeft size={13} />
                  Go back
                </button>
              </div>
            )}

            {step === 'confirm' && (
              <form onSubmit={handleFinalSubmit} className="auth-fade">
                <label style={labelStyle}>Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={iconLeftStyle} />
                  <input
                    ref={confirmRef}
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    minLength={8}
                    autoComplete="new-password"
                    style={{ ...inputStyle, paddingLeft: '38px', paddingRight: '76px' }}
                    className="auth-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(s => !s)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    className="auth-eye-btn"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  {isConfirmValid && (
                    <button type="submit" aria-label="Create account" className="auth-inline-arrow" style={{ right: '38px' }}>
                      <ArrowRight size={16} />
                    </button>
                  )}
                </div>
                <button type="button" onClick={goBack} className="auth-back-link">
                  <ArrowLeft size={13} />
                  Go back
                </button>
              </form>
            )}

            {error && <div style={{ color: 'var(--color-danger)', fontSize: '0.82rem', fontWeight: 500 }}>{error}</div>}
            {info && <div style={{ color: 'var(--color-success)', fontSize: '0.82rem', fontWeight: 500 }}>{info}</div>}

            {submitting && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted-light)', fontSize: '0.85rem' }}>
                <Loader2 size={16} className="animate-spin" />
                {mode === 'login' ? 'Logging in…' : 'Creating your account…'}
              </div>
            )}
          </div>

          <div style={{ marginTop: '26px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--color-text-muted-light)' }}>
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
              style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 700, cursor: 'pointer', padding: 0, fontSize: '0.85rem' }}
            >
              {mode === 'login' ? 'Sign up' : 'Log in'}
            </button>
          </div>
        </fieldset>
      </div>
    </div>
  );
}

const labelStyle: CSSProperties = {
  display: 'block',
  fontSize: '0.78rem',
  fontWeight: 700,
  color: 'var(--color-text-muted-light)',
  marginBottom: '6px',
};

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '12px 12px',
  borderRadius: '999px',
  border: '1px solid var(--color-dark-border)',
  background: 'var(--color-bg-home)',
  color: 'var(--color-text-light)',
  fontSize: '0.95rem',
  fontFamily: 'var(--font-sans)',
  outline: 'none',
  transition: 'var(--transition)',
};

const iconLeftStyle: CSSProperties = {
  position: 'absolute',
  left: '13px',
  top: '50%',
  transform: 'translateY(-50%)',
  color: 'var(--color-text-muted-light)',
  pointerEvents: 'none',
};
