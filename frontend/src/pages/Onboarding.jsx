import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Added Axios for backend sync
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Briefcase, 
  TrendingUp, 
  GraduationCap, 
  ChevronRight, 
  Sparkles,
  ShieldCheck,
  Zap
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.2, delayChildren: 0.3 } 
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
};

const PersonaCard = ({ id, active, onClick, icon: Icon, title, desc }) => (
  <motion.div
    whileHover={{ y: -5, scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={() => onClick(id)}
    className={`relative cursor-pointer p-6 rounded-[2rem] border transition-all duration-300 ${
      active 
      ? 'bg-emerald-500/10 border-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.15)]' 
      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
    }`}
  >
    <div className={`p-3 rounded-xl mb-4 inline-block ${active ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
      <Icon size={24} />
    </div>
    <h3 className={`font-bold text-lg mb-1 ${active ? 'text-white' : 'text-slate-300'}`}>{title}</h3>
    <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
    {active && (
      <motion.div layoutId="check" className="absolute top-4 right-4 text-emerald-500">
        <ShieldCheck size={20} />
      </motion.div>
    )}
  </motion.div>
);

export default function Onboarding() {
  const [role, setRole] = useState('student');
  const [level, setLevel] = useState('beginner');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleStart = async () => {
    setLoading(true);
    
    // 1. Retrieve current user identity from storage
    const authUser = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');

    try {
      // 2. Synchronize Persona with PostgreSQL Backend
      if (authUser.email) {
        await axios.post('http://localhost:8000/api/user/update-persona', {
          email: authUser.email,
          role: role,
          level: level
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      // 3. Update Local Storage for immediate UI sync
      const updatedUser = { ...authUser, role, level };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      localStorage.setItem('userPersona', JSON.stringify({ role, level }));

      // 4. Simulating "Neural Calibration" for premium UX feel
      await new Promise(resolve => setTimeout(resolve, 1500));
      navigate('/dashboard');

    } catch (err) {
      console.error("Persona Database Sync Failed:", err);
      // Fallback: update local storage only so the user isn't blocked from the app
      const updatedUser = { ...authUser, role, level };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      localStorage.setItem('userPersona', JSON.stringify({ role, level }));
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060b13] text-white flex items-center justify-center p-6 relative overflow-hidden font-inter">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full" />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-5xl w-full relative z-10"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center space-y-4 mb-12">
          <div className="flex items-center justify-center gap-2 text-emerald-500 font-bold text-[10px] uppercase tracking-[0.4em]">
            <Sparkles size={14} /> Initializing Persona
          </div>
          <h1 className="text-5xl font-black tracking-tighter">
            Configure Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">Wealth Logic</span>
          </h1>
          <p className="text-slate-500 font-medium max-w-lg mx-auto leading-relaxed">
            Our Llama 3.2 engine customizes its advice based on your current professional standing and market experience.
          </p>
        </motion.div>

        <div className="space-y-12">
          {/* Role Selection */}
          <motion.div variants={itemVariants} className="space-y-6">
            <h2 className="text-center text-[10px] font-black text-slate-600 uppercase tracking-widest px-2">I am a</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <PersonaCard 
                id="student" active={role === 'student'} onClick={setRole} icon={GraduationCap}
                title="Student" desc="Focusing on savings, budgeting, and early-stage investments."
              />
              <PersonaCard 
                id="professional" active={role === 'professional'} onClick={setRole} icon={Briefcase}
                title="Professional" desc="Managing salary, tax optimization, and long-term portfolio growth."
              />
              <PersonaCard 
                id="business" active={role === 'business'} onClick={setRole} icon={TrendingUp}
                title="Business" desc="Scaling capital, cash flow management, and strategic reinvestment."
              />
            </div>
          </motion.div>

          {/* Experience Level */}
          <motion.div variants={itemVariants} className="space-y-6">
            <h2 className="text-center text-[10px] font-black text-slate-600 uppercase tracking-widest px-2">Experience Level</h2>
            <div className="flex flex-wrap justify-center gap-4">
              {['beginner', 'intermediate', 'pro'].map((l) => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  className={`px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
                    level === l 
                    ? 'bg-white text-slate-900 shadow-xl scale-105' 
                    : 'bg-slate-900/50 text-slate-500 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {l === 'pro' ? 'Financial Expert' : l}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Action Button */}
          <motion.div variants={itemVariants} className="flex justify-center pt-6">
            <motion.button
              whileHover={{ scale: 1.05, gap: '20px' }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStart}
              disabled={loading}
              className="relative group bg-emerald-600 hover:bg-emerald-500 text-white px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-emerald-500/20 flex items-center gap-3 transition-all"
            >
              {loading ? (
                <>
                  <Zap className="animate-spin" size={18} /> Calibrating System...
                </>
              ) : (
                <>
                  Generate My Ecosystem <ChevronRight size={18} />
                </>
              )}
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}