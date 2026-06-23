'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Scissors, Sparkles, LayoutGrid, ChevronRight, ArrowRight, 
  LogOut, Users, UserCheck, Star, X, Award, Home, Store
} from 'lucide-react';

import { getUser, isAuthenticated, clearAuth } from '@/lib/auth';
import { setConsultState, clearConsultState } from '@/lib/store';
import { Gender } from '@/lib/types';
import BottomNav from '@/components/layout/BottomNav';
import LandingNav from '@/components/layout/LandingNav';

export default function HomePage() {
  const router = useRouter();
  const [showWelcome, setShowWelcome] = useState(false);
  const [salonName, setSalonName] = useState('AI Salon');
  const [userName, setUserName] = useState('John Doe');
  const [userRole, setUserRole] = useState('Staff');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login');
      return;
    }
    clearConsultState();

    // Fetch user details from profile
    const profile = getUser();
    if (profile) {
      setUserName(profile.name || 'John Doe');
      setUserRole(profile.role === 'admin' ? 'Owner' : 'Barber');
      if (profile.store_name) {
        setSalonName(profile.store_name);
      }
    }

    // Check show_welcome flag
    if (localStorage.getItem('show_welcome') === 'true') {
      setShowWelcome(true);
      localStorage.removeItem('show_welcome');
    }
  }, [router]);

  function pick(gender: Gender) {
    setConsultState({ gender });
    router.push('/consult/client');
  }

  function handleSignOut() {
    clearAuth();
    router.replace('/login');
  }

  const scrollToGenderSelect = () => {
    document.getElementById('gender-select-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  /* Profile dropdown + dashboard button rendered as the navbar's right slot */
  const navRightContent = (
    <>
      <Link href="/admin" className="nav-dashboard-link">
        <button className="home-btn-outline" style={{ padding: '8px 16px', fontSize: '11px', border: '1px solid #c59d5f', color: '#c59d5f' }}>
          Staff Dashboard <LayoutGrid size={12} />
        </button>
      </Link>

      {/* Profile Dropdown Menu */}
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
  );

  return (
    <div className="home-page-shell">
      <div className="home-bg-overlay" />
      <div className="home-gradient-overlay" />

      {/* Shared Navbar */}
      <LandingNav activePage="home" rightSlot={navRightContent} />

      {/* Main Container */}
      <main className="home-main">
        {/* Hero Section */}
        <section className="home-hero">
          
          {/* Left Text */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="home-hero-left"
          >
            <span className="home-eyebrow">Welcome To</span>
            <h1 className="home-title">AI SALON</h1>
            <div className="home-subtitle">Where Style Meets Intelligence</div>
            <p className="home-desc">
              AI Salon brings together advanced technology and professional care to deliver a personalized grooming experience like never before.
            </p>
            <div className="home-hero-buttons">
              <button onClick={scrollToGenderSelect} className="home-btn-gold">
                New Consultation <Sparkles size={14} />
              </button>
              <Link href="/services" style={{ textDecoration: 'none' }}>
                <button className="home-btn-outline">
                  View Services <ArrowRight size={14} />
                </button>
              </Link>
            </div>
          </motion.div>

          {/* Right floating card */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="home-hero-right"
          >
            <div className="home-card-smart">
              <div className="home-card-icon-circle">
                <Store size={22} strokeWidth={1.5} />
              </div>
              <h3 className="home-card-smart-title">Salon Management Made Smarter</h3>
              <p className="home-card-smart-desc">
                AI-driven insights to help you manage and grow your salon business effortlessly.
              </p>
            </div>
          </motion.div>
        </section>

        {/* Gender Selection Section */}
        <section id="gender-select-section" className="gender-section">
          <span className="gender-section-banner">Start A New Consultation</span>
          <h2 className="gender-section-title">Who are we styling today?</h2>
          <p className="gender-section-desc">
            Select the customer&apos;s gender. The AI will load the appropriate service catalogue and tailor its recommendations.
          </p>

          <div className="gender-cards-row">
            
            {/* Men card */}
            <motion.button 
              id="select-men"
              onClick={() => pick('men')}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="gender-card-btn"
            >
              <div className="gender-icon-circle">
                ♂
              </div>
              <div className="gender-card-info">
                <span className="gender-card-name">Men</span>
                <span className="gender-card-details">Haircut • Beard • Color • Skin • 5 more</span>
              </div>
              <ChevronRight className="gender-card-chevron" size={20} />
            </motion.button>

            {/* Women card */}
            <motion.button 
              id="select-women"
              onClick={() => pick('women')}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="gender-card-btn"
            >
              <div className="gender-icon-circle">
                ♀
              </div>
              <div className="gender-card-info">
                <span className="gender-card-name">Women</span>
                <span className="gender-card-details">Hairstyle • Makeup • Color • Bridal • 6 more</span>
              </div>
              <ChevronRight className="gender-card-chevron" size={20} />
            </motion.button>

          </div>
        </section>

        {/* Stats Row */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="home-stats-row"
        >
          <div className="home-stats-item">
            <Users size={22} strokeWidth={1.5} className="home-stats-icon" />
            <div className="home-stats-text">
              <span className="home-stats-number">1,200+</span>
              <span className="home-stats-label">Happy Clients</span>
            </div>
          </div>

          <div className="home-stats-item">
            <UserCheck size={22} strokeWidth={1.5} className="home-stats-icon" />
            <div className="home-stats-text">
              <span className="home-stats-number">50+</span>
              <span className="home-stats-label">Expert Stylists</span>
            </div>
          </div>

          <div className="home-stats-item">
            <Scissors size={22} strokeWidth={1.5} className="home-stats-icon" />
            <div className="home-stats-text">
              <span className="home-stats-number">25+</span>
              <span className="home-stats-label">Premium Services</span>
            </div>
          </div>

          <div className="home-stats-item">
            <Star size={22} strokeWidth={1.5} className="home-stats-icon" />
            <div className="home-stats-text">
              <span className="home-stats-number">98%</span>
              <span className="home-stats-label">Satisfaction Rate</span>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Dynamic Welcome Popup Modal */}
      <AnimatePresence>
        {showWelcome && (
          <div className="welcome-modal-overlay">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 15 }}
              className="welcome-modal-box"
            >
              <button 
                onClick={() => setShowWelcome(false)}
                style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
              <div className="welcome-modal-icon">
                <Award size={48} strokeWidth={1.5} />
              </div>
              <h2 className="welcome-modal-title">Authorized Access</h2>
              <p className="welcome-modal-text">
                Welcome to our <span style={{ color: '#c59d5f', fontWeight: 600 }}>{salonName}</span>! You have successfully logged into the smart management portal.
              </p>
              <button 
                onClick={() => setShowWelcome(false)}
                className="home-btn-gold"
                style={{ padding: '12px 30px', width: '100%', justifyContent: 'center' }}
              >
                Get Started
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Responsive Bottom Navigation for Mobile viewports */}
      <div className="bottom-nav-wrapper">
        <BottomNav active="home" />
      </div>
    </div>
  );
}
