import React, { useState, useEffect } from 'react';
import { workouts as workoutsAPI, exercises as exercisesAPI } from '../utils/api';
import { IconDumbbell, IconPlus, IconX, IconEdit, IconTrash, IconSearch, IconClipboard, WorkoutTypeIcon } from '../components/Icons';
import toast from 'react-hot-toast';

const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
const DAY_LABELS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const WORKOUT_TYPES = ['strength','cardio','flexibility','hiit','sports','custom'];

const EMPTY = { name:'',type:'strength',duration:60,weekDay:'monday',exercises:[],notes:'',isTemplate:true,isCompleted:false };

function WorkoutModal({ workout, allExercises, onSave, onClose }) {
  const [form, setForm] = useState(workout||EMPTY);
  const [exSearch, setExSearch] = useState('');
  const [showPicker, setShowPicker] = useState(false);

  const addExercise = (ex) => {
    setForm(f=>({ ...f, exercises:[...f.exercises,{ exerciseId:ex.id,name:ex.name,category:ex.category, sets:[{reps:10,weight:0,duration:0,completed:false}] }] }));
    setShowPicker(false); setExSearch('');
  };

  const updateSet = (ei,si,field,val) => {
    const exs=[...form.exercises]; exs[ei].sets[si]={...exs[ei].sets[si],[field]:val}; setForm(f=>({...f,exercises:exs}));
  };

  const addSet = (ei) => {
    const exs=[...form.exercises]; exs[ei].sets=[...exs[ei].sets,{...exs[ei].sets.slice(-1)[0],completed:false}]; setForm(f=>({...f,exercises:exs}));
  };

  const filteredEx = allExercises.filter(e=>!exSearch||e.name.toLowerCase().includes(exSearch.toLowerCase())).slice(0,20);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{maxWidth:680,maxHeight:'92vh'}} onClick={e=>e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><IconX size={14}/></button>
        <h2 style={{fontFamily:'var(--font-display)',fontSize:'1.7rem',marginBottom:'1.25rem'}}>{workout?'Edit Workout':'Plan Workout'}</h2>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Workout Name *</label>
            <input placeholder="e.g. Push Day A" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/>
          </div>
          <div className="form-group">
            <label className="form-label">Day</label>
            <select value={form.weekDay} onChange={e=>setForm(f=>({...f,weekDay:e.target.value}))}>
              {DAYS.map(d=><option key={d} value={d}>{d.charAt(0).toUpperCase()+d.slice(1)}</option>)}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Type</label>
            <select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>
              {WORKOUT_TYPES.map(t=><option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Duration (min)</label>
            <input type="number" value={form.duration} onChange={e=>setForm(f=>({...f,duration:+e.target.value}))}/>
          </div>
        </div>

        {/* Exercises */}
        <div style={{marginBottom:'1rem'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.75rem'}}>
            <label className="form-label" style={{marginBottom:0}}>Exercises ({form.exercises.length})</label>
            <button className="btn btn-secondary btn-sm" onClick={()=>setShowPicker(!showPicker)} style={{display:'flex',alignItems:'center',gap:'0.3rem'}}>
              <IconPlus size={13}/> Add Exercise
            </button>
          </div>

          {showPicker && (
            <div style={{marginBottom:'1rem',background:'var(--gray-50)',borderRadius:'var(--radius-lg)',border:'1.5px solid var(--gray-200)',padding:'1rem'}}>
              <div className="input-icon-wrap" style={{marginBottom:'0.75rem'}}>
                <IconSearch size={15} className="input-icon"/>
                <input placeholder="Search exercises..." value={exSearch} onChange={e=>setExSearch(e.target.value)}/>
              </div>
              <div style={{maxHeight:200,overflowY:'auto',display:'flex',flexDirection:'column',gap:'0.3rem'}}>
                {filteredEx.map(ex=>(
                  <button key={ex.id} onClick={()=>addExercise(ex)}
                    style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0.55rem 0.75rem',borderRadius:'var(--radius-md)',background:'var(--gray-0)',border:'1.5px solid var(--gray-200)',cursor:'pointer',fontSize:'0.83rem',color:'var(--gray-800)',textAlign:'left',transition:'all 0.15s'}}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--brand-300)';e.currentTarget.style.background='var(--brand-50)';}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--gray-200)';e.currentTarget.style.background='var(--gray-0)';}}>
                    <span style={{fontWeight:500}}>{ex.name}</span>
                    <span style={{fontSize:'0.7rem',color:'var(--gray-400)',textTransform:'capitalize'}}>{ex.category}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
            {form.exercises.map((ex,ei)=>(
              <div key={ei} style={{background:'var(--gray-50)',borderRadius:'var(--radius-lg)',border:'1.5px solid var(--gray-200)',padding:'0.875rem'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.75rem'}}>
                  <span style={{fontWeight:600,fontSize:'0.87rem',color:'var(--gray-900)'}}>{ex.name}</span>
                  <button className="btn btn-ghost btn-sm" style={{color:'var(--red-500)',padding:'2px 6px'}} onClick={()=>setForm(f=>({...f,exercises:f.exercises.filter((_,i)=>i!==ei)}))}>
                    <IconTrash size={13}/>
                  </button>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'28px 1fr 1fr 1fr',gap:'0.4rem',alignItems:'center',marginBottom:'0.4rem'}}>
                  {['Set','Reps','Weight (kg)','Secs'].map(h=><span key={h} style={{fontSize:'0.62rem',color:'var(--gray-400)',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.05em'}}>{h}</span>)}
                </div>
                {ex.sets.map((set,si)=>(
                  <div key={si} style={{display:'grid',gridTemplateColumns:'28px 1fr 1fr 1fr',gap:'0.4rem',alignItems:'center',marginBottom:'0.4rem'}}>
                    <span style={{fontSize:'0.78rem',color:'var(--gray-400)',textAlign:'center'}}>{si+1}</span>
                    <input type="number" value={set.reps} onChange={e=>updateSet(ei,si,'reps',+e.target.value)} style={{padding:'0.35rem 0.5rem',fontSize:'0.83rem'}}/>
                    <input type="number" value={set.weight} onChange={e=>updateSet(ei,si,'weight',+e.target.value)} style={{padding:'0.35rem 0.5rem',fontSize:'0.83rem'}}/>
                    <input type="number" value={set.duration} onChange={e=>updateSet(ei,si,'duration',+e.target.value)} style={{padding:'0.35rem 0.5rem',fontSize:'0.83rem'}}/>
                  </div>
                ))}
                <button className="btn btn-ghost btn-sm" style={{fontSize:'0.73rem',marginTop:'0.25rem'}} onClick={()=>addSet(ei)}>+ Add Set</button>
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Notes</label>
          <textarea rows={2} placeholder="Training notes, RPE, how you felt..." value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} style={{resize:'vertical'}}/>
        </div>

        <div style={{display:'flex',gap:'0.75rem'}}>
          <button className="btn btn-secondary flex-1" onClick={onClose} style={{justifyContent:'center'}}>Cancel</button>
          <button className="btn btn-primary flex-1" onClick={()=>{if(!form.name)return toast.error('Add a workout name');onSave(form);}} style={{justifyContent:'center'}}>Save Workout</button>
        </div>
      </div>
    </div>
  );
}

export default function WorkoutPlanner() {
  const [weekPlan, setWeekPlan] = useState({});
  const [allWorkouts, setAllWorkouts] = useState([]);
  const [allExercises, setAllExercises] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editWorkout, setEditWorkout] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    Promise.all([workoutsAPI.getAll(),exercisesAPI.getAll()])
      .then(([wRes,eRes])=>{
        const list=wRes.data.workouts||[];
        setAllWorkouts(list);
        const plan={};
        list.filter(w=>w.weekDay).forEach(w=>{ if(!plan[w.weekDay])plan[w.weekDay]=[]; plan[w.weekDay].push(w); });
        setWeekPlan(plan);
        setAllExercises(eRes.data.exercises||[]);
      }).catch(()=>{}).finally(()=>setLoading(false));
  },[]);

  const saveWorkout = async (form) => {
    try {
      let saved;
      if (editWorkout?._id||editWorkout?.id) {
        const res=await workoutsAPI.update(editWorkout._id||editWorkout.id,form); saved=res.data.workout;
        setAllWorkouts(ws=>ws.map(w=>(w._id||w.id)===(saved._id||saved.id)?saved:w));
      } else {
        const res=await workoutsAPI.create(form); saved=res.data.workout;
        setAllWorkouts(ws=>[saved,...ws]);
      }
      if (saved?.weekDay) {
        setWeekPlan(p=>{
          const day=saved.weekDay; const existing=p[day]||[];
          const updated=editWorkout?existing.map(w=>(w._id||w.id)===(saved._id||saved.id)?saved:w):[...existing,saved];
          return {...p,[day]:updated};
        });
      }
      toast.success('Workout saved!');
      setShowModal(false); setEditWorkout(null);
    } catch { toast.error('Could not save workout.'); }
  };

  const deleteWorkout = async (w) => {
    try {
      await workoutsAPI.delete(w._id||w.id);
      setAllWorkouts(ws=>ws.filter(x=>(x._id||x.id)!==(w._id||w.id)));
      if (w.weekDay) setWeekPlan(p=>({...p,[w.weekDay]:(p[w.weekDay]||[]).filter(x=>(x._id||x.id)!==(w._id||w.id))}));
      toast.success('Workout deleted.');
    } catch { toast.error('Could not delete.'); }
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Workout Planner</h1>
          <p className="page-subtitle">Build your weekly training schedule</p>
        </div>
        <button className="btn btn-primary" onClick={()=>{setEditWorkout(null);setShowModal(true);}} style={{display:'flex',alignItems:'center',gap:'0.4rem'}}>
          <IconPlus size={15}/> New Workout
        </button>
      </div>

      {/* Weekly grid */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:'0.625rem',marginBottom:'2rem'}}>
        {DAYS.map((day,i)=>{
          const dayWorkouts=weekPlan[day]||[];
          const isToday=new Date().toLocaleString('en-US',{weekday:'long'}).toLowerCase()===day;
          return (
            <div key={day} style={{background:isToday?'#eff6ff':'var(--gray-0)',border:`1.5px solid ${isToday?'var(--brand-300)':'var(--gray-200)'}`,borderRadius:'var(--radius-xl)',padding:'0.75rem',minHeight:140}}>
              <div style={{fontSize:'0.65rem',fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:'0.625rem',color:isToday?'var(--accent-primary)':'var(--gray-400)'}}>
                {DAY_LABELS[i]}{isToday&&' ·'}
              </div>
              {dayWorkouts.length===0 ? (
                <button onClick={()=>{setEditWorkout({...EMPTY,weekDay:day});setShowModal(true);}}
                  style={{width:'100%',padding:'0.5rem',borderRadius:'var(--radius-md)',border:'1.5px dashed var(--gray-200)',background:'transparent',color:'var(--gray-300)',fontSize:'0.72rem',cursor:'pointer',transition:'all 0.15s'}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--brand-300)';e.currentTarget.style.color='var(--accent-primary)';}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--gray-200)';e.currentTarget.style.color='var(--gray-300)';}}>
                  Rest / Add
                </button>
              ) : (
                <>
                  {dayWorkouts.map((w,wi)=>(
                    <div key={wi} style={{marginBottom:'0.375rem',padding:'0.45rem 0.5rem',borderRadius:'var(--radius-md)',background:isToday?'rgba(59,130,246,0.08)':'var(--gray-50)',border:'1px solid var(--gray-200)',fontSize:'0.72rem'}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                        <span style={{fontWeight:600,color:'var(--gray-900)',lineHeight:1.3,flex:1}}>{w.name}</span>
                        <div style={{display:'flex',gap:'1px',flexShrink:0,marginLeft:2}}>
                          <button onClick={()=>{setEditWorkout(w);setShowModal(true);}} style={{padding:'1px 3px',background:'none',border:'none',cursor:'pointer',color:'var(--gray-400)'}}><IconEdit size={10}/></button>
                          <button onClick={()=>deleteWorkout(w)} style={{padding:'1px 3px',background:'none',border:'none',cursor:'pointer',color:'var(--red-400)'}}><IconTrash size={10}/></button>
                        </div>
                      </div>
                      {w.duration&&<div style={{color:'var(--gray-400)',marginTop:'1px'}}>{w.duration}m</div>}
                    </div>
                  ))}
                  <button onClick={()=>{setEditWorkout({...EMPTY,weekDay:day});setShowModal(true);}}
                    style={{width:'100%',padding:'0.3rem',border:'1.5px dashed var(--gray-200)',borderRadius:'var(--radius-md)',background:'transparent',color:'var(--gray-300)',fontSize:'0.68rem',cursor:'pointer',marginTop:'0.3rem',transition:'all 0.15s'}}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--brand-300)';e.currentTarget.style.color='var(--accent-primary)';}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--gray-200)';e.currentTarget.style.color='var(--gray-300)';}}>
                    + Add
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* All workouts list */}
      <div className="card">
        <h3 style={{fontFamily:'var(--font-display)',fontSize:'1.25rem',marginBottom:'1.25rem'}}>All Workouts</h3>
        {loading ? (
          <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
            {[...Array(3)].map((_,i)=><div key={i} className="skeleton" style={{height:60}}/>)}
          </div>
        ) : allWorkouts.length===0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><IconClipboard size={24} color="var(--gray-400)"/></div>
            <h3>No workouts planned</h3>
            <p>Click "New Workout" to start building your schedule.</p>
          </div>
        ) : allWorkouts.map((w,i)=>(
          <div key={w._id||w.id||i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0.75rem 0',borderBottom:i<allWorkouts.length-1?'1px solid var(--gray-100)':'none'}}>
            <div style={{display:'flex',alignItems:'center',gap:'0.75rem'}}>
              <div style={{width:38,height:38,borderRadius:'var(--radius-md)',background:'var(--gray-100)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <WorkoutTypeIcon type={w.type} size={18} color="var(--gray-500)"/>
              </div>
              <div>
                <div style={{fontSize:'0.87rem',fontWeight:500,color:'var(--gray-900)'}}>{w.name}</div>
                <div style={{fontSize:'0.73rem',color:'var(--gray-400)'}}>
                  {w.weekDay?w.weekDay.charAt(0).toUpperCase()+w.weekDay.slice(1):new Date(w.createdAt||w.date).toLocaleDateString()}
                  {w.exercises?.length>0&&` · ${w.exercises.length} exercises`}
                  {w.duration&&` · ${w.duration} min`}
                </div>
              </div>
            </div>
            <div style={{display:'flex',gap:'0.4rem',alignItems:'center'}}>
              {w.isCompleted&&<span className="badge badge-green" style={{fontSize:'0.63rem'}}>Done</span>}
              <button className="btn btn-ghost btn-sm" onClick={()=>{setEditWorkout(w);setShowModal(true);}}>
                <IconEdit size={13}/>
              </button>
              <button className="btn btn-ghost btn-sm" style={{color:'var(--red-500)'}} onClick={()=>deleteWorkout(w)}>
                <IconTrash size={13}/>
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <WorkoutModal workout={editWorkout} allExercises={allExercises} onSave={saveWorkout}
          onClose={()=>{setShowModal(false);setEditWorkout(null);}}/>
      )}
    </div>
  );
}
