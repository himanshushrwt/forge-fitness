import React, { useState, useEffect } from 'react';
import { nutrition as nutritionAPI, dietplan as dietplanAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { IconNutrition, IconDroplet, IconPlus, IconX, IconCheck, IconBell, IconEdit, IconTrash } from '../components/Icons';
import toast from 'react-hot-toast';

const MEAL_TYPES = ['breakfast','lunch','dinner','snack','pre_workout','post_workout'];
const MEAL_LABELS = { breakfast:'Breakfast', lunch:'Lunch', dinner:'Dinner', snack:'Snack', pre_workout:'Pre Workout', post_workout:'Post Workout' };
const MEAL_COLORS = { breakfast:'#fffbeb', lunch:'#f0fdf4', dinner:'#eff6ff', snack:'#fdf4ff', pre_workout:'#fff7ed', post_workout:'#f0fdf4' };
const MEAL_BORDER = { breakfast:'#fde68a', lunch:'#bbf7d0', dinner:'#bfdbfe', snack:'#e9d5ff', pre_workout:'#fed7aa', post_workout:'#bbf7d0' };

// Food database with countable items
const FOOD_DB = [
  { name:'Chicken Breast (100g)', calories:165, protein:31, carbs:0, fat:3.6, fiber:0, unit:'g', countable:false },
  { name:'Brown Rice (100g cooked)', calories:123, protein:2.7, carbs:25.6, fat:1, fiber:1.8, unit:'g', countable:false },
  { name:'Oats (100g dry)', calories:389, protein:16.9, carbs:66.3, fat:6.9, fiber:10.6, unit:'g', countable:false },
  { name:'Egg', calories:78, protein:6, carbs:0.6, fat:5, fiber:0, unit:'piece', countable:true, defaultQty:1 },
  { name:'Banana', calories:89, protein:1.1, carbs:23, fat:0.3, fiber:2.6, unit:'piece', countable:true, defaultQty:1 },
  { name:'Apple', calories:52, protein:0.3, carbs:14, fat:0.2, fiber:2.4, unit:'piece', countable:true, defaultQty:1 },
  { name:'Orange', calories:47, protein:0.9, carbs:12, fat:0.1, fiber:2.4, unit:'piece', countable:true, defaultQty:1 },
  { name:'Whey Protein (30g scoop)', calories:120, protein:24, carbs:3, fat:1.5, fiber:0, unit:'scoop', countable:true, defaultQty:1 },
  { name:'Almonds', calories:7, protein:0.25, carbs:0.25, fat:0.6, fiber:0.15, unit:'piece', countable:true, defaultQty:10 },
  { name:'Cashews', calories:9, protein:0.3, carbs:0.5, fat:0.7, fiber:0.1, unit:'piece', countable:true, defaultQty:10 },
  { name:'Dates', calories:23, protein:0.2, carbs:6, fat:0, fiber:0.6, unit:'piece', countable:true, defaultQty:3 },
  { name:'Sweet Potato (100g)', calories:86, protein:1.6, carbs:20, fat:0.1, fiber:3, unit:'g', countable:false },
  { name:'Broccoli (100g)', calories:34, protein:2.8, carbs:7, fat:0.4, fiber:2.6, unit:'g', countable:false },
  { name:'Salmon (100g)', calories:208, protein:20, carbs:0, fat:13, fiber:0, unit:'g', countable:false },
  { name:'Greek Yogurt (150g)', calories:131, protein:18, carbs:7.5, fat:3, fiber:0, unit:'g', countable:false },
  { name:'Lentils / Dal (100g cooked)', calories:116, protein:9, carbs:20, fat:0.4, fiber:7.9, unit:'g', countable:false },
  { name:'Paneer (100g)', calories:265, protein:18, carbs:1.2, fat:21, fiber:0, unit:'g', countable:false },
  { name:'Chapati', calories:120, protein:3, carbs:22, fat:2.5, fiber:2, unit:'piece', countable:true, defaultQty:2 },
  { name:'Rice (100g cooked)', calories:130, protein:2.7, carbs:28, fat:0.3, fiber:0.4, unit:'g', countable:false },
  { name:'Peanut Butter (30g)', calories:188, protein:8, carbs:6, fat:16, fiber:2, unit:'g', countable:false },
  { name:'Milk (250ml)', calories:149, protein:8, carbs:12, fat:8, fiber:0, unit:'ml', countable:false },
  { name:'Walnut', calories:26, protein:0.6, carbs:0.5, fat:2.6, fiber:0.3, unit:'piece', countable:true, defaultQty:5 },
];

const DIET_TIPS = [
  { Icon:IconDroplet, color:'blue', title:'Stay Hydrated', tip:'Drink 2–3L of water daily. Start each morning with 500ml before coffee or food.' },
  { Icon:IconNutrition, color:'green', title:'Protein Timing', tip:'Eat protein within 30–60 min post-workout to maximise muscle protein synthesis.' },
  { Icon:IconNutrition, color:'amber', title:'Protein Target', tip:'Aim for 1.6–2.2g of protein per kg bodyweight for muscle building.' },
  { Icon:IconNutrition, color:'green', title:'Fibre Intake', tip:'Target 25–35g fibre daily for gut health, satiety, and stable blood sugar.' },
  { Icon:IconNutrition, color:'purple', title:'Pre-Sleep Meal', tip:'Casein protein (cottage cheese, Greek yogurt) before bed aids overnight muscle repair.' },
  { Icon:IconNutrition, color:'amber', title:'Pre-Workout Fuel', tip:'Carbs + protein 1–2 hours before training for peak energy and performance.' },
];

const ICON_BG = { blue:'#eff6ff', green:'#f0fdf4', amber:'#fffbeb', purple:'#f5f3ff' };
const ICON_COLOR = { blue:'#2563eb', green:'#16a34a', amber:'#d97706', purple:'#7c3aed' };

// Counter component for countable items
function ItemCounter({ item, quantity, onChange }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
      <button onClick={() => onChange(Math.max(1, quantity - 1))}
        style={{ width:28, height:28, borderRadius:'50%', border:'1.5px solid var(--gray-200)', background:'var(--gray-0)', cursor:'pointer', fontSize:'1rem', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700 }}>−</button>
      <span style={{ minWidth:28, textAlign:'center', fontWeight:600, fontSize:'0.9rem', color:'var(--gray-900)' }}>{quantity}</span>
      <button onClick={() => onChange(quantity + 1)}
        style={{ width:28, height:28, borderRadius:'50%', border:'1.5px solid var(--accent-primary)', background:'var(--brand-50)', cursor:'pointer', fontSize:'1rem', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:'var(--accent-primary)' }}>+</button>
      <span style={{ fontSize:'0.73rem', color:'var(--gray-400)' }}>{item.unit}</span>
    </div>
  );
}

// Diet Planner with reminders
function DietPlanner({ userEmail }) {
  const [planName, setPlanName] = useState('My Weekly Diet Plan');
  const [meals, setMeals] = useState([
    { id:1, type:'breakfast', time:'08:00', items:[], reminderEnabled:false },
    { id:2, type:'lunch', time:'13:00', items:[], reminderEnabled:false },
    { id:3, type:'dinner', time:'19:00', items:[], reminderEnabled:false },
  ]);
  const [addingTo, setAddingTo] = useState(null);
  const [foodSearch, setFoodSearch] = useState('');
  const [selectedFood, setSelectedFood] = useState(null);
  const [foodQty, setFoodQty] = useState(1);
  const [email, setEmail] = useState(userEmail || '');
  const [saving, setSaving] = useState(false);
  const [sendingReminder, setSendingReminder] = useState(null);

  const filteredFoods = FOOD_DB.filter(f => !foodSearch || f.name.toLowerCase().includes(foodSearch.toLowerCase()));

  const addItem = (mealId) => {
    if (!selectedFood) return;
    const food = FOOD_DB.find(f => f.name === selectedFood);
    if (!food) return;
    const qty = food.countable ? foodQty : foodQty;
    const multiplier = food.countable ? qty : qty / 100;
    const item = {
      id: Date.now(),
      name: food.name,
      quantity: qty,
      unit: food.unit,
      countable: food.countable,
      calories: Math.round(food.calories * (food.countable ? qty : qty / 100)),
      protein: parseFloat((food.protein * multiplier).toFixed(1)),
      carbs: parseFloat((food.carbs * multiplier).toFixed(1)),
      fat: parseFloat((food.fat * multiplier).toFixed(1)),
    };
    setMeals(ms => ms.map(m => m.id === mealId ? { ...m, items: [...m.items, item] } : m));
    setSelectedFood(null); setFoodQty(1); setFoodSearch(''); setAddingTo(null);
    toast.success(`${food.name} added!`);
  };

  const removeItem = (mealId, itemId) => {
    setMeals(ms => ms.map(m => m.id === mealId ? { ...m, items: m.items.filter(i => i.id !== itemId) } : m));
  };

  const updateQty = (mealId, itemId, newQty) => {
    setMeals(ms => ms.map(m => m.id === mealId ? {
      ...m, items: m.items.map(i => {
        if (i.id !== itemId) return i;
        const food = FOOD_DB.find(f => f.name === i.name);
        if (!food) return { ...i, quantity: newQty };
        const mult = food.countable ? newQty : newQty / 100;
        return { ...i, quantity: newQty, calories: Math.round(food.calories * mult), protein: parseFloat((food.protein * mult).toFixed(1)), carbs: parseFloat((food.carbs * mult).toFixed(1)), fat: parseFloat((food.fat * mult).toFixed(1)) };
      })
    } : m));
  };

  const savePlan = async () => {
    setSaving(true);
    try {
      await dietplanAPI.save({ name: planName, meals });
      toast.success('Diet plan saved!');
    } catch { toast.error('Could not save plan.'); }
    finally { setSaving(false); }
  };

  const sendReminder = async (meal) => {
    if (!email) return toast.error('Enter your email first');
    setSendingReminder(meal.id);
    try {
      await dietplanAPI.remind({ email, mealName: MEAL_LABELS[meal.type], time: meal.time, items: meal.items });
      toast.success(`Reminder set for ${MEAL_LABELS[meal.type]} at ${meal.time}!`);
      setMeals(ms => ms.map(m => m.id === meal.id ? { ...m, reminderEnabled: true } : m));
    } catch { toast.error('Could not set reminder.'); }
    finally { setSendingReminder(null); }
  };

  const addMeal = () => {
    setMeals(ms => [...ms, { id: Date.now(), type: 'snack', time: '15:00', items: [], reminderEnabled: false }]);
  };

  const totalCalories = meals.reduce((s, m) => s + m.items.reduce((ss, i) => ss + (i.calories || 0), 0), 0);
  const totalProtein = meals.reduce((s, m) => s + m.items.reduce((ss, i) => ss + (i.protein || 0), 0), 0);

  return (
    <div>
      {/* Plan header */}
      <div className="card" style={{ marginBottom:'1.5rem' }}>
        <div style={{ display:'flex', gap:'1rem', alignItems:'center', marginBottom:'1rem', flexWrap:'wrap' }}>
          <div style={{ flex:1, minWidth:200 }}>
            <label className="form-label">Plan Name</label>
            <input value={planName} onChange={e => setPlanName(e.target.value)} placeholder="My Diet Plan" />
          </div>
          <div style={{ flex:1, minWidth:200 }}>
            <label className="form-label">Your Email (for reminders)</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
        </div>
        <div style={{ display:'flex', gap:'0.75rem', alignItems:'center', flexWrap:'wrap' }}>
          <div style={{ display:'flex', gap:'1.5rem', flex:1 }}>
            <div><span style={{ fontSize:'0.75rem', color:'var(--gray-400)' }}>Total Calories</span><div style={{ fontFamily:'var(--font-display)', fontSize:'1.4rem', color:'var(--accent-primary)' }}>{Math.round(totalCalories)}</div></div>
            <div><span style={{ fontSize:'0.75rem', color:'var(--gray-400)' }}>Total Protein</span><div style={{ fontFamily:'var(--font-display)', fontSize:'1.4rem', color:'var(--green-600)' }}>{totalProtein.toFixed(1)}g</div></div>
          </div>
          <button className="btn btn-primary" onClick={savePlan} disabled={saving} style={{ justifyContent:'center' }}>
            {saving ? 'Saving...' : 'Save Plan'}
          </button>
        </div>
      </div>

      {/* Meals */}
      {meals.map(meal => {
        const mealCalories = meal.items.reduce((s, i) => s + (i.calories || 0), 0);
        return (
          <div key={meal.id} className="card" style={{ marginBottom:'1rem', borderLeft:`3px solid ${MEAL_BORDER[meal.type] || 'var(--gray-200)'}` }}>
            <div style={{ display:'flex', alignItems:'center', gap:'1rem', marginBottom:'1rem', flexWrap:'wrap' }}>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', flexWrap:'wrap' }}>
                  <select value={meal.type} onChange={e => setMeals(ms => ms.map(m => m.id === meal.id ? { ...m, type: e.target.value } : m))}
                    style={{ width:'auto', fontWeight:600, fontSize:'0.87rem', border:'none', background:'transparent', color:'var(--gray-900)', padding:0, cursor:'pointer' }}>
                    {MEAL_TYPES.map(t => <option key={t} value={t}>{MEAL_LABELS[t]}</option>)}
                  </select>
                  <input type="time" value={meal.time} onChange={e => setMeals(ms => ms.map(m => m.id === meal.id ? { ...m, time: e.target.value } : m))}
                    style={{ width:'auto', fontSize:'0.83rem', border:'1px solid var(--gray-200)', borderRadius:'var(--radius-sm)', padding:'0.2rem 0.5rem' }} />
                  <span style={{ fontSize:'0.75rem', color:'var(--gray-400)' }}>{Math.round(mealCalories)} kcal</span>
                </div>
              </div>
              <div style={{ display:'flex', gap:'0.5rem' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setAddingTo(meal.id === addingTo ? null : meal.id)}
                  style={{ display:'flex', alignItems:'center', gap:'0.3rem' }}>
                  <IconPlus size={12} /> Add Food
                </button>
                <button
                  className={`btn btn-sm ${meal.reminderEnabled ? 'btn-green' : 'btn-secondary'}`}
                  onClick={() => sendReminder(meal)}
                  disabled={sendingReminder === meal.id}
                  style={{ display:'flex', alignItems:'center', gap:'0.3rem' }}
                  title="Send email reminder for this meal"
                >
                  <IconBell size={12} /> {sendingReminder === meal.id ? 'Sending...' : meal.reminderEnabled ? 'Reminder Set' : 'Set Reminder'}
                </button>
                <button className="btn btn-ghost btn-sm" style={{ color:'var(--red-500)' }}
                  onClick={() => setMeals(ms => ms.filter(m => m.id !== meal.id))}>
                  <IconTrash size={12} />
                </button>
              </div>
            </div>

            {/* Food picker */}
            {addingTo === meal.id && (
              <div style={{ background:'var(--gray-50)', borderRadius:'var(--radius-lg)', border:'1px solid var(--gray-200)', padding:'1rem', marginBottom:'1rem' }}>
                <input placeholder="Search food..." value={foodSearch} onChange={e => setFoodSearch(e.target.value)} style={{ marginBottom:'0.75rem' }} />
                <div style={{ maxHeight:200, overflowY:'auto', marginBottom:'0.75rem' }}>
                  {filteredFoods.map((f, i) => (
                    <div key={i} onClick={() => { setSelectedFood(f.name); setFoodQty(f.countable ? (f.defaultQty || 1) : 100); }}
                      style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.5rem 0.75rem', borderRadius:'var(--radius-md)', cursor:'pointer', background:selectedFood === f.name ? 'var(--brand-50)' : 'transparent', border:`1px solid ${selectedFood === f.name ? 'var(--accent-primary)' : 'transparent'}`, marginBottom:'0.25rem', transition:'all 0.15s' }}>
                      <span style={{ fontSize:'0.83rem', color:'var(--gray-800)', fontWeight:selectedFood === f.name ? 500 : 400 }}>
                        {selectedFood === f.name && '✓ '}{f.name}
                      </span>
                      <span style={{ fontSize:'0.72rem', color:'var(--gray-400)' }}>{f.calories}{f.countable ? ` kcal/${f.unit}` : ' kcal/100g'}</span>
                    </div>
                  ))}
                </div>
                {selectedFood && (() => {
                  const food = FOOD_DB.find(f => f.name === selectedFood);
                  return food ? (
                    <div style={{ display:'flex', alignItems:'center', gap:'1rem', flexWrap:'wrap' }}>
                      <span style={{ fontSize:'0.83rem', fontWeight:500, color:'var(--gray-900)', flex:1 }}>{selectedFood}</span>
                      {food.countable ? (
                        <ItemCounter item={food} quantity={foodQty} onChange={setFoodQty} />
                      ) : (
                        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
                          <input type="number" value={foodQty} onChange={e => setFoodQty(+e.target.value)} style={{ width:80, padding:'0.35rem 0.5rem', fontSize:'0.85rem' }} min={1} />
                          <span style={{ fontSize:'0.75rem', color:'var(--gray-400)' }}>{food.unit}</span>
                        </div>
                      )}
                      <button className="btn btn-primary btn-sm" onClick={() => addItem(meal.id)} style={{ justifyContent:'center' }}>Add</button>
                    </div>
                  ) : null;
                })()}
              </div>
            )}

            {/* Food items */}
            {meal.items.length === 0 ? (
              <p style={{ fontSize:'0.82rem', color:'var(--gray-400)', fontStyle:'italic' }}>No items added yet. Click "Add Food" to start.</p>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:'0.4rem' }}>
                {meal.items.map(item => {
                  const food = FOOD_DB.find(f => f.name === item.name);
                  return (
                    <div key={item.id} style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.5rem 0.75rem', background:'var(--gray-50)', borderRadius:'var(--radius-md)', flexWrap:'wrap' }}>
                      <span style={{ flex:1, fontSize:'0.83rem', fontWeight:500, color:'var(--gray-800)', minWidth:120 }}>{item.name}</span>
                      {food?.countable ? (
                        <ItemCounter item={food} quantity={item.quantity} onChange={qty => updateQty(meal.id, item.id, qty)} />
                      ) : (
                        <div style={{ display:'flex', alignItems:'center', gap:'0.4rem' }}>
                          <input type="number" value={item.quantity} onChange={e => updateQty(meal.id, item.id, +e.target.value)}
                            style={{ width:65, padding:'0.25rem 0.4rem', fontSize:'0.8rem' }} min={1} />
                          <span style={{ fontSize:'0.72rem', color:'var(--gray-400)' }}>{item.unit}</span>
                        </div>
                      )}
                      <span style={{ fontSize:'0.75rem', color:'var(--gray-500)', minWidth:60, textAlign:'right' }}>{item.calories} kcal</span>
                      <span style={{ fontSize:'0.72rem', color:'var(--green-600)', minWidth:40 }}>P:{item.protein}g</span>
                      <button onClick={() => removeItem(meal.id, item.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--gray-300)', padding:2 }}>
                        <IconX size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      <button className="btn btn-secondary" onClick={addMeal} style={{ display:'flex', alignItems:'center', gap:'0.4rem', marginBottom:'1.5rem' }}>
        <IconPlus size={14} /> Add Meal
      </button>
    </div>
  );
}

function MealLogger({ dayLog, calorieGoal, proteinGoal, onSave }) {
  const [meals, setMeals] = useState(dayLog?.meals || []);
  const [water, setWater] = useState(dayLog?.waterIntake || 0);
  const [addingMeal, setAddingMeal] = useState(null);
  const [foodSearch, setFoodSearch] = useState('');
  const [selectedFoods, setSelectedFoods] = useState([]);
  const [quantities, setQuantities] = useState({});

  const totals = meals.reduce((acc, m) => {
    (m.foods || []).forEach(f => { acc.cal += f.calories || 0; acc.protein += f.protein || 0; acc.carbs += f.carbs || 0; acc.fat += f.fat || 0; });
    return acc;
  }, { cal: 0, protein: 0, carbs: 0, fat: 0 });

  const calPct = Math.min(100, Math.round((totals.cal / calorieGoal) * 100));
  const proteinPct = Math.min(100, Math.round((totals.protein / proteinGoal) * 100));

  const addMeal = (type) => {
    if (selectedFoods.length === 0) return toast.error('Select at least one food');
    const foods = selectedFoods.map(fname => {
      const food = FOOD_DB.find(f => f.name === fname);
      const qty = quantities[fname] || (food?.countable ? 1 : 100);
      const mult = food?.countable ? qty : qty / 100;
      return { name: fname, quantity: qty, unit: food?.unit || 'g', calories: Math.round((food?.calories || 0) * mult), protein: parseFloat(((food?.protein || 0) * mult).toFixed(1)), carbs: parseFloat(((food?.carbs || 0) * mult).toFixed(1)), fat: parseFloat(((food?.fat || 0) * mult).toFixed(1)) };
    });
    const meal = { type, time: new Date().toTimeString().slice(0, 5), foods, totalCalories: foods.reduce((s, f) => s + f.calories, 0), totalProtein: foods.reduce((s, f) => s + f.protein, 0), totalCarbs: foods.reduce((s, f) => s + f.carbs, 0), totalFat: foods.reduce((s, f) => s + f.fat, 0) };
    const updated = [...meals, meal];
    setMeals(updated);
    setAddingMeal(null); setSelectedFoods([]); setQuantities({}); setFoodSearch('');
    const t = updated.reduce((a, m) => { (m.foods || []).forEach(f => { a.cal += f.calories || 0; a.protein += f.protein || 0; a.carbs += f.carbs || 0; a.fat += f.fat || 0; }); return a; }, { cal: 0, protein: 0, carbs: 0, fat: 0 });
    onSave({ meals: updated, waterIntake: water, totalCalories: t.cal, totalProtein: t.protein, totalCarbs: t.carbs, totalFat: t.fat });
    toast.success('Meal logged!');
  };

  const filteredFoods = FOOD_DB.filter(f => f.name.toLowerCase().includes(foodSearch.toLowerCase()));

  return (
    <div>
      {/* Macro summary */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'0.75rem', marginBottom:'1.5rem' }}>
        {[
          { label:'Calories', value:Math.round(totals.cal), unit:'kcal', pct:calPct, color:'blue' },
          { label:'Protein', value:totals.protein.toFixed(1), unit:'g', pct:proteinPct, color:'green' },
          { label:'Carbs', value:totals.carbs.toFixed(1), unit:'g', pct:null, color:'amber' },
          { label:'Fat', value:totals.fat.toFixed(1), unit:'g', pct:null, color:'purple' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-label">{s.label}</div>
            <div style={{ display:'flex', alignItems:'baseline', gap:2, marginBottom: s.pct != null ? '0.5rem' : 0 }}>
              <span className="stat-value" style={{ fontSize:'1.5rem', color:ICON_COLOR[s.color] }}>{s.value}</span>
              <span className="stat-unit">{s.unit}</span>
            </div>
            {s.pct != null && <div className="progress-bar"><div className={`progress-fill ${s.color === 'green' ? 'green' : s.color === 'amber' ? 'amber' : ''}`} style={{ width:`${s.pct}%` }} /></div>}
          </div>
        ))}
      </div>

      {/* Water */}
      <div className="card" style={{ marginBottom:'1.25rem' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.625rem' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
            <div style={{ width:28, height:28, borderRadius:'var(--radius-md)', background:'#eff6ff', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <IconDroplet size={15} color="#2563eb" filled={water > 1500} />
            </div>
            <span style={{ fontWeight:500, fontSize:'0.87rem', color:'var(--gray-800)' }}>Water Intake</span>
          </div>
          <span style={{ fontSize:'0.83rem', color:'var(--gray-500)' }}>{water}ml / 2500ml</span>
        </div>
        <div className="progress-bar" style={{ marginBottom:'0.75rem' }}>
          <div className="progress-fill" style={{ width:`${Math.min(100, (water / 2500) * 100)}%`, background:'linear-gradient(90deg,#3b82f6,#60a5fa)' }} />
        </div>
        <div style={{ display:'flex', gap:'0.4rem', flexWrap:'wrap' }}>
          {[250, 500, 750, 1000].map(ml => (
            <button key={ml} className="btn btn-secondary btn-sm" onClick={() => { const nw = Math.min(5000, water + ml); setWater(nw); onSave({ meals, waterIntake: nw }); }}>+{ml}ml</button>
          ))}
          <button className="btn btn-ghost btn-sm" onClick={() => { setWater(0); onSave({ meals, waterIntake: 0 }); }}>Reset</button>
        </div>
      </div>

      {/* Log meal */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
        <h4>Today's Meals</h4>
        <div className="scroll-x" style={{ display:'flex', gap:'0.375rem' }}>
          {MEAL_TYPES.map(mt => (
            <button key={mt} className="btn btn-secondary btn-sm" style={{ fontSize:'0.73rem', whiteSpace:'nowrap' }} onClick={() => setAddingMeal(mt)}>
              + {MEAL_LABELS[mt]}
            </button>
          ))}
        </div>
      </div>

      {addingMeal && (
        <div className="card" style={{ marginBottom:'1rem', border:`1.5px solid ${MEAL_BORDER[addingMeal]}`, background:MEAL_COLORS[addingMeal] }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.75rem' }}>
            <span style={{ fontWeight:600, fontSize:'0.9rem', color:'var(--gray-900)' }}>{MEAL_LABELS[addingMeal]}</span>
            <button className="btn btn-ghost btn-sm" onClick={() => { setAddingMeal(null); setSelectedFoods([]); setQuantities({}); }}><IconX size={14} /></button>
          </div>
          <input placeholder="Search foods..." value={foodSearch} onChange={e => setFoodSearch(e.target.value)} style={{ marginBottom:'0.75rem' }} />
          <div style={{ maxHeight:200, overflowY:'auto', marginBottom:'0.75rem' }}>
            {filteredFoods.map((f, i) => {
              const isSel = selectedFoods.includes(f.name);
              const qty = quantities[f.name] || (f.countable ? (f.defaultQty || 1) : 100);
              return (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.5rem 0.75rem', borderRadius:'var(--radius-md)', marginBottom:'0.25rem', background:isSel ? 'var(--gray-0)' : 'transparent', border:`1px solid ${isSel ? 'var(--accent-primary)' : 'transparent'}`, transition:'all 0.15s' }}>
                  <div onClick={() => setSelectedFoods(s => isSel ? s.filter(x => x !== f.name) : [...s, f.name])}
                    style={{ flex:1, cursor:'pointer', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                    {isSel && <IconCheck size={13} color="var(--accent-primary)" />}
                    <span style={{ fontSize:'0.83rem', color:'var(--gray-800)', fontWeight:isSel ? 500 : 400 }}>{f.name}</span>
                  </div>
                  {isSel && (
                    f.countable ? (
                      <ItemCounter item={f} quantity={qty} onChange={q => setQuantities(qs => ({ ...qs, [f.name]: q }))} />
                    ) : (
                      <div style={{ display:'flex', alignItems:'center', gap:'0.4rem' }}>
                        <input type="number" value={qty} onChange={e => setQuantities(qs => ({ ...qs, [f.name]: +e.target.value }))}
                          style={{ width:65, padding:'0.25rem 0.4rem', fontSize:'0.8rem' }} min={1} />
                        <span style={{ fontSize:'0.72rem', color:'var(--gray-400)' }}>{f.unit}</span>
                      </div>
                    )
                  )}
                  {!isSel && <span style={{ fontSize:'0.72rem', color:'var(--gray-400)' }}>{f.calories}{f.countable ? ` kcal/${f.unit}` : ' kcal/100g'}</span>}
                </div>
              );
            })}
          </div>
          {selectedFoods.length > 0 && (
            <div style={{ fontSize:'0.78rem', color:'var(--gray-500)', marginBottom:'0.625rem' }}>
              Selected: {selectedFoods.join(', ')}
            </div>
          )}
          <button className="btn btn-primary btn-sm" onClick={() => addMeal(addingMeal)} style={{ justifyContent:'center' }}>Log Meal</button>
        </div>
      )}

      {meals.length === 0 ? (
        <div className="empty-state" style={{ padding:'2rem' }}>
          <div className="empty-state-icon"><IconNutrition size={24} color="var(--gray-400)" /></div>
          <h3>No meals logged yet</h3>
          <p>Start tracking your nutrition above.</p>
        </div>
      ) : meals.map((meal, i) => (
        <div key={i} className="card" style={{ marginBottom:'0.75rem', padding:'1rem', border:`1.5px solid ${MEAL_BORDER[meal.type]}`, background:MEAL_COLORS[meal.type] }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.5rem' }}>
            <span style={{ fontWeight:600, color:'var(--gray-900)', fontSize:'0.87rem' }}>{MEAL_LABELS[meal.type]}</span>
            <div style={{ display:'flex', gap:'0.75rem', fontSize:'0.75rem', color:'var(--gray-500)' }}>
              <span>{Math.round(meal.totalCalories || 0)} kcal</span>
              <span>P: {(meal.totalProtein || 0).toFixed(1)}g</span>
              {meal.time && <span>{meal.time}</span>}
            </div>
          </div>
          {meal.foods.map((f, fi) => (
            <div key={fi} style={{ fontSize:'0.78rem', color:'var(--gray-500)', paddingLeft:'0.875rem', borderLeft:'2px solid var(--gray-200)', marginBottom:'0.2rem' }}>
              {f.name} {f.quantity && `× ${f.quantity} ${f.unit || ''}`} — {f.calories} kcal
            </div>
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

  useEffect(() => {
    nutritionAPI.getAll().then(r => setLogs(r.data.logs || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const saveLog = async (data) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const existing = logs.find(l => l.date?.startsWith(today) || l.createdAt?.startsWith(today));
      if (existing) {
        await nutritionAPI.update(existing._id || existing.id, { ...data, date: new Date() });
        setLogs(ls => ls.map(l => (l._id || l.id) === (existing._id || existing.id) ? { ...l, ...data } : l));
      } else {
        const res = await nutritionAPI.create({ ...data, date: new Date() });
        setLogs(ls => [res.data.log, ...ls]);
      }
    } catch {}
  };

  const calorieGoal = user?.stats?.weight ? Math.round(user.stats.weight * 33) : 2200;
  const proteinGoal = user?.stats?.weight ? Math.round(user.stats.weight * 1.8) : 150;

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Nutrition Planner</h1>
          <p className="page-subtitle">Track meals · Plan your diet · Get email reminders</p>
        </div>
        <div style={{ textAlign:'right', fontSize:'0.78rem', color:'var(--gray-400)' }}>
          <div>Goal: <strong style={{ color:'var(--accent-primary)' }}>{calorieGoal} kcal</strong></div>
          <div>Protein: <strong style={{ color:'var(--green-600)' }}>{proteinGoal}g</strong></div>
        </div>
      </div>

      <div className="tabs" style={{ maxWidth:500, marginBottom:'1.5rem' }}>
        <button className={`tab ${activeTab === 'today' ? 'active' : ''}`} onClick={() => setActiveTab('today')}>Today's Log</button>
        <button className={`tab ${activeTab === 'plan' ? 'active' : ''}`} onClick={() => setActiveTab('plan')}>Diet Planner</button>
        <button className={`tab ${activeTab === 'tips' ? 'active' : ''}`} onClick={() => setActiveTab('tips')}>Diet Tips</button>
      </div>

      {activeTab === 'today' && (
        loading
          ? <div style={{ display:'flex', justifyContent:'center', padding:'4rem' }}><div className="spinner" /></div>
          : <MealLogger dayLog={logs[0]} calorieGoal={calorieGoal} proteinGoal={proteinGoal} onSave={saveLog} />
      )}

      {activeTab === 'plan' && <DietPlanner userEmail={user?.email} />}

      {activeTab === 'tips' && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'1.25rem' }}>
          {DIET_TIPS.map((tip, i) => (
            <div key={i} className="card animate-fade-up" style={{ animationDelay:`${i * 0.05}s` }}>
              <div style={{ width:42, height:42, borderRadius:'var(--radius-lg)', background:ICON_BG[tip.color], display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'1rem' }}>
                <tip.Icon size={21} color={ICON_COLOR[tip.color]} />
              </div>
              <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1.15rem', marginBottom:'0.4rem' }}>{tip.title}</h3>
              <p style={{ fontSize:'0.85rem', lineHeight:1.7 }}>{tip.tip}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
