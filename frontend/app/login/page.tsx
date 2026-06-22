'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';
import { saveAuth, isAuthenticated } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated()) router.replace('/home');
  }, [router]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setError('');
    setLoading(true);
    try {
      // Use native Supabase Auth because the backend strictly expects Supabase JWT tokens
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });
      
      if (error) throw error;
      
      if (data.session && data.user) {
        // Fetch profile to get role
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
        
        const userProfile = {
          id: data.user.id,
          role: profile?.role || 'barber',
          name: profile?.full_name || data.user.email?.split('@')[0] || 'Barber',
          email: data.user.email || '',
          created_at: data.user.created_at
        };
        saveAuth(data.session.access_token, profile);
        localStorage.setItem('show_welcome', 'true');
        saveAuth(data.session.access_token, userProfile);
        router.replace('/home');
      }
    } catch (err: any) {
      // Fallback for "Demo Mode" if Supabase isn't hooked up yet
      if (err.message.includes('placeholder')) {
         enterDemo();
      } else {
         setError(err.message || 'Invalid credentials. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  function enterDemo() {
    setDemoLoading(true);
    saveAuth('demo-token-not-real', {
      id: 'demo-barber-001',
      role: 'barber',
      name: 'Demo Barber',
      email: 'demo@salon.com',
      created_at: new Date().toISOString(),
    });
    localStorage.setItem('show_welcome', 'true');
    setTimeout(() => router.replace('/home'), 500);
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
        padding: '0 24px',
        maxWidth: '440px',
        margin: '0 auto',
      }}>

        {/* Headline */}
        <div className="fu" style={{ marginBottom: '40px', textAlign: 'center' }}>
          <h1 style={{
            fontSize: '48px',
            fontFamily: 'var(--font-serif)',
            color: 'var(--white)',
            marginBottom: '8px',
            fontWeight: 400
          }}>
            Staff Portal
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Authorized Personnel Only
          </p>
        </div>

        {/* Minimal Form Panel */}
        <div className="fu1" style={{
          background: 'rgba(0,0,0,0.6)',
          border: '1px solid rgba(255,255,255,0.1)',
          padding: '40px 24px',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
            <button
              onClick={enterDemo}
              disabled={demoLoading}
              className="btn btn-secondary"
              style={{ padding: '6px 12px', fontSize: '10px' }}
            >
              {demoLoading ? <Loader2 size={12} className="spin" /> : 'DEMO MODE'}
            </button>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label className="label">Email Address</label>
              <input
                type="email"
                className="input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="barber@salon.com"
                required
                style={{ background: 'rgba(255,255,255,0.03)' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="label">Password</label>
                <Link href="/forgot-password" style={{ fontSize: '12px', color: 'var(--purple-light)', textDecoration: 'none', marginBottom: '8px', display: 'block' }}>
                  Forgot Password?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={show ? 'text' : 'password'}
                  className="input"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
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
                <>Sign In <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
            Don&apos;t have an account?{' '}
            <Link href="/signup" style={{ color: 'var(--purple-light)', textDecoration: 'none', fontWeight: 600 }}>
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
