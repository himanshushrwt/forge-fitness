import React, { useState, useEffect } from 'react';
import { trainers as trainersAPI, admin as adminAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { IconStar, IconSearch, IconUsers, IconCheck, IconX, IconCalendar, IconBell, IconActivity } from '../components/Icons';
import toast from 'react-hot-toast';

const DAYS_OF_WEEK = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

function Stars({ rating, size=14 }) {
  return (
    <div style={{ display:'flex',gap:2 }}>
      {[1,2,3,4,5].map(i=><IconStar key={i} size={size} filled={i<=Math.round(rating||0)}/>)}
    </div>
  );
}

// ── Booking Modal ─────────────────────────────────────────────────────────────
function BookingModal({ trainer, onClose }) {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [sessionType, setSessionType] = useState('online');
  const [goal, setGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [booked, setBooked] = useState(false);

  const cp = trainer.coachProfile || {};
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate()+1);
  const minDate = tomorrow.toISOString().split('T')[0];
  const maxDate = new Date(Date.now()+30*86400000).toISOString().split('T')[0];

  const fetchSlots = async (date) => {
    setSelectedDate(date); setSelectedSlot(''); setLoading(true);
    try {
      const res = await trainersAPI.getSlots(trainer._id||trainer.id, date);
      setSlots(res.data.slots||[]);
      setAvailableSlots(res.data.available||[]);
    } catch {
      // Mock slots based on day of week
      const dayName = new Date(date+'T12:00:00').toLocaleString('en-US',{weekday:'long'});
      const avail = cp.availability||[];
      if (avail.includes(dayName)) {
        const mockSlots = cp.timeSlots||['08:00 AM','09:00 AM','10:00 AM','03:00 PM','04:00 PM','05:00 PM'];
        setSlots(mockSlots); setAvailableSlots(mockSlots);
      } else { setSlots([]); setAvailableSlots([]); }
    } finally { setLoading(false); }
  };

  const confirmBooking = async () => {
    if (!selectedDate||!selectedSlot) return toast.error('Select a date and time slot');
    setLoading(true);
    try {
      await trainersAPI.bookSession(trainer._id||trainer.id, { date:selectedDate, timeSlot:selectedSlot, sessionType, goal, duration:60 });
      setBooked(true);
      toast.success(`Session booked with ${trainer.name}!`);
    } catch (err) {
      toast.error(err.response?.data?.error||'Could not book session.');
    } finally { setLoading(false); }
  };

  const dayIsAvailable = (dateStr) => {
    if (!dateStr) return false;
    const dayName = new Date(dateStr+'T12:00:00').toLocaleString('en-US',{weekday:'long'});
    return (cp.availability||[]).includes(dayName);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth:520 }} onClick={e=>e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><IconX size={14}/></button>

        {booked ? (
          <div style={{ textAlign:'center',padding:'2rem 1rem' }}>
            <div style={{ width:64,height:64,borderRadius:'50%',background:'#f0fdf4',border:'2px solid #bbf7d0',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 1.25rem' }}>
              <IconCheck size={28} color="#16a34a"/>
            </div>
            <h2 style={{ fontFamily:'var(--font-display)',fontSize:'1.75rem',marginBottom:'0.5rem' }}>Session Booked!</h2>
            <p style={{ color:'var(--gray-500)',marginBottom:'0.5rem' }}><strong>{trainer.name}</strong></p>
            <p style={{ color:'var(--gray-400)',fontSize:'0.87rem',marginBottom:'0.35rem' }}>{selectedDate} at {selectedSlot}</p>
            <p style={{ color:'var(--gray-400)',fontSize:'0.83rem',textTransform:'capitalize' }}>{sessionType} session · 60 min</p>
            <p style={{ fontSize:'0.83rem',color:'var(--gray-400)',marginTop:'1rem' }}>The coach will confirm your booking shortly.</p>
            <button className="btn btn-primary" onClick={onClose} style={{ marginTop:'1.5rem',justifyContent:'center',width:'100%' }}>Done</button>
          </div>
        ) : (
          <>
            <div style={{ display:'flex',alignItems:'center',gap:'0.875rem',marginBottom:'1.5rem' }}>
              <div style={{ width:48,height:48,borderRadius:'50%',background:'linear-gradient(135deg,var(--brand-400),var(--brand-700))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.1rem',fontWeight:700,color:'white',flexShrink:0 }}>
                {trainer.name?.split(' ').map(n=>n[0]).join('').slice(0,2)}
              </div>
              <div>
                <h2 style={{ fontFamily:'var(--font-display)',fontSize:'1.6rem',lineHeight:1 }}>{trainer.name}</h2>
                <p style={{ fontSize:'0.78rem',color:'var(--gray-400)',marginTop:'0.2rem' }}>Book a 1-on-1 session</p>
              </div>
            </div>

            {/* Step indicator */}
            <div style={{ display:'flex',gap:'0.375rem',marginBottom:'1.5rem' }}>
              {[1,2,3].map(s=>(
                <div key={s} style={{ flex:1,height:3,borderRadius:2,background:s<=step?'var(--accent-primary)':'var(--gray-200)',transition:'background 0.3s' }}/>
              ))}
            </div>

            {/* Step 1: Pick date */}
            {step===1 && (
              <>
                <h4 style={{ marginBottom:'0.875rem' }}>Step 1 — Choose a Date</h4>
                <div style={{ marginBottom:'1rem' }}>
                  <label className="form-label">Select Date</label>
                  <input type="date" min={minDate} max={maxDate} value={selectedDate}
                    onChange={e=>fetchSlots(e.target.value)}
                    style={{ cursor:'pointer' }}/>
                  {selectedDate && !dayIsAvailable(selectedDate) && (
                    <p style={{ fontSize:'0.78rem',color:'var(--red-500)',marginTop:'0.35rem' }}>
                      {trainer.name.split(' ')[0]} is not available on this day. Available: {(cp.availability||[]).join(', ')}
                    </p>
                  )}
                </div>
                {selectedDate && dayIsAvailable(selectedDate) && (
                  <div style={{ marginBottom:'1rem' }}>
                    <label className="form-label">Available Time Slots</label>
                    {loading ? <div className="spinner" style={{ width:20,height:20 }}/> : (
                      availableSlots.length===0 ? (
                        <p style={{ fontSize:'0.83rem',color:'var(--gray-400)' }}>No slots available for this date.</p>
                      ) : (
                        <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'0.4rem' }}>
                          {slots.map(slot=>{
                            const isAvail = availableSlots.includes(slot);
                            return (
                              <button key={slot} onClick={()=>isAvail&&setSelectedSlot(slot)} disabled={!isAvail}
                                style={{ padding:'0.55rem',borderRadius:'var(--radius-md)',border:`1.5px solid ${selectedSlot===slot?'var(--accent-primary)':isAvail?'var(--gray-200)':'var(--gray-100)'}`,background:selectedSlot===slot?'var(--brand-50)':isAvail?'var(--gray-0)':'var(--gray-50)',color:isAvail?selectedSlot===slot?'var(--accent-primary)':'var(--gray-700)':'var(--gray-300)',fontSize:'0.75rem',fontWeight:500,cursor:isAvail?'pointer':'not-allowed',transition:'all 0.15s' }}>
                                {slot}
                                {!isAvail && <div style={{ fontSize:'0.6rem',color:'var(--gray-300)' }}>Booked</div>}
                              </button>
                            );
                          })}
                        </div>
                      )
                    )}
                  </div>
                )}
                <button className="btn btn-primary w-full" disabled={!selectedDate||!selectedSlot} onClick={()=>setStep(2)} style={{ justifyContent:'center' }}>
                  Continue
                </button>
              </>
            )}

            {/* Step 2: Session details */}
            {step===2 && (
              <>
                <h4 style={{ marginBottom:'0.875rem' }}>Step 2 — Session Details</h4>
                <div className="form-group">
                  <label className="form-label">Session Type</label>
                  <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.5rem' }}>
                    {['online','in-person'].map(t=>(
                      <div key={t} onClick={()=>setSessionType(t)}
                        style={{ padding:'0.75rem',borderRadius:'var(--radius-md)',cursor:'pointer',border:`1.5px solid ${sessionType===t?'var(--accent-primary)':'var(--gray-200)'}`,background:sessionType===t?'var(--brand-50)':'var(--gray-0)',fontSize:'0.83rem',fontWeight:500,color:sessionType===t?'var(--accent-primary)':'var(--gray-700)',textAlign:'center',transition:'all 0.15s',textTransform:'capitalize' }}>
                        {t}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Your Goal for this Session</label>
                  <textarea rows={3} placeholder="e.g. Learn proper squat form, create a diet plan, improve running pace..." value={goal} onChange={e=>setGoal(e.target.value)} style={{ resize:'vertical' }}/>
                </div>
                <div style={{ background:'var(--gray-50)',borderRadius:'var(--radius-lg)',padding:'0.875rem',marginBottom:'1rem',fontSize:'0.83rem',color:'var(--gray-600)' }}>
                  <strong>Summary:</strong> {selectedDate} at {selectedSlot} · {sessionType} · 60 min
                </div>
                <div style={{ display:'flex',gap:'0.625rem' }}>
                  <button className="btn btn-secondary flex-1" onClick={()=>setStep(1)} style={{ justifyContent:'center' }}>Back</button>
                  <button className="btn btn-primary flex-1" onClick={()=>setStep(3)} style={{ justifyContent:'center' }}>Review</button>
                </div>
              </>
            )}

            {/* Step 3: Confirm */}
            {step===3 && (
              <>
                <h4 style={{ marginBottom:'0.875rem' }}>Step 3 — Confirm Booking</h4>
                <div style={{ background:'var(--gray-50)',border:'1.5px solid var(--gray-200)',borderRadius:'var(--radius-xl)',padding:'1.25rem',marginBottom:'1.25rem' }}>
                  {[
                    { label:'Coach',    value:trainer.name },
                    { label:'Date',     value:selectedDate },
                    { label:'Time',     value:selectedSlot },
                    { label:'Duration', value:'60 minutes' },
                    { label:'Type',     value:sessionType,  cap:true },
                    { label:'Cost',     value:'Free',       color:'#16a34a' },
                  ].map(r=>(
                    <div key={r.label} style={{ display:'flex',justifyContent:'space-between',padding:'0.4rem 0',borderBottom:'1px solid var(--gray-200)',fontSize:'0.85rem' }}>
                      <span style={{ color:'var(--gray-500)' }}>{r.label}</span>
                      <span style={{ fontWeight:500,color:r.color||'var(--gray-900)',textTransform:r.cap?'capitalize':'none' }}>{r.value}</span>
                    </div>
                  ))}
                  {goal && (
                    <div style={{ marginTop:'0.625rem',fontSize:'0.78rem',color:'var(--gray-500)' }}>
                      Goal: {goal}
                    </div>
                  )}
                </div>
                <div className="alert alert-green" style={{ marginBottom:'1.25rem' }}>
                  <IconCheck size={15} style={{ flexShrink:0 }}/>
                  Booking is free. You and {trainer.name.split(' ')[0]} can discuss further arrangements directly.
                </div>
                <div style={{ display:'flex',gap:'0.625rem' }}>
                  <button className="btn btn-secondary flex-1" onClick={()=>setStep(2)} style={{ justifyContent:'center' }}>Back</button>
                  <button className="btn btn-primary flex-1" onClick={confirmBooking} disabled={loading} style={{ justifyContent:'center' }}>
                    {loading?'Booking...':'Confirm Booking'}
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Trainer Card ──────────────────────────────────────────────────────────────
function TrainerCard({ trainer, onSelect }) {
  const cp = trainer.coachProfile||{};
  return (
    <div className="card" style={{ cursor:'pointer' }} onClick={()=>onSelect(trainer)}>
      <div style={{ display:'flex',gap:'1rem',alignItems:'flex-start',marginBottom:'1rem' }}>
        <div style={{ width:52,height:52,borderRadius:'50%',flexShrink:0,background:'linear-gradient(135deg,var(--brand-400),var(--brand-700))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.2rem',fontWeight:700,color:'white' }}>
          {trainer.name?.split(' ').map(n=>n[0]).join('').slice(0,2)}
        </div>
        <div style={{ flex:1 }}>
          <div style={{ display:'flex',alignItems:'center',gap:'0.4rem',marginBottom:'0.2rem',flexWrap:'wrap' }}>
            <h3 style={{ fontFamily:'var(--font-display)',fontSize:'1.15rem',color:'var(--gray-900)' }}>{trainer.name}</h3>
            {cp.isVerified && <span className="badge badge-green" style={{ fontSize:'0.6rem' }}>Verified</span>}
          </div>
          <div style={{ display:'flex',alignItems:'center',gap:'0.4rem' }}>
            <Stars rating={cp.rating||0}/>
            <span style={{ fontSize:'0.73rem',color:'var(--gray-400)' }}>{cp.rating||'—'} ({cp.reviewCount||0} reviews)</span>
          </div>
        </div>
      </div>
      <p style={{ fontSize:'0.83rem',lineHeight:1.65,marginBottom:'1rem',color:'var(--gray-500)',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden' }}>
        {trainer.bio||'Professional fitness coach.'}
      </p>
      <div style={{ display:'flex',gap:'0.375rem',flexWrap:'wrap',marginBottom:'1rem' }}>
        {(cp.specializations||[]).slice(0,3).map(s=><span key={s} className="tag">{s}</span>)}
      </div>
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',paddingTop:'0.75rem',borderTop:'1px solid var(--gray-100)' }}>
        <span style={{ fontSize:'0.73rem',color:'var(--gray-400)' }}>{cp.experience?`${cp.experience} yrs exp`:''}</span>
        <span className="badge badge-green" style={{ fontSize:'0.63rem' }}>Free · Book Now</span>
      </div>
    </div>
  );
}

// ── Trainer Detail Modal ──────────────────────────────────────────────────────
function TrainerModal({ trainer, onClose, onBook }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [localTrainer, setLocalTrainer] = useState(trainer);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const cp = localTrainer.coachProfile||{};

  useEffect(() => {
    trainersAPI.getReviews(trainer._id||trainer.id)
      .then(r=>setReviews(r.data.reviews||[]))
      .catch(()=>setReviews([]))
      .finally(()=>setLoadingReviews(false));
  },[]);

  const submitReview = async () => {
    if (!comment.trim()) return toast.error('Please write a comment');
    try {
      const res = await trainersAPI.submitReview(trainer._id||trainer.id, { rating, comment });
      const newReview = { reviewerName:user?.name||'You', rating, comment, createdAt:new Date() };
      setReviews(r=>[newReview,...r]);
      // Update displayed rating
      if (res.data.newRating) {
        setLocalTrainer(t=>({ ...t, coachProfile:{ ...t.coachProfile, rating:res.data.newRating, reviewCount:res.data.reviewCount } }));
      }
      setShowReviewForm(false); setComment(''); setRating(5);
      toast.success('Review submitted!');
    } catch { toast.error('Could not submit review.'); }
  };


  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth:600 }} onClick={e=>e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><IconX size={14}/></button>

        {/* Header */}
        <div style={{ display:'flex',gap:'1.25rem',alignItems:'flex-start',marginBottom:'1.5rem' }}>
          <div style={{ width:64,height:64,borderRadius:'50%',flexShrink:0,background:'linear-gradient(135deg,var(--brand-400),var(--brand-700))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.5rem',fontWeight:700,color:'white' }}>
            {localTrainer.name?.split(' ').map(n=>n[0]).join('').slice(0,2)}
          </div>
          <div>
            <div style={{ display:'flex',alignItems:'center',gap:'0.5rem',marginBottom:'0.25rem' }}>
              <h2 style={{ fontFamily:'var(--font-display)',fontSize:'1.75rem' }}>{localTrainer.name}</h2>
              {cp.isVerified && <span className="badge badge-green">Verified</span>}
            </div>
            <div style={{ display:'flex',alignItems:'center',gap:'0.5rem' }}>
              <Stars rating={cp.rating||0}/>
              <span style={{ fontSize:'0.83rem',color:'var(--gray-400)',fontWeight:500 }}>{cp.rating||'—'}</span>
              <span style={{ fontSize:'0.78rem',color:'var(--gray-400)' }}>({cp.reviewCount||0} reviews)</span>
            </div>
            <p style={{ fontSize:'0.75rem',color:'var(--gray-400)',marginTop:'0.25rem' }}>{cp.experience} yrs exp · {(cp.certifications||[]).join(', ')}</p>
          </div>
        </div>

        <p style={{ fontSize:'0.87rem',lineHeight:1.75,marginBottom:'1.5rem',color:'var(--gray-600)' }}>{localTrainer.bio}</p>

        <div style={{ marginBottom:'1.25rem' }}>
          <h4 style={{ marginBottom:'0.625rem' }}>Specializations</h4>
          <div style={{ display:'flex',gap:'0.4rem',flexWrap:'wrap' }}>
            {(cp.specializations||[]).map(s=><span key={s} className="badge badge-blue">{s}</span>)}
          </div>
        </div>

        {(cp.availability||[]).length>0 && (
          <div style={{ marginBottom:'1.25rem' }}>
            <h4 style={{ marginBottom:'0.625rem' }}>Available Days</h4>
            <div style={{ display:'flex',gap:'0.375rem',flexWrap:'wrap' }}>
              {(cp.availability||[]).map(d=><span key={d} className="tag">{d}</span>)}
            </div>
          </div>
        )}

        {/* CTA Buttons */}
        <div style={{ display:'flex',gap:'0.625rem',marginBottom:'1.5rem' }}>
          <button className="btn btn-primary flex-1" onClick={()=>{ onClose(); onBook && onBook(localTrainer); }}
            style={{ justifyContent:'center',display:'flex',alignItems:'center',gap:'0.4rem' }}>
            <IconCalendar size={14}/> Book a Session
          </button>
          <button className="btn btn-secondary" onClick={()=>setShowReviewForm(!showReviewForm)}
            style={{ justifyContent:'center',display:'flex',alignItems:'center',gap:'0.4rem' }}>
            <IconStar size={13}/> Review
          </button>
        </div>

        {/* Review form */}
        {showReviewForm && (
          <div style={{ padding:'1rem',borderRadius:'var(--radius-xl)',background:'var(--gray-50)',border:'1.5px solid var(--gray-200)',marginBottom:'1.25rem' }}>
            <h4 style={{ marginBottom:'0.75rem' }}>Leave a Review</h4>
            <div style={{ marginBottom:'0.75rem' }}>
              <label className="form-label">Rating</label>
              <div style={{ display:'flex',gap:'0.375rem' }}>
                {[1,2,3,4,5].map(n=>(
                  <span key={n} onClick={()=>setRating(n)} style={{ cursor:'pointer',transition:'transform 0.1s' }}
                    onMouseEnter={e=>e.currentTarget.style.transform='scale(1.2)'}
                    onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}>
                    <IconStar size={26} filled={n<=rating}/>
                  </span>
                ))}
              </div>
            </div>
            <textarea rows={3} placeholder="Share your experience with this coach..." value={comment} onChange={e=>setComment(e.target.value)} style={{ marginBottom:'0.75rem',resize:'vertical' }}/>
            <div style={{ display:'flex',gap:'0.5rem' }}>
              <button className="btn btn-ghost btn-sm" onClick={()=>setShowReviewForm(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={submitReview} style={{ justifyContent:'center' }}>Submit Review</button>
            </div>
          </div>
        )}

        {/* Reviews */}
        <div>
          <h4 style={{ marginBottom:'0.875rem' }}>Reviews ({reviews.length})</h4>
          {loadingReviews ? <div className="spinner" style={{ width:20,height:20 }}/> :
          reviews.length===0 ? (
            <p style={{ fontSize:'0.83rem',color:'var(--gray-400)' }}>No reviews yet. Be the first!</p>
          ) : (
            <div style={{ display:'flex',flexDirection:'column',gap:'0.75rem',maxHeight:250,overflowY:'auto' }}>
              {reviews.map((r,i)=>(
                <div key={i} style={{ padding:'0.875rem',background:'var(--gray-50)',borderRadius:'var(--radius-lg)',border:'1px solid var(--gray-200)' }}>
                  <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.35rem' }}>
                    <span style={{ fontWeight:600,fontSize:'0.83rem',color:'var(--gray-900)' }}>{r.reviewerName||'Anonymous'}</span>
                    <Stars rating={r.rating} size={12}/>
                  </div>
                  <p style={{ fontSize:'0.82rem',color:'var(--gray-600)',margin:0,lineHeight:1.6 }}>{r.comment}</p>
                  <div style={{ fontSize:'0.68rem',color:'var(--gray-400)',marginTop:'0.3rem' }}>{new Date(r.createdAt).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Complaint Modal ───────────────────────────────────────────────────────────
function ComplaintModal({ trainer, onClose }) {
  const [category, setCategory] = useState('fake_profile');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const submit = async () => {
    if (!description.trim()) return toast.error('Please describe the issue');
    try {
      await adminAPI.submitComplaint({ againstName:trainer.name, againstType:'coach', category, description });
      setSubmitted(true);
      toast.success('Complaint submitted. Admin will review within 24 hours.');
    } catch { toast.error('Could not submit complaint.'); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth:480 }} onClick={e=>e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><IconX size={14}/></button>
        {submitted ? (
          <div style={{ textAlign:'center',padding:'2rem' }}>
            <div style={{ width:56,height:56,borderRadius:'50%',background:'#f0fdf4',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 1rem' }}>
              <IconCheck size={24} color="#16a34a"/>
            </div>
            <h2 style={{ fontFamily:'var(--font-display)',fontSize:'1.5rem',marginBottom:'0.5rem' }}>Submitted!</h2>
            <p style={{ color:'var(--gray-500)',fontSize:'0.87rem' }}>Your complaint has been sent to our admin team. We will review it within 24 hours.</p>
            <button className="btn btn-primary" onClick={onClose} style={{ marginTop:'1.5rem',justifyContent:'center' }}>Close</button>
          </div>
        ) : (
          <>
            <h2 style={{ fontFamily:'var(--font-display)',fontSize:'1.6rem',marginBottom:'0.25rem' }}>Report a Problem</h2>
            <p style={{ fontSize:'0.83rem',color:'var(--gray-400)',marginBottom:'1.25rem' }}>About: <strong>{trainer.name}</strong></p>
            <div className="form-group">
              <label className="form-label">Issue Category</label>
              <select value={category} onChange={e=>setCategory(e.target.value)}>
                <option value="fake_profile">Fake Profile / False Certifications</option>
                <option value="misconduct">Misconduct or Unprofessional Behaviour</option>
                <option value="no_show">Did not show up for session</option>
                <option value="harassment">Harassment</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Describe the Issue *</label>
              <textarea rows={4} placeholder="Please provide as much detail as possible..." value={description} onChange={e=>setDescription(e.target.value)} style={{ resize:'vertical' }}/>
            </div>
            <div className="alert alert-info" style={{ marginBottom:'1.25rem' }}>
              <IconBell size={14} style={{ flexShrink:0 }}/>
              Your complaint is confidential. Our admin team will investigate and take action within 24 hours.
            </div>
            <div style={{ display:'flex',gap:'0.625rem' }}>
              <button className="btn btn-secondary flex-1" onClick={onClose} style={{ justifyContent:'center' }}>Cancel</button>
              <button className="btn btn-danger flex-1" onClick={submit} style={{ justifyContent:'center' }}>Submit Report</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main Trainers Page ────────────────────────────────────────────────────────
export default function Trainers() {
  const [trainerList, setTrainerList] = useState([]);
  const [selected, setSelected] = useState(null);
  const [bookingTrainer, setBookingTrainer] = useState(null);
  const [complaintTrainer, setComplaintTrainer] = useState(null);
  const [search, setSearch] = useState('');
  const [specFilter, setSpecFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    trainersAPI.getAll().then(r=>setTrainerList(r.data.trainers||[])).catch(()=>{}).finally(()=>setLoading(false));
  },[]);

  const allSpecs = [...new Set(trainerList.flatMap(t=>t.coachProfile?.specializations||[]))];
  const filtered = trainerList.filter(t=>{
    const ms=!search||t.name?.toLowerCase().includes(search.toLowerCase())||t.bio?.toLowerCase().includes(search.toLowerCase());
    const ms2=specFilter==='all'||(t.coachProfile?.specializations||[]).includes(specFilter);
    return ms&&ms2;
  });

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Find a Coach</h1>
          <p className="page-subtitle">Browse certified trainers · Book sessions · All free</p>
        </div>
      </div>

      <div style={{ display:'flex',gap:'0.625rem',marginBottom:'1.5rem',flexWrap:'wrap' }}>
        <div className="input-icon-wrap" style={{ maxWidth:320,flex:1 }}>
          <IconSearch size={15} className="input-icon"/>
          <input placeholder="Search by name or specialty..." value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        <select value={specFilter} onChange={e=>setSpecFilter(e.target.value)} style={{ width:'auto',minWidth:190 }}>
          <option value="all">All Specializations</option>
          {allSpecs.map(s=><option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:'1.25rem' }}>
          {[...Array(4)].map((_,i)=><div key={i} className="skeleton" style={{ height:280 }}/>)}
        </div>
      ) : filtered.length===0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><IconUsers size={24} color="var(--gray-400)"/></div>
          <h3>No coaches found</h3><p>Try different search terms.</p>
        </div>
      ) : (
        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:'1.25rem',marginBottom:'2rem' }}>
          {filtered.map((t,i)=>(
            <div key={t._id||t.id||i} className="animate-fade-up" style={{ animationDelay:`${i*0.06}s` }}>
              <TrainerCard trainer={t} onSelect={setSelected}/>
            </div>
          ))}
        </div>
      )}

      {/* Info banners */}
      <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:'1rem',marginBottom:'2rem' }}>
        <div className="card" style={{ background:'#eff6ff',border:'1.5px solid #bfdbfe' }}>
          <div style={{ display:'flex',gap:'0.875rem',alignItems:'flex-start' }}>
            <div style={{ width:40,height:40,borderRadius:'var(--radius-lg)',background:'#dbeafe',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
              <IconUsers size={20} color="#2563eb"/>
            </div>
            <div>
              <h3 style={{ fontFamily:'var(--font-display)',fontSize:'1.1rem',marginBottom:'0.3rem' }}>Want to become a coach?</h3>
              <p style={{ fontSize:'0.82rem',color:'var(--gray-600)',marginBottom:'0.75rem' }}>Register as a Coach to list your profile and connect with athletes. Completely free.</p>
              <button className="btn btn-primary btn-sm" onClick={()=>window.location.href='/register'} style={{ justifyContent:'center' }}>Sign Up as Coach</button>
            </div>
          </div>
        </div>

        <div className="card" style={{ background:'#fef2f2',border:'1.5px solid #fecaca' }}>
          <div style={{ display:'flex',gap:'0.875rem',alignItems:'flex-start' }}>
            <div style={{ width:40,height:40,borderRadius:'var(--radius-lg)',background:'#fee2e2',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
              <IconBell size={20} color="#dc2626"/>
            </div>
            <div>
              <h3 style={{ fontFamily:'var(--font-display)',fontSize:'1.1rem',marginBottom:'0.3rem' }}>Report a Problem</h3>
              <p style={{ fontSize:'0.82rem',color:'var(--gray-600)',marginBottom:'0.75rem' }}>Encountered a fake profile or misconduct? Report it and our admin team will act within 24 hours.</p>
              <button className="btn btn-danger btn-sm" onClick={()=>setComplaintTrainer({ name:'General', _id:'general' })} style={{ justifyContent:'center' }}>File a Complaint</button>
            </div>
          </div>
        </div>
      </div>

      {selected && <TrainerModal trainer={selected} onClose={()=>setSelected(null)} onBook={(t)=>{ setSelected(null); setBookingTrainer(t); }}/>
      {bookingTrainer && <BookingModal trainer={bookingTrainer} onClose={()=>setBookingTrainer(null)}/>}
      {complaintTrainer && <ComplaintModal trainer={complaintTrainer} onClose={()=>setComplaintTrainer(null)}/>}
    </div>
  );
}
