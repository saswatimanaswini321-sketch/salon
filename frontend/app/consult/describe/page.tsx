'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Loader2 } from 'lucide-react';
import { isAuthenticated, getUser } from '@/lib/auth';
import { getConsultState, setConsultState } from '@/lib/store';
import { api } from '@/lib/api';
import TopBar from '@/components/layout/TopBar';

export default function DescribePage() {
  const router = useRouter();
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [state, setState] = useState<ReturnType<typeof getConsultState> | null>(null);

  async function handleLetAiSuggest() {
    if (!state) return;
    setLoading(true);
    setError('');
    
    try {
      let finalDescription = '';
      const isDemo = !localStorage.getItem('salon_token') || localStorage.getItem('salon_token') === 'demo-token-not-real';
      if (isDemo) {
        finalDescription = state.gender === 'men' 
          ? 'Wants a modern clean fade with textured length on top, keeping it easy to style. Trim the beard to a clean contour with a sharp neckline.'
          : 'Looking for soft face-framing layers to enhance natural hair volume and shape, with subtle golden highlights suitable for warm skin tones.';
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        setConsultState({ description: finalDescription, sessionId: undefined as unknown as string });
        router.push('/consult/analyzing');
        return;
      }

      const photo = state.photoPreviews && state.photoPreviews.length > 0 ? state.photoPreviews[0] : undefined;
      const res = await api.ai.generateDescription(
        state.gender ?? 'men',
        state.selectedServiceIds,
        photo,
        description.trim() ? description.trim() : undefined
      );

      if (res && res.description) {
        finalDescription = res.description;
        setDescription(finalDescription);
      }

      const formData = new FormData();
      formData.append('gender', state.gender ?? 'men');
      formData.append('service_ids', JSON.stringify(state.selectedServiceIds));
      if (finalDescription.trim()) formData.append('description', finalDescription.trim());
      if (state.client?.id) formData.append('client_id', state.client.id);
      
      if (state.photoPreviews && state.photoPreviews.length > 0) {
        const fetchRes = await fetch(state.photoPreviews[0]);
        const blob = await fetchRes.blob();
        const file = new File([blob], `photo_0.jpg`, { type: blob.type });
        formData.append('photo', file);
      }

      const session = await api.sessions.create(formData);
      setConsultState({ description: finalDescription, sessionId: session.id });
      router.push('/consult/analyzing');
    } catch (err: any) {
      setError(err.message ?? 'Failed to auto-generate request notes');
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isAuthenticated()) { router.replace('/login'); return; }
    const s = getConsultState();
    if (!s.gender || !s.selectedServiceIds || s.selectedServiceIds.length === 0) { router.replace('/home'); return; }
    setState(s);
    if (s.description) setDescription(s.description);
  }, [router]);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!state) return;
    setLoading(true);
    setError('');

    try {
      setConsultState({ description });

      // Demo mode
      const isDemo = !localStorage.getItem('salon_token') || localStorage.getItem('salon_token') === 'demo-token-not-real';
      if (isDemo) {
        setConsultState({ sessionId: undefined as unknown as string });
        router.push('/consult/analyzing');
        return;
      }

      const formData = new FormData();
      formData.append('gender', state.gender ?? 'men');
      formData.append('service_ids', JSON.stringify(state.selectedServiceIds));
      if (description.trim()) formData.append('description', description.trim());
      if (state.client?.id) formData.append('client_id', state.client.id);
      
      if (state.photoPreviews && state.photoPreviews.length > 0) {
        // Convert the first base64 preview back to a file
        // Backend currently only supports a single 'photo'
        const res = await fetch(state.photoPreviews[0]);
        const blob = await res.blob();
        const file = new File([blob], `photo_0.jpg`, { type: blob.type });
        formData.append('photo', file);
      }

      const session = await api.sessions.create(formData);
      setConsultState({ sessionId: session.id });
      router.push('/consult/analyzing');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create session');
      setLoading(false);
    }
  }

  if (!state) return null;

  return (
    <div className="shell">
      <TopBar title="Consultation Notes" showBack backHref="/consult/services" />

      <div className="content">
        <div className="fu" style={{ marginBottom: '24px' }}>
          <div className="eyebrow">Step 4 of 4</div>
          <h2 style={{ fontSize: '24px' }}>Any specific requests?</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '6px' }}>
            Add notes about face shape, hair type, or the client&apos;s preferences to guide the AI.
          </p>
        </div>

        <form onSubmit={handleGenerate} className="fu1" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <textarea
              className="input"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Needs a low maintenance fade. Receding hairline. Prefers textured top."
              style={{ minHeight: '140px', resize: 'vertical', lineHeight: 1.5 }}
            />
            
            {/* Auto-generate request button */}
            <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-start' }}>
              <button
                type="button"
                onClick={handleLetAiSuggest}
                disabled={loading}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(197, 157, 95, 0.1)',
                  border: '1px solid rgba(197, 157, 95, 0.4)',
                  color: 'var(--purple-light)',
                  padding: '8px 16px',
                  borderRadius: 'var(--r-sm)',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 600,
                  transition: 'all 0.3s ease',
                  outline: 'none',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
                onMouseEnter={e => {
                  if (!loading) {
                    e.currentTarget.style.background = 'rgba(197, 157, 95, 0.2)';
                    e.currentTarget.style.borderColor = 'var(--purple-light)';
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(197, 157, 95, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(197, 157, 95, 0.4)';
                }}
              >
                {loading ? (
                  <Loader2 size={14} className="spin" />
                ) : (
                  <Sparkles size={14} />
                )}
                {loading ? 'AI is thinking...' : "Let's AI Suggest"}
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '16px' }}>
              {['Low maintenance', 'Professional look', 'Cover greys', 'Volume boost'].map(tag => (
                <button
                  key={tag} type="button"
                  onClick={() => setDescription(prev => prev ? `${prev} ${tag}` : tag)}
                  className="badge badge-outline"
                  style={{ cursor: 'pointer' }}
                >
                  + {tag}
                </button>
              ))}
            </div>
          </div>

          {error && <div className="error-box">{error}</div>}

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ height: '52px' }}>
            {loading ? <Loader2 size={18} className="spin" /> : <Sparkles size={18} />}
            {loading ? 'Initializing AI...' : 'Generate Styles'}
          </button>
        </form>
      </div>
    </div>
  );
}
