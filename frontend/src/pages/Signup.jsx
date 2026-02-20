import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, Shield, Mail, Lock, ChevronRight, Loader2, Sparkles, AlertCircle } from 'lucide-react';

export default function Signup() {
  const [formData, setFormData] = useState({ 
    email: '', 
    password: '', 
    role: 'student', 
    level: 'beginner' 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const normalizedEmail = formData.email.toLowerCase().trim();

    try {
      // 1. Send registration request
      const res = await axios.post('http://127.0.0.1:8000/api/register', {
        ...formData,
        email: normalizedEmail
      });
      
      /**
       * 2. SYNCHRONIZED IDENTITY STORAGE
       * We save the user object immediately so the Dashboard doesn't show "Guest".
       * We derive the 'name' from the email prefix for the "Good Morning" greeting.
       */
      const namePrefix = normalizedEmail.split('@')[0];
      const authorityName = namePrefix.charAt(0).toUpperCase() + namePrefix.slice(1);

      localStorage.setItem('user', JSON.stringify({
        email: normalizedEmail,
        name: authorityName,
        role: formData.role,
        level: formData.level,
      }));

      // 3. Store Token separately for API Authorization headers
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
      }

      // 4. Clear legacy keys
      localStorage.removeItem('userPersona');

      // 5. Direct hand-off to Login or Dashboard
      // Usually, we go to Login to verify credentials, but we keep the 'user' 
      // object ready so the email field can be pre-filled or session-ready.
      navigate('/login');
      
    } catch (err) {
      console.error("Signup Failure:", err);
      setError(err.response?.data?.detail || "System Sync Error: Ensure backend is active.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    // OAuth 302 Redirect Handshake
    const apiUrl = 'http://localhost:8000';
    window.location.href = `${apiUrl}/api/auth/google/login`;
  };

  return (
    <div className="min-h-screen bg-[#060b13] flex items-center justify-center p-6 relative overflow-hidden font-inter">
      {/* Ambient Aura Lighting */}
      <div className="absolute top-[-15%] left-[-10%] w-[600px] h-[600px] bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="glass-card p-8 md:p-10 rounded-[3rem] bg-[#0c121d]/50 border border-white/5 shadow-2xl backdrop-blur-3xl">
          
          <div className="text-center space-y-4 mb-10">
            <motion.div 
              whileHover={{ rotate: 360, scale: 1.1 }}
              className="mx-auto w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 shadow-lg shadow-emerald-500/10"
            >
              <Shield className="text-emerald-500" size={32} />
            </motion.div>
            <div className="space-y-1">
              <h2 className="text-3xl font-black tracking-tighter text-white uppercase italic">
                FINANCE<span className="text-emerald-500">PRO</span>
              </h2>
              <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.3em]">Authority Node Initialization</p>
            </div>
          </div>

          <form onSubmit={handleSignup} className="space-y-6">
            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[10px] font-black uppercase">
                <AlertCircle size={14} /> {error}
              </motion.div>
            )}

            <div className="relative group">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-500 transition-colors" size={18} />
              <input 
                type="email" 
                placeholder="Authority Email" 
                required 
                className="w-full bg-[#060b13] border border-white/5 rounded-2xl py-5 pl-14 pr-4 text-xs font-bold text-white placeholder:text-slate-800 focus:outline-none focus:border-emerald-500/40 transition-all shadow-inner"
                onChange={e => setFormData({...formData, email: e.target.value})} 
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-500 transition-colors" size={18} />
              <input 
                type="password" 
                placeholder="Security Phrase" 
                required 
                className="w-full bg-[#060b13] border border-white/5 rounded-2xl py-5 pl-14 pr-4 text-xs font-bold text-white placeholder:text-slate-800 focus:outline-none focus:border-emerald-500/40 transition-all shadow-inner"
                onChange={e => setFormData({...formData, password: e.target.value})} 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest pl-2">Persona</label>
                <select 
                  onChange={e => setFormData({...formData, role: e.target.value})} 
                  className="w-full bg-[#060b13] border border-white/5 rounded-xl py-4 px-4 text-[11px] font-bold text-white outline-none focus:border-emerald-500/30 transition-all cursor-pointer"
                >
                  <option value="student">Student</option>
                  <option value="professional">Professional</option>
                  <option value="business">Entrepreneur</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest pl-2">Tier</label>
                <select 
                  onChange={e => setFormData({...formData, level: e.target.value})} 
                  className="w-full bg-[#060b13] border border-white/5 rounded-xl py-4 px-4 text-[11px] font-bold text-white outline-none focus:border-emerald-500/30 transition-all cursor-pointer"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="pro">Pro Investor</option>
                </select>
              </div>
            </div>

            <motion.button 
              whileHover={{ scale: 1.01, y: -2 }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              disabled={loading}
              className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-[0_20px_40px_-10px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-3 border border-white/10"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <>Initialize Node <Sparkles size={16} /></>}
            </motion.button>
          </form>

          <div className="relative flex items-center my-10">
            <div className="flex-grow border-t border-white/5"></div>
            <span className="flex-shrink mx-6 text-[9px] font-black text-slate-700 uppercase tracking-[0.4em]">External Node</span>
            <div className="flex-grow border-t border-white/5"></div>
          </div>

          <motion.button 
            whileHover={{ y: -2, scale: 1.01 }}
            onClick={handleGoogleSignup}
            className="w-full py-5 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all flex items-center justify-center gap-3 border border-white/20"
          >
            <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" width="18" alt="G" />
            Integrate with Google
          </motion.button>

          <p className="text-center text-[10px] font-black text-slate-600 mt-12 uppercase tracking-[0.2em]">
            Already verified?{' '}
            <Link to="/login" className="text-emerald-500 hover:text-emerald-400 transition-colors">
              Enter Authority Terminal
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}