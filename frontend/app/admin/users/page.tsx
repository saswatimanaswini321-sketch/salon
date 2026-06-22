'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, UserPlus, Trash2 } from 'lucide-react';
import { isAuthenticated, getUser } from '@/lib/auth';
import { api } from '@/lib/api';
import { Profile } from '@/lib/types';
import TopBar from '@/components/layout/TopBar';
import BottomNav from '@/components/layout/BottomNav';

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '+91 ', role: 'barber' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const user = typeof window !== 'undefined' ? getUser() : null;

  useEffect(() => {
    if (!isAuthenticated()) { router.replace('/login'); return; }
    if (user?.role !== 'admin') { router.replace('/home'); return; }
    fetchUsers();
  }, [router, user?.role]);

  async function fetchUsers() {
    try {
      const data = await api.admin.listUsers();
      setUsers(data);
    } catch { /* silently fail */ }
    finally { setLoading(false); }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return;
    
    const phoneDigits = form.phone.replace('+91 ', '');
    if (phoneDigits.length !== 10) {
      setError('Phone number must be exactly 10 digits.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const newUser = await api.admin.createUser(form);
      setUsers(prev => [newUser, ...prev]);
      setShowForm(false);
      setForm({ name: '', email: '', password: '', phone: '+91 ', role: 'barber' });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    } finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove this staff member?')) return;
    await api.admin.deleteUser(id);
    setUsers(prev => prev.filter(u => u.id !== id));
  }

  return (
    <div className="shell">
      <TopBar title="Manage Staff" showBack backHref="/admin" />

      <div className="content">
        <div className="fu" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <div className="eyebrow">Admin</div>
            <h2 style={{ fontSize: '24px' }}>Staff Accounts</h2>
          </div>
          <button
            onClick={() => setShowForm(v => !v)}
            className="btn btn-primary"
            style={{ width: 'auto', padding: '10px 16px', fontSize: '13px' }}
          >
            <UserPlus size={14} />
            Add Staff
          </button>
        </div>

        {showForm && (
          <div className="panel fu" style={{ padding: '24px', marginBottom: '24px' }}>
            <p className="eyebrow-label" style={{ marginBottom: '20px' }}>New Staff Member</p>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="label">Full Name</label>
                <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Staff member name" required />
              </div>
              <div>
                <label className="label">Email Address</label>
                <input className="input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@salon.com" required />
              </div>
              <div>
                <label className="label">Phone Number</label>
                <input className="input" type="tel" value={form.phone} onChange={e => {
                  let val = e.target.value;
                  if (!val.startsWith('+91 ')) val = '+91 ';
                  const digits = val.replace('+91 ', '').replace(/\D/g, '').slice(0, 10);
                  setForm(f => ({ ...f, phone: '+91 ' + digits }));
                }} placeholder="+91 9876543210" required />
              </div>
              <div>
                <label className="label">Temporary Password</label>
                <input className="input" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Min 8 characters" minLength={8} required />
              </div>
              {error && <div className="error-box">{error}</div>}
              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)} style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex: 2 }}>
                  {saving ? <><Loader2 size={14} className="spin" /> Creating...</> : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        )}

        {!showForm && (
          loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
            <Loader2 size={24} className="spin" color="var(--purple)" />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {users.map((u, i) => {
              const displayName = u.name || (u as any).full_name || 'Staff Member';
              const displayContact = u.email || (u as any).phone || 'No contact info';
              return (
              <div key={u.id} className="panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px', animation: `fadeUp 0.3s var(--ease) ${i * 0.05}s both` }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  background: 'var(--bg-input)', color: 'var(--purple-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '16px', fontWeight: 700, flexShrink: 0,
                }}>
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: 'var(--white)', marginBottom: '2px' }}>{displayName}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{displayContact}</div>
                </div>
                <span className={`badge ${u.role === 'admin' ? 'badge-amber' : 'badge-purple'}`} style={{ textTransform: 'capitalize' }}>{u.role}</span>
                {u.id !== user?.id && (
                  <button
                    onClick={() => handleDelete(u.id)}
                    style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', marginLeft: '4px' }}
                    aria-label="Remove staff member"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              );
            })}

            {!loading && users.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', fontSize: '13px' }}>
                No staff members yet.
              </div>
            )}
          </div>
        )
        )}
      </div>

      <BottomNav active="admin" />
    </div>
  );
}
