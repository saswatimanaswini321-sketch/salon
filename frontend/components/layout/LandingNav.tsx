'use client';

import Link from 'next/link';
import { Menu, X, Scissors } from 'lucide-react';
import { useEffect, useState } from 'react';
import { isAuthenticated } from '@/lib/auth';

interface LandingNavProps {
  /** Which page is currently active — used to highlight the correct nav link */
  activePage?: 'home' | 'services' | 'team' | 'contact';
  /** Optional right-side slot for page-specific actions (profile dropdown, login, etc.) */
  rightSlot?: React.ReactNode;
}

export default function LandingNav({ activePage, rightSlot }: LandingNavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const linkStyle = (page: string) => ({
    color: activePage === page ? '#fff' : 'rgba(255,255,255,0.7)',
    textDecoration: 'none' as const,
    borderBottom: activePage === page ? '1px solid #fff' : 'none',
    paddingBottom: activePage === page ? '2px' : '0',
  });

  return (
    <nav className={`landing-nav ${scrolled ? 'scrolled' : ''}`}>
      <div className="landing-nav-container">
        {/* Left: Brand logo + name */}
        <Link href={isLoggedIn ? "/home" : "/"} className="landing-nav-left">
          <div className="landing-nav-logo-icon">
            <Scissors size={16} />
          </div>
          <span className="landing-nav-brand-text">AI SALON</span>
        </Link>

        {/* Center: Navigation links — hidden on mobile, shown on desktop */}
        <div className="landing-nav-links">
          <Link href={isLoggedIn ? "/home" : "/"} style={linkStyle('home')}>Home</Link>
          <Link href="/services" style={linkStyle('services')}>Services</Link>
          <Link href="/#team" style={linkStyle('team')}>Team</Link>
          <Link href="/contact" style={linkStyle('contact')}>Contact</Link>
        </div>

        {/* Right: Custom slot + burger button */}
        <div className="landing-nav-right">
          {rightSlot ? (
            <div className="landing-nav-right-slot">
              {rightSlot}
            </div>
          ) : (
            <Link href="/login" className="landing-nav-staff-link">
              Staff Login
            </Link>
          )}

          <button
            className="landing-burger-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="landing-mobile-menu">
          <Link href={isLoggedIn ? "/home" : "/"} onClick={() => setMobileMenuOpen(false)} className="landing-mobile-menu-link">Home</Link>
          <Link href="/services" onClick={() => setMobileMenuOpen(false)} className="landing-mobile-menu-link">Services</Link>
          <Link href="/#team" onClick={() => setMobileMenuOpen(false)} className="landing-mobile-menu-link">Team</Link>
          <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="landing-mobile-menu-link">Contact</Link>
          {rightSlot && (
            <div className="landing-mobile-menu-actions" onClick={() => setMobileMenuOpen(false)}>
              {rightSlot}
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
