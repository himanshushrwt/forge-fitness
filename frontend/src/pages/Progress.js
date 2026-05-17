import React, { useState, useRef, useCallback } from 'react';
import { progress as progressAPI, ai as aiAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { IconUpload, IconChart, IconPhoto, IconRobot, IconX } from '../components/Icons';
import toast from 'react-hot-toast';

const MOCK_WEIGHT = [
  {date:'Jan 1',weight:82},{date:'Jan 8',weight:81.2},{date:'Jan 15',weight:80.5},
  {date:'Jan 22',weight:80.1},{date:'Feb 1',weight:79.6},{date:'Feb 8',weight:79.0},
  {date:'Feb 15',weight:78.5},{date:'Mar 1',weight:78.0},
];

export default function Progress() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('photos');
  const [photos, setPhotos] = useState(user?.progressPhotos||[]);
  const [weightInput, setWeightInput] = useState('');
  const [weightHistory, setWeightHistory] = useState(MOCK_WEIGHT);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState('');
  const [previewImg, setPreviewImg] = useState(null);
  const [photoNotes, setPhotoNotes] = useState('');
  const [photoWeight, setPhotoWeight] = useState('');
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef();

  const handlePhotoUpload = useCallback(async (file) => {
    if (!file) return;
    if (file.size>10*1024*1024) return toast.error('File too large (max 10MB)');
    const reader = new FileReader();
    reader.onload = e => setPreviewImg(e.target.result);
    reader.readAsDataURL(file);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('photo',file);
      if (photoWeight) formData.append('weight',photoWeight);
      if (photoNotes) formData.append('notes',photoNotes);
      const res = await progressAPI.uploadPhoto(formData);
      const newPhoto = { ...res.data.photo, localUrl:URL.createObjectURL(file) };
      setPhotos(p=>[newPhoto,...p]);
      toast.success('Photo uploaded!');
      setUploading(false);
      setAnalyzing(true);
      const base64 = previewImg?.split(',')[1]||await toBase64(file);
      const aiRes = await aiAPI.analyzePhoto({imageBase64:base64,notes:photoNotes});
      setAnalysis(aiRes.data.analysis);
    } catch { toast.error('Upload failed. Please try again.'); }
    finally { setUploading(false); setAnalyzing(false); }
  },[photoWeight,photoNotes,previewImg]);

  const toBase64 = (file) => new Promise(res=>{ const r=new FileReader(); r.onload=e=>res(e.target.result.split(',')[1]); r.readAsDataURL(file); });

  const logWeight = async () => {
    if (!weightInput) return toast.error('Enter a weight value');
    const w = parseFloat(weightInput);
    if (isNaN(w)||w<20||w>500) return toast.error('Enter a valid weight in kg');
    const entry = { date:new Date().toLocaleDateString('en-US',{month:'short',day:'numeric'}), weight:w };
    setWeightHistory(h=>[...h,entry]);
    await progressAPI.logWeight({weight:w});
    toast.success(`Weight ${w}kg logged!`);
    setWeightInput('');
  };

  const currentWeight = weightHistory.slice(-1)[0]?.weight;
  const startWeight = weightHistory[0]?.weight;
  const change = currentWeight&&startWeight ? (currentWeight-startWeight).toFixed(1) : null;

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Progress</h1>
          <p className="page-subtitle">Track your transformation with photos and data</p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:'1rem',marginBottom:'1.5rem' }}>
        {[
          { label:'Current Weight', value:currentWeight?`${currentWeight} kg`:'—', icon:<IconChart size={16} color="#2563eb"/>, bg:'#eff6ff' },
          { label:'Total Change',   value:change?`${change>0?'+':''}${change} kg`:'—', icon:<IconChart size={16} color={change&&change<0?'#16a34a':'#d97706'}/>, bg:change&&change<0?'#f0fdf4':'#fffbeb' },
          { label:'Progress Photos',value:photos.length, icon:<IconPhoto size={16} color="#7c3aed"/>, bg:'#f5f3ff' },
          { label:'Day Streak',     value:user?.streak?.current||0, icon:<IconChart size={16} color="#d97706"/>, bg:'#fffbeb' },
        ].map(s=>(
          <div key={s.label} className="stat-card">
            <div style={{ display:'flex',justifyContent:'space-between',marginBottom:'0.625rem' }}>
              <div className="stat-label">{s.label}</div>
              <div style={{ width:28,height:28,borderRadius:'var(--radius-md)',background:s.bg,display:'flex',alignItems:'center',justifyContent:'center' }}>{s.icon}</div>
            </div>
            <div className="stat-value" style={{ fontSize:'1.6rem' }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="tabs" style={{ maxWidth:360,marginBottom:'1.5rem' }}>
        <button className={`tab ${activeTab==='photos'?'active':''}`} onClick={()=>setActiveTab('photos')}>Photos</button>
        <button className={`tab ${activeTab==='weight'?'active':''}`} onClick={()=>setActiveTab('weight')}>Weight</button>
      </div>

      {activeTab==='photos' && (
        <div>
          {/* Upload */}
          <div className="card" style={{ marginBottom:'1.5rem' }}>
            <h3 style={{ fontFamily:'var(--font-display)',fontSize:'1.2rem',marginBottom:'1rem' }}>Upload Progress Photo</h3>
            <div
              onClick={()=>fileRef.current?.click()}
              onDragOver={e=>{e.preventDefault();setDragging(true);}}
              onDragLeave={()=>setDragging(false)}
              onDrop={e=>{e.preventDefault();setDragging(false);handlePhotoUpload(e.dataTransfer.files[0]);}}
              style={{ border:`2px dashed ${dragging?'var(--accent-primary)':'var(--gray-200)'}`,borderRadius:'var(--radius-xl)',padding:'2.5rem 2rem',textAlign:'center',cursor:'pointer',transition:'all 0.2s',marginBottom:'1rem',background:dragging?'var(--brand-50)':'var(--gray-50)' }}>
              {uploading ? (
                <div><div className="spinner" style={{ margin:'0 auto' }}/><p style={{ marginTop:'1rem',color:'var(--gray-400)',fontSize:'0.83rem' }}>Uploading...</p></div>
              ) : previewImg ? (
                <img src={previewImg} alt="preview" style={{ maxHeight:200,borderRadius:'var(--radius-lg)',objectFit:'cover' }}/>
              ) : (
                <>
                  <div style={{ width:52,height:52,borderRadius:'var(--radius-xl)',background:'var(--gray-100)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 0.875rem' }}>
                    <IconUpload size={24} color="var(--gray-400)"/>
                  </div>
                  <p style={{ fontWeight:500,color:'var(--gray-700)',marginBottom:'0.25rem',fontSize:'0.9rem' }}>Drop photo here or click to browse</p>
                  <p style={{ fontSize:'0.78rem',color:'var(--gray-400)' }}>JPG, PNG up to 10MB · AI analysis included</p>
                </>
              )}
            </div>
            <input type="file" ref={fileRef} accept="image/*" style={{ display:'none' }} onChange={e=>handlePhotoUpload(e.target.files[0])}/>
            <div className="form-row">
              <div className="form-group" style={{ marginBottom:0 }}>
                <label className="form-label">Weight at time (kg)</label>
                <input type="number" placeholder="75.5" value={photoWeight} onChange={e=>setPhotoWeight(e.target.value)}/>
              </div>
              <div className="form-group" style={{ marginBottom:0 }}>
                <label className="form-label">Notes</label>
                <input placeholder="How you feel, goals..." value={photoNotes} onChange={e=>setPhotoNotes(e.target.value)}/>
              </div>
            </div>
          </div>

          {/* AI Analysis */}
          {(analyzing||analysis) && (
            <div className="card" style={{ marginBottom:'1.5rem',background:'#eff6ff',border:'1.5px solid #bfdbfe' }}>
              <div style={{ display:'flex',alignItems:'center',gap:'0.625rem',marginBottom:'0.75rem' }}>
                <div style={{ width:32,height:32,borderRadius:'var(--radius-md)',background:'#dbeafe',display:'flex',alignItems:'center',justifyContent:'center' }}>
                  <IconRobot size={16} color="#2563eb"/>
                </div>
                <h4 style={{ color:'#1d4ed8' }}>AI Analysis</h4>
              </div>
              {analyzing ? (
                <div style={{ display:'flex',alignItems:'center',gap:'0.75rem',color:'var(--gray-400)',fontSize:'0.83rem' }}>
                  <div className="spinner" style={{ width:20,height:20 }}/> Analysing your photo with AI...
                </div>
              ) : (
                <div style={{ fontSize:'0.85rem',color:'var(--brand-800)',lineHeight:1.8,whiteSpace:'pre-line' }}>{analysis}</div>
              )}
            </div>
          )}

          {/* Photo grid */}
          {photos.length===0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><IconPhoto size={24} color="var(--gray-400)"/></div>
              <h3>No progress photos yet</h3>
              <p>Upload your first photo to start tracking your transformation.</p>
            </div>
          ) : (
            <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:'1rem' }}>
              {photos.map((p,i)=>(
                <div key={i} className="card" style={{ padding:0,overflow:'hidden' }}>
                  <div style={{ height:200,background:'var(--gray-100)',display:'flex',alignItems:'center',justifyContent:'center' }}>
                    {p.localUrl||p.url
                      ? <img src={p.localUrl||p.url} alt="progress" style={{ width:'100%',height:'100%',objectFit:'cover' }}/>
                      : <IconPhoto size={32} color="var(--gray-300)"/>}
                  </div>
                  <div style={{ padding:'0.875rem' }}>
                    <div style={{ fontSize:'0.8rem',fontWeight:500,color:'var(--gray-900)' }}>{new Date(p.date).toLocaleDateString()}</div>
                    {p.weight && <div style={{ fontSize:'0.73rem',color:'var(--gray-400)' }}>{p.weight} kg</div>}
                    {p.notes && <div style={{ fontSize:'0.73rem',color:'var(--gray-500)',marginTop:'0.2rem' }}>{p.notes}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab==='weight' && (
        <div>
          <div className="card" style={{ marginBottom:'1.5rem' }}>
            <h3 style={{ fontFamily:'var(--font-display)',fontSize:'1.2rem',marginBottom:'1rem' }}>Log Today's Weight</h3>
            <div style={{ display:'flex',gap:'0.75rem',alignItems:'flex-end' }}>
              <div className="form-group" style={{ flex:1,marginBottom:0 }}>
                <label className="form-label">Weight (kg)</label>
                <input type="number" step="0.1" placeholder="e.g. 75.5" value={weightInput} onChange={e=>setWeightInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&logWeight()}/>
              </div>
              <button className="btn btn-primary" onClick={logWeight} style={{ flexShrink:0,justifyContent:'center' }}>Log Weight</button>
            </div>
          </div>

          <div className="card">
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.25rem' }}>
              <h3 style={{ fontFamily:'var(--font-display)',fontSize:'1.25rem' }}>Weight History</h3>
              {change && <span className={`badge ${parseFloat(change)<=0?'badge-green':'badge-red'}`}>{change>0?'+':''}{change} kg total</span>}
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={weightHistory} margin={{top:5,right:20,bottom:5,left:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-100)"/>
                <XAxis dataKey="date" tick={{fontSize:11,fill:'var(--gray-400)'}} axisLine={false} tickLine={false}/>
                <YAxis domain={['auto','auto']} tick={{fontSize:11,fill:'var(--gray-400)'}} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{background:'var(--gray-0)',border:'1px solid var(--gray-200)',borderRadius:8,boxShadow:'var(--shadow-md)'}} labelStyle={{color:'var(--gray-600)',fontSize:12}} itemStyle={{color:'var(--accent-primary)',fontSize:12}} formatter={v=>[`${v} kg`,'Weight']}/>
                <Line type="monotone" dataKey="weight" stroke="var(--accent-primary)" strokeWidth={2.5} dot={{fill:'var(--accent-primary)',r:4}} activeDot={{r:6}}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
