'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Scissors, PaintBucket, Sparkles, Wind, Droplets, 
  ArrowRight, LogOut, LayoutGrid, Store, ChevronRight, Loader2
} from 'lucide-react';

import { getUser, isAuthenticated, clearAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { Service } from '@/lib/types';
import LandingNav from '@/components/layout/LandingNav';
import BottomNav from '@/components/layout/BottomNav';

const MOCK_SERVICES: Record<string, Service[]> = {
  men: [
    { id: 'haircut', gender: 'men', name: 'Haircut', icon: 'scissors', description: 'Fade, taper, crop styling', requires_photo: true, ai_prompt_template: '' },
    { id: 'beard', gender: 'men', name: 'Beard Trim', icon: 'scissors', description: 'Precision shape and clean line up', requires_photo: true, ai_prompt_template: '' },
    { id: 'hair-color-m', gender: 'men', name: 'Coloring', icon: 'palette', description: 'Global coloring or customized highlights', requires_photo: true, ai_prompt_template: '' },
    { id: 'facial-m', gender: 'men', name: 'Facial', icon: 'sparkles', description: 'Skin analysis & rejuvenation treatments', requires_photo: true, ai_prompt_template: '' },
    { id: 'texture-m', gender: 'men', name: 'Texture', icon: 'wind', description: 'Perm or specialized hair smoothening', requires_photo: true, ai_prompt_template: '' },
  ],
  women: [
    { id: 'hairstyle-w', gender: 'women', name: 'Haircut', icon: 'scissors', description: 'Layers, bob, bangs & creative cuts', requires_photo: true, ai_prompt_template: '' },
    { id: 'makeup', gender: 'women', name: 'Makeup', icon: 'sparkles', description: 'Occasion, party & bridal styling', requires_photo: true, ai_prompt_template: '' },
    { id: 'hair-color-w', gender: 'women', name: 'Coloring', icon: 'palette', description: 'Balayage, ombre, root touchup & gloss', requires_photo: true, ai_prompt_template: '' },
    { id: 'facial-w', gender: 'women', name: 'Skin Care', icon: 'sparkles', description: 'Hydrating facials & glow treatments', requires_photo: true, ai_prompt_template: '' },
    { id: 'bridal', gender: 'women', name: 'Bridal Package', icon: 'sparkles', description: 'Complete head-to-toe styling consult', requires_photo: true, ai_prompt_template: '' },
  ],
};

const ICONS: Record<string, React.ReactNode> = {
  scissors: <Scissors size={24} strokeWidth={1.5} />,
  palette: <PaintBucket size={24} strokeWidth={1.5} />,
  sparkles: <Sparkles size={24} strokeWidth={1.5} />,
  wind: <Wind size={24} strokeWidth={1.5} />,
  droplet: <Droplets size={24} strokeWidth={1.5} />,
};

export default function ServicesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'men' | 'women'>('men');
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [userName, setUserName] = useState('John Doe');
  const [userRole, setUserRole] = useState('Staff');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login?reason=auth_required');
      return;
    }

    setIsAuth(true);
    setCheckingAuth(false);

    const profile = getUser();
    if (profile) {
      setUserName(profile.name || 'John Doe');
      setUserRole(profile.role === 'admin' ? 'Owner' : 'Barber');
    }

    // Load services dynamically
    setLoading(true);
    api.services.list(activeTab)
      .then(res => setServices(res && res.length ? res : MOCK_SERVICES[activeTab]))
      .catch(() => setServices(MOCK_SERVICES[activeTab]))
      .finally(() => setLoading(false));
  }, [activeTab, router]);

  function handleSignOut() {
    clearAuth();
    setIsAuth(false);
    router.replace('/');
  }

  /* Profile dropdown navbar right slot (rendered only if authenticated) */
  const navRightContent = isAuth ? (
    <>
      <Link href="/admin" className="nav-dashboard-link">
        <button className="home-btn-outline" style={{ padding: '8px 16px', fontSize: '11px', border: '1px solid #c59d5f', color: '#c59d5f' }}>
          Staff Dashboard <LayoutGrid size={12} />
        </button>
      </Link>

      <div className="nav-profile-menu" onClick={() => setMenuOpen(!menuOpen)}>
        <div className="nav-avatar-circle" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: '#c59d5f', fontSize: '13px' }}>
          {userName.charAt(0).toUpperCase()}
        </div>
        <span className="nav-profile-name">
          {userName}
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ transition: 'transform 0.2s', transform: menuOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            <path d="M1 1l4 4 4-4" />
          </svg>
        </span>

        <AnimatePresence>
          {menuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="nav-profile-dropdown"
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ padding: '8px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '4px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#ffffff' }}>{userName}</div>
                <div style={{ fontSize: '10px', color: '#c59d5f' }}>{userRole}</div>
              </div>
              <button onClick={handleSignOut} className="nav-profile-dropdown-item" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <LogOut size={13} /> Sign Out
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  ) : null;

  if (checkingAuth) {
    return (
      <div className="home-page-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <Loader2 size={32} className="spin" color="#c59d5f" />
      </div>
    );
  }

  return (
    <div className="home-page-shell">
      <div className="home-bg-overlay" />
      <div className="home-gradient-overlay" />

      {/* Shared Navbar */}
      <LandingNav activePage="services" rightSlot={navRightContent} />

      {/* Main Container */}
      <main className="home-main" style={{ zIndex: 10, paddingBottom: isAuth ? '90px' : '40px' }}>
        <section style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '0 20px', paddingTop: '100px' }}>
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span style={{ color: '#c59d5f', textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '12px', fontWeight: 600 }}>Catalog</span>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 400, marginTop: '8px', color: '#ffffff' }}>
              Our Premium Services
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '540px', margin: '12px auto 0', fontSize: '14px', lineHeight: 1.6 }}>
              Browse through our range of professional AI-enhanced grooming treatments tailored to your style.
            </p>
          </div>

          {/* Gender Tab Selection */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '12px', 
            marginBottom: '40px',
            background: 'rgba(255,255,255,0.03)',
            padding: '6px',
            borderRadius: '30px',
            maxWidth: '320px',
            margin: '0 auto 40px',
            border: '1px solid rgba(255,255,255,0.05)'
          }}>
            <button
              onClick={() => setActiveTab('men')}
              style={{
                flex: 1,
                padding: '10px 24px',
                borderRadius: '25px',
                border: 'none',
                background: activeTab === 'men' ? '#c59d5f' : 'transparent',
                color: activeTab === 'men' ? '#000000' : 'rgba(255,255,255,0.7)',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              Men
            </button>
            <button
              onClick={() => setActiveTab('women')}
              style={{
                flex: 1,
                padding: '10px 24px',
                borderRadius: '25px',
                border: 'none',
                background: activeTab === 'women' ? '#c59d5f' : 'transparent',
                color: activeTab === 'women' ? '#000000' : 'rgba(255,255,255,0.7)',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              Women
            </button>
          </div>

          {/* Services Grid */}
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
              <div className="spin" style={{ 
                width: '32px', 
                height: '32px', 
                border: '3px solid rgba(197,157,95,0.2)', 
                borderTopColor: '#c59d5f', 
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
            </div>
          ) : (
            <motion.div 
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: '20px'
              }}
            >
              {services.map((s, index) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="contact-info-card"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '12px',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    transition: 'all 0.3s ease',
                    backdropFilter: 'blur(10px)',
                  }}
                  whileHover={{ 
                    y: -5, 
                    borderColor: 'rgba(197,157,95,0.3)',
                    background: 'rgba(255,255,255,0.05)'
                  }}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '10px',
                    background: 'rgba(197,157,95,0.1)',
                    color: '#c59d5f',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {ICONS[s.icon] || <Sparkles size={24} strokeWidth={1.5} />}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#ffffff', marginBottom: '8px' }}>{s.name}</h3>
                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>{s.description}</p>
                  </div>
                  {isAuth && (
                    <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: '#c59d5f', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {s.requires_photo ? 'Photo Required' : 'Manual Consult'}
                      </span>
                      <Link href="/home" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#ffffff', fontWeight: 500 }}>
                        Start Consult <ArrowRight size={12} />
                      </Link>
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Quick Consultation Promo (Guest View) */}
          {!isAuth && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{
                marginTop: '60px',
                padding: '40px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(197,157,95,0.05), rgba(0,0,0,0.8))',
                border: '1px solid rgba(197,157,95,0.15)',
                textAlign: 'center',
                backdropFilter: 'blur(10px)'
              }}
            >
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', fontWeight: 400, color: '#ffffff', marginBottom: '12px' }}>
                Are you a Salon Stylist?
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', maxWidth: '500px', margin: '0 auto 24px', lineHeight: 1.6 }}>
                Log into the staff portal to unlock custom AI consultations, client histories, and precision styling tools.
              </p>
              <Link href="/login" style={{ textDecoration: 'none' }}>
                <button className="home-btn-gold" style={{ margin: '0 auto' }}>
                  Access Staff Portal <ArrowRight size={14} />
                </button>
              </Link>
            </motion.div>
          )}
        </section>
      </main>

      {/* Bottom Nav wrapper for authenticated staff on mobile */}
      {isAuth && (
        <div className="bottom-nav-wrapper">
          <BottomNav active="" />
        </div>
      )}
    </div>
  );
}
