import React, { useState, useRef, useEffect } from 'react';
import { ai as aiAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { IconSend, IconRobot, IconBrain, IconLightning, IconHeart, IconTarget, IconActivity, IconPlus } from '../components/Icons';
import toast from 'react-hot-toast';

const QUICK_PROMPTS = [
  { label:'Workout Plan',    text:'Create a 4-day workout plan for muscle gain' },
  { label:'Meal Plan',       text:'Design a 2500 calorie meal plan for bulking' },
  { label:'Fat Loss Tips',   text:'What are the best exercises for fat loss?' },
  { label:'Progressive Overload', text:'Explain progressive overload to me' },
  { label:'Sleep & Muscle',  text:'How important is sleep for muscle growth?' },
  { label:'Supplements',     text:'What supplements actually work for fitness?' },
  { label:'Stretching',      text:'Best stretches to do after a workout' },
  { label:'Calorie Needs',   text:'How do I calculate my daily calorie needs?' },
];

function Message({ msg }) {
  const isAI = msg.role==='assistant';
  return (
    <div style={{ display:'flex',gap:'0.625rem',alignItems:'flex-start',justifyContent:isAI?'flex-start':'flex-end',marginBottom:'1rem',animation:'fadeUp 0.25s ease both' }}>
      {isAI && (
        <div style={{ width:30,height:30,borderRadius:'50%',flexShrink:0,background:'linear-gradient(135deg,var(--brand-500),var(--brand-700))',display:'flex',alignItems:'center',justifyContent:'center',marginTop:2 }}>
          <IconRobot size={15} color="white"/>
        </div>
      )}
      <div style={{ maxWidth:'75%',background:isAI?'var(--gray-0)':'var(--accent-primary)',color:isAI?'var(--gray-800)':'white',border:isAI?'1.5px solid var(--gray-200)':'none',borderRadius:isAI?'4px 16px 16px 16px':'16px 4px 16px 16px',padding:'0.75rem 1rem',fontSize:'0.87rem',lineHeight:1.75,whiteSpace:'pre-wrap',boxShadow:isAI?'var(--shadow-xs)':'none' }}>
        {msg.content}
        {msg.timestamp && (
          <div style={{ fontSize:'0.68rem',opacity:0.5,marginTop:'0.35rem',textAlign:isAI?'left':'right' }}>
            {new Date(msg.timestamp).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}
          </div>
        )}
      </div>
      {!isAI && (
        <div className="avatar" style={{ flexShrink:0,marginTop:2,width:30,height:30,fontSize:'0.7rem' }}>Y</div>
      )}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div style={{ display:'flex',gap:'0.625rem',alignItems:'flex-start',marginBottom:'1rem' }}>
      <div style={{ width:30,height:30,borderRadius:'50%',flexShrink:0,background:'linear-gradient(135deg,var(--brand-500),var(--brand-700))',display:'flex',alignItems:'center',justifyContent:'center' }}>
        <IconRobot size={15} color="white"/>
      </div>
      <div style={{ background:'var(--gray-0)',border:'1.5px solid var(--gray-200)',borderRadius:'4px 16px 16px 16px',padding:'0.75rem 1rem',display:'flex',gap:5,alignItems:'center',boxShadow:'var(--shadow-xs)' }}>
        {[0,1,2].map(i=>(
          <div key={i} style={{ width:7,height:7,borderRadius:'50%',background:'var(--gray-300)',animation:'pulse 1.2s ease-in-out infinite',animationDelay:`${i*0.2}s` }}/>
        ))}
      </div>
    </div>
  );
}

export default function AICoach() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([{
    role:'assistant',
    content:`Hello ${user?.name?.split(' ')[0]||'Athlete'}! I'm FORGE AI, your personal fitness coach.\n\nI'm here to help you with:\n• Personalised workout plans\n• Nutrition advice and meal plans\n• Progress analysis and goal setting\n• Any fitness question you have\n\nWhat can I help you with today?`,
    timestamp:new Date()
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [planModal, setPlanModal] = useState(false);
  const [plan, setPlan] = useState(null);
  const [planLoading, setPlanLoading] = useState(false);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(()=>{ endRef.current?.scrollIntoView({behavior:'smooth'}); },[messages,loading]);

  const sendMessage = async (text) => {
    const msg = text||input.trim();
    if (!msg||loading) return;
    setInput('');
    const userMsg = { role:'user',content:msg,timestamp:new Date() };
    setMessages(prev=>[...prev,userMsg]);
    setLoading(true);
    try {
      const history = messages.map(m=>({role:m.role,content:m.content}));
      const userContext = { name:user?.name,fitnessLevel:user?.stats?.fitnessLevel,goal:user?.stats?.goal,age:user?.stats?.age,weight:user?.stats?.weight,height:user?.stats?.height };
      const res = await aiAPI.chat({message:msg,history,userContext});
      setMessages(prev=>[...prev,{role:'assistant',content:res.data.response,timestamp:new Date()}]);
    } catch {
      setMessages(prev=>[...prev,{role:'assistant',content:'I am having trouble connecting right now. Please make sure your backend is running and the Anthropic API key is configured in backend/.env\n\nAll other features still work perfectly!',timestamp:new Date()}]);
    } finally { setLoading(false); inputRef.current?.focus(); }
  };

  const generatePlan = async (type) => {
    setPlan(null); setPlanModal(true); setPlanLoading(true);
    try {
      const res = await aiAPI.generatePlan({ type, userProfile:{goal:user?.stats?.goal,fitnessLevel:user?.stats?.fitnessLevel,weight:user?.stats?.weight,height:user?.stats?.height,age:user?.stats?.age}, preferences:{daysPerWeek:4,equipment:'Full gym',timePerSession:60,dietary:'No restrictions'} });
      setPlan(res.data.raw);
    } catch { toast.error('Could not generate plan. Check API key.'); setPlanModal(false); }
    finally { setPlanLoading(false); }
  };

  return (
    <div className="page-container animate-fade-in" style={{ display:'flex',flexDirection:'column',height:'calc(100vh - 0px)',paddingBottom:0 }}>
      <div className="page-header" style={{ marginBottom:'1rem' }}>
        <div>
          <h1 className="page-title">AI Coach</h1>
          <p className="page-subtitle">Powered by Claude AI · Your 24/7 personal trainer</p>
        </div>
        <div style={{ display:'flex',gap:'0.5rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={()=>generatePlan('workout')}>
            <IconLightning size={13}/> Workout Plan
          </button>
          <button className="btn btn-secondary btn-sm" onClick={()=>generatePlan('nutrition')}>
            <IconTarget size={13}/> Diet Plan
          </button>
        </div>
      </div>

      <div style={{ flex:1,display:'flex',flexDirection:'column',minHeight:0 }}>
        {/* Messages */}
        <div style={{ flex:1,overflowY:'auto',paddingRight:'0.25rem',marginBottom:'0.875rem',minHeight:250,maxHeight:'calc(100vh - 360px)' }}>
          {messages.map((m,i)=><Message key={i} msg={m}/>)}
          {loading && <TypingIndicator/>}
          <div ref={endRef}/>
        </div>

        {/* Quick prompts */}
        <div className="scroll-x" style={{ marginBottom:'0.75rem' }}>
          <div style={{ display:'flex',gap:'0.4rem',paddingBottom:'2px' }}>
            {QUICK_PROMPTS.map((p,i)=>(
              <button key={i} onClick={()=>sendMessage(p.text)} disabled={loading}
                style={{ whiteSpace:'nowrap',padding:'0.4rem 0.8rem',borderRadius:'var(--radius-full)',border:'1.5px solid var(--gray-200)',background:'var(--gray-0)',color:'var(--gray-600)',fontSize:'0.75rem',fontWeight:500,cursor:'pointer',transition:'all 0.15s',flexShrink:0 }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--brand-300)';e.currentTarget.style.color='var(--accent-primary)';e.currentTarget.style.background='var(--brand-50)';}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--gray-200)';e.currentTarget.style.color='var(--gray-600)';e.currentTarget.style.background='var(--gray-0)';}}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div style={{ display:'flex',gap:'0.625rem',padding:'0.875rem 1rem',background:'var(--gray-0)',borderRadius:'var(--radius-xl)',border:'1.5px solid var(--gray-200)',marginBottom:'1.25rem',boxShadow:'var(--shadow-sm)' }}>
          <textarea ref={inputRef} value={input} onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage();}}}
            placeholder="Ask anything about fitness, nutrition, training..."
            rows={1} disabled={loading}
            style={{ flex:1,resize:'none',border:'none',background:'transparent',color:'var(--gray-900)',fontSize:'0.875rem',lineHeight:1.55,outline:'none',padding:0,fontFamily:'var(--font-body)',maxHeight:120,overflowY:'auto' }}
          />
          <button onClick={()=>sendMessage()} disabled={loading||!input.trim()} className="btn btn-primary"
            style={{ alignSelf:'flex-end',borderRadius:'var(--radius-md)',padding:'0.5rem 0.875rem',flexShrink:0 }}>
            <IconSend size={15}/>
          </button>
        </div>
      </div>

      {/* Plan Modal */}
      {planModal && (
        <div className="modal-overlay" onClick={()=>{setPlanModal(false);setPlan(null);}}>
          <div className="modal" style={{ maxWidth:680 }} onClick={e=>e.stopPropagation()}>
            <button className="modal-close" onClick={()=>{setPlanModal(false);setPlan(null);}}>
              <IconX size={14}/>
            </button>
            <div style={{ display:'flex',alignItems:'center',gap:'0.75rem',marginBottom:'1.25rem' }}>
              <div style={{ width:40,height:40,borderRadius:'var(--radius-lg)',background:'#eff6ff',display:'flex',alignItems:'center',justifyContent:'center' }}>
                <IconBrain size={20} color="var(--accent-primary)"/>
              </div>
              <h2 style={{ fontFamily:'var(--font-display)',fontSize:'1.6rem' }}>Your AI-Generated Plan</h2>
            </div>
            {planLoading ? (
              <div style={{ display:'flex',flexDirection:'column',alignItems:'center',padding:'3rem',gap:'1rem' }}>
                <div className="spinner"/>
                <p style={{ color:'var(--gray-400)',fontSize:'0.85rem' }}>AI is building your personalised plan...</p>
              </div>
            ) : (
              <div style={{ fontSize:'0.87rem',lineHeight:1.8,color:'var(--gray-600)',whiteSpace:'pre-wrap',maxHeight:'60vh',overflowY:'auto' }}>{plan||'No plan generated.'}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
