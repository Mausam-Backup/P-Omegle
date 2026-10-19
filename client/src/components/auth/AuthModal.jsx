import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, X, Lock, Mail, CheckCircle2 } from 'lucide-react';

export function AuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen, login, register } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (isRegisterMode) {
        if (!ageConfirmed) {
          throw new Error('You must confirm you are 18 or older to register.');
        }
        if (!termsAccepted) {
          throw new Error('You must agree to the Terms and Community Guidelines.');
        }
        await register(email, password, ageConfirmed, termsAccepted);
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => setIsAuthModalOpen(false)}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={() => setIsAuthModalOpen(false)}>
          <X size={20} />
        </button>

        <div className="modal-title">
          <User size={22} color="#818cf8" />
          <span>{isRegisterMode ? 'Create an Account' : 'Sign In to Omegle'}</span>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', padding: '0.65rem 0.85rem', borderRadius: 8, fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                className="form-input"
                style={{ width: '100%', paddingLeft: '2.4rem' }}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Mail size={16} color="#64748b" style={{ position: 'absolute', left: 12, top: 12 }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                className="form-input"
                style={{ width: '100%', paddingLeft: '2.4rem' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Lock size={16} color="#64748b" style={{ position: 'absolute', left: 12, top: 12 }} />
            </div>
          </div>

          {isRegisterMode && (
            <>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.825rem' }}>
                <input
                  type="checkbox"
                  id="modalAge"
                  checked={ageConfirmed}
                  onChange={(e) => setAgeConfirmed(e.target.checked)}
                  style={{ cursor: 'pointer', marginTop: 2 }}
                />
                <label htmlFor="modalAge" style={{ cursor: 'pointer', color: '#cbd5e1' }}>
                  I confirm that I am <strong>18 years or older</strong> (FR-AUTH-04).
                </label>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.825rem' }}>
                <input
                  type="checkbox"
                  id="modalTerms"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  style={{ cursor: 'pointer', marginTop: 2 }}
                />
                <label htmlFor="modalTerms" style={{ cursor: 'pointer', color: '#cbd5e1' }}>
                  I accept the Terms of Service & Privacy Policy.
                </label>
              </div>
            </>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={submitting}
            style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
          >
            {submitting ? 'Processing...' : isRegisterMode ? 'Register Account' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: '0.85rem', color: '#94a3b8', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1rem' }}>
          {isRegisterMode ? (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                style={{ background: 'none', border: 'none', color: '#818cf8', cursor: 'pointer', fontWeight: 600 }}
                onClick={() => { setIsRegisterMode(false); setError(''); }}
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              Don't have an account?{' '}
              <button
                type="button"
                style={{ background: 'none', border: 'none', color: '#818cf8', cursor: 'pointer', fontWeight: 600 }}
                onClick={() => { setIsRegisterMode(true); setError(''); }}
              >
                Create Account
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
