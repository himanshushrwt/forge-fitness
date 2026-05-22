import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IconArrowRight, IconCheck, IconDumbbell, IconClipboard, IconNutrition, IconRobot } from '../components/Icons';
import toast from 'react-hot-toast';

// Eye icons for password show/hide
const EyeOpen = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const EyeClosed = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;

function PasswordInput({ value, onChange, placeholder = 'Minimum 6 characters', autoComplete = 'new-password' }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <input
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        style={{ paddingRight: '2.5rem' }}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        style={{
          position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--gray-400)', display: 'flex', alignItems: 'center', padding: 0
        }}
      >
        {show ? <EyeClosed /> : <EyeOpen />}
      </button>
    </div>
  );
}

const AuthShell = ({ children, title, subtitle }) => (
  <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--gray-50)' }}>
    <div style={{ display: 'none', flex: 1, background: 'var(--accent-primary)', padding: '3rem', flexDirection: 'column', justifyContent: 'space-between' }} className="auth-left">
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 600, color: 'white', letterSpacing: '-0.03em' }}>Forge</div>
      <div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: 'white', fontWeight: 400, marginBottom: '1.5rem', lineHeight: 1.15 }}>
          Your body is<br /><em>the forge.</em><br />We give you fire.
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {[
            { Icon: IconDumbbell, text: '30+ exercises with step-by-step guides' },
            { Icon: IconClipboard, text: 'Weekly workout and nutrition planner' },
            { Icon: IconRobot, text: 'AI coach available 24/7' },
            { Icon: IconNutrition, text: 'Track meals, macros and progress' },
          ].map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <f.Icon size={16} color="white" />
              </div>
              <span style={{ fontSize: '0.87rem', color: 'rgba(255,255,255,0.85)' }}>{f.text}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>Free forever. No credit card needed.</div>
    </div>
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 600, color: 'var(--accent-primary)', marginBottom: '1.5rem' }}>Forge</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 400, color: 'var(--gray-900)', marginBottom: '0.35rem' }}>{title}</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>{subtitle}</p>
        </div>
        <div style={{ background: 'var(--gray-0)', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-xl)', padding: '2rem', boxShadow: 'var(--shadow-sm)' }}>
          {children}
        </div>
      </div>
    </div>
    <style>{`@media(min-width:900px){.auth-left{display:flex !important;}}`}</style>
  </div>
);

export function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Fill in all fields.');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid email or password.');
    } finally { setLoading(false); }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to your Forge account">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Email address</label>
          <input type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} autoComplete="email" />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <PasswordInput value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Your password" autoComplete="current-password" />
        </div>
        <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading} style={{ marginTop: '0.5rem', justifyContent: 'center' }}>
          {loading ? 'Signing in...' : <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>Sign In <IconArrowRight size={16} /></span>}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.83rem', color: 'var(--gray-500)' }}>
        New to Forge? <Link to="/register" style={{ color: 'var(--accent-primary)', fontWeight: 500 }}>Create account</Link>
      </p>
    </AuthShell>
  );
}

export function Register() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'user',
    stats: { age: '', height: '', weight: '', gender: 'male', fitnessLevel: 'beginner', goal: 'gain_muscle' },
    coachProfile: {
      bio: '', specializations: [], experience: '', certifications: '',
      availability: [], timeSlots: []
    }
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const updateStats = (field, value) => setForm(f => ({ ...f, stats: { ...f.stats, [field]: value } }));
  const updateCoach = (field, value) => setForm(f => ({ ...f, coachProfile: { ...f.coachProfile, [field]: value } }));

  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const TIME_SLOTS = ['06:00 AM', '07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM'];
  const SPECIALIZATIONS = ['Strength Training', 'Cardio', 'Yoga', 'Nutrition', 'HIIT', 'Powerlifting', 'Bodybuilding', 'Weight Loss', 'Flexibility', 'Sports Performance', 'Boxing', 'Running'];

  const toggleDay = (day) => {
    const curr = form.coachProfile.availability || [];
    updateCoach('availability', curr.includes(day) ? curr.filter(d => d !== day) : [...curr, day]);
  };
  const toggleSlot = (slot) => {
    const curr = form.coachProfile.timeSlots || [];
    updateCoach('timeSlots', curr.includes(slot) ? curr.filter(s => s !== slot) : [...curr, slot]);
  };
  const toggleSpec = (spec) => {
    const curr = form.coachProfile.specializations || [];
    updateCoach('specializations', curr.includes(spec) ? curr.filter(s => s !== spec) : [...curr, spec]);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password) return toast.error('Fill all required fields.');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters.');
    setLoading(true);
    try {
      const user = await register(form);
      toast.success(`Welcome to Forge, ${user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed.');
    } finally { setLoading(false); }
  };

  const totalSteps = form.role === 'coach' ? 4 : 3;

  const GOALS = [
    { value: 'lose_weight', label: 'Lose Weight' },
    { value: 'gain_muscle', label: 'Build Muscle' },
    { value: 'maintain', label: 'Maintain' },
    { value: 'endurance', label: 'Endurance' },
    { value: 'flexibility', label: 'Flexibility' },
  ];

  return (
    <AuthShell title={step === 1 ? 'Create account' : step === 2 ? 'Your profile' : step === 3 ? 'Your goals' : 'Coach setup'} subtitle={`Step ${step} of ${totalSteps}`}>
      <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '1.5rem' }}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i < step ? 'var(--accent-primary)' : 'var(--gray-200)', transition: 'background 0.3s' }} />
        ))}
      </div>

      {step === 1 && <>
        <div className="form-group">
          <label className="form-label">Full Name *</label>
          <input placeholder="John Smith" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        </div>
        <div className="form-group">
          <label className="form-label">Email *</label>
          <input type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
        </div>
        <div className="form-group">
          <label className="form-label">Password *</label>
          <PasswordInput value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
        </div>
        <div className="form-group">
          <label className="form-label">I am a</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
            {[{ value: 'user', label: 'Athlete', desc: 'Train and track progress' }, { value: 'coach', label: 'Coach', desc: 'Guide and train clients' }].map(r => (
              <div key={r.value} onClick={() => setForm(f => ({ ...f, role: r.value }))}
                style={{ padding: '0.875rem', borderRadius: 'var(--radius-lg)', cursor: 'pointer', border: `2px solid ${form.role === r.value ? 'var(--accent-primary)' : 'var(--gray-200)'}`, background: form.role === r.value ? 'var(--brand-50)' : 'var(--gray-0)', transition: 'all 0.15s' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                  <span style={{ fontSize: '0.87rem', fontWeight: 600, color: 'var(--gray-900)' }}>{r.label}</span>
                  {form.role === r.value && <IconCheck size={14} color="var(--accent-primary)" />}
                </div>
                <div style={{ fontSize: '0.73rem', color: 'var(--gray-500)' }}>{r.desc}</div>
              </div>
            ))}
          </div>
        </div>
        <button className="btn btn-primary w-full btn-lg" onClick={() => { if (!form.name || !form.email || !form.password) return toast.error('Fill all fields'); setStep(2); }} style={{ justifyContent: 'center' }}>Continue</button>
        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.83rem', color: 'var(--gray-500)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent-primary)', fontWeight: 500 }}>Sign in</Link>
        </p>
      </>}

      {step === 2 && <>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Age</label><input type="number" placeholder="25" value={form.stats.age} onChange={e => updateStats('age', e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Gender</label>
            <select value={form.stats.gender} onChange={e => updateStats('gender', e.target.value)}>
              <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Height (cm)</label><input type="number" placeholder="175" value={form.stats.height} onChange={e => updateStats('height', e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Weight (kg)</label><input type="number" placeholder="75" value={form.stats.weight} onChange={e => updateStats('weight', e.target.value)} /></div>
        </div>
        <div className="form-group">
          <label className="form-label">Fitness Level</label>
          <select value={form.stats.fitnessLevel} onChange={e => updateStats('fitnessLevel', e.target.value)}>
            <option value="beginner">Beginner (0–1 year)</option>
            <option value="intermediate">Intermediate (1–3 years)</option>
            <option value="advanced">Advanced (3+ years)</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: '0.625rem', marginTop: '0.5rem' }}>
          <button className="btn btn-secondary flex-1" onClick={() => setStep(1)} style={{ justifyContent: 'center' }}>Back</button>
          <button className="btn btn-primary flex-1" onClick={() => setStep(3)} style={{ justifyContent: 'center' }}>Continue</button>
        </div>
      </>}

      {step === 3 && <>
        <div className="form-group">
          <label className="form-label">Primary Goal</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            {GOALS.map(g => (
              <div key={g.value} onClick={() => updateStats('goal', g.value)}
                style={{ padding: '0.7rem 0.875rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', border: `1.5px solid ${form.stats.goal === g.value ? 'var(--accent-primary)' : 'var(--gray-200)'}`, background: form.stats.goal === g.value ? 'var(--brand-50)' : 'var(--gray-0)', fontSize: '0.83rem', fontWeight: 500, color: form.stats.goal === g.value ? 'var(--accent-primary)' : 'var(--gray-700)', transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {g.label}
                {form.stats.goal === g.value && <IconCheck size={13} color="var(--accent-primary)" />}
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.625rem', marginTop: '0.5rem' }}>
          <button className="btn btn-secondary flex-1" onClick={() => setStep(2)} style={{ justifyContent: 'center' }}>Back</button>
          {form.role === 'coach' ? (
            <button className="btn btn-primary flex-1" onClick={() => setStep(4)} style={{ justifyContent: 'center' }}>Continue</button>
          ) : (
            <button className="btn btn-primary flex-1" onClick={handleSubmit} disabled={loading} style={{ justifyContent: 'center' }}>
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          )}
        </div>
      </>}

      {step === 4 && form.role === 'coach' && <>
        <div className="form-group">
          <label className="form-label">Bio</label>
          <textarea rows={3} placeholder="Tell athletes about your coaching experience..." value={form.coachProfile.bio} onChange={e => updateCoach('bio', e.target.value)} style={{ resize: 'vertical' }} />
        </div>
        <div className="form-group">
          <label className="form-label">Years of Experience</label>
          <input type="number" placeholder="e.g. 5" value={form.coachProfile.experience} onChange={e => updateCoach('experience', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Certifications (optional)</label>
          <input placeholder="e.g. NASM-CPT, ACE, RYT-500" value={form.coachProfile.certifications} onChange={e => updateCoach('certifications', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Specializations</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
            {SPECIALIZATIONS.map(s => {
              const sel = (form.coachProfile.specializations || []).includes(s);
              return (
                <button key={s} onClick={() => toggleSpec(s)} style={{ padding: '0.3rem 0.7rem', borderRadius: 'var(--radius-full)', border: `1.5px solid ${sel ? 'var(--accent-primary)' : 'var(--gray-200)'}`, background: sel ? 'var(--brand-50)' : 'transparent', color: sel ? 'var(--accent-primary)' : 'var(--gray-600)', fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s' }}>
                  {s}
                </button>
              );
            })}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Available Days</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
            {DAYS.map(day => {
              const sel = (form.coachProfile.availability || []).includes(day);
              return (
                <button key={day} onClick={() => toggleDay(day)} style={{ padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-full)', border: `1.5px solid ${sel ? 'var(--accent-primary)' : 'var(--gray-200)'}`, background: sel ? 'var(--accent-primary)' : 'transparent', color: sel ? 'white' : 'var(--gray-600)', fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s' }}>
                  {day.slice(0, 3)}
                </button>
              );
            })}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Available Time Slots</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.375rem' }}>
            {TIME_SLOTS.map(slot => {
              const sel = (form.coachProfile.timeSlots || []).includes(slot);
              return (
                <button key={slot} onClick={() => toggleSlot(slot)} style={{ padding: '0.4rem 0.5rem', borderRadius: 'var(--radius-md)', border: `1.5px solid ${sel ? 'var(--accent-primary)' : 'var(--gray-200)'}`, background: sel ? 'var(--brand-50)' : 'transparent', color: sel ? 'var(--accent-primary)' : 'var(--gray-600)', fontSize: '0.72rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s' }}>
                  {slot}
                </button>
              );
            })}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.625rem' }}>
          <button className="btn btn-secondary flex-1" onClick={() => setStep(3)} style={{ justifyContent: 'center' }}>Back</button>
          <button className="btn btn-primary flex-1" onClick={handleSubmit} disabled={loading} style={{ justifyContent: 'center' }}>
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </div>
      </>}
    </AuthShell>
  );
}

export default Login;
