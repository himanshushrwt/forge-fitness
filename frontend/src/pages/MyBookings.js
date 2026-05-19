import React, { useState, useEffect } from 'react';
import { bookings as bookingsAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { IconCalendar, IconCheck, IconX, IconActivity, IconUsers } from '../components/Icons';
import toast from 'react-hot-toast';

const STATUS_COLOR = { pending:'badge-amber', confirmed:'badge-green', cancelled:'badge-gray', completed:'badge-blue' };
const STATUS_LABEL = { pending:'Pending', confirmed:'Confirmed', cancelled:'Cancelled', completed:'Completed' };

function BookingCard({ booking, onCancel, isCoach }) {
  const isPast = new Date(booking.date) < new Date();
  const canCancel = !isPast && booking.status !== 'cancelled' && booking.status !== 'completed';

  return (
    <div className="card" style={{ marginBottom:'0.875rem', borderLeft:`3px solid ${booking.status === 'confirmed' ? 'var(--green-500)' : booking.status === 'cancelled' ? 'var(--gray-300)' : 'var(--amber-400)'}` }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'0.75rem' }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.35rem', flexWrap:'wrap' }}>
            <span className={`badge ${STATUS_COLOR[booking.status]}`}>{STATUS_LABEL[booking.status]}</span>
            <span className="badge badge-gray" style={{ textTransform:'capitalize' }}>{booking.sessionType || 'online'}</span>
            {isPast && booking.status !== 'cancelled' && <span className="badge badge-blue">Past</span>}
          </div>
          <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1.15rem', marginBottom:'0.2rem' }}>
            {isCoach ? `Client: ${booking.clientName}` : `Coach: ${booking.coachName}`}
          </h3>
          <div style={{ display:'flex', gap:'1rem', fontSize:'0.8rem', color:'var(--gray-500)', flexWrap:'wrap' }}>
            <span style={{ display:'flex', alignItems:'center', gap:'0.3rem' }}>
              <IconCalendar size={13} /> {booking.date}
            </span>
            <span>at {booking.timeSlot}</span>
            <span>{booking.duration || 60} min</span>
          </div>
          {booking.goal && (
            <div style={{ marginTop:'0.4rem', fontSize:'0.78rem', color:'var(--gray-500)', fontStyle:'italic' }}>
              Goal: {booking.goal}
            </div>
          )}
          {booking.cancelReason && (
            <div style={{ marginTop:'0.4rem', fontSize:'0.78rem', color:'var(--red-500)' }}>
              Cancelled: {booking.cancelReason}
            </div>
          )}
        </div>
        {canCancel && (
          <button className="btn btn-danger btn-sm" onClick={() => onCancel(booking)}
            style={{ display:'flex', alignItems:'center', gap:'0.3rem', flexShrink:0 }}>
            <IconX size={13} /> Cancel
          </button>
        )}
      </div>
    </div>
  );
}

export default function MyBookings() {
  const { user } = useAuth();
  const [myBookings, setMyBookings] = useState([]);
  const [coachSessions, setCoachSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [cancelModal, setCancelModal] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const isCoach = user?.role === 'coach';

  useEffect(() => {
    const fetchAll = async () => {
      try {
        if (isCoach) {
          const res = await bookingsAPI.getCoachSessions();
          setCoachSessions(res.data.bookings || []);
        } else {
          const res = await bookingsAPI.getMy();
          setMyBookings(res.data.bookings || []);
        }
      } catch {
        // Mock data for display
        const mockData = [
          { id:'b1', clientName:'Rahul S.', coachName:'Marcus Steel', date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], timeSlot:'07:00 AM', duration:60, sessionType:'online', status:'pending', goal:'Build muscle and improve form' },
          { id:'b2', clientName:'Priya K.', coachName:'Sofia Ramirez', date: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0], timeSlot:'09:00 AM', duration:60, sessionType:'in-person', status:'confirmed', goal:'Weight loss and flexibility' },
          { id:'b3', clientName:'Amit J.', coachName:'Jordan Kestrel', date: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0], timeSlot:'06:00 AM', duration:60, sessionType:'online', status:'completed', goal:'Marathon training' },
        ];
        if (isCoach) setCoachSessions(mockData);
        else setMyBookings(mockData);
      } finally { setLoading(false); }
    };
    fetchAll();
  }, [isCoach]);

  const allBookings = isCoach ? coachSessions : myBookings;
  const now = new Date();
  const upcoming = allBookings.filter(b => new Date(b.date) >= now && b.status !== 'cancelled');
  const past = allBookings.filter(b => new Date(b.date) < now || b.status === 'cancelled');

  const handleCancel = async () => {
    if (!cancelModal) return;
    try {
      await bookingsAPI.cancel(cancelModal._id || cancelModal.id, cancelReason);
      const update = bs => bs.map(b => (b._id || b.id) === (cancelModal._id || cancelModal.id) ? { ...b, status:'cancelled', cancelReason } : b);
      if (isCoach) setCoachSessions(update);
      else setMyBookings(update);
      toast.success('Booking cancelled.');
      setCancelModal(null); setCancelReason('');
    } catch { toast.error('Could not cancel booking.'); }
  };

  const displayed = activeTab === 'upcoming' ? upcoming : past;

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">{isCoach ? 'My Sessions' : 'My Bookings'}</h1>
          <p className="page-subtitle">{isCoach ? 'Manage your client sessions' : 'View and manage your coach sessions'}</p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(140px, 1fr))', gap:'0.875rem', marginBottom:'1.5rem' }}>
        {[
          { label:'Upcoming', value:upcoming.length, color:'var(--accent-primary)', bg:'#eff6ff' },
          { label:'Completed', value:allBookings.filter(b => b.status === 'completed').length, color:'var(--green-600)', bg:'#f0fdf4' },
          { label:'Cancelled', value:allBookings.filter(b => b.status === 'cancelled').length, color:'var(--gray-400)', bg:'var(--gray-100)' },
          { label:'Total', value:allBookings.length, color:'var(--gray-700)', bg:'var(--gray-100)' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ fontSize:'2rem', color:s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="tabs" style={{ maxWidth:320, marginBottom:'1.5rem' }}>
        <button className={`tab ${activeTab === 'upcoming' ? 'active' : ''}`} onClick={() => setActiveTab('upcoming')}>
          Upcoming ({upcoming.length})
        </button>
        <button className={`tab ${activeTab === 'past' ? 'active' : ''}`} onClick={() => setActiveTab('past')}>
          Past ({past.length})
        </button>
      </div>

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:'3rem' }}><div className="spinner" /></div>
      ) : displayed.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            {activeTab === 'upcoming' ? <IconCalendar size={24} color="var(--gray-400)" /> : <IconActivity size={24} color="var(--gray-400)" />}
          </div>
          <h3>{activeTab === 'upcoming' ? 'No upcoming sessions' : 'No past sessions'}</h3>
          <p>{activeTab === 'upcoming' ? 'Book a session with a coach to get started.' : 'Your completed sessions will appear here.'}</p>
          {activeTab === 'upcoming' && !isCoach && (
            <button className="btn btn-primary btn-sm" style={{ marginTop:'1rem', justifyContent:'center' }} onClick={() => window.location.href = '/trainers'}>
              Find a Coach
            </button>
          )}
        </div>
      ) : (
        displayed.map(b => (
          <BookingCard key={b._id || b.id} booking={b} onCancel={setCancelModal} isCoach={isCoach} />
        ))
      )}

      {/* Cancel modal */}
      {cancelModal && (
        <div className="modal-overlay" onClick={() => setCancelModal(null)}>
          <div className="modal" style={{ maxWidth:420 }} onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setCancelModal(null)}>✕</button>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.5rem', marginBottom:'0.5rem' }}>Cancel Booking</h2>
            <p style={{ fontSize:'0.83rem', color:'var(--gray-500)', marginBottom:'1.25rem' }}>
              {cancelModal.date} at {cancelModal.timeSlot} with {cancelModal.coachName || cancelModal.clientName}
            </p>
            <div className="form-group">
              <label className="form-label">Reason (optional)</label>
              <textarea rows={3} placeholder="Why are you cancelling?" value={cancelReason} onChange={e => setCancelReason(e.target.value)} style={{ resize:'vertical' }} />
            </div>
            <div style={{ display:'flex', gap:'0.75rem' }}>
              <button className="btn btn-secondary flex-1" onClick={() => setCancelModal(null)} style={{ justifyContent:'center' }}>Keep Booking</button>
              <button className="btn btn-danger flex-1" onClick={handleCancel} style={{ justifyContent:'center' }}>Yes, Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
