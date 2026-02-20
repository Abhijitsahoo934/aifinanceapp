import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, ChevronRight, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // 1. Send authentication request to the FastAPI backend
      const res = await axios.post('http://127.0.0.1:8000/api/login', {
        email: formData.email.toLowerCase().trim(),
        password: formData.password
      });
      
      // 2. Persist session data with synchronized keys
      // We extract 'name' from email if the backend doesn't provide one
      const userName = res.data.name || res.data.email.split('@')[0];
      
      localStorage.setItem('token', res.data.token);
      
      // CRITICAL: This object structure must match what Dashboard.jsx reads
      localStorage.setItem('user', JSON.stringify({
        email: res.data.email.toLowerCase(),
        name: userName.charAt(0).toUpperCase() + userName.slice(1), // Capitalize first letter
        role: res.data.role || 'user',
        level: res.data.level || 'beginner'
      }));

      // 3. Clear legacy keys to prevent "Guest" fallback
      localStorage.removeItem('userPersona');

      // 4. Force a fresh navigation to Dashboard
      navigate('/dashboard');
      window.location.reload(); // Ensures the DashboardLayout reads the new localStorage immediately
      
    } catch (err) {
      console.error("Login Failure:", err);
      setError("⚠️ Access Denied: Invalid credentials or unauthorized identity.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // 302 Redirect Handshake for OAuth
    // Make sure your backend saves the 'user' object to localStorage on the redirect-back
    const apiUrl = 'http://localhost:8000';
    window.location.href = `${apiUrl}/api/auth/google/login`;
  };

  return (
    <div className="min-h-screen bg-[#060b13] flex items-center justify-center p-6 relative overflow-hidden font-inter">
      {/* --- Ambient Aura Lighting --- */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="glass-card p-8 md:p-10 rounded-[2.5rem] bg-[#0c121d]/50 border border-white/5 shadow-2xl backdrop-blur-3xl">
          
          {/* Identity Header */}
          <div className="text-center space-y-3 mb-12">
            <motion.div 
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 1, type: "spring" }}
              className="mx-auto w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.1)]"
            >
              <ShieldCheck className="text-emerald-500" size={32} />
            </motion.div>
            <h2 className="text-3xl font-black tracking-tight text-white uppercase italic">
              System <span className="text-emerald-500">Access</span>
            </h2>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Authorize Financial Persona</p>
          </div>

          {/* Authorization Form */}
          <form onSubmit={handleLogin} className="space-y-6">
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
                className="w-full bg-[#060b13] border border-white/5 rounded-2xl py-5 pl-14 pr-4 text-xs font-bold text-white placeholder:text-slate-700 focus:outline-none focus:border-emerald-500/30 transition-all shadow-inner"
                onChange={e => setFormData({...formData, email: e.target.value})} 
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-500 transition-colors" size={18} />
              <input 
                type="password" 
                placeholder="Security Phrase" 
                required 
                className="w-full bg-[#060b13] border border-white/5 rounded-2xl py-5 pl-14 pr-4 text-xs font-bold text-white placeholder:text-slate-700 focus:outline-none focus:border-emerald-500/30 transition-all shadow-inner"
                onChange={e => setFormData({...formData, password: e.target.value})} 
              />
            </div>

            <div className="text-right">
              <Link to="/forgot-password" size="sm" className="text-[10px] font-black text-slate-600 hover:text-emerald-500 uppercase tracking-widest transition-all">
                Recovery Protocol?
              </Link>
            </div>

            <motion.button 
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              disabled={loading}
              className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-[0_20px_40px_-10px_rgba(16,185,129,0.3)] border border-white/10 transition-all flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <>Authorize Session <ChevronRight size={18} /></>}
            </motion.button>
          </form>

          {/* Secure Handshake Divider */}
          <div className="relative flex items-center my-10">
            <div className="flex-grow border-t border-white/5"></div>
            <span className="flex-shrink mx-6 text-[9px] font-black text-slate-700 uppercase tracking-[0.4em]">External Node</span>
            <div className="flex-grow border-t border-white/5"></div>
          </div>

          {/* Google Intelligence Link */}
          <motion.button 
            whileHover={{ y: -2, scale: 1.01 }}
            onClick={handleGoogleLogin}
            className="w-full py-5 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all flex items-center justify-center gap-3 border border-white/20"
          >
            <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" width="18" alt="G" />
            Sync with Google
          </motion.button>

          <p className="text-center text-[10px] font-black text-slate-600 mt-12 uppercase tracking-[0.2em]">
            No authority credentials?{' '}
            <Link to="/signup" className="text-emerald-500 hover:text-emerald-400 transition-colors">
              Initialize Account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}