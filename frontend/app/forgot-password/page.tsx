'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ArrowRight, CheckCircle2, ArrowLeft, Eye, EyeOff } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send OTP.');
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyAndReset(e: React.FormEvent) {
    e.preventDefault();
    if (!otp.trim() || !newPassword.trim()) return;
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp: otp.trim(), newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to reset password.');
      setSuccess(true);
      setTimeout(() => router.replace('/login'), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      background: '#000000',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(/hero.png)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.3, zIndex: 0, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'var(--bg-panel)', zIndex: 1 }} />

      <div style={{ position: 'relative', zIndex: 10, width: '100%', padding: '0 24px', maxWidth: '440px', margin: '0 auto' }}>
        
        <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px', marginBottom: '32px' }}>
          <ArrowLeft size={16} /> Back to Login
        </Link>

        <div className="fu" style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '32px', fontFamily: 'var(--font-serif)', color: 'var(--white)', marginBottom: '8px', fontWeight: 400 }}>
            Reset Password
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          {step === 1 ? 'Enter your email to receive a secure recovery code.' : 'Enter the 6-digit code sent to your email and set a new password.'}
          </p>
        </div>

        <div className="fu1" style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)', padding: '40px 24px', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
          
          {success ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <CheckCircle2 size={48} color="var(--green)" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ color: 'var(--white)', marginBottom: '8px' }}>Password Reset!</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Redirecting to login...</p>
            </div>
          ) : (
            <form onSubmit={step === 1 ? handleSendOtp : handleVerifyAndReset} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {step === 1 && (
                <div>
                  <label className="label">Email Address</label>
                  <input type="email" className="input" value={email} onChange={e => setEmail(e.target.value)} placeholder="barber@salon.com" required style={{ background: 'rgba(255,255,255,0.03)' }} />
                </div>
              )}

              {step === 2 && (
                <>
                  <div>
                    <label className="label">6-Digit OTP Code</label>
                    <input type="text" className="input" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="123456" required maxLength={6} style={{ background: 'rgba(255,255,255,0.03)', letterSpacing: '8px', textAlign: 'center', fontSize: '24px' }} />
                  </div>
                  <div>
                    <label className="label">New Password</label>
                    <div style={{ position: 'relative' }}>
                      <input type={showPassword ? 'text' : 'password'} className="input" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min 8 characters" required minLength={8} pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}" title="Password must have a minimum length of 8, with 1 uppercase, 1 lowercase, 1 number, and 1 special character" style={{ background: 'rgba(255,255,255,0.03)', paddingRight: '48px' }} />
                      <button
                        type="button"
                        onClick={() => setShowPassword(v => !v)}
                        style={{
                          position: 'absolute', right: '16px', top: '50%',
                          transform: 'translateY(-50%)',
                          color: 'var(--text-muted)',
                          display: 'flex', alignItems: 'center',
                          background: 'none', border: 'none', cursor: 'pointer',
                        }}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {error && <div className="error-box">{error}</div>}

              <button type="submit" disabled={loading} className="btn btn-primary" style={{ marginTop: '12px', height: '52px' }}>
                {loading ? <Loader2 size={18} className="spin" /> : (
                  <>{step === 1 ? 'Send Code' : 'Update Password'} <ArrowRight size={16} /></>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
