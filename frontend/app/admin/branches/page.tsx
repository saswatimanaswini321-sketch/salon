'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, Building2 } from 'lucide-react';
import { isAuthenticated, getUser } from '@/lib/auth';
import { api } from '@/lib/api';
import TopBar from '@/components/layout/TopBar';

export default function BranchesPage() {
  const router = useRouter();
  const [salon, setSalon] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', address: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  // Salon Edit States
  const [showSalonEdit, setShowSalonEdit] = useState(false);
  const [salonForm, setSalonForm] = useState({ name: '', address: '', gstNo: '' });
  const [savingSalon, setSavingSalon] = useState(false);
  const [salonError, setSalonError] = useState('');
  const user = typeof window !== 'undefined' ? getUser() : null;

  useEffect(() => {
    if (!isAuthenticated()) { router.replace('/login'); return; }
    if (user?.role !== 'admin') { router.replace('/consult'); return; }
    fetchSalonData();
  }, [router, user?.role]);

  async function fetchSalonData() {
    try {
      const data = await api.admin.getSalonAndBranches();
      setSalon(data);
      setSalonForm({
        name: data.name || '',
        address: data.address || '',
        gstNo: data.gstNo || data.gstNumber || ''
      });
    } catch { /* silently fail */ }
    finally { setLoading(false); }
  }

  async function handleUpdateSalon(e: React.FormEvent) {
    e.preventDefault();
    if (!salonForm.name) return;
    
    setSavingSalon(true);
    setSalonError('');
    try {
      const updated = await api.admin.updateSalon(salonForm);
      setSalon((prev: any) => ({ ...prev, ...updated, gstNumber: updated.gstNo || updated.gstNumber }));
      setShowSalonEdit(false);
    } catch (err: unknown) {
      setSalonError(err instanceof Error ? err.message : 'Failed to update salon');
    } finally { setSavingSalon(false); }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name) return;
    
    setSaving(true);
    setError('');
    try {
      const newBranch = await api.admin.addBranch(form);
      setSalon((prev: any) => ({ ...prev, branches: [...(prev.branches || []), newBranch] }));
      setShowForm(false);
      setForm({ name: '', address: '' });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create branch');
    } finally { setSaving(false); }
  }

  return (
    <div className="shell">
      <TopBar title="Manage Branches" showBack backHref="/admin" />

      <div className="content">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
            <Loader2 size={24} className="spin" color="var(--purple)" />
          </div>
        ) : salon ? (
          <>
            <div className="fu panel" style={{ padding: '24px', marginBottom: '24px', background: 'linear-gradient(145deg, var(--bg-panel), rgba(138, 43, 226, 0.05))' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className="eyebrow" style={{ color: 'var(--purple-light)' }}>Salon Details</div>
                  <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>{salon.name}</h2>
                </div>
                {!showSalonEdit && (
                  <button 
                    onClick={() => setShowSalonEdit(true)} 
                    className="btn btn-secondary" 
                    style={{ fontSize: '12px', padding: '6px 12px', height: 'auto' }}
                  >
                    Edit Settings
                  </button>
                )}
              </div>

              {showSalonEdit ? (
                <form onSubmit={handleUpdateSalon} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label className="label">Salon Name</label>
                      <input className="input" value={salonForm.name} onChange={e => setSalonForm(f => ({ ...f, name: e.target.value }))} required />
                    </div>
                    <div>
                      <label className="label">GST Number</label>
                      <input className="input" value={salonForm.gstNo} onChange={e => setSalonForm(f => ({ ...f, gstNo: e.target.value }))} placeholder="Optional GST No" />
                    </div>
                  </div>
                  {salonError && <div className="error-box">{salonError}</div>}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowSalonEdit(false)} style={{ flex: 1 }}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={savingSalon} style={{ flex: 1 }}>
                      {savingSalon ? <><Loader2 size={14} className="spin" /> Saving...</> : 'Save Settings'}
                    </button>
                  </div>
                </form>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Owner Name</span>
                    <span style={{ fontSize: '14px', fontWeight: 500 }}>{salon.ownerName || 'N/A'}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Email</span>
                    <span style={{ fontSize: '14px', fontWeight: 500 }}>{salon.email || 'N/A'}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Phone</span>
                    <span style={{ fontSize: '14px', fontWeight: 500 }}>{salon.mobile || 'N/A'}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>GST Number</span>
                    <span style={{ fontSize: '14px', fontWeight: 500 }}>{salon.gstNo || salon.gstNumber || 'N/A'}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="fu" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div>
                <h3 style={{ fontSize: '20px' }}>Branches</h3>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Manage your salon locations</span>
              </div>
              <button
                onClick={() => setShowForm(v => !v)}
                className="btn btn-primary"
                style={{ width: 'auto', padding: '10px 16px', fontSize: '13px' }}
              >
                <Plus size={16} style={{ marginRight: '6px' }} />
                Add Branch
              </button>
            </div>

            {showForm && (
              <div className="panel fu" style={{ padding: '24px', marginBottom: '24px' }}>
                <p className="eyebrow-label" style={{ marginBottom: '20px' }}>New Branch</p>
                <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label className="label">Branch Name</label>
                    <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Downtown Branch" required />
                  </div>
                  <div>
                    <label className="label">Address</label>
                    <textarea className="input" style={{ minHeight: '80px', paddingTop: '12px' }} value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Full address" required />
                  </div>
                  {error && <div className="error-box">{error}</div>}
                  <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)} style={{ flex: 1 }}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex: 1 }}>
                      {saving ? <><Loader2 size={14} className="spin" /> Creating...</> : 'Create Branch'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {!showForm && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {salon.branches && salon.branches.length > 0 ? (
                  salon.branches.map((b: any, i: number) => (
                    <div key={b.id} className="panel" style={{ padding: '20px', display: 'flex', alignItems: 'flex-start', gap: '14px', animation: `fadeUp 0.3s var(--ease) ${i * 0.05}s both` }}>
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '50%',
                        background: 'var(--bg-input)', color: 'var(--purple-light)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <Building2 size={18} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: 'var(--white)', marginBottom: '4px', fontSize: '16px' }}>{b.name}</div>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>{b.address || 'No address provided'}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', fontSize: '13px' }}>
                    No branches added yet.
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', fontSize: '13px' }}>
            Could not load salon details.
          </div>
        )}
      </div>

    </div>
  );
}
