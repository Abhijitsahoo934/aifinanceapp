import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ShieldCheck, Eye, EyeOff, CheckCircle2, Loader2, Sparkles } from 'lucide-react';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setStatus('loading');
    
    try {
      // Sends the required email and new_password to match the FastAPI schema
      await axios.post('http://127.0.0.1:8000/api/reset-password', { 
        email: email.toLowerCase().trim(), 
        new_password: password 
      });
      
      setStatus('success');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  // Advanced password strength logic
  const strength = password.length > 8 ? 100 : (password.length / 8) * 100;

  return (
    <div className="min-h-screen bg-[#060b13] flex items-center justify-center p-6 relative overflow-hidden font-inter">
      {/* Background Lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="glass-card p-8 md:p-10 rounded-[2.5rem] border border-slate-800/60 shadow-2xl backdrop-blur-2xl">
          
          <AnimatePresence mode="wait">
            {status !== 'success' ? (
              <motion.div
                key="reset-form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {/* Header */}
                <div className="text-center space-y-3 mb-8">
                  <div className="mx-auto w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                    <ShieldCheck className="text-emerald-500" size={30} />
                  </div>
                  <h2 className="text-2xl font-black tracking-tight text-white uppercase italic">Secure <span className="text-emerald-500">Override</span></h2>
                  <p className="text-slate-500 text-sm font-medium">Initialize your new encrypted access key.</p>
                </div>

                <form onSubmit={handleReset} className="space-y-6">
                  
                  {/* Email Input */}
                  <div className="relative group">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
                    <input 
                      type="email" 
                      placeholder="Authority Email" 
                      required 
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 transition-all shadow-inner"
                      value={email}
                      onChange={e => setEmail(e.target.value)} 
                    />
                  </div>

                  {/* Password Input */}
                  <div className="space-y-3">
                    <div className="relative group">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
                      <input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="New Security Phrase" 
                        required 
                        className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-12 text-sm font-medium text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 transition-all shadow-inner"
                        value={password}
                        onChange={e => setPassword(e.target.value)} 
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-300 transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>

                    {/* Password Strength Meter */}
                    <div className="px-1 space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                        <span className="text-slate-600">Complexity Score</span>
                        <span className={strength === 100 ? "text-emerald-500" : "text-slate-500"}>
                          {strength === 100 ? "Secure" : "Analyzing..."}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${strength}%` }}
                          className={`h-full transition-colors duration-500 ${strength === 100 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-blue-500'}`}
                        />
                      </div>
                    </div>
                  </div>

                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={status === 'loading'}
                    type="submit" 
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 border border-white/10"
                  >
                    {status === 'loading' ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <>Update Access Key <Sparkles size={16} /></>
                    )}
                  </motion.button>
                </form>

                {status === 'error' && (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-6 text-center text-red-400 text-[10px] font-black uppercase tracking-widest bg-red-500/10 py-2 rounded-lg border border-red-500/20"
                  >
                    Invalid Authority Identity or Sync Failure
                  </motion.p>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="success-state"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6 space-y-6"
              >
                <div className="h-24 w-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                  <CheckCircle2 className="text-emerald-500" size={48} />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-white uppercase italic">Identity Verified</h2>
                  <p className="text-slate-400 text-sm font-medium">Your credentials have been successfully rotated. Redirecting to vault...</p>
                </div>
                <div className="flex justify-center pt-4">
                   <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ x: "-100%" }}
                        animate={{ x: "100%" }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="w-full h-full bg-emerald-500"
                      />
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}