import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IconDumbbell, IconClipboard, IconRobot, IconUsers,
  IconChart, IconBell, IconArrowRight, IconCheck, IconLightning
} from '../components/Icons';

const FEATURES = [
  { Icon: IconDumbbell, color: 'blue',   title: 'Exercise Library',   desc: '30+ exercises with step-by-step guides, muscle diagrams, and proper form cues for every movement.' },
  { Icon: IconClipboard,color: 'purple', title: 'Weekly Planner',     desc: 'Build your perfect workout and nutrition schedule. Drag, drop, and customise every day of the week.' },
  { Icon: IconRobot,    color: 'blue',   title: 'AI Coach',           desc: 'Powered by Claude AI. Get personalised plans, analyse progress photos, and get answers 24/7.' },
  { Icon: IconUsers,    color: 'green',  title: 'Expert Coaches',     desc: 'Browse certified trainers, read reviews, and hire the right coach for your goals — all free.' },
  { Icon: IconChart,    color: 'amber',  title: 'Progress Tracking',  desc: 'Log weight, upload photos, and visualise your transformation with beautiful progress charts.' },
  { Icon: IconBell,     color: 'purple', title: 'Smart Reminders',    desc: 'Never miss a workout or meal. Set intelligent reminders that keep you consistent every day.' },
];

const STATS = [
  { value: '30+',  label: 'Exercises' },
  { value: 'Free', label: 'Forever' },
  { value: 'AI',   label: 'Powered' },
  { value: '24/7', label: 'Available' },
];

const ICON_BG = { blue:'#eff6ff', purple:'#f5f3ff', green:'#f0fdf4', amber:'#fffbeb' };
const ICON_COLOR = { blue:'#2563eb', purple:'#7c3aed', green:'#16a34a', amber:'#d97706' };

export default function Landing() {
  const navigate = useNavigate();
  const heroRef = useRef(null);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const handleMouse = (e) => {
      const rect = hero.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 20;
      hero.style.setProperty('--mx', `${x}px`);
      hero.style.setProperty('--my', `${y}px`);
    };
    hero.addEventListener('mousemove', handleMouse);
    return () => hero.removeEventListener('mousemove', handleMouse);
  }, []);

  return (
    <div style={{ minHeight:'100vh', background:'var(--gray-0)', fontFamily:'var(--font-body)' }}>

      {/* NAV */}
      <nav style={{ position:'fixed',top:0,left:0,right:0,zIndex:100,padding:'0 5%',height:60,display:'flex',alignItems:'center',justifyContent:'space-between',background:'rgba(255,255,255,0.85)',backdropFilter:'blur(12px)',borderBottom:'1px solid var(--gray-100)' }}>
        <div style={{ fontFamily:'var(--font-display)',fontSize:'1.4rem',fontWeight:600,color:'var(--accent-primary)',letterSpacing:'-0.03em' }}>Forge</div>
        <div style={{ display:'flex',gap:'0.625rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/login')}>Sign In</button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/register')}>Get Started Free</button>
        </div>
      </nav>

      {/* HERO */}
      <section ref={heroRef} style={{ minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'8rem 5% 5rem',position:'relative',overflow:'hidden',background:'linear-gradient(160deg, #f0f7ff 0%, #ffffff 50%, #f5f3ff 100%)' }}>
        <div style={{ position:'absolute',top:'20%',left:'10%',width:400,height:400,background:'radial-gradient(circle,rgba(59,130,246,0.08) 0%,transparent 70%)',borderRadius:'50%',transform:'translate(var(--mx,0),var(--my,0))',transition:'transform 0.3s ease',pointerEvents:'none' }}/>
        <div style={{ position:'absolute',bottom:'15%',right:'8%',width:350,height:350,background:'radial-gradient(circle,rgba(124,58,237,0.06) 0%,transparent 70%)',borderRadius:'50%',transform:'translate(calc(var(--mx,0)*-1),calc(var(--my,0)*-1))',transition:'transform 0.4s ease',pointerEvents:'none' }}/>

        <div style={{ position:'relative',maxWidth:760 }}>
          <div className="animate-fade-up" style={{ display:'inline-flex',alignItems:'center',gap:'0.4rem',background:'#eff6ff',border:'1px solid #bfdbfe',color:'#1d4ed8',borderRadius:'var(--radius-full)',padding:'0.3rem 0.9rem',fontSize:'0.75rem',fontWeight:600,letterSpacing:'0.04em',marginBottom:'1.75rem' }}>
            <IconLightning size={13} color="#2563eb"/> Free Forever — No Hidden Costs
          </div>

          <h1 className="animate-fade-up stagger-1" style={{ fontFamily:'var(--font-display)',fontSize:'clamp(2.8rem,6vw,5.5rem)',fontWeight:400,lineHeight:1.05,color:'var(--gray-900)',letterSpacing:'-0.025em',marginBottom:'1.5rem' }}>
            Your body is<br/>
            <em style={{ color:'var(--accent-primary)',fontStyle:'italic' }}>the forge.</em><br/>
            We give you fire.
          </h1>

          <p className="animate-fade-up stagger-2" style={{ fontSize:'1.1rem',color:'var(--gray-500)',maxWidth:540,margin:'0 auto 2.5rem',lineHeight:1.75,fontWeight:400 }}>
            A premium fitness platform for athletes and gym-goers who demand more. AI coaching, expert trainers, and science-backed plans — all free.
          </p>

          <div className="animate-fade-up stagger-3" style={{ display:'flex',gap:'0.875rem',justifyContent:'center',flexWrap:'wrap' }}>
            <button className="btn btn-primary btn-xl" onClick={() => navigate('/register')} style={{ display:'flex',alignItems:'center',gap:'0.5rem' }}>
              Start Your Journey <IconArrowRight size={16} />
            </button>
            <button className="btn btn-secondary btn-xl" onClick={() => navigate('/login')}>
              Sign In
            </button>
          </div>

          <div className="animate-fade-up stagger-4" style={{ display:'flex',gap:'1.5rem',justifyContent:'center',marginTop:'2.5rem',flexWrap:'wrap' }}>
            {['No credit card needed','Cancel anytime','Free forever'].map(t => (
              <div key={t} style={{ display:'flex',alignItems:'center',gap:'0.35rem',fontSize:'0.8rem',color:'var(--gray-500)' }}>
                <IconCheck size={14} color="#16a34a"/> {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ padding:'2.5rem 5%',background:'var(--gray-900)',borderTop:'1px solid var(--gray-800)' }}>
        <div style={{ maxWidth:800,margin:'0 auto',display:'flex',justifyContent:'center',gap:'4rem',flexWrap:'wrap' }}>
          {STATS.map(s => (
            <div key={s.label} style={{ textAlign:'center' }}>
              <div style={{ fontFamily:'var(--font-display)',fontSize:'2.5rem',fontWeight:500,color:'white',lineHeight:1 }}>{s.value}</div>
              <div style={{ fontSize:'0.72rem',fontWeight:600,letterSpacing:'0.15em',textTransform:'uppercase',color:'var(--gray-400)',marginTop:'0.35rem' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding:'6rem 5%',background:'var(--gray-50)' }}>
        <div style={{ maxWidth:1100,margin:'0 auto' }}>
          <div style={{ textAlign:'center',marginBottom:'4rem' }}>
            <div style={{ display:'inline-block',background:'#eff6ff',border:'1px solid #bfdbfe',color:'#1d4ed8',borderRadius:'var(--radius-full)',padding:'0.3rem 0.9rem',fontSize:'0.72rem',fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:'1rem' }}>
              Everything You Need
            </div>
            <h2 style={{ fontFamily:'var(--font-display)',fontSize:'clamp(2rem,4vw,3rem)',color:'var(--gray-900)',marginBottom:'0.75rem' }}>
              Built for serious athletes.<br/>
              <em style={{ fontStyle:'italic',color:'var(--gray-500)' }}>Accessible to everyone.</em>
            </h2>
          </div>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:'1.25rem' }}>
            {FEATURES.map((f,i) => (
              <div key={f.title} className="card animate-fade-up" style={{ animationDelay:`${i*0.06}s` }}>
                <div style={{ width:44,height:44,borderRadius:'var(--radius-lg)',background:ICON_BG[f.color],display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'1.1rem' }}>
                  <f.Icon size={22} color={ICON_COLOR[f.color]}/>
                </div>
                <h3 style={{ fontFamily:'var(--font-display)',fontSize:'1.25rem',marginBottom:'0.5rem',color:'var(--gray-900)' }}>{f.title}</h3>
                <p style={{ fontSize:'0.87rem',lineHeight:1.7,color:'var(--gray-500)' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding:'6rem 5%',textAlign:'center',background:'var(--accent-primary)' }}>
        <div style={{ maxWidth:560,margin:'0 auto' }}>
          <h2 style={{ fontFamily:'var(--font-display)',fontSize:'clamp(2rem,4vw,3rem)',color:'white',marginBottom:'1rem' }}>Ready to be forged?</h2>
          <p style={{ fontSize:'1rem',color:'rgba(255,255,255,0.75)',marginBottom:'2rem',lineHeight:1.7 }}>Join thousands of athletes transforming their bodies with Forge Fitness. Free, always.</p>
          <button className="btn btn-xl" onClick={() => navigate('/register')}
            style={{ background:'white',color:'var(--accent-primary)',fontWeight:600,minWidth:240 }}>
            Create Free Account
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding:'1.75rem 5%',borderTop:'1px solid var(--gray-100)',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'1rem',background:'var(--gray-0)' }}>
        <span style={{ fontFamily:'var(--font-display)',fontSize:'1.2rem',color:'var(--accent-primary)',fontWeight:600 }}>Forge</span>
        <span style={{ fontSize:'0.78rem',color:'var(--gray-400)' }}>© 2024 Forge Fitness. Free forever.</span>
      </footer>
    </div>
  );
}
