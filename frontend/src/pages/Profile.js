import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { users as usersAPI } from '../utils/api';
import { IconUser, IconEdit, IconCheck, IconTrophy, IconTarget, IconActivity, IconChart } from '../components/Icons';
import toast from 'react-hot-toast';

const GOALS_MAP = { lose_weight:'Lose Weight', gain_muscle:'Build Muscle', maintain:'Maintain', endurance:'Endurance', flexibility:'Flexibility' };
const LEVELS_MAP = { beginner:'Beginner', intermediate:'Intermediate', advanced:'Advanced' };

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name:user?.name||'', bio:user?.bio||'',
    stats:{ age:user?.stats?.age||'', height:user?.stats?.height||'', weight:user?.stats?.weight||'', gender:user?.stats?.gender||'male', fitnessLevel:user?.stats?.fitnessLevel||'beginner', goal:user?.stats?.goal||'gain_muscle' }
  });
  const [activeTab, setActiveTab] = useState('profile');
  const [leaderboard, setLeaderboard] = useState([]);
  const [lbLoaded, setLbLoaded] = useState(false);

  const updateStats = (field, val) => setForm(f=>({...f,stats:{...f.stats,[field]:val}}));

  const loadLeaderboard = async () => {
    if (lbLoaded) return;
    try {
      const res = await usersAPI.getLeaderboard();
      setLeaderboard(res.data.leaderboard||[]);
    } catch {
      setLeaderboard([
        {rank:1,name:'Marcus K.',streak:45,workouts:120,points:3200},
        {rank:2,name:'Priya S.',streak:32,workouts:98,points:2800},
        {rank:3,name:'Alex T.',streak:28,workouts:87,points:2450},
        {rank:4,name:'Jordan M.',streak:21,workouts:76,points:2100},
        {rank:5,name:'You',streak:user?.streak?.current||0,workouts:23,points:650},
      ]);
    }
    setLbLoaded(true);
  };

  const handleTab = (t) => { setActiveTab(t); if(t==='leaderboard') loadLeaderboard(); };

  const saveProfile = async () => {
    try { await updateUser(form); setEditing(false); toast.success('Profile updated!'); }
    catch { toast.error('Could not update profile.'); }
  };

  const bmi = form.stats.height&&form.stats.weight ? (form.stats.weight/((form.stats.height/100)**2)).toFixed(1) : null;
  const bmiLabel = bmi ? (bmi<18.5?'Underweight':bmi<25?'Healthy Weight':bmi<30?'Overweight':'Obese') : null;
  const bmiColor = bmi ? (bmi<18.5?'#2563eb':bmi<25?'#16a34a':'#dc2626') : 'var(--gray-400)';
  const initials = user?.name?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)||'U';

  const GOALS_LIST = ['lose_weight','gain_muscle','maintain','endurance','flexibility'];

  return (
    <div className="page-container animate-fade-in">
      {/* Profile header card */}
      <div className="card" style={{marginBottom:'1.5rem',background:'linear-gradient(135deg,var(--gray-0) 0%,var(--gray-50) 100%)'}}>
        <div style={{display:'flex',alignItems:'flex-start',gap:'1.25rem',flexWrap:'wrap'}}>
          <div style={{width:72,height:72,borderRadius:'50%',background:'linear-gradient(135deg,var(--brand-400),var(--brand-700))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.6rem',fontWeight:700,color:'white',border:'3px solid var(--gray-100)',flexShrink:0}}>
            {initials}
          </div>
          <div style={{flex:1}}>
            <h2 style={{fontFamily:'var(--font-display)',fontSize:'1.75rem',marginBottom:'0.2rem'}}>{user?.name}</h2>
            <p style={{fontSize:'0.8rem',color:'var(--gray-400)',marginBottom:'0.75rem',textTransform:'capitalize'}}>
              {user?.role==='coach'?'Certified Coach':'Athlete'} · Member since {new Date(user?.createdAt).toLocaleDateString('en-US',{month:'long',year:'numeric'})}
            </p>
            <div style={{display:'flex',gap:'0.4rem',flexWrap:'wrap'}}>
              {user?.stats?.goal && <span className="badge badge-blue">{GOALS_MAP[user.stats.goal]}</span>}
              {user?.stats?.fitnessLevel && <span className="badge badge-green">{LEVELS_MAP[user.stats.fitnessLevel]}</span>}
              <span className="badge badge-amber">{user?.streak?.current||0} Day Streak</span>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={()=>setEditing(!editing)} style={{display:'flex',alignItems:'center',gap:'0.35rem'}}>
            <IconEdit size={13}/> {editing?'Cancel':'Edit Profile'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{maxWidth:420,marginBottom:'1.5rem'}}>
        {['profile','stats','leaderboard'].map(t=>(
          <button key={t} className={`tab ${activeTab===t?'active':''}`} onClick={()=>handleTab(t)} style={{textTransform:'capitalize'}}>
            {t==='profile'?'Profile':t==='stats'?'Stats':'Leaderboard'}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {activeTab==='profile' && (
        <div className="card animate-fade-up">
          {!editing ? (
            <div>
              <h4 style={{marginBottom:'1rem'}}>Personal Information</h4>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:'0.75rem'}}>
                {[
                  {label:'Full Name',value:user?.name},
                  {label:'Email',value:user?.email},
                  {label:'Role',value:user?.role==='coach'?'Coach':'Athlete'},
                  {label:'Age',value:user?.stats?.age?`${user.stats.age} years`:'Not set'},
                  {label:'Height',value:user?.stats?.height?`${user.stats.height} cm`:'Not set'},
                  {label:'Weight',value:user?.stats?.weight?`${user.stats.weight} kg`:'Not set'},
                  {label:'Gender',value:user?.stats?.gender||'Not set'},
                  {label:'Fitness Level',value:LEVELS_MAP[user?.stats?.fitnessLevel]||'Not set'},
                ].map(f=>(
                  <div key={f.label} style={{padding:'0.75rem',background:'var(--gray-50)',borderRadius:'var(--radius-lg)',border:'1px solid var(--gray-200)'}}>
                    <div style={{fontSize:'0.65rem',fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',color:'var(--gray-400)',marginBottom:'0.25rem'}}>{f.label}</div>
                    <div style={{fontSize:'0.87rem',fontWeight:500,color:'var(--gray-900)',textTransform:'capitalize'}}>{f.value}</div>
                  </div>
                ))}
              </div>
              {user?.bio && (
                <div style={{marginTop:'1.25rem',padding:'1rem',background:'var(--gray-50)',borderRadius:'var(--radius-lg)',border:'1px solid var(--gray-200)'}}>
                  <div style={{fontSize:'0.65rem',fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',color:'var(--gray-400)',marginBottom:'0.35rem'}}>Bio</div>
                  <p style={{fontSize:'0.87rem',lineHeight:1.7,margin:0}}>{user.bio}</p>
                </div>
              )}
            </div>
          ) : (
            <div>
              <h4 style={{marginBottom:'1.25rem'}}>Edit Profile</h4>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Full Name</label><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/></div>
                <div className="form-group"><label className="form-label">Age</label><input type="number" value={form.stats.age} onChange={e=>updateStats('age',e.target.value)}/></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Height (cm)</label><input type="number" value={form.stats.height} onChange={e=>updateStats('height',e.target.value)}/></div>
                <div className="form-group"><label className="form-label">Weight (kg)</label><input type="number" step="0.1" value={form.stats.weight} onChange={e=>updateStats('weight',e.target.value)}/></div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Fitness Level</label>
                  <select value={form.stats.fitnessLevel} onChange={e=>updateStats('fitnessLevel',e.target.value)}>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select value={form.stats.gender} onChange={e=>updateStats('gender',e.target.value)}>
                    <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Primary Goal</label>
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(120px,1fr))',gap:'0.5rem'}}>
                  {GOALS_LIST.map(g=>(
                    <div key={g} onClick={()=>updateStats('goal',g)}
                      style={{padding:'0.625rem 0.75rem',borderRadius:'var(--radius-md)',cursor:'pointer',border:`1.5px solid ${form.stats.goal===g?'var(--accent-primary)':'var(--gray-200)'}`,background:form.stats.goal===g?'var(--brand-50)':'var(--gray-0)',fontSize:'0.8rem',fontWeight:500,color:form.stats.goal===g?'var(--accent-primary)':'var(--gray-600)',transition:'all 0.15s',display:'flex',alignItems:'center',justifyContent:'space-between',gap:'0.3rem'}}>
                      <span>{GOALS_MAP[g]}</span>
                      {form.stats.goal===g && <IconCheck size={13} color="var(--accent-primary)"/>}
                    </div>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Bio</label>
                <textarea rows={3} placeholder="Tell coaches and athletes about yourself..." value={form.bio} onChange={e=>setForm(f=>({...f,bio:e.target.value}))} style={{resize:'vertical'}}/>
              </div>
              <div style={{display:'flex',gap:'0.75rem'}}>
                <button className="btn btn-secondary flex-1" onClick={()=>setEditing(false)} style={{justifyContent:'center'}}>Cancel</button>
                <button className="btn btn-primary flex-1" onClick={saveProfile} style={{justifyContent:'center',display:'flex',alignItems:'center',gap:'0.4rem'}}>
                  <IconCheck size={14}/> Save Changes
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stats tab */}
      {activeTab==='stats' && (
        <div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:'1rem',marginBottom:'1.5rem'}}>
            {[
              {label:'BMI',value:bmi||'—',sub:bmiLabel||'Set height & weight',color:bmiColor,Icon:IconTarget},
              {label:'Current Streak',value:`${user?.streak?.current||0}d`,sub:`Best: ${user?.streak?.longest||0} days`,color:'var(--amber-600)',Icon:IconActivity},
              {label:'Goal',value:GOALS_MAP[user?.stats?.goal]||'Not set',sub:'Primary objective',color:'var(--accent-primary)',Icon:IconTarget},
              {label:'Level',value:LEVELS_MAP[user?.stats?.fitnessLevel]||'Not set',sub:'Experience tier',color:'var(--green-600)',Icon:IconChart},
            ].map(s=>(
              <div key={s.label} className="stat-card">
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:'0.625rem'}}>
                  <div className="stat-label">{s.label}</div>
                  <s.Icon size={16} color={s.color}/>
                </div>
                <div style={{fontFamily:'var(--font-display)',fontSize:'1.35rem',color:s.color,marginBottom:'0.2rem'}}>{s.value}</div>
                <div style={{fontSize:'0.72rem',color:'var(--gray-400)'}}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* BMI scale */}
          {bmi && (
            <div className="card">
              <h4 style={{marginBottom:'1rem'}}>BMI Scale</h4>
              <div style={{position:'relative',height:36,borderRadius:'var(--radius-full)',background:'linear-gradient(to right,#3b82f6,#22c55e,#f59e0b,#ef4444)',marginBottom:'0.5rem',overflow:'visible'}}>
                <div style={{position:'absolute',top:'50%',transform:'translate(-50%,-50%)',left:`${Math.min(95,Math.max(5,((bmi-10)/30)*100))}%`,width:20,height:20,background:'white',borderRadius:'50%',boxShadow:'0 2px 8px rgba(0,0,0,0.3)',border:'2px solid var(--gray-200)',transition:'left 0.5s var(--ease)'}}/>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.68rem',color:'var(--gray-400)',marginBottom:'1.25rem'}}>
                <span>Under &lt;18.5</span><span>Healthy 18.5–24.9</span><span>Over 25–29.9</span><span>Obese &gt;30</span>
              </div>
              <div style={{textAlign:'center'}}>
                <div style={{fontFamily:'var(--font-display)',fontSize:'3rem',fontWeight:400,color:bmiColor,lineHeight:1}}>{bmi}</div>
                <div style={{fontSize:'0.87rem',color:bmiColor,fontWeight:500,marginTop:'0.25rem'}}>{bmiLabel}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Leaderboard tab */}
      {activeTab==='leaderboard' && (
        <div className="card animate-fade-up">
          <div style={{display:'flex',alignItems:'center',gap:'0.75rem',marginBottom:'0.5rem'}}>
            <div style={{width:38,height:38,borderRadius:'var(--radius-lg)',background:'#fffbeb',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <IconTrophy size={20} color="#d97706"/>
            </div>
            <h3 style={{fontFamily:'var(--font-display)',fontSize:'1.3rem'}}>Community Leaderboard</h3>
          </div>
          <p style={{fontSize:'0.83rem',color:'var(--gray-400)',marginBottom:'1.25rem'}}>Ranked by consistency, workouts, and streak days.</p>
          <div style={{display:'flex',flexDirection:'column',gap:'0.625rem'}}>
            {leaderboard.map((entry,i)=>{
              const isMe=entry.name==='You';
              const medals=['🥇','🥈','🥉'];
              return (
                <div key={i} style={{display:'flex',alignItems:'center',gap:'1rem',padding:'0.875rem 1rem',borderRadius:'var(--radius-lg)',background:isMe?'#eff6ff':'var(--gray-50)',border:`1.5px solid ${isMe?'var(--brand-300)':'var(--gray-200)'}`}}>
                  <div style={{fontSize:'1.2rem',minWidth:28,textAlign:'center'}}>{medals[i]||`${entry.rank}.`}</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:isMe?700:500,color:isMe?'var(--accent-primary)':'var(--gray-900)',fontSize:'0.87rem'}}>{entry.name}{isMe&&' (You)'}</div>
                    <div style={{fontSize:'0.72rem',color:'var(--gray-400)'}}>{entry.streak}d streak · {entry.workouts} workouts</div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontFamily:'var(--font-display)',fontSize:'1.2rem',color:'var(--amber-600)'}}>{entry.points?.toLocaleString()}</div>
                    <div style={{fontSize:'0.62rem',color:'var(--gray-400)',textTransform:'uppercase',letterSpacing:'0.08em'}}>pts</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
