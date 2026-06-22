'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';
import { saveAuth, isAuthenticated } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated()) router.replace('/home');
  }, [router]);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) return;
    
    const phoneDigits = phone.slice(4).trim();
    if (phoneDigits.length !== 10) {
      setError('Phone number must be exactly 10 digits.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      // 1. Create the Admin user in the backend
      await api.auth.signup({
        name: name.trim(),
        store_name: storeName.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim(),
        password: password
      });

      // 2. Log them in directly to get the Supabase session
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });
      
      if (loginError) throw loginError;
      
      if (data.session && data.user) {
        // Map Supabase user to our internal Profile format
        const profile = {
          id: data.user.id,
          role: 'admin' as const,
          name: name.trim(),
          email: data.user.email || '',
          store_name: storeName.trim(),
          phone: phone.trim(),
          created_at: data.user.created_at
        };
        saveAuth(data.session.access_token, profile);
        localStorage.setItem('show_welcome', 'true');
        router.replace('/home');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
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
      {/* Immersive Background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'url(/hero.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.3,
        zIndex: 0,
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'absolute', inset: 0, background: 'var(--bg-panel)', zIndex: 1 }} />

      <div style={{
        position: 'relative', zIndex: 10,
        width: '100%',
        padding: '40px 24px',
        maxWidth: '440px',
        margin: '0 auto',
      }}>

        {/* Headline */}
        <div className="fu" style={{ marginBottom: '32px', textAlign: 'center' }}>
          <h1 style={{
            fontSize: '36px',
            fontFamily: 'var(--font-serif)',
            color: 'var(--white)',
            marginBottom: '8px',
            fontWeight: 400
          }}>
            Admin Registration
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
            Create your admin portal
          </p>
        </div>

        {/* Minimal Form Panel */}
        <div className="fu1" style={{
          background: 'rgba(0,0,0,0.6)',
          border: '1px solid rgba(255,255,255,0.1)',
          padding: '32px 24px',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: 'var(--r-lg)'
        }}>
          
          <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="label">Full Name</label>
              <input
                type="text"
                className="input"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="John Doe"
                required
                style={{ background: 'rgba(255,255,255,0.03)' }}
              />
            </div>

            <div>
              <label className="label">Store Name</label>
              <input
                type="text"
                className="input"
                value={storeName}
                onChange={e => setStoreName(e.target.value)}
                placeholder="The Golden Scissors"
                style={{ background: 'rgba(255,255,255,0.03)' }}
              />
            </div>

            <div>
              <label className="label">Phone Number</label>
              <input
                type="tel"
                className="input"
                value={phone}
                onChange={e => {
                  let val = e.target.value;
                  if (!val.startsWith('+91 ')) val = '+91 ' + val.replace(/^\+91 ?/, '');
                  const digitsOnly = val.slice(4).replace(/\D/g, '').slice(0, 10);
                  setPhone('+91 ' + digitsOnly);
                }}
                placeholder="+91 9876543210"
                style={{ background: 'rgba(255,255,255,0.03)' }}
              />
            </div>

            <div>
              <label className="label">Email Address</label>
              <input
                type="email"
                className="input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="owner@salon.com"
                required
                style={{ background: 'rgba(255,255,255,0.03)' }}
              />
            </div>

            <div>
              <label className="label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={show ? 'text' : 'password'}
                  className="input"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  minLength={6}
                  required
                  style={{ background: 'rgba(255,255,255,0.03)' }}
                />
                <button
                  type="button"
                  onClick={() => setShow(v => !v)}
                  style={{
                    position: 'absolute', right: '16px', top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                    display: 'flex', alignItems: 'center',
                    background: 'none', border: 'none', cursor: 'pointer',
                  }}
                >
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && <div className="error-box">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ marginTop: '12px', height: '52px' }}
            >
              {loading ? <Loader2 size={18} className="spin" /> : (
                <>Create Account <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: 'var(--purple-light)', textDecoration: 'none', fontWeight: 600 }}>
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
