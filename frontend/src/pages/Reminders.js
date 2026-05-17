import React, { useState, useEffect } from 'react';
import { reminders as remindersAPI } from '../utils/api';
import { IconBell, IconTrash, IconPlus, IconCheck, IconDumbbell, IconNutrition, IconDroplet, IconMoon, IconActivity } from '../components/Icons';
import toast from 'react-hot-toast';

const REMINDER_TYPES = [
  { value:'workout', label:'Workout',  Icon:IconDumbbell,  color:'blue' },
  { value:'meal',    label:'Meal',     Icon:IconNutrition, color:'green' },
  { value:'water',   label:'Water',    Icon:IconDroplet,   color:'blue' },
  { value:'sleep',   label:'Sleep',    Icon:IconMoon,      color:'purple' },
  { value:'custom',  label:'Custom',   Icon:IconBell,      color:'gray' },
];
const ALL_DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

const ICON_BG    = {blue:'#eff6ff',green:'#f0fdf4',purple:'#f5f3ff',amber:'#fffbeb',gray:'var(--gray-100)'};
const ICON_COLOR = {blue:'#2563eb',green:'#16a34a',purple:'#7c3aed',amber:'#d97706',gray:'var(--gray-600)'};

const PRESETS = [
  { type:'workout', time:'07:00', days:['Monday','Wednesday','Friday'], message:"Time to train! Your muscles won't build themselves.", Icon:IconDumbbell, color:'blue' },
  { type:'water',   time:'09:00', days:ALL_DAYS, message:'Hydration check — drink a glass of water!', Icon:IconDroplet, color:'blue' },
  { type:'meal',    time:'13:00', days:ALL_DAYS, message:'Lunch time! Fuel your body right.', Icon:IconNutrition, color:'green' },
  { type:'water',   time:'15:00', days:ALL_DAYS, message:'Mid-afternoon water break!', Icon:IconDroplet, color:'blue' },
  { type:'meal',    time:'20:00', days:ALL_DAYS, message:'Post-workout meal or dinner time!', Icon:IconNutrition, color:'green' },
  { type:'sleep',   time:'22:30', days:ALL_DAYS, message:'Wind down — 8 hours of sleep builds muscle!', Icon:IconMoon, color:'purple' },
];

export default function Reminders() {
  const [myReminders, setMyReminders] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({type:'workout',time:'07:00',days:['Monday','Wednesday','Friday'],message:''});
  const [loading, setLoading] = useState(true);

  useEffect(()=>{ remindersAPI.getAll().then(r=>setMyReminders(r.data.reminders||[])).catch(()=>{}).finally(()=>setLoading(false)); },[]);

  const toggleDay = (day) => setForm(f=>({ ...f, days:f.days.includes(day)?f.days.filter(d=>d!==day):[...f.days,day] }));

  const saveReminder = async () => {
    if (!form.time||form.days.length===0) return toast.error('Select time and at least one day');
    try {
      const t = REMINDER_TYPES.find(r=>r.value===form.type);
      const msg = form.message||`${t.label} reminder`;
      const res = await remindersAPI.create({...form,message:msg});
      setMyReminders(r=>[res.data.reminder,...r]);
      setShowForm(false);
      setForm({type:'workout',time:'07:00',days:['Monday','Wednesday','Friday'],message:''});
      toast.success('Reminder set!');
    } catch { toast.error('Could not save reminder.'); }
  };

  const deleteReminder = async (id) => {
    try {
      await remindersAPI.delete(id);
      setMyReminders(r=>r.filter(rem=>(rem._id||rem.id)!==id));
      toast.success('Reminder removed.');
    } catch { toast.error('Could not delete.'); }
  };

  const addPreset = async (preset) => {
    try {
      const res = await remindersAPI.create(preset);
      setMyReminders(r=>[res.data.reminder,...r]);
    } catch {
      setMyReminders(r=>[{id:Date.now().toString(),...preset},...r]);
    }
    toast.success('Reminder added!');
  };

  const TYPE_MAP = Object.fromEntries(REMINDER_TYPES.map(r=>[r.value,r]));

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reminders</h1>
          <p className="page-subtitle">Never miss a workout, meal, or hydration window</p>
        </div>
        <button className="btn btn-primary" onClick={()=>setShowForm(!showForm)} style={{display:'flex',alignItems:'center',gap:'0.4rem'}}>
          <IconPlus size={15}/> New Reminder
        </button>
      </div>

      {/* Info */}
      <div className="alert alert-info" style={{marginBottom:'1.5rem'}}>
        <IconActivity size={16} style={{flexShrink:0,marginTop:1}}/>
        <span><strong>How reminders work:</strong> Reminders are saved to your profile. Keep the app open for in-browser alerts. Email reminders require backend email configuration in <code>.env</code>.</span>
      </div>

      {/* New reminder form */}
      {showForm && (
        <div className="card" style={{marginBottom:'1.5rem',border:'1.5px solid var(--brand-300)',background:'var(--brand-50)'}}>
          <h3 style={{fontFamily:'var(--font-display)',fontSize:'1.2rem',marginBottom:'1.25rem'}}>New Reminder</h3>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Type</label>
              <select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>
                {REMINDER_TYPES.map(t=><option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Time</label>
              <input type="time" value={form.time} onChange={e=>setForm(f=>({...f,time:e.target.value}))}/>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Days</label>
            <div style={{display:'flex',gap:'0.375rem',flexWrap:'wrap'}}>
              {ALL_DAYS.map(day=>(
                <button key={day} onClick={()=>toggleDay(day)}
                  style={{padding:'0.35rem 0.7rem',borderRadius:'var(--radius-full)',border:`1.5px solid ${form.days.includes(day)?'var(--accent-primary)':'var(--gray-200)'}`,background:form.days.includes(day)?'var(--accent-primary)':'var(--gray-0)',color:form.days.includes(day)?'white':'var(--gray-500)',fontSize:'0.75rem',fontWeight:500,cursor:'pointer',transition:'all 0.15s'}}>
                  {day.slice(0,3)}
                </button>
              ))}
              <button onClick={()=>setForm(f=>({...f,days:ALL_DAYS}))}
                style={{padding:'0.35rem 0.7rem',borderRadius:'var(--radius-full)',border:'1.5px solid var(--gray-200)',background:'var(--gray-0)',color:'var(--gray-500)',fontSize:'0.75rem',cursor:'pointer'}}>
                All
              </button>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Custom Message (optional)</label>
            <input placeholder="Your reminder message..." value={form.message} onChange={e=>setForm(f=>({...f,message:e.target.value}))}/>
          </div>
          <div style={{display:'flex',gap:'0.75rem'}}>
            <button className="btn btn-secondary flex-1" onClick={()=>setShowForm(false)} style={{justifyContent:'center'}}>Cancel</button>
            <button className="btn btn-primary flex-1" onClick={saveReminder} style={{justifyContent:'center',display:'flex',alignItems:'center',gap:'0.4rem'}}>
              <IconBell size={14}/> Save Reminder
            </button>
          </div>
        </div>
      )}

      {/* My Reminders */}
      <div className="card" style={{marginBottom:'1.5rem'}}>
        <h3 style={{fontFamily:'var(--font-display)',fontSize:'1.25rem',marginBottom:'1rem'}}>
          My Reminders <span style={{fontSize:'0.85rem',fontFamily:'var(--font-body)',color:'var(--gray-400)',fontWeight:400}}>({myReminders.length})</span>
        </h3>
        {loading ? (
          <div style={{display:'flex',justifyContent:'center',padding:'2rem'}}><div className="spinner"/></div>
        ) : myReminders.length===0 ? (
          <div className="empty-state" style={{padding:'2.5rem'}}>
            <div className="empty-state-icon"><IconBell size={24} color="var(--gray-400)"/></div>
            <h3>No reminders yet</h3>
            <p>Add one above or use a preset below.</p>
          </div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:'0.625rem'}}>
            {myReminders.map((rem,i)=>{
              const t=TYPE_MAP[rem.type]||{Icon:IconBell,color:'gray',label:rem.type};
              const {Icon}=t;
              return (
                <div key={rem._id||rem.id||i} style={{display:'flex',alignItems:'center',gap:'1rem',padding:'0.875rem 1rem',borderRadius:'var(--radius-lg)',background:'var(--gray-50)',border:'1.5px solid var(--gray-200)'}}>
                  <div style={{width:36,height:36,borderRadius:'var(--radius-md)',background:ICON_BG[t.color],display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <Icon size={17} color={ICON_COLOR[t.color]}/>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:600,fontSize:'0.87rem',color:'var(--gray-900)'}}>{t.label} — {rem.time}</div>
                    <div style={{fontSize:'0.73rem',color:'var(--gray-400)'}}>{(rem.days||[]).join(', ')}</div>
                    {rem.message && <div style={{fontSize:'0.75rem',color:'var(--gray-500)',marginTop:'0.15rem',fontStyle:'italic'}}>"{rem.message}"</div>}
                  </div>
                  <button className="btn btn-ghost btn-sm" style={{color:'var(--red-500)',flexShrink:0}} onClick={()=>deleteReminder(rem._id||rem.id)}>
                    <IconTrash size={14}/>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Presets */}
      <div className="card">
        <h3 style={{fontFamily:'var(--font-display)',fontSize:'1.25rem',marginBottom:'0.5rem'}}>Preset Reminders</h3>
        <p style={{fontSize:'0.83rem',color:'var(--gray-400)',marginBottom:'1.25rem'}}>Science-backed reminders for optimal fitness results. One click to add.</p>
        <div style={{display:'flex',flexDirection:'column',gap:'0.625rem'}}>
          {PRESETS.map((p,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0.875rem 1rem',borderRadius:'var(--radius-lg)',background:'var(--gray-50)',border:'1.5px solid var(--gray-200)'}}>
              <div style={{display:'flex',alignItems:'center',gap:'0.75rem',flex:1,minWidth:0}}>
                <div style={{width:34,height:34,borderRadius:'var(--radius-md)',background:ICON_BG[p.color],display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <p.Icon size={16} color={ICON_COLOR[p.color]}/>
                </div>
                <div style={{minWidth:0}}>
                  <div style={{fontSize:'0.85rem',fontWeight:500,color:'var(--gray-900)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.message}</div>
                  <div style={{fontSize:'0.72rem',color:'var(--gray-400)',marginTop:'0.1rem'}}>{p.time} · {p.days.length===7?'Every day':p.days.join(', ')}</div>
                </div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={()=>addPreset(p)} style={{flexShrink:0,marginLeft:'0.75rem',display:'flex',alignItems:'center',gap:'0.3rem'}}>
                <IconPlus size={12}/> Add
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
