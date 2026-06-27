'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, ArrowRight, ArrowLeft, CheckCircle2, ChevronRight, Store, User as UserIcon, Building2, CreditCard } from 'lucide-react';
import { api } from '@/lib/api';
import { saveAuth, isAuthenticated } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export default function SignupPage() {
  const router = useRouter();
  
  // Step Management
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Personal Details
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Step 2: Store Details
  const [storeName, setStoreName] = useState('');
  const [storeAddress, setStoreAddress] = useState('');
  const [storeGst, setStoreGst] = useState('');

  // Step 3: Staff Details
  const [skipStaff, setSkipStaff] = useState(false);
  const [selfAsStaff, setSelfAsStaff] = useState(false);
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPhone, setStaffPhone] = useState('+91 ');
  const [staffPassword, setStaffPassword] = useState('');
  const [showStaffPassword, setShowStaffPassword] = useState(false);

  // Step 4: Subscription Plan
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'quarterly' | 'annual'>('monthly');
  const [loadingPlans, setLoadingPlans] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) router.replace('/consult');
  }, [router]);

  useEffect(() => {
    if (step === 4 && plans.length === 0) {
      setLoadingPlans(true);
      api.subscriptions.listPublic()
        .then(data => {
          setPlans(data);
          if (data.length > 0) setSelectedPlanId(data[0].id);
        })
        .catch(err => console.error("Failed to fetch plans", err))
        .finally(() => setLoadingPlans(false));
    }
  }, [step]);

  // Handle "Self as staff" checkbox
  useEffect(() => {
    if (selfAsStaff) {
      setStaffName(name);
      setStaffEmail(email);
      setStaffPhone(phone);
      setStaffPassword(password);
    } else {
      setStaffName('');
      setStaffEmail('');
      setStaffPhone('+91 ');
      setStaffPassword('');
    }
  }, [selfAsStaff, name, email, phone, password]);

  const handleNext = async () => {
    setError('');
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/;

    if (step === 1) {
      if (!name.trim() || !email.trim() || !password.trim()) {
        setError('Please fill in all personal details.');
        return;
      }
      if (!passwordRegex.test(password)) {
        setError('Password must have a minimum length of 8, with 1 uppercase, 1 lowercase, 1 number, and 1 special character.');
        return;
      }
      const phoneDigits = phone.slice(4).trim();
      if (phoneDigits.length !== 10) {
        setError('Phone number must be exactly 10 digits.');
        return;
      }

      setLoading(true);
      try {
        await api.auth.checkEmail(email.trim());
      } catch (err: any) {
        setError(err.message || 'This email is already registered.');
        setLoading(false);
        return;
      }
      setLoading(false);
    }
    if (step === 2) {
      if (!storeName.trim() || !storeAddress.trim()) {
        setError('Store name and address are required.');
        return;
      }
    }
    if (step === 3 && !skipStaff) {
      if (!staffName.trim() || !staffEmail.trim() || !staffPassword.trim()) {
        setError('Please fill in all staff details or skip this step.');
        return;
      }
      if (!passwordRegex.test(staffPassword)) {
        setError('Staff password must have a minimum length of 8, with 1 uppercase, 1 lowercase, 1 number, and 1 special character.');
        return;
      }
      const staffPhoneDigits = staffPhone.slice(4).trim();
      if (staffPhoneDigits.length !== 10 && staffPhoneDigits.length > 0) {
        setError('Staff phone number must be exactly 10 digits.');
        return;
      }
    }
    setStep(s => s + 1);
  };

  const handleBack = () => {
    setError('');
    setStep(s => s - 1);
  };

  async function handleCompleteRegistration() {
    if (!selectedPlanId) {
      setError('Please select a subscription plan.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      // 1. Create the Admin user and provision everything in the backend
      await api.auth.signup({
        name: name.trim(),
        email: email.trim(),
        password: password,
        phone: phone.trim() || undefined,
        store_name: storeName.trim(),
        store_address: storeAddress.trim(),
        store_gst: storeGst.trim() || undefined,
        subscription_id: selectedPlanId,
        billing_cycle: billingCycle,
        staff_name: !skipStaff ? staffName.trim() : undefined,
        staff_email: !skipStaff ? staffEmail.trim() : undefined,
        staff_phone: (!skipStaff && staffPhone.trim() !== '+91 ') ? staffPhone.trim() : undefined,
        staff_password: !skipStaff ? staffPassword : undefined,
      });

      // 2. Log the admin in directly to get the Supabase session
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });
      
      if (loginError) throw loginError;
      
      if (data.session && data.user) {
        // Map Supabase user to our internal Profile format
        const profile = {
          id: data.user.id,
          role: 'admin' as const,
          name: name.trim(),
          email: data.user.email || '',
          store_name: storeName.trim(),
          phone: phone.trim(),
          created_at: data.user.created_at
        };
        saveAuth(data.session.access_token, profile);
        localStorage.setItem('show_welcome', 'true');
        router.replace('/consult');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const renderStepIndicator = () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px', gap: '8px' }}>
      {[1, 2, 3, 4].map(s => (
        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', fontWeight: 600,
            background: step >= s ? 'var(--purple)' : 'rgba(255,255,255,0.1)',
            color: step >= s ? '#fff' : 'var(--text-muted)',
            transition: 'all 0.3s'
          }}>
            {s}
          </div>
          {s < 4 && <div style={{ width: '24px', height: '2px', background: step > s ? 'var(--purple)' : 'rgba(255,255,255,0.1)', transition: 'all 0.3s' }} />}
        </div>
      ))}
    </div>
  );

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      background: '#000000',
      position: 'relative',
      overflowX: 'hidden',
    }}>
      {/* Immersive Background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'url(/hero.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.4,
        filter: 'blur(8px)',
        zIndex: 0,
        pointerEvents: 'none',
      }} />

      <div style={{ 
        position: 'absolute', 
        inset: 0, 
        background: 'linear-gradient(to right, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.7) 50%, rgba(0, 0, 0, 0.9) 100%)', 
        zIndex: 1,
        pointerEvents: 'none',
      }} />

      <Link href="/" style={{
        position: 'absolute', top: '24px', left: '24px', zIndex: 50,
        display: 'flex', alignItems: 'center', gap: '8px',
        color: 'rgba(255, 255, 255, 0.7)', textDecoration: 'none',
        fontSize: '14px', fontWeight: 500, transition: 'color 0.2s',
      }}>
        <ArrowLeft size={18} />
        Back to Home
      </Link>

      <div style={{
        position: 'relative', zIndex: 10,
        width: '100%', padding: '40px 24px',
        maxWidth: step === 4 ? '800px' : '480px',
        margin: '0 auto', transition: 'max-width 0.3s'
      }}>

        {/* Headline */}
        <div className="fu" style={{ marginBottom: '24px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '36px', fontFamily: 'var(--font-serif)', color: 'var(--white)', marginBottom: '8px', fontWeight: 400 }}>
            {step === 1 && "Personal Details"}
            {step === 2 && "Store Details"}
            {step === 3 && "Add Your First Staff"}
            {step === 4 && "Choose Your Plan"}
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
            {step === 1 && "Let's start with your platform admin account."}
            {step === 2 && "Tell us about your main salon location."}
            {step === 3 && "Add a barber or stylist. You can also skip this for now."}
            {step === 4 && "Select a subscription to activate your salon."}
          </p>
        </div>

        {renderStepIndicator()}

        {/* Form Panel */}
        <div className="fu1" style={{
          background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)',
          padding: '32px', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          borderRadius: 'var(--r-lg)'
        }}>
          
          {/* STEP 1: Personal */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="label">Full Name</label>
                <input type="text" className="input" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" style={{ background: 'rgba(255,255,255,0.03)' }} />
              </div>
              <div>
                <label className="label">Phone Number</label>
                <input type="tel" className="input" value={phone} onChange={e => {
                    let val = e.target.value;
                    if (!val.startsWith('+91 ')) val = '+91 ' + val.replace(/^\+91 ?/, '');
                    const digitsOnly = val.slice(4).replace(/\D/g, '').slice(0, 10);
                    setPhone('+91 ' + digitsOnly);
                  }} placeholder="+91 9876543210" style={{ background: 'rgba(255,255,255,0.03)' }} />
              </div>
              <div>
                <label className="label">Email Address</label>
                <input type="email" className="input" value={email} onChange={e => setEmail(e.target.value)} placeholder="owner@salon.com" style={{ background: 'rgba(255,255,255,0.03)' }} />
              </div>
              <div>
                <label className="label">Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPassword ? 'text' : 'password'} className="input" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 8 characters" minLength={8} pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}" title="Password must have a minimum length of 8, with 1 uppercase, 1 lowercase, 1 number, and 1 special character" style={{ background: 'rgba(255,255,255,0.03)' }} />
                  <button type="button" onClick={() => setShowPassword(v => !v)} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', zIndex: 10 }}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Store */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="label">Store Name</label>
                <input type="text" className="input" value={storeName} onChange={e => setStoreName(e.target.value)} placeholder="The Golden Scissors" style={{ background: 'rgba(255,255,255,0.03)' }} />
              </div>
              <div>
                <label className="label">Store Address</label>
                <textarea className="input" value={storeAddress} onChange={e => setStoreAddress(e.target.value)} placeholder="123 Main Street, City" rows={3} style={{ background: 'rgba(255,255,255,0.03)', resize: 'none' }} />
              </div>
              <div>
                <label className="label">GST Number (Optional)</label>
                <input type="text" className="input" value={storeGst} onChange={e => setStoreGst(e.target.value)} placeholder="22AAAAA0000A1Z5" style={{ background: 'rgba(255,255,255,0.03)' }} />
              </div>
            </div>
          )}

          {/* STEP 3: Staff */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                <input type="checkbox" id="selfAsStaff" checked={selfAsStaff} onChange={e => {
                  setSelfAsStaff(e.target.checked);
                  if (e.target.checked) setSkipStaff(false);
                }} style={{ width: '16px', height: '16px', accentColor: 'var(--purple)' }} />
                <label htmlFor="selfAsStaff" style={{ color: 'var(--white)', fontSize: '14px', cursor: 'pointer' }}>I will be working as a staff member</label>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                <input type="checkbox" id="skipStaff" checked={skipStaff} onChange={e => {
                  setSkipStaff(e.target.checked);
                  if (e.target.checked) setSelfAsStaff(false);
                }} style={{ width: '16px', height: '16px', accentColor: 'var(--purple)' }} />
                <label htmlFor="skipStaff" style={{ color: 'var(--white)', fontSize: '14px', cursor: 'pointer' }}>Skip staff setup for now</label>
              </div>

              {!skipStaff && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', opacity: selfAsStaff ? 0.7 : 1 }}>
                  <div>
                    <label className="label">Staff Name</label>
                    <input type="text" className="input" value={staffName} onChange={e => setStaffName(e.target.value)} readOnly={selfAsStaff} placeholder="Jane Doe" style={{ background: 'rgba(255,255,255,0.03)' }} />
                  </div>
                  <div>
                    <label className="label">Staff Email</label>
                    <input type="email" className="input" value={staffEmail} onChange={e => setStaffEmail(e.target.value)} readOnly={selfAsStaff} placeholder="jane@salon.com" style={{ background: 'rgba(255,255,255,0.03)' }} />
                  </div>
                  <div>
                    <label className="label">Staff Phone</label>
                    <input type="tel" className="input" value={staffPhone} onChange={e => {
                        let val = e.target.value;
                        if (!val.startsWith('+91 ')) val = '+91 ' + val.replace(/^\+91 ?/, '');
                        const digitsOnly = val.slice(4).replace(/\D/g, '').slice(0, 10);
                        setStaffPhone('+91 ' + digitsOnly);
                      }} readOnly={selfAsStaff} placeholder="+91 9876543210" style={{ background: 'rgba(255,255,255,0.03)' }} />
                  </div>
                  <div>
                    <label className="label">Staff Password</label>
                    <div style={{ position: 'relative' }}>
                      <input type={showStaffPassword ? 'text' : 'password'} className="input" value={staffPassword} onChange={e => setStaffPassword(e.target.value)} readOnly={selfAsStaff} placeholder="Min 8 characters" minLength={8} pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}" title="Staff password must have a minimum length of 8, with 1 uppercase, 1 lowercase, 1 number, and 1 special character" style={{ background: 'rgba(255,255,255,0.03)' }} />
                      <button type="button" onClick={() => setShowStaffPassword(v => !v)} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', zIndex: 10 }}>
                        {showStaffPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Subscriptions */}
          {step === 4 && (
            <div>
              {loadingPlans ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                  <Loader2 size={32} className="spin" color="var(--purple)" />
                </div>
              ) : plans.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', background: 'rgba(255,0,0,0.1)', border: '1px solid rgba(255,0,0,0.2)', borderRadius: '12px' }}>
                  <p style={{ color: '#ff8a8a', fontSize: '14px', marginBottom: '8px' }}>No subscriptions found or backend is unreachable.</p>
                  <p style={{ color: '#ff8a8a', fontSize: '13px', opacity: 0.8 }}>If you just added plans as Super Admin, please <b>restart your NestJS backend server</b> to apply the new route updates, then refresh this page!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {/* Billing Cycle Toggle */}
                  <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '12px', width: 'fit-content', margin: '0 auto' }}>
                    {(['monthly', 'quarterly', 'annual'] as const).map(cycle => (
                      <button
                        key={cycle}
                        onClick={() => setBillingCycle(cycle)}
                        style={{
                          padding: '8px 24px',
                          borderRadius: '8px',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: billingCycle === cycle ? 600 : 400,
                          background: billingCycle === cycle ? 'var(--purple)' : 'transparent',
                          color: billingCycle === cycle ? '#fff' : 'var(--text-secondary)',
                          transition: 'all 0.2s',
                          textTransform: 'capitalize'
                        }}
                      >
                        {cycle}
                      </button>
                    ))}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                    {plans.map(plan => {
                      const displayPrice = billingCycle === 'monthly' ? plan.monthlyPrice : billingCycle === 'quarterly' ? plan.quarterlyPrice : plan.annualPrice;
                      const suffix = billingCycle === 'monthly' ? '/mo' : billingCycle === 'quarterly' ? '/quarter' : '/year';

                      return (
                        <div 
                          key={plan.id}
                          onClick={() => setSelectedPlanId(plan.id)}
                          style={{
                            padding: '24px',
                            borderRadius: '16px',
                            border: selectedPlanId === plan.id ? '2px solid var(--purple)' : '1px solid rgba(255,255,255,0.1)',
                            background: selectedPlanId === plan.id ? 'rgba(139, 92, 246, 0.1)' : 'rgba(255,255,255,0.02)',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          <h3 style={{ fontSize: '20px', color: '#fff', marginBottom: '8px', fontWeight: 600 }}>{plan.name}</h3>
                          <div style={{ fontSize: '28px', color: '#fff', fontWeight: 700, marginBottom: '16px' }}>
                            ${displayPrice}<span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 400 }}>{suffix}</span>
                          </div>
                          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                              <CheckCircle2 size={16} color="var(--purple)" /> Up to {plan.barberLimit} Barbers
                            </li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                              <CheckCircle2 size={16} color="var(--purple)" /> {plan.aiLimit} AI Consultations
                            </li>
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {error && <div className="error-box" style={{ marginTop: '16px' }}>{error}</div>}

          {/* Navigation Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
            {step > 1 && (
              <button onClick={handleBack} disabled={loading} className="btn" style={{ flex: 1, background: 'rgba(255,255,255,0.1)', height: '52px', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px' }}>
                Back
              </button>
            )}
            
            {step < 4 ? (
              <button onClick={handleNext} className="btn btn-primary" style={{ flex: 1, height: '52px', borderRadius: '8px' }}>
                Continue <ArrowRight size={16} />
              </button>
            ) : (
              <button onClick={handleCompleteRegistration} disabled={loading || !selectedPlanId} className="btn btn-primary" style={{ flex: 1, height: '52px', borderRadius: '8px' }}>
                {loading ? <Loader2 size={18} className="spin" /> : (
                  <>Complete Registration <CheckCircle2 size={16} /></>
                )}
              </button>
            )}
          </div>

          {step === 1 && (
            <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
              Already have an account?{' '}
              <Link href="/login" style={{ color: 'var(--purple-light)', textDecoration: 'none', fontWeight: 600 }}>
                Sign in
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
