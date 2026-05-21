import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IconArrowRight, IconCheck, IconDumbbell, IconClipboard, IconNutrition, IconRobot } from '../components/Icons';
import toast from 'react-hot-toast';

const AuthShell = ({ children, title, subtitle }) => (
  <div style={{ minHeight:'100vh',display:'flex',background:'var(--gray-50)' }}>
    <div style={{ display:'none',flex:1,background:'var(--accent-primary)',padding:'3rem',flexDirection:'column',justifyContent:'space-between' }} className="auth-left">
      <div style={{ fontFamily:'var(--font-display)',fontSize:'1.8rem',fontWeight:600,color:'white',letterSpacing:'-0.03em' }}>Forge</div>
      <div>
        <h2 style={{ fontFamily:'var(--font-display)',fontSize:'2.5rem',color:'white',fontWeight:400,marginBottom:'1.5rem',lineHeight:1.15 }}>
          Your body is<br/><em>the forge.</em><br/>We give you fire.
        </h2>
        <div style={{ display:'flex',flexDirection:'column',gap:'0.875rem' }}>
          {[
            { Icon: IconDumbbell,  text: '30+ exercises with step-by-step guides' },
            { Icon: IconClipboard, text: 'Weekly workout and nutrition planner' },
            { Icon: IconRobot,     text: 'AI coach available 24/7' },
            { Icon: IconNutrition, text: 'Track meals, macros and progress' },
          ].map((f,i) => (
            <div key={i} style={{ display:'flex',alignItems:'center',gap:'0.75rem' }}>
              <div style={{ width:32,height:32,borderRadius:'var(--radius-md)',background:'rgba(255,255,255,0.15)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                <f.Icon size={16} color="white"/>
              </div>
              <span style={{ fontSize:'0.87rem',color:'rgba(255,255,255,0.85)' }}>{f.text}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ fontSize:'0.75rem',color:'rgba(255,255,255,0.5)' }}>Free forever. No credit card needed.</div>
    </div>

    <div style={{ flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:'2rem 1.5rem' }}>
      <div style={{ width:'100%',maxWidth:420 }}>
        <div style={{ marginBottom:'2rem' }}>
          <div style={{ fontFamily:'var(--font-display)',fontSize:'1.5rem',fontWeight:600,color:'var(--accent-primary)',marginBottom:'1.5rem' }}>Forge</div>
          <h1 style={{ fontFamily:'var(--font-display)',fontSize:'1.75rem',fontWeight:400,color:'var(--gray-900)',marginBottom:'0.35rem' }}>{title}</h1>
          <p style={{ fontSize:'0.85rem',color:'var(--gray-500)' }}>{subtitle}</p>
        </div>
        <div style={{ background:'var(--gray-0)',border:'1.5px solid var(--gray-200)',borderRadius:'var(--radius-xl)',padding:'2rem',boxShadow:'var(--shadow-sm)' }}>
          {children}
        </div>
      </div>
    </div>
    <style>{`@media(min-width:900px){.auth-left{display:flex !important;}}`}</style>
  </div>
);

export function Login() {
  const [form, setForm] = useState({ email:'', password:'' });
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
          <input type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({...form,email:e.target.value})} autoComplete="email"/>
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input type="password" placeholder="Your password" value={form.password} onChange={e => setForm({...form,password:e.target.value})} autoComplete="current-password"/>
        </div>
        <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading} style={{ marginTop:'0.5rem',justifyContent:'center' }}>
          {loading ? 'Signing in...' : <span style={{display:'flex',alignItems:'center',gap:'0.5rem',justifyContent:'center'}}>Sign In <IconArrowRight size={16}/></span>}
        </button>
      </form>
      <p style={{ textAlign:'center',marginTop:'1.5rem',fontSize:'0.83rem',color:'var(--gray-500)' }}>
        New to Forge? <Link to="/register" style={{ color:'var(--accent-primary)',fontWeight:500 }}>Create account</Link>
      </p>
    </AuthShell>
  );
}

export function Register() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name:'', email:'', password:'', role:'user',
    stats:{ age:'',height:'',weight:'',gender:'male',fitnessLevel:'beginner',goal:'gain_muscle' },
    coachProfile:{ bio:'' }
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false); // pending approval state
  const { register } = useAuth();

  const updateStats = (field, value) => setForm(f => ({ ...f, stats:{...f.stats,[field]:value} }));

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password) return toast.error('Fill all required fields.');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters.');
    setLoading(true);
    try {
      const result = await register(form);
      // If the server returns pending:true, show the waiting screen instead of navigating
      if (result && result.pending) {
        setSubmitted(true);
      }
      // Admin accounts get auto-approved and token returned — handled in AuthContext
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed.');
    } finally { setLoading(false); }
  };

  const GOALS = [
    { value:'lose_weight', label:'Lose Weight' },
    { value:'gain_muscle', label:'Build Muscle' },
    { value:'maintain',    label:'Maintain' },
    { value:'endurance',   label:'Endurance' },
    { value:'flexibility', label:'Flexibility' },
  ];

  // ── Pending approval screen ──────────────────────────────────────────────
  if (submitted) {
    return (
      <AuthShell title="You're on the list!" subtitle="One step away from joining Forge">
        <div style={{ textAlign:'center',padding:'1rem 0' }}>
          <div style={{ width:72,height:72,borderRadius:'50%',background:'#fef3c7',border:'2px solid #fde68a',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 1.5rem',fontSize:'2rem' }}>
            ⏳
          </div>
          <h2 style={{ fontFamily:'var(--font-display)',fontSize:'1.5rem',marginBottom:'0.75rem',color:'var(--gray-900)' }}>
            Registration Submitted!
          </h2>
          <p style={{ fontSize:'0.87rem',color:'var(--gray-600)',lineHeight:1.7,marginBottom:'1.25rem' }}>
            Your <strong>{form.role === 'coach' ? 'coach' : 'athlete'}</strong> account is now <strong>pending admin approval</strong>.
            Our team will review your profile and activate your account shortly.
          </p>
          <div style={{ background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:'var(--radius-lg)',padding:'1rem',marginBottom:'1.5rem',textAlign:'left' }}>
            <div style={{ fontSize:'0.78rem',color:'#15803d',fontWeight:600,marginBottom:'0.5rem' }}>What happens next?</div>
            {['Admin reviews your registration','You receive access to log in','Start your fitness journey!'].map((s,i) => (
              <div key={i} style={{ display:'flex',alignItems:'center',gap:'0.5rem',fontSize:'0.78rem',color:'#166534',marginBottom:'0.3rem' }}>
                <div style={{ width:18,height:18,borderRadius:'50%',background:'#bbf7d0',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.65rem',fontWeight:700,flexShrink:0 }}>{i+1}</div>
                {s}
              </div>
            ))}
          </div>
          <Link to="/login" className="btn btn-primary w-full" style={{ justifyContent:'center',display:'flex' }}>
            Back to Login
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title={step===1?'Create account':step===2?'Your profile':'Your goals'} subtitle={`Step ${step} of 3`}>
      <div style={{ display:'flex',gap:'0.375rem',marginBottom:'1.5rem' }}>
        {[1,2,3].map(s => (
          <div key={s} style={{ flex:1,height:3,borderRadius:2,background:s<=step?'var(--accent-primary)':'var(--gray-200)',transition:'background 0.3s' }}/>
        ))}
      </div>

      {step===1 && <>
        <div className="form-group">
          <label className="form-label">Full Name *</label>
          <input placeholder="John Smith" value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))}/>
        </div>
        <div className="form-group">
          <label className="form-label">Email *</label>
          <input type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm(f=>({...f,email:e.target.value}))}/>
        </div>
        <div className="form-group">
          <label className="form-label">Password *</label>
          <input type="password" placeholder="Minimum 6 characters" value={form.password} onChange={e => setForm(f=>({...f,password:e.target.value}))}/>
        </div>
        <div className="form-group">
          <label className="form-label">I am a</label>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.625rem' }}>
            {[{value:'user',label:'Athlete',desc:'Train and track progress'},{value:'coach',label:'Coach',desc:'Guide and train clients'}].map(r => (
              <div key={r.value} onClick={() => setForm(f=>({...f,role:r.value}))}
                style={{ padding:'0.875rem',borderRadius:'var(--radius-lg)',cursor:'pointer',border:`2px solid ${form.role===r.value?'var(--accent-primary)':'var(--gray-200)'}`,background:form.role===r.value?'var(--brand-50)':'var(--gray-0)',transition:'all 0.15s' }}>
                <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'0.2rem' }}>
                  <span style={{ fontSize:'0.87rem',fontWeight:600,color:'var(--gray-900)' }}>{r.label}</span>
                  {form.role===r.value && <IconCheck size={14} color="var(--accent-primary)"/>}
                </div>
                <div style={{ fontSize:'0.73rem',color:'var(--gray-500)' }}>{r.desc}</div>
              </div>
            ))}
          </div>
        </div>
        {/* Approval notice */}
        <div style={{ background:'#fefce8',border:'1px solid #fde68a',borderRadius:'var(--radius-md)',padding:'0.75rem',marginBottom:'1rem',fontSize:'0.75rem',color:'#713f12',display:'flex',gap:'0.5rem',alignItems:'flex-start' }}>
          <span>⚠️</span>
          <span>Registrations require <strong>admin approval</strong> before you can log in. You'll be notified once your account is activated.</span>
        </div>
        <button className="btn btn-primary w-full btn-lg" onClick={() => { if(!form.name||!form.email||!form.password) return toast.error('Fill all fields'); setStep(2); }} style={{justifyContent:'center'}}>
          Continue
        </button>
        <p style={{ textAlign:'center',marginTop:'1.25rem',fontSize:'0.83rem',color:'var(--gray-500)' }}>
          Already have an account? <Link to="/login" style={{ color:'var(--accent-primary)',fontWeight:500 }}>Sign in</Link>
        </p>
      </>}

      {step===2 && <>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Age</label><input type="number" placeholder="25" value={form.stats.age} onChange={e=>updateStats('age',e.target.value)}/></div>
          <div className="form-group"><label className="form-label">Gender</label>
            <select value={form.stats.gender} onChange={e=>updateStats('gender',e.target.value)}>
              <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Height (cm)</label><input type="number" placeholder="175" value={form.stats.height} onChange={e=>updateStats('height',e.target.value)}/></div>
          <div className="form-group"><label className="form-label">Weight (kg)</label><input type="number" placeholder="75" value={form.stats.weight} onChange={e=>updateStats('weight',e.target.value)}/></div>
        </div>
        <div className="form-group">
          <label className="form-label">Fitness Level</label>
          <select value={form.stats.fitnessLevel} onChange={e=>updateStats('fitnessLevel',e.target.value)}>
            <option value="beginner">Beginner (0–1 year)</option>
            <option value="intermediate">Intermediate (1–3 years)</option>
            <option value="advanced">Advanced (3+ years)</option>
          </select>
        </div>
        <div style={{ display:'flex',gap:'0.625rem',marginTop:'0.5rem' }}>
          <button className="btn btn-secondary flex-1" onClick={()=>setStep(1)} style={{justifyContent:'center'}}>Back</button>
          <button className="btn btn-primary flex-1" onClick={()=>setStep(3)} style={{justifyContent:'center'}}>Continue</button>
        </div>
      </>}

      {step===3 && <>
        <div className="form-group">
          <label className="form-label">Primary Goal</label>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.5rem' }}>
            {GOALS.map(g => (
              <div key={g.value} onClick={()=>updateStats('goal',g.value)}
                style={{ padding:'0.7rem 0.875rem',borderRadius:'var(--radius-md)',cursor:'pointer',border:`1.5px solid ${form.stats.goal===g.value?'var(--accent-primary)':'var(--gray-200)'}`,background:form.stats.goal===g.value?'var(--brand-50)':'var(--gray-0)',fontSize:'0.83rem',fontWeight:500,color:form.stats.goal===g.value?'var(--accent-primary)':'var(--gray-700)',transition:'all 0.15s',display:'flex',alignItems:'center',justifyContent:'space-between' }}>
                {g.label}
                {form.stats.goal===g.value && <IconCheck size={13} color="var(--accent-primary)"/>}
              </div>
            ))}
          </div>
        </div>
        {form.role==='coach' && (
          <div className="form-group">
            <label className="form-label">Your Bio (optional)</label>
            <textarea rows={3} placeholder="Tell athletes about your coaching style..." value={form.coachProfile.bio} onChange={e=>setForm(f=>({...f,coachProfile:{...f.coachProfile,bio:e.target.value}}))} style={{resize:'vertical'}}/>
          </div>
        )}
        <div style={{ display:'flex',gap:'0.625rem',marginTop:'0.5rem' }}>
          <button className="btn btn-secondary flex-1" onClick={()=>setStep(2)} style={{justifyContent:'center'}}>Back</button>
          <button className="btn btn-primary flex-1" onClick={handleSubmit} disabled={loading} style={{justifyContent:'center'}}>
            {loading ? 'Submitting...' : 'Submit Registration'}
          </button>
        </div>
      </>}
    </AuthShell>
  );
}

export default Login;
