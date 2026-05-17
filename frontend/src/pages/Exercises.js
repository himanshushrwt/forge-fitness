import React, { useState, useEffect } from 'react';
import { exercises as exercisesAPI } from '../utils/api';
import { IconSearch, IconX, IconCheck, CategoryIcon } from '../components/Icons';

const CATEGORIES = ['all','chest','back','legs','shoulders','arms','core','cardio','flexibility'];
const LEVELS     = ['all','beginner','intermediate','advanced'];
const EQUIPMENT  = ['all','bodyweight','barbell','dumbbells','cable','machine','none','rope','bike'];

const LEVEL_BADGE = { beginner:'badge-green', intermediate:'badge-amber', advanced:'badge-red' };
const CAT_LABEL   = { all:'All', chest:'Chest', back:'Back', legs:'Legs', shoulders:'Shoulders', arms:'Arms', core:'Core', cardio:'Cardio', flexibility:'Flexibility' };

function ExerciseCard({ ex, onClick }) {
  return (
    <div className="card" style={{ cursor:'pointer' }} onClick={()=>onClick(ex)}>
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'0.875rem' }}>
        <div style={{ width:42,height:42,borderRadius:'var(--radius-lg)',background:'var(--gray-100)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
          <CategoryIcon category={ex.category} size={22} color="var(--gray-500)"/>
        </div>
        <div style={{ display:'flex',gap:'0.35rem',flexWrap:'wrap',justifyContent:'flex-end' }}>
          <span className={`badge ${LEVEL_BADGE[ex.level]}`}>{ex.level}</span>
        </div>
      </div>
      <h3 style={{ fontFamily:'var(--font-display)',fontSize:'1.1rem',marginBottom:'0.3rem',color:'var(--gray-900)' }}>{ex.name}</h3>
      <div style={{ fontSize:'0.73rem',color:'var(--gray-400)',marginBottom:'0.75rem',textTransform:'capitalize' }}>
        {CAT_LABEL[ex.category]} · {ex.muscles.slice(0,2).join(', ')}
      </div>
      <div style={{ display:'flex',gap:'1rem',fontSize:'0.73rem',color:'var(--gray-400)',paddingTop:'0.75rem',borderTop:'1px solid var(--gray-100)' }}>
        <span>{ex.steps.length} steps</span>
        <span>~{ex.calories_per_set} kcal/set</span>
        <span style={{ textTransform:'capitalize' }}>{ex.equipment}</span>
      </div>
    </div>
  );
}

function ExerciseModal({ ex, onClose }) {
  const [activeStep, setActiveStep] = useState(0);
  if (!ex) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth:620 }} onClick={e=>e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><IconX size={14}/></button>

        <div style={{ display:'flex',gap:'0.4rem',flexWrap:'wrap',marginBottom:'1rem' }}>
          <span className={`badge ${LEVEL_BADGE[ex.level]}`}>{ex.level}</span>
          <span className="badge badge-gray" style={{ textTransform:'capitalize' }}>{ex.equipment}</span>
          <span className="badge badge-blue" style={{ textTransform:'capitalize' }}>{ex.category}</span>
        </div>

        <h2 style={{ fontFamily:'var(--font-display)',fontSize:'1.8rem',marginBottom:'0.4rem' }}>{ex.name}</h2>
        <p style={{ fontSize:'0.83rem',color:'var(--gray-400)',marginBottom:'1.5rem' }}>
          Primary muscles: <strong style={{ color:'var(--gray-600)' }}>{ex.muscles.join(', ')}</strong>
        </p>

        {/* Stats */}
        <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'0.75rem',marginBottom:'1.5rem' }}>
          {[
            { label:'Cal / Set', value:`~${ex.calories_per_set}`, unit:'kcal' },
            { label:'Difficulty', value:ex.level, unit:'' },
            { label:'Steps', value:ex.steps.length, unit:'total' },
          ].map(s => (
            <div key={s.label} style={{ background:'var(--gray-50)',border:'1px solid var(--gray-200)',borderRadius:'var(--radius-lg)',padding:'0.875rem',textAlign:'center' }}>
              <div style={{ fontSize:'0.65rem',fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--gray-400)',marginBottom:'0.3rem' }}>{s.label}</div>
              <div style={{ fontFamily:'var(--font-display)',fontSize:'1.3rem',color:'var(--accent-primary)',textTransform:'capitalize' }}>{s.value}</div>
              {s.unit && <div style={{ fontSize:'0.7rem',color:'var(--gray-400)' }}>{s.unit}</div>}
            </div>
          ))}
        </div>

        {/* Steps */}
        <h4 style={{ marginBottom:'0.875rem' }}>Step-by-Step Instructions</h4>
        <div style={{ display:'flex',flexDirection:'column',gap:'0.4rem',marginBottom:'1.5rem' }}>
          {ex.steps.map((step,i) => (
            <div key={i} onClick={()=>setActiveStep(i)}
              style={{ display:'flex',gap:'0.875rem',padding:'0.75rem',borderRadius:'var(--radius-md)',cursor:'pointer',background:activeStep===i?'#eff6ff':'var(--gray-50)',border:`1.5px solid ${activeStep===i?'var(--brand-300)':'var(--gray-200)'}`,transition:'all 0.15s' }}>
              <div style={{ width:24,height:24,borderRadius:'50%',flexShrink:0,background:activeStep===i?'var(--accent-primary)':'var(--gray-200)',color:activeStep===i?'white':'var(--gray-500)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.72rem',fontWeight:700,transition:'all 0.15s' }}>{i+1}</div>
              <p style={{ fontSize:'0.85rem',lineHeight:1.55,color:activeStep===i?'var(--gray-900)':'var(--gray-600)',margin:0 }}>{step}</p>
            </div>
          ))}
        </div>

        {/* Tip */}
        <div style={{ padding:'0.875rem 1rem',borderRadius:'var(--radius-lg)',background:'#f0fdf4',border:'1px solid #bbf7d0' }}>
          <div style={{ fontSize:'0.7rem',fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',color:'#15803d',marginBottom:'0.35rem' }}>Pro Tip</div>
          <p style={{ fontSize:'0.85rem',color:'#166534',margin:0 }}>{ex.tips}</p>
        </div>
      </div>
    </div>
  );
}

export default function Exercises() {
  const [all, setAll] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [category, setCategory] = useState('all');
  const [level, setLevel] = useState('all');
  const [equipment, setEquipment] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    exercisesAPI.getAll().then(r=>{ setAll(r.data.exercises); setFiltered(r.data.exercises); }).catch(()=>{}).finally(()=>setLoading(false));
  },[]);

  useEffect(() => {
    let list = all;
    if (category!=='all') list=list.filter(e=>e.category===category);
    if (level!=='all') list=list.filter(e=>e.level===level);
    if (equipment!=='all') list=list.filter(e=>e.equipment===equipment);
    if (search) { const s=search.toLowerCase(); list=list.filter(e=>e.name.toLowerCase().includes(s)||e.muscles.some(m=>m.toLowerCase().includes(s))); }
    setFiltered(list);
  },[category,level,equipment,search,all]);

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Exercise Library</h1>
          <p className="page-subtitle">{filtered.length} exercises with step-by-step instructions</p>
        </div>
      </div>

      {/* Search */}
      <div className="input-icon-wrap" style={{ maxWidth:420,marginBottom:'1.25rem' }}>
        <IconSearch size={16} className="input-icon"/>
        <input placeholder="Search exercises or muscles..." value={search} onChange={e=>setSearch(e.target.value)}/>
      </div>

      {/* Category pills */}
      <div className="scroll-x" style={{ marginBottom:'1rem' }}>
        <div style={{ display:'flex',gap:'0.375rem',paddingBottom:'2px' }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={()=>setCategory(c)}
              style={{ padding:'0.4rem 0.875rem',borderRadius:'var(--radius-full)',border:`1.5px solid ${category===c?'var(--accent-primary)':'var(--gray-200)'}`,background:category===c?'var(--brand-50)':'var(--gray-0)',color:category===c?'var(--accent-primary)':'var(--gray-500)',fontSize:'0.78rem',fontWeight:500,cursor:'pointer',whiteSpace:'nowrap',textTransform:'capitalize',transition:'all 0.15s' }}>
              {CAT_LABEL[c]}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div style={{ display:'flex',gap:'0.625rem',marginBottom:'1.5rem',flexWrap:'wrap' }}>
        <select value={level} onChange={e=>setLevel(e.target.value)} style={{ width:'auto',minWidth:150 }}>
          {LEVELS.map(l=><option key={l} value={l}>{l==='all'?'All Levels':l.charAt(0).toUpperCase()+l.slice(1)}</option>)}
        </select>
        <select value={equipment} onChange={e=>setEquipment(e.target.value)} style={{ width:'auto',minWidth:160 }}>
          {EQUIPMENT.map(e=><option key={e} value={e}>{e==='all'?'All Equipment':e.charAt(0).toUpperCase()+e.slice(1)}</option>)}
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:'1.25rem' }}>
          {[...Array(6)].map((_,i)=><div key={i} className="skeleton" style={{ height:160 }}/>)}
        </div>
      ) : filtered.length===0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><IconSearch size={24} color="var(--gray-400)"/></div>
          <h3>No exercises found</h3>
          <p>Try adjusting your filters or search term.</p>
        </div>
      ) : (
        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:'1.25rem' }}>
          {filtered.map((ex,i)=>(
            <div key={ex.id} className="animate-fade-up" style={{ animationDelay:`${Math.min(i,12)*0.03}s` }}>
              <ExerciseCard ex={ex} onClick={setSelected}/>
            </div>
          ))}
        </div>
      )}
      {selected && <ExerciseModal ex={selected} onClose={()=>setSelected(null)}/>}
    </div>
  );
}
