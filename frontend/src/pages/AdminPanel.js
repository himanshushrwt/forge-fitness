import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { admin as adminAPI, trainers as trainersAPI } from '../utils/api';
import { IconCheck, IconX, IconTrash, IconUsers, IconChart, IconBell, IconActivity, IconTarget, IconSearch, IconEdit } from '../components/Icons';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const STATUS_BADGE = { open:'badge-red', under_review:'badge-amber', resolved:'badge-green', dismissed:'badge-gray' };
const BOOKING_BADGE = { pending:'badge-amber', confirmed:'badge-green', cancelled:'badge-gray', completed:'badge-blue' };

export default function AdminPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [coaches, setCoaches] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectNote, setRejectNote] = useState('');

  useEffect(() => {
    if (user?.role !== 'admin') { navigate('/dashboard'); return; }
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, coachRes, compRes, pendingRes] = await Promise.all([
        adminAPI.getStats(), adminAPI.getCoaches(), adminAPI.getComplaints(), adminAPI.getPendingRegistrations()
      ]);
      setStats(statsRes.data.stats);
      setCoaches(coachRes.data.coaches || []);
      setComplaints(compRes.data.complaints || []);
      setPendingUsers(pendingRes.data.users || []);
    } catch (err) {
      // Use defaults in mock mode
      setStats({ totalUsers:142, totalCoaches:5, totalBookings:38, pendingComplaints:2, pendingRegistrations:0 });
      setCoaches([
        { id:'t1', _id:'t1', name:'Marcus Steel',  email:'marcus@forge.fit',  coachProfile:{ isVerified:true,  rating:4.9, reviewCount:127, specializations:['Strength Training','Powerlifting'] }},
        { id:'t2', _id:'t2', name:'Sofia Ramirez', email:'sofia@forge.fit',   coachProfile:{ isVerified:true,  rating:4.8, reviewCount:89,  specializations:['Yoga','Functional Fitness'] }},
        { id:'t3', _id:'t3', name:'Jordan Kestrel',email:'jordan@forge.fit',  coachProfile:{ isVerified:true,  rating:4.7, reviewCount:63,  specializations:['Running','HIIT'] }},
        { id:'t4', _id:'t4', name:'Priya Sharma',  email:'priya@forge.fit',   coachProfile:{ isVerified:true,  rating:4.9, reviewCount:142, specializations:['Nutrition','Body Composition'] }},
        { id:'t5', _id:'t5', name:'Alex Thunder',  email:'alex@forge.fit',    coachProfile:{ isVerified:false, rating:4.6, reviewCount:51,  specializations:['Boxing','MMA Conditioning'] }},
      ]);
      setComplaints([
        { id:'c1', submitterName:'John Doe', submitterEmail:'john@example.com', againstName:'Unknown Coach', againstType:'coach', category:'fake_profile', description:'This coach has no real certifications. Their profile photo appears to be stock imagery and they have not responded to messages.', status:'open', createdAt:new Date(Date.now()-86400000*2) },
        { id:'c2', submitterName:'Sarah K.', submitterEmail:'sarah@example.com', againstName:'Platform', againstType:'platform', category:'other', description:'The AI coach gave incorrect advice about my knee injury. Please review the recommendations it made.', status:'open', createdAt:new Date(Date.now()-86400000) },
      ]);
      setPendingUsers([]);
    } finally { setLoading(false); }
  };

  const approveUser = async (u) => {
    try {
      await adminAPI.approveRegistration(u._id || u.id, '');
      setPendingUsers(prev => prev.filter(x => (x._id||x.id) !== (u._id||u.id)));
      setStats(s => s ? { ...s, pendingRegistrations: Math.max(0, (s.pendingRegistrations||1) - 1) } : s);
      toast.success(`${u.name}'s registration approved!`);
    } catch { toast.error('Could not approve.'); }
  };

  const rejectUser = async () => {
    if (!rejectModal) return;
    try {
      await adminAPI.rejectRegistration(rejectModal._id || rejectModal.id, rejectNote);
      setPendingUsers(prev => prev.filter(x => (x._id||x.id) !== (rejectModal._id||rejectModal.id)));
      setStats(s => s ? { ...s, pendingRegistrations: Math.max(0, (s.pendingRegistrations||1) - 1) } : s);
      toast.success(`${rejectModal.name}'s registration rejected.`);
      setRejectModal(null); setRejectNote('');
    } catch { toast.error('Could not reject.'); }
  };

  const verifyCoach = async (coach, verified) => {
    try {
      await adminAPI.verifyCoach(coach._id||coach.id, verified);
      setCoaches(cs => cs.map(c => (c._id||c.id)===(coach._id||coach.id) ? { ...c, coachProfile:{ ...c.coachProfile, isVerified:verified } } : c));
      toast.success(verified ? `${coach.name} verified!` : `${coach.name} unverified.`);
    } catch { toast.error('Could not update verification.'); }
  };

  const removeCoach = async (coach) => {
    if (!window.confirm(`Remove ${coach.name} from the platform? This cannot be undone.`)) return;
    try {
      await trainersAPI.remove(coach._id||coach.id);
      setCoaches(cs => cs.filter(c => (c._id||c.id) !== (coach._id||coach.id)));
      toast.success(`${coach.name} removed from platform.`);
    } catch { toast.error('Could not remove coach.'); }
  };

  const updateComplaint = async (id, status) => {
    try {
      await adminAPI.updateComplaint(id, { status, adminNotes });
      setComplaints(cs => cs.map(c => (c._id||c.id)===id ? { ...c, status, adminNotes } : c));
      setSelectedComplaint(null); setAdminNotes('');
      toast.success(`Complaint marked as ${status}.`);
    } catch { toast.error('Could not update complaint.'); }
  };

  const filteredCoaches = coaches.filter(c => !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase()));

  const TABS = [
    { key:'overview',       label:'Overview',       Icon:IconChart },
    { key:'registrations',  label:'Registrations',  Icon:IconUsers, badge: pendingUsers.length },
    { key:'coaches',        label:'Coaches',        Icon:IconUsers },
    { key:'complaints',     label:'Complaints',     Icon:IconBell, badge: complaints.filter(c=>c.status==='open').length },
    { key:'bookings',       label:'Bookings',       Icon:IconActivity },
  ];

  if (user?.role !== 'admin') return null;

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <div>
          <div style={{ display:'flex',alignItems:'center',gap:'0.625rem',marginBottom:'0.4rem' }}>
            <div style={{ background:'#fef3c7',border:'1px solid #fde68a',color:'#92400e',fontSize:'0.7rem',fontWeight:700,letterSpacing:'0.08em',padding:'0.2rem 0.7rem',borderRadius:'var(--radius-full)' }}>
              ADMIN
            </div>
          </div>
          <h1 className="page-title">Admin Panel</h1>
          <p className="page-subtitle">Full platform authority — verify coaches, manage complaints, monitor bookings</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex',gap:'2px',background:'var(--gray-100)',borderRadius:'var(--radius-lg)',padding:'3px',border:'1px solid var(--gray-200)',maxWidth:520,marginBottom:'1.75rem' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            style={{ flex:1,padding:'0.5rem 0.75rem',borderRadius:'var(--radius-md)',border:'none',cursor:'pointer',fontSize:'0.78rem',fontWeight:activeTab===t.key?600:500,display:'flex',alignItems:'center',justifyContent:'center',gap:'0.35rem',transition:'all 0.15s',background:activeTab===t.key?'var(--gray-0)':'transparent',color:activeTab===t.key?'var(--gray-900)':'var(--gray-500)',boxShadow:activeTab===t.key?'var(--shadow-xs)':'none' }}>
            <t.Icon size={13}/> {t.label}
            {t.badge > 0 && (
              <span style={{ background: t.key==='registrations'?'#f59e0b':'var(--red-500)',color:'white',fontSize:'0.6rem',fontWeight:700,width:16,height:16,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center' }}>
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {activeTab==='overview' && (
        <div>
          <div className="grid-4" style={{ marginBottom:'1.75rem' }}>
            {[
              { label:'Total Athletes', value:stats?.totalUsers||'—',    color:'#2563eb', bg:'#eff6ff', Icon:IconUsers },
              { label:'Total Coaches',  value:stats?.totalCoaches||'—',  color:'#16a34a', bg:'#f0fdf4', Icon:IconUsers },
              { label:'Total Bookings', value:stats?.totalBookings||'—', color:'#7c3aed', bg:'#f5f3ff', Icon:IconActivity },
              { label:'Open Complaints',value:stats?.pendingComplaints||'—', color:'#dc2626', bg:'#fef2f2', Icon:IconBell },
            ].map(s => (
              <div key={s.label} className="stat-card animate-fade-up">
                <div style={{ display:'flex',justifyContent:'space-between',marginBottom:'0.75rem' }}>
                  <div className="stat-label">{s.label}</div>
                  <div style={{ width:32,height:32,borderRadius:'var(--radius-md)',background:s.bg,display:'flex',alignItems:'center',justifyContent:'center' }}>
                    <s.Icon size={16} color={s.color}/>
                  </div>
                </div>
                <div className="stat-value" style={{ fontSize:'2rem',color:s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="card" style={{ marginBottom:'1.5rem' }}>
            <h3 style={{ fontFamily:'var(--font-display)',fontSize:'1.25rem',marginBottom:'1.25rem' }}>Quick Actions</h3>
            <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:'0.75rem' }}>
              {[
                { label:'Review Coaches', desc:'Verify or remove coaches', color:'blue',   tab:'coaches',    Icon:IconUsers },
                { label:'Handle Complaints', desc:'Respond to user reports', color:'red',  tab:'complaints', Icon:IconBell },
                { label:'View Bookings', desc:'Monitor all sessions',    color:'purple',    tab:'bookings',   Icon:IconActivity },
              ].map(a => (
                <button key={a.label} onClick={() => setActiveTab(a.tab)}
                  style={{ padding:'1rem',background:'var(--gray-50)',border:'1.5px solid var(--gray-200)',borderRadius:'var(--radius-lg)',cursor:'pointer',textAlign:'left',transition:'all 0.15s' }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--brand-300)';e.currentTarget.style.background='var(--brand-50)';}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--gray-200)';e.currentTarget.style.background='var(--gray-50)';}}>
                  <a.Icon size={20} color={`var(--accent-${a.color==='blue'?'primary':a.color==='red'?'red':'purple'})`}/>
                  <div style={{ marginTop:'0.5rem',fontWeight:600,fontSize:'0.87rem',color:'var(--gray-900)' }}>{a.label}</div>
                  <div style={{ fontSize:'0.73rem',color:'var(--gray-400)' }}>{a.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Admin info box */}
          <div className="alert alert-amber">
            <IconTarget size={16} style={{ flexShrink:0,marginTop:1 }}/>
            <div>
              <strong>Admin Authority:</strong> You have full control over this platform. You can verify/remove coaches, dismiss or resolve user complaints, monitor all session bookings, and delete fake reviews. All actions are logged.
            </div>
          </div>
        </div>
      )}

      {/* ── REGISTRATIONS ── */}
      {activeTab==='registrations' && (
        <div>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.25rem',flexWrap:'wrap',gap:'0.5rem' }}>
            <h3 style={{ fontFamily:'var(--font-display)',fontSize:'1.25rem' }}>
              Pending Registrations
              <span style={{ fontSize:'0.83rem',color:'var(--gray-400)',fontFamily:'var(--font-body)',fontWeight:400,marginLeft:'0.5rem' }}>({pendingUsers.length} awaiting)</span>
            </h3>
            <button className="btn btn-secondary btn-sm" onClick={loadData}>Refresh</button>
          </div>

          {pendingUsers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon" style={{ fontSize:'2rem' }}>✅</div>
              <h3>All caught up!</h3>
              <p>No pending registrations. New sign-ups will appear here.</p>
            </div>
          ) : (
            <div style={{ display:'flex',flexDirection:'column',gap:'0.875rem' }}>
              {pendingUsers.map(u => (
                <div key={u._id||u.id} className="card" style={{ padding:'1.25rem',borderLeft:'3px solid #f59e0b' }}>
                  <div style={{ display:'flex',alignItems:'center',gap:'1rem',flexWrap:'wrap' }}>
                    <div style={{ width:46,height:46,borderRadius:'50%',background:u.role==='coach'?'linear-gradient(135deg,#7c3aed,#4f46e5)':'linear-gradient(135deg,var(--brand-400),var(--brand-700))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1rem',fontWeight:700,color:'white',flexShrink:0 }}>
                      {u.name?.split(' ').map(n=>n[0]).join('').slice(0,2)}
                    </div>
                    <div style={{ flex:1,minWidth:160 }}>
                      <div style={{ display:'flex',alignItems:'center',gap:'0.5rem',marginBottom:'0.2rem',flexWrap:'wrap' }}>
                        <span style={{ fontWeight:600,fontSize:'0.95rem',color:'var(--gray-900)' }}>{u.name}</span>
                        <span style={{ background:u.role==='coach'?'#f5f3ff':'#eff6ff',color:u.role==='coach'?'#7c3aed':'#2563eb',fontSize:'0.63rem',fontWeight:700,padding:'1px 7px',borderRadius:'999px',textTransform:'uppercase' }}>
                          {u.role==='coach'?'Coach':'Athlete'}
                        </span>
                        <span className="badge badge-amber" style={{ fontSize:'0.63rem' }}>Pending</span>
                      </div>
                      <div style={{ fontSize:'0.75rem',color:'var(--gray-400)' }}>{u.email}</div>
                      <div style={{ fontSize:'0.73rem',color:'var(--gray-500)',marginTop:'0.2rem' }}>
                        Registered: {new Date(u.createdAt).toLocaleDateString()}
                        {u.stats?.fitnessLevel && <> · Level: <strong>{u.stats.fitnessLevel}</strong></>}
                      </div>
                    </div>
                    <div style={{ display:'flex',gap:'0.5rem' }}>
                      <button className="btn btn-green btn-sm" onClick={() => approveUser(u)} style={{ display:'flex',alignItems:'center',gap:'0.3rem' }}>
                        ✓ Approve
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => { setRejectModal(u); setRejectNote(''); }} style={{ display:'flex',alignItems:'center',gap:'0.3rem' }}>
                        ✕ Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Reject modal */}
          {rejectModal && (
            <div className="modal-overlay" onClick={() => setRejectModal(null)}>
              <div className="modal" style={{ maxWidth:420 }} onClick={e=>e.stopPropagation()}>
                <h2 style={{ fontFamily:'var(--font-display)',fontSize:'1.4rem',marginBottom:'0.5rem' }}>Reject Registration</h2>
                <p style={{ fontSize:'0.83rem',color:'var(--gray-400)',marginBottom:'1rem' }}>Rejecting <strong>{rejectModal.name}</strong></p>
                <div className="form-group">
                  <label className="form-label">Reason (optional)</label>
                  <textarea rows={3} placeholder="e.g. Incomplete profile, duplicate account..." value={rejectNote} onChange={e=>setRejectNote(e.target.value)} style={{ resize:'vertical' }}/>
                </div>
                <div style={{ display:'flex',gap:'0.625rem' }}>
                  <button className="btn btn-secondary flex-1" onClick={() => setRejectModal(null)} style={{ justifyContent:'center' }}>Cancel</button>
                  <button className="btn btn-danger flex-1" onClick={rejectUser} style={{ justifyContent:'center' }}>Confirm Reject</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── COACHES ── */}
      {activeTab==='coaches' && (
        <div>
          <div style={{ display:'flex',gap:'0.625rem',marginBottom:'1.25rem',flexWrap:'wrap',alignItems:'center',justifyContent:'space-between' }}>
            <h3 style={{ fontFamily:'var(--font-display)',fontSize:'1.25rem' }}>All Coaches ({filteredCoaches.length})</h3>
            <div className="input-icon-wrap" style={{ maxWidth:280 }}>
              <IconSearch size={15} className="input-icon"/>
              <input placeholder="Search coaches..." value={search} onChange={e=>setSearch(e.target.value)}/>
            </div>
          </div>

          <div style={{ display:'flex',flexDirection:'column',gap:'0.875rem' }}>
            {filteredCoaches.map(coach => {
              const cp = coach.coachProfile || {};
              return (
                <div key={coach._id||coach.id} className="card" style={{ padding:'1.25rem' }}>
                  <div style={{ display:'flex',alignItems:'center',gap:'1rem',flexWrap:'wrap' }}>
                    <div style={{ width:46,height:46,borderRadius:'50%',background:'linear-gradient(135deg,var(--brand-400),var(--brand-700))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1rem',fontWeight:700,color:'white',flexShrink:0 }}>
                      {coach.name?.split(' ').map(n=>n[0]).join('').slice(0,2)}
                    </div>
                    <div style={{ flex:1,minWidth:160 }}>
                      <div style={{ display:'flex',alignItems:'center',gap:'0.5rem',marginBottom:'0.2rem' }}>
                        <span style={{ fontWeight:600,fontSize:'0.95rem',color:'var(--gray-900)' }}>{coach.name}</span>
                        {cp.isVerified
                          ? <span className="badge badge-green" style={{ fontSize:'0.63rem' }}>Verified</span>
                          : <span className="badge badge-amber" style={{ fontSize:'0.63rem' }}>Unverified</span>
                        }
                      </div>
                      <div style={{ fontSize:'0.75rem',color:'var(--gray-400)' }}>{coach.email}</div>
                      <div style={{ fontSize:'0.73rem',color:'var(--gray-500)',marginTop:'0.2rem' }}>
                        Rating: <strong>{cp.rating||'—'}</strong> · {cp.reviewCount||0} reviews · {(cp.specializations||[]).slice(0,2).join(', ')}
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display:'flex',gap:'0.5rem',flexWrap:'wrap' }}>
                      {!cp.isVerified ? (
                        <button className="btn btn-green btn-sm" onClick={() => verifyCoach(coach, true)}
                          style={{ display:'flex',alignItems:'center',gap:'0.3rem',justifyContent:'center' }}>
                          <IconCheck size={13}/> Verify
                        </button>
                      ) : (
                        <button className="btn btn-secondary btn-sm" onClick={() => verifyCoach(coach, false)}
                          style={{ display:'flex',alignItems:'center',gap:'0.3rem' }}>
                          <IconX size={13}/> Unverify
                        </button>
                      )}
                      <button className="btn btn-danger btn-sm" onClick={() => removeCoach(coach)}
                        style={{ display:'flex',alignItems:'center',gap:'0.3rem' }}>
                        <IconTrash size={13}/> Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            {filteredCoaches.length===0 && (
              <div className="empty-state">
                <div className="empty-state-icon"><IconUsers size={24} color="var(--gray-400)"/></div>
                <h3>No coaches found</h3>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── COMPLAINTS ── */}
      {activeTab==='complaints' && (
        <div>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.25rem' }}>
            <h3 style={{ fontFamily:'var(--font-display)',fontSize:'1.25rem' }}>
              Complaints <span style={{ fontSize:'0.83rem',color:'var(--gray-400)',fontFamily:'var(--font-body)',fontWeight:400 }}>({complaints.length} total · {complaints.filter(c=>c.status==='open').length} open)</span>
            </h3>
          </div>

          {complaints.length===0 ? (
            <div className="empty-state"><div className="empty-state-icon"><IconBell size={24} color="var(--gray-400)"/></div><h3>No complaints</h3><p>All clear!</p></div>
          ) : (
            <div style={{ display:'flex',flexDirection:'column',gap:'0.875rem' }}>
              {complaints.map(c => (
                <div key={c._id||c.id} className="card" style={{ padding:'1.25rem',borderLeft:`3px solid ${c.status==='open'?'var(--red-500)':c.status==='resolved'?'var(--green-500)':'var(--gray-300)'}` }}>
                  <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'1rem',flexWrap:'wrap' }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex',alignItems:'center',gap:'0.5rem',marginBottom:'0.5rem',flexWrap:'wrap' }}>
                        <span className={`badge ${STATUS_BADGE[c.status]||'badge-gray'}`} style={{ textTransform:'capitalize' }}>{c.status.replace('_',' ')}</span>
                        <span className="badge badge-gray" style={{ textTransform:'capitalize' }}>{(c.category||'').replace('_',' ')}</span>
                        <span style={{ fontSize:'0.7rem',color:'var(--gray-400)' }}>{new Date(c.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div style={{ fontSize:'0.87rem',fontWeight:600,color:'var(--gray-900)',marginBottom:'0.2rem' }}>
                        From: {c.submitterName} ({c.submitterEmail})
                      </div>
                      {c.againstName && <div style={{ fontSize:'0.78rem',color:'var(--gray-500)',marginBottom:'0.5rem' }}>Against: {c.againstName} ({c.againstType})</div>}
                      <p style={{ fontSize:'0.83rem',color:'var(--gray-600)',lineHeight:1.65,margin:0 }}>{c.description}</p>
                      {c.adminNotes && (
                        <div style={{ marginTop:'0.625rem',padding:'0.625rem',background:'var(--gray-50)',borderRadius:'var(--radius-md)',fontSize:'0.78rem',color:'var(--gray-600)',borderLeft:'2px solid var(--gray-300)' }}>
                          <strong>Admin note:</strong> {c.adminNotes}
                        </div>
                      )}
                    </div>
                    {c.status==='open' && (
                      <button className="btn btn-secondary btn-sm" onClick={() => { setSelectedComplaint(c); setAdminNotes(c.adminNotes||''); }}
                        style={{ flexShrink:0,display:'flex',alignItems:'center',gap:'0.3rem' }}>
                        <IconEdit size={13}/> Respond
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Respond modal */}
          {selectedComplaint && (
            <div className="modal-overlay" onClick={() => setSelectedComplaint(null)}>
              <div className="modal" style={{ maxWidth:520 }} onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={() => setSelectedComplaint(null)}><IconX size={14}/></button>
                <h2 style={{ fontFamily:'var(--font-display)',fontSize:'1.6rem',marginBottom:'0.5rem' }}>Respond to Complaint</h2>
                <p style={{ fontSize:'0.83rem',color:'var(--gray-400)',marginBottom:'1.25rem' }}>From: {selectedComplaint.submitterName}</p>
                <div style={{ padding:'0.875rem',background:'var(--gray-50)',borderRadius:'var(--radius-lg)',marginBottom:'1.25rem',fontSize:'0.85rem',color:'var(--gray-600)',lineHeight:1.65 }}>
                  {selectedComplaint.description}
                </div>
                <div className="form-group">
                  <label className="form-label">Admin Notes (visible to you only)</label>
                  <textarea rows={3} placeholder="Your investigation notes..." value={adminNotes} onChange={e => setAdminNotes(e.target.value)} style={{ resize:'vertical' }}/>
                </div>
                <div style={{ display:'flex',gap:'0.625rem',flexWrap:'wrap' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => updateComplaint(selectedComplaint._id||selectedComplaint.id, 'under_review')}>Mark Under Review</button>
                  <button className="btn btn-green btn-sm" style={{ justifyContent:'center' }} onClick={() => updateComplaint(selectedComplaint._id||selectedComplaint.id, 'resolved')}>
                    <IconCheck size={13}/> Resolve
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => updateComplaint(selectedComplaint._id||selectedComplaint.id, 'dismissed')}>
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── BOOKINGS ── */}
      {activeTab==='bookings' && (
        <div>
          <h3 style={{ fontFamily:'var(--font-display)',fontSize:'1.25rem',marginBottom:'1.25rem' }}>All Bookings</h3>
          {bookings.length===0 ? (
            <div className="card" style={{ padding:'2rem' }}>
              <div style={{ textAlign:'center',color:'var(--gray-400)' }}>
                <IconActivity size={32} color="var(--gray-300)" style={{ marginBottom:'0.75rem' }}/>
                <p style={{ fontSize:'0.87rem' }}>No bookings yet. When users book sessions with coaches, they will appear here.</p>
                <button className="btn btn-secondary btn-sm" style={{ marginTop:'1rem' }} onClick={loadData}>Refresh</button>
              </div>
            </div>
          ) : bookings.map((b,i) => (
            <div key={b._id||b.id||i} className="card" style={{ marginBottom:'0.75rem',padding:'1rem' }}>
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'0.5rem' }}>
                <div>
                  <div style={{ fontWeight:600,fontSize:'0.87rem',color:'var(--gray-900)' }}>{b.clientName} → {b.coachName}</div>
                  <div style={{ fontSize:'0.75rem',color:'var(--gray-400)' }}>{b.date} at {b.timeSlot} · {b.duration}min · {b.sessionType}</div>
                  {b.goal && <div style={{ fontSize:'0.73rem',color:'var(--gray-500)',marginTop:'0.1rem' }}>Goal: {b.goal}</div>}
                </div>
                <span className={`badge ${BOOKING_BADGE[b.status]||'badge-gray'}`} style={{ textTransform:'capitalize' }}>{b.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
