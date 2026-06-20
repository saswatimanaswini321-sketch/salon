'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, isAuthenticated, clearAuth } from '@/lib/auth';
import { setConsultState, clearConsultState } from '@/lib/store';
import { Gender } from '@/lib/types';
import BottomNav from '@/components/layout/BottomNav';

export default function HomePage() {
  const router = useRouter();
  const user = typeof window !== 'undefined' ? getUser() : null;

  useEffect(() => {
    if (!isAuthenticated()) router.replace('/login');
    clearConsultState();
  }, [router]);

  function pick(gender: Gender) {
    setConsultState({ gender });
    router.push('/consult/client');
  }

  return (
    <div className="shell">

      {/* Hero artwork strip */}
      <div style={{
        position: 'relative',
        height: '240px',
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        <img
          src="/hero.png"
          alt=""
          style={{
            width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center 20%',
          }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'var(--bg-panel) 0%, rgba(9,9,14,0.95) 100%)',
        }} />
        {/* Top bar inline */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 22px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '26px', height: '26px', borderRadius: '7px',
              background: 'var(--purple)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <circle cx="12" cy="8" r="4"/><path d="M12 12v9M9 18h6"/>
              </svg>
            </div>
          </div>
          {user && (
            <button
              onClick={() => { clearAuth(); router.replace('/login'); }}
              style={{
                padding: '5px 12px',
                background: 'rgba(9,9,14,0.6)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r-full)',
                color: 'var(--text-muted)',
                fontSize: '11px', fontWeight: 600,
                backdropFilter: 'blur(8px)',
              }}
            >
              Sign out
            </button>
          )}
        </div>

        {/* Tagline over artwork */}
        <div style={{ position: 'absolute', bottom: '20px', left: '22px', right: '22px' }}>
          <div className="eyebrow" style={{ marginBottom: '6px' }}>New Consultation</div>
          <h2 style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.1 }}>
            Who are we styling
            <span style={{ color: 'var(--purple-light)' }}> today?</span>
          </h2>
        </div>
      </div>

      <div className="content" style={{ paddingTop: '24px', position: 'relative', zIndex: 1 }}>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.5 }}>
          Select the customer&apos;s gender. The AI will load the appropriate service catalogue and tailor its recommendations.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Men card */}
          <button
            id="select-men"
            className="fu1"
            onClick={() => pick('men')}
            style={{
              display: 'flex', alignItems: 'center', gap: '18px',
              padding: '22px 20px',
              background: 'var(--bg-panel)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r-lg)',
              cursor: 'pointer', textAlign: 'left', width: '100%',
              transition: 'all var(--t) var(--ease)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--purple-subtle)';
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--purple-subtle)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-panel)';
            }}
          >
            <div style={{
              width: '52px', height: '52px', borderRadius: '14px',
              background: 'var(--purple-subtle)',
              border: '1px solid rgba(139,92,246,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--purple-light)" strokeWidth="1.8">
                <circle cx="12" cy="7" r="4"/>
                <path d="M12 11v9M9 17h6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '17px', marginBottom: '3px', color: '#E8C691' }}>Men</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.4 }}>Haircut · Beard · Color · Skin · 5 more</div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
              <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Women card */}
          <button
            id="select-women"
            className="fu2"
            onClick={() => pick('women')}
            style={{
              display: 'flex', alignItems: 'center', gap: '18px',
              padding: '22px 20px',
              background: 'var(--bg-panel)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r-lg)',
              cursor: 'pointer', textAlign: 'left', width: '100%',
              transition: 'all var(--t) var(--ease)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--purple-subtle)';
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--purple-subtle)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-panel)';
            }}
          >
            <div style={{
              width: '52px', height: '52px', borderRadius: '14px',
              background: 'var(--purple-subtle)',
              border: '1px solid rgba(139,92,246,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--purple-light)" strokeWidth="1.8">
                <circle cx="12" cy="7" r="4"/>
                <path d="M12 11v5M9 14h6M12 16v3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '17px', marginBottom: '3px', color: '#E8C691' }}>Women</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.4 }}>Hairstyle · Makeup · Color · Bridal · 6 more</div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
              <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>


      </div>

      <BottomNav active="home" />
    </div>
  );
}
