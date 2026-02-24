import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Layouts - The structural framework for the dashboard
import DashboardLayout from './layouts/DashboardLayout';

// Pages - Authentication & Onboarding
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import GoogleCallback from './pages/GoogleCallback';
import Onboarding from './pages/Onboarding';

// Pages - Intelligence Core
import Dashboard from './pages/Dashboard';
import Market from './pages/Market';
import AIAdvisor from './pages/AIAdvisor';
import Goals from './pages/Goals';
import Profile from './pages/Profile';
import Analytics from './pages/Analytics';
import Planner from './pages/Planner';

// ==========================================
// 🚀 THE MAGIC FIX: SYNCHRONOUS INTERCEPTOR
// ==========================================
// This runs BEFORE React Router even checks the routes. 
// It catches the Google auth_token from the URL instantly.
const searchParams = new URLSearchParams(window.location.search);
const urlToken = searchParams.get('auth_token');

if (urlToken) {
  // 1. Save the token and user data to browser memory instantly
  localStorage.setItem('token', urlToken);
  localStorage.setItem('user', JSON.stringify({
    email: searchParams.get('email'),
    role: searchParams.get('role'),
    level: searchParams.get('level')
  }));
  
  // 2. Clean the URL so the token disappears from the address bar
  window.history.replaceState({}, document.title, window.location.pathname);
}
// ==========================================


/**
 * World-Class Security: ProtectedRoute
 * Intercepts unauthorized access and redirects to the login terminal.
 */
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  // If no token exists, we force the session back to the Authorization Node
  return token ? children : <Navigate to="/login" replace />;
};

export default function App() {
  const location = useLocation();

  return (
    <div className="bg-[#060b13] min-h-screen text-white selection:bg-emerald-500/30 selection:text-emerald-400 font-inter">
      <AnimatePresence mode="wait" initial={false}>
        {/* The location and key allow Framer Motion to detect route changes 
          and trigger the orchestrated 'Quantum' exit/entry animations.
        */}
        <Routes location={location} key={location.pathname}>
          
          {/* --- Public Authentication Flow --- */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Handles the secure redirect after Google OAuth. 
            Matches the redirect in backend/main.py: /auth-success 
          */}
          <Route path="/auth-success" element={<GoogleCallback />} />

          {/* --- Persona Calibration Step --- */}
          {/* Protected so random users cannot access the onboarding directly */}
          <Route 
            path="/onboarding" 
            element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            } 
          />

          {/* --- Secure Authority Ecosystem --- */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* Automatic redirection from root to System Overview */}
            <Route index element={<Navigate to="/dashboard" replace />} />
            
            {/* Core Dashboard Modules (No leading slashes for nested routes) */}
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="market" element={<Market />} />
            <Route path="ai-advisor" element={<AIAdvisor />} />
            <Route path="planner" element={<Planner />} />
            <Route path="goals" element={<Goals />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* --- Global Intelligence Fallback --- */}
          {/* Any unknown URL will redirect back to the safe dashboard route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}