import React, { useState, useEffect } from 'react';
import { nutrition as nutritionAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { IconNutrition, IconDroplet, IconPlus, IconX, IconCheck } from '../components/Icons';
import toast from 'react-hot-toast';

const MEAL_TYPES = ['breakfast','lunch','dinner','snack','pre_workout','post_workout'];
const MEAL_LABELS = { breakfast:'Breakfast',lunch:'Lunch',dinner:'Dinner',snack:'Snack',pre_workout:'Pre Workout',post_workout:'Post Workout' };
const MEAL_COLORS = { breakfast:'#fffbeb',lunch:'#f0fdf4',dinner:'#eff6ff',snack:'#fdf4ff',pre_workout:'#fff7ed',post_workout:'#f0fdf4' };
const MEAL_BORDER = { breakfast:'#fde68a',lunch:'#bbf7d0',dinner:'#bfdbfe',snack:'#e9d5ff',pre_workout:'#fed7aa',post_workout:'#bbf7d0' };

const FOOD_DB = [
  {name:'Chicken Breast (100g)',calories:165,protein:31,carbs:0,fat:3.6,fiber:0},
  {name:'Brown Rice (100g cooked)',calories:123,protein:2.7,carbs:25.6,fat:1,fiber:1.8},
  {name:'Oats (100g dry)',calories:389,protein:16.9,carbs:66.3,fat:6.9,fiber:10.6},
  {name:'Eggs (1 large)',calories:78,protein:6,carbs:0.6,fat:5,fiber:0},
  {name:'Banana (1 medium)',calories:89,protein:1.1,carbs:23,fat:0.3,fiber:2.6},
  {name:'Whey Protein (30g scoop)',calories:120,protein:24,carbs:3,fat:1.5,fiber:0},
  {name:'Almonds (30g)',calories:174,protein:6,carbs:6,fat:15,fiber:3.5},
  {name:'Sweet Potato (100g)',calories:86,protein:1.6,carbs:20,fat:0.1,fiber:3},
  {name:'Broccoli (100g)',calories:34,protein:2.8,carbs:7,fat:0.4,fiber:2.6},
  {name:'Salmon (100g)',calories:208,protein:20,carbs:0,fat:13,fiber:0},
  {name:'Greek Yogurt (150g)',calories:131,protein:18,carbs:7.5,fat:3,fiber:0},
  {name:'Lentils / Dal (100g cooked)',calories:116,protein:9,carbs:20,fat:0.4,fiber:7.9},
  {name:'Avocado (100g)',calories:160,protein:2,carbs:9,fat:15,fiber:7},
  {name:'Milk whole (250ml)',calories:149,protein:8,carbs:12,fat:8,fiber:0},
  {name:'Paneer (100g)',calories:265,protein:18,carbs:1.2,fat:21,fiber:0},
  {name:'Chapati (1 medium)',calories:120,protein:3,carbs:22,fat:2.5,fiber:2},
  {name:'Rice (100g cooked)',calories:130,protein:2.7,carbs:28,fat:0.3,fiber:0.4},
  {name:'Tuna (100g canned)',calories:116,protein:26,carbs:0,fat:1,fiber:0},
  {name:'Peanut Butter (30g)',calories:188,protein:8,carbs:6,fat:16,fiber:2},
  {name:'Tofu (100g)',calories:76,protein:8,carbs:2,fat:4.5,fiber:0.3},
];

const DIET_TIPS = [
  {Icon:IconDroplet,color:'blue',title:'Stay Hydrated',tip:'Drink 2–3L of water daily. Start each morning with 500ml before coffee or food.'},
  {Icon:IconNutrition,color:'green',title:'Protein Timing',tip:'Eat protein within 30–60 min post-workout to maximise muscle protein synthesis.'},
  {Icon:IconNutrition,color:'amber',title:'Protein Target',tip:'Aim for 1.6–2.2g of protein per kg bodyweight for muscle building.'},
  {Icon:IconNutrition,color:'green',title:'Fibre Intake',tip:'Target 25–35g fibre daily for gut health, satiety, and stable blood sugar.'},
  {Icon:IconNutrition,color:'purple',title:'Pre-Sleep Meal',tip:'Casein protein (cottage cheese, Greek yogurt) before bed aids overnight muscle repair.'},
  {Icon:IconNutrition,color:'amber',title:'Pre-Workout Fuel',tip:'Carbs + protein 1–2 hours before training for peak energy and performance.'},
];

const ICON_BG    = {blue:'#eff6ff',green:'#f0fdf4',amber:'#fffbeb',purple:'#f5f3ff'};
const ICON_COLOR = {blue:'#2563eb',green:'#16a34a',amber:'#d97706',purple:'#7c3aed'};

function MealLogger({ dayLog, calorieGoal, proteinGoal, onSave }) {
  const [meals, setMeals] = useState(dayLog?.meals||[]);
  const [water, setWater] = useState(dayLog?.waterIntake||0);
  const [addingMeal, setAddingMeal] = useState(null);
  const [foodSearch, setFoodSearch] = useState('');
  const [selectedFoods, setSelectedFoods] = useState([]);

  const totals = meals.reduce((acc,m)=>{ (m.foods||[]).forEach(f=>{acc.cal+=f.calories||0;acc.protein+=f.protein||0;acc.carbs+=f.carbs||0;acc.fat+=f.fat||0;}); return acc; },{cal:0,protein:0,carbs:0,fat:0});

  const addMeal = (type) => {
    if (selectedFoods.length===0) return toast.error('Select at least one food');
    const foods=selectedFoods.map(f=>({...f,quantity:1,unit:'serving'}));
    const meal={type,time:new Date().toTimeString().slice(0,5),foods,totalCalories:foods.reduce((s,f)=>s+f.calories,0),totalProtein:foods.reduce((s,f)=>s+f.protein,0),totalCarbs:foods.reduce((s,f)=>s+f.carbs,0),totalFat:foods.reduce((s,f)=>s+f.fat,0)};
    const updated=[...meals,meal]; setMeals(updated);
    setAddingMeal(null); setSelectedFoods([]); setFoodSearch('');
    const t=updated.reduce((a,m)=>{(m.foods||[]).forEach(f=>{a.cal+=f.calories||0;a.protein+=f.protein||0;a.carbs+=f.carbs||0;a.fat+=f.fat||0;});return a;},{cal:0,protein:0,carbs:0,fat:0});
    onSave({meals:updated,waterIntake:water,totalCalories:t.cal,totalProtein:t.protein,totalCarbs:t.carbs,totalFat:t.fat});
    toast.success('Meal logged!');
  };

  const filteredFoods = FOOD_DB.filter(f=>f.name.toLowerCase().includes(foodSearch.toLowerCase()));
  const calPct = Math.min(100,Math.round((totals.cal/calorieGoal)*100));
  const proteinPct = Math.min(100,Math.round((totals.protein/proteinGoal)*100));

  return (
    <div>
      {/* Macro summary */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'0.75rem',marginBottom:'1.5rem'}}>
        {[
          {label:'Calories',value:Math.round(totals.cal),unit:'kcal',pct:calPct,color:'blue'},
          {label:'Protein', value:Math.round(totals.protein),unit:'g',pct:proteinPct,color:'green'},
          {label:'Carbs',   value:Math.round(totals.carbs),unit:'g',pct:null,color:'amber'},
          {label:'Fat',     value:Math.round(totals.fat),unit:'g',pct:null,color:'purple'},
        ].map(s=>(
          <div key={s.label} className="stat-card">
            <div className="stat-label">{s.label}</div>
            <div style={{display:'flex',alignItems:'baseline',gap:2,marginBottom:s.pct!=null?'0.5rem':0}}>
              <span className="stat-value" style={{fontSize:'1.5rem',color:ICON_COLOR[s.color]}}>{s.value}</span>
              <span className="stat-unit">{s.unit}</span>
            </div>
            {s.pct!=null && <div className="progress-bar"><div className={`progress-fill ${s.color==='green'?'green':s.color==='amber'?'amber':''}`} style={{width:`${s.pct}%`}}/></div>}
          </div>
        ))}
      </div>

      {/* Water */}
      <div className="card" style={{marginBottom:'1.25rem'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'0.625rem'}}>
          <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
            <div style={{width:28,height:28,borderRadius:'var(--radius-md)',background:'#eff6ff',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <IconDroplet size={15} color="#2563eb" filled={water>1500}/>
            </div>
            <span style={{fontWeight:500,fontSize:'0.87rem',color:'var(--gray-800)'}}>Water Intake</span>
          </div>
          <span style={{fontSize:'0.83rem',color:'var(--gray-500)'}}>{water}ml / 2500ml</span>
        </div>
        <div className="progress-bar" style={{marginBottom:'0.75rem'}}>
          <div className="progress-fill" style={{width:`${Math.min(100,(water/2500)*100)}%`,background:'linear-gradient(90deg,#3b82f6,#60a5fa)'}}/>
        </div>
        <div style={{display:'flex',gap:'0.4rem',flexWrap:'wrap'}}>
          {[250,500,750,1000].map(ml=>(
            <button key={ml} className="btn btn-secondary btn-sm" onClick={()=>{const nw=Math.min(5000,water+ml);setWater(nw);onSave({meals,waterIntake:nw});}}>+{ml}ml</button>
          ))}
          <button className="btn btn-ghost btn-sm" onClick={()=>{setWater(0);onSave({meals,waterIntake:0});}}>Reset</button>
        </div>
      </div>

      {/* Log meal buttons */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}>
        <h4>Today's Meals</h4>
        <div className="scroll-x" style={{display:'flex',gap:'0.375rem'}}>
          {MEAL_TYPES.map(mt=>(
            <button key={mt} className="btn btn-secondary btn-sm" style={{fontSize:'0.73rem',whiteSpace:'nowrap'}} onClick={()=>setAddingMeal(mt)}>
              + {MEAL_LABELS[mt]}
            </button>
          ))}
        </div>
      </div>

      {/* Add meal panel */}
      {addingMeal && (
        <div className="card" style={{marginBottom:'1rem',border:`1.5px solid ${MEAL_BORDER[addingMeal]}`,background:MEAL_COLORS[addingMeal]}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.75rem'}}>
            <span style={{fontWeight:600,fontSize:'0.9rem',color:'var(--gray-900)'}}>{MEAL_LABELS[addingMeal]}</span>
            <button className="btn btn-ghost btn-sm" style={{padding:'2px'}} onClick={()=>{setAddingMeal(null);setSelectedFoods([]);}}><IconX size={14}/></button>
          </div>
          <input placeholder="Search foods..." value={foodSearch} onChange={e=>setFoodSearch(e.target.value)} style={{marginBottom:'0.75rem'}}/>
          <div style={{maxHeight:200,overflowY:'auto',marginBottom:'0.75rem',display:'flex',flexDirection:'column',gap:'0.3rem'}}>
            {filteredFoods.map((f,i)=>{
              const isSel=selectedFoods.some(s=>s.name===f.name);
              return (
                <div key={i} onClick={()=>setSelectedFoods(s=>isSel?s.filter(x=>x.name!==f.name):[...s,f])}
                  style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0.55rem 0.75rem',borderRadius:'var(--radius-md)',cursor:'pointer',background:isSel?'var(--gray-0)':'transparent',border:`1.5px solid ${isSel?'var(--accent-primary)':'transparent'}`,transition:'all 0.15s'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
                    {isSel && <IconCheck size={13} color="var(--accent-primary)"/>}
                    <span style={{fontSize:'0.83rem',color:'var(--gray-800)',fontWeight:isSel?500:400}}>{f.name}</span>
                  </div>
                  <span style={{fontSize:'0.73rem',color:'var(--gray-400)'}}>{f.calories} kcal · P:{f.protein}g</span>
                </div>
              );
            })}
          </div>
          {selectedFoods.length>0 && (
            <div style={{fontSize:'0.78rem',color:'var(--gray-500)',marginBottom:'0.625rem'}}>
              Selected: {selectedFoods.map(f=>f.name.split('(')[0].trim()).join(', ')}
            </div>
          )}
          <button className="btn btn-primary btn-sm" onClick={()=>addMeal(addingMeal)} style={{justifyContent:'center'}}>Log Meal</button>
        </div>
      )}

      {/* Meals list */}
      {meals.length===0 ? (
        <div className="empty-state" style={{padding:'2rem'}}>
          <div className="empty-state-icon"><IconNutrition size={24} color="var(--gray-400)"/></div>
          <h3>No meals logged yet</h3>
          <p>Start tracking your nutrition above.</p>
        </div>
      ) : meals.map((meal,i)=>(
        <div key={i} className="card" style={{marginBottom:'0.75rem',padding:'1rem',border:`1.5px solid ${MEAL_BORDER[meal.type]}`,background:MEAL_COLORS[meal.type]}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.5rem'}}>
            <span style={{fontWeight:600,color:'var(--gray-900)',fontSize:'0.87rem'}}>{MEAL_LABELS[meal.type]}</span>
            <div style={{display:'flex',gap:'0.75rem',fontSize:'0.75rem',color:'var(--gray-500)'}}>
              <span>{Math.round(meal.totalCalories||0)} kcal</span>
              <span>P: {Math.round(meal.totalProtein||0)}g</span>
              {meal.time && <span>{meal.time}</span>}
            </div>
          </div>
          {meal.foods.map((f,fi)=>(
            <div key={fi} style={{fontSize:'0.78rem',color:'var(--gray-500)',paddingLeft:'0.875rem',borderLeft:'2px solid var(--gray-200)',marginBottom:'0.2rem'}}>{f.name} — {f.calories} kcal</div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function NutritionPlanner() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('today');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{ nutritionAPI.getAll().then(r=>setLogs(r.data.logs||[])).catch(()=>{}).finally(()=>setLoading(false)); },[]);

  const saveLog = async (data) => {
    try {
      const today=new Date().toISOString().split('T')[0];
      const existing=logs.find(l=>l.date?.startsWith(today)||l.createdAt?.startsWith(today));
      if (existing) {
        await nutritionAPI.update(existing._id||existing.id,{...data,date:new Date()});
        setLogs(ls=>ls.map(l=>(l._id||l.id)===(existing._id||existing.id)?{...l,...data}:l));
      } else {
        const res=await nutritionAPI.create({...data,date:new Date()});
        setLogs(ls=>[res.data.log,...ls]);
      }
    } catch {}
  };

  const calorieGoal = user?.stats?.weight ? Math.round(user.stats.weight*33) : 2200;
  const proteinGoal = user?.stats?.weight ? Math.round(user.stats.weight*1.8) : 150;

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Nutrition Planner</h1>
          <p className="page-subtitle">Track meals · Monitor macros · Optimise fuelling</p>
        </div>
        <div style={{textAlign:'right',fontSize:'0.78rem',color:'var(--gray-400)'}}>
          <div>Goal: <strong style={{color:'var(--accent-primary)'}}>{calorieGoal} kcal</strong></div>
          <div>Protein: <strong style={{color:'var(--green-600)'}}>{proteinGoal}g</strong></div>
        </div>
      </div>

      <div className="tabs" style={{maxWidth:340,marginBottom:'1.5rem'}}>
        <button className={`tab ${activeTab==='today'?'active':''}`} onClick={()=>setActiveTab('today')}>Today's Log</button>
        <button className={`tab ${activeTab==='tips'?'active':''}`} onClick={()=>setActiveTab('tips')}>Diet Tips</button>
      </div>

      {activeTab==='today' && (
        loading
          ? <div style={{display:'flex',justifyContent:'center',padding:'4rem'}}><div className="spinner"/></div>
          : <MealLogger dayLog={logs[0]} calorieGoal={calorieGoal} proteinGoal={proteinGoal} onSave={saveLog}/>
      )}

      {activeTab==='tips' && (
        <div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:'1.25rem',marginBottom:'2rem'}}>
            {DIET_TIPS.map((tip,i)=>(
              <div key={i} className="card animate-fade-up" style={{animationDelay:`${i*0.05}s`}}>
                <div style={{width:42,height:42,borderRadius:'var(--radius-lg)',background:ICON_BG[tip.color],display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'1rem'}}>
                  <tip.Icon size={21} color={ICON_COLOR[tip.color]}/>
                </div>
                <h3 style={{fontFamily:'var(--font-display)',fontSize:'1.15rem',marginBottom:'0.4rem'}}>{tip.title}</h3>
                <p style={{fontSize:'0.85rem',lineHeight:1.7}}>{tip.tip}</p>
              </div>
            ))}
          </div>
          <div className="card">
            <h3 style={{fontFamily:'var(--font-display)',fontSize:'1.3rem',marginBottom:'1.25rem'}}>Understanding Macronutrients</h3>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'1rem'}}>
              {[
                {name:'Protein',kcal:'4 kcal/g',role:'Muscle repair, enzymes, immune function',sources:'Chicken, fish, eggs, dairy, legumes',color:'green'},
                {name:'Carbohydrates',kcal:'4 kcal/g',role:'Primary energy source, brain fuel, glycogen',sources:'Rice, oats, sweet potato, fruits, veg',color:'amber'},
                {name:'Fats',kcal:'9 kcal/g',role:'Hormone production, vitamin absorption',sources:'Avocado, nuts, olive oil, fatty fish',color:'purple'},
              ].map(m=>(
                <div key={m.name} style={{padding:'1rem',borderRadius:'var(--radius-lg)',background:ICON_BG[m.color],border:`1px solid ${MEAL_BORDER[m.name==='Protein'?'lunch':m.name==='Carbohydrates'?'breakfast':'snack']||'var(--gray-200)'}`}}>
                  <div style={{fontWeight:600,color:ICON_COLOR[m.color],marginBottom:'0.2rem',fontSize:'0.9rem'}}>{m.name}</div>
                  <div style={{fontSize:'0.72rem',color:'var(--gray-400)',marginBottom:'0.5rem'}}>{m.kcal}</div>
                  <p style={{fontSize:'0.8rem',marginBottom:'0.4rem',lineHeight:1.5,color:'var(--gray-600)'}}>{m.role}</p>
                  <div style={{fontSize:'0.73rem',color:'var(--gray-400)'}}>Sources: {m.sources}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
