import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, KeyRound, Loader2, AlertCircle, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      await axios.post('http://127.0.0.1:8000/api/forgot-password', { 
        email: email.toLowerCase().trim() 
      });
      
      setStatus({ 
        type: 'success', 
        message: 'Recovery sequence initiated. Check your secure inbox for the authorization link.' 
      });
    } catch (err) {
      setStatus({ 
        type: 'error', 
        message: err.response?.data?.detail || 'Handshake failed. Verify Authority Email.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060b13] flex items-center justify-center p-6 relative overflow-hidden font-inter">
      {/* --- Ambient Aura Lighting --- */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-amber-500/10 blur-[100px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="glass-card p-8 md:p-10 rounded-[2.5rem] bg-[#0c121d]/50 border border-white/5 shadow-2xl backdrop-blur-3xl">
          
          {/* Header */}
          <div className="text-center space-y-3 mb-10">
            <motion.div 
              whileHover={{ rotate: 15, scale: 1.1 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="mx-auto w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.1)]"
            >
              <KeyRound className="text-emerald-500" size={32} />
            </motion.div>
            <h2 className="text-3xl font-black tracking-tight text-white uppercase italic">
              Recovery <span className="text-emerald-500">Protocol</span>
            </h2>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">
              Restore Authority Access
            </p>
          </div>

          <AnimatePresence mode="wait">
            {status.type === 'success' ? (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center space-y-6"
              >
                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                  <CheckCircle2 className="text-emerald-500" size={32} />
                </div>
                <p className="text-sm font-medium text-slate-300 leading-relaxed">
                  {status.message}
                </p>

                {/* --- DEVELOPER BYPASS BUTTONS --- */}
                <div className="w-full space-y-3 mt-4">
                  <Link to="/reset-password?token=dev-bypass" className="block w-full">
                    <button className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-[0_10px_20px_rgba(16,185,129,0.2)] transition-all flex items-center justify-center gap-2 border border-white/10">
                      [DEV] Bypass To Reset <ArrowRight size={14} />
                    </button>
                  </Link>

                  <Link to="/login" className="block w-full">
                    <button className="w-full py-4 bg-transparent text-slate-500 hover:text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all flex items-center justify-center border border-slate-800 hover:border-slate-600">
                      Return to Terminal
                    </button>
                  </Link>
                </div>
              </motion.div>
            ) : (
              <motion.form 
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handleSubmit} 
                className="space-y-6"
              >
                {status.type === 'error' && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[10px] font-black uppercase">
                    <AlertCircle size={14} /> {status.message}
                  </motion.div>
                )}

                <div className="space-y-2">
                  <p className="text-slate-500 text-[11px] font-bold">
                    Enter your registered email address to receive a secure reset transmission.
                  </p>
                  <div className="relative group mt-2">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-500 transition-colors" size={18} />
                    <input 
                      type="email" 
                      placeholder="Authority Email" 
                      required 
                      className="w-full bg-[#060b13] border border-white/5 rounded-2xl py-5 pl-14 pr-4 text-xs font-bold text-white placeholder:text-slate-700 focus:outline-none focus:border-emerald-500/30 transition-all shadow-inner"
                      value={email}
                      onChange={e => setEmail(e.target.value)} 
                    />
                  </div>
                </div>

                <motion.button 
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit" 
                  disabled={loading || !email.trim()}
                  className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-[0_20px_40px_-10px_rgba(16,185,129,0.3)] disabled:shadow-none border border-white/10 transition-all flex items-center justify-center gap-3"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : 'Initiate Recovery'}
                </motion.button>

                <div className="text-center pt-4 border-t border-white/5 mt-8">
                  <Link to="/login" className="inline-flex items-center gap-2 text-[10px] font-black text-slate-500 hover:text-emerald-500 uppercase tracking-widest transition-all">
                    <ArrowLeft size={14} /> Cancel Protocol
                  </Link>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

        </div>
      </motion.div>
    </div>
  );
}