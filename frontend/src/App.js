import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './components/AppLayout';

import Landing from './pages/Landing';
import { Login, Register } from './pages/Login';
import Dashboard from './pages/Dashboard';
import Exercises from './pages/Exercises';
import WorkoutPlanner from './pages/WorkoutPlanner';
import NutritionPlanner from './pages/NutritionPlanner';
import Trainers from './pages/Trainers';
import Progress from './pages/Progress';
import AICoach from './pages/AICoach';
import Profile from './pages/Profile';
import Reminders from './pages/Reminders';
import AdminPanel from './pages/AdminPanel';
import MyBookings from './pages/MyBookings';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="loading-screen">
      <div className="spinner" />
      <p style={{ color:'var(--gray-400)', fontSize:'0.83rem' }}>Loading Forge Fitness...</p>
    </div>
  );
  return user ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" /> : children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/"         element={<PublicRoute><Landing /></PublicRoute>} />
      <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
        <Route path="dashboard"       element={<Dashboard />} />
        <Route path="exercises"       element={<Exercises />} />
        <Route path="workout-planner" element={<WorkoutPlanner />} />
        <Route path="nutrition"       element={<NutritionPlanner />} />
        <Route path="trainers"        element={<Trainers />} />
        <Route path="progress"        element={<Progress />} />
        <Route path="ai-coach"        element={<AICoach />} />
        <Route path="reminders"       element={<Reminders />} />
        <Route path="profile"         element={<Profile />} />
        <Route path="admin"           element={<AdminPanel />} />
        <Route path="my-bookings"     element={<MyBookings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster position="top-right" toastOptions={{
          duration: 3500,
          style: { background:'var(--gray-0)', color:'var(--gray-900)', border:'1px solid var(--gray-200)', borderRadius:12, fontSize:'0.83rem', fontFamily:'var(--font-body)', boxShadow:'var(--shadow-md)' },
          success: { iconTheme: { primary:'#16a34a', secondary:'white' } },
          error:   { iconTheme: { primary:'#dc2626', secondary:'white' } }
        }} />
      </BrowserRouter>
    </AuthProvider>
  );
}
