'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, CreditCard, Calendar, Download, Zap, TrendingUp, AlertCircle, Sparkles } from 'lucide-react';
import { isAuthenticated, getUser } from '@/lib/auth';
import { api } from '@/lib/api';
import { Salon } from '@/lib/types';
import LandingNav from '@/components/layout/LandingNav';

export default function SubscriptionPage() {
  const router = useRouter();
  const [salon, setSalon] = useState<Salon | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) { router.replace('/login'); return; }
    const profile = getUser();
    if (profile?.role !== 'admin') { router.replace('/consult'); return; }

    api.admin.getSalonAndBranches()
      .then(data => setSalon(data as Salon))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [router]);

  if (loading || !salon) {
    return (
      <div className="shell" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={32} className="spin" color="var(--purple)" />
      </div>
    );
  }

  const sub = salon.subscription;
  const usage = salon.apiUsage;
  
  const buyingDate = new Date(salon.createdAt);
  const expiryDate = new Date(buyingDate);
  expiryDate.setFullYear(buyingDate.getFullYear() + 1); // Mock 1 year validity

  const aiPercentage = usage ? Math.min(100, Math.round((usage.apiCalls / usage.monthlyLimit) * 100)) : 0;
  
  // Dummy receipts
  const mockReceipts = [
    { id: 'INV-2024-001', date: buyingDate.toISOString(), amount: sub?.annualPrice || 0, status: 'Paid' },
  ];

  const handleDownloadReceipt = (rcpt: any) => {
    import('jspdf').then(({ jsPDF }) => {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(22);
      doc.setTextColor(30, 30, 30);
      doc.text("SALON AI PRO", 105, 30, { align: 'center' });
      
      doc.setFontSize(14);
      doc.setTextColor(100, 100, 100);
      doc.text("Subscription Receipt", 105, 40, { align: 'center' });
      
      // Line
      doc.setDrawColor(200, 200, 200);
      doc.line(20, 50, 190, 50);
      
      // Details
      doc.setFontSize(12);
      doc.setTextColor(50, 50, 50);
      doc.text(`Receipt ID:`, 20, 70);
      doc.text(rcpt.id, 60, 70);
      
      doc.text(`Date:`, 20, 80);
      doc.text(new Date(rcpt.date).toLocaleDateString(), 60, 80);
      
      doc.text(`Status:`, 20, 90);
      doc.text(rcpt.status.toUpperCase(), 60, 90);
      
      doc.line(20, 105, 190, 105);
      
      // Amount
      doc.setFontSize(16);
      doc.setTextColor(30, 30, 30);
      doc.text(`Amount Paid:`, 20, 125);
      doc.text(`INR ${rcpt.amount}`, 60, 125);
      
      // Footer
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text("Thank you for your business!", 105, 260, { align: 'center' });
      doc.text("(This is an automatically generated receipt for testing)", 105, 265, { align: 'center' });
      
      doc.save(`Receipt_${rcpt.id}.pdf`);
    }).catch(err => {
      console.error("Failed to load jsPDF", err);
      alert("Failed to generate PDF. Please try again.");
    });
  };

  return (
    <div className="shell">
      <LandingNav activePage="admin" />

      <div className="content" style={{ paddingTop: '100px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <Link href="/admin" className="btn btn-secondary" style={{ padding: '8px', minWidth: 0, width: '36px', height: '36px', borderRadius: '50%' }}>
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 500, letterSpacing: '-0.02em' }}>Manage Subscription</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>View plan details, limits, and billing history</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
          
          {/* Current Plan Overview */}
          <div className="panel fu" style={{ position: 'relative', overflow: 'hidden', padding: '32px' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: '200px', height: '200px', background: 'radial-gradient(circle at top right, rgba(197,157,95,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <div style={{ background: 'rgba(197,157,95,0.1)', color: 'var(--purple)', padding: '6px', borderRadius: '8px' }}>
                    <Sparkles size={20} />
                  </div>
                  <h3 style={{ fontSize: '20px', color: 'var(--white)' }}>{sub?.name || 'No Plan'}</h3>
                </div>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Active Plan • Renews {expiryDate.toLocaleDateString()}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '28px', fontWeight: 600, color: 'var(--white)' }}>
                  ₹{sub?.annualPrice || 0}
                  <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 400 }}> / yr</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
               <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: '12px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Token Limit</div>
                  <div style={{ fontSize: '18px', fontWeight: 600 }}>{sub?.aiLimit || 0} / month</div>
               </div>
               <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: '12px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Staff Limit</div>
                  <div style={{ fontSize: '18px', fontWeight: 600 }}>{sub?.barberLimit || 0} Members</div>
               </div>
               <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: '12px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Plan Expiry</div>
                  <div style={{ fontSize: '18px', fontWeight: 600 }}>{expiryDate.toLocaleDateString()}</div>
               </div>
            </div>
          </div>

          {/* Usage Statistics */}
          <div className="panel fu1" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={16} color="var(--purple-light)" /> Usage Statistics
            </h3>
            
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>AI Generations & API Calls</span>
                <span style={{ fontWeight: 600 }}>{usage?.apiCalls || 0} / {usage?.monthlyLimit || 0}</span>
              </div>
              
              <div style={{ width: '100%', height: '8px', background: 'var(--bg-input)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ 
                  height: '100%', 
                  width: `${aiPercentage}%`, 
                  background: aiPercentage > 90 ? 'var(--error)' : 'var(--purple)',
                  borderRadius: '4px',
                  transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
                }} />
              </div>
              
              {aiPercentage > 90 && (
                <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--error)', fontSize: '12px', background: 'rgba(239, 68, 68, 0.1)', padding: '8px 12px', borderRadius: '6px' }}>
                  <AlertCircle size={14} /> You are nearing your monthly limit. Upgrade plan to increase limits.
                </div>
              )}
            </div>
          </div>

          {/* Billing & Receipts */}
          <div className="panel fu2" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CreditCard size={16} color="var(--purple-light)" /> Billing History
            </h3>

            <div style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-input)', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                    <th style={{ padding: '12px 16px', fontWeight: 500, color: 'var(--text-secondary)' }}>Invoice</th>
                    <th style={{ padding: '12px 16px', fontWeight: 500, color: 'var(--text-secondary)' }}>Date</th>
                    <th style={{ padding: '12px 16px', fontWeight: 500, color: 'var(--text-secondary)' }}>Amount</th>
                    <th style={{ padding: '12px 16px', fontWeight: 500, color: 'var(--text-secondary)' }}>Status</th>
                    <th style={{ padding: '12px 16px', fontWeight: 500, color: 'var(--text-secondary)', textAlign: 'right' }}>Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {mockReceipts.map((rcpt, i) => (
                    <tr key={i} style={{ borderBottom: i === mockReceipts.length - 1 ? 'none' : '1px solid var(--border)' }}>
                      <td style={{ padding: '16px', fontWeight: 500 }}>{rcpt.id}</td>
                      <td style={{ padding: '16px', color: 'var(--text-muted)' }}>{new Date(rcpt.date).toLocaleDateString()}</td>
                      <td style={{ padding: '16px' }}>₹{rcpt.amount}</td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 8px', borderRadius: '4px', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', fontSize: '11px', fontWeight: 600 }}>
                          {rcpt.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '6px 12px', fontSize: '12px', height: 'auto', minHeight: '0', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                          onClick={() => handleDownloadReceipt(rcpt)}
                        >
                          <Download size={14} /> Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <p style={{ marginTop: '16px', fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
               <AlertCircle size={14} /> Dummy receipt provided for testing purposes.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
