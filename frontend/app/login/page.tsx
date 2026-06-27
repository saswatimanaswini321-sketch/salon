'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, ArrowRight, AlertCircle, X, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [showRedirectAlert, setShowRedirectAlert] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace('/consult');
      return;
    }

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('reason') === 'auth_required') {
        setShowRedirectAlert(true);
        // Clear parameter from address bar
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, [router]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setError('');
    setLoading(true);
    try {
      const { access_token, user } = await api.auth.login(email.trim(), password);
      
      const userProfile = {
        id: user.id,
        role: user.role || 'barber',
        name: (user as any).full_name || user.name || email.trim().split('@')[0] || 'Barber',
        email: user.email || email.trim(),
        created_at: user.created_at || new Date().toISOString()
      };
      
      saveAuth(access_token, userProfile);
      localStorage.setItem('show_welcome', 'true');
      router.replace('/consult');
    } catch (err: any) {
      // Fallback for "Demo Mode" if Supabase isn't hooked up yet
      if (err.message.includes('placeholder') || err.message.includes('fetch failed')) {
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
    setTimeout(() => router.replace('/consult'), 500);
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
        opacity: 0.4,
        filter: 'blur(8px)',
        zIndex: 0,
        pointerEvents: 'none',
      }} />

      <div style={{ 
        position: 'absolute', 
        inset: 0, 
        background: 'linear-gradient(to right, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.7) 50%, rgba(0, 0, 0, 0.9) 100%)', 
        zIndex: 1,
        pointerEvents: 'none',
      }} />

      <Link href="/" style={{
        position: 'absolute',
        top: '24px',
        left: '24px',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        color: 'rgba(255, 255, 255, 0.7)',
        textDecoration: 'none',
        fontSize: '14px',
        fontWeight: 500,
        transition: 'color 0.2s',
      }}>
        <ArrowLeft size={18} />
        Back to Home
      </Link>

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
              <label className="label">Password</label>
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
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                <Link href="/forgot-password" style={{ fontSize: '12px', color: 'var(--purple-light)', textDecoration: 'none' }}>
                  Forgot Password?
                </Link>
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

      {/* Alert Redirect Popup Modal */}
    <AnimatePresence>
        {showRedirectAlert && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 15 }}
              style={{
                background: 'rgba(15, 15, 20, 0.95)',
                border: '1px solid rgba(197, 157, 95, 0.3)',
                borderRadius: '12px',
                padding: '30px 24px',
                maxWidth: '380px',
                width: 'calc(100% - 40px)',
                textAlign: 'center',
                position: 'relative',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              }}
            >
              <button
                onClick={() => setShowRedirectAlert(false)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.4)',
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'rgba(197, 157, 95, 0.1)',
                color: '#c59d5f',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <AlertCircle size={24} />
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#ffffff', marginBottom: '8px' }}>
                Authentication Required
              </h2>
              <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '13px', lineHeight: 1.5, marginBottom: '24px' }}>
                We need to login first to access the premium services catalog.
              </p>
              <button
                onClick={() => setShowRedirectAlert(false)}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  background: '#c59d5f',
                  color: '#000000',
                  fontWeight: 600,
                  border: 'none',
                  justifyContent: 'center',
                  height: '44px'
                }}
              >
                Okay, I understand
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
