import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Shield, Save, CheckCircle, Mail, 
  Cpu, ChevronDown, Lock 
} from 'lucide-react';

export default function Profile() {
  // FIX: Sync with the 'user' key used by DashboardLayout and AI Advisor
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  const [profile, setProfile] = useState({
    role: user.role || 'Student',
    level: user.level || 'Beginner'
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // 1. Prepare updated object
    const updatedUser = { 
      ...user, 
      role: profile.role, 
      level: profile.level 
    };

    // 2. Persist to LocalStorage for the Frontend
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    // 3. (Optional) You can add an axios.put here to update your Postgres DB
    // axios.put(`/api/users/profile`, { email: user.email, ...profile });

    setSaved(true);
    
    // Calibration Feedback
    setTimeout(() => {
      setSaved(false);
      // We reload to ensure DashboardLayout refreshes the sidebar "Authority Level"
      window.location.reload(); 
    }, 1500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto space-y-12 pb-24 px-6"
    >
      {/* Authority Header */}
      <div className="flex flex-col md:flex-row items-center gap-8 border-b border-slate-800/40 pb-12">
        <div className="relative group">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-4 bg-gradient-to-tr from-emerald-500/20 via-blue-500/10 to-transparent rounded-full blur-2xl opacity-50"
          />
          <div className="relative h-28 w-28 bg-[#060b13] rounded-[2.5rem] border border-slate-800 flex items-center justify-center shadow-2xl group-hover:border-emerald-500/50 transition-all duration-500">
            <User className="text-emerald-500" size={44} />
          </div>
        </div>
        <div className="text-center md:text-left space-y-2">
          <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic">
            Persona <span className="text-emerald-500">Settings</span>
          </h2>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.4em]">
            System Calibration Protocol 8.2
          </p>
        </div>
      </div>

      <div className="grid gap-8">
        {/* Identity Core Card */}
        <div className="glass-card p-10 rounded-[3rem] bg-[#0c121d]/50 border border-white/5 relative overflow-hidden group">
          <div className="relative z-10 space-y-10">
            <div className="flex items-center gap-3">
              <Lock className="text-slate-600" size={14} />
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Encrypted User Metadata</p>
            </div>

            {/* Email Display (Read Only) */}
            <div className="p-6 bg-[#060b13] rounded-3xl border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                  <Mail size={20} className="text-emerald-500" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Active Email Path</p>
                  <p className="text-base font-bold text-slate-200">{user.email || 'GUEST_USER'}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Role Select */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] ml-2">Authority Role</label>
                <div className="relative">
                  <select 
                    value={profile.role}
                    onChange={(e) => setProfile({...profile, role: e.target.value})}
                    className="w-full bg-[#060b13] border border-white/5 p-5 rounded-2xl text-[13px] font-bold text-white appearance-none focus:outline-none focus:border-emerald-500/40 transition-all cursor-pointer"
                  >
                    <option value="Student">Student Persona</option>
                    <option value="Freelancer">Independent Freelancer</option>
                    <option value="Professional">Working Professional</option>
                    <option value="Entrepreneur">Venture Entrepreneur</option>
                  </select>
                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-700 pointer-events-none" size={18} />
                </div>
              </div>

              {/* Level Select */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] ml-2">Knowledge Tier</label>
                <div className="relative">
                  <select 
                    value={profile.level}
                    onChange={(e) => setProfile({...profile, level: e.target.value})}
                    className="w-full bg-[#060b13] border border-white/5 p-5 rounded-2xl text-[13px] font-bold text-white appearance-none focus:outline-none focus:border-emerald-500/40 transition-all cursor-pointer"
                  >
                    <option value="Beginner">Tier 01: Beginner</option>
                    <option value="Intermediate">Tier 02: Intermediate</option>
                    <option value="Advanced">Tier 03: Expert</option>
                  </select>
                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-700 pointer-events-none" size={18} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sync CTA */}
        <div className="pt-4">
          <AnimatePresence mode="wait">
            {!saved ? (
              <motion.button 
                key="save-btn"
                whileHover={{ scale: 1.01, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-6 rounded-3xl font-black text-xs uppercase tracking-[0.4em] flex items-center justify-center gap-3 transition-all shadow-[0_20px_40px_-10px_rgba(16,185,129,0.3)] border border-white/10"
              >
                <Save size={20} /> Update Authority Persona
              </motion.button>
            ) : (
              <motion.div 
                key="success-btn"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full bg-slate-900 text-emerald-400 py-6 rounded-3xl font-black text-xs uppercase tracking-[0.4em] flex items-center justify-center gap-3 border border-emerald-500/30"
              >
                <CheckCircle size={20} className="animate-bounce" /> Persona Calibrated
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}