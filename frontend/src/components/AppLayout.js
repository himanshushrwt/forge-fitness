import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  IconDashboard, IconDumbbell, IconClipboard, IconNutrition,
  IconUsers, IconChart, IconRobot, IconBell, IconLogout, IconCalendar
} from './Icons';

const IconShield = (p) => (
  <svg width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const buildNav = (role) => {
  const base = [
    { path:'/dashboard',       Icon:IconDashboard,  label:'Dashboard' },
    { section:'Training' },
    { path:'/exercises',       Icon:IconDumbbell,   label:'Exercise Library' },
    { path:'/workout-planner', Icon:IconClipboard,  label:'Workout Planner' },
    { path:'/nutrition',       Icon:IconNutrition,  label:'Nutrition Planner' },
    { section:'Community' },
    { path:'/trainers',        Icon:IconUsers,      label:'Find Coaches' },
    { path:'/my-bookings',     Icon:IconCalendar,   label: role === 'coach' ? 'My Sessions' : 'My Bookings' },
    { path:'/progress',        Icon:IconChart,      label:'My Progress' },
    { section:'Intelligence' },
    { path:'/ai-coach',        Icon:IconRobot,      label:'AI Coach' },
    { path:'/reminders',       Icon:IconBell,       label:'Reminders' },
  ];
  if (role === 'admin') {
    base.push({ section:'Administration' });
    base.push({ path:'/admin', Icon:IconShield, label:'Admin Panel', isAdmin:true });
  }
  return base;
};

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) || 'U';
  const NAV = buildNav(user?.role);

  return (
    <div className="app-layout">
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.3)', zIndex:99, backdropFilter:'blur(2px)' }} />
      )}

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-wordmark">Forge</div>
          <div className="logo-tagline">Elite Fitness Platform</div>
        </div>

        <nav className="sidebar-nav">
          {NAV.map((item, i) => {
            if (item.section) return (
              <div key={i} className="nav-section-label"
                style={item.section === 'Administration' ? { color:'#d97706' } : {}}>
                {item.section}
              </div>
            );
            const isActive = location.pathname === item.path;
            const { Icon } = item;
            return (
              <button key={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                style={item.isAdmin && isActive ? { color:'#d97706', background:'#fffbeb' } : item.isAdmin ? { color:'#92400e' } : {}}>
                <span className="nav-icon">
                  <Icon size={16} color={item.isAdmin ? (isActive ? '#d97706' : '#b45309') : isActive ? 'var(--accent-primary)' : 'currentColor'} />
                </span>
                <span>{item.label}</span>
                {item.isAdmin && (
                  <span style={{ marginLeft:'auto', fontSize:'0.6rem', background:'#fef3c7', color:'#92400e', padding:'1px 5px', borderRadius:4, fontWeight:700 }}>ADMIN</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div style={{ display:'flex', alignItems:'center', gap:'0.625rem', marginBottom:'0.625rem' }}>
            <div className="avatar" style={{ cursor:'pointer' }} onClick={() => { navigate('/profile'); setSidebarOpen(false); }}>
              {initials}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:'0.83rem', fontWeight:500, color:'var(--text-primary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {user?.name}
              </div>
              <div style={{ fontSize:'0.7rem', color:'var(--text-muted)', textTransform:'capitalize' }}>
                {user?.role === 'admin' ? <span style={{ color:'#d97706', fontWeight:700 }}>Admin</span> : user?.role}
              </div>
            </div>
          </div>
          <button onClick={logout}
            style={{ display:'flex', alignItems:'center', gap:'0.5rem', width:'100%', padding:'0.45rem 0.5rem', background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', fontSize:'0.78rem', fontFamily:'var(--font-body)', borderRadius:'var(--radius-sm)', transition:'all 150ms' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--red-50)'; e.currentTarget.style.color = 'var(--red-600)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
            <IconLogout size={14} /> Sign Out
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div style={{ display:'none', alignItems:'center', justifyContent:'space-between', padding:'0.875rem 1.25rem', background:'var(--bg-card)', borderBottom:'1px solid var(--border-subtle)', position:'sticky', top:0, zIndex:50, boxShadow:'var(--shadow-xs)' }} className="mobile-header">
          <button onClick={() => setSidebarOpen(true)}
            style={{ background:'var(--gray-100)', border:'none', borderRadius:'var(--radius-sm)', padding:'6px 8px', cursor:'pointer', color:'var(--text-primary)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <span style={{ fontFamily:'var(--font-display)', fontSize:'1.25rem', color:'var(--accent-primary)' }}>Forge</span>
          <div className="avatar" style={{ cursor:'pointer', width:30, height:30, fontSize:'0.7rem' }}
            onClick={() => { navigate('/profile'); setSidebarOpen(false); }}>{initials}</div>
        </div>
        <Outlet />
      </main>

      <style>{`@media(max-width:768px){.mobile-header{display:flex !important;}}`}</style>
    </div>
  );
}
