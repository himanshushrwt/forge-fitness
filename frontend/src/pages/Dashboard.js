import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { workouts, nutrition } from '../utils/api';
import { LineChart, Line, ResponsiveContainer, XAxis, Tooltip } from 'recharts';
import {
  IconDumbbell, IconNutrition, IconRobot, IconChart, IconUsers,
  IconClipboard, IconPhoto, IconBell, IconArrowRight, IconCheck,
  IconActivity, IconTarget, IconHeart
} from '../components/Icons';

const QUOTES = [
  "The only bad workout is the one that didn't happen.",
  "Your body can stand almost anything. It's your mind you have to convince.",
  "Strength does not come from the body. It comes from the will of the soul.",
  "Push yourself because no one else is going to do it for you.",
  "The pain you feel today will be the strength you feel tomorrow.",
];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const QUICK_ACTIONS = [
  { Icon: IconDumbbell,  label: 'Log Workout',    path: '/workout-planner', color: 'blue' },
  { Icon: IconNutrition, label: 'Log Meal',        path: '/nutrition',       color: 'green' },
  { Icon: IconPhoto,     label: 'Progress Photo',  path: '/progress',        color: 'purple' },
  { Icon: IconRobot,     label: 'AI Coach',        path: '/ai-coach',        color: 'blue' },
  { Icon: IconUsers,     label: 'Find Coach',      path: '/trainers',        color: 'amber' },
  { Icon: IconClipboard, label: 'Exercises',       path: '/exercises',       color: 'gray' },
];

const ICON_BG    = { blue:'#eff6ff',green:'#f0fdf4',purple:'#f5f3ff',amber:'#fffbeb',gray:'var(--gray-100)' };
const ICON_COLOR = { blue:'#2563eb',green:'#16a34a',purple:'#7c3aed',amber:'#d97706',gray:'var(--gray-600)' };

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [quote] = useState(QUOTES[Math.floor(Math.random()*QUOTES.length)]);
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [todayNutrition, setTodayNutrition] = useState(null);

  const weekData = DAYS.map((day,i) => ({
    day, calories: Math.round(1800+Math.random()*700),
    workoutMin: i%2===0 ? Math.round(30+Math.random()*45) : 0
  }));

  useEffect(() => {
    workouts.getAll().then(r=>setRecentWorkouts(r.data.workouts?.slice(0,3)||[])).catch(()=>{});
    nutrition.getAll().then(r=>setTodayNutrition(r.data.logs?.[0]||null)).catch(()=>{});
  },[]);

  const greeting = () => { const h=new Date().getHours(); return h<12?'Good morning':h<17?'Good afternoon':'Good evening'; };
  const bmi = user?.stats?.height && user?.stats?.weight ? (user.stats.weight/((user.stats.height/100)**2)).toFixed(1) : null;
  const calorieGoal = user?.stats?.weight ? Math.round(user.stats.weight*33) : 2200;
  const todayCalories = todayNutrition?.totalCalories || 0;
  const caloriePct = Math.min(100, Math.round((todayCalories/calorieGoal)*100));
  const todayDone = recentWorkouts.some(w => new Date(w.date||w.createdAt).toDateString()===new Date().toDateString());

  return (
    <div className="page-container animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <p style={{ fontSize:'0.72rem',color:'var(--text-muted)',fontWeight:600,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:'0.2rem' }}>{greeting()}</p>
          <h1 className="page-title">{user?.name?.split(' ')[0]}</h1>
          <p style={{ fontSize:'0.83rem',color:'var(--gray-400)',marginTop:'0.3rem',fontStyle:'italic' }}>"{quote}"</p>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:'0.75rem',color:'var(--gray-400)' }}>{new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}</div>
          <div style={{ display:'flex',alignItems:'center',gap:'0.4rem',justifyContent:'flex-end',marginTop:'0.5rem' }}>
            <div style={{ width:20,height:20,borderRadius:'var(--radius-sm)',background:'#fef3c7',display:'flex',alignItems:'center',justifyContent:'center' }}>
              <IconActivity size={12} color="#d97706"/>
            </div>
            <span style={{ fontSize:'0.83rem',fontWeight:600,color:'var(--amber-600)' }}>{user?.streak?.current||0} day streak</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4 stagger-1" style={{ marginBottom:'1.5rem' }}>
        {[
          { label:'Today Calories', value: todayCalories||'—', unit:`/ ${calorieGoal}`, icon:<IconNutrition size={16} color="#16a34a"/>, bg:'#f0fdf4' },
          { label:'BMI',            value: bmi||'—',            unit: bmi?(bmi<18.5?'Low':bmi<25?'Healthy':'High'):'Set profile', icon:<IconTarget size={16} color="#7c3aed"/>, bg:'#f5f3ff' },
          { label:'Weight',         value: user?.stats?.weight||'—', unit:'kg', icon:<IconChart size={16} color="#2563eb"/>, bg:'#eff6ff' },
          { label:'Streak',         value: user?.streak?.current||0, unit:'days', icon:<IconActivity size={16} color="#d97706"/>, bg:'#fffbeb' },
        ].map(s => (
          <div key={s.label} className="stat-card animate-fade-up">
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'0.75rem' }}>
              <div className="stat-label">{s.label}</div>
              <div style={{ width:30,height:30,borderRadius:'var(--radius-md)',background:s.bg,display:'flex',alignItems:'center',justifyContent:'center' }}>{s.icon}</div>
            </div>
            <div style={{ display:'flex',alignItems:'baseline',gap:3 }}>
              <span className="stat-value" style={{ fontSize:'1.6rem' }}>{s.value}</span>
              <span className="stat-unit">{s.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts + Today */}
      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1.25rem',marginBottom:'1.5rem' }}>
        {/* Week chart */}
        <div className="card animate-fade-up stagger-2">
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.25rem' }}>
            <h3 style={{ fontFamily:'var(--font-display)',fontSize:'1.2rem' }}>This Week</h3>
            <span className="badge badge-blue">Calories</span>
          </div>
          <ResponsiveContainer width="100%" height={130}>
            <LineChart data={weekData}>
              <XAxis dataKey="day" tick={{ fontSize:11,fill:'var(--gray-400)' }} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{ background:'var(--gray-0)',border:'1px solid var(--gray-200)',borderRadius:8,fontSize:12,boxShadow:'var(--shadow-md)' }} labelStyle={{ color:'var(--gray-600)' }} itemStyle={{ color:'var(--accent-primary)' }}/>
              <Line type="monotone" dataKey="calories" stroke="var(--accent-primary)" strokeWidth={2} dot={{ fill:'var(--accent-primary)',r:3 }} activeDot={{ r:5 }}/>
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Today's plan */}
        <div className="card animate-fade-up stagger-3">
          <h3 style={{ fontFamily:'var(--font-display)',fontSize:'1.2rem',marginBottom:'1rem' }}>Today's Plan</h3>
          <div style={{ display:'flex',flexDirection:'column',gap:'0.625rem' }}>
            {/* Workout */}
            <div onClick={()=>navigate('/workout-planner')} style={{ display:'flex',alignItems:'center',gap:'0.875rem',padding:'0.75rem',borderRadius:'var(--radius-lg)',border:`1.5px solid ${todayDone?'#bbf7d0':'var(--gray-200)'}`,background:todayDone?'#f0fdf4':'var(--gray-50)',cursor:'pointer',transition:'all 0.15s' }}>
              <div style={{ width:34,height:34,borderRadius:'var(--radius-md)',background:todayDone?'#dcfce7':'#eff6ff',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                <IconDumbbell size={17} color={todayDone?'#16a34a':'#2563eb'}/>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:'0.85rem',fontWeight:500,color:'var(--gray-900)' }}>Workout</div>
                <div style={{ fontSize:'0.73rem',color:'var(--gray-400)' }}>{todayDone?'Completed':'Not started'}</div>
              </div>
              {todayDone ? <IconCheck size={16} color="#16a34a"/> : <IconArrowRight size={14} color="var(--gray-300)"/>}
            </div>

            {/* Nutrition */}
            <div onClick={()=>navigate('/nutrition')} style={{ padding:'0.75rem',borderRadius:'var(--radius-lg)',border:'1.5px solid var(--gray-200)',background:'var(--gray-50)',cursor:'pointer',transition:'all 0.15s' }}>
              <div style={{ display:'flex',alignItems:'center',gap:'0.875rem',marginBottom:'0.5rem' }}>
                <div style={{ width:34,height:34,borderRadius:'var(--radius-md)',background:'#f0fdf4',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                  <IconNutrition size={17} color="#16a34a"/>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:'0.85rem',fontWeight:500,color:'var(--gray-900)' }}>Nutrition</div>
                  <div style={{ fontSize:'0.73rem',color:'var(--gray-400)' }}>{caloriePct}% of daily goal</div>
                </div>
                <IconArrowRight size={14} color="var(--gray-300)"/>
              </div>
              <div className="progress-bar">
                <div className="progress-fill green" style={{ width:`${caloriePct}%` }}/>
              </div>
            </div>

            {/* AI */}
            <div onClick={()=>navigate('/ai-coach')} style={{ display:'flex',alignItems:'center',gap:'0.875rem',padding:'0.75rem',borderRadius:'var(--radius-lg)',border:'1.5px solid #bfdbfe',background:'#eff6ff',cursor:'pointer',transition:'all 0.15s' }}>
              <div style={{ width:34,height:34,borderRadius:'var(--radius-md)',background:'#dbeafe',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                <IconRobot size={17} color="#2563eb"/>
              </div>
              <div style={{ flex:1,fontSize:'0.83rem',color:'var(--brand-700)',fontWeight:500 }}>Ask your AI Coach anything</div>
              <IconArrowRight size={14} color="#93c5fd"/>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="card animate-fade-up stagger-4" style={{ marginBottom:'1.5rem' }}>
        <h4 style={{ marginBottom:'1rem' }}>Quick Actions</h4>
        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(120px,1fr))',gap:'0.75rem' }}>
          {QUICK_ACTIONS.map(a => (
            <button key={a.label} onClick={()=>navigate(a.path)}
              style={{ padding:'1rem 0.75rem',background:'var(--gray-50)',border:'1.5px solid var(--gray-200)',borderRadius:'var(--radius-lg)',cursor:'pointer',transition:'all 0.15s',textAlign:'center',display:'flex',flexDirection:'column',alignItems:'center',gap:'0.5rem' }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--brand-300)';e.currentTarget.style.background='var(--brand-50)';}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--gray-200)';e.currentTarget.style.background='var(--gray-50)';}}>
              <div style={{ width:36,height:36,borderRadius:'var(--radius-md)',background:ICON_BG[a.color],display:'flex',alignItems:'center',justifyContent:'center' }}>
                <a.Icon size={18} color={ICON_COLOR[a.color]}/>
              </div>
              <span style={{ fontSize:'0.75rem',fontWeight:500,color:'var(--gray-600)' }}>{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent workouts */}
      <div className="card animate-fade-up stagger-5">
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.25rem' }}>
          <h3 style={{ fontFamily:'var(--font-display)',fontSize:'1.2rem' }}>Recent Workouts</h3>
          <button className="btn btn-ghost btn-sm" onClick={()=>navigate('/workout-planner')} style={{ display:'flex',alignItems:'center',gap:'0.3rem' }}>
            View all <IconArrowRight size={13}/>
          </button>
        </div>
        {recentWorkouts.length===0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><IconDumbbell size={24} color="var(--gray-400)"/></div>
            <h3>No workouts yet</h3>
            <p>Start your first session to see it here.</p>
            <button className="btn btn-primary btn-sm" style={{ marginTop:'1rem',justifyContent:'center' }} onClick={()=>navigate('/workout-planner')}>Plan Workout</button>
          </div>
        ) : recentWorkouts.map((w,i) => (
          <div key={w._id||w.id||i} style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0.75rem 0',borderBottom:i<recentWorkouts.length-1?'1px solid var(--gray-100)':'none' }}>
            <div style={{ display:'flex',alignItems:'center',gap:'0.75rem' }}>
              <div style={{ width:36,height:36,borderRadius:'var(--radius-md)',background:'var(--gray-100)',display:'flex',alignItems:'center',justifyContent:'center' }}>
                <IconDumbbell size={17} color="var(--gray-500)"/>
              </div>
              <div>
                <div style={{ fontSize:'0.87rem',fontWeight:500,color:'var(--gray-900)' }}>{w.name}</div>
                <div style={{ fontSize:'0.73rem',color:'var(--gray-400)' }}>{new Date(w.date||w.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
            <div style={{ textAlign:'right' }}>
              {w.duration && <div style={{ fontSize:'0.78rem',color:'var(--gray-500)' }}>{w.duration} min</div>}
              {w.isCompleted && <span className="badge badge-green" style={{ fontSize:'0.65rem' }}>Done</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
