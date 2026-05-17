import React from 'react';

const Icon = ({ size = 20, color = 'currentColor', strokeWidth = 1.5, children, style, className }) => (
  <svg
    width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke={color} strokeWidth={strokeWidth}
    strokeLinecap="round" strokeLinejoin="round"
    style={style} className={className}
  >
    {children}
  </svg>
);

export const IconDashboard = (p) => <Icon {...p}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></Icon>;
export const IconDumbbell = (p) => <Icon {...p}><path d="M6 5v14"/><path d="M18 5v14"/><path d="M6 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h3"/><path d="M18 8h3a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-3"/><line x1="6" y1="12" x2="18" y2="12"/></Icon>;
export const IconClipboard = (p) => <Icon {...p}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="12" y2="16"/></Icon>;
export const IconNutrition = (p) => <Icon {...p}><path d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7z"/><circle cx="12" cy="9" r="2.5"/></Icon>;
export const IconUsers = (p) => <Icon {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></Icon>;
export const IconChart = (p) => <Icon {...p}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></Icon>;
export const IconRobot = (p) => <Icon {...p}><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="15" x2="8" y2="15" strokeWidth="2.5"/><line x1="12" y1="15" x2="12" y2="15" strokeWidth="2.5"/><line x1="16" y1="15" x2="16" y2="15" strokeWidth="2.5"/><path d="M6 11V9a6 6 0 0 1 12 0v2"/></Icon>;
export const IconBell = (p) => <Icon {...p}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></Icon>;
export const IconUser = (p) => <Icon {...p}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></Icon>;
export const IconLogout = (p) => <Icon {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></Icon>;
export const IconFire = (p) => <Icon {...p} fill={p.filled ? p.color || 'currentColor' : 'none'}><path d="M12 2c0 0-5 4-5 9a5 5 0 0 0 10 0c0-3-2-5-2-5s-1 3-3 3c0-2-0.5-4-0-7z"/></Icon>;
export const IconTarget = (p) => <Icon {...p}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></Icon>;
export const IconPlus = (p) => <Icon {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></Icon>;
export const IconX = (p) => <Icon {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></Icon>;
export const IconCheck = (p) => <Icon {...p}><polyline points="20 6 9 17 4 12"/></Icon>;
export const IconEdit = (p) => <Icon {...p}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></Icon>;
export const IconTrash = (p) => <Icon {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></Icon>;
export const IconSearch = (p) => <Icon {...p}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></Icon>;
export const IconStar = (p) => <Icon {...p} fill={p.filled ? '#f59e0b' : 'none'} stroke={p.filled ? '#f59e0b' : 'currentColor'}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></Icon>;
export const IconArrowRight = (p) => <Icon {...p}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></Icon>;
export const IconPhoto = (p) => <Icon {...p}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></Icon>;
export const IconWeight = (p) => <Icon {...p}><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></Icon>;
export const IconScale = (p) => <Icon {...p}><path d="M12 2v20"/><path d="M2 12h20"/><path d="M6 6l12 12"/><path d="M18 6L6 18"/></Icon>;
export const IconLightning = (p) => <Icon {...p}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></Icon>;
export const IconRun = (p) => <Icon {...p}><circle cx="13" cy="4" r="1.5"/><path d="M6 20l4-6 2 3 4-7"/><path d="M10 14l1-4 4 1 2-4"/></Icon>;
export const IconHeart = (p) => <Icon {...p} fill={p.filled ? '#ef4444' : 'none'} stroke={p.filled ? '#ef4444' : 'currentColor'}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></Icon>;
export const IconTrophy = (p) => <Icon {...p}><path d="M6 9H3V5h3"/><path d="M18 9h3V5h-3"/><path d="M6 5h12v7a6 6 0 0 1-12 0V5z"/><path d="M12 18v3"/><path d="M8 21h8"/></Icon>;
export const IconDroplet = (p) => <Icon {...p} fill={p.filled ? '#3b82f6' : 'none'} stroke={p.filled ? '#3b82f6' : 'currentColor'}><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></Icon>;
export const IconMoon = (p) => <Icon {...p}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></Icon>;
export const IconSun = (p) => <Icon {...p}><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></Icon>;
export const IconSettings = (p) => <Icon {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></Icon>;
export const IconUpload = (p) => <Icon {...p}><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></Icon>;
export const IconActivity = (p) => <Icon {...p}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></Icon>;
export const IconMeal = (p) => <Icon {...p}><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></Icon>;
export const IconVerified = (p) => <Icon {...p} fill="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill={p.filled ? '#10b981' : 'none'}/><polyline points="9 12 11 14 15 10" stroke="white" strokeWidth="2"/></Icon>;
export const IconInfo = (p) => <Icon {...p}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></Icon>;
export const IconCalendar = (p) => <Icon {...p}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></Icon>;
export const IconSend = (p) => <Icon {...p}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></Icon>;
export const IconBrain = (p) => <Icon {...p}><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.44-4.12z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.44-4.12z"/></Icon>;
export const IconChevronRight = (p) => <Icon {...p}><polyline points="9 18 15 12 9 6"/></Icon>;
export const IconChevronDown = (p) => <Icon {...p}><polyline points="6 9 12 15 18 9"/></Icon>;
export const IconMuscle = (p) => (
  <svg width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth={p.strokeWidth||1.5} strokeLinecap="round" strokeLinejoin="round" style={p.style}>
    <path d="M6.5 6.5c1-1 2.5-1.5 4-1 1 .4 2 1.2 2.5 2.5.5 1.3.3 2.8-.5 4L9 16c-.8 1.2-.5 2.8.5 3.5s2.5.5 3.5-.5l3-4c1-1.3 1.3-3 .5-4.5"/>
    <path d="M9 6c-.5-1.5.5-3 2-3.5s3 .5 3.5 2"/>
  </svg>
);

// Category icons map
export const CategoryIcon = ({ category, size = 20, color = 'currentColor' }) => {
  const props = { size, color };
  switch(category) {
    case 'chest': return <IconMuscle {...props}/>;
    case 'back': return <IconActivity {...props}/>;
    case 'legs': return <IconRun {...props}/>;
    case 'shoulders': return <IconTarget {...props}/>;
    case 'arms': return <IconMuscle {...props}/>;
    case 'core': return <IconLightning {...props}/>;
    case 'cardio': return <IconHeart {...props}/>;
    case 'flexibility': return <IconActivity {...props}/>;
    default: return <IconDumbbell {...props}/>;
  }
};

export const WorkoutTypeIcon = ({ type, size = 20, color = 'currentColor' }) => {
  const props = { size, color };
  switch(type) {
    case 'cardio': return <IconRun {...props}/>;
    case 'flexibility': return <IconActivity {...props}/>;
    case 'hiit': return <IconLightning {...props}/>;
    case 'sports': return <IconTarget {...props}/>;
    default: return <IconDumbbell {...props}/>;
  }
};
