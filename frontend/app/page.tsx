// 'use client';

// import Link from 'next/link';
// import { ArrowRight, Scissors, Sparkles, Droplets, SprayCan, Beaker, CheckCircle } from 'lucide-react';
// import LandingNav from '@/components/layout/LandingNav';

// export default function LandingPage() {
//   return (
//     <div style={{ backgroundColor: '#000000', color: '#ffffff', minHeight: '100vh', fontFamily: 'var(--font-sans)', overflowX: 'hidden' }}>
      
//       {/* Shared Navbar */}
//       <LandingNav activePage="home" />
//       {/* Navbar */}
//       <nav className={`landing-nav ${scrolled ? 'scrolled' : ''}`}>
//         <div className="landing-nav-container">
//           <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
//             <div style={{ fontSize: '14px', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.7)' }}>
//               PHONE: 505-707-5050
//             </div>
//           </div>

//           <div className="landing-nav-links">
//             <a href="#services" style={{ color: '#fff', textDecoration: 'none' }}>Services</a>
//             <a href="#team" style={{ color: '#fff', textDecoration: 'none' }}>Team</a>
//             <Link href="/contact" style={{ color: '#fff', textDecoration: 'none' }}>Contact</Link>
//           </div>

//         <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
//           <Link href="/login" style={{
//             fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.15em',
//             color: '#fff', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.3)',
//             paddingBottom: '2px', transition: 'border-color 0.3s ease'
//           }}>
//             Admin Login
//           </Link>
//         </div>
//       </nav>

//       {/* Hero Section */}
//       <header className="hero-header">
//         {/* Dark overlay */}
//         <div className="hero-overlay" />
        
//         {/* Left Logo (Absolute) */}
//         <div className="hero-logo-side">
//           <Scissors size={32} />
//           <div className="vertical-text">BARBERSHOP</div>
//         </div>

//         <div className="hero-content">
//           <h1 className="hero-title">
//             Barbershop
//           </h1>
//           <p className="hero-subtitle">
//             AI Consultation Platform
//           </p>
          
//           <Link href="/login" style={{
//             display: 'inline-flex', alignItems: 'center', gap: '10px',
//             fontSize: '14px', letterSpacing: '0.05em', color: '#fff', textDecoration: 'none',
//             borderBottom: '1px solid rgba(255,255,255,0.5)', paddingBottom: '6px',
//             transition: 'all 0.3s ease'
//           }}>
//             Online portal access <ArrowRight size={16} />
//           </Link>
//         </div>

//         {/* Scroll badge */}
//         <div className="hero-scroll-badge">
//           <div className="hero-scroll-badge-text">
//             SCROLL FOR MORE
//           </div>
//           <div className="hero-scroll-badge-dot" />
//         </div>
//       </header>

//       <main className="landing-main">
        
//         {/* Section 1 */}
//         <section className="landing-section">
//           <div className="landing-section-media">
//             <img src="/service1.png" alt="Consultation" />
//           </div>
//           <div className="landing-section-text pad-right">
//             <h2 className="landing-section-title">
//               Precision AI Analysis<br />and Style Suggestions
//             </h2>
//             <div className="landing-section-divider" />
//             <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', lineHeight: 1.8, marginBottom: '20px' }}>
//               Elevate your consultation process. Our AI engine analyzes facial structure, hair texture, and current trends to provide the mathematically perfect style for every client.
//             </p>
//             <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', lineHeight: 1.8 }}>
//               Stop guessing and start visualizing. Show your clients exactly how they will look before the scissors ever touch their hair.
//             </p>
//           </div>
//         </section>

//         {/* Section 2 (Reversed) */}
//         <section className="landing-section-reversed">
//           <div className="landing-section-text pad-left">
//             <h2 className="landing-section-title">
//               Boost Client Retention<br />by up to 80%
//             </h2>
//             <div className="landing-section-divider" />
//             <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', lineHeight: 1.8, marginBottom: '20px' }}>
//               Clients who can visualize their results are significantly more likely to return. Build unparalleled trust by ensuring perfect communication and managing expectations.
//             </p>
//             <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', lineHeight: 1.8 }}>
//               Store client history securely in our portal, allowing you to instantly recall their past styles, preferences, and AI consultations on their next visit.
//             </p>
//           </div>
//           <div className="landing-section-media">
//             <img src="/service2.png" alt="Premium Products" />
//           </div>
//         </section>

//         {/* Section 3 */}
//         <section className="landing-section">
//           <div className="landing-section-media">
//             <img src="/service3.png" alt="Premium Experience" />
//           </div>
//           <div className="landing-section-text pad-right">
//             <h2 className="landing-section-title">
//               A Premium Visual<br />Experience
//             </h2>
//             <div className="landing-section-divider" />
//             <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', lineHeight: 1.8, marginBottom: '20px' }}>
//               From classic fades to modern texturing, our platform caters to all grooming needs. Simply snap a photo with your tablet, and within seconds present 3 hyper-realistic outcomes.
//             </p>
//             <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', lineHeight: 1.8 }}>
//               Modernize your barbershop while maintaining the classic, timeless art of grooming.
//             </p>
//           </div>
//         </section>

//         {/* Services Grid Section */}
//         <section id="services" className="services-section">
//           <div className="services-sidebar">
//             <h2>Our AI Services</h2>
//             <Link href="/login" style={{
//               display: 'inline-flex', alignItems: 'center', gap: '10px',
//               fontSize: '14px', letterSpacing: '0.05em', color: '#fff', textDecoration: 'none',
//               borderBottom: '1px solid rgba(255,255,255,0.5)', paddingBottom: '6px',
//             }}>
//               Staff Portal <ArrowRight size={16} />
//             </Link>
//           </div>
          
//           <div className="services-grid">
            
//             {[
//               { icon: Scissors, title: 'Classic Haircut', sub: 'Analyzed' },
//               { icon: Sparkles, title: 'Fade', sub: 'Perfected' },
//               { icon: Droplets, title: 'Color + Cut', sub: 'Visualized' },
//               { icon: SprayCan, title: 'Beard', sub: 'Short - Long' },
//               { icon: CheckCircle, title: 'Beard Styling', sub: 'Outlined' },
//               { icon: Beaker, title: 'Facial', sub: 'Rejuvenation' },
//             ].map((s, i) => (
//               <div key={i} style={{
//                 background: '#000',
//                 padding: '40px 20px',
//                 display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
//                 textAlign: 'center', transition: 'background 0.3s ease',
//                 cursor: 'pointer'
//               }}
//               onMouseEnter={e => e.currentTarget.style.background = '#0a0a0a'}
//               onMouseLeave={e => e.currentTarget.style.background = '#000'}
//               >
//                 <s.icon size={32} strokeWidth={1} style={{ marginBottom: '20px', color: 'rgba(255,255,255,0.8)' }} />
//                 <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', fontWeight: 400, marginBottom: '8px' }}>{s.title}</h3>
//                 <p style={{ fontSize: '12px', color: '#c59d5f', letterSpacing: '0.05em' }}>{s.sub}</p>
//               </div>
//             ))}

//           </div>
//         </section>

//       </main>

//       <footer style={{ padding: '60px 20px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
//         <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
//           © {new Date().getFullYear()} The Salon App. All rights reserved.
//         </p>
//       </footer>
//     </div>
//   );
// }


'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Scissors,
  Sparkles,
  Droplets,
  SprayCan,
  Beaker,
  CheckCircle,
} from 'lucide-react';
import LandingNav from '@/components/layout/LandingNav';

export default function LandingPage() {
  return (
    <div
      style={{
        backgroundColor: '#000000',
        color: '#ffffff',
        minHeight: '100vh',
        fontFamily: 'var(--font-sans)',
        overflowX: 'hidden',
      }}
    >
      {/* Shared Navbar */}
      <LandingNav activePage="home" />

      {/* Hero Section */}
      <header className="hero-header">
        <div className="hero-overlay" />

        <div className="hero-logo-side">
          <Scissors size={32} />
          <div className="vertical-text">BARBERSHOP</div>
        </div>

        <div className="hero-content">
          <h1 className="hero-title">
            Barbershop
          </h1>

          <p className="hero-subtitle">
            AI Consultation Platform
          </p>

          <Link
            href="/login"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '14px',
              letterSpacing: '0.05em',
              color: '#fff',
              textDecoration: 'none',
              borderBottom: '1px solid rgba(255,255,255,0.5)',
              paddingBottom: '6px',
            }}
          >
            Online portal access
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="hero-scroll-badge">
          <div className="hero-scroll-badge-text">
            SCROLL FOR MORE
          </div>
          <div className="hero-scroll-badge-dot" />
        </div>
      </header>

      <main className="landing-main">
        {/* Section 1 */}
        <section className="landing-section">
          <div className="landing-section-media">
            <img src="/service1.png" alt="Consultation" />
          </div>
          <div className="landing-section-text pad-right">
            <h2 className="landing-section-title">
              Precision AI Analysis<br />and Style Suggestions
            </h2>
            <div className="landing-section-divider" />
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', lineHeight: 1.8, marginBottom: '20px' }}>
              Elevate your consultation process. Our AI engine analyzes facial structure, hair texture, and current trends to provide the mathematically perfect style for every client.
            </p>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', lineHeight: 1.8 }}>
              Stop guessing and start visualizing. Show your clients exactly how they will look before the scissors ever touch their hair.
            </p>
          </div>
        </section>

        {/* Section 2 (Reversed) */}
        <section className="landing-section-reversed">
          <div className="landing-section-text pad-left">
            <h2 className="landing-section-title">
              Boost Client Retention<br />by up to 80%
            </h2>
            <div className="landing-section-divider" />
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', lineHeight: 1.8, marginBottom: '20px' }}>
              Clients who can visualize their results are significantly more likely to return. Build unparalleled trust by ensuring perfect communication and managing expectations.
            </p>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', lineHeight: 1.8 }}>
              Store client history securely in our portal, allowing you to instantly recall their past styles, preferences, and AI consultations on their next visit.
            </p>
          </div>
          <div className="landing-section-media">
            <img src="/service2.png" alt="Premium Products" />
          </div>
        </section>

        {/* Section 3 */}
        <section className="landing-section">
          <div className="landing-section-media">
            <img src="/service3.png" alt="Premium Experience" />
          </div>
          <div className="landing-section-text pad-right">
            <h2 className="landing-section-title">
              A Premium Visual<br />Experience
            </h2>
            <div className="landing-section-divider" />
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', lineHeight: 1.8, marginBottom: '20px' }}>
              From classic fades to modern texturing, our platform caters to all grooming needs. Simply snap a photo with your tablet, and within seconds present 3 hyper-realistic outcomes.
            </p>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', lineHeight: 1.8 }}>
              Modernize your barbershop while maintaining the classic, timeless art of grooming.
            </p>
          </div>
        </section>

        {/* Services Grid Section */}
        <section id="services" className="services-section">
          <div className="services-sidebar">
            <h2>Our AI Services</h2>
            <Link href="/login" style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              fontSize: '14px', letterSpacing: '0.05em', color: '#fff', textDecoration: 'none',
              borderBottom: '1px solid rgba(255,255,255,0.5)', paddingBottom: '6px',
            }}>
              Staff Portal <ArrowRight size={16} />
            </Link>
          </div>
          
          <div className="services-grid">
            {[
              { icon: Scissors, title: 'Classic Haircut', sub: 'Analyzed' },
              { icon: Sparkles, title: 'Fade', sub: 'Perfected' },
              { icon: Droplets, title: 'Color + Cut', sub: 'Visualized' },
              { icon: SprayCan, title: 'Beard', sub: 'Short - Long' },
              { icon: CheckCircle, title: 'Beard Styling', sub: 'Outlined' },
              { icon: Beaker, title: 'Facial', sub: 'Rejuvenation' },
            ].map((s, i) => (
              <div key={i} style={{
                background: '#000',
                padding: '40px 20px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                textAlign: 'center', transition: 'background 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#0a0a0a'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#000'; }}
              >
                <s.icon size={32} strokeWidth={1} style={{ marginBottom: '20px', color: 'rgba(255,255,255,0.8)' }} />
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', fontWeight: 400, marginBottom: '8px' }}>{s.title}</h3>
                <p style={{ fontSize: '12px', color: '#c59d5f', letterSpacing: '0.05em' }}>{s.sub}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer
        style={{
          padding: '60px 20px',
          textAlign: 'center',
          borderTop: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <p
          style={{
            fontSize: '12px',
            color: 'rgba(255,255,255,0.4)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          © {new Date().getFullYear()} The Salon App. All rights reserved.
        </p>
      </footer>
    </div>
  );
}