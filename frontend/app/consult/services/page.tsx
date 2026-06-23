'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Loader2, Scissors, PaintBucket, Sparkles, Wind, Droplets } from 'lucide-react';
import { isAuthenticated } from '@/lib/auth';
import { getConsultState, setConsultState } from '@/lib/store';
import { api } from '@/lib/api';
import { Service } from '@/lib/types';
import TopBar from '@/components/layout/TopBar';

const MOCK_SERVICES: Record<string, Service[]> = {
  men: [
    { id: 'haircut', gender: 'men', name: 'Haircut', icon: 'scissors', description: 'Fade, taper, crop', requires_photo: true, ai_prompt_template: '' },
    { id: 'beard', gender: 'men', name: 'Beard Trim', icon: 'scissors', description: 'Shape and line up', requires_photo: true, ai_prompt_template: '' },
    { id: 'hair-color-m', gender: 'men', name: 'Color', icon: 'palette', description: 'Global or highlights', requires_photo: true, ai_prompt_template: '' },
    { id: 'facial-m', gender: 'men', name: 'Facial', icon: 'sparkles', description: 'Skin analysis', requires_photo: true, ai_prompt_template: '' },
    { id: 'texture-m', gender: 'men', name: 'Texture', icon: 'wind', description: 'Perm or smoothening', requires_photo: true, ai_prompt_template: '' },
  ],
  women: [
    { id: 'hairstyle-w', gender: 'women', name: 'Haircut', icon: 'scissors', description: 'Layers, bob, bangs', requires_photo: true, ai_prompt_template: '' },
    { id: 'makeup', gender: 'women', name: 'Makeup', icon: 'sparkles', description: 'Occasion styling', requires_photo: true, ai_prompt_template: '' },
    { id: 'hair-color-w', gender: 'women', name: 'Color', icon: 'palette', description: 'Balayage, root touchup', requires_photo: true, ai_prompt_template: '' },
    { id: 'facial-w', gender: 'women', name: 'Skin Care', icon: 'sparkles', description: 'Glow treatments', requires_photo: true, ai_prompt_template: '' },
    { id: 'bridal', gender: 'women', name: 'Bridal', icon: 'sparkles', description: 'Complete look', requires_photo: true, ai_prompt_template: '' },
  ],
};

const ICONS: Record<string, React.ReactNode> = {
  scissors: <Scissors size={20} />,
  palette: <PaintBucket size={20} />,
  sparkles: <Sparkles size={20} />,
  wind: <Wind size={20} />,
  droplet: <Droplets size={20} />,
};

export default function ServicesPage() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) { router.replace('/login'); return; }
    const state = getConsultState();
    if (!state.gender) { router.replace('/home'); return; }
    setSelected(state.selectedServiceIds || []);

    api.services.list(state.gender)
      .then(res => setServices(res && res.length ? res : MOCK_SERVICES[state.gender ?? 'men']))
      .catch(() => setServices(MOCK_SERVICES[state.gender ?? 'men']))
      .finally(() => setLoading(false));
  }, [router]);

  function toggle(id: string) {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  function handleContinue() {
    setConsultState({ selectedServiceIds: selected });
    router.push('/consult/describe');
  }

  return (
    <div className="shell">
      <TopBar title="Services" showBack backHref="/consult/capture" />

      <div className="content">
        <div className="fu" style={{ marginBottom: '24px' }}>
          <div className="eyebrow">Step 3 of 4</div>
          <h2 style={{ fontSize: '24px' }}>What are we doing?</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '6px' }}>
            Select one or more services to generate tailored AI suggestions.
          </p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
            <Loader2 size={24} className="spin" color="var(--purple-light)" />
          </div>
        ) : (
          <div className="fu1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {services.map(s => {
              const isSel = selected.includes(s.id);
              return (
                <button
                  key={s.id}
                  className={`panel panel-interactive ${isSel ? 'panel-selected' : ''}`}
                  onClick={() => toggle(s.id)}
                  style={{
                    padding: '16px', textAlign: 'left',
                    display: 'flex', flexDirection: 'column', gap: '12px',
                  }}
                >
                  <div style={{
                    width: '36px', height: '36px', borderRadius: 'var(--r-sm)',
                    background: isSel ? 'var(--purple)' : 'rgba(255,255,255,0.05)',
                    color: isSel ? 'white' : 'var(--text-secondary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all var(--t) var(--ease)',
                  }}>
                    {ICONS[s.icon] || <Sparkles size={18} />}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: isSel ? 'white' : 'var(--text-primary)', marginBottom: '2px' }}>{s.name}</div>
                    <div style={{ fontSize: '11px', color: isSel ? 'var(--purple-light)' : 'var(--text-muted)' }}>{s.description || 'AI consultation'}</div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          padding: '16px 22px', paddingBottom: 'calc(16px + env(safe-area-inset-bottom))',
          background: 'rgba(9,9,14,0.9)', backdropFilter: 'blur(12px)',
          borderTop: '1px solid var(--border)', zIndex: 10,
        }}>
          <div style={{ maxWidth: '480px', margin: '0 auto' }}>
            <button
              className="btn btn-primary"
              disabled={selected.length === 0}
              onClick={handleContinue}
              style={{ height: '52px' }}
            >
              Continue ({selected.length}) <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
